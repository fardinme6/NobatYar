# NobatYar — Development update

This package is a **development implementation, not a production-ready medical booking system**. It preserves the existing frontend components except for ProviderRegistration, AdminDashboard, App routes, translations and the new ProviderDashboard. It extends the Express API and SQL schema. No live PostgreSQL tests or full Vite build were possible in this environment. JS/JSX syntax was checked.

## Install / migration

1. **Back up** the current Frontend, Backend, PostgreSQL database and uploaded photos.
2. Copy the Frontend and Backend code from this ZIP to your project, but **preserve your original Backend/.env and Backend/uploads**. Never put `.env` in Git.
3. Make sure Postgres.app is running and `.env` has PORT=5001, DATABASE_URL, JWT_SECRET and FRONTEND_URL=http://localhost:5173.
4. From Backend: `npm install`, `npm run db:setup`, `npm run dev`.
5. From Frontend: `npm install`, `npm run dev`.
6. Test registration, admin request approval/rejection, provider dashboard, contact inbox, appointment bookings and photo upload on a disposable test database before production.

## Implemented in this update

- Separate doctor/hospital/clinic registration radios and localized name prefixes in request history and admin review.
- Request decision with mandatory rejection reason, review timestamp and reviewer, stored in PostgreSQL.
- Auto-created provider profile upon approval (for an account) and provider role, separate Provider Dashboard at `/provider-dashboard`.
- Admin Dashboard with provider request review, contact inbox and reply *notes*, appointments, provider activation/deactivation, doctor schedule and days off.
- Provider Dashboard to edit approved provider profile and see assigned appointments.
- Private PDF document upload (5 MB) and admin-only retrieval. Documents are not served publicly.
- Doctor schedule validation for slots with a configured schedule, doctor days off and database unique active-slot index (capacity **one** per time slot).
- Translations of new UI in English, Dari and Pashto.

## Still required before real-world public use

- Google and Apple login **are not implemented**: they require valid OAuth client IDs, Apple Developer configuration, redirect URI validation and account-linking flows. Do not add fake buttons.
- Email verification and password-reset **are not implemented**: require transactional email provider/SMTP configuration, secure token flow, and UI. The existing email-change feature verifies the current password but does not verify the new mailbox.
- Admin inbox `Save reply note` stores the response in PostgreSQL **but does not send email**. Set up a mail provider before claiming email delivery.
- Approved providers are **not automatically mapped to the pre-seeded doctors**. For a provider to manage appointments of a doctor, an admin must associate `provider_profiles.id` with `doctors.id` in `provider_doctors`. A dedicated UI for this is still needed.
- Appointment capacity is one per slot, despite the schedule table including a `capacity` field. Multi-capacity booking is not implemented.
- No production tests, privacy compliance review, monitoring, backup automation, or deployment hardening. Handle patient information carefully.
- New providers' records are not automatically published in the public Doctors/Hospitals lists; editorial approval/publishing remains to be built.
- Account session revocation and robust audit logging remain to be built.

## Security reminders

- Keep `Backend/.env` secret and out of Git. This archive intentionally excludes it and excludes `node_modules` and existing uploads.
- Run behind HTTPS in production; set `COOKIE_SECURE=true` and proper origin/cookie settings.
- Never run destructive SQL against real patient data without a tested backup.
