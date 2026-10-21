NobatYar admin catalog update

1. Back up Neon database.
2. Run Backend/sql/2026-10-admin-catalog.sql ONCE in the Neon SQL Editor, using the same database as the backend. This adds the medical_specialties table and initial values. It does not delete existing data.
3. Replace ONLY the listed files, retaining .env and other files.
4. In Frontend run npm run build before committing.
5. git add . && git commit -m "Add admin catalog management" && git push origin main
6. Confirm both Vercel deployments are Ready.

Important: Doctors now must select an existing hospital from the database; add a hospital before registering a doctor. Approved/rejected requests no longer show in the admin requests view, but stay in the database for audit. Deleting doctors with appointments is blocked; deleting hospitals with doctors is blocked; deleting specialties in use is blocked.

Test limitation: Node syntax check passed; frontend build and live Neon tests were not completed here.
