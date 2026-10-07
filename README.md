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

## Early access game (`/play`)

`public/play/` is the single-player early access, built from the CEO's prototype by `tools/build_play.py`. It runs entirely in the browser and saves to the player's device; nothing is sent to us. The build:

- moves the prototype's inline script into `play/game.js`, because the site's Content-Security-Policy blocks inline scripts;
- self-hosts Lilita One, Figtree and JetBrains Mono under `play/fonts/` (SIL Open Font License), because the policy also blocks Google Fonts;
- removes the password field, so nothing that looks like an account is stored;
- marks every simulated classmate as an NPC, so nobody is shown as a real player;
- uses today's date for the 18+ check.

To rebuild after the prototype changes (needs Python 3 and `npm i @fontsource/lilita-one @fontsource/figtree @fontsource/jetbrains-mono` in a scratch folder):

```sh
python3 tools/build_play.py "path/to/Na School Prototype.html" public/play path/to/node_modules/@fontsource
npm test
```

## Before deploying

Replace `CONTACT_EMAIL_HERE` in `public/privacy.html` with the address people should write to about their data. `npm test` fails until you do.
