-- ============================================================================
-- SECURITY LOCKDOWN (audited 2026-11-09)
--
-- Before this migration:
--   * anonymous visitors could read leads, chat sessions/messages, email logs,
--     activity logs, admin profiles, admin settings, contact inquiries, push
--     subscriptions and every community chat message
--   * any logged-in student could read every student row, read/modify/delete
--     every application, rewrite site_settings, and post chat messages as anyone
--   * anyone could overwrite/delete site assets and upload into public buckets
--   * several admin policies trusted a hard-coded email ('admin@kuro.com')
--   * an anon-executable SECURITY DEFINER function held the Vercel deploy hook
--
-- Rules after this migration:
--   * admin = row in public.admins (checked by public.is_admin())
--   * public INSERT stays only where a public form needs it (leads, applicants,
--     contact form, chat widget, logs); nobody but admins reads that data back
--   * students read/write only their own rows
-- Idempotent: safe to run more than once.
-- ============================================================================

-- ── Helpers ──────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- The caller's own students.id values (security definer avoids RLS recursion)
create or replace function public.my_student_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select s.id from public.students s where s.user_id = auth.uid();
$$;
revoke all on function public.my_student_ids() from public;
grant execute on function public.my_student_ids() to authenticated;

-- ── students ─────────────────────────────────────────────────────────────────
drop policy if exists "Authenticated users can view all students" on public.students;
drop policy if exists "Students can insert their own data" on public.students;   -- was WITH CHECK (true)
drop policy if exists "Students can view own row" on public.students;
create policy "Students can view own row" on public.students
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Students can update their own data" on public.students;  -- duplicate of the authenticated one
drop policy if exists "Students can update own data" on public.students;
create policy "Students can update own data" on public.students
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "admins can read students" on public.students;
drop policy if exists "Admins manage students" on public.students;
create policy "Admins manage students" on public.students
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Community chat shows other members' names: only id + full_name, only for
-- people who post in a group the caller belongs to.
create or replace function public.get_student_display_names(ids uuid[])
returns table (id uuid, full_name text)
language sql stable security definer set search_path = public as $$
  select s.id, s.full_name
  from public.students s
  where s.id = any(ids)
    and (
      public.is_admin()
      or s.id in (
        select cm.student_id from public.community_messages cm
        where cm.group_id in (
          select gm.group_id from public.group_members gm
          where gm.student_id in (select public.my_student_ids())
        )
      )
    );
$$;
revoke all on function public.get_student_display_names(uuid[]) from public;
grant execute on function public.get_student_display_names(uuid[]) to authenticated;

-- ── applications ─────────────────────────────────────────────────────────────
drop policy if exists "Admins manage applications" on public.applications;          -- was USING (true)
drop policy if exists "admin can read applications" on public.applications;          -- hard-coded email
drop policy if exists "admins can read applications" on public.applications;
drop policy if exists "admins can update applications" on public.applications;
create policy "Admins manage applications" on public.applications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Students can create applications" on public.applications;   -- was WITH CHECK (true)
create policy "Students can create applications" on public.applications
  for insert to authenticated with check (student_id in (select public.my_student_ids()));
drop policy if exists "Students can view their own applications" on public.applications;
create policy "Students can view their own applications" on public.applications
  for select to authenticated using (student_id in (select public.my_student_ids()));
drop policy if exists "Students can update their own applications" on public.applications;
create policy "Students can update their own applications" on public.applications
  for update to authenticated
  using (student_id in (select public.my_student_ids()))
  with check (student_id in (select public.my_student_ids()));

-- ── leads (public forms insert; only admins read/manage) ─────────────────────
drop policy if exists "Admins can view leads" on public.leads;
drop policy if exists "Admins can manage leads" on public.leads;
create policy "Admins can manage leads" on public.leads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── applicants (public apply page inserts) ───────────────────────────────────
drop policy if exists "Admins can manage applicants" on public.applicants;
create policy "Admins can manage applicants" on public.applicants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── contact / chat / logs: insert stays public, reads become admin-only ─────
drop policy if exists "Anyone can view contact inquiries" on public.contact_inquiries;
drop policy if exists "Admins can view contact inquiries" on public.contact_inquiries;
create policy "Admins can view contact inquiries" on public.contact_inquiries
  for select to authenticated using (public.is_admin());

drop policy if exists "Users can view their own sessions" on public.chat_sessions;
drop policy if exists "Admins can view chat sessions" on public.chat_sessions;
create policy "Admins can view chat sessions" on public.chat_sessions
  for select to authenticated using (public.is_admin());

drop policy if exists "Users can view their own messages" on public.chat_messages;
drop policy if exists "Admins can view chat messages" on public.chat_messages;
create policy "Admins can view chat messages" on public.chat_messages
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can view logs" on public.activity_logs;
create policy "Admins can view logs" on public.activity_logs
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can view email logs" on public.email_logs;
create policy "Admins can view email logs" on public.email_logs
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can read notifications" on public.admin_notifications;
drop policy if exists "Admins can mark read" on public.admin_notifications;
drop policy if exists "Admins manage admin_notifications" on public.admin_notifications;
create policy "Admins manage admin_notifications" on public.admin_notifications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── admin tables ─────────────────────────────────────────────────────────────
drop policy if exists "Admins view all profiles" on public.admin_profiles;
create policy "Admins view all profiles" on public.admin_profiles
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can view settings" on public.admin_settings;
drop policy if exists "Signed-in users read advisor config" on public.admin_settings;
create policy "Signed-in users read advisor config" on public.admin_settings
  for select to authenticated using (key = 'advisor_config');

