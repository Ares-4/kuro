-- Admins are told about every new student account (Google or email), and again
-- when the student finishes the required profile step (/welcome).
-- Each event: a row in admin_notifications (shown in Admin -> Notifications)
-- plus a push to subscribed admin devices via the send-push edge function.
-- Errors are swallowed so a notification problem can never block a signup.

create or replace function public.push_admins(p_title text, p_body text, p_url text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform net.http_post(
    url := 'https://akrbfwmqhnbopqlvawhw.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcmJmd21xaG5ib3BxbHZhd2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjgwMzksImV4cCI6MjA4MTIwNDAzOX0.-rJYbnfNV-0vwCqKpFcCQKUG3sskZZgDCi7zsWuTPk8',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcmJmd21xaG5ib3BxbHZhd2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjgwMzksImV4cCI6MjA4MTIwNDAzOX0.-rJYbnfNV-0vwCqKpFcCQKUG3sskZZgDCi7zsWuTPk8'
    ),
    body := jsonb_build_object('title', p_title, 'body', left(p_body, 300), 'url', p_url)
  );
exception when others then
  null;
end;
$$;

create or replace function public.notify_admin_new_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_provider text := coalesce(new.raw_app_meta_data ->> 'provider', 'email');
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1));
  v_body text;
begin
  v_body := v_name || ' (' || coalesce(new.email, 'no email') || ') created an account with ' || initcap(v_provider) || '.';
  insert into public.admin_notifications (type, title, body, metadata)
  values ('new_account', 'New student account', v_body,
          jsonb_build_object('user_id', new.id, 'email', new.email, 'provider', v_provider));
  perform public.push_admins('New student account', v_body, '/admin/notifications');
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_notify_admin on auth.users;
create trigger on_auth_user_created_notify_admin
  after insert on auth.users
  for each row execute function public.notify_admin_new_account();

-- Profile completed: preferences.onboarded_at set for the first time.
create or replace function public.notify_admin_profile_completed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  p jsonb := coalesce(new.preferences, '{}'::jsonb);
  v_body text;
begin
  if p ? 'onboarded_at' and (tg_op = 'INSERT' or not coalesce(old.preferences, '{}'::jsonb) ? 'onboarded_at') then
    v_body := new.full_name || ' (' || new.email || ') from ' || coalesce(new.country, '?')
      || ': ' || coalesce(p ->> 'study_level', '?') || ' in ' || coalesce(p ->> 'destination', '?')
      || ', intake ' || coalesce(p ->> 'intake', '?') || '. WhatsApp ' || coalesce(new.phone, '?') || '.';
    insert into public.admin_notifications (type, title, body, metadata)
    values ('profile_completed', 'Student profile completed', v_body,
            jsonb_build_object('student_id', new.id, 'user_id', new.user_id));
    perform public.push_admins('Student profile completed', v_body, '/admin/notifications');
  end if;
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists on_student_profile_completed on public.students;
create trigger on_student_profile_completed
  after insert or update of preferences on public.students
  for each row execute function public.notify_admin_profile_completed();

revoke execute on function public.push_admins(text, text, text) from public, anon, authenticated;
revoke execute on function public.notify_admin_new_account() from public, anon, authenticated;
revoke execute on function public.notify_admin_profile_completed() from public, anon, authenticated;
