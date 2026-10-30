-- Fix get_subscription_state to prioritize active/trialing/grace over expired.
-- Previously ordered by ends_at DESC only, which could pick an expired subscription
-- with a later ends_at over a newly activated one with an earlier ends_at.
CREATE OR REPLACE FUNCTION public.get_subscription_state()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
      'status', s.status,
      'starts_at', s.starts_at,
      'ends_at', s.ends_at,
      'grace_until', s.grace_until,
      'days_left', CEIL(EXTRACT(EPOCH FROM (s.ends_at - NOW()))/86400.0),
      'in_grace', (s.status='grace' AND NOW() < COALESCE(s.grace_until, s.ends_at)),
      'seats_used', public.seats_used(public.current_firm_id()),
      'seats_max', COALESCE((SELECT p.max_users FROM public.plans p WHERE p.id=s.plan_id), 5)
    ) FROM public.subscriptions s
    WHERE s.firm_id = public.current_firm_id()
    ORDER BY
      CASE s.status
        WHEN 'active'   THEN 1
        WHEN 'trialing' THEN 2
        WHEN 'grace'    THEN 3
        ELSE 4
      END,
      s.ends_at DESC
    LIMIT 1),
    '{"status":"none"}'::jsonb
  );
$$;
