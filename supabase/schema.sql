-- VR Jester database: facilities, profiles, and facility-scoped records.
-- Paste this entire file into Supabase → SQL Editor → Run.

create table if not exists public.facilities (
  id uuid primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  facility_id uuid references public.facilities (id),
  role text not null check (role in ('admin', 'staff')),
  full_name text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.residents (
  id text primary key,
  facility_id uuid not null references public.facilities (id) on delete cascade,
  name text not null,
  room text not null default '',
  birthday text not null default '',
  hometown text not null default '',
  places_lived text[] not null default '{}',
  places_visited text[] not null default '{}',
  places_they_want_to_visit text[] not null default '{}',
  favorite_sports_teams text[] not null default '{}',
  favorite_vacation text not null default '',
  favorite_places text[] not null default '{}',
  military_service text not null default '',
  college text not null default '',
  interests text[] not null default '{}',
  family_members jsonb not null default '[]',
  mobility_notes text not null default '',
  high_school text not null default '',
  career text not null default '',
  spouse_partner text not null default '',
  children_grandchildren text[] not null default '{}',
  childhood_memories text not null default '',
  wedding_honeymoon text not null default '',
  meaningful_places text[] not null default '{}',
  restaurants_landmarks text[] not null default '{}',
  major_life_events text[] not null default '{}',
  music text[] not null default '{}',
  movies_tv text[] not null default '{}',
  food text[] not null default '{}',
  animals text[] not null default '{}',
  cultural_interests text[] not null default '{}',
  topics_to_avoid text[] not null default '{}',
  staff_notes text not null default '',
  family_link_token uuid unique default gen_random_uuid(),
  vr_comfort_level text not null default 'New to VR',
  favorite_experiences text[] not null default '{}',
  past_experiences text[] not null default '{}',
  future_requests text[] not null default '{}',
  sessions_this_month integer not null default 0,
  engagement text not null default 'Needs a visit'
);

create table if not exists public.sessions (
  id text primary key,
  facility_id uuid not null references public.facilities (id) on delete cascade,
  resident_id text not null references public.residents (id) on delete cascade,
  resident_name text not null,
  experience text not null,
  starts_at timestamptz not null,
  status text not null check (status in ('upcoming', 'completed')),
  duration_minutes integer not null default 0,
  reaction text not null default '',
  session_engagement text not null default '',
  staff_notes text not null default '',
  memory_discovered text not null default '',
  follow_up_destination text not null default '',
  request_id text
);

create table if not exists public.family_requests (
  id text primary key,
  facility_id uuid not null references public.facilities (id) on delete cascade,
  resident_id text not null references public.residents (id) on delete cascade,
  resident_name text not null,
  requested_by text not null default '',
  experience text not null,
  note text not null default '',
  received text not null default 'Just now',
  relationship text not null default '',
  approximate_year text not null default '',
  why_it_matters text not null default '',
  staff_should_know text not null default '',
  status text not null default 'New',
  submitted_at timestamptz not null default now(),
  session_id text references public.sessions (id) on delete set null
);

insert into public.facilities (id, name)
values ('11111111-1111-4111-8111-111111111111', 'Maple Grove Senior Living')
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.my_facility_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select facility_id
  from public.profiles
  where id = auth.uid();
$$;

alter table public.facilities enable row level security;
alter table public.profiles enable row level security;
alter table public.residents enable row level security;
alter table public.sessions enable row level security;
alter table public.family_requests enable row level security;

drop policy if exists "facilities_select" on public.facilities;
create policy "facilities_select" on public.facilities
  for select to authenticated
  using (public.is_admin() or id = public.my_facility_id());

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "residents_select" on public.residents;
create policy "residents_select" on public.residents
  for select to authenticated
  using (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "residents_insert" on public.residents;
create policy "residents_insert" on public.residents
  for insert to authenticated
  with check (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "residents_update" on public.residents;
create policy "residents_update" on public.residents
  for update to authenticated
  using (public.is_admin() or facility_id = public.my_facility_id())
  with check (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "residents_delete" on public.residents;
create policy "residents_delete" on public.residents
  for delete to authenticated
  using (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "sessions_select" on public.sessions;
create policy "sessions_select" on public.sessions
  for select to authenticated
  using (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "sessions_insert" on public.sessions;
create policy "sessions_insert" on public.sessions
  for insert to authenticated
  with check (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "sessions_update" on public.sessions;
create policy "sessions_update" on public.sessions
  for update to authenticated
  using (public.is_admin() or facility_id = public.my_facility_id())
  with check (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "sessions_delete" on public.sessions;
create policy "sessions_delete" on public.sessions
  for delete to authenticated
  using (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "requests_select" on public.family_requests;
create policy "requests_select" on public.family_requests
  for select to authenticated
  using (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "requests_insert" on public.family_requests;
create policy "requests_insert" on public.family_requests
  for insert to authenticated
  with check (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "requests_update" on public.family_requests;
create policy "requests_update" on public.family_requests
  for update to authenticated
  using (public.is_admin() or facility_id = public.my_facility_id())
  with check (public.is_admin() or facility_id = public.my_facility_id());

drop policy if exists "requests_delete" on public.family_requests;
create policy "requests_delete" on public.family_requests
  for delete to authenticated
  using (public.is_admin() or facility_id = public.my_facility_id());

grant usage on schema public to authenticated;
grant select on public.facilities to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.residents to authenticated;
grant select, insert, update, delete on public.sessions to authenticated;
grant select, insert, update, delete on public.family_requests to authenticated;

-- Optional Life Story columns. Safe if this file is run again on an existing database.
alter table public.residents add column if not exists high_school text not null default '';
alter table public.residents add column if not exists career text not null default '';
alter table public.residents add column if not exists spouse_partner text not null default '';
alter table public.residents add column if not exists children_grandchildren text[] not null default '{}';
alter table public.residents add column if not exists childhood_memories text not null default '';
alter table public.residents add column if not exists wedding_honeymoon text not null default '';
alter table public.residents add column if not exists meaningful_places text[] not null default '{}';
alter table public.residents add column if not exists restaurants_landmarks text[] not null default '{}';
alter table public.residents add column if not exists major_life_events text[] not null default '{}';
alter table public.residents add column if not exists music text[] not null default '{}';
alter table public.residents add column if not exists movies_tv text[] not null default '{}';
alter table public.residents add column if not exists food text[] not null default '{}';
alter table public.residents add column if not exists animals text[] not null default '{}';
alter table public.residents add column if not exists cultural_interests text[] not null default '{}';
alter table public.residents add column if not exists topics_to_avoid text[] not null default '{}';
alter table public.residents add column if not exists staff_notes text not null default '';

-- Family request links. For an existing database, also run supabase/family-requests.sql.
