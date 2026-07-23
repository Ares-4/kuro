-- ─────────────────────────────────────────────────────────────
-- FULL SCHEMA GAP FILL
--
-- The baseline migration (20260418000000_kuro_schema.sql) covers only part
-- of what the app actually reads/writes. The live Supabase project has
-- clearly grown extra tables/columns over time via the Studio UI that were
-- never captured back into a migration file. This migration reverse-
-- engineers everything the codebase references but the migrations don't
-- define, so a fresh Supabase project can be brought up to the same shape
-- as production, and so nothing here can drift again unnoticed.
--
-- Idempotent throughout: safe to run against a DB that already has some
-- (or all) of this, and safe to re-run.
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────
-- APPLICATIONS
-- Confirmed against a real information_schema.columns dump from the live
-- project (2026-07-23) — this is the verified shape, not inferred from
-- app code. Used by ApplicationForm.jsx, ApplicationPage.jsx,
-- AdminApplications.jsx, AdminOverview.jsx, DashboardHome.jsx.
-- ─────────────────────────────────────────
create table if not exists applications (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid references students(id) on delete cascade,
  program_id         uuid references programs(id) on delete set null,
  status             text default 'pending',
  payment_status     text default 'unpaid',
  payment_intent_id  text,
  documents          jsonb default '[]',
  submitted_at       timestamptz,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  progress_step      int default 1,
  paid_at            timestamptz,
  stripe_session_id  text,
  admin_notes        text
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'applications' and column_name = 'payment_intent_id') then
    alter table applications add column payment_intent_id text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'applications' and column_name = 'submitted_at') then
    alter table applications add column submitted_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'applications' and column_name = 'updated_at') then
    alter table applications add column updated_at timestamptz default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'applications' and column_name = 'paid_at') then
    alter table applications add column paid_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'applications' and column_name = 'stripe_session_id') then
    alter table applications add column stripe_session_id text;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- APPLICATION NOTES (structured admin notes per application, separate from
-- applications.admin_notes — this one supports per-note student visibility).
-- src/components/dashboard/ApplicationPage.jsx fetchAdminNotes().
-- Confirmed against the live schema dump.
-- ─────────────────────────────────────────
create table if not exists application_notes (
  id                     uuid primary key default gen_random_uuid(),
  application_id         uuid references applications(id) on delete cascade,
  admin_id               uuid,
  note_text              text not null,
  is_visible_to_student  boolean default true,
  created_at             timestamptz default timezone('utc'::text, now()),
  updated_at             timestamptz default timezone('utc'::text, now())
);

