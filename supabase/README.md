# Supabase setup

There was no Supabase CLI configuration or existing migration directory in this workspace, so the migration is ready but has not been applied.

1. Open the Supabase dashboard for project `ctlhtxdaewgpcqvykmhz`.
2. Go to **SQL Editor → New query**.
3. Paste and run [`migrations/20261004194000_create_waitlist_signups.sql`](./migrations/20261004194000_create_waitlist_signups.sql).
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` using the names shown in `.env.example`.
5. Run `npm run dev`.

The browser uses only the publishable key. RLS grants the `anon` role insert permission on the form columns; no public select, update, or delete grant or policy is created. `Prefer: return=minimal` ensures the signup request does not ask the browser to read back the inserted row.
