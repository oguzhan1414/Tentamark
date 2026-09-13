-- Patch: calendar_notes UPDATE policy — notes are now edited in place
-- (text and color both change after creation) instead of being written once
-- and replaced by delete+recreate, so an update path is actually needed now.
create policy "Calendar notes update" on public.calendar_notes
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
