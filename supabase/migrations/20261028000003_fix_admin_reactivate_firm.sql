-- Fix admin_reactivate_firm to ensure ends_at is in the future after reactivation.
-- Previously the function set status='active' without touching ends_at, so the
-- nightly cron would immediately flip the firm back to expired/suspended if the
-- subscription had already lapsed.

CREATE OR REPLACE FUNCTION public.admin_reactivate_firm(p_firm_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sub_id  UUID;
  v_ends_at TIMESTAMPTZ;
BEGIN
  IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;

  -- Get the most recent subscription
  SELECT id, ends_at INTO v_sub_id, v_ends_at
  FROM public.subscriptions
  WHERE firm_id = p_firm_id
  ORDER BY ends_at DESC
  LIMIT 1;

  IF v_sub_id IS NULL THEN RAISE EXCEPTION 'No subscription found for firm'; END IF;

  -- If ends_at is in the past, extend by 30 days from now
  IF v_ends_at < NOW() THEN
    v_ends_at := NOW() + INTERVAL '30 days';
  END IF;

  UPDATE public.subscriptions
  SET status      = 'active',
      ends_at     = v_ends_at,
      grace_until = NULL
  WHERE id = v_sub_id;

  INSERT INTO public.billing_events (firm_id, actor_id, event_type, payload)
  VALUES (p_firm_id, auth.uid(), 'admin_reactivate',
    jsonb_build_object('new_ends_at', v_ends_at));
END;
$$;
