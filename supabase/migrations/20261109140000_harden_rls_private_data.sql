-- SECURITY: lock down tables whose "admin" SELECT/ALL policies were written as `using (true)`.
-- Before this migration an anonymous visitor (anon key only, no login) could read leads,
-- chat sessions, email logs, admin profiles, admin settings and activity logs, and any
-- logged-in student could read every student row, read/modify every application and
-- edit/delete site_settings. Audited 2026-11-09.
--
-- Public INSERT policies (lead forms, chat widget, contact form, logs) are kept unchanged.

-- ── Admin check (security definer so it can read admins regardless of caller RLS) ──
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid())
      or exists (
        select 1 from public.admin_users u
        where lower(u.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ── leads ─────────────────────────────────────────────────────
drop policy if exists "Admins can view leads" on public.leads;
create policy "Admins can view leads" on public.leads
  for select using (public.is_admin());

-- ── contact_inquiries ────────────────────────────────────────
drop policy if exists "Anyone can view contact inquiries" on public.contact_inquiries;
create policy "Admins can view contact inquiries" on public.contact_inquiries
  for select using (public.is_admin());

-- ── chat_sessions / chat_messages (written by the widget, read only in admin) ──
drop policy if exists "Users can view their own sessions" on public.chat_sessions;
create policy "Admins can view chat sessions" on public.chat_sessions
  for select using (public.is_admin());

drop policy if exists "Users can view their own messages" on public.chat_messages;
create policy "Admins can view chat messages" on public.chat_messages
  for select using (public.is_admin());

-- ── logs ─────────────────────────────────────────────────────
drop policy if exists "Admins can view logs" on public.activity_logs;
create policy "Admins can view logs" on public.activity_logs
  for select using (public.is_admin());

drop policy if exists "Admins can view email logs" on public.email_logs;
create policy "Admins can view email logs" on public.email_logs
  for select using (public.is_admin());

-- ── admin_profiles (own-row policies already exist) ─────────
drop policy if exists "Admins view all profiles" on public.admin_profiles;
create policy "Admins view all profiles" on public.admin_profiles
  for select using (public.is_admin());

-- ── admin_settings: admins manage; students may read only the advisor card ──
drop policy if exists "Admins can view settings" on public.admin_settings;
create policy "Signed-in users read advisor config" on public.admin_settings
  for select to authenticated using (key = 'advisor_config');

-- ── applications: drop the blanket ALL policy; student-own and admin policies remain ──
drop policy if exists "Admins manage applications" on public.applications;
create policy "Admins manage applications" on public.applications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── students: own row (+ admins via existing policy) ─────────
drop policy if exists "Authenticated users can view all students" on public.students;
create policy "Students can view own row" on public.students
  for select to authenticated using (auth.uid() = user_id);

-- Community chat shows other members' names: expose only id + full_name, only to members
create or replace function public.get_student_display_names(ids uuid[])
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.full_name
  from public.students s
  where s.id = any(ids)
    and auth.uid() is not null;
$$;
revoke all on function public.get_student_display_names(uuid[]) from public;
grant execute on function public.get_student_display_names(uuid[]) to authenticated;

-- ── site_settings: public read stays; only admins write ──────
drop policy if exists "Allow authenticated users to update site_settings" on public.site_settings;
drop policy if exists "Allow authenticated users to delete site_settings" on public.site_settings;
drop policy if exists "Allow authenticated users to insert site_settings" on public.site_settings;
create policy "Admins insert site_settings" on public.site_settings
  for insert to authenticated with check (public.is_admin());
create policy "Admins update site_settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete site_settings" on public.site_settings
  for delete to authenticated using (public.is_admin());
