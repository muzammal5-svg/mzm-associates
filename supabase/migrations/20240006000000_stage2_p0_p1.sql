-- Stage 2 Part 1: profile protection, storage, atomic case workflows and filters.

-- Prevent users from changing firm membership; only firm admins may manage
-- roles and activation state for profiles in their own firm.
DROP POLICY IF EXISTS "user updates own profile" ON public.profiles;

CREATE POLICY "users update own safe profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() AND firm_id = public.current_firm_id())
  WITH CHECK (id = auth.uid() AND firm_id = public.current_firm_id());

CREATE POLICY "admins update profiles in own firm"
  ON public.profiles FOR UPDATE
  USING (firm_id = public.current_firm_id() AND public.is_admin_or_above())
  WITH CHECK (firm_id = public.current_firm_id() AND public.is_admin_or_above());

CREATE OR REPLACE FUNCTION public.guard_profile_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.email IS DISTINCT FROM OLD.email
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Profile identity fields cannot be changed through profile updates.';
  END IF;

  IF NEW.firm_id IS DISTINCT FROM OLD.firm_id THEN
    RAISE EXCEPTION 'Profile firm membership cannot be changed.';
  END IF;

  IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_active IS DISTINCT FROM OLD.is_active)
     AND NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'Only firm administrators may change profile roles or activation.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_profile_updates ON public.profiles;
CREATE TRIGGER trg_guard_profile_updates
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_updates();

-- The view has one, deterministic latest hearing even when multiple rows share
-- the maximum hearing_date.
CREATE OR REPLACE VIEW public.v_cause_list AS
SELECT
  h.id AS hearing_id,
  h.case_id,
  h.firm_id,
  h.serial_no,
  h.hearing_date,
  h.next_date,
  h.current_proceeding,
  h.next_proceeding,
  h.judge_name AS hearing_judge,
  h.court_no AS hearing_court_no,
  c.case_ref_no,
  c.plaintiff_name,
  c.defendant_name,
  c.From,
  c.status AS case_status,
  c.judge_name AS case_judge,
  c.court_no AS case_court_no,
  cl.full_name AS client_name,
  cl.phone AS client_phone,
  ct.name AS case_type_name,
  ct.requires_offence,
  (
    SELECT MAX(h2.hearing_date)
    FROM public.hearings h2
    WHERE h2.case_id = h.case_id
      AND h2.hearing_date < h.hearing_date
  ) AS previous_date,
  h.id = (
    SELECT h3.id
    FROM public.hearings h3
    WHERE h3.case_id = h.case_id
    ORDER BY h3.hearing_date DESC, h3.created_at DESC, h3.id DESC
    LIMIT 1
  ) AS is_latest_hearing,
  c.case_type_id
FROM public.hearings h
JOIN public.cases c ON c.id = h.case_id AND c.deleted_at IS NULL
JOIN public.clients cl ON cl.id = c.client_id
JOIN public.case_types ct ON ct.id = c.case_type_id;

ALTER VIEW public.v_cause_list SET (security_invoker = true);

