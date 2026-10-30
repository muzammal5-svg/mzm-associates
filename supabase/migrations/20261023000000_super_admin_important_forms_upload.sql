-- Allow super_admin to upload/delete documents on Important Forms without firm_id constraint.
-- PostgreSQL RLS: need BOTH a permissive policy to pass AND all restrictive policies to pass.

-- documents.firm_id is NOT NULL — super_admin has no firm. Make it nullable so super_admin uploads work.
ALTER TABLE public.documents ALTER COLUMN firm_id DROP NOT NULL;

-- Add category column to separate Important Forms documents from regular documents
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS category TEXT;
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);

-- ─── Documents table SELECT (needed for insert().select().single()) ──────────────────────

DROP POLICY IF EXISTS "firm members read documents" ON public.documents;
CREATE POLICY "firm members read documents" ON public.documents FOR SELECT TO authenticated
  USING (
    firm_id = public.current_firm_id() AND public.read_access(firm_id)
    OR public.is_super_admin()
  );

-- ─── Storage INSERT ──────────────────────────────────────────────

-- Permissive: allow super_admin to insert into documents bucket regardless of firm folder
DROP POLICY IF EXISTS "firm documents insert" ON storage.objects;
CREATE POLICY "firm documents insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = public.current_firm_id()::TEXT
      OR public.is_super_admin()
    )
  );

-- Restrictive: keep firm guard but allow super_admin bypass
DROP POLICY IF EXISTS "stage2 firm documents insert guard" ON storage.objects;
CREATE POLICY "stage2 firm documents insert guard"
  ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id <> 'documents'
    OR (storage.foldername(name))[1] = public.current_firm_id()::TEXT
    OR public.is_super_admin()
  );

-- ─── Storage DELETE ──────────────────────────────────────────────

-- Permissive: lawyer+ can delete, super_admin bypasses firm folder
DROP POLICY IF EXISTS "firm lawyers and admins delete documents" ON storage.objects;
CREATE POLICY "firm lawyers and admins delete documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_lawyer_or_above()
    AND (
      (storage.foldername(name))[1] = public.current_firm_id()::TEXT
      OR public.is_super_admin()
    )
  );

-- Also update the older admin-only delete policy for consistency
DROP POLICY IF EXISTS "firm admins delete documents" ON storage.objects;
CREATE POLICY "firm admins delete documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_admin_or_above()
    AND (
      (storage.foldername(name))[1] = public.current_firm_id()::TEXT
      OR public.is_super_admin()
    )
  );

-- Restrictive: keep firm guard but allow super_admin bypass
DROP POLICY IF EXISTS "stage2 firm documents delete guard" ON storage.objects;
CREATE POLICY "stage2 firm documents delete guard"
  ON storage.objects AS RESTRICTIVE FOR DELETE TO authenticated
  USING (
    bucket_id <> 'documents'
    OR (
      (storage.foldername(name))[1] = public.current_firm_id()::TEXT
      AND public.current_role() IN ('super_admin', 'admin', 'lawyer')
    )
    OR public.is_super_admin()
  );

-- ─── Documents table INSERT ──────────────────────────────────────

DROP POLICY IF EXISTS "firm members upload documents" ON public.documents;
CREATE POLICY "firm members upload documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    firm_id = public.current_firm_id() AND public.write_access(firm_id)
    OR public.is_super_admin()
  );

-- ─── Documents table DELETE ─────────────────────────────────────

DROP POLICY IF EXISTS "admin deletes documents" ON public.documents;
CREATE POLICY "admin deletes documents" ON public.documents FOR DELETE TO authenticated
  USING (
    firm_id = public.current_firm_id() AND public.write_access(firm_id) AND public.is_admin_or_above()
    OR public.is_super_admin()
  );
