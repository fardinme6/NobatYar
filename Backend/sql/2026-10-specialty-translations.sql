-- Run once in Neon SQL Editor before deploying specialty translation support.
-- Existing rows and translations are preserved.
ALTER TABLE profile_translations DROP CONSTRAINT IF EXISTS profile_translations_kind_check;
ALTER TABLE profile_translations ADD CONSTRAINT profile_translations_kind_check
  CHECK (kind IN ('doctor', 'hospital', 'specialty'));
