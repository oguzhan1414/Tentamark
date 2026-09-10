-- Patch: fixes 0006 — the "Media objects insert/select/delete own brand"
-- policies on storage.objects referenced `public.brands` directly via a
-- plain `exists(select ... from public.brands ...)` subquery. Confirmed live
-- (not guessed): a trivial `bucket_id = 'media'`-only policy uploaded fine
-- with the exact same valid, non-expired, role=authenticated JWT, but the
-- real policy 403'd with "new row violates row-level security policy" —
-- i.e. storage-api's session can't satisfy brands' own RLS-gated read the
-- way a normal PostgREST request can. Same shape of bug `private.is_org_member`
-- already exists to solve for organization_members; applying the identical
-- fix here: a SECURITY DEFINER helper that bypasses brands' RLS internally.

create or replace function private.is_own_brand(p_brand_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.brands b
    where b.id = p_brand_id and private.is_org_member(b.organization_id)
  );
$$;

grant execute on function private.is_own_brand(uuid) to authenticated;

drop policy if exists "Media objects select own brand" on storage.objects;
drop policy if exists "Media objects insert own brand" on storage.objects;
drop policy if exists "Media objects delete own brand" on storage.objects;
drop policy if exists "temp debug auth uid" on storage.objects;

create policy "Media objects select own brand" on storage.objects
  for select to authenticated using (
    bucket_id = 'media' and private.is_own_brand(((storage.foldername(name))[1])::uuid)
  );

create policy "Media objects insert own brand" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'media' and private.is_own_brand(((storage.foldername(name))[1])::uuid)
  );

create policy "Media objects delete own brand" on storage.objects
  for delete to authenticated using (
    bucket_id = 'media' and private.is_own_brand(((storage.foldername(name))[1])::uuid)
  );
