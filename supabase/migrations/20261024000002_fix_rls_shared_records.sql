-- Fix RLS so firm members can see super_admin's shared records (firm_id = NULL)

-- ─── Case Laws: allow all authenticated users to view super_admin's NULL firm_id records ───
DROP POLICY IF EXISTS "case_laws_read" ON public.case_laws;
CREATE POLICY "case_laws_read" ON public.case_laws FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR firm_id = public.current_firm_id()
    OR firm_id IS NULL
  );

-- ─── Documents: allow all authenticated users to view super_admin's NULL firm_id records ───
DROP POLICY IF EXISTS "firm members read documents" ON public.documents;
CREATE POLICY "firm members read documents" ON public.documents FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR firm_id = public.current_firm_id()
    OR firm_id IS NULL
  );
