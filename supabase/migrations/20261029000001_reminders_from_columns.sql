-- Add "from" and "from_party" columns to reminders table for custom from input
ALTER TABLE public.reminders 
ADD COLUMN IF NOT EXISTS "from" TEXT,
ADD COLUMN IF NOT EXISTS from_party TEXT;
