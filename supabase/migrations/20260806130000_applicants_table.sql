-- apply.html submissions were temporarily going into `leads`, but leads is
-- for the other capture forms (readiness check, eligibility, contact).
-- This gives apply.html candidates their own table + admin tab.
create table if not exists applicants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  whatsapp text,
  father_name text,
  mother_name text,
  passport_number text,
  country text,
  education text,
  field text,
  university text,
  intake text,
  ielts_status text,
  nawa_status text,
  notes text,
  documents jsonb not null default '{}'::jsonb,
  status text not null default 'New',
  admin_feedback text,
  source text not null default 'apply_page'
);

alter table applicants enable row level security;

drop policy if exists "Anyone can insert applicants" on applicants;
create policy "Anyone can insert applicants"
  on applicants for insert
  to public
  with check (true);

drop policy if exists "Admins can manage applicants" on applicants;
create policy "Admins can manage applicants"
  on applicants for all
  to public
  using (
    (auth.jwt() ->> 'email') in (select email from admin_users)
    or (auth.jwt() ->> 'email') = 'admin@kuro.com'
  );

-- Move the 3 real apply_page rows imported earlier from leads into applicants,
-- reconstructing structured columns from their intake_form JSON blob.
insert into applicants (id, created_at, name, email, whatsapp, father_name, mother_name,
  passport_number, country, education, field, university, intake, ielts_status, nawa_status,
  notes, documents, status, source)
select
  id, created_at, name, email, whatsapp,
  (intake_form::jsonb ->> 'fatherName'),
  (intake_form::jsonb ->> 'motherName'),
  (intake_form::jsonb ->> 'passport'),
  origin_country,
  study_level,
  goal,
  target_destination,
  intake_month,
  (intake_form::jsonb ->> 'ielts'),
  (intake_form::jsonb ->> 'nawa'),
  (intake_form::jsonb ->> 'notes'),
  coalesce((intake_form::jsonb -> 'documents'), '{}'::jsonb),
  status,
  source
from leads
where source in ('apply_page', 'apply_page_import');

delete from leads where source in ('apply_page', 'apply_page_import');
