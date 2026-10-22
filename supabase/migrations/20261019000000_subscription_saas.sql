-- =============================================================================
-- Subscription SaaS: plans, subscriptions, payments, devices, settings, enforcement
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enums
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('bank_transfer','jazzcash','easypaisa','card','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','verified','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE sub_status AS ENUM ('trialing','pending','active','grace','expired','suspended','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Plans
CREATE TABLE IF NOT EXISTS public.plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  duration_months INT  NOT NULL,
  price_pkr       NUMERIC(12,2) NOT NULL,
  max_users       INT  NOT NULL DEFAULT 5,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id     UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  plan_id     UUID REFERENCES public.plans(id),
  status      sub_status NOT NULL DEFAULT 'trialing',
  starts_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at     TIMESTAMPTZ NOT NULL,
  grace_until TIMESTAMPTZ,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_firm ON public.subscriptions(firm_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id        UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  plan_id        UUID NOT NULL REFERENCES public.plans(id),
  amount_pkr     NUMERIC(12,2) NOT NULL,
  method         payment_method NOT NULL,
  reference_no   TEXT NOT NULL,
  slip_path      TEXT,
  status         payment_status NOT NULL DEFAULT 'pending',
  note           TEXT,
  submitted_by   UUID REFERENCES auth.users(id),
  verified_by    UUID REFERENCES auth.users(id),
  verified_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_firm ON public.payments(firm_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- Payment accounts (super admin editable)
CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  method          payment_method NOT NULL,
  account_title   TEXT NOT NULL,
  account_number  TEXT NOT NULL,
  bank_name       TEXT,
  instructions    TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User devices
CREATE TABLE IF NOT EXISTS public.user_devices (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id       UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  device_id     TEXT NOT NULL,
  device_label  TEXT,
  session_id    TEXT,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);

-- App settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Billing events / audit
CREATE TABLE IF NOT EXISTS public.billing_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id     UUID REFERENCES public.firms(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES auth.users(id),
  event_type  TEXT NOT NULL,
  payload     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_billing_events_firm ON public.billing_events(firm_id);

-- Alter firms/profiles
ALTER TABLE public.firms ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_owner BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

-- Trigger to keep updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DO $$ BEGIN
  CREATE TRIGGER trg_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TRIGGER trg_payment_accounts_updated_at BEFORE UPDATE ON public.payment_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper: super admin check
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin');
$$;

-- Helper: current firm
CREATE OR REPLACE FUNCTION public.current_firm_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT firm_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Helper: is owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_owner FROM public.profiles WHERE id = auth.uid()), FALSE);
$$;

-- Read/write access based on subscription
CREATE OR REPLACE FUNCTION public.read_access(p_firm_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.firm_id = p_firm_id
      AND s.status IN ('trialing','active','grace')
      AND NOW() < COALESCE(s.grace_until, s.ends_at)
  );
$$;

CREATE OR REPLACE FUNCTION public.write_access(p_firm_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.firm_id = p_firm_id
      AND s.status IN ('trialing','active')
      AND NOW() < s.ends_at
  );
$$;

CREATE OR REPLACE FUNCTION public.has_active_access(p_firm_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.write_access(p_firm_id);
$$;

-- Modify handle_new_user: do not auto-attach to a firm
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'firm_id' IS NOT NULL THEN
    INSERT INTO public.profiles (id, firm_id, full_name, email, role, is_owner)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'firm_id')::UUID,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
      NEW.email,
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'clerk'),
      COALESCE((NEW.raw_user_meta_data->>'is_owner')::BOOLEAN, FALSE)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Register firm: callable by authenticated user without profile
CREATE OR REPLACE FUNCTION public.register_firm(p_firm_name TEXT, p_full_name TEXT, p_phone TEXT)
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

  INSERT INTO public.firms (name, owner_id) VALUES (p_firm_name, NULL) RETURNING id INTO v_firm;
  INSERT INTO public.profiles (id, firm_id, full_name, phone, email, role, is_owner)
  VALUES (v_user, v_firm, p_full_name, p_phone, (SELECT email FROM auth.users WHERE id=v_user), 'admin', TRUE);
  UPDATE public.firms SET owner_id = v_user WHERE id = v_firm;

  IF v_trial_enabled THEN
    v_ends := NOW() + (v_trial_days || ' days')::INTERVAL;
    INSERT INTO public.subscriptions (firm_id, plan_id, status, starts_at, ends_at, created_by)
    VALUES (v_firm, NULL, 'trialing', NOW(), v_ends, v_user);
  ELSE
    -- no trial: create pending subscription placeholder
    INSERT INTO public.subscriptions (firm_id, plan_id, status, starts_at, ends_at, created_by)
    VALUES (v_firm, NULL, 'pending', NOW(), NOW(), v_user);
  END IF;

  INSERT INTO public.billing_events (firm_id, actor_id, event_type, payload)
  VALUES (v_firm, v_user, 'firm_registered', jsonb_build_object('firm_name', p_firm_name));

  RETURN jsonb_build_object('firm_id', v_firm);
END;
$$;

-- Submit payment
CREATE OR REPLACE FUNCTION public.submit_payment(p_plan_id UUID, p_method payment_method, p_reference_no TEXT, p_slip_path TEXT, p_amount NUMERIC)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := auth.uid();
  v_firm UUID;
  v_payment UUID;
BEGIN
  v_firm := public.current_firm_id();
  IF v_firm IS NULL THEN RAISE EXCEPTION 'No firm'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.plans WHERE id = p_plan_id AND is_active) THEN RAISE EXCEPTION 'Invalid plan'; END IF;
  INSERT INTO public.payments (firm_id, plan_id, amount_pkr, method, reference_no, slip_path, submitted_by)
  VALUES (v_firm, p_plan_id, p_amount, p_method, p_reference_no, p_slip_path, v_user)
  RETURNING id INTO v_payment;
  RETURN v_payment;
