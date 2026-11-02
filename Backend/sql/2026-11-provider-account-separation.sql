-- Run once in Neon SQL Editor before deploying the new backend.
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS account_disabled BOOLEAN NOT NULL DEFAULT false;
