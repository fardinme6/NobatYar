-- Correct legacy provider accounts that were mistakenly reclassified as patients.
-- Preserves disabled status and public doctor/hospital/clinic catalog entries.
UPDATE public.users
SET role = 'provider', account_disabled = true
WHERE role = 'patient'
  AND email LIKE 'removed-provider-%@disabled.nobatyar.invalid';