-- Policies that trusted a hard-coded email or admin_users email match
drop policy if exists "Admins manage groups" on public.community_groups;
create policy "Admins manage groups" on public.community_groups
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage destination weights" on public.destination_weights;
create policy "Admins manage destination weights" on public.destination_weights
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins manage moderators" on public.moderators;
create policy "Admins manage moderators" on public.moderators
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins full access public_content" on public.public_content;
drop policy if exists "Admins all public_content" on public.public_content;
create policy "Admins all public_content" on public.public_content
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins full access history" on public.public_content_history;
drop policy if exists "Admins read history" on public.public_content_history;
create policy "Admins full access history" on public.public_content_history
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── site_settings: public read stays; only admins write ─────────────────────
drop policy if exists "Allow authenticated users to update site_settings" on public.site_settings;
drop policy if exists "Allow authenticated users to delete site_settings" on public.site_settings;
drop policy if exists "Allow authenticated users to insert site_settings" on public.site_settings;
drop policy if exists "Admins insert site_settings" on public.site_settings;
drop policy if exists "Admins update site_settings" on public.site_settings;
drop policy if exists "Admins delete site_settings" on public.site_settings;
create policy "Admins insert site_settings" on public.site_settings
  for insert to authenticated with check (public.is_admin());
create policy "Admins update site_settings" on public.site_settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete site_settings" on public.site_settings
  for delete to authenticated using (public.is_admin());

-- ── blog: drafts were readable through a USING (true) duplicate ─────────────
drop policy if exists "Public read blog_posts" on public.blog_posts;

-- ── community ────────────────────────────────────────────────────────────────
drop policy if exists "Read messages" on public.community_messages;
drop policy if exists "Members read group messages" on public.community_messages;
create policy "Members read group messages" on public.community_messages
  for select to authenticated using (
    public.is_admin()
    or group_id in (select gm.group_id from public.group_members gm where gm.student_id in (select public.my_student_ids()))
  );
drop policy if exists "Send messages" on public.community_messages;
drop policy if exists "Members send own messages" on public.community_messages;
create policy "Members send own messages" on public.community_messages
  for insert to authenticated with check (
    student_id in (select public.my_student_ids())
    and group_id in (select gm.group_id from public.group_members gm where gm.student_id in (select public.my_student_ids()))
  );

drop policy if exists "Public read members" on public.group_members;
drop policy if exists "Signed-in read members" on public.group_members;
create policy "Signed-in read members" on public.group_members
  for select to authenticated using (true);
drop policy if exists "Students join groups" on public.group_members;
create policy "Students join groups" on public.group_members
  for insert to authenticated with check (student_id in (select public.my_student_ids()));

drop policy if exists "Students create groups" on public.community_groups;
create policy "Students create groups" on public.community_groups
  for insert to authenticated with check (true);
drop policy if exists "Students can create groups" on public.hub_groups;
create policy "Students can create groups" on public.hub_groups
  for insert to authenticated with check (true);
drop policy if exists "Students can flag content" on public.content_flags;
create policy "Students can flag content" on public.content_flags
  for insert to authenticated with check (true);
drop policy if exists "Students can create connections" on public.student_connections;
create policy "Students can create connections" on public.student_connections
  for insert to authenticated with check (requester_id in (select public.my_student_ids()));
drop policy if exists "Students can update their own posts" on public.hub_posts;
create policy "Students can update their own posts" on public.hub_posts
  for update to authenticated
  using (student_id in (select public.my_student_ids()))
  with check (student_id in (select public.my_student_ids()));

-- ── push_subscriptions: no direct table access; RPCs keyed by the secret endpoint ──
drop policy if exists "Anyone can manage push subscriptions" on public.push_subscriptions;
drop policy if exists "Admins read push subscriptions" on public.push_subscriptions;
create policy "Admins read push subscriptions" on public.push_subscriptions
  for select to authenticated using (public.is_admin());

