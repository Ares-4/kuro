-- Paid readiness checks as trackable orders. The site promises the EUR 19
-- Premium report "reviewed by an expert, PDF within 24 hours"; this gives
-- admins a queue with a due time, a report upload and a delivered status.
-- Rows are written by stripe-webhook (service role) on checkout.session.completed.

create table if not exists public.readiness_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  product text not null,                       -- readiness_basic | readiness_premium
  amount_cents integer,
  currency text,
  email text,
  lead_id uuid,
  answers jsonb,                               -- the student's readiness answers (from the lead)
  status text not null default 'paid',         -- paid | in_review | delivered
  due_at timestamptz,                          -- premium: paid + 24h
  report_url text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.readiness_orders enable row level security;
drop policy if exists "Admins manage readiness orders" on public.readiness_orders;
create policy "Admins manage readiness orders" on public.readiness_orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.readiness_orders from anon;

-- Finished reports (PDF). Public bucket with unguessable file names, like
-- eligibility-results; only admins can upload or change files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('readiness-reports', 'readiness-reports', true, 10485760, array['application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['application/pdf'];

drop policy if exists "Admins upload readiness reports" on storage.objects;
create policy "Admins upload readiness reports" on storage.objects
  for insert to authenticated with check (bucket_id = 'readiness-reports' and public.is_admin());
drop policy if exists "Admins manage readiness reports" on storage.objects;
create policy "Admins manage readiness reports" on storage.objects
  for update to authenticated using (bucket_id = 'readiness-reports' and public.is_admin());

insert into email_templates (name, subject, body)
select 'readiness_report', 'Your Kuro Premium readiness report',
  '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">'
  || '<h1 style="font-size:22px;color:#0b1224;margin:0 0 12px">Your report is ready</h1>'
  || '<p>Hi {{name}},</p><p>Thank you for your Premium readiness check. An advisor has reviewed your profile and your report is ready: your visa risk rating, financial check and destination comparison, with clear next steps.</p>'
  || '<p style="margin:24px 0"><a href="{{link}}" style="background:#2563eb;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Download your report (PDF)</a></p>'
  || '<p>If you continue with our full application service, your EUR 19 is deducted from the fee. Reply to this email with any questions.</p>'
  || '<p>Best wishes,<br>Kuro Educational Consultancy</p></div>'
where not exists (select 1 from email_templates where name = 'readiness_report');
