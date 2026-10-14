-- =============================================================================
-- Migration 005: reliable reminders, notification delivery, and Realtime
-- =============================================================================

ALTER TABLE public.firms
  ADD COLUMN IF NOT EXISTS default_remind_days_before INT NOT NULL DEFAULT 10
    CHECK (default_remind_days_before BETWEEN 1 AND 30);

ALTER TABLE public.notification_preferences
  ALTER COLUMN remind_days_before DROP NOT NULL,
  ALTER COLUMN remind_days_before DROP DEFAULT;

ALTER TABLE public.notification_preferences
  DROP CONSTRAINT IF EXISTS notification_preferences_remind_days_before_check;

ALTER TABLE public.notification_preferences
  ADD CONSTRAINT notification_preferences_remind_days_before_check
    CHECK (remind_days_before IS NULL OR remind_days_before BETWEEN 1 AND 30);

ALTER TABLE public.reminders
  DROP COLUMN IF EXISTS days_left,
  ADD COLUMN IF NOT EXISTS next_date DATE;

UPDATE public.reminders r
SET next_date = h.next_date
FROM public.hearings h
WHERE h.id = r.hearing_id
  AND r.next_date IS NULL;

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT,
  ADD COLUMN IF NOT EXISTS push_dispatched_at TIMESTAMPTZ;

COMMENT ON TABLE public.vapid_keys IS
  'Legacy VAPID storage table; the application uses Supabase Edge Function secrets instead.';
COMMENT ON COLUMN public.vapid_keys.private_key IS
  'Do not store raw private keys here. Configure VAPID_PRIVATE_KEY as an Edge Function secret.';

-- The earlier per-hearing trigger sent reminders to every firm member and
-- could recreate a reminder immediately after a user marked it done.
DROP TRIGGER IF EXISTS trg_auto_reminders ON public.hearings;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedupe_key
  ON public.notifications (dedupe_key)
  WHERE dedupe_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reminders_user_status_date
  ON public.reminders (user_id, status, next_date);

-- Existing preference rows should inherit their firm's default until the user
-- explicitly chooses a personal reminder window.
UPDATE public.notification_preferences
SET remind_days_before = NULL;