END;
$$;

-- Verify payment (super admin only)
CREATE OR REPLACE FUNCTION public.verify_payment(p_payment_id UUID, p_approve BOOLEAN, p_note TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_payment RECORD;
  v_plan RECORD;
  v_base TIMESTAMPTZ;
  v_ends TIMESTAMPTZ;
  v_sub UUID;
BEGIN
  IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  IF v_payment.status <> 'pending' THEN RAISE EXCEPTION 'Payment already processed'; END IF;

  IF NOT p_approve THEN
    UPDATE public.payments SET status='rejected', note=p_note, verified_by=auth.uid(), verified_at=NOW() WHERE id=p_payment_id;
    INSERT INTO public.billing_events (firm_id, actor_id, event_type, payload) VALUES (v_payment.firm_id, auth.uid(), 'payment_rejected', jsonb_build_object('payment_id', p_payment_id, 'note', p_note));
    RETURN jsonb_build_object('status','rejected');
  END IF;

  SELECT * INTO v_plan FROM public.plans WHERE id = v_payment.plan_id;

  -- base = max(now, current ends_at of latest subscription)
  SELECT COALESCE(MAX(ends_at), NOW()) INTO v_base
  FROM public.subscriptions WHERE firm_id = v_payment.firm_id AND status IN ('trialing','active','grace');

  IF v_base < NOW() THEN v_base := NOW(); END IF;
  v_ends := v_base + (v_plan.duration_months || ' months')::INTERVAL;

  INSERT INTO public.subscriptions (firm_id, plan_id, status, starts_at, ends_at, created_by)
  VALUES (v_payment.firm_id, v_payment.plan_id, 'active', NOW(), v_ends, auth.uid())
  RETURNING id INTO v_sub;

  UPDATE public.payments SET status='verified', note=p_note, verified_by=auth.uid(), verified_at=NOW(), subscription_id=v_sub WHERE id=p_payment_id;

  INSERT INTO public.billing_events (firm_id, actor_id, event_type, payload)
  VALUES (v_payment.firm_id, auth.uid(), 'payment_verified', jsonb_build_object('payment_id', p_payment_id, 'plan', v_plan.code, 'ends_at', v_ends));

  RETURN jsonb_build_object('status','verified','ends_at',v_ends);
END;
$$;

-- Admin actions
CREATE OR REPLACE FUNCTION public.admin_extend_subscription(p_firm_id UUID, p_days INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_sub UUID;
BEGIN
  IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT id INTO v_sub FROM public.subscriptions WHERE firm_id=p_firm_id ORDER BY ends_at DESC LIMIT 1;
  IF v_sub IS NULL THEN RAISE EXCEPTION 'No subscription'; END IF;
  UPDATE public.subscriptions SET ends_at = ends_at + (p_days || ' days')::INTERVAL, status='active', grace_until=NULL WHERE id=v_sub;
  INSERT INTO public.billing_events (firm_id, actor_id, event_type, payload) VALUES (p_firm_id, auth.uid(), 'admin_extend', jsonb_build_object('days',p_days));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_suspend_firm(p_firm_id UUID, p_note TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.subscriptions SET status='suspended' WHERE firm_id=p_firm_id;
  INSERT INTO public.billing_events (firm_id, actor_id, event_type, payload) VALUES (p_firm_id, auth.uid(), 'admin_suspend', jsonb_build_object('note',p_note));
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reactivate_firm(p_firm_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_super_admin() THEN RAISE EXCEPTION 'Not authorized'; END IF;
  UPDATE public.subscriptions SET status='active' WHERE firm_id=p_firm_id;
  INSERT INTO public.billing_events (firm_id, actor_id, event_type, payload) VALUES (p_firm_id, auth.uid(), 'admin_reactivate', '{}'::jsonb);
END;
$$;

-- Remove member
CREATE OR REPLACE FUNCTION public.remove_member(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_firm UUID;
BEGIN
  v_firm := public.current_firm_id();
  IF NOT public.is_owner() THEN RAISE EXCEPTION 'Only owner'; END IF;
  IF p_user_id = auth.uid() THEN RAISE EXCEPTION 'Cannot remove self'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=p_user_id AND firm_id=v_firm) THEN RAISE EXCEPTION 'Not in firm'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id=p_user_id AND is_owner) THEN RAISE EXCEPTION 'Cannot remove owner'; END IF;
  DELETE FROM public.profiles WHERE id=p_user_id;
  INSERT INTO public.billing_events (firm_id, actor_id, event_type, payload) VALUES (v_firm, auth.uid(), 'member_removed', jsonb_build_object('user_id',p_user_id));
END;
$$;

-- Seats
CREATE OR REPLACE FUNCTION public.seats_used(p_firm_id UUID)
RETURNS INT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*)::INT FROM public.profiles WHERE firm_id=p_firm_id AND is_active;
$$;

CREATE OR REPLACE FUNCTION public.seat_limit(p_firm_id UUID)
RETURNS INT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT p.max_users FROM public.subscriptions s JOIN public.plans p ON p.id=s.plan_id WHERE s.firm_id=p_firm_id ORDER BY s.ends_at DESC LIMIT 1), 5);
$$;

