-- ─────────────────────────────────────────────────────────────
-- FIX: tables that got RLS enabled + a public "select" policy in
-- RUN_IN_SUPABASE_EDITOR.sql (2026-07-23 Security Advisor pass) but never
-- got a write policy. Any admin insert/update/delete on these tables fails
-- with "new row violates row-level security policy" — that's exactly the
-- country_updates save-failed error seen tonight (2026-07-30) in
-- AdminCountryUpdates.jsx. destination_roadmaps and site_identity already
-- got their admin policy in separate follow-up migrations; these four did
-- not.
-- ─────────────────────────────────────────────────────────────

-- COUNTRY_UPDATES: public read (already exists), admin manage
drop policy if exists "Admins manage country_updates" on country_updates;
create policy "Admins manage country_updates"
  on country_updates for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- DESTINATION_VISA_INFO: public read (already exists), admin manage
drop policy if exists "Admins manage destination_visa_info" on destination_visa_info;
create policy "Admins manage destination_visa_info"
  on destination_visa_info for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- KNOWLEDGE_BASE: public read (already exists), admin manage
drop policy if exists "Admins manage knowledge_base" on knowledge_base;
create policy "Admins manage knowledge_base"
  on knowledge_base for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- REQUIRED_DOCUMENTS: public read (already exists), admin manage
drop policy if exists "Admins manage required_documents" on required_documents;
create policy "Admins manage required_documents"
  on required_documents for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- ADMIN_PROFILES: only had a self-read policy — ProfileSettings.jsx also
-- inserts/upserts its own row (user_id = auth.uid()), which was silently
-- failing under RLS the same way.
drop policy if exists "Admins manage own profile" on admin_profiles;
create policy "Admins manage own profile"
  on admin_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
