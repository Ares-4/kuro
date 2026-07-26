-- No policy for the 'student-documents' storage bucket exists in any
-- tracked migration, meaning it was either set ad-hoc via the Storage UI
-- or never correctly configured. Symptom: students can list/upload their
-- own documents (StudentSettings.jsx), but Delete silently does nothing —
-- consistent with a missing/incorrect DELETE policy on storage.objects,
-- the same class of RLS gap found across ~20 other tables earlier in this
-- project's security audit.
--
-- This grants each student full access (select/insert/update/delete) to
-- only their own folder, matching the app's existing path convention:
-- `${user.id}/${filename}` (see fetchDocuments/handleDocumentUpload/
-- deleteDocument in src/components/dashboard/StudentSettings.jsx).
drop policy if exists "Students manage own documents" on storage.objects;
create policy "Students manage own documents"
  on storage.objects for all
  using (bucket_id = 'student-documents' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'student-documents' and (storage.foldername(name))[1] = auth.uid()::text);