-- Devices
CREATE OR REPLACE FUNCTION public.register_device(p_device_id TEXT, p_label TEXT, p_session_id TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user UUID := auth.uid();
  v_firm UUID;
  v_count INT;
  v_oldest UUID;
BEGIN
  v_firm := public.current_firm_id();
  IF v_firm IS NULL THEN RAISE EXCEPTION 'No firm'; END IF;
  -- upsert
  INSERT INTO public.user_devices (user_id, firm_id, device_id, device_label, session_id, last_seen_at)
  VALUES (v_user, v_firm, p_device_id, p_label, p_session_id, NOW())
  ON CONFLICT (user_id, device_id) DO UPDATE SET last_seen_at=NOW(), revoked_at=NULL, session_id=p_session_id;

  SELECT COUNT(*) INTO v_count FROM public.user_devices WHERE user_id=v_user AND revoked_at IS NULL;
  IF v_count > 2 THEN
    SELECT id INTO v_oldest FROM public.user_devices WHERE user_id=v_user AND revoked_at IS NULL AND device_id <> p_device_id ORDER BY last_seen_at ASC LIMIT 1;
    UPDATE public.user_devices SET revoked_at=NOW() WHERE id=v_oldest;
  END IF;
  RETURN jsonb_build_object('ok', TRUE);
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_device(p_device_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user UUID := auth.uid(); v_owner BOOLEAN := public.is_owner();
BEGIN
  IF v_owner THEN
    UPDATE public.user_devices SET revoked_at=NOW() WHERE id=p_device_id;
  ELSE
    UPDATE public.user_devices SET revoked_at=NOW() WHERE id=p_device_id AND user_id=v_user;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_session_valid()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  -- Limitation: JWT session_id claim not enforced server-side; device revocation checked client-side.
  SELECT TRUE;
$$;

-- Get subscription state
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
    ) FROM public.subscriptions s WHERE s.firm_id = public.current_firm_id() ORDER BY s.ends_at DESC LIMIT 1),
    '{"status":"none"}'::jsonb
  );
