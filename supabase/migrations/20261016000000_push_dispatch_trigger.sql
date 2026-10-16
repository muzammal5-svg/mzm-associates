-- =============================================================================
-- Migration 008: Web Push dispatch trigger on notification insert
-- =============================================================================
-- APPLY IN SUPABASE SQL EDITOR (Dashboard → SQL Editor) AFTER the following
-- manual steps are complete:
--
--   1. Deploy the `send-push` Edge Function (requires Docker Desktop locally:
--      `npx supabase functions deploy send-push`).
--   2. Set secret `VAPID_PRIVATE_KEY` in Edge Function settings (Dashboard →
--      Edge Functions → send-push → Secrets).
--   3. Set secret `SUPABASE_SERVICE_ROLE_KEY` in Edge Function settings.
--   4. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in web/.env.local (already done).
--
-- pg_net enables outbound HTTP requests from PostgreSQL to the Edge Function.
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Trigger function: fires send-push Edge Function for new notifications.
-- The Authorization header must carry the service role key so the function
-- runs with admin privileges. Replace <SUPABASE_SERVICE_ROLE_KEY> below with
-- the actual value (set as an Edge Function secret; do NOT hardcode in SQL).
CREATE OR REPLACE FUNCTION public.dispatch_push_on_notification()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  v_status  INT;
  v_response jsonb;
BEGIN
  -- Skip daily_summary pushes (in-app only).
  IF NEW.type = 'daily_summary' THEN
    RETURN NEW;
  END IF;

  SELECT status_code, response_body
  INTO v_status, v_response
  FROM pg_net.web_post(
    url := 'https://zxxpsvhlekemgccrcwtg.functions.supabase.co/send-push',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <SUPABASE_SERVICE_ROLE_KEY>',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('notification_ids', ARRAY[NEW.id::text])
  );

  RAISE NOTICE '[send-push] notification % dispatched status=%', NEW.id, v_status;

EXCEPTION
  WHEN OTHERS THEN
    -- Never break the notification insert because push delivery failed.
    RAISE NOTICE '[send-push] notification % push dispatch skipped: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Attach trigger: after a notification row is inserted, attempt push dispatch.
DROP TRIGGER IF EXISTS trg_dispatch_push_on_notification ON public.notifications;
CREATE TRIGGER trg_dispatch_push_on_notification
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.dispatch_push_on_notification();

COMMENT ON TRIGGER trg_dispatch_push_on_notification ON public.notifications IS
  'Invokes send-push Edge Function when a new notification is inserted.';
