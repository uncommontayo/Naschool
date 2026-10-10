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

### Editing the game

The game's source of truth is `game-src/`. Edit those files, then rebuild:

```sh
npm run build:game
```

This joins `game-src/*.js` in file-name order into `public/play/game.js`. Do not edit `game.js` by hand: `npm test` fails when it does not match the source files (`npm run check:game` runs just that check). The game is one browser script, so the number prefixes set the order the code runs in, and a later section may redefine a function from an earlier one. Give a new file the next free number.

| File | Contents |
| --- | --- |
| `00-core` | strict mode, small helpers, click-action registry |
| `01-config` | schools, houses, cast, tests, questions, timetable, shop, rumours, badges |
| `02-state-avatars` | saved state and the avatar drawing code |
| `03-clock-cast-locations` | game clock, NPC cast, locations |
| `04-notify-items-newgame` | toasts and log, items, new-game state |
| `05-onboarding` | sign-up flow, personality tests, placement, game start |
| `06-hud-scene` | top bar and the school scene |
| `07-interactions` | context menus, talk, rumours |
| `08-mystery` | the Missing Trophy mystery |
| `09-learning` | class, questions, teacher lessons |
| `10-chaos-events` | chaos actions, random events, reporting |
| `11-economy-tasks` | money, shop, Kolo, challenges, daily tasks |
| `12-day-chat` | day cycle and tick, chat |
| `13-ui-panels` | modals and side panels |
| `14-boot` | tutorial and start-up |

`tools/build_play.py` is the earlier import path from the CEO's prototype. Running it overwrites `public/play/game.js` and discards any edits made in `game-src/`.

## Before deploying

Replace `CONTACT_EMAIL_HERE` in `public/privacy.html` with the address people should write to about their data. `npm test` fails until you do.
