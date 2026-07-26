-- system_settings only had an admin-only "for all" policy (from
-- 20260723030000_lock_down_open_admin_policies.sql), but SystemSettingsContext
-- is mounted app-wide and reads the 'portal_branding' key for every visitor,
-- including anonymous ones. With no public SELECT policy:
--   1. Branding (logo/primary color) silently fell back to defaults for
--      anonymous visitors — the fetch was RLS-blocked and swallowed.
--   2. The realtime subscription on system_settings looped forever with
--      CHANNEL_ERROR (Realtime enforces RLS on the subscribing role too).
--
-- Scope the public read to just the 'portal_branding' key so
-- system_preferences / admin_notifications stay admin-only.
drop policy if exists "public read portal_branding" on system_settings;
create policy "public read portal_branding"
  on system_settings for select using (key = 'portal_branding');
