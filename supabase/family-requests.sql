-- Family experience request links.
-- Safe to run on the live database. Adds columns and two functions only.
-- Does not rename or remove existing columns. Does not change resident/session RLS.
-- Anon cannot read residents, sessions, or family_requests tables.

alter table public.residents
  add column if not exists family_link_token uuid unique default gen_random_uuid();

update public.residents
set family_link_token = gen_random_uuid()
where family_link_token is null;

alter table public.residents
  alter column family_link_token set not null;

alter table public.family_requests
  add column if not exists relationship text not null default '';

alter table public.family_requests
  add column if not exists approximate_year text not null default '';

alter table public.family_requests
  add column if not exists why_it_matters text not null default '';

alter table public.family_requests
  add column if not exists staff_should_know text not null default '';

alter table public.family_requests
  add column if not exists status text not null default 'New';

alter table public.family_requests
  add column if not exists submitted_at timestamptz not null default now();

alter table public.family_requests
  add column if not exists session_id text;

alter table public.family_requests drop constraint if exists family_requests_status_check;
alter table public.family_requests
  add constraint family_requests_status_check
  check (status in ('New', 'Approved', 'Completed', 'Declined'));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'family_requests_session_id_fkey'
  ) then
    alter table public.family_requests
      add constraint family_requests_session_id_fkey
      foreign key (session_id) references public.sessions (id) on delete set null;
  end if;
end;
$$;

create or replace function public.family_request_preview(p_token uuid)
returns table(first_name text)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
  select split_part(trim(r.name), ' ', 1)::text as first_name
  from public.residents r
  where r.family_link_token = p_token;
end;
$$;

create or replace function public.submit_family_request(
  p_token uuid,
  p_family_name text,
  p_relationship text,
  p_experience text,
  p_year text,
  p_why_it_matters text,
  p_memory text,
  p_staff_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  resident_row public.residents%rowtype;
begin
  select * into resident_row
  from public.residents
  where family_link_token = p_token;

  if not found then
    raise exception 'not found' using errcode = 'P0002';
  end if;

  if length(trim(coalesce(p_family_name, ''))) < 1
    or length(trim(coalesce(p_relationship, ''))) < 1
    or length(trim(coalesce(p_experience, ''))) < 1
    or length(trim(coalesce(p_why_it_matters, ''))) < 1
    or length(trim(coalesce(p_memory, ''))) < 1
  then
    raise exception 'missing fields' using errcode = '22023';
  end if;

  insert into public.family_requests (
    id,
    facility_id,
    resident_id,
    resident_name,
    requested_by,
    experience,
    note,
    received,
    relationship,
    approximate_year,
    why_it_matters,
    staff_should_know,
    status,
    submitted_at
  )
  values (
    'f-' || gen_random_uuid()::text,
    resident_row.facility_id,
    resident_row.id,
    resident_row.name,
    left(trim(p_family_name), 200),
    left(trim(p_experience), 300),
    left(trim(p_memory), 2000),
    'Just now',
    left(trim(p_relationship), 120),
    left(trim(coalesce(p_year, '')), 40),
    left(trim(p_why_it_matters), 2000),
    left(trim(coalesce(p_staff_note, '')), 2000),
    'New',
    now()
  );
end;
$$;

revoke all on function public.family_request_preview(uuid) from public;
revoke all on function public.submit_family_request(uuid, text, text, text, text, text, text, text) from public;
grant execute on function public.family_request_preview(uuid) to anon, authenticated;
grant execute on function public.submit_family_request(uuid, text, text, text, text, text, text, text) to anon, authenticated;
