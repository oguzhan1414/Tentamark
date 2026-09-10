-- Patch: content_platforms had select + update policies but no insert.
-- Compose (checklist phase 4) creates a content row plus one content_platforms
-- row per platform in the same flow — without this, that insert is silently
-- rejected by RLS. Same brand-membership check already used by the existing
-- select/update policies on this table.

create policy "Content platforms insert" on public.content_platforms
  for insert to authenticated with check (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

-- Note: no delete policy added. Deleting the parent `content` row already
-- cascades to content_platforms (content_id references public.content on
-- delete cascade) — FK cascade runs as part of referential-integrity
-- enforcement, not as a direct DML the deleting role's RLS gates. A
-- standalone content_platforms delete isn't needed until a feature deletes
-- one platform's variant without touching the others.
