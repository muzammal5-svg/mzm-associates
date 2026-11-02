-- Add location fields to firms and profiles
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS tehsil TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS province TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tehsil TEXT;

-- Update register_firm function to accept location fields
CREATE OR REPLACE FUNCTION public.register_firm(
  p_firm_name TEXT,
  p_full_name TEXT,
  p_phone TEXT,
  p_city TEXT DEFAULT NULL,
  p_district TEXT DEFAULT NULL,
  p_tehsil TEXT DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_province TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := auth.uid();
  v_firm UUID;
  v_trial_days INT := 7;
  v_trial_enabled BOOLEAN := TRUE;
  v_ends TIMESTAMPTZ;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user) THEN
    RAISE EXCEPTION 'Profile already exists';
  END IF;
  SELECT (value)::INT INTO v_trial_days FROM public.app_settings WHERE key='trial_days';
  SELECT (value)::BOOLEAN INTO v_trial_enabled FROM public.app_settings WHERE key='trial_enabled';
  IF v_trial_days IS NULL THEN v_trial_days := 7; END IF;
  IF v_trial_enabled IS NULL THEN v_trial_enabled := TRUE; END IF;

  INSERT INTO public.firms (name, owner_id, city, district, tehsil, location, province)
  VALUES (p_firm_name, NULL, p_city, p_district, p_tehsil, p_location, p_province)
  RETURNING id INTO v_firm;

  INSERT INTO public.profiles (id, firm_id, full_name, phone, email, role, is_owner, city, district, tehsil)
  VALUES (
    v_user,
    v_firm,
    p_full_name,
    p_phone,
    (SELECT email FROM auth.users WHERE id=v_user),
    'admin',
    TRUE,
    p_city,
    p_district,
    p_tehsil
  );

  UPDATE public.firms SET owner_id = v_user WHERE id = v_firm;

  IF v_trial_enabled THEN
    v_ends := NOW() + (v_trial_days || ' days')::INTERVAL;
    INSERT INTO public.subscriptions (firm_id, plan_id, status, starts_at, ends_at, created_by)
    VALUES (v_firm, NULL, 'trialing', NOW(), v_ends, v_user);
  ELSE
    INSERT INTO public.subscriptions (firm_id, plan_id, status, starts_at, ends_at, created_by)
    VALUES (v_firm, NULL, 'pending', NOW(), NOW(), v_user);
  END IF;

  INSERT INTO public.billing_events (firm_id, actor_id, event_type, payload)
  VALUES (
    v_firm,
    v_user,
    'firm_registered',
    jsonb_build_object(
      'firm_name', p_firm_name,
      'city', p_city,
      'district', p_district,
      'tehsil', p_tehsil,
      'location', p_location,
      'province', p_province
    )
  );

  RETURN jsonb_build_object('firm_id', v_firm);
END;
$$;