CREATE OR REPLACE FUNCTION public.generate_reminders(p_firm_id UUID DEFAULT NULL)
RETURNS TABLE (
  processed_cases INT,
  created_reminders INT,
  closed_reminders INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Karachi')::DATE;
  v_case RECORD;
  v_user RECORD;
  v_reminder_id UUID;
  v_days_left INT;
  v_days_before INT;
  v_urgency reminder_urgency;
  v_created INT := 0;
  v_closed INT := 0;
  v_processed INT := 0;
  v_inserted INT;
  v_was_new BOOLEAN;
BEGIN
  -- A reminder belongs to the current latest hearing only. Replacing a
  -- hearing's next date or adding a later hearing retires the previous row.
  UPDATE public.reminders r
  SET status = 'dismissed', acted_at = NOW()
  WHERE r.status = 'upcoming'
    AND (p_firm_id IS NULL OR r.firm_id = p_firm_id)
    AND (
      r.next_date IS DISTINCT FROM (
        SELECT h.next_date
        FROM public.hearings h
        WHERE h.id = r.hearing_id
      )
      OR r.next_date IS NULL
      OR r.next_date < v_today
      OR r.next_date > v_today + COALESCE(
        (
          SELECT np.remind_days_before
          FROM public.notification_preferences np
          WHERE np.user_id = r.user_id
        ),
        (
          SELECT f.default_remind_days_before
          FROM public.firms f
          WHERE f.id = r.firm_id
        ),
        10
      )
      OR NOT EXISTS (
        SELECT 1
        FROM public.cases c
        WHERE c.id = r.case_id
          AND c.status = 'running'
          AND c.deleted_at IS NULL
          AND c.firm_id = r.firm_id
      )
      OR NOT EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = r.user_id
          AND p.is_active = TRUE
          AND p.role IN ('super_admin', 'admin', 'lawyer')
      )
      OR NOT EXISTS (
        SELECT 1
        FROM public.hearings latest
        WHERE latest.id = r.hearing_id
          AND latest.case_id = r.case_id
          AND latest.id = (
            SELECT h2.id
            FROM public.hearings h2
            WHERE h2.case_id = r.case_id
            ORDER BY h2.hearing_date DESC, h2.created_at DESC, h2.id DESC
            LIMIT 1
          )
      )
    );
  GET DIAGNOSTICS v_closed = ROW_COUNT;

  FOR v_case IN
    SELECT c.id AS case_id,
           c.firm_id,
           c.case_ref_no,
           c.plaintiff_name,
           c.defendant_name,
           c.representing,
           h.id AS hearing_id,
           h.next_date,
           COALESCE(h.court_no, c.court_no) AS court_no
    FROM public.cases c
    JOIN LATERAL (
      SELECT h1.id, h1.next_date, h1.court_no
      FROM public.hearings h1
      WHERE h1.case_id = c.id
      ORDER BY h1.hearing_date DESC, h1.created_at DESC, h1.id DESC
      LIMIT 1
    ) h ON TRUE
    WHERE c.status = 'running'
      AND c.deleted_at IS NULL
      AND h.next_date BETWEEN v_today AND v_today + 30
      AND (p_firm_id IS NULL OR c.firm_id = p_firm_id)
  LOOP
    v_processed := v_processed + 1;
    v_days_left := v_case.next_date - v_today;

    FOR v_user IN
      SELECT p.id AS user_id,
             COALESCE(np.remind_days_before, f.default_remind_days_before, 10)
               AS days_before,
             COALESCE(np.notify_reminders, TRUE) AS notify_reminders
      FROM public.profiles p
      JOIN public.firms f ON f.id = p.firm_id
      LEFT JOIN public.notification_preferences np ON np.user_id = p.id
      WHERE p.firm_id = v_case.firm_id
        AND p.is_active = TRUE
        AND p.role IN ('super_admin', 'admin', 'lawyer')
    LOOP
      v_days_before := v_user.days_before;
      CONTINUE WHEN v_days_left > v_days_before;

      v_urgency := CASE
        WHEN v_days_left = 0 THEN 'critical'
        WHEN v_days_left <= 3 THEN 'high'
        WHEN v_days_left <= 7 THEN 'medium'
        ELSE 'low'
      END;

      SELECT NOT EXISTS (
        SELECT 1
        FROM public.reminders existing
        WHERE existing.hearing_id = v_case.hearing_id
          AND existing.user_id = v_user.user_id
      ) INTO v_was_new;

      v_reminder_id := NULL;
      INSERT INTO public.reminders AS existing_reminder
        (firm_id, case_id, hearing_id, user_id, remind_date, next_date, status, urgency, acted_at)
      VALUES
        (v_case.firm_id, v_case.case_id, v_case.hearing_id, v_user.user_id,
         v_case.next_date - v_days_before, v_case.next_date, 'upcoming', v_urgency, NULL)
      ON CONFLICT (hearing_id, user_id) DO UPDATE
        SET remind_date = EXCLUDED.remind_date,
            next_date = EXCLUDED.next_date,
            urgency = EXCLUDED.urgency,
            status = CASE
              WHEN existing_reminder.next_date IS DISTINCT FROM EXCLUDED.next_date
                THEN 'upcoming'::reminder_status
              ELSE existing_reminder.status
            END,
            acted_at = CASE
              WHEN existing_reminder.next_date IS DISTINCT FROM EXCLUDED.next_date
                THEN NULL
              ELSE existing_reminder.acted_at
            END
      RETURNING id INTO v_reminder_id;
      GET DIAGNOSTICS v_inserted = ROW_COUNT;
      IF v_was_new AND v_inserted > 0 THEN
        v_created := v_created + 1;
      END IF;

      IF v_user.notify_reminders AND EXISTS (
        SELECT 1
        FROM public.reminders active_reminder
        WHERE active_reminder.id = v_reminder_id
          AND active_reminder.status = 'upcoming'
      ) THEN
        INSERT INTO public.notifications
          (firm_id, user_id, title, body, type, ref_type, ref_id, dedupe_key)
        VALUES (
          v_case.firm_id,
          v_user.user_id,
          CASE
            WHEN v_days_left = 0 THEN 'Hearing today — ' || v_case.case_ref_no
            WHEN v_days_left = 1 THEN 'Hearing tomorrow — ' || v_case.case_ref_no
            WHEN v_days_left <= 3 THEN 'Hearing in ' || v_days_left || ' days — ' || v_case.case_ref_no
            ELSE 'Upcoming hearing — ' || v_case.case_ref_no
          END,
          v_case.plaintiff_name || ' vs ' || v_case.defendant_name ||
            ' · ' || TO_CHAR(v_case.next_date, 'DD Mon YYYY') ||
            COALESCE(' · ' || v_case.court_no, ''),
          'reminder',
          'case',
          v_case.case_id,
          'reminder:' || v_reminder_id::TEXT || ':' || v_today::TEXT
        )
        ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
        UPDATE public.reminders
        SET last_notified_at = NOW()
        WHERE id = v_reminder_id;
      END IF;
    END LOOP;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_created, v_closed;
