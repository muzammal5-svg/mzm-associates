-- Production seed (idempotent, no demo users, no DELETE)
INSERT INTO public.app_settings (key, value) VALUES
  ('trial_enabled', 'true'::jsonb),
  ('trial_days', '7'::jsonb),
  ('grace_days', '3'::jsonb),
  ('reminder_days', '7'::jsonb),
  ('currency', '"PKR"'::jsonb),
  ('whatsapp_number', '""'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.plans (code, name, duration_months, price_pkr, max_users, sort_order) VALUES
  ('monthly', 'Monthly', 1, 1000, 5, 1),
  ('six_month', '6 Months', 6, 5400, 5, 2),
  ('yearly', 'Yearly', 12, 9600, 5, 3)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.payment_accounts (method, account_title, account_number, bank_name, instructions, sort_order) VALUES
  ('bank_transfer', 'MZM Associates', 'REPLACE_ME', 'Bank', 'Transfer and share transaction ID', 1),
  ('jazzcash', 'MZM Associates', 'REPLACE_ME', NULL, 'Send to JazzCash number', 2),
  ('easypaisa', 'MZM Associates', 'REPLACE_ME', NULL, 'Send to Easypaisa number', 3)
ON CONFLICT DO NOTHING;
