-- Fix 1: account deletion FK violation (firms.owner_id references profiles)
-- We must NULL out firms.owner_id before deleting the profile row.
-- Fix 2: device limit is enforced by the register_device RPC — this migration
--         adds a helper to ensure the limit is exactly 2 (not 3+).

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id    UUID := auth.uid();
  v_firm_id    UUID;
  v_is_owner   BOOLEAN;
  v_firm_users INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT firm_id, is_owner INTO v_firm_id, v_is_owner
  FROM public.profiles WHERE id = v_user_id;

  -- If firm owner and other users exist, block deletion
  IF v_is_owner THEN
    SELECT COUNT(*) INTO v_firm_users
    FROM public.profiles WHERE firm_id = v_firm_id;
    IF v_firm_users > 1 THEN
      RAISE EXCEPTION 'Firm owner cannot delete account while other firm members exist. Remove members first.';
    END IF;
  END IF;

  -- Delete user-specific artifacts
  DELETE FROM public.device_tokens        WHERE user_id = v_user_id;
  DELETE FROM public.user_devices         WHERE user_id = v_user_id;
  DELETE FROM public.push_subscriptions   WHERE user_id = v_user_id;
  DELETE FROM public.notification_preferences WHERE user_id = v_user_id;
  DELETE FROM public.notifications        WHERE user_id = v_user_id;

  IF v_is_owner AND (v_firm_users <= 1 OR v_firm_users IS NULL) AND v_firm_id IS NOT NULL THEN
    -- Null out owner_id FK FIRST so we can delete the firm after the profile
    UPDATE public.firms SET owner_id = NULL WHERE id = v_firm_id;

    DELETE FROM public.reminders          WHERE firm_id = v_firm_id;
    DELETE FROM public.documents          WHERE firm_id = v_firm_id;
    DELETE FROM public.hearings           WHERE firm_id = v_firm_id;
    DELETE FROM public.cases              WHERE firm_id = v_firm_id;
    DELETE FROM public.clients            WHERE firm_id = v_firm_id;
    DELETE FROM public.case_notes         WHERE firm_id = v_firm_id;
    DELETE FROM public.case_activity_log  WHERE firm_id = v_firm_id;
    DELETE FROM public.payments           WHERE firm_id = v_firm_id;
    DELETE FROM public.subscriptions      WHERE firm_id = v_firm_id;
    DELETE FROM public.billing_events     WHERE firm_id = v_firm_id;
    DELETE FROM public.courts             WHERE firm_id = v_firm_id;
    DELETE FROM public.case_types         WHERE firm_id = v_firm_id;
    DELETE FROM public.profiles           WHERE id = v_user_id;
    DELETE FROM public.firms              WHERE id = v_firm_id;
  ELSE
    -- Non-owner member: just remove their profile
    DELETE FROM public.profiles WHERE id = v_user_id;
  END IF;
END;
$$;

-- Ensure max 2 active devices per user (clean enforcement)
-- Matches existing signature: register_device(p_device_id text, p_label text, p_session_id text) RETURNS jsonb
CREATE OR REPLACE FUNCTION public.register_device(
  p_device_id   TEXT,
  p_label       TEXT,
  p_session_id  TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_firm_id UUID;
  v_active_count INT;
  v_max_devices  INT := 2;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT firm_id INTO v_firm_id FROM public.profiles WHERE id = v_user_id;

  -- Upsert this device (update last_seen and clear any previous revocation)
  INSERT INTO public.user_devices (user_id, firm_id, device_id, device_label, session_id, last_seen_at, revoked_at)
  VALUES (v_user_id, v_firm_id, p_device_id, p_label, p_session_id, NOW(), NULL)
  ON CONFLICT (user_id, device_id) DO UPDATE
    SET last_seen_at  = NOW(),
        session_id    = EXCLUDED.session_id,
        device_label  = EXCLUDED.device_label,
        revoked_at    = NULL;

  -- Count currently active (non-revoked) devices for this user
  SELECT COUNT(*) INTO v_active_count
  FROM public.user_devices
  WHERE user_id = v_user_id AND revoked_at IS NULL;

  -- If over limit, revoke oldest devices (excluding current one)
  IF v_active_count > v_max_devices THEN
    UPDATE public.user_devices
    SET revoked_at = NOW()
    WHERE id IN (
      SELECT id FROM public.user_devices
      WHERE user_id = v_user_id
        AND device_id <> p_device_id
        AND revoked_at IS NULL
      ORDER BY last_seen_at ASC
      LIMIT (v_active_count - v_max_devices)
    );
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- Ensure the unique constraint exists so the ON CONFLICT works
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_devices_user_id_device_id_key'
  ) THEN
    ALTER TABLE public.user_devices ADD CONSTRAINT user_devices_user_id_device_id_key UNIQUE (user_id, device_id);
  END IF;
END $$;

-- Verify device is still active (not revoked)
CREATE OR REPLACE FUNCTION public.check_device_valid(p_device_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_revoked_at TIMESTAMPTZ;
BEGIN
  IF v_user_id IS NULL THEN RETURN '{"valid": false, "reason": "not_authenticated"}'::JSONB; END IF;

  SELECT revoked_at INTO v_revoked_at
  FROM public.user_devices
  WHERE user_id = v_user_id AND device_id = p_device_id;

  IF NOT FOUND THEN
    RETURN '{"valid": false, "reason": "device_not_registered"}'::JSONB;
  END IF;

  IF v_revoked_at IS NOT NULL THEN
    RETURN '{"valid": false, "reason": "device_revoked"}'::JSONB;
  END IF;

  -- Refresh last_seen
  UPDATE public.user_devices SET last_seen_at = NOW()
  WHERE user_id = v_user_id AND device_id = p_device_id;

  RETURN '{"valid": true}'::JSONB;
END;
$$;