END;
$$;

CREATE OR REPLACE FUNCTION public.send_daily_summary()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Karachi')::DATE;
  v_firm RECORD;
  v_user RECORD;
  v_count INT;
BEGIN
  FOR v_firm IN
    SELECT f.id
    FROM public.firms f
    WHERE f.subscription_status IN ('active', 'trial')
  LOOP
    SELECT COUNT(*) INTO v_count
    FROM public.hearings h
    JOIN public.cases c ON c.id = h.case_id
    WHERE h.hearing_date = v_today
      AND c.firm_id = v_firm.id
      AND c.status = 'running'
      AND c.deleted_at IS NULL;

    CONTINUE WHEN v_count = 0;

    FOR v_user IN
      SELECT p.id AS user_id
      FROM public.profiles p
      LEFT JOIN public.notification_preferences np ON np.user_id = p.id
      WHERE p.firm_id = v_firm.id
        AND p.is_active = TRUE
        AND COALESCE(np.notify_daily_summary, TRUE) = TRUE
    LOOP
      INSERT INTO public.notifications
        (firm_id, user_id, title, body, type, dedupe_key)
      VALUES (
        v_firm.id,
        v_user.user_id,
        'Today''s cause list',
        'You have ' || v_count || ' hearing' || CASE WHEN v_count = 1 THEN '' ELSE 's' END || ' today.',
        'daily_summary',
        'daily-summary:' || v_user.user_id::TEXT || ':' || v_today::TEXT
      )
      ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_firm_reminder_default(p_days INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'Only firm admins can change the reminder default.';
  END IF;
  IF p_days IS NULL OR p_days < 1 OR p_days > 30 THEN
    RAISE EXCEPTION 'Reminder default must be between 1 and 30 days.';
  END IF;

  UPDATE public.firms
  SET default_remind_days_before = p_days
  WHERE id = public.current_firm_id();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No firm is associated with the current user.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_reminders(UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.send_daily_summary() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_firm_reminder_default(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_reminders(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.send_daily_summary() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_firm_reminder_default(INT) TO authenticated;

-- Keep cron jobs idempotent when this migration is applied to a database where
-- the earlier phase migration already scheduled them.
DO $$
DECLARE v_job RECORD;
BEGIN
  FOR v_job IN
    SELECT jobid
    FROM cron.job
    WHERE jobname IN ('generate-reminders-daily', 'daily-summary-morning')
  LOOP
    PERFORM cron.unschedule(v_job.jobid);
  END LOOP;
END;
$$;

SELECT cron.schedule(
  'generate-reminders-daily',
  '0 1 * * *',
  $$SELECT public.generate_reminders()$$
);

SELECT cron.schedule(
  'daily-summary-morning',
  '0 1 * * *',
  $$SELECT public.send_daily_summary()$$
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'reminders'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;
    END IF;
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'notifications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
  END IF;
END;
$$;
