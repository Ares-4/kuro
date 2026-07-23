-- ─────────────────────────────────────────
-- FIX: leads inserts from ContactPage, PromoBanner, KuroChatWidget,
-- and ReadinessCheckModal reference columns that were never migrated,
-- causing those forms to fail on submit.
-- ─────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'leads' and column_name = 'goal'
  ) then
    alter table leads add column goal text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'leads' and column_name = 'intake_form'
  ) then
    alter table leads add column intake_form text;
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- Admin push subscriptions: push_subscriptions was student-only.
-- Add is_admin so the site owner's device(s) can subscribe too.
-- ─────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'push_subscriptions' and column_name = 'is_admin'
  ) then
    alter table push_subscriptions add column is_admin boolean not null default false;
  end if;
end;
$$;

alter table push_subscriptions alter column student_id drop not null;
