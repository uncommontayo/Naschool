begin;

create extension if not exists pgcrypto;

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(btrim(first_name)) between 1 and 60),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 60),
  gender text null check (gender is null or gender in ('male', 'female', 'prefer_not_to_say')),
  email text not null check (
    email = lower(btrim(email))
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  created_at timestamptz not null default now(),
  source text not null default 'landing_page',
  status text not null default 'waitlist',
  constraint waitlist_signups_email_unique unique (email)
);

-- Keep reruns safe and add the required constraint if a table existed without it.
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.waitlist_signups'::regclass
       and conname = 'waitlist_signups_email_unique'
  ) then
    alter table public.waitlist_signups
      add constraint waitlist_signups_email_unique unique (email);
  end if;
end;
$$;

alter table public.waitlist_signups enable row level security;

-- Anonymous visitors can insert only form fields. UUID and created_at retain
-- database defaults; the form cannot read, edit, or remove rows.
revoke all privileges on table public.waitlist_signups from public, anon, authenticated;
revoke all privileges (id, first_name, last_name, gender, email, created_at, source, status)
  on table public.waitlist_signups from public, anon, authenticated;
grant insert (first_name, last_name, gender, email, source, status)
  on table public.waitlist_signups to anon;

drop policy if exists "Public can submit a waitlist signup" on public.waitlist_signups;
create policy "Public can submit a waitlist signup"
  on public.waitlist_signups
  for insert
  to anon
  with check (
    first_name = btrim(first_name)
    and char_length(first_name) between 1 and 60
    and last_name = btrim(last_name)
    and char_length(last_name) between 1 and 60
    and (gender is null or gender in ('male', 'female', 'prefer_not_to_say'))
    and email = lower(btrim(email))
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
    and source = 'landing_page'
    and status = 'waitlist'
  );

commit;
