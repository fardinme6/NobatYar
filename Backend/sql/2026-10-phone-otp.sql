-- Run only after reviewing a Neon backup. Existing users and provider accounts remain intact.
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS users_verified_phone_unique ON users(phone) WHERE phone_verified = TRUE AND phone <> '';
CREATE TABLE IF NOT EXISTS pending_phone_signups (
 phone VARCHAR(20) PRIMARY KEY,
 name VARCHAR(120) NOT NULL,
 email VARCHAR(254),
 password_hash TEXT NOT NULL,
 pin_id TEXT NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0,
 sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 expires_at TIMESTAMPTZ NOT NULL
);
