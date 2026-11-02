-- Ensure Essential Court Forms (category = 'important') can be viewed and downloaded
-- by all authenticated users, while ONLY super_admin can insert or delete them.

-- 1. Permissive SELECT on public.documents: allow all authenticated users to read category='important'
DROP POLICY IF EXISTS "firm members read documents" ON public.documents;
CREATE POLICY "firm members read documents" ON public.documents FOR SELECT TO authenticated
  USING (
    category = 'important'
    OR (firm_id IS NOT NULL AND firm_id = public.current_firm_id() AND public.read_access(firm_id))
    OR public.is_super_admin()
  );

-- 2. Permissive INSERT on public.documents: ONLY super_admin can insert category='important'
DROP POLICY IF EXISTS "firm members upload documents" ON public.documents;
CREATE POLICY "firm members upload documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    (category = 'important' AND public.is_super_admin())
    OR (
      (category IS DISTINCT FROM 'important')
      AND firm_id = public.current_firm_id()
      AND public.write_access(firm_id)
    )
    OR public.is_super_admin()
  );

-- 3. Permissive DELETE on public.documents: ONLY super_admin can delete category='important'
DROP POLICY IF EXISTS "admin deletes documents" ON public.documents;
CREATE POLICY "admin deletes documents" ON public.documents FOR DELETE TO authenticated
  USING (
    (category = 'important' AND public.is_super_admin())
    OR (
      (category IS DISTINCT FROM 'important')
      AND firm_id = public.current_firm_id()
      AND public.write_access(firm_id)
      AND public.is_admin_or_above()
    )
    OR public.is_super_admin()
  );

-- 4. Storage objects SELECT (Permissive): allow reading essential court form files
DROP POLICY IF EXISTS "firm documents read" ON storage.objects;
CREATE POLICY "firm documents read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      (storage.foldername(name))[1] = public.current_firm_id()::TEXT
      OR (storage.foldername(name))[1] IN ('super_admin', 'essential_forms', '00000000-0000-0000-0000-000000000099')
      OR EXISTS (SELECT 1 FROM public.documents d WHERE d.file_path = storage.objects.name AND d.category = 'important')
      OR public.is_super_admin()
    )
  );

-- 5. Storage objects SELECT (Restrictive guard): allow reading essential court form files
DROP POLICY IF EXISTS "stage2 firm documents select guard" ON storage.objects;
CREATE POLICY "stage2 firm documents select guard"
  ON storage.objects AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    bucket_id <> 'documents'
    OR (storage.foldername(name))[1] = public.current_firm_id()::TEXT
    OR (storage.foldername(name))[1] IN ('super_admin', 'essential_forms', '00000000-0000-0000-0000-000000000099')
    OR EXISTS (SELECT 1 FROM public.documents d WHERE d.file_path = storage.objects.name AND d.category = 'important')
    OR public.is_super_admin()
  );
