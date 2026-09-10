-- Patch: social_accounts had RLS enabled but zero policies (flagged as a
-- known gap in docs/13-build-checklist.md when schema.sql first landed).
-- Needed now: checklist phase 5 connects real Meta accounts into this table.
--
-- Full CRUD, unlike brands/content: disconnecting an account is a normal,
-- expected user action, and it's non-destructive (content_platforms.
-- social_account_id is `on delete set null`, not cascade).

create policy "Social accounts select" on public.social_accounts
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Social accounts insert" on public.social_accounts
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Social accounts update" on public.social_accounts
  for update to authenticated
  using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  )
  with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Social accounts delete" on public.social_accounts
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
