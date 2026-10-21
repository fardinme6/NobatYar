# NobatYar – deployment and remaining requirements

## Deploying React to Vercel
1. Push the Frontend directory to a **private** Git repository (do not commit `.env` or private patient information).
2. In Vercel, import the repository. Root Directory: `Frontend`. Framework: Vite. Build command: `npm run build`. Output: `dist`.
3. Add `VITE_API_URL=https://api.yourdomain.com` in Vercel environment variables and redeploy.
4. Add your domain in Vercel Domains and follow the displayed DNS records. HTTPS certificates are provisioned after DNS validation.

## Deploying the Express backend
Use a persistent Node.js host such as Render/Railway, not Vercel serverless with the current filesystem-based uploads. Set Root Directory `Backend`, build `npm install`, start `npm start`. Attach a managed PostgreSQL database and configure `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL=https://yourdomain.com`, `NODE_ENV=production`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=lax` (same-site subdomains), and SMTP variables. Set `PORT` only if required by host.

Run `npm run db:setup` once against the hosted database (back up first). The `db:setup` script also seeds demo doctors and hospitals; remove demo records before launch and review the migration before running on production data.

### Critical blockers to a public healthcare launch
- **Do not deploy uploads in production as-is**: avatars and sensitive provider PDFs are stored on the local filesystem, which may be ephemeral. Move them to private object storage with access-controlled retrieval, malware scanning and retention policies.
- Google and Apple OAuth are **not implemented** in this package. Both require registered OAuth applications, redirect URLs, keys and production testing. Do not add fake sign-in buttons.
- Email verification and password reset APIs and pages are implemented, but require SMTP credentials, a verified sending domain and testing. Set `REQUIRE_VERIFIED_EMAIL=true` only after existing users are verified and email delivery is working.
- Cookie JWT logout clears the browser cookie but does not revoke stolen tokens. Add a revocable server-side session store, session rotation and logout-all-sessions before public release.
- Appointment scheduling currently uses the doctor's date and time and a database uniqueness constraint for one patient per slot. Capacity >1 is not supported; schedule timezone and past-time checks need validation in the clinic's local timezone.
- Review consent, minimum patient data collection, admin access to patient information, backups, disaster recovery, privacy notice, deletion requests, audit logging and applicable local healthcare privacy requirements with a qualified professional.
- Run automated integration/security tests against a staging database and perform manual user acceptance tests. **No end-to-end production test has been performed here.**

### Commands
Frontend: `npm install && npm run build`.
Backend: `npm install && npm run db:setup && npm start`.

The existing frontend components are preserved except for three simple account recovery routes and a password recovery link. No domain, cloud database, SMTP provider, or OAuth credentials are supplied or activated by this ZIP.