-- Replace the previous function so a caller can simulate the Pakistan-local
-- date in tests while scheduled execution retains its normal default.
DROP FUNCTION public.generate_reminders(UUID);
CREATE FUNCTION public.generate_reminders(
  p_firm_id UUID DEFAULT NULL,
  p_today DATE DEFAULT NULL
)
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
  v_today DATE := COALESCE(p_today, (NOW() AT TIME ZONE 'Asia/Karachi')::DATE);
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
  IF auth.role() = 'anon'
     OR (auth.uid() IS NOT NULL AND
         (p_firm_id IS NULL OR p_firm_id IS DISTINCT FROM public.current_firm_id())) THEN
    RAISE EXCEPTION 'You may generate reminders only for your own firm.';
  END IF;

  UPDATE public.reminders r
  SET status = 'dismissed', acted_at = NOW()
  WHERE r.status = 'upcoming'
    AND (p_firm_id IS NULL OR r.firm_id = p_firm_id)
    AND (
      r.next_date IS DISTINCT FROM (
        SELECT h.next_date FROM public.hearings h WHERE h.id = r.hearing_id
      )
      OR r.next_date IS NULL
      OR r.next_date < v_today
      OR r.next_date > v_today + COALESCE(
        (SELECT np.remind_days_before FROM public.notification_preferences np WHERE np.user_id = r.user_id),
        (SELECT f.default_remind_days_before FROM public.firms f WHERE f.id = r.firm_id),
        10
      )
      OR NOT EXISTS (
        SELECT 1 FROM public.cases c
        WHERE c.id = r.case_id AND c.status = 'running'
          AND c.deleted_at IS NULL AND c.firm_id = r.firm_id
      )
      OR NOT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = r.user_id AND p.is_active = TRUE
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
    SELECT c.id AS case_id, c.firm_id, c.case_ref_no,
           c.plaintiff_name, c.defendant_name, c.From,
           h.id AS hearing_id, h.next_date,
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
             COALESCE(np.remind_days_before, f.default_remind_days_before, 10) AS days_before,
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
        SELECT 1 FROM public.reminders existing
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
        SELECT 1 FROM public.reminders active_reminder
        WHERE active_reminder.id = v_reminder_id
          AND active_reminder.status = 'upcoming'
      ) THEN
        INSERT INTO public.notifications
          (firm_id, user_id, title, body, type, ref_type, ref_id, dedupe_key)
        VALUES (
          v_case.firm_id, v_user.user_id,
          CASE
            WHEN v_days_left = 0 THEN 'Hearing today — ' || v_case.case_ref_no
            WHEN v_days_left = 1 THEN 'Hearing tomorrow — ' || v_case.case_ref_no
            WHEN v_days_left <= 3 THEN 'Hearing in ' || v_days_left || ' days — ' || v_case.case_ref_no
            ELSE 'Upcoming hearing — ' || v_case.case_ref_no
          END,
          v_case.plaintiff_name || ' vs ' || v_case.defendant_name ||
            ' · ' || TO_CHAR(v_case.next_date, 'DD Mon YYYY') ||
            COALESCE(' · ' || v_case.court_no, ''),
          'reminder', 'case', v_case.case_id,
          'reminder:' || v_reminder_id::TEXT || ':' || v_today::TEXT
        )
        ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO NOTHING;
        UPDATE public.reminders SET last_notified_at = NOW() WHERE id = v_reminder_id;
      END IF;
    END LOOP;
  END LOOP;

  RETURN QUERY SELECT v_processed, v_created, v_closed;
END;
$$;

