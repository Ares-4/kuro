-- Storage hardening (2026-11-12 security sweep).
--
-- 1. eligibility-results: the USD 29 eligibility check was retired, but anyone
--    could still upload PDFs to this PUBLIC bucket, which could be abused to host
--    files on the Supabase domain. Remove the public upload policy and make the
--    bucket private (it is empty).
-- 2. student-documents / documents: private buckets with no file-type limit.
--    Limit them to what the dashboard accepts (PDF, Word, common images incl.
--    phone HEIC photos), so HTML/SVG/scripts can never be stored there.

begin;

drop policy if exists "Public Upload Eligibility Results" on storage.objects;
update storage.buckets set public = false where id = 'eligibility-results';

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'
]
where id in ('student-documents', 'documents');

commit;
