-- VR Jester engagement upgrade.
-- Safe to run on the live database. Adds columns and a YouTube catalog table only.
-- Does not rename or remove existing columns. Does not weaken resident/session RLS.

alter table public.residents
  add column if not exists favorite_decade text not null default '';

alter table public.residents
  add column if not exists family_traditions text not null default '';

alter table public.sessions
  add column if not exists experience_type text not null default 'vr_jester';

alter table public.sessions
  add column if not exists youtube_video_id text not null default '';

alter table public.sessions
  add column if not exists completion_percentage integer not null default 0;

alter table public.sessions
  add column if not exists completed_at timestamptz;

alter table public.sessions
  add column if not exists created_by uuid;

alter table public.sessions drop constraint if exists sessions_experience_type_check;
alter table public.sessions
  add constraint sessions_experience_type_check
  check (experience_type in ('vr_jester', 'youtube_360'));

create table if not exists public.youtube_videos (
  id text primary key,
  facility_id uuid references public.facilities (id) on delete cascade,
  youtube_video_id text not null,
  title text not null,
  channel text not null default '',
  thumbnail text not null default '',
  duration text not null default '',
  category text not null default '',
  destination text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  is_360 boolean not null default true,
  embed_available boolean not null default false,
  staff_approved boolean not null default false,
  quality_score integer not null default 0,
  times_used integer not null default 0,
  average_engagement numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists youtube_videos_video_id_idx
  on public.youtube_videos (youtube_video_id);

alter table public.youtube_videos enable row level security;

drop policy if exists "youtube_videos_select" on public.youtube_videos;
create policy "youtube_videos_select" on public.youtube_videos
  for select to authenticated
  using (
    facility_id is null
    or public.is_admin()
    or facility_id = public.my_facility_id()
  );

drop policy if exists "youtube_videos_insert" on public.youtube_videos;
create policy "youtube_videos_insert" on public.youtube_videos
  for insert to authenticated
  with check (
    public.is_admin()
    or facility_id is null
    or facility_id = public.my_facility_id()
  );

drop policy if exists "youtube_videos_update" on public.youtube_videos;
create policy "youtube_videos_update" on public.youtube_videos
  for update to authenticated
  using (
    public.is_admin()
    or facility_id is null
    or facility_id = public.my_facility_id()
  )
  with check (
    public.is_admin()
    or facility_id is null
    or facility_id = public.my_facility_id()
  );

grant select, insert, update on public.youtube_videos to authenticated;
