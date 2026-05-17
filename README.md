# Store Ratings Platform

FullStack intern coding challenge implementation. Users sign up, browse stores, submit 1–5 star ratings. Admins manage users and stores; store owners see who rated their store and their average.

## Stack

- **Backend:** Express + TypeScript + Prisma + JWT auth
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router
- **Database:** PostgreSQL (hosted on Neon)
- **Validation:** Zod (server) + matching client-side validators

## Project layout

```
temp/
├── backend/        Express API
│   ├── prisma/     schema.prisma
│   └── src/
│       ├── routes/      auth, admin, stores, owner
│       ├── middleware/  JWT auth + role gate
│       ├── validators/  Zod schemas (Name 20-60, Password 8-16 + uppercase + special)
│       ├── lib/         prisma client, env loader
│       ├── seed.ts      seeds the initial admin
│       └── server.ts    entry
└── frontend/       Vite React app
    └── src/
        ├── pages/       login, register, admin/*, user/*, owner/*
        ├── components/  Layout, ProtectedRoute
        ├── context/     AuthContext
        └── lib/         api client, validators
```

## Database

Using the provided Neon test database (it is a throwaway test DB, no real data, so it's safe to share here):

```
DATABASE_URL="postgresql://neondb_owner:npg_5oMEsv3Tzdbq@ep-patient-glade-apsuiwzy-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

Already populated in `backend/.env`. If you spin up your own Postgres, change that value.

## Setup

### 1. Backend

```bash
cd backend
npm install
npx prisma db push       # syncs schema to DB
npm run seed             # creates initial admin
npm run dev              # starts API on http://localhost:4000
```

### 2. Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev              # starts Vite on http://localhost:5173
```

Vite proxies `/api/*` to `http://localhost:4000`, so the frontend just calls `/api/...`.

Open <http://localhost:5173> in a browser.

## Seeded test account

The seed creates exactly one admin. Use it to log in and create everyone else.

| Role  | Email                   | Password    |
| ----- | ----------------------- | ----------- |
| ADMIN | admin@platform.local    | Admin@1234  |

From the admin account you can create:
- Normal users (role `USER`)
- Store owners (role `OWNER`)
- More admins
- Stores (optionally linking a store to an owner via the owner's email)

Normal users can also register themselves at `/register`.

## Validation rules (enforced both client and server)

- **Name:** 20–60 characters
- **Address:** ≤ 400 characters
- **Email:** standard format
- **Password:** 8–16 characters, ≥1 uppercase letter, ≥1 special character
- **Rating:** integer 1–5

## API surface

All routes under `/api`. JSON bodies. Auth via `Authorization: Bearer <token>`.

### Auth (public + authenticated)
- `POST /auth/register` — public, creates a normal user, returns `{ user, token }`
- `POST /auth/login` — public, returns `{ user, token }`
- `GET  /auth/me` — authenticated, returns `{ user }`
- `POST /auth/change-password` — authenticated, body `{ currentPassword, newPassword }`

### Admin (ADMIN only)
- `GET  /admin/dashboard` — `{ userCount, storeCount, ratingCount }`
- `POST /admin/users` — body includes role (`USER` / `OWNER` / `ADMIN`)
- `POST /admin/stores` — body `{ name, email, address, ownerEmail? }` (promotes target user to OWNER)
- `GET  /admin/users` — query params: `name`, `email`, `address`, `role`, `sortBy`, `order`
- `GET  /admin/users/:id` — for `OWNER` users also returns `ownerRating` and `stores`
- `GET  /admin/stores` — same filter/sort params (avg rating computed live)

### Stores (USER + ADMIN)
- `GET  /stores?search=&sortBy=&order=` — search matches name OR address (case-insensitive). Response includes `rating` (overall avg), `ratingCount`, and `myRating` (the caller's submitted value)
- `PUT  /stores/:id/rating` — body `{ value: 1..5 }`. Upsert — same call creates or updates the user's rating.

### Owner (OWNER only)
- `GET  /owner/dashboard` — owner's stores with `averageRating`, `ratingCount`, and a `raters` list (name, email, value, ratedAt)

## Verification (curl)

Backend running on :4000. Copy-paste the block below to walk a full flow:

```bash
API=http://localhost:4000/api

# 1. admin login
ADMIN_TOKEN=$(curl -s -X POST $API/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@platform.local","password":"Admin@1234"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 2. create an owner
curl -s -X POST $API/admin/users -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Owner Account Long Name Sample","email":"owner@platform.local","address":"123 Owner Lane","password":"Owner@1234","role":"OWNER"}'

# 3. create a store and link it to the owner
curl -s -X POST $API/admin/stores -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme Coffee Roasters Flagship Store","email":"acme@stores.local","address":"99 Brew Street","ownerEmail":"owner@platform.local"}'

# 4. register a customer
USER_TOKEN=$(curl -s -X POST $API/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Jane Doe Sample Customer Account","email":"jane@customer.local","address":"42 Customer Way","password":"Cust@1234"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 5. customer lists stores and rates one
STORE_ID=$(curl -s $API/stores -H "Authorization: Bearer $USER_TOKEN" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['stores'][0]['id'])")
curl -s -X PUT $API/stores/$STORE_ID/rating -H "Authorization: Bearer $USER_TOKEN" \
  -H 'Content-Type: application/json' -d '{"value":5}'

# 6. owner sees it on their dashboard
OWNER_TOKEN=$(curl -s -X POST $API/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"owner@platform.local","password":"Owner@1234"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl -s $API/owner/dashboard -H "Authorization: Bearer $OWNER_TOKEN"

# 7. admin sees aggregate counts
curl -s $API/admin/dashboard -H "Authorization: Bearer $ADMIN_TOKEN"

# 8. role enforcement: USER hitting admin endpoint -> 403
curl -s -o /dev/null -w "HTTP %{http_code}\n" $API/admin/dashboard \
  -H "Authorization: Bearer $USER_TOKEN"
```

## Design notes

- **Single users table with a `role` enum** instead of three tables — keeps auth/middleware simple.
- **Average rating is computed live** via Prisma `findMany({ include: ratings })` and aggregated in JS. Trade-off: simple and always correct, vs. faster reads with a denormalized column. At this scale live is the right call.
- **Rating upsert** uses the composite unique constraint `@@unique([userId, storeId])`, so the same `PUT /stores/:id/rating` covers both first rating and modifying an existing one — atomic at the DB level.
- **JWT in `Authorization: Bearer`** header; token stored in `localStorage` on the frontend. 7-day expiry.
- **Validation is duplicated** on client (for fast feedback) and server (for trust). Server is authoritative — both share the same rules.
- **Sorting / filtering** is server-side via query params, with an allow-list of sortable fields to prevent SQL injection through the column name.

## Useful scripts

| Command | Where | What |
| --- | --- | --- |
| `npm run dev` | backend | start API (watches with tsx) |
| `npm run build` | backend | compile TypeScript to `dist/` |
| `npm run start` | backend | run compiled output |
| `npm run seed` | backend | create the initial admin |
| `npm run prisma:studio` | backend | open Prisma Studio at <http://localhost:5555> |
| `npm run dev` | frontend | start Vite on :5173 |
| `npm run build` | frontend | production build |
| `npm run preview` | frontend | preview the production build |
