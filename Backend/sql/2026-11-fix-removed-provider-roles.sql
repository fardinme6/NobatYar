UPDATE public.users
SET role = 'provider', account_disabled = true
WHERE role = 'patient'
  AND email LIKE 'removed-provider-%@disabled.nobatyar.invalid';
