-- brand_dna's select/update/insert policies (the last two of which — update
-- predates this repo's patch history, insert from 0052) were never updated
-- when 0044_brand_access.sql introduced per-brand membership: they still
-- check `is_org_member(organization_id)`, which only confirms someone is in
-- the org, not that they were specifically granted access to THIS brand.
-- In a multi-brand org, that reopens exactly the cross-brand leak 0044 was
-- built to close — any org member (not just brand_memberships holders for
-- this brand) can read/write another brand's DNA. Brings all three policies
-- in line with how `brands` itself is scoped (`Brand access update`,
-- 0044_brand_access.sql:113-115): private.can_access_brand(brand_id).

drop policy if exists "Brand DNA select" on public.brand_dna;
drop policy if exists "Brand DNA update" on public.brand_dna;
drop policy if exists "Brand DNA insert" on public.brand_dna;

create policy "Brand DNA select" on public.brand_dna
  for select to authenticated using (private.can_access_brand(brand_id));

create policy "Brand DNA update" on public.brand_dna
  for update to authenticated
  using (private.can_access_brand(brand_id))
  with check (private.can_access_brand(brand_id));

create policy "Brand DNA insert" on public.brand_dna
  for insert to authenticated
  with check (private.can_access_brand(brand_id));
