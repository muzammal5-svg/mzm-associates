-- Allow anonymous/public reads of plans and payment_accounts (landing + pricing)
DROP POLICY IF EXISTS "plans_read_anon" ON public.plans;
CREATE POLICY "plans_read_anon" ON public.plans FOR SELECT TO anon USING (TRUE);

DROP POLICY IF EXISTS "accounts_read_anon" ON public.payment_accounts;
CREATE POLICY "accounts_read_anon" ON public.payment_accounts FOR SELECT TO anon USING (TRUE);