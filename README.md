# Racket Sports GT — Tenis de Mesa

Login and registration for the Table Tennis tracker, built as a Vercel app with a Supabase Postgres database.

## Stack

- **Frontend:** static HTML/CSS/JS in `public/` (no framework, no build step)
- **Backend:** Vercel Serverless Functions in `api/` (Node.js)
- **Database:** Supabase Postgres (`users` table, Row Level Security enabled — only the server-side service role key can read/write it)
- **Auth:** bcrypt password hashing + JWT session tokens (custom, not Supabase Auth)

## Project structure

```
api/
  _lib.js           shared helpers (Supabase client, JWT sign/verify)
  auth/
    register.js      POST /api/auth/register
    login.js          POST /api/auth/login
    me.js              GET  /api/auth/me
public/
  index.html         the login/register/dashboard page
vercel.json
package.json
```

## Environment variables

Set these in the Vercel project settings (Settings → Environment Variables) — never commit real values:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → service_role key (secret!) |
| `JWT_SECRET` | Any long random string you generate yourself |

See `.env.example` for the shape. Copy it to `.env` for local development with `vercel dev` (never commit `.env`).

## Local development

```bash
npm install
npx vercel dev
```

## Deploy

```bash
npx vercel --prod
```

## Database schema

```sql
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  identifier TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

No public RLS policies are defined on purpose — only the service role key (used server-side in `api/_lib.js`) can access this table. The anon/publishable key is never used by this app.