create or replace function public.register_push_subscription(
  p_endpoint text, p_p256dh text, p_auth text, p_as_admin boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare v_student uuid;
begin
  if p_endpoint is null or p_endpoint !~ '^https://' or length(p_endpoint) > 1000 then
    raise exception 'invalid endpoint';
  end if;
  if p_as_admin and not public.is_admin() then
    raise exception 'not allowed';
  end if;
  select id into v_student from public.students where user_id = auth.uid() limit 1;
  if not p_as_admin and v_student is null then
    raise exception 'sign in required';
  end if;
  insert into public.push_subscriptions (endpoint, p256dh, auth, student_id, is_admin)
  values (p_endpoint, p_p256dh, p_auth, case when p_as_admin then null else v_student end, coalesce(p_as_admin, false))
  on conflict (endpoint) do update
    set p256dh = excluded.p256dh, auth = excluded.auth,
        student_id = excluded.student_id, is_admin = excluded.is_admin;
end;
$$;
revoke all on function public.register_push_subscription(text, text, text, boolean) from public;
grant execute on function public.register_push_subscription(text, text, text, boolean) to authenticated;

create or replace function public.remove_push_subscription(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.push_subscriptions where endpoint = p_endpoint;
$$;
revoke all on function public.remove_push_subscription(text) from public;
grant execute on function public.remove_push_subscription(text) to anon, authenticated;

-- ── scholarship_subscriptions: RPC instead of open UPDATE ───────────────────
drop policy if exists "Anyone can update their scholarship subscription" on public.scholarship_subscriptions;
drop policy if exists "Anyone can subscribe to scholarships" on public.scholarship_subscriptions;

create or replace function public.set_scholarship_subscription(p_scholarship uuid, p_email text, p_subscribe boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_email text := lower(btrim(p_email));
begin
  if v_email is null or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 254 then
    raise exception 'invalid email';
  end if;
  -- signed-in users may only manage their own address
  if auth.uid() is not null and v_email <> lower(coalesce(auth.jwt() ->> 'email', v_email)) then
    raise exception 'email mismatch';
  end if;
  if p_subscribe then
    insert into public.scholarship_subscriptions (scholarship_id, email, user_id)
    values (p_scholarship, v_email, auth.uid())
    on conflict (scholarship_id, email) do nothing;
  else
    delete from public.scholarship_subscriptions where scholarship_id = p_scholarship and email = v_email;
  end if;
end;
$$;
revoke all on function public.set_scholarship_subscription(uuid, text, boolean) from public;
grant execute on function public.set_scholarship_subscription(uuid, text, boolean) to anon, authenticated;

-- ── Per-write deploy triggers: replaced by the daily Vercel cron; the function
--    also embedded the (now leaked) deploy-hook URL and was anon-executable ──
drop trigger if exists deploy_on_programs_change on public.programs;
drop trigger if exists deploy_on_scholarships_change on public.scholarships;
drop trigger if exists deploy_on_universities_change on public.universities;
drop trigger if exists deploy_on_visa_info_change on public.destination_visa_info;
drop function if exists public.trigger_deploy_hook();

-- ============================================================================
-- STORAGE
-- ============================================================================
-- Size / type limits on buckets the public can write to
update storage.buckets set file_size_limit = 5242880, allowed_mime_types = array['application/pdf']
  where id = 'eligibility-results';
update storage.buckets set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['application/pdf','image/jpeg','image/png','image/webp']
  where id = 'apply-documents';                                   -- held passports publicly
update storage.buckets set file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif']
  where id = 'hub-images';
update storage.buckets set file_size_limit = 10485760 where id in ('student-documents','documents');

-- Admin-only writes to site/brand buckets (previously ANYONE could insert/update/delete)
drop policy if exists "Admin Delete Site Assets" on storage.objects;
drop policy if exists "Admin Update Site Assets" on storage.objects;
drop policy if exists "Admin Upload Site Assets" on storage.objects;
drop policy if exists "Admin Upload Blog Images" on storage.objects;
drop policy if exists "Admin Upload Media" on storage.objects;
drop policy if exists "Admins write public buckets" on storage.objects;
create policy "Admins write public buckets" on storage.objects
  for all to authenticated
  using (bucket_id in ('site-assets','blog-images','media-content') and public.is_admin())
  with check (bucket_id in ('site-assets','blog-images','media-content') and public.is_admin());

drop policy if exists "Admins can select all objects" on storage.objects;
drop policy if exists "Admins manage all objects" on storage.objects;
create policy "Admins manage all objects" on storage.objects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 'documents' bucket: every signed-in user could read every file
drop policy if exists "Authenticated users can read documents" on storage.objects;
drop policy if exists "Authenticated users can upload documents" on storage.objects;
drop policy if exists "Users manage own files in documents" on storage.objects;
create policy "Users manage own files in documents" on storage.objects
  for all to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Eligibility PDFs: uploads must be PDFs at the bucket root
drop policy if exists "Public Upload Eligibility Results" on storage.objects;
create policy "Public Upload Eligibility Results" on storage.objects
  for insert with check (bucket_id = 'eligibility-results' and lower(name) like '%.pdf' and position('/' in name) = 0);
-- Listing the bucket is not needed (files are opened by their unguessable URL)
drop policy if exists "Public Read Eligibility Results" on storage.objects;

-- Hub images: signed-in users, into their own folder
drop policy if exists "Student Upload Hub Images" on storage.objects;
create policy "Student Upload Hub Images" on storage.objects
  for insert to authenticated with check (bucket_id = 'hub-images');

-- Duplicate student-documents policies collapse into the owner ALL policy that already exists
drop policy if exists "Students can upload their documents" on storage.objects;
drop policy if exists "Students can view their documents" on storage.objects;
