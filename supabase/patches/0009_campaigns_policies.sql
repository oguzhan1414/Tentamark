-- Patch: campaigns had RLS enabled with zero policies since schema creation
-- (13-build-checklist.md note). First real UI built against it (dashboard
-- IA restructure — Kampanyalar page + optional campaign tag in Compose).
-- Same brand-membership pattern as every other brand-scoped table.

create policy "Campaigns select" on public.campaigns
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Campaigns insert" on public.campaigns
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Campaigns update" on public.campaigns
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Campaigns delete" on public.campaigns
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
