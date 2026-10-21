# NobatYar Backend

A Node.js + Express + PostgreSQL API prepared for the uploaded NobatYar React frontend. The original frontend uses `src/data/doctorsData.js`, `src/data/hospitalData.js` and browser `localStorage` for bookings. This API seeds the **same three doctors and three hospitals**, preserves translation keys in the data, and stores real user accounts and appointments in PostgreSQL.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer

## Setup

1. Create a PostgreSQL database called `nobatyar` (using pgAdmin or `createdb nobatyar`).
2. Copy `.env.example` to `.env`.
3. Set your PostgreSQL username/password in `DATABASE_URL`.
4. Generate a long random `JWT_SECRET`, e.g. `openssl rand -hex 32`.
5. Keep `FRONTEND_URL=http://localhost:5173` if Vite runs on that address.
6. Run:

```bash
npm install
npm run db:setup
npm run dev
```

Visit `http://localhost:5000/api/health` to confirm the API is running.

## Endpoints

| Method | Path | Access |
|---|---|---|
| GET | `/api/health` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/logout` | Public |
| GET | `/api/auth/me` | Logged in |
| PATCH | `/api/profile` | Logged in |
| POST | `/api/profile/avatar` | Logged in, multipart `avatar` |
| DELETE | `/api/profile/avatar` | Logged in |
| GET | `/api/doctors` | Public |
| GET | `/api/doctors/:id` | Public |
| GET | `/api/hospitals` | Public |
| GET | `/api/hospitals/:id` | Public |
| GET | `/api/doctors/:id/booked-slots?date=1405/08/01` | Public |
| POST | `/api/appointments` | Logged in |
| GET | `/api/appointments` | Logged in |
| PATCH | `/api/appointments/:id/cancel` | Appointment owner |
| POST | `/api/contact` | Public |
| POST | `/api/provider-requests` | Logged in |
| GET | `/api/admin/appointments` | Admin |
| PATCH | `/api/admin/appointments/:id/status` | Admin |
| GET | `/api/admin/provider-requests` | Admin |
| PATCH | `/api/admin/provider-requests/:id` | Admin |

Admin role is granted from the **server terminal only**: `npm run admin:promote -- you@example.com`. First register that account normally.

## Example JSON requests

`POST /api/auth/register`

```json
{"name":"Fardin","email":"fardin@example.com","password":"choose-a-long-password","phone":"0790000000"}
```

`POST /api/auth/login`

```json
{"email":"fardin@example.com","password":"choose-a-long-password"}
```

`POST /api/appointments`

```json
{"doctorId":1,"date":"1405/08/01","time":"09:00","patientName":"Fardin","phone":"0790000000","notes":""}
```

`PATCH /api/profile`

```json
{"name":"Fardin","phone":"0790000000","city":"Herat"}
```

## Frontend integration (required)

This ZIP is the **backend**, not a replacement for the React project. Existing React pages still use local data until updated. In the frontend, create `src/api.js`:

```js
const API = 'http://localhost:5000/api';
export async function api(path, options = {}) {
  const response = await fetch(API + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
```

Example login:

```js
await api('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
```

Example booking:

```js
await api('/appointments', {
  method: 'POST',
  body: JSON.stringify({ doctorId: doctor.id, date, time, patientName: fullName, phone, notes }),
});
```

Example list:

```js
const appointments = await api('/appointments');
```

Example cancel:

```js
await api(`/appointments/${id}/cancel`, { method: 'PATCH' });
```

**Do not** leave the old localStorage booking code active alongside the real API. The frontend needs to replace its old `handleSubmit`, `MyAppointments` state and cancellation handlers, `Login`, `SignUp`, `UserProfile` and `Header` login state with API calls. It must load the current user using `/api/auth/me` and redirect anonymous users to Login. The API uses an HttpOnly cookie, so every `fetch` needs `credentials: 'include'`.

For avatar upload, use `FormData` and **do not** set a JSON `Content-Type` header:

```js
const form = new FormData();
form.append('avatar', file);
await fetch('http://localhost:5000/api/profile/avatar', {
  method: 'POST', credentials: 'include', body: form,
});
```

Avatar paths returned by the API are relative to the backend, e.g. `http://localhost:5000/uploads/...`.

## Deployment and security notes

- This is an initial implementation, **not a production security audit**.
- Use HTTPS, a managed PostgreSQL database, encrypted backups, log monitoring and email verification/password reset before serving real patients.
- Set `FRONTEND_URL` to the exact deployed frontend origin. Mutating requests require matching `Origin` headers; a tool like curl must set that header for POST/PATCH/DELETE.
- Cookies default to `SameSite=Lax`; deploy frontend and API on same-site domains. If you need cross-site cookies, set `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`, use HTTPS, and review CSRF protection carefully.
- Uploaded avatars are stored on local disk, which is ephemeral on some hosting services. Use object storage for production.
- Medical/patient data is sensitive. Minimize stored notes, set retention rules, restrict admin access and obtain legal/privacy review for your operating region.
- `date` is accepted as a Jalali-style `YYYY/MM/DD` string for compatibility with the current frontend. A production scheduling system should validate dates/timezones and doctor working hours on the server; this starter currently checks only shape and database slot uniqueness.
- Registration and Login are implemented; email verification, password recovery, audit logs, appointment reminders, doctor-side login and deployment are **not** included yet.
