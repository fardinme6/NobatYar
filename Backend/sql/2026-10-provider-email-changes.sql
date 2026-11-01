CREATE TABLE IF NOT EXISTS public.provider_email_changes (
 user_id BIGINT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
 new_email VARCHAR(254) NOT NULL,
 token_hash TEXT NOT NULL UNIQUE,
 expires_at TIMESTAMPTZ NOT NULL
);
