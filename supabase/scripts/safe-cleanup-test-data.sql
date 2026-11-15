-- ==============================================================================
-- MZM Associates: Safe Test Data Cleanup Script (SQL)
-- ==============================================================================
-- IMPORTANT:
-- This script safely removes TEST DATA from application tables and storage.
-- It strictly PRESERVES:
--   1. Super Admin account (super@platform.test)
--   2. Primary Firm Admin account (admin@mzm.pk)
--   3. Client/Advocate account (muhammad.zahidmuneer@gmail.com)
--   4. Standard Core Team demo accounts (lawyer@mzm.pk, clerk@mzm.pk)
--   5. Core Platform & Firm records ('Platform Admin', 'MZM & Associates')
--   6. System configuration: plans, payment_accounts, case_types, courts, app_settings
-- ==============================================================================

BEGIN;

-- 1. Remove files from storage objects for documents and payment slips
DELETE FROM storage.objects
WHERE bucket_id IN ('documents', 'payment-slips');

-- 2. Clear case-level child records
DELETE FROM public.case_activity_log;
DELETE FROM public.case_notes;
DELETE FROM public.hearings;

-- 3. Clear reminders and documents
DELETE FROM public.reminders;
DELETE FROM public.documents;

-- 4. Clear cases and clients
DELETE FROM public.cases;
DELETE FROM public.clients;

-- 5. Clear test billing, payments, and events
DELETE FROM public.payments;
DELETE FROM public.billing_events;

-- 6. Clean subscriptions for test firms (preserving MZM & Associates active subscription)
DELETE FROM public.subscriptions
WHERE firm_id NOT IN (
  'f0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000099'
);

-- Ensure MZM & Associates has a valid active subscription
INSERT INTO public.subscriptions (
  firm_id, plan_id, status, starts_at, ends_at
)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  NULL,
  'active',
  NOW(),
  NOW() + INTERVAL '1 year'
)
ON CONFLICT (id) DO NOTHING;

-- 7. Clear notifications and devices for deleted sessions
DELETE FROM public.notifications;
DELETE FROM public.device_tokens
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE email IN (
    'super@platform.test',
    'admin@mzm.pk',
    'muhammad.zahidmuneer@gmail.com',
    'lawyer@mzm.pk',
    'clerk@mzm.pk'
  )
);

DELETE FROM public.user_devices
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE email IN (
    'super@platform.test',
    'admin@mzm.pk',
    'muhammad.zahidmuneer@gmail.com',
    'lawyer@mzm.pk',
    'clerk@mzm.pk'
  )
);

DELETE FROM public.push_subscriptions
WHERE user_id NOT IN (
  SELECT id FROM public.profiles WHERE email IN (
    'super@platform.test',
    'admin@mzm.pk',
    'muhammad.zahidmuneer@gmail.com',
    'lawyer@mzm.pk',
    'clerk@mzm.pk'
  )
);

-- 8. Remove test user profiles (preserving core admins)
DELETE FROM public.profiles
WHERE email NOT IN (
  'super@platform.test',
  'admin@mzm.pk',
  'muhammad.zahidmuneer@gmail.com',
  'lawyer@mzm.pk',
  'clerk@mzm.pk'
);

-- 9. Remove test firms (preserving Platform Admin and MZM & Associates)
UPDATE public.firms SET owner_id = NULL
WHERE id NOT IN (
  'f0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000099'
);

DELETE FROM public.firms
WHERE id NOT IN (
  'f0000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000099'
);

-- 10. In auth.users, remove test users created during automated testing
DELETE FROM auth.users
WHERE email NOT IN (
  'super@platform.test',
  'admin@mzm.pk',
  'muhammad.zahidmuneer@gmail.com',
  'lawyer@mzm.pk',
  'clerk@mzm.pk'
);

COMMIT;
