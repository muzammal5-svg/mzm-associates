-- =============================================================================
-- Migration 004: generate_reminders(), pg_cron, notification_preferences,
--                urgency tiers, VAPID key storage
-- =============================================================================

-- ─── Urgency enum ─────────────────────────────────────────────────────────────
CREATE TYPE reminder_urgency AS ENUM ('low', 'medium', 'high', 'critical');

-- Add urgency and notification delivery metadata to reminders.
-- days_left is calculated from the hearing date by the application; a
-- generated column cannot depend on CURRENT_DATE because it is not immutable.
ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS urgency      reminder_urgency NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS days_left    INT,
  ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMPTZ;

-- ─── Notification Preferences ─────────────────────────────────────────────────
CREATE TABLE public.notification_preferences (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  firm_id             UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  remind_days_before  INT         NOT NULL DEFAULT 10
                                  CHECK (remind_days_before BETWEEN 1 AND 30),
  notify_reminders    BOOLEAN     NOT NULL DEFAULT TRUE,
  notify_daily_summary BOOLEAN    NOT NULL DEFAULT TRUE,
  notify_case_updates BOOLEAN     NOT NULL DEFAULT TRUE,
  notify_system       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notif_prefs_user ON public.notification_preferences (user_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own prefs"
  ON public.notification_preferences FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin read firm prefs"
  ON public.notification_preferences FOR SELECT
  USING (firm_id = public.current_firm_id() AND public.is_admin_or_above());

CREATE TRIGGER trg_notif_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notif_prefs()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id, firm_id)
  VALUES (NEW.id, NEW.firm_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_default_notif_prefs
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_notif_prefs();

-- ─── VAPID Keys (firm-level Web Push) ─────────────────────────────────────────
CREATE TABLE public.vapid_keys (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id      UUID        NOT NULL UNIQUE REFERENCES public.firms(id) ON DELETE CASCADE,
  public_key   TEXT        NOT NULL,
  private_key  TEXT        NOT NULL,  -- stored encrypted; only accessed by Edge Functions
  subject      TEXT        NOT NULL DEFAULT 'mailto:admin@mzm.pk',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only Edge Functions (service role) access this table — no RLS for anon/user
ALTER TABLE public.vapid_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no client access" ON public.vapid_keys USING (FALSE);

-- ─── Web Push Subscriptions ───────────────────────────────────────────────────
CREATE TABLE public.push_subscriptions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint     TEXT        NOT NULL UNIQUE,
  p256dh       TEXT        NOT NULL,  -- public key
  auth_key     TEXT        NOT NULL,  -- auth secret
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_push_subs_user ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own push subs"
  ON public.push_subscriptions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── generate_reminders() ─────────────────────────────────────────────────────
-- Idempotent: safe to call multiple times per day.
-- Creates/updates reminders for all running cases where next_date is within
-- remind_days_before days. Closes reminders for decided cases.
-- Sets urgency tier based on days remaining.

CREATE OR REPLACE FUNCTION public.generate_reminders(
  p_firm_id UUID DEFAULT NULL   -- NULL = process all firms
)
RETURNS TABLE(
  processed_cases INT,
  created_reminders INT,
  closed_reminders INT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_case        RECORD;
  v_hearing     RECORD;
  v_user        RECORD;
  v_created     INT := 0;
  v_closed      INT := 0;
  v_processed   INT := 0;
  v_days_left   INT;
  v_urgency     reminder_urgency;
  v_remind_days INT;
BEGIN
  -- 1. Close reminders for decided/soft-deleted cases
  UPDATE public.reminders r
    SET status   = 'dismissed',
        acted_at = NOW()
  FROM public.cases c
  WHERE r.case_id     = c.id
    AND r.status      = 'upcoming'
    AND (c.status     = 'decided' OR c.deleted_at IS NOT NULL)
    AND (p_firm_id IS NULL OR r.firm_id = p_firm_id);
  GET DIAGNOSTICS v_closed = ROW_COUNT;

  -- 2. For each running case, find the latest hearing with a future next_date
  FOR v_case IN
    SELECT DISTINCT ON (c.id)
           c.id            AS case_id,
           c.firm_id,
           c.case_ref_no,
           c.plaintiff_name,
           c.defendant_name,
           h.id            AS hearing_id,
           h.next_date
    FROM public.cases    c
    JOIN public.hearings h ON h.case_id = c.id
    WHERE c.status       = 'running'
      AND c.deleted_at   IS NULL
      AND h.next_date    IS NOT NULL
      AND h.next_date    >= CURRENT_DATE
      AND (p_firm_id IS NULL OR c.firm_id = p_firm_id)
    ORDER BY c.id, h.hearing_date DESC
  LOOP
    v_processed := v_processed + 1;

    -- Per-user remind_days_before preference (fall back to firm default 10)
    FOR v_user IN
      SELECT p.id AS user_id,
             COALESCE(np.remind_days_before, 10)        AS remind_days,
             COALESCE(np.notify_reminders, TRUE)        AS notify_reminders
      FROM   public.profiles p
      LEFT   JOIN public.notification_preferences np ON np.user_id = p.id
      WHERE  p.firm_id   = v_case.firm_id
        AND  p.is_active = TRUE
        AND  p.role      IN ('admin', 'lawyer', 'super_admin')
    LOOP
      CONTINUE WHEN NOT v_user.notify_reminders;

      v_days_left   := v_case.next_date - CURRENT_DATE;
      v_remind_days := v_user.remind_days;

      -- Only generate if within the remind window
      CONTINUE WHEN v_days_left > v_remind_days;

      -- Urgency tiers
      v_urgency := CASE
        WHEN v_days_left = 0             THEN 'critical'
        WHEN v_days_left <= 3            THEN 'high'
        WHEN v_days_left <= 7            THEN 'medium'
        ELSE                                  'low'
      END;

      -- Upsert reminder (unique: hearing_id + user_id)
      INSERT INTO public.reminders
        (firm_id, case_id, hearing_id, user_id, remind_date, status, urgency)
      VALUES (
        v_case.firm_id,
        v_case.case_id,
        v_case.hearing_id,
        v_user.user_id,
        v_case.next_date - v_remind_days,
        'upcoming',
        v_urgency
      )
      ON CONFLICT (hearing_id, user_id) DO UPDATE
        SET remind_date = EXCLUDED.remind_date,
            urgency     = EXCLUDED.urgency,
            status      = CASE
              WHEN reminders.status = 'upcoming' THEN 'upcoming'
              ELSE reminders.status
            END;

      -- Create in-app notification (once per urgency tier per day)
      IF NOT EXISTS (
        SELECT 1 FROM public.notifications
        WHERE ref_type  = 'hearing'
          AND ref_id    = v_case.hearing_id
          AND user_id   = v_user.user_id
          AND created_at::date = CURRENT_DATE
      ) THEN
        INSERT INTO public.notifications
          (firm_id, user_id, title, body, type, ref_type, ref_id)
        VALUES (
          v_case.firm_id,
          v_user.user_id,
          CASE v_urgency
            WHEN 'critical' THEN '🔴 Hearing TODAY — ' || v_case.case_ref_no
            WHEN 'high'     THEN '🟠 Hearing in ' || v_days_left || ' days — ' || v_case.case_ref_no
            ELSE                 'Upcoming Hearing — ' || v_case.case_ref_no
          END,
          v_case.plaintiff_name || ' vs ' || v_case.defendant_name ||
          ' on ' || TO_CHAR(v_case.next_date AT TIME ZONE 'Asia/Karachi', 'DD Mon YYYY'),
          'reminder',
          'hearing',
          v_case.hearing_id
        );
        v_created := v_created + 1;
      END IF;
    END LOOP;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_created, v_closed;
END;
$$;

-- ─── Daily morning summary notification ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.send_daily_summary()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_firm   RECORD;
  v_user   RECORD;
  v_count  INT;
BEGIN
  FOR v_firm IN SELECT id FROM public.firms WHERE subscription_status IN ('active','trial')
  LOOP
    FOR v_user IN
      SELECT p.id AS user_id
      FROM   public.profiles p
      LEFT   JOIN public.notification_preferences np ON np.user_id = p.id
      WHERE  p.firm_id   = v_firm.id
        AND  p.is_active = TRUE
        AND  COALESCE(np.notify_daily_summary, TRUE) = TRUE
    LOOP
      SELECT COUNT(*) INTO v_count
      FROM public.hearings h
      JOIN public.cases    c ON c.id = h.case_id
      WHERE h.hearing_date = CURRENT_DATE
        AND c.firm_id      = v_firm.id
        AND c.status       = 'running'
        AND c.deleted_at   IS NULL;

      IF v_count > 0 THEN
        INSERT INTO public.notifications
          (firm_id, user_id, title, body, type, ref_type, ref_id)
        VALUES (
          v_firm.id,
          v_user.user_id,
          'Good morning — ' || v_count || ' hearing' || CASE WHEN v_count > 1 THEN 's' ELSE '' END || ' today',
          'Check today''s cause list for details.',
          'system',
          NULL, NULL
        );
      END IF;
    END LOOP;
  END LOOP;
END;
$$;

-- ─── pg_cron schedules (6:00 AM Asia/Karachi = 01:00 UTC) ────────────────────
-- Run in Supabase SQL Editor after enabling the pg_cron extension:

SELECT cron.schedule(
  'generate-reminders-daily',
  '0 1 * * *',        -- 01:00 UTC = 06:00 PKT
  $$SELECT public.generate_reminders()$$
);

SELECT cron.schedule(
  'daily-summary-morning',
  '0 1 * * *',
  $$SELECT public.send_daily_summary()$$
);

-- ─── Realtime: enable on reminders + notifications ────────────────────────────
-- Run in Supabase Dashboard → Database → Replication → Tables → enable these:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.reminders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- (Cannot be run in a migration file; must be done via Dashboard or CLI)
