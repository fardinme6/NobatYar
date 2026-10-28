-- Run once in Neon SQL Editor before deploying the backend.
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS phone VARCHAR(40) NOT NULL DEFAULT '';
-- Existing doctors must be assigned a real phone number through the admin panel.
-- New doctor records require a phone number at the API level.
