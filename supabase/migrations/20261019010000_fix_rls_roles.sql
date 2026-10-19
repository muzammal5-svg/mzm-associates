CREATE OR REPLACE FUNCTION public.is_lawyer_or_above()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT role IN ('super_admin','admin','lawyer') FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- clients
DROP POLICY IF EXISTS "lawyer+ inserts clients" ON public.clients;
CREATE POLICY "lawyer+ inserts clients" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_lawyer_or_above());
DROP POLICY IF EXISTS "lawyer+ updates clients" ON public.clients;
CREATE POLICY "lawyer+ updates clients" ON public.clients FOR UPDATE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_lawyer_or_above())
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_lawyer_or_above());
DROP POLICY IF EXISTS "admin deletes clients" ON public.clients;
CREATE POLICY "admin deletes clients" ON public.clients FOR DELETE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_admin_or_above());

-- cases
DROP POLICY IF EXISTS "lawyer+ inserts cases" ON public.cases;
CREATE POLICY "lawyer+ inserts cases" ON public.cases FOR INSERT TO authenticated
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_lawyer_or_above());
DROP POLICY IF EXISTS "lawyer+ updates cases" ON public.cases;
CREATE POLICY "lawyer+ updates cases" ON public.cases FOR UPDATE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_lawyer_or_above())
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_lawyer_or_above());
DROP POLICY IF EXISTS "admin deletes cases" ON public.cases;
CREATE POLICY "admin deletes cases" ON public.cases FOR DELETE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_admin_or_above());

-- hearings
DROP POLICY IF EXISTS "all firm members insert hearings" ON public.hearings;
CREATE POLICY "all firm members insert hearings" ON public.hearings FOR INSERT TO authenticated
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id));
DROP POLICY IF EXISTS "lawyer+ updates hearings" ON public.hearings;
CREATE POLICY "lawyer+ updates hearings" ON public.hearings FOR UPDATE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_lawyer_or_above())
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_lawyer_or_above());
DROP POLICY IF EXISTS "admin deletes hearings" ON public.hearings;
CREATE POLICY "admin deletes hearings" ON public.hearings FOR DELETE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_admin_or_above());

-- documents
DROP POLICY IF EXISTS "firm members upload documents" ON public.documents;
CREATE POLICY "firm members upload documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (firm_id = public.current_firm_id() AND public.write_access(firm_id));
DROP POLICY IF EXISTS "admin deletes documents" ON public.documents;
CREATE POLICY "admin deletes documents" ON public.documents FOR DELETE TO authenticated
  USING (firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_admin_or_above());
