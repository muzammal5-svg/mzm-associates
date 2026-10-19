CREATE OR REPLACE FUNCTION public.check_device_valid(p_device_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := auth.uid();
  v_revoked TIMESTAMPTZ;
BEGIN
  SELECT revoked_at INTO v_revoked FROM public.user_devices WHERE user_id=v_user AND device_id=p_device_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', FALSE, 'reason', 'not_registered');
  END IF;
  IF v_revoked IS NOT NULL THEN
    RETURN jsonb_build_object('valid', FALSE, 'reason', 'revoked');
  END IF;
  UPDATE public.user_devices SET last_seen_at=NOW() WHERE user_id=v_user AND device_id=p_device_id;
  RETURN jsonb_build_object('valid', TRUE);
END;
$$;
GRANT EXECUTE ON FUNCTION public.check_device_valid(TEXT) TO authenticated;
