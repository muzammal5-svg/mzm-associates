-- =============================================================================
-- MZM & Associates — Case Management System
-- Phase 1 Revised: Complete Multi-Tenant Schema
-- Timezone: Asia/Karachi
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- fuzzy search on party names
CREATE EXTENSION IF NOT EXISTS "pg_cron";      -- scheduled reminder dispatch
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ────────────────────────────────────────────────────────────────────
CREATE TYPE user_role          AS ENUM ('super_admin','admin','lawyer','clerk');
CREATE TYPE case_status        AS ENUM ('running','decided');
CREATE TYPE case_outcome       AS ENUM ('won','lost','dismissed','settled','withdrawn');
CREATE TYPE From_type  AS ENUM ('plaintiff','defendant');
CREATE TYPE reminder_status    AS ENUM ('upcoming','done','dismissed');
CREATE TYPE platform_type      AS ENUM ('web','android','ios');
CREATE TYPE subscription_status AS ENUM ('active','expired','trial');

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- ─── Firms ────────────────────────────────────────────────────────────────────
CREATE TABLE public.firms (
  id                       UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                     TEXT              NOT NULL,
  logo_url                 TEXT,
  subscription_status      subscription_status NOT NULL DEFAULT 'trial',
  subscription_valid_till  DATE,
  created_at               TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.firms IS 'Law firms. All business tables carry firm_id for multi-tenancy.';

-- ─── Profiles (extends auth.users) ───────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firm_id     UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  phone       TEXT,
  email       TEXT,
  role        user_role   NOT NULL DEFAULT 'clerk',
  photo_url   TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Firm users. firm_id must match the firm they belong to.';

-- Auto-create profile row on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, firm_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'firm_id')::UUID,
      (SELECT id FROM public.firms LIMIT 1)   -- fallback for first setup
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'clerk')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Clients ──────────────────────────────────────────────────────────────────
CREATE TABLE public.clients (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id              UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  full_name            TEXT        NOT NULL,
  father_husband_name  TEXT,
  cnic                 TEXT        CHECK (cnic ~ '^\d{5}-\d{7}-\d$' OR cnic IS NULL),
  phone                TEXT,
  whatsapp             TEXT,
  email                TEXT,
  address              TEXT,
  city                 TEXT,
  is_active            BOOLEAN     NOT NULL DEFAULT TRUE,
  created_by           UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.clients IS 'Clients of the firm. Linked to cases.';

-- ─── Case Types ───────────────────────────────────────────────────────────────
CREATE TABLE public.case_types (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id          UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL,
  requires_offence BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (firm_id, name)
);

COMMENT ON TABLE public.case_types IS 'Per-firm case type list. requires_offence drives Offence field visibility.';

-- ─── Courts ───────────────────────────────────────────────────────────────────
CREATE TABLE public.courts (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id     UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (firm_id, name)
);

COMMENT ON TABLE public.courts IS 'Per-firm court list.';

-- ─── Cases ────────────────────────────────────────────────────────────────────
CREATE TABLE public.cases (
  id               UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id          UUID               NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  client_id        UUID               NOT NULL REFERENCES public.clients(id),
  case_ref_no      TEXT               NOT NULL,
  plaintiff_name   TEXT               NOT NULL,
  defendant_name   TEXT               NOT NULL,
  From     From_type  NOT NULL,
  judge_name       TEXT,
  court_no         TEXT,
  case_type_id     UUID               NOT NULL REFERENCES public.case_types(id),
  offence          TEXT,              -- only for case_types.requires_offence = true
  description      TEXT,
  status           case_status        NOT NULL DEFAULT 'running',
  decision_date    DATE,
  outcome          case_outcome,
  decision_notes   TEXT,
  assigned_to      UUID               REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by       UUID               REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.cases IS 'Core case records. plaintiff/defendant stored for "A vs B" display.';

-- ─── Hearings ─────────────────────────────────────────────────────────────────
CREATE TABLE public.hearings (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id             UUID        NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  firm_id             UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  serial_no           TEXT,       -- court cause-list serial, editable
  hearing_date        DATE        NOT NULL,
  current_proceeding  TEXT,       -- what happened at THIS hearing
  next_proceeding     TEXT,       -- what is expected next time
  next_date           DATE,
  judge_name          TEXT,
  court_no            TEXT,
  created_by          UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.hearings IS 'Each hearing is a separate row. previous_date derived from previous row ordered by hearing_date.';

-- ─── Documents ────────────────────────────────────────────────────────────────
CREATE TABLE public.documents (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id      UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  client_id    UUID        REFERENCES public.clients(id) ON DELETE SET NULL,
  case_id      UUID        REFERENCES public.cases(id) ON DELETE SET NULL,
  name         TEXT        NOT NULL,
  file_path    TEXT        NOT NULL,   -- Supabase Storage path
  mime         TEXT,
  size         BIGINT,                 -- bytes
  uploaded_by  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

COMMENT ON TABLE public.documents IS 'One module for case docs and client docs. Stored in private bucket.';

-- ─── Reminders ────────────────────────────────────────────────────────────────
CREATE TABLE public.reminders (
  id           UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id      UUID            NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  case_id      UUID            NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  hearing_id   UUID            NOT NULL REFERENCES public.hearings(id) ON DELETE CASCADE,
  user_id      UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  remind_date  DATE            NOT NULL,
  status       reminder_status NOT NULL DEFAULT 'upcoming',
  acted_at     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  UNIQUE (hearing_id, user_id)
);

COMMENT ON TABLE public.reminders IS 'Auto-generated 10 days before hearing.next_date. Never inserted manually by users.';

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE public.notifications (
  id        UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id   UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title     TEXT        NOT NULL,
  body      TEXT        NOT NULL,
  type      TEXT        NOT NULL DEFAULT 'reminder',  -- 'reminder' | 'system' | 'case_update'
  ref_type  TEXT,                                     -- 'case' | 'hearing' | 'document'
  ref_id    UUID,
  is_read   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'In-app notification inbox per user.';

-- ─── Device Tokens (FCM) ──────────────────────────────────────────────────────
CREATE TABLE public.device_tokens (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID          NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token       TEXT          NOT NULL UNIQUE,
  platform    platform_type NOT NULL DEFAULT 'web',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.device_tokens IS 'Firebase Cloud Messaging tokens per device.';

-- =============================================================================
-- TASK 2 — INDEXES
-- =============================================================================

-- Hearings: cause list and history queries
CREATE INDEX idx_hearings_next_date       ON public.hearings (next_date)         WHERE next_date IS NOT NULL;
CREATE INDEX idx_hearings_case_date_desc  ON public.hearings (case_id, hearing_date DESC);
CREATE INDEX idx_hearings_firm_date       ON public.hearings (firm_id, hearing_date);

-- Cases: dashboard filters
CREATE INDEX idx_cases_firm_status        ON public.cases (firm_id, status);
CREATE INDEX idx_cases_client             ON public.cases (client_id);
CREATE INDEX idx_cases_assigned           ON public.cases (assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_cases_case_type          ON public.cases (case_type_id);

-- Clients: search
CREATE INDEX idx_clients_firm_name        ON public.clients (firm_id, full_name);

-- Reminders: dispatch queue
CREATE INDEX idx_reminders_remind_date    ON public.reminders (remind_date, status) WHERE status = 'upcoming';
CREATE INDEX idx_reminders_firm           ON public.reminders (firm_id);

-- Notifications: unread inbox
CREATE INDEX idx_notifications_user       ON public.notifications (user_id, is_read, created_at DESC);

-- Documents
CREATE INDEX idx_documents_case           ON public.documents (case_id)   WHERE case_id   IS NOT NULL;
CREATE INDEX idx_documents_client         ON public.documents (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_documents_firm           ON public.documents (firm_id);

-- ── pg_trgm fuzzy search ──────────────────────────────────────────────────────
CREATE INDEX idx_cases_plaintiff_trgm     ON public.cases USING GIN (plaintiff_name gin_trgm_ops);
CREATE INDEX idx_cases_defendant_trgm     ON public.cases USING GIN (defendant_name gin_trgm_ops);
CREATE INDEX idx_cases_ref_no_trgm        ON public.cases USING GIN (case_ref_no    gin_trgm_ops);
CREATE INDEX idx_clients_name_trgm        ON public.clients USING GIN (full_name    gin_trgm_ops);

-- =============================================================================
-- TASK 3 — TRIGGERS: updated_at + auto-reminder
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_firms_updated_at     BEFORE UPDATE ON public.firms     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated_at  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_clients_updated_at   BEFORE UPDATE ON public.clients   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_cases_updated_at     BEFORE UPDATE ON public.cases     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_hearings_updated_at  BEFORE UPDATE ON public.hearings  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-generate reminders for ALL active users of the firm when next_date is set
CREATE OR REPLACE FUNCTION public.auto_create_reminders()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_case_ref  TEXT;
  v_plaintiff TEXT;
  v_defendant TEXT;
  v_user      RECORD;
BEGIN
  -- Clean up if next_date cleared
  IF NEW.next_date IS NULL THEN
    UPDATE public.reminders SET status = 'dismissed', acted_at = NOW()
    WHERE hearing_id = NEW.id AND status = 'upcoming';
    RETURN NEW;
  END IF;

  -- Only act when next_date actually changed
  IF TG_OP = 'UPDATE' AND OLD.next_date = NEW.next_date THEN
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

    -- Also create in-app notification
    INSERT INTO public.notifications
      (firm_id, user_id, title, body, type, ref_type, ref_id)
    VALUES (
      NEW.firm_id, v_user.id,
      'Upcoming Hearing — ' || COALESCE(v_case_ref, ''),
      COALESCE(v_plaintiff,'') || ' vs ' || COALESCE(v_defendant,'') ||
        ' on ' || TO_CHAR(NEW.next_date AT TIME ZONE 'Asia/Karachi', 'DD Mon YYYY'),
      'reminder', 'hearing', NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_reminders
  AFTER INSERT OR UPDATE OF next_date ON public.hearings
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_reminders();

-- =============================================================================
-- TASK 3 — ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.firms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_types     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens  ENABLE ROW LEVEL SECURITY;

-- ── Helpers ───────────────────────────────────────────────────────────────────

-- Returns the firm_id of the currently authenticated user
CREATE OR REPLACE FUNCTION public.current_firm_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT firm_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Returns role of current user
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_above()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT role IN ('super_admin','admin') FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- ── firms ──
CREATE POLICY "firm members read own firm"
  ON public.firms FOR SELECT USING (id = public.current_firm_id());

CREATE POLICY "super_admin manages firms"
  ON public.firms FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ── profiles ──
CREATE POLICY "users read own firm profiles"
  ON public.profiles FOR SELECT USING (firm_id = public.current_firm_id());

CREATE POLICY "user updates own profile"
  ON public.profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "admin manages profiles"
  ON public.profiles FOR ALL USING (
    firm_id = public.current_firm_id() AND public.is_admin_or_above()
  );

-- ── clients ──
CREATE POLICY "firm members read clients"
  ON public.clients FOR SELECT USING (firm_id = public.current_firm_id());

CREATE POLICY "lawyer+ inserts clients"
  ON public.clients FOR INSERT WITH CHECK (
    firm_id = public.current_firm_id() AND
    public.current_role() IN ('super_admin','admin','lawyer')
  );

CREATE POLICY "lawyer+ updates clients"
  ON public.clients FOR UPDATE USING (
    firm_id = public.current_firm_id() AND
    public.current_role() IN ('super_admin','admin','lawyer')
  );

CREATE POLICY "admin deletes clients"
  ON public.clients FOR DELETE USING (
    firm_id = public.current_firm_id() AND public.is_admin_or_above()
  );
-- NOTE: clerk cannot delete (no DELETE policy for clerk role)

-- ── case_types ──
CREATE POLICY "firm members read case_types"
  ON public.case_types FOR SELECT USING (firm_id = public.current_firm_id());

CREATE POLICY "admin manages case_types"
  ON public.case_types FOR ALL USING (
    firm_id = public.current_firm_id() AND public.is_admin_or_above()
  );

-- ── courts ──
CREATE POLICY "firm members read courts"
  ON public.courts FOR SELECT USING (firm_id = public.current_firm_id());

CREATE POLICY "admin manages courts"
  ON public.courts FOR ALL USING (
    firm_id = public.current_firm_id() AND public.is_admin_or_above()
  );

-- ── cases ──
CREATE POLICY "firm members read cases"
  ON public.cases FOR SELECT USING (firm_id = public.current_firm_id());

CREATE POLICY "lawyer+ inserts cases"
  ON public.cases FOR INSERT WITH CHECK (
    firm_id = public.current_firm_id() AND
    public.current_role() IN ('super_admin','admin','lawyer')
  );

CREATE POLICY "lawyer+ updates cases"
  ON public.cases FOR UPDATE USING (
    firm_id = public.current_firm_id() AND
    public.current_role() IN ('super_admin','admin','lawyer')
  );

CREATE POLICY "admin deletes cases"
  ON public.cases FOR DELETE USING (
    firm_id = public.current_firm_id() AND public.is_admin_or_above()
  );

-- ── hearings ──
CREATE POLICY "firm members read hearings"
  ON public.hearings FOR SELECT USING (firm_id = public.current_firm_id());

CREATE POLICY "all firm members insert hearings"
  ON public.hearings FOR INSERT WITH CHECK (firm_id = public.current_firm_id());

CREATE POLICY "lawyer+ updates hearings"
  ON public.hearings FOR UPDATE USING (
    firm_id = public.current_firm_id() AND
    public.current_role() IN ('super_admin','admin','lawyer')
  );

CREATE POLICY "admin deletes hearings"
  ON public.hearings FOR DELETE USING (
    firm_id = public.current_firm_id() AND public.is_admin_or_above()
  );

-- ── documents ──
CREATE POLICY "firm members read documents"
  ON public.documents FOR SELECT USING (firm_id = public.current_firm_id());

CREATE POLICY "firm members upload documents"
  ON public.documents FOR INSERT WITH CHECK (firm_id = public.current_firm_id());

CREATE POLICY "admin deletes documents"
  ON public.documents FOR DELETE USING (
    firm_id = public.current_firm_id() AND public.is_admin_or_above()
  );

-- ── reminders ──
CREATE POLICY "users read own reminders"
  ON public.reminders FOR SELECT
  USING (firm_id = public.current_firm_id() AND user_id = auth.uid());

CREATE POLICY "users update own reminder status"
  ON public.reminders FOR UPDATE
  USING (firm_id = public.current_firm_id() AND user_id = auth.uid());

-- ── notifications ──
CREATE POLICY "users read own notifications"
  ON public.notifications FOR SELECT
  USING (firm_id = public.current_firm_id() AND user_id = auth.uid());

CREATE POLICY "users update own notifications"
  ON public.notifications FOR UPDATE
  USING (firm_id = public.current_firm_id() AND user_id = auth.uid());

-- ── device_tokens ──
CREATE POLICY "users manage own tokens"
  ON public.device_tokens FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- TASK 4 — v_cause_list VIEW
-- =============================================================================

CREATE OR REPLACE VIEW public.v_cause_list AS
SELECT
  h.id                  AS hearing_id,
  h.case_id,
  h.firm_id,
  h.serial_no,
  h.hearing_date,
  h.next_date,
  h.current_proceeding,
  h.next_proceeding,
  h.judge_name          AS hearing_judge,
  h.court_no            AS hearing_court_no,

  -- Case fields
  c.case_ref_no,
  c.plaintiff_name,
  c.defendant_name,
  c.From,
  c.status              AS case_status,
  c.judge_name          AS case_judge,
  c.court_no            AS case_court_no,

  -- Client
  cl.full_name          AS client_name,
  cl.phone              AS client_phone,

  -- Case type
  ct.name               AS case_type_name,
  ct.requires_offence,

  -- Previous date: max hearing_date from same case BEFORE this hearing
  (
    SELECT MAX(h2.hearing_date)
    FROM public.hearings h2
    WHERE h2.case_id = h.case_id
      AND h2.hearing_date < h.hearing_date
  )                     AS previous_date,

  -- Is this the latest hearing for the case?
  (h.hearing_date = (
    SELECT MAX(h3.hearing_date)
    FROM public.hearings h3
    WHERE h3.case_id = h.case_id
  ))                    AS is_latest_hearing

FROM public.hearings   h
JOIN public.cases      c  ON c.id  = h.case_id
JOIN public.clients    cl ON cl.id = c.client_id
JOIN public.case_types ct ON ct.id = c.case_type_id;

COMMENT ON VIEW public.v_cause_list IS
  'Joined view for cause list and running cases. Filter: hearing_date = today for cause list; is_latest_hearing = true for running cases.';

-- RLS on view: inherit from underlying tables via security_invoker
ALTER VIEW public.v_cause_list SET (security_invoker = true);

-- =============================================================================
-- TASK 5 — STORAGE BUCKET (run separately or via dashboard)
-- =============================================================================
-- Supabase Storage buckets cannot be created in SQL migrations directly.
-- Run this block in the Supabase Dashboard → SQL Editor AFTER migration:
--
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'documents', 'documents', false,
--   52428800,   -- 50 MB
--   ARRAY['application/pdf','image/jpeg','image/png','image/webp',
--         'application/msword',
--         'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
-- ) ON CONFLICT DO NOTHING;
--
-- -- Storage RLS
-- CREATE POLICY "firm upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'documents' AND auth.uid() IS NOT NULL AND
--     (storage.foldername(name))[1] = public.current_firm_id()::TEXT
--   );
--
-- CREATE POLICY "firm read"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'documents' AND auth.uid() IS NOT NULL AND
--     (storage.foldername(name))[1] = public.current_firm_id()::TEXT
--   );
--
-- CREATE POLICY "admin delete"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'documents' AND public.is_admin_or_above() AND
--     (storage.foldername(name))[1] = public.current_firm_id()::TEXT
--   );
