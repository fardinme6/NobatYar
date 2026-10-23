-- Safe additive migration. Run once on the correct Neon branch before deploying code.
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS email TEXT;
