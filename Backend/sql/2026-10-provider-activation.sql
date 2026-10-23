-- Execute before deploying the new Backend. Safe additive migration.
CREATE TABLE IF NOT EXISTS public.provider_activation_tokens (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
 token_hash TEXT NOT NULL UNIQUE,
 expires_at TIMESTAMPTZ NOT NULL,
 used_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS provider_activation_user_idx ON public.provider_activation_tokens(user_id);
