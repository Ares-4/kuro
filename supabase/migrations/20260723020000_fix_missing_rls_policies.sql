-- ─────────────────────────────────────────────────────────────
-- FIX: tables with RLS enabled but ZERO policies defined.
--
-- Confirmed via direct DB inspection (pg_policies) on 2026-07-23 — these
-- tables silently deny ALL access to anon/authenticated clients (only
-- service-role bypasses RLS). No error is raised on SELECT; queries just
-- return zero rows, which is why these looked like "empty" features
-- rather than "broken" ones from the outside.
--
-- Confirmed currently live impact:
--   - country_info has 5 real rows, completely inaccessible to the
--     student dashboard (CountriesView.jsx, DestinationInfoSection.jsx)
--   - scholarships / university_deadlines are empty right now, but would
--     be invisible on /scholarships and /deadlines the moment an admin
--     adds one via AdminScholarships.jsx / AdminDeadlines.jsx
--   - scholarship_subscriptions blocks the "notify me" subscribe button
--     on /scholarships
--   - push_subscriptions blocks the web push feature added this session
--     from ever completing a subscribe on the client side
--   - admin_users blocks UserManagement.jsx's admin listing
--
-- Write-access policies use the same `admins` table EXISTS-check pattern
-- already established on applications/students, not the fully-open
-- `true`-for-everyone pattern seen on destinations/faqs/testimonials
-- (that older pattern lets any anon key holder write to those tables
-- directly via the REST API — flagging as a separate follow-up, not
-- changed here since it's pre-existing behavior on tables that already
-- "work").
-- ─────────────────────────────────────────────────────────────

-- SCHOLARSHIPS: public read, admin manage
drop policy if exists "Public read scholarships" on scholarships;
create policy "Public read scholarships"
  on scholarships for select using (true);

drop policy if exists "Admins manage scholarships" on scholarships;
create policy "Admins manage scholarships"
  on scholarships for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- UNIVERSITY DEADLINES: public read, admin manage
drop policy if exists "Public read university_deadlines" on university_deadlines;
create policy "Public read university_deadlines"
  on university_deadlines for select using (true);

drop policy if exists "Admins manage university_deadlines" on university_deadlines;
create policy "Admins manage university_deadlines"
  on university_deadlines for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- COUNTRY INFO: public read (student dashboard), admin manage
drop policy if exists "Public read country_info" on country_info;
create policy "Public read country_info"
  on country_info for select using (true);

drop policy if exists "Admins manage country_info" on country_info;
create policy "Admins manage country_info"
  on country_info for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

-- SCHOLARSHIP SUBSCRIPTIONS: anyone can subscribe (insert/update via
-- upsert onConflict), admin can view subscriber list
drop policy if exists "Anyone can subscribe to scholarships" on scholarship_subscriptions;
create policy "Anyone can subscribe to scholarships"
  on scholarship_subscriptions for insert with check (true);

drop policy if exists "Anyone can update their scholarship subscription" on scholarship_subscriptions;
create policy "Anyone can update their scholarship subscription"
  on scholarship_subscriptions for update using (true) with check (true);

drop policy if exists "Admins view scholarship subscriptions" on scholarship_subscriptions;
create policy "Admins view scholarship subscriptions"
  on scholarship_subscriptions for select
  using (exists (select 1 from admins a where a.user_id = auth.uid()));

-- PUSH SUBSCRIPTIONS: client-side subscribe/unsubscribe needs to write its
-- own row without being tied to a verified admin/student session at the DB
-- level (the app doesn't currently pass anything RLS could match against
-- for ownership) - open write, matching how the feature was built.
drop policy if exists "Anyone can manage push subscriptions" on push_subscriptions;
create policy "Anyone can manage push subscriptions"
  on push_subscriptions for all using (true) with check (true);

-- ADMIN USERS: admin-only read/manage (mirrors the admins-table pattern
-- used elsewhere; UserManagement.jsx lists and deletes from this table)
drop policy if exists "Admins manage admin_users" on admin_users;
create policy "Admins manage admin_users"
  on admin_users for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));
