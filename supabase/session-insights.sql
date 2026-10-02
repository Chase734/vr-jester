alter table public.sessions add column if not exists duration_minutes integer not null default 0;
alter table public.sessions add column if not exists reaction text not null default '';
alter table public.sessions add column if not exists session_engagement text not null default '';
alter table public.sessions add column if not exists staff_notes text not null default '';
alter table public.sessions add column if not exists memory_discovered text not null default '';
alter table public.sessions add column if not exists follow_up_destination text not null default '';
alter table public.sessions add column if not exists request_id text;

alter table public.sessions drop constraint if exists sessions_reaction_check;
alter table public.sessions
  add constraint sessions_reaction_check
  check (reaction in ('', 'Loved It', 'Liked It', 'Neutral', 'Didn''t Like It'));

alter table public.sessions drop constraint if exists sessions_session_engagement_check;
alter table public.sessions
  add constraint sessions_session_engagement_check
  check (session_engagement in ('', 'Highly Engaged', 'Engaged', 'Limited Engagement', 'Disengaged'));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sessions_request_id_fkey'
  ) then
    alter table public.sessions
      add constraint sessions_request_id_fkey
      foreign key (request_id) references public.family_requests (id) on delete set null;
  end if;
end;
$$;