$$;

-- Update subscription states (daily)
CREATE OR REPLACE FUNCTION public.update_subscription_states(p_today DATE DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_today DATE := COALESCE(p_today, (NOW() AT TIME ZONE 'Asia/Karachi')::DATE);
  v_grace_days INT := 3;
  v_reminder_days INT := 7;
  r RECORD;
BEGIN
  SELECT (value)::INT INTO v_grace_days FROM public.app_settings WHERE key='grace_days';
  SELECT (value)::INT INTO v_reminder_days FROM public.app_settings WHERE key='reminder_days';
  IF v_grace_days IS NULL THEN v_grace_days := 3; END IF;
  IF v_reminder_days IS NULL THEN v_reminder_days := 7; END IF;

  -- active/trialing -> grace/expired
  FOR r IN SELECT * FROM public.subscriptions WHERE status IN ('trialing','active') LOOP
    IF v_today > r.ends_at::DATE THEN
      IF v_grace_days > 0 AND v_today <= (r.ends_at::DATE + v_grace_days) THEN
        UPDATE public.subscriptions SET status='grace', grace_until = r.ends_at + (v_grace_days || ' days')::INTERVAL WHERE id=r.id;
      ELSE
        UPDATE public.subscriptions SET status='expired' WHERE id=r.id;
      END IF;
    END IF;
  END LOOP;

  -- grace -> expired
  FOR r IN SELECT * FROM public.subscriptions WHERE status='grace' LOOP
    IF v_today > COALESCE(r.grace_until, r.ends_at)::DATE THEN
      UPDATE public.subscriptions SET status='expired' WHERE id=r.id;
    END IF;
  END LOOP;

  -- renewal reminders: idempotent via billing_events
  FOR r IN
    SELECT s.firm_id, s.ends_at FROM public.subscriptions s
    WHERE s.status IN ('trialing','active')
      AND s.ends_at::DATE = (v_today + v_reminder_days)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.billing_events WHERE firm_id=r.firm_id AND event_type='renewal_reminder' AND (payload->>'ends_at')::DATE = r.ends_at::DATE) THEN
      -- notify owner
      INSERT INTO public.notifications (user_id, firm_id, title, body, type)
      SELECT p.id, r.firm_id, 'Renewal reminder', 'Your subscription expires on ' || r.ends_at::DATE, 'info'
      FROM public.profiles p WHERE p.firm_id=r.firm_id AND p.is_owner;
      INSERT INTO public.billing_events (firm_id, event_type, payload) VALUES (r.firm_id, 'renewal_reminder', jsonb_build_object('ends_at', r.ends_at));
    END IF;
  END LOOP;
END;
$$;

-- Schedule cron 06:00 Asia/Karachi (01:00 UTC)
DO $$ BEGIN
  PERFORM cron.unschedule('update-subscription-states');
EXCEPTION WHEN OTHERS THEN NULL; END $$;
SELECT cron.schedule('update-subscription-states', '0 1 * * *', $$SELECT public.update_subscription_states()$$);

-- RLS for new tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- plans: readable by authenticated
DROP POLICY IF EXISTS "plans_read" ON public.plans;
CREATE POLICY "plans_read" ON public.plans FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "plans_admin" ON public.plans;
CREATE POLICY "plans_admin" ON public.plans FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- subscriptions
DROP POLICY IF EXISTS "subs_read" ON public.subscriptions;
CREATE POLICY "subs_read" ON public.subscriptions FOR SELECT TO authenticated USING (firm_id = public.current_firm_id() OR public.is_super_admin());
DROP POLICY IF EXISTS "subs_admin" ON public.subscriptions;
CREATE POLICY "subs_admin" ON public.subscriptions FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- payments
DROP POLICY IF EXISTS "payments_read" ON public.payments;
CREATE POLICY "payments_read" ON public.payments FOR SELECT TO authenticated USING (firm_id = public.current_firm_id() OR public.is_super_admin());
DROP POLICY IF EXISTS "payments_insert" ON public.payments;
CREATE POLICY "payments_insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (firm_id = public.current_firm_id());
DROP POLICY IF EXISTS "payments_admin" ON public.payments;
CREATE POLICY "payments_admin" ON public.payments FOR UPDATE TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- payment_accounts: readable by authenticated, writable by super admin
DROP POLICY IF EXISTS "accounts_read" ON public.payment_accounts;
CREATE POLICY "accounts_read" ON public.payment_accounts FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "accounts_admin" ON public.payment_accounts;
CREATE POLICY "accounts_admin" ON public.payment_accounts FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- user_devices
DROP POLICY IF EXISTS "devices_read" ON public.user_devices;
CREATE POLICY "devices_read" ON public.user_devices FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_owner() OR public.is_super_admin());
DROP POLICY IF EXISTS "devices_write" ON public.user_devices;
CREATE POLICY "devices_write" ON public.user_devices FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_super_admin()) WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