-- ─────────────────────────────────────────
-- SITE IDENTITY (Admin → Settings → General)
-- src/components/admin/settings/GeneralSettings.jsx writes here.
-- src/lib/settingsStore.js getActiveSiteIdentity() and the public
-- Navbar/Footer read it. This is the core "admin settings should affect
-- public pages" table and it did not exist — every save in General
-- Settings was silently failing, and Navbar/Footer always fell back to
-- hardcoded defaults.
-- ─────────────────────────────────────────
create table if not exists site_identity (
  id             uuid primary key default uuid_generate_v4(),
  site_name      text,
  description    text,
  logo_url       text,
  contact_email  text,
  contact_phone  text,
  address        text,
  meta_keywords  text,
  social_links   jsonb not null default '{}',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- SYSTEM SETTINGS (key/value, mirrors site_settings)
-- src/lib/settingsStore.js getSystemSetting/setSystemSetting.
-- Stores 'system_preferences', 'admin_notifications', 'portal_branding'.
-- ─────────────────────────────────────────
create table if not exists system_settings (
  key        text primary key,
  value      jsonb not null,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- ADMIN SETTINGS (key/value — a THIRD settings table, distinct from
-- system_settings and site_settings). src/components/admin/AdminSettings.jsx
-- and src/components/dashboard/StudentHub.jsx use this one, storing
-- 'main_config' and 'advisor_config'. Confirmed against the live schema
-- dump: PK is `id`, not `key` — `key` only has a separate unique
-- constraint, which is exactly why AdminSettings.jsx's .upsert() with no
-- onConflict was colliding (it matched on the PK `id`, always a fresh
-- value, instead of `key`; fixed separately in application code).
-- ─────────────────────────────────────────
create table if not exists admin_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  value      jsonb not null,
  updated_at timestamptz default now(),
  updated_by uuid
);

-- ─────────────────────────────────────────
-- ADMIN PROFILES (per-admin-account profile, distinct from admin_users).
-- src/components/admin/settings/ProfileSettings.jsx. Confirmed against the
-- live schema dump. NOTE: ProfileSettings.jsx upserts with
-- `{ onConflict: 'user_id' }`, which requires a unique constraint on
-- user_id — the live dump's column list doesn't show one. Adding it here;
-- if it's genuinely missing live, this is the fix for that save failing.
-- ─────────────────────────────────────────
create table if not exists admin_profiles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  phone      text,
  role       text default 'admin',
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'admin_profiles_user_id_key' and conrelid = 'admin_profiles'::regclass
  ) then
    alter table admin_profiles add constraint admin_profiles_user_id_key unique (user_id);
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- NOTICES (student-facing announcements)
-- src/components/admin/AdminNotices.jsx (write), src/components/dashboard/NoticeView.jsx (read).
-- ─────────────────────────────────────────
create table if not exists notices (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  content         text not null,
  target_audience text not null default 'all' check (target_audience in ('all','specific')),
  student_id      uuid references students(id) on delete cascade,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- KNOWLEDGE BASE (chatbot FAQ source)
-- src/components/admin/AdminKnowledgeBase.jsx (CRUD),
-- src/components/chat/KuroChatWidget.jsx (public read).
-- ─────────────────────────────────────────
create table if not exists knowledge_base (
  id         uuid primary key default uuid_generate_v4(),
  question   text not null,
  answer     text not null,
  tags       text[] not null default '{}',
  page_link  text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- DYNAMIC PAGES + PAGE SECTIONS (admin page builder)
-- src/components/admin/AdminBuilder.jsx, src/components/admin/builder/PageEditor.jsx (write),
-- src/pages/DynamicPage.jsx (public read via /page/:slug).
-- ─────────────────────────────────────────
create table if not exists dynamic_pages (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  slug             text unique not null,
  meta_description text,
  is_published     boolean not null default false,
  created_at       timestamptz not null default now()
);

create table if not exists page_sections (
  id          uuid primary key default uuid_generate_v4(),
  page_id     uuid references dynamic_pages(id) on delete cascade,
  type        text not null,
  content     jsonb not null default '{}',
  order_index int not null default 0
);

-- ─────────────────────────────────────────
-- PUBLIC CONTENT HISTORY (edit audit trail for the CMS content editor)
-- src/lib/contentService.js
-- ─────────────────────────────────────────
create table if not exists public_content_history (
  id           uuid primary key default uuid_generate_v4(),
  content_id   uuid,
  page         text,
  field_name   text,
  old_content  text,
  new_content  text,
  changed_by   uuid references auth.users(id) on delete set null,
  changed_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- DESTINATION WEIGHTS (lead scoring)
-- src/lib/leadScoringService.js — falls back to weight 10 for every
-- destination when this table is missing, silently degrading lead scoring.
-- ─────────────────────────────────────────
create table if not exists destination_weights (
  destination text primary key,
  weight      numeric not null default 10
);

insert into destination_weights (destination, weight) values
  ('default', 10)
on conflict (destination) do nothing;

-- ─────────────────────────────────────────
-- ADMIN USERS / MODERATORS / ACTIVITY LOG
-- src/components/admin/settings/UserManagement.jsx, AdminModerators.jsx.
-- ─────────────────────────────────────────
-- Confirmed against the live schema dump — matches exactly, just adding the
-- two columns (avatar_url, phone) it revealed that weren't inferred from
-- app code.
create table if not exists admin_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz default now(),
  avatar_url text,
  full_name  text,
  phone      text
);

do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'admin_users' and column_name = 'avatar_url') then
    alter table admin_users add column avatar_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'admin_users' and column_name = 'phone') then
    alter table admin_users add column phone text;
  end if;
end;
$$;

