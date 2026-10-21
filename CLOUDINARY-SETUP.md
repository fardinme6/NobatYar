# NobatYar — Cloudinary profile photos

## Vercel Backend

Add these variables to the **Backend** project (Production):

- `CLOUDINARY_CLOUD_NAME` (Config)
- `CLOUDINARY_API_KEY` (Secret)
- `CLOUDINARY_API_SECRET` (Secret)

Never place the API secret in the frontend, `.env` committed to Git, or chat messages.

Deploy the backend after pushing the changed code. The frontend must also be redeployed because avatar rendering was updated.

## Local development

Put the same three variables in `Backend/.env` (keep it private). Keep the existing `DATABASE_URL`, `JWT_SECRET`, and `FRONTEND_URL` settings. `npm run dev` continues to run locally.

## How it works

Profile photos are checked for JPEG/PNG/WebP signatures, limited to 1 MB, uploaded via the authenticated backend to Cloudinary, and the HTTPS URL is saved in PostgreSQL. Old Cloudinary avatars are deleted after a successful replacement. Other backend routes and database schema are unchanged.

**Private provider documents** are not sent to Cloudinary by this patch; Vercel still needs a dedicated private document storage solution. Public profile photos should not contain medical or confidential information.

## Future changes

Cloudinary logic lives in `Backend/src/cloudinary.js`; the upload routes remain in `Backend/src/server.js`. You can change other backend features independently. Commit changes to GitHub and Vercel will rebuild. Avoid deleting existing environment variables and keep database migrations separate.
