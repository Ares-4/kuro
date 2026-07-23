-- Kuro Educational — full schema migration
-- Run once against a fresh Supabase project or use as reference for ALTER statements on existing DB

-- ─────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ─────────────────────────────────────────
-- DESTINATIONS
-- ─────────────────────────────────────────
create table if not exists destinations (
  id           uuid primary key default uuid_generate_v4(),
  slug         text unique not null,
  name         text not null,
  description  text,
  image_url    text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Seed core destinations (upsert safe)
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

-- ─────────────────────────────────────────
-- DESTINATION ROADMAPS
-- ─────────────────────────────────────────
create table if not exists destination_roadmaps (
  destination_slug text primary key references destinations(slug) on delete cascade,
  steps            jsonb not null default '[]',
  notices          text,
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- DESTINATION VISA INFO
-- ─────────────────────────────────────────
create table if not exists destination_visa_info (
  destination_slug   text primary key references destinations(slug) on delete cascade,
  overview           text,
  requirements       jsonb default '[]',
  processing_time    text,
  official_links     jsonb default '[]',
  updated_at         timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- COUNTRY UPDATES
-- ─────────────────────────────────────────
create table if not exists country_updates (
  id               uuid primary key default uuid_generate_v4(),
  destination_slug text references destinations(slug) on delete cascade,
  title            text not null,
  body             text,
  is_active        boolean not null default true,
  expires_at       timestamptz,
  created_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- UNIVERSITIES
-- ─────────────────────────────────────────
create table if not exists universities (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  destination_id uuid references destinations(id) on delete set null,
  is_active      boolean not null default true,
  website        text,
  created_at     timestamptz not null default now()
);

create index if not exists universities_name_trgm on universities using gin (name gin_trgm_ops);

-- ─────────────────────────────────────────
-- PROGRAMS
-- ─────────────────────────────────────────
create table if not exists programs (
  id             uuid primary key default uuid_generate_v4(),
  university_id  uuid references universities(id) on delete cascade,
  name           text not null,
  level          text check (level in ('Undergraduate','Masters','PhD','Foundation','Any level')),
  duration       text,
  tuition_eur    numeric(12,2),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- UNIVERSITY DEADLINES
-- ─────────────────────────────────────────
create table if not exists university_deadlines (
  id               uuid primary key default uuid_generate_v4(),
  university_name  text not null,
  program_name     text,
  country          text not null,
  deadline_date    date,
  type             text not null default 'application_deadline'
                   check (type in ('application_deadline','enrollment_deadline','scholarship_deadline','document_deadline','other')),
  intake_season    text,
  intake_year      int,
  link             text,
  notes            text,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- SCHOLARSHIPS
-- ─────────────────────────────────────────
create table if not exists scholarships (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  provider    text,
  description text,
  amount      text,
  countries   text[] default '{}',
  levels      text[] default '{}',
  deadline    date,
  link        text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists scholarship_subscriptions (
  id              uuid primary key default uuid_generate_v4(),
  scholarship_id  uuid references scholarships(id) on delete cascade,
  email           text not null,
  user_id         uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (scholarship_id, email)
);

-- ─────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────
create table if not exists students (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid unique references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  country     text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- LEADS
-- ─────────────────────────────────────────
create table if not exists leads (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  email             text not null,
  whatsapp          text,
  origin_country    text,
  target_destination text,
  study_level       text,
  budget_range      text,
  intake_month      text,
  source            text,
  status            text not null default 'New'
                    check (status in ('New','Contacted','Converted','Rejected')),
  score             int,
  tier              text check (tier in ('A','B','C')),
  scored_at         timestamptz,
  payment_status    text not null default 'pending' check (payment_status in ('pending','paid')),
  payment_amount    int,
  result_pdf_url    text,
  admin_feedback    text,
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- BLOG POSTS
-- ─────────────────────────────────────────
create table if not exists blog_posts (
  id             uuid primary key default uuid_generate_v4(),
  slug           text unique not null,
  title          text not null,
  excerpt        text,
  content        text,
  featured_image text,
  categories     text[] default '{}',
  status         text not null default 'draft' check (status in ('draft','published')),
  published_at   timestamptz,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- FAQS
-- ─────────────────────────────────────────
create table if not exists faqs (
  id            uuid primary key default uuid_generate_v4(),
  question      text not null,
  answer        text not null,
  category      text,
  display_order int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- TESTIMONIALS
-- ─────────────────────────────────────────
create table if not exists testimonials (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  country     text,
  destination text,
  quote       text not null,
  rating      int check (rating between 1 and 5),
  avatar_url  text,
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- SITE SETTINGS
-- ─────────────────────────────────────────
create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

insert into site_settings (key, value) values
  ('show_testimonials_section', 'true'),
  ('show_expert_team_section',  'true')
on conflict (key) do nothing;

-- ─────────────────────────────────────────
-- PUBLIC CONTENT
-- ─────────────────────────────────────────
create table if not exists public_content (
  page       text not null,
  field      text not null,
  value      text,
  updated_at timestamptz not null default now(),
  primary key (page, field)
);

-- ─────────────────────────────────────────
-- COMMUNITY GROUPS
-- ─────────────────────────────────────────
create table if not exists community_groups (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  description  text,
  created_by   uuid references students(id) on delete set null,
  moderator_id uuid references students(id) on delete set null,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  approved_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- Add moderator_id if column doesn't exist yet (idempotent)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'community_groups' and column_name = 'moderator_id'
  ) then
    alter table community_groups add column moderator_id uuid references students(id) on delete set null;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- GROUP MEMBERS
-- ─────────────────────────────────────────
create table if not exists group_members (
  id         uuid primary key default uuid_generate_v4(),
  group_id   uuid references community_groups(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  role       text not null default 'member' check (role in ('member','moderator')),
  joined_at  timestamptz not null default now(),
  unique (group_id, student_id)
);

-- ─────────────────────────────────────────
-- COMMUNITY MESSAGES
-- ─────────────────────────────────────────
create table if not exists community_messages (
  id         uuid primary key default uuid_generate_v4(),
  group_id   uuid references community_groups(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  content    text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- PUSH NOTIFICATION SUBSCRIPTIONS
-- ─────────────────────────────────────────
create table if not exists push_subscriptions (
  id         uuid primary key default uuid_generate_v4(),
  student_id uuid references students(id) on delete cascade,
  endpoint   text unique not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- ADD admin_feedback TO leads IF MISSING
-- ─────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'leads' and column_name = 'admin_feedback'
  ) then
    alter table leads add column admin_feedback text;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- ADD notices TO destination_roadmaps IF MISSING
-- ─────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'destination_roadmaps' and column_name = 'notices'
  ) then
    alter table destination_roadmaps add column notices text;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- SEED: Vistula University / German universities
-- MOVED to 20260723010000_full_schema_gap_fill.sql — the live `programs`
-- table predates this file and never had university_id/name/level/tuition_eur
-- columns (it uses a denormalized program_name/university/tuition_fee shape
-- instead), so these inserts failed with "column does not exist". The
-- corrected seed runs after that migration adds the real columns.
-- ─────────────────────────────────────────
