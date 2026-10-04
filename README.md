# Na School! pre-launch landing page

The page is a lightweight HTML, CSS, and JavaScript site. Its existing “MAKE I JOIN” form uses the Supabase REST endpoint with the public publishable key and an insert-only RLS policy.

## Run locally

Requires Node.js 20 or newer.

```sh
npm run dev
```

Open [http://localhost:4173](http://localhost:4173). The page loads without Supabase credentials. With an empty key, submit displays a setup message and sends no database request.

## Configure Supabase

Copy the variable names from `.env.example` into `.env.local` and set the publishable key from the Supabase project settings. Then run the SQL migration in [`supabase/migrations/20261004194000_create_waitlist_signups.sql`](./supabase/migrations/20261004194000_create_waitlist_signups.sql) through the Supabase dashboard SQL Editor. See [`supabase/README.md`](./supabase/README.md).

The browser sends only an `INSERT` request with `Prefer: return=minimal`; it never requests signup rows.

## Deploy to Cloudflare Workers

The Worker serves the files in `public/` and provides `/api/config` for the signup form. The Supabase URL and publishable key are set in `wrangler.jsonc`, so they are available on deployment. Supabase publishable keys are intended for client applications; access remains governed by the database's row-level security policies.

Deploy with:

```sh
npx wrangler deploy
```

Wrangler uses `public/` as the asset directory, keeping project dependencies and server-side files out of the uploaded website assets.

## Check the app

```sh
npm test
```
