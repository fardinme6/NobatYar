CREATE TABLE IF NOT EXISTS profile_translations (
 kind TEXT NOT NULL CHECK (kind IN ('doctor','hospital','specialty')),
 profile_id INTEGER NOT NULL,
 translations JSONB NOT NULL DEFAULT '{}'::jsonb,
 source_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
 approved BOOLEAN NOT NULL DEFAULT false,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY (kind,profile_id)
);
