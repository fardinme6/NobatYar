# NobatYar 🏥

A multilingual healthcare appointment booking platform for doctors, hospitals, clinics and patients.

**Stack:** React, Vite, Node.js, Express and PostgreSQL.

## Project structure

- `Frontend/` — React application
- `Backend/` — Express API and PostgreSQL schema

## Local setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `Backend/.env.example` to `Backend/.env` and configure it locally. **Never commit `.env`.**
3. Run `cd Backend && npm install && npm run db:setup && npm run dev`.
4. In another terminal run `cd Frontend && npm install && npm run dev`.

## Deployment

Railway supports separate Frontend and Backend services from this single repository, with a PostgreSQL service. Set each service's root directory accordingly and configure environment variables privately in Railway. See `DEPLOYMENT-GUIDE.md` and `VERCEL-RELEASE-READ-ME.md` for existing project notes.

## Release status

**Development / pre-production.** Do not collect real patient information until authorization, session handling, private file storage, email verification, booking concurrency, backups and security have been thoroughly reviewed and tested. Google/Apple OAuth and some other production features are not yet complete.
# NobatYar
