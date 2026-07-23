-- ─────────────────────────────────────────────────────────────
-- LOCK DOWN: 20 tables had an "admin manage" ALL policy whose actual
-- check was `using (true)` for role `public` — meaning anyone holding the
-- public anon key (embedded in every browser bundle) could insert/update/
-- delete directly via the REST API, completely bypassing admin login.
-- Several tables had 2-3 redundant copies of this same loose policy.
--
-- Confirmed via direct pg_policies inspection on 2026-07-23. Replacing
-- every one of these with the same `admins`-table EXISTS-check pattern
-- already used correctly on applications/students/leads.
-- ─────────────────────────────────────────────────────────────

drop policy if exists "Admins all messages" on admin_messages;
create policy "Admins manage admin_messages" on admin_messages for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can update settings" on admin_settings;
create policy "Admins manage admin_settings" on admin_settings for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins can manage notes" on application_notes;
create policy "Admins manage application_notes" on application_notes for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage blogs" on blog_posts;
drop policy if exists "Admins manage blog posts" on blog_posts;
drop policy if exists "Admin all blog_posts" on blog_posts;
create policy "Admins manage blog_posts" on blog_posts for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admin all destinations" on destinations;
create policy "Admins manage destinations" on destinations for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins full access pages" on dynamic_pages;
create policy "Admins manage dynamic_pages" on dynamic_pages for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage templates" on email_templates;
create policy "Admins manage email_templates" on email_templates for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admin all faqs" on faqs;
drop policy if exists "Admins manage faqs" on faqs;
create policy "Admins manage faqs" on faqs for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admin all landing_page_settings" on landing_page_settings;
create policy "Admins manage landing_page_settings" on landing_page_settings for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage media" on media_library;
create policy "Admins manage media_library" on media_library for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage notices" on notices;
create policy "Admins manage notices" on notices for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins full access sections" on page_sections;
create policy "Admins manage page_sections" on page_sections for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage portal settings" on portal_settings;
create policy "Admins manage portal_settings" on portal_settings for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admin all programs" on programs;
create policy "Admins manage programs" on programs for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage services" on services;
drop policy if exists "Admin all services" on services;
create policy "Admins manage services" on services for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage site identity" on site_identity;
create policy "Admins manage site_identity" on site_identity for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage notes" on student_notes;
create policy "Admins manage student_notes" on student_notes for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage system settings" on system_settings;
create policy "Admins manage system_settings" on system_settings for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admins manage testimonials" on testimonials;
drop policy if exists "Admin all testimonials" on testimonials;
create policy "Admins manage testimonials" on testimonials for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));

drop policy if exists "Admin all universities" on universities;
create policy "Admins manage universities" on universities for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));
