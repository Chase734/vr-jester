-- Life Story fields for residents.
-- Safe to run on the live database. Adds new optional columns only.
-- Does not rename or remove existing columns. Does not change RLS.

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
