-- ─── Case Laws module ──────────────────────────────────────────────────────────

-- Case laws table — firm-scoped, writable only by super_admin
CREATE TABLE IF NOT EXISTS public.case_laws (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firm_id     UUID NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  law_report  TEXT NOT NULL,        -- e.g. MLD, PLD, SCMR
  year        INTEGER NOT NULL,     -- e.g. 2024
  page_no     INTEGER NOT NULL,     -- e.g. 279
  case_title  TEXT NOT NULL,        -- e.g. Bail Cancellation
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_laws_firm       ON public.case_laws(firm_id);
CREATE INDEX IF NOT EXISTS idx_case_laws_law_report ON public.case_laws(law_report);
CREATE INDEX IF NOT EXISTS idx_case_laws_year       ON public.case_laws(year);

-- RLS: firm-scoped read for all authenticated users
ALTER TABLE public.case_laws ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "case_laws_read" ON public.case_laws;
CREATE POLICY "case_laws_read" ON public.case_laws FOR SELECT TO authenticated
  USING (firm_id = public.current_firm_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "case_laws_insert" ON public.case_laws;
CREATE POLICY "case_laws_insert" ON public.case_laws FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "case_laws_update" ON public.case_laws;
CREATE POLICY "case_laws_update" ON public.case_laws FOR UPDATE TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "case_laws_delete" ON public.case_laws;
CREATE POLICY "case_laws_delete" ON public.case_laws FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- updated_at trigger
DO $$ BEGIN
  CREATE TRIGGER trg_case_laws_updated_at BEFORE UPDATE ON public.case_laws FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
