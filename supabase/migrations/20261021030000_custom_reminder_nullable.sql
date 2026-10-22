ALTER TABLE public.reminders ALTER COLUMN case_id DROP NOT NULL;
ALTER TABLE public.reminders ALTER COLUMN hearing_id DROP NOT NULL;
ALTER TABLE public.reminders ADD COLUMN IF NOT EXISTS title TEXT;
