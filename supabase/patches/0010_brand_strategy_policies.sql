-- Patch: brand_strategy had RLS enabled with zero policies since schema creation.
-- First real UI built against it (Marka Profili -> İçerik Stratejisi tab).
-- Same brand-membership pattern as every other brand-scoped table.

create policy "Brand Strategy select" on public.brand_strategy
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Brand Strategy insert" on public.brand_strategy
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Brand Strategy update" on public.brand_strategy
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Brand Strategy delete" on public.brand_strategy
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
