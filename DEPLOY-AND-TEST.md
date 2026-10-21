# NobatYar — Provider registration fixes

## What was changed

- All three provider types (doctor, hospital, clinic) require a JPG/PNG/WebP photo under 3 MB. The photo is uploaded to Cloudinary.
- The optional document upload call was removed from this form: Vercel does not provide persistent private file storage. **Private verification documents are NOT implemented**; do not collect sensitive documents until secure private storage is added.
- Administrators can submit this form and publish the card immediately, without an approval step. This does not turn their admin account into a provider account.
- Non-admin users submit a pending request. Approval creates the corresponding doctor or hospital/clinic card and provider profile in one database transaction. Rejected requests remain in the Rejected tab.
- The Hospitals page and hospital details pages can load published hospital/clinic records from the API.
- The registration page offers Login and Sign Up links for visitors without an account.

## Replace only these files

- Backend/src/server.js
- Frontend/src/pages/ProviderRegistration.jsx
- Frontend/src/components/Hospitals.jsx
- Frontend/src/pages/hospitalDetails.jsx
- Frontend/src/pages/HospitalDoctors.jsx

Do not replace .env or any existing local configuration. Keep your own package files.

## Deploy

Run `npm run build` inside Frontend first. Then from the project root run `git add .`, `git commit -m "Fix provider registration and approval"`, and `git push origin main`. Both Vercel projects must be connected to main. No database schema migration is required for these changes.

## Doctor data in Neon

The ZIP cannot directly edit your Neon database. `NEON-DOCTOR-RECOVERY.sql` contains inspection queries and an idempotent restore of the original Khaliq Monib card. **It does not delete Fardin Mehry.** To remove that test doctor safely, first inspect doctor ID, associated appointments, provider profiles and requests. Do not delete the admin user.

## Test checklist

1. With a test account, submit a doctor with a valid photo, specialty, city and address. Confirm Pending in Admin.
2. Approve and verify the card on Doctors, with the uploaded image.
3. Reject a different request and verify it appears in Rejected.
4. As Admin, submit a doctor or hospital and verify its card appears without approval.
5. Open a published hospital card and its details page.
6. Test signup/login links while logged out.

**Limitations:** Production Cloudinary/Neon/Vercel integration has not been tested in this environment. Frontend build could not be run here because the npm offline cache lacks required packages. Any runtime error should be diagnosed using Vercel Backend Logs and browser Network Response.
