-- destination_roadmaps had RLS enabled with only a SELECT policy - no
-- INSERT/UPDATE, so AdminRoadmaps.jsx's upsert always failed with
-- "new row violates row-level security policy". Same fix pattern as the
-- rest of this session's RLS work.
drop policy if exists "Admins manage destination_roadmaps" on destination_roadmaps;
create policy "Admins manage destination_roadmaps" on destination_roadmaps for all
  using (exists (select 1 from admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from admins a where a.user_id = auth.uid()));