REVOKE ALL ON FUNCTION public.generate_reminders(UUID, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_reminders(UUID, DATE) TO authenticated, service_role;

-- Include the reopen reason in the existing status-change activity entry.
CREATE OR REPLACE FUNCTION public.auto_log_case_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reopen_reason TEXT;
BEGIN
  IF OLD.status <> NEW.status THEN
    IF NEW.status = 'decided' THEN
      PERFORM public.log_case_activity(
        NEW.id, NEW.firm_id, 'case_decided'::activity_event, auth.uid(),
        'Case decided — outcome: ' || COALESCE(NEW.outcome::TEXT, '—') ||
        ', date: ' || TO_CHAR(NEW.decision_date, 'DD Mon YYYY'),
        jsonb_build_object('outcome', NEW.outcome, 'decision_date', NEW.decision_date)
      );
    ELSIF NEW.status = 'running' AND OLD.status = 'decided' THEN
      v_reopen_reason := NULLIF(current_setting('app.case_reopen_reason', TRUE), '');
      PERFORM public.log_case_activity(
        NEW.id, NEW.firm_id, 'case_reopened'::activity_event, auth.uid(),
        CASE WHEN v_reopen_reason IS NULL
          THEN 'Case reopened and moved back to Running.'
          ELSE 'Case reopened: ' || v_reopen_reason
        END,
        CASE WHEN v_reopen_reason IS NULL THEN NULL
          ELSE jsonb_build_object('reason', v_reopen_reason)
        END
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_case_with_first_hearing(
  p_case JSONB,
  p_first_hearing JSONB DEFAULT NULL
)
RETURNS public.cases
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_case public.cases%ROWTYPE;
  v_firm_id UUID := public.current_firm_id();
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Karachi')::DATE;
BEGIN
  IF auth.uid() IS NULL OR public.current_role() NOT IN ('super_admin', 'admin', 'lawyer') THEN
    RAISE EXCEPTION 'You are not allowed to create cases.';
  END IF;
  IF v_firm_id IS NULL THEN
    RAISE EXCEPTION 'Your account is not linked to a firm.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = (p_case->>'client_id')::UUID AND firm_id = v_firm_id
  ) OR NOT EXISTS (
    SELECT 1 FROM public.case_types
    WHERE id = (p_case->>'case_type_id')::UUID AND firm_id = v_firm_id
  ) THEN
    RAISE EXCEPTION 'The selected client and case type must belong to your firm.';
  END IF;

  INSERT INTO public.cases (
    firm_id, client_id, case_ref_no, plaintiff_name, defendant_name,
    From, judge_name, court_no, case_type_id, offence, description,
    status, assigned_to, created_by
  ) VALUES (
    v_firm_id,
    (p_case->>'client_id')::UUID,
    p_case->>'case_ref_no',
    p_case->>'plaintiff_name',
    p_case->>'defendant_name',
    (p_case->>'From')::From_type,
    NULLIF(p_case->>'judge_name', ''),
    NULLIF(p_case->>'court_no', ''),
    (p_case->>'case_type_id')::UUID,
    NULLIF(p_case->>'offence', ''),
    NULLIF(p_case->>'description', ''),
    'running',
    COALESCE(NULLIF(p_case->>'assigned_to', '')::UUID, auth.uid()),
    auth.uid()
  )
  RETURNING * INTO v_case;

  IF p_first_hearing IS NOT NULL AND p_first_hearing <> 'null'::JSONB THEN
    INSERT INTO public.hearings (
      case_id, firm_id, hearing_date, serial_no, next_date, next_proceeding,
      judge_name, court_no, created_by
    ) VALUES (
      v_case.id, v_firm_id,
      COALESCE(NULLIF(p_first_hearing->>'hearing_date', '')::DATE, v_today),
      NULLIF(p_first_hearing->>'serial_no', ''),
      NULLIF(p_first_hearing->>'next_date', '')::DATE,
      NULLIF(p_first_hearing->>'next_proceeding', ''),
      v_case.judge_name, v_case.court_no, auth.uid()
    );
  END IF;

  RETURN v_case;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_hearing(
  p_hearing_id UUID,
  p_current_proceeding TEXT,
  p_next_proceeding TEXT,
  p_next_date DATE,
  p_serial_no TEXT DEFAULT NULL,
  p_judge_name TEXT DEFAULT NULL,
  p_court_no TEXT DEFAULT NULL
)
RETURNS public.hearings
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_current public.hearings%ROWTYPE;
  v_new public.hearings%ROWTYPE;
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Karachi')::DATE;
BEGIN
  IF auth.uid() IS NULL OR public.current_role() NOT IN ('super_admin', 'admin', 'lawyer') THEN
    RAISE EXCEPTION 'You are not allowed to update hearings.';
  END IF;
  SELECT * INTO v_current
  FROM public.hearings
  WHERE id = p_hearing_id AND firm_id = public.current_firm_id()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hearing not found in your firm.';
  END IF;
  IF p_current_proceeding IS NULL OR btrim(p_current_proceeding) = '' THEN
    RAISE EXCEPTION 'Current proceeding is required.';
  END IF;
  IF p_next_date IS NULL OR p_next_date <= v_current.hearing_date THEN
    RAISE EXCEPTION 'Next date must be after the current hearing date.';
  END IF;

  UPDATE public.hearings
  SET current_proceeding = p_current_proceeding,
      serial_no = COALESCE(NULLIF(p_serial_no, ''), v_current.serial_no)
  WHERE id = v_current.id;

  INSERT INTO public.hearings (
    case_id, firm_id, hearing_date, next_date, next_proceeding,
    current_proceeding, judge_name, court_no, created_by
  ) VALUES (
    v_current.case_id, v_current.firm_id, v_today, p_next_date,
    NULLIF(p_next_proceeding, ''), NULL,
    COALESCE(NULLIF(p_judge_name, ''), v_current.judge_name),
    COALESCE(NULLIF(p_court_no, ''), v_current.court_no),
    auth.uid()
  )
  RETURNING * INTO v_new;

  PERFORM public.generate_reminders(v_current.firm_id, v_today);
  RETURN v_new;
END;
$$;

CREATE OR REPLACE FUNCTION public.reopen_case(p_case_id UUID, p_reason TEXT)
RETURNS public.cases
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_case public.cases%ROWTYPE;
BEGIN
  IF NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'Only firm administrators may reopen a case.';
  END IF;
  IF p_reason IS NULL OR length(btrim(p_reason)) < 5 THEN
    RAISE EXCEPTION 'Please provide a reason of at least five characters.';
  END IF;

  PERFORM set_config('app.case_reopen_reason', btrim(p_reason), TRUE);
  UPDATE public.cases
  SET status = 'running', decision_date = NULL, outcome = NULL, decision_notes = NULL
  WHERE id = p_case_id
    AND firm_id = public.current_firm_id()
    AND status = 'decided'
    AND deleted_at IS NULL
  RETURNING * INTO v_case;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Decided case not found in your firm.';
  END IF;
  RETURN v_case;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_case_decided(
  p_case_id UUID,
  p_decision_date DATE,
  p_outcome case_outcome,
  p_decision_notes TEXT DEFAULT NULL,
  p_document JSONB DEFAULT NULL
)
RETURNS public.cases
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_case public.cases%ROWTYPE;
  v_document_path TEXT;
BEGIN
  IF auth.uid() IS NULL OR public.current_role() NOT IN ('super_admin', 'admin', 'lawyer') THEN
    RAISE EXCEPTION 'You are not allowed to decide cases.';
  END IF;
  IF p_decision_date IS NULL OR p_outcome IS NULL THEN
    RAISE EXCEPTION 'Decision date and outcome are required.';
  END IF;

  IF p_document IS NOT NULL AND p_document <> 'null'::JSONB THEN
    v_document_path := p_document->>'file_path';
    IF v_document_path IS NULL
       OR split_part(v_document_path, '/', 1) <> public.current_firm_id()::TEXT THEN
      RAISE EXCEPTION 'The final order document must be stored in your firm folder.';
    END IF;
    INSERT INTO public.documents (
      firm_id, case_id, client_id, name, file_path, mime, size, uploaded_by
    ) VALUES (
      public.current_firm_id(), p_case_id, NULL,
      COALESCE(NULLIF(p_document->>'name', ''), 'Final Order'),
      v_document_path, p_document->>'mime',
      NULLIF(p_document->>'size', '')::BIGINT, auth.uid()
    );
  END IF;

  UPDATE public.cases
  SET status = 'decided',
      decision_date = p_decision_date,
      outcome = p_outcome,
      decision_notes = p_decision_notes
  WHERE id = p_case_id
    AND firm_id = public.current_firm_id()
    AND status = 'running'
    AND deleted_at IS NULL
  RETURNING * INTO v_case;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Running case not found in your firm.';
  END IF;

  PERFORM public.close_case_reminders(p_case_id);
  RETURN v_case;
END;
$$;

REVOKE ALL ON FUNCTION public.create_case_with_first_hearing(JSONB, JSONB) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_hearing(UUID, TEXT, TEXT, DATE, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reopen_case(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_case_decided(UUID, DATE, case_outcome, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_case_with_first_hearing(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_hearing(UUID, TEXT, TEXT, DATE, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reopen_case(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_case_decided(UUID, DATE, case_outcome, TEXT, JSONB) TO authenticated;

-- Private firm documents and publicly readable, user-owned avatar objects.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 'documents', FALSE, 52428800,
  ARRAY[
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET public = TRUE,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "firm documents read" ON storage.objects;
DROP POLICY IF EXISTS "firm documents insert" ON storage.objects;
DROP POLICY IF EXISTS "firm documents update" ON storage.objects;
DROP POLICY IF EXISTS "firm admins delete documents" ON storage.objects;
DROP POLICY IF EXISTS "users insert own avatar" ON storage.objects;
DROP POLICY IF EXISTS "users update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "users delete own avatar" ON storage.objects;

CREATE POLICY "firm documents read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.current_firm_id()::TEXT
  );

CREATE POLICY "firm documents insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = public.current_firm_id()::TEXT
  );

CREATE POLICY "firm documents update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.current_firm_id()::TEXT
    AND public.current_role() IN ('super_admin', 'admin', 'lawyer')
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.current_firm_id()::TEXT
    AND public.current_role() IN ('super_admin', 'admin', 'lawyer')
  );

CREATE POLICY "firm admins delete documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.current_firm_id()::TEXT
    AND public.is_admin_or_above()
  );

CREATE POLICY "users insert own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

CREATE POLICY "users delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
