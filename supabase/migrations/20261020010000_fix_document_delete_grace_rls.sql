-- Fix dangling document delete RLS policy and add account deletion RPC

-- 1. Drop old permissive policy from 20261013000000 that bypassed write_access
DROP POLICY IF EXISTS "lawyers and admins delete documents" ON public.documents;
DROP POLICY IF EXISTS "firm lawyers and admins delete documents" ON storage.objects;

-- 2. Restate document delete policy ensuring firm_id, role, AND write_access
DROP POLICY IF EXISTS "admin deletes documents" ON public.documents;
CREATE POLICY "admin deletes documents" ON public.documents FOR DELETE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_admin_or_above());

-- 3. Account deletion RPC for Google Play policy compliance and GDPR
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_firm_id UUID;
  v_is_owner BOOLEAN;
  v_firm_users INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT firm_id, is_owner INTO v_firm_id, v_is_owner
  FROM public.profiles WHERE id = v_user_id;

  -- If firm owner and other users exist, require removing members first
  IF v_is_owner THEN
    SELECT COUNT(*) INTO v_firm_users FROM public.profiles WHERE firm_id = v_firm_id;
    IF v_firm_users > 1 THEN
      RAISE EXCEPTION 'Firm owner cannot delete account while other firm members exist. Remove members first.';
    END IF;
  END IF;

  -- Delete user-specific artifacts
  DELETE FROM public.device_tokens WHERE user_id = v_user_id;
  DELETE FROM public.user_devices WHERE user_id = v_user_id;
  DELETE FROM public.push_subscriptions WHERE user_id = v_user_id;
  DELETE FROM public.notification_preferences WHERE user_id = v_user_id;
  DELETE FROM public.notifications WHERE user_id = v_user_id;

  -- If sole member/owner of the firm, clean up firm data
  IF v_is_owner AND (v_firm_users <= 1 OR v_firm_users IS NULL) AND v_firm_id IS NOT NULL THEN
    DELETE FROM public.reminders WHERE firm_id = v_firm_id;
    DELETE FROM public.documents WHERE firm_id = v_firm_id;
    DELETE FROM public.hearings WHERE firm_id = v_firm_id;
    DELETE FROM public.cases WHERE firm_id = v_firm_id;
    DELETE FROM public.clients WHERE firm_id = v_firm_id;
    DELETE FROM public.case_notes WHERE firm_id = v_firm_id;
    DELETE FROM public.case_activity_log WHERE firm_id = v_firm_id;
    DELETE FROM public.payments WHERE firm_id = v_firm_id;
    DELETE FROM public.subscriptions WHERE firm_id = v_firm_id;
    DELETE FROM public.billing_events WHERE firm_id = v_firm_id;
    DELETE FROM public.courts WHERE firm_id = v_firm_id;
    DELETE FROM public.case_types WHERE firm_id = v_firm_id;
    DELETE FROM public.profiles WHERE id = v_user_id;
    DELETE FROM public.firms WHERE id = v_firm_id;
  ELSE
    -- Individual member: delete own profile
    DELETE FROM public.profiles WHERE id = v_user_id;
  END IF;
END;
$$;
