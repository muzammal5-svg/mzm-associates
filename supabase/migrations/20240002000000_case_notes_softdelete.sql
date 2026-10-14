-- =============================================================================
-- Migration 002: case_notes table + soft-delete on cases
-- =============================================================================

-- ─── Soft-delete column on cases ─────────────────────────────────────────────
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS
  deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index so queries that exclude soft-deleted rows stay fast
CREATE INDEX IF NOT EXISTS idx_cases_deleted_at
  ON public.cases (deleted_at) WHERE deleted_at IS NULL;

-- ─── Case Notes ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_notes (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id     UUID        NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  firm_id     UUID        NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  body        TEXT        NOT NULL,
  created_by  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case
  ON public.case_notes (case_id, created_at DESC);

CREATE TRIGGER trg_case_notes_updated_at
  BEFORE UPDATE ON public.case_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS on case_notes ────────────────────────────────────────────────────────
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "firm members read notes"
  ON public.case_notes FOR SELECT
  USING (firm_id = public.current_firm_id());

CREATE POLICY "firm members insert notes"
  ON public.case_notes FOR INSERT
  WITH CHECK (firm_id = public.current_firm_id());

CREATE POLICY "author or admin update notes"
  ON public.case_notes FOR UPDATE
  USING (
    firm_id = public.current_firm_id() AND
    (created_by = auth.uid() OR public.is_admin_or_above())
  );

CREATE POLICY "admin deletes notes"
  ON public.case_notes FOR DELETE
  USING (firm_id = public.current_firm_id() AND public.is_admin_or_above());

-- ─── Update v_cause_list to exclude soft-deleted cases ───────────────────────
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
  c.case_ref_no,
  c.plaintiff_name,
  c.defendant_name,
  c.representing,
  c.status              AS case_status,
  c.judge_name          AS case_judge,
  c.court_no            AS case_court_no,
  cl.full_name          AS client_name,
  cl.phone              AS client_phone,
  ct.name               AS case_type_name,
  ct.requires_offence,
  (
    SELECT MAX(h2.hearing_date)
    FROM public.hearings h2
    WHERE h2.case_id = h.case_id
      AND h2.hearing_date < h.hearing_date
  ) AS previous_date,
  (h.hearing_date = (
    SELECT MAX(h3.hearing_date)
    FROM public.hearings h3
    WHERE h3.case_id = h.case_id
  )) AS is_latest_hearing
FROM public.hearings   h
JOIN public.cases      c  ON c.id  = h.case_id  AND c.deleted_at IS NULL
JOIN public.clients    cl ON cl.id = c.client_id
JOIN public.case_types ct ON ct.id = c.case_type_id;

ALTER VIEW public.v_cause_list SET (security_invoker = true);
