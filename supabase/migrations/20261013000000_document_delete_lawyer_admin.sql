-- Allow lawyers and admins to delete firm documents while keeping clerks denied.
-- Replace both permissive and restrictive storage rules so policy composition
-- cannot retain the previous admin-only restriction.
DROP POLICY IF EXISTS "firm admins delete documents" ON storage.objects;
CREATE POLICY "firm lawyers and admins delete documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = public.current_firm_id()::TEXT
    AND public.current_role() IN ('super_admin', 'admin', 'lawyer')
  );

DROP POLICY IF EXISTS "stage2 firm documents delete guard" ON storage.objects;
CREATE POLICY "stage2 firm documents delete guard"
  ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated
  USING (
    bucket_id <> 'documents'
    OR (
      (storage.foldername(name))[1] = public.current_firm_id()::TEXT
      AND public.current_role() IN ('super_admin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "admin deletes documents" ON public.documents;
CREATE POLICY "lawyers and admins delete documents"
  ON public.documents FOR DELETE TO authenticated
  USING (
    firm_id = public.current_firm_id()
    AND public.current_role() IN ('super_admin', 'admin', 'lawyer')
  );