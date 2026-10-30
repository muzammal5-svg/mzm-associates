-- Fix RLS so ALL authenticated users can view case laws and documents
-- regardless of firm_id. These are shared reference libraries.
-- Write access remains super_admin-only.

-- ─── Case Laws: unrestricted read for all authenticated users ───
DROP POLICY IF EXISTS "case_laws_read" ON public.case_laws;
CREATE POLICY "case_laws_read" ON public.case_laws FOR SELECT TO authenticated
  USING (true);

-- ─── Documents: unrestricted read for all authenticated users ───
DROP POLICY IF EXISTS "firm members read documents" ON public.documents;
CREATE POLICY "firm members read documents" ON public.documents FOR SELECT TO authenticated
  USING (true);
