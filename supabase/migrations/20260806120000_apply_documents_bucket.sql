-- Public applicants on apply.html have no auth session, so they can't use
-- the existing 'student-documents' bucket (its RLS policy keys every path
-- to auth.uid()). This creates a dedicated bucket for the apply form with
-- an anon INSERT-only policy: applicants can upload but never list, read,
-- update, or delete each other's (or anyone's) documents through the API.
-- The bucket itself is public so submitted files are reachable by URL.
insert into storage.buckets (id, name, public)
values ('apply-documents', 'apply-documents', true)
on conflict (id) do nothing;

drop policy if exists "Public can upload applicant documents" on storage.objects;
create policy "Public can upload applicant documents"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'apply-documents');
