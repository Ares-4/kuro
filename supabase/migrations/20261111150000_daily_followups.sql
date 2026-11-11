-- Timed follow-up emails, sent by the daily-followups edge function.
-- followup_sends records every send (unique), so nobody gets the same email twice.

create table if not exists public.followup_sends (
  kind text not null,          -- guide_followup | deadline_30 | deadline_7
  ref text not null,           -- guide edition or scholarship id
  email text not null,
  sent_at timestamptz not null default now(),
  primary key (kind, ref, email)
);
alter table public.followup_sends enable row level security;  -- service role only
revoke all on public.followup_sends from anon, authenticated;

insert into email_templates (name, subject, body)
select v.name, v.subject, v.body from (values
(
  'guide_followup',
  'Did the Study in Europe guide help?',
  '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">'
  || '<p>Hi,</p><p>A few days ago you downloaded our Study in Europe Guide 2027. The next step most students take is finding out where they actually stand.</p>'
  || '<p>Our readiness check scores your academics, finances, documents and timeline in a few minutes, from EUR 2.99. The EUR 19 Premium report adds an expert review with your visa risk rating.</p>'
  || '<p style="margin:24px 0"><a href="https://kuroeduconsultancy.com/readiness-check" style="background:#2563eb;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">Check my readiness</a></p>'
  || '<p>Or reply to this email with your question and an advisor will help.</p>'
  || '<p>Best wishes,<br>Kuro Educational Consultancy</p>'
  || '<p style="font-size:12px;color:#64748b">This is the only follow-up we send about the guide.</p></div>'
),
(
  'scholarship_deadline_reminder',
  '{{days}} days left: {{title}}',
  '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">'
  || '<h1 style="font-size:20px;color:#0b1224;margin:0 0 12px">{{days}} days left to apply</h1>'
  || '<p>You asked us to remind you about <strong>{{title}}</strong>. The deadline is <strong>{{deadline}}</strong>.</p>'
  || '<p>Scholarship applications usually need references, certified documents and a strong motivation letter, so start now if you have not already.</p>'
  || '<p style="margin:24px 0"><a href="{{link}}" style="background:#2563eb;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">View the scholarship</a></p>'
  || '<p>Best wishes,<br>Kuro Educational Consultancy</p>'
  || '<p style="font-size:12px;color:#64748b">You can turn off alerts for this scholarship on its page.</p></div>'
)
) as v(name, subject, body)
where not exists (select 1 from email_templates t where t.name = v.name);

-- Daily at 07:00 UTC (09:00 Harare). The function is idempotent; the anon key
-- here is the public key already shipped in the website.
create extension if not exists pg_cron;
select cron.unschedule('kuro-daily-followups') where exists (select 1 from cron.job where jobname = 'kuro-daily-followups');
select cron.schedule(
  'kuro-daily-followups',
  '0 7 * * *',
  $$ select net.http_post(
       url := 'https://akrbfwmqhnbopqlvawhw.supabase.co/functions/v1/daily-followups',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcmJmd21xaG5ib3BxbHZhd2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjgwMzksImV4cCI6MjA4MTIwNDAzOX0.-rJYbnfNV-0vwCqKpFcCQKUG3sskZZgDCi7zsWuTPk8", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcmJmd21xaG5ib3BxbHZhd2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MjgwMzksImV4cCI6MjA4MTIwNDAzOX0.-rJYbnfNV-0vwCqKpFcCQKUG3sskZZgDCi7zsWuTPk8"}'::jsonb,
       body := '{}'::jsonb
     ); $$
);
