# apply.html document collection — design

## Goal
Collect application documents on the public `apply.html` form and get submissions into the admin `leads` table (currently only Google Sheet + push notify).

## Documents collected
- Passport copy — required
- Academic transcripts/certificates — required
- IELTS certificate — optional (only if candidate already has it)

Accepted types: pdf, jpg, jpeg, png, doc, docx. Max 5MB per file (matches `ApplicationPage.jsx` convention).

## Storage
New Supabase Storage bucket: `apply-documents` (public read).
Path convention: `${leadId}/passport.<ext>`, `${leadId}/transcript.<ext>`, `${leadId}/ielts.<ext>` — `leadId` is a client-generated UUID, reused as the `leads.id` row, mirroring the existing `student-documents` folder-per-record convention used by `AdminLeads.jsx`.

RLS: anon gets INSERT-only on this bucket (no select/update/delete for anon), since apply.html visitors are unauthenticated. Admins read via the bucket's public URLs.

```sql
insert into storage.buckets (id, name, public)
values ('apply-documents', 'apply-documents', true)
on conflict (id) do nothing;

create policy "Public can upload applicant documents"
on storage.objects for insert
to anon
with check (bucket_id = 'apply-documents');
```

## apply.html changes
- Add a "Documents" section to the form with the three file inputs above.
- On submit:
  1. Validate name/email (existing) + required docs present.
  2. Generate `leadId = crypto.randomUUID()`.
  3. Upload provided files to `apply-documents/${leadId}/...` via supabase-js (loaded from CDN, using the `SUPABASE_URL`/`SUPABASE_ANON_KEY` already in the page).
  4. Insert into `leads` (id=leadId, name, email, whatsapp=phone, origin_country=country, target_destination=university, study_level=education, intake_month=intake, source='apply_page', intake_form=JSON.stringify(fullRecord+documents)).
  5. Keep existing no-cors POST to the Google Sheet `SHEET_URL` unchanged (now also carrying document URLs) — not removing a working integration.
  6. Keep existing `notifyAdmin` push call.
- Surface Supabase insert errors to the user (readable, unlike the no-cors sheet POST) without clearing the form, so no data is lost on failure.

## Out of scope (deferred)
- Importing historical applicants from the existing Google Sheet into `leads` — user will provide that export later.
- Admin UI changes to browse `apply-documents` (not requested; public bucket URLs are enough for now).
