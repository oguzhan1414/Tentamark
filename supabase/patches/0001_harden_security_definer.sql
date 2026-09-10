-- Patch: fixes the 5 Security Advisor warnings on schema.sql.
--
-- Root cause: public.is_org_member() is SECURITY DEFINER, sitting in the
-- `public` schema. `authenticated` needs EXECUTE on it for RLS to work, but
-- that same grant makes it directly callable via the Data API
-- (/rest/v1/rpc/is_org_member) by any signed-in user — an unintended public
-- endpoint for what should be an internal RLS predicate.
--
-- The Advisor's generic fix ("switch to SECURITY INVOKER") would be WRONG
-- here: the function exists specifically to bypass RLS when checking
-- organization_members from a policy ON organization_members itself
-- (self-referential RLS). Switching to INVOKER reintroduces that recursion
-- and policies would silently return zero rows.
--
-- Real fix: move the function to a non-exposed schema (`private`). PostgREST
-- only exposes schemas on its allow-list (public by default), so `authenticated`
-- can keep EXECUTE — required for RLS — without the function ever being
-- reachable as an RPC call. `search_path = ''` closes the search-path-hijack
-- gap the Advisor also flagged.

create schema if not exists private;

create or replace function private.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id
      and user_id = (select auth.uid())
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Repoint every policy that referenced public.is_org_member. Same USING /
-- WITH CHECK text as schema.sql, only the function's schema changes.
-- ---------------------------------------------------------------------------

drop policy if exists "Members can view their orgs" on public.organizations;
create policy "Members can view their orgs" on public.organizations
  for select to authenticated using (private.is_org_member(id));

drop policy if exists "Members can view membership" on public.organization_members;
create policy "Members can view membership" on public.organization_members
  for select to authenticated using (private.is_org_member(organization_id));

drop policy if exists "Org members can view brands" on public.brands;
create policy "Org members can view brands" on public.brands
  for select to authenticated using (private.is_org_member(organization_id));

drop policy if exists "Org members can update brands" on public.brands;
create policy "Org members can update brands" on public.brands
  for update to authenticated
  using (private.is_org_member(organization_id))
  with check (private.is_org_member(organization_id));

drop policy if exists "Brand DNA select" on public.brand_dna;
create policy "Brand DNA select" on public.brand_dna
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

drop policy if exists "Brand DNA update" on public.brand_dna;
create policy "Brand DNA update" on public.brand_dna
  for update to authenticated
  using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  )
  with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

drop policy if exists "Content select" on public.content;
create policy "Content select" on public.content
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

drop policy if exists "Content insert" on public.content;
create policy "Content insert" on public.content
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

drop policy if exists "Content update" on public.content;
create policy "Content update" on public.content
  for update to authenticated
  using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  )
  with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

drop policy if exists "Content delete" on public.content;
create policy "Content delete" on public.content
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

drop policy if exists "Content platforms select" on public.content_platforms;
create policy "Content platforms select" on public.content_platforms
  for select to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

drop policy if exists "Content platforms update" on public.content_platforms;
create policy "Content platforms update" on public.content_platforms
  for update to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

drop policy if exists "Audit logs select" on public.audit_logs;
create policy "Audit logs select" on public.audit_logs
  for select to authenticated using (private.is_org_member(organization_id));

-- Now safe to drop: nothing references it anymore.
drop function if exists public.is_org_member(uuid);

-- ---------------------------------------------------------------------------
-- handle_new_user(): RETURNS TRIGGER functions can only be invoked by the
-- trigger mechanism (Postgres rejects a direct call), so this grant was never
-- practically exploitable — but Advisor flags the grant itself, and removing
-- it is free: trigger firing doesn't check EXECUTE on the invoking role.
-- ---------------------------------------------------------------------------

revoke execute on function public.handle_new_user() from public, anon, authenticated;
