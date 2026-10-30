-- SEC-02: Restore firm-level RLS isolation on documents table.
--
-- The previous migration (20261024000003_fix_rls_unrestricted_read.sql)
-- accidentally set USING (true) on the documents table, allowing ANY
-- authenticated user to read documents belonging to ANY firm — a critical
-- multi-tenant data breach.
--
-- Case laws REMAIN globally readable (USING (true)) because they are an
-- intentionally shared reference library. Documents, however, must be
-- scoped to the reader's own firm via public.current_firm_id().

-- ─── Documents: restore firm-level isolation ────────────────────────────────
DROP POLICY IF EXISTS "firm members read documents" ON public.documents;

CREATE POLICY "firm members read documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (firm_id = public.current_firm_id());

-- ─── Case Laws: intentionally unrestricted (no change needed, documented) ───
-- The "case_laws_read" policy retains USING (true) as case laws are a shared
-- reference library accessible to all authenticated users across all firms.
