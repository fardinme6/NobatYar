# NobatYar deployment preparation — not a production security certification

## What changed
- Frontend API URL is configured by `VITE_API_URL`, defaulting to localhost for development.
- Header avatar now uses the same configured API origin.
- Added backend `/api/ready` for checking PostgreSQL connectivity.
- Added backend Dockerfile, frontend SPA redirect file, and `.env.example` templates.
- Enabled Express proxy awareness in production for reverse-proxy hosting.

## Before public launch — REQUIRED
1. Choose frontend and backend hosting, a managed PostgreSQL database, and a permanent private object-storage provider for avatar/document uploads. **Current local `uploads/` files are not persistent on ephemeral hosting.**
2. Configure HTTPS on frontend and API. Set `VITE_API_URL=https://api.your-domain.com` at frontend **build** time. Set `FRONTEND_URL=https://your-domain.com` on backend.
3. Set a strong randomly generated `JWT_SECRET` (e.g. `openssl rand -hex 32`), `DATABASE_URL`, `NODE_ENV=production`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=lax` for same-site subdomains. Never commit `.env`.
4. Create PostgreSQL database and run `npm run db:setup` against it. Verify `/api/ready`. Back up database before running migrations on existing data.
5. Configure domain DNS, HTTPS and frontend SPA route fallback. Deploy backend with `npm start`, frontend with `npm run build` and publish `dist/`.
6. Configure transactional email and implement verified email, password reset and email-change verification. These are **not complete** in this archive.
7. Configure Google/Apple OAuth with actual provider client IDs, redirect URIs, secrets and account linking. These are **not implemented** in this archive.
8. Implement durable private object storage, virus/file-signature checking, private document access, and backup/restore procedures.
9. Security-review authorization for provider/admin routes, session revocation, rate limits, CSRF protections, audit logs, and personal/medical data collection.
10. Verify working hours, capacity, booking concurrency, cancellation rules, timezone behavior and test with simultaneous reservations.
11. Run end-to-end browser tests, database tests, accessibility and mobile checks, then conduct security assessment.

## Local testing
- Backend: `npm install && npm run db:setup && npm run dev`
- Frontend: `npm install && npm run build && npm run dev`
- Health: `/api/health`; database readiness: `/api/ready`

## Deployment architecture
Frontend (static HTTPS) -> Backend (HTTPS API) -> Managed PostgreSQL; uploaded media -> private durable storage.

**Do not upload real patient records or advertise production readiness until all REQUIRED items are implemented and tested.**
