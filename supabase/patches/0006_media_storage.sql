-- Patch: real media upload (Storage bucket + RLS), closing the gap flagged
-- in instagramProvider.ts ("content_media/Storage hattı henüz yok") and in
-- 13-build-checklist.md (media/content_media had RLS enabled, zero policies).
-- Scope is deliberately narrow: original file only, no per-platform resize/
-- crop variants — 12-backend-logic.md §12.8 leaves that pipeline's "where"
-- (Edge Function vs client vs external) as an open, unmade decision, so
-- media_variants is NOT built here. This just gets a real file_url onto a
-- media row so publish() has something real to send once phase 5 resumes.

-- Public bucket: Meta's servers must be able to fetch the image over plain
-- HTTPS with no auth (container creation for Instagram/Threads requires a
-- publicly reachable image_url) — this works without a VPS/domain because
-- Supabase's own storage endpoint is already a public HTTPS host.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Object path convention: {brand_id}/{uuid}-{filename}. Write access is
-- scoped to the uploader's own brand via the first path segment — this is
-- what stops brand A writing into brand B's folder. Public bucket means no
-- select policy is needed for the public URL route itself, but one is added
-- anyway so the authenticated SDK path (.list()/.download()) also respects
-- brand boundaries.
create policy "Media objects select own brand" on storage.objects
  for select to authenticated using (
    bucket_id = 'media'
    and exists (
      select 1 from public.brands b
      where b.id::text = (storage.foldername(name))[1]
        and private.is_org_member(b.organization_id)
    )
  );

create policy "Media objects insert own brand" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'media'
    and exists (
      select 1 from public.brands b
      where b.id::text = (storage.foldername(name))[1]
        and private.is_org_member(b.organization_id)
    )
  );

create policy "Media objects delete own brand" on storage.objects
  for delete to authenticated using (
    bucket_id = 'media'
    and exists (
      select 1 from public.brands b
      where b.id::text = (storage.foldername(name))[1]
        and private.is_org_member(b.organization_id)
    )
  );

-- media table: had RLS enabled, zero policies since schema creation.
create policy "Media select" on public.media
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Media insert" on public.media
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Media delete" on public.media
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

-- content_media table: same gap, joins through content -> brand like content_platforms does.
create policy "Content media select" on public.content_media
  for select to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

create policy "Content media insert" on public.content_media
  for insert to authenticated with check (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

create policy "Content media delete" on public.content_media
  for delete to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );
