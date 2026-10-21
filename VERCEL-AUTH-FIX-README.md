# NobatYar – Vercel authentication update

## What changed

- Frontend requests `/api/...` on its own domain in production. `Frontend/vercel.json` forwards these to the Vercel backend, avoiding cross-site session cookies.
- `Frontend/src/api.js` continues using `http://localhost:5001` locally unless `VITE_API_URL` is provided.
- Admin Dashboard link appears in the desktop profile dropdown and mobile menu for `user.role === "admin"`.
- Existing duplicate-email 409 response is retained; schema adds a case-insensitive unique email index.

## Deploy

1. Copy the updated source files into your existing NobatYar repository. Keep your own `.env` files and local database untouched.
2. Commit and push to GitHub; Vercel should deploy both projects from GitHub.
3. Confirm Frontend Vercel Root Directory is `Frontend` and Backend Root Directory is `Backend`.
4. `Frontend/vercel.json` uses `https://nobatyar-backend.vercel.app` as the backend destination. Change it if the backend domain changes.
5. In Frontend Vercel environment variables, you may delete `VITE_API_URL`; production now uses same-origin `/api` regardless. Redeploy Frontend after code changes.
6. Backend environment `FRONTEND_URL` must match `https://nobat-yar.vercel.app`. Keep `JWT_SECRET` and `DATABASE_URL` only on the Backend.
7. Test `https://nobat-yar.vercel.app/api/health`, login, reload `/profile`, edit profile, logout, and duplicate-email signup.
8. If already signed in before this change, log out and sign in again to create the new first-party cookie.

## Admin role (Neon SQL Editor)

A newly registered account defaults to `patient`. After verifying the account is yours, run this query in Neon SQL Editor, substituting your own registered email:

```sql
UPDATE users SET role = 'admin' WHERE LOWER(email) = LOWER('YOUR_REGISTERED_EMAIL_HERE') RETURNING id, email, role;
```

Only run this for an account you own. Sign out and sign back in to refresh the role in the UI. The Backend already enforces admin authorization server-side. Do not put admin passwords or database credentials in code.

## Email uniqueness

The backend already catches PostgreSQL unique violations and returns HTTP 409 (`Email already registered`). For existing Neon databases, run the following statement separately if the full schema has already been applied:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email));
```

If it fails due to duplicate emails differing only by case, review the duplicate accounts first rather than deleting them blindly.

## Known limitations

- Avatar and private document uploads require permanent secure object storage and are not solved by this patch.
- Email verification and password reset require a configured email service.
- Test all authentication flows before public launch, especially privacy and access controls for patient information.
