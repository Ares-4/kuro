-- activity_logs and email_logs accepted inserts from anyone (WITH CHECK true),
-- so an anonymous visitor could forge audit entries or flood the tables.
-- activity_logs is only written by signed-in admins (admin settings pages);
-- email_logs only by edge functions using the service role, which bypasses RLS.

drop policy if exists "System can insert logs" on public.activity_logs;
create policy "Admins insert activity logs" on public.activity_logs
  for insert to authenticated
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
revoke insert on public.activity_logs from anon;

drop policy if exists "System can insert email logs" on public.email_logs;
revoke insert, update, delete on public.email_logs from anon, authenticated;
