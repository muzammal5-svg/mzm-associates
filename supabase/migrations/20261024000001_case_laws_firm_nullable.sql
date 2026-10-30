-- ─── Case Laws module — firm_id nullable for super_admin ─────────────────────────

-- Make firm_id nullable so super_admin (no firm) can insert case laws
ALTER TABLE public.case_laws ALTER COLUMN firm_id DROP NOT NULL;

-- Update RLS insert policy to allow NULL firm_id for super_admin
DROP POLICY IF EXISTS "case_laws_insert" ON public.case_laws;
CREATE POLICY "case_laws_insert" ON public.case_laws FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR (firm_id = public.current_firm_id() AND public.write_access(firm_id))
  );

-- Update RLS select policy — super_admin sees all, others see firm-scoped
DROP POLICY IF EXISTS "case_laws_read" ON public.case_laws;
CREATE POLICY "case_laws_read" ON public.case_laws FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR firm_id = public.current_firm_id()
  );