-- app_settings: readable by authenticated, writable by super admin
DROP POLICY IF EXISTS "settings_read" ON public.app_settings;
CREATE POLICY "settings_read" ON public.app_settings FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "settings_admin" ON public.app_settings;
CREATE POLICY "settings_admin" ON public.app_settings FOR ALL TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- billing_events
DROP POLICY IF EXISTS "events_read" ON public.billing_events;
CREATE POLICY "events_read" ON public.billing_events FOR SELECT TO authenticated USING (firm_id = public.current_firm_id() OR public.is_super_admin());
DROP POLICY IF EXISTS "events_insert" ON public.billing_events;
CREATE POLICY "events_insert" ON public.billing_events FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Enforce profiles: prevent changing firm_id/role by self; only owner/admin/super can update roles
DROP POLICY IF EXISTS "user updates own profile" ON public.profiles;
CREATE POLICY "user updates own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND firm_id = (SELECT firm_id FROM public.profiles WHERE id=auth.uid()) AND role = (SELECT role FROM public.profiles WHERE id=auth.uid()) AND is_owner = (SELECT is_owner FROM public.profiles WHERE id=auth.uid()));

DROP POLICY IF EXISTS "admin manages profiles" ON public.profiles;
CREATE POLICY "admin manages profiles" ON public.profiles FOR ALL TO authenticated
  USING (public.is_owner() OR public.is_super_admin())
  WITH CHECK (public.is_owner() OR public.is_super_admin());

-- Prevent self-insert into profiles (no public signup into firm)
DROP POLICY IF EXISTS "profiles_insert_none" ON public.profiles;
CREATE POLICY "profiles_insert_none" ON public.profiles FOR INSERT TO authenticated WITH CHECK (FALSE);

-- Storage: payment-slips bucket policies (bucket must be created in dashboard or via storage)
-- (Handled in storage policy migration if bucket exists)

-- Update business table RLS: SELECT requires read_access, writes require write_access
-- clients
DROP POLICY IF EXISTS "firm members read clients" ON public.clients;
CREATE POLICY "firm members read clients" ON public.clients FOR SELECT TO authenticated
  USING (firm_id = public.current_firm_id() AND public.read_access(firm_id));
DROP POLICY IF EXISTS "lawyer+ inserts clients" ON public.clients;
CREATE POLICY "lawyer+ inserts clients" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id));
DROP POLICY IF EXISTS "lawyer+ updates clients" ON public.clients;
CREATE POLICY "lawyer+ updates clients" ON public.clients FOR UPDATE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id))
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id));
DROP POLICY IF EXISTS "admin deletes clients" ON public.clients;
CREATE POLICY "admin deletes clients" ON public.clients FOR DELETE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id));

-- cases
DROP POLICY IF EXISTS "firm members read cases" ON public.cases;
CREATE POLICY "firm members read cases" ON public.cases FOR SELECT TO authenticated
  USING (firm_id = public.current_firm_id() AND public.read_access(firm_id));
DROP POLICY IF EXISTS "lawyer+ inserts cases" ON public.cases;
CREATE POLICY "lawyer+ inserts cases" ON public.cases FOR INSERT TO authenticated
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id));
DROP POLICY IF EXISTS "lawyer+ updates cases" ON public.cases;
CREATE POLICY "lawyer+ updates cases" ON public.cases FOR UPDATE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id))
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id));
DROP POLICY IF EXISTS "admin deletes cases" ON public.cases;
CREATE POLICY "admin deletes cases" ON public.cases FOR DELETE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id));

-- hearings
DROP POLICY IF EXISTS "firm members read hearings" ON public.hearings;
CREATE POLICY "firm members read hearings" ON public.hearings FOR SELECT TO authenticated
  USING (firm_id = public.current_firm_id() AND public.read_access(firm_id));
