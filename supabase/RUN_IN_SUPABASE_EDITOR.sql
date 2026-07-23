-- ============================================================
-- RUN THIS IN YOUR SUPABASE PROJECT → SQL EDITOR
-- Fixes missing tables and columns identified from errors
-- ============================================================

-- 1. university_deadlines table (fixes "Could not find table" error)
create table if not exists university_deadlines (
  id               uuid primary key default gen_random_uuid(),
  university_name  text not null,
  program_name     text,
  country          text not null,
  deadline_date    date,
  type             text not null default 'application_deadline',
  intake_season    text,
  intake_year      int,
  link             text,
  notes            text,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2. notices column on destination_roadmaps (fixes "Could not find column" error)
alter table destination_roadmaps
  add column if not exists notices text;

-- 3. admin_feedback column on leads (for admin notes in lead detail panel)
alter table leads
  add column if not exists admin_feedback text;

-- 4. moderator_id column on community_groups
alter table community_groups
  add column if not exists moderator_id uuid references students(id) on delete set null;

-- 5. push_subscriptions table (for web push notifications)
create table if not exists push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  endpoint   text unique not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- 6. Unique constraint on students.user_id (fixes ON CONFLICT upsert error in settings)
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'students_user_id_key' and conrelid = 'students'::regclass
  ) then
    alter table students add constraint students_user_id_key unique (user_id);
  end if;
end $$;

-- 7. admin_settings table (for advisor card config and other site settings)
create table if not exists admin_settings (
  key        text primary key,
  value      jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- 8. admin_notes column on applications (for admin notes in application panel)
alter table applications
  add column if not exists admin_notes text;

-- 9. Seed destinations if missing (fixes /destinations/PL or /destinations/poland)
insert into destinations (slug, name, is_active) values
  ('poland',    'Poland',    true),
  ('uk',        'UK',        true),
  ('canada',    'Canada',    true),
  ('australia', 'Australia', true),
  ('usa',       'USA',       true),
  ('germany',   'Germany',   true),
  ('lithuania', 'Lithuania', true),
  ('latvia',    'Latvia',    true),
  ('hungary',   'Hungary',   true),
  ('malta',     'Malta',     true),
  ('cyprus',    'Cyprus',    true),
  ('austria',   'Austria',   true)
on conflict (slug) do update set is_active = true;

-- 10. Enable RLS on tables flagged by Supabase Security Advisor
-- Public content tables: anyone can read, only authenticated admins can write
alter table destination_roadmaps    enable row level security;
alter table destination_visa_info   enable row level security;
alter table knowledge_base          enable row level security;
alter table country_updates         enable row level security;
alter table required_documents      enable row level security;
alter table site_identity           enable row level security;
alter table admin_profiles          enable row level security;

-- destination_roadmaps: public read
drop policy if exists "public read destination_roadmaps" on destination_roadmaps;
create policy "public read destination_roadmaps"
  on destination_roadmaps for select using (true);

-- destination_visa_info: public read
drop policy if exists "public read destination_visa_info" on destination_visa_info;
create policy "public read destination_visa_info"
  on destination_visa_info for select using (true);

-- knowledge_base: public read
drop policy if exists "public read knowledge_base" on knowledge_base;
create policy "public read knowledge_base"
  on knowledge_base for select using (true);

-- country_updates: public read
drop policy if exists "public read country_updates" on country_updates;
create policy "public read country_updates"
  on country_updates for select using (true);

-- required_documents: public read
drop policy if exists "public read required_documents" on required_documents;
create policy "public read required_documents"
  on required_documents for select using (true);

-- site_identity: public read
drop policy if exists "public read site_identity" on site_identity;
create policy "public read site_identity"
  on site_identity for select using (true);

-- admin_profiles: only the owner can read their own row
drop policy if exists "admin read own profile" on admin_profiles;
create policy "admin read own profile"
  on admin_profiles for select using (auth.uid() = user_id);