create table if not exists moderators (
  id         uuid primary key default uuid_generate_v4(),
  admin_id   uuid references admin_users(id) on delete cascade,
  name       text,
  email      text,
  created_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id         uuid primary key default uuid_generate_v4(),
  actor_id   uuid references auth.users(id) on delete set null,
  action     text not null,
  details    jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- PROGRAMS: add denormalized columns the admin Course Editor actually uses.
-- The baseline migration modeled programs normalized (university_id FK + name
-- + level + tuition_eur), but CourseEditor.jsx / AdminApplications.jsx /
-- AdminOverview.jsx / DashboardHome.jsx / GlobalSearch.jsx all read/write a
-- flat denormalized shape instead. Adding the columns actually in use;
-- leaving the normalized ones in place since they're harmless if unused.
-- ─────────────────────────────────────────
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'program_name') then
    alter table programs add column program_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'university') then
    alter table programs add column university text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'country') then
    alter table programs add column country text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'degree_level') then
    alter table programs add column degree_level text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'tuition_fee') then
    alter table programs add column tuition_fee text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'currency') then
    alter table programs add column currency text default 'EUR';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'language') then
    alter table programs add column language text default 'English';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'description') then
    alter table programs add column description text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'requirements') then
    alter table programs add column requirements jsonb not null default '[]';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'image_url') then
    alter table programs add column image_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'processing_time') then
    alter table programs add column processing_time text default '2-4 Weeks';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'application_fee') then
    alter table programs add column application_fee text default '€50';
  end if;

  -- Baseline's CREATE TABLE (fresh-install path only) makes `name` NOT NULL
  -- with no default. The seed below (and CourseEditor.jsx in the app) only
  -- ever populates `program_name`, so relax this or the insert fails on a
  -- brand-new project. No-op on your live DB, which never had this column
  -- under that constraint in the first place.
  if exists (select 1 from information_schema.columns where table_name = 'programs' and column_name = 'name') then
    alter table programs alter column name drop not null;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- NOTE: baseline's Vistula/German-university seed data was removed entirely
-- (not just moved) rather than reworked again. Every retry surfaced another
-- live-only NOT NULL column with no default (name, then duration, then
-- language) that no migration file documents — the live `programs` table
-- has drifted from every known shape via ad-hoc Studio edits, so hardcoding
-- a full column list for an INSERT here is inherently unsafe. Add real
-- course data through the admin Course Editor UI instead, which only ever
-- targets columns it knows about, or ask for one to be reconstructed once
-- you've pasted a full `information_schema.columns` dump for programs.
-- ─────────────────────────────────────────

-- ─────────────────────────────────────────
-- DESTINATIONS: cost fields shown on DestinationDetailPage/DestinationTemplatePage,
-- edited in src/components/admin/AdminDestinations.jsx.
-- ─────────────────────────────────────────
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'destinations' and column_name = 'tuition_cost') then
    alter table destinations add column tuition_cost text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'destinations' and column_name = 'living_cost') then
    alter table destinations add column living_cost text;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- DESTINATION VISA INFO: baseline migration's requirements/official_links
-- columns are dead — nothing in the app reads them. AdminVisaInfo.jsx and
-- DestinationDetailPage.jsx/DestinationTemplatePage.jsx actually use this
-- shape instead.
-- ─────────────────────────────────────────
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'destination_visa_info' and column_name = 'visa_type') then
    alter table destination_visa_info add column visa_type text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'destination_visa_info' and column_name = 'cost') then
    alter table destination_visa_info add column cost text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'destination_visa_info' and column_name = 'documents') then
    alter table destination_visa_info add column documents jsonb not null default '[]';
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'destination_visa_info' and column_name = 'notes') then
    alter table destination_visa_info add column notes text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'destination_visa_info' and column_name = 'official_link') then
    alter table destination_visa_info add column official_link text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'destination_visa_info' and column_name = 'last_verified') then
    alter table destination_visa_info add column last_verified date;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- LEADS: payment_reference used by StripePaymentModal.jsx, not in baseline.
-- ─────────────────────────────────────────
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'leads' and column_name = 'payment_reference') then
    alter table leads add column payment_reference text;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- PUBLIC CONTENT: baseline shape (page, field, value) doesn't match what
-- src/lib/contentService.js actually reads/writes (page, field_name,
-- field_label, content, content_type, section, is_active, updated_by).
-- Adding the real columns alongside the old ones (kept for safety, unused).
-- ─────────────────────────────────────────
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'public_content' and column_name = 'id') then
    alter table public_content add column id uuid default uuid_generate_v4();
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'public_content' and column_name = 'field_name') then
    alter table public_content add column field_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'public_content' and column_name = 'field_label') then
    alter table public_content add column field_label text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'public_content' and column_name = 'content') then
    alter table public_content add column content text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'public_content' and column_name = 'content_type') then
    alter table public_content add column content_type text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'public_content' and column_name = 'section') then
    alter table public_content add column section text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'public_content' and column_name = 'is_active') then
    alter table public_content add column is_active boolean not null default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'public_content' and column_name = 'updated_by') then
    alter table public_content add column updated_by uuid references auth.users(id) on delete set null;
  end if;
end;
$$;

create unique index if not exists public_content_page_field_name_key on public_content (page, field_name);
