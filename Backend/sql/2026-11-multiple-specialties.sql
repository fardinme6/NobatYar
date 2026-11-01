-- Run once in Neon SQL Editor before deploying the new code.
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialty_values text[] NOT NULL DEFAULT '{}';
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS specialty_values text[] NOT NULL DEFAULT '{}';
UPDATE doctors SET specialty_values = ARRAY[specialty_value] WHERE cardinality(specialty_values)=0 AND specialty_value IS NOT NULL;
-- Assign hospital specialties manually in the admin panel after deployment.
