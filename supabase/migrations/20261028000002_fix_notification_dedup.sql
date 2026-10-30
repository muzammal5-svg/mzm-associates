-- Fix: prevent duplicate in-app notifications when hearing next_date changes.
-- Uses dedupe_key to ensure at most one notification per (hearing, user) pair.
--
-- Note: migration 20240005000000_phase7_reminder_delivery.sql already creates
-- a partial unique index on notifications(dedupe_key) WHERE dedupe_key IS NOT NULL
-- (idx_notifications_dedupe_key), so ON CONFLICT with that predicate works correctly.
-- No additional constraint is needed.

CREATE OR REPLACE FUNCTION public.auto_create_reminders()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_case_ref  TEXT;
  v_plaintiff TEXT;
  v_defendant TEXT;
  v_user      RECORD;
  v_dk        TEXT;
BEGIN
  -- Clean up if next_date cleared
  IF NEW.next_date IS NULL THEN
    UPDATE public.reminders SET status = 'dismissed', acted_at = NOW()
    WHERE hearing_id = NEW.id AND status = 'upcoming';
    RETURN NEW;
  END IF;

  -- Only act when next_date actually changed
  IF TG_OP = 'UPDATE' AND OLD.next_date IS NOT DISTINCT FROM NEW.next_date THEN
    RETURN NEW;
  END IF;

  SELECT case_ref_no, plaintiff_name, defendant_name
  INTO v_case_ref, v_plaintiff, v_defendant
  FROM public.cases WHERE id = NEW.case_id;

  -- Upsert one reminder per active firm user
  FOR v_user IN
    SELECT id FROM public.profiles
    WHERE firm_id = NEW.firm_id AND is_active = TRUE
  LOOP
    INSERT INTO public.reminders
      (firm_id, case_id, hearing_id, user_id, remind_date, status)
    VALUES (
      NEW.firm_id, NEW.case_id, NEW.id, v_user.id,
      NEW.next_date - INTERVAL '10 days',
      'upcoming'
    )
    ON CONFLICT (hearing_id, user_id) DO UPDATE
      SET remind_date = EXCLUDED.remind_date,
          status      = 'upcoming',
          acted_at    = NULL;

    -- Deduped in-app notification: one per (hearing, user) combination.
    -- If next_date changes, update the existing notification body instead of inserting a new one.
    v_dk := 'hearing:' || NEW.id::TEXT || ':user:' || v_user.id::TEXT;

    INSERT INTO public.notifications
      (firm_id, user_id, title, body, type, ref_type, ref_id, dedupe_key)
    VALUES (
      NEW.firm_id, v_user.id,
      'Upcoming Hearing — ' || COALESCE(v_case_ref, ''),
      COALESCE(v_plaintiff,'') || ' vs ' || COALESCE(v_defendant,'') ||
        ' on ' || TO_CHAR(NEW.next_date AT TIME ZONE 'Asia/Karachi', 'DD Mon YYYY'),
      'reminder', 'hearing', NEW.id,
      v_dk
    )
    ON CONFLICT (dedupe_key) WHERE dedupe_key IS NOT NULL DO UPDATE
      SET body       = EXCLUDED.body,
          is_read    = FALSE,
          created_at = NOW();

  END LOOP;

  RETURN NEW;
END;
$$;
