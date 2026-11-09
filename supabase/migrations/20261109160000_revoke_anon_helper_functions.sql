-- Follow-up to 20261109140000: Supabase grants EXECUTE on new public functions to
-- anon explicitly (default privileges), so `revoke ... from public` did not remove it.
-- These helpers return nothing useful to anonymous callers, but close them anyway.
revoke execute on function public.my_student_ids() from anon;
revoke execute on function public.get_student_display_names(uuid[]) from anon;
revoke execute on function public.register_push_subscription(text, text, text, boolean) from anon;
