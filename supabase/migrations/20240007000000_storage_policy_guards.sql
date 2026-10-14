-- Restrictive policies constrain any existing permissive storage policies.
-- PostgreSQL combines restrictive policies with AND, preventing a legacy
-- broad policy from granting cross-firm document access or clerk deletion.
DROP POLICY IF EXISTS "stage2 firm documents select guard" ON storage.objects;
CREATE POLICY "stage2 firm documents select guard"
  ON storage.objects AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    bucket_id <> 'documents'
    OR (storage.foldername(name))[1] = public.current_firm_id()::TEXT
  );

DROP POLICY IF EXISTS "stage2 firm documents insert guard" ON storage.objects;
CREATE POLICY "stage2 firm documents insert guard"
  ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id <> 'documents'
    OR (storage.foldername(name))[1] = public.current_firm_id()::TEXT
  );

DROP POLICY IF EXISTS "stage2 firm documents update guard" ON storage.objects;
CREATE POLICY "stage2 firm documents update guard"
  ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    bucket_id <> 'documents'
    OR (
      (storage.foldername(name))[1] = public.current_firm_id()::TEXT
      AND public.current_role() IN ('super_admin', 'admin', 'lawyer')
    )
  )
  WITH CHECK (
    bucket_id <> 'documents'
    OR (
      (storage.foldername(name))[1] = public.current_firm_id()::TEXT
      AND public.current_role() IN ('super_admin', 'admin', 'lawyer')
    )
  );

DROP POLICY IF EXISTS "stage2 firm documents delete guard" ON storage.objects;
CREATE POLICY "stage2 firm documents delete guard"
  ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated
  USING (
    bucket_id <> 'documents'
    OR (
      (storage.foldername(name))[1] = public.current_firm_id()::TEXT
      AND public.is_admin_or_above()
    )
  );

DROP POLICY IF EXISTS "stage2 avatars insert guard" ON storage.objects;
CREATE POLICY "stage2 avatars insert guard"
  ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id <> 'avatars'
    OR (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "stage2 avatars update guard" ON storage.objects;
CREATE POLICY "stage2 avatars update guard"
  ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    bucket_id <> 'avatars'
    OR (storage.foldername(name))[1] = auth.uid()::TEXT
  )
  WITH CHECK (
    bucket_id <> 'avatars'
    OR (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "stage2 avatars delete guard" ON storage.objects;
CREATE POLICY "stage2 avatars delete guard"
  ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated
  USING (
    bucket_id <> 'avatars'
    OR (storage.foldername(name))[1] = auth.uid()::TEXT
  );
