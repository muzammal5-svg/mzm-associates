ALTER TABLE public.cases ALTER COLUMN representing DROP NOT NULL;
ALTER TABLE public.cases ALTER COLUMN representing SET DEFAULT 'plaintiff';