DROP POLICY IF EXISTS "all firm members insert hearings" ON public.hearings;
CREATE POLICY "all firm members insert hearings" ON public.hearings FOR INSERT TO authenticated
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id));
DROP POLICY IF EXISTS "lawyer+ updates hearings" ON public.hearings;
CREATE POLICY "lawyer+ updates hearings" ON public.hearings FOR UPDATE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id))
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id));
DROP POLICY IF EXISTS "admin deletes hearings" ON public.hearings;
CREATE POLICY "admin deletes hearings" ON public.hearings FOR DELETE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id));

-- documents
DROP POLICY IF EXISTS "firm members read documents" ON public.documents;
CREATE POLICY "firm members read documents" ON public.documents FOR SELECT TO authenticated
  USING (firm_id = public.current_firm_id() AND public.read_access(firm_id));
DROP POLICY IF EXISTS "firm members upload documents" ON public.documents;
CREATE POLICY "firm members upload documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id));
DROP POLICY IF EXISTS "admin deletes documents" ON public.documents;
CREATE POLICY "admin deletes documents" ON public.documents FOR DELETE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id));

-- case_notes (if exists)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='case_notes') THEN
    EXECUTE 'DROP POLICY IF EXISTS "firm members read case_notes" ON public.case_notes';
    EXECUTE 'CREATE POLICY "firm members read case_notes" ON public.case_notes FOR SELECT TO authenticated USING (firm_id = public.current_firm_id() AND public.read_access(firm_id))';
    EXECUTE 'DROP POLICY IF EXISTS "firm members insert case_notes" ON public.case_notes';
    EXECUTE 'CREATE POLICY "firm members insert case_notes" ON public.case_notes FOR INSERT TO authenticated WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id))';
    EXECUTE 'DROP POLICY IF EXISTS "firm members update case_notes" ON public.case_notes';
    EXECUTE 'CREATE POLICY "firm members update case_notes" ON public.case_notes FOR UPDATE TO authenticated USING (firm_id = public.current_firm_id() AND public.write_access(firm_id)) WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id))';
    EXECUTE 'DROP POLICY IF EXISTS "firm members delete case_notes" ON public.case_notes';
    EXECUTE 'CREATE POLICY "firm members delete case_notes" ON public.case_notes FOR DELETE TO authenticated USING (firm_id = public.current_firm_id() AND public.write_access(firm_id))';
  END IF;
END $$;

-- Seed app_settings
INSERT INTO public.app_settings (key, value) VALUES
  ('trial_enabled', 'true'::jsonb),
  ('trial_days', '7'::jsonb),
  ('grace_days', '3'::jsonb),
  ('reminder_days', '7'::jsonb),
  ('currency', '"PKR"'::jsonb),
  ('whatsapp_number', '""'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Seed plans
INSERT INTO public.plans (code, name, duration_months, price_pkr, max_users, sort_order) VALUES
  ('monthly', 'Monthly', 1, 1000, 5, 1),
  ('six_month', '6 Months', 6, 5400, 5, 2),
  ('yearly', 'Yearly', 12, 9600, 5, 3)
ON CONFLICT (code) DO NOTHING;

-- Seed payment_accounts placeholders
INSERT INTO public.payment_accounts (method, account_title, account_number, bank_name, instructions, sort_order) VALUES
  ('bank_transfer', 'MZM Associates', '14870010155786580019', 'Allied Bank', 'Transfer and share transaction ID', 1),
  ('jazzcash', 'MZM Associates', '03261929571', NULL, 'Send to JazzCash number', 2),
  ('easypaisa', 'MZM Associates', '03417359571', NULL, 'Send to Easypaisa number', 3)
ON CONFLICT DO NOTHING;

-- Storage bucket for payment slips (create if not exists) - handled via storage API; RLS below assumes bucket 'payment-slips'
-- (Bucket creation is done by admin; policies only if bucket exists)

COMMENT ON TABLE public.plans IS 'Subscription plans (configurable by super admin).';
COMMENT ON TABLE public.subscriptions IS 'Firm subscriptions.';
COMMENT ON TABLE public.payments IS 'Manual payment submissions.';
COMMENT ON TABLE public.user_devices IS 'Device tracking (max 2 active).';
COMMENT ON TABLE public.app_settings IS 'Configurable app settings.';
