-- Payment account details (bank / JazzCash / Easypaisa numbers) are only needed on /billing,
-- which is an authenticated screen. Drop the anon read added for the old public pricing page.
DROP POLICY IF EXISTS "accounts_read_anon" ON public.payment_accounts;

-- Authenticated-only read, restated explicitly so the intent survives a re-run.
DROP POLICY IF EXISTS "accounts_read" ON public.payment_accounts;
CREATE POLICY "accounts_read" ON public.payment_accounts FOR SELECT TO authenticated USING (TRUE);

-- plans keeps its anon read (plans_read_anon from 20261019040000_public_reads):
-- /pricing and the landing page render plan names/prices without a session.
