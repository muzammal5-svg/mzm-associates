-- =============================================================================
-- Migration 20261018000000: Add permissive storage policies for avatars bucket
-- =============================================================================
-- The avatars bucket previously had only RESTRICTIVE policies
-- (see 20240007000000_storage_policy_guards.sql). Restrictive policies can
-- only restrict access; they cannot grant it. Without a matching PERMISSIVE
-- INSERT policy, every avatar upload was rejected with:
--   "new row violates row-level security policy" (HTTP 403/400)
--
-- This migration adds the missing permissive policies so authenticated users
-- can upload/select/update avatars under their own folder ({user_id}/...).
-- It works together with the existing restrictive guards, which still block
-- cross-firm / cross-user access.
--
-- APPLY MANUALLY: Supabase Dashboard → SQL Editor → paste and run.
-- (Supabase CLI db push is blocked in this environment by missing
--  database_write permission on the access token.)
-- =============================================================================

DO $$ BEGIN
  BEGIN CREATE POLICY "avatars insert own folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN CREATE POLICY "avatars update own folder" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT) WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT); EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN CREATE POLICY "avatars select own folder" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT); EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
