-- Tracks who changed a platform draft's caption/schedule and what it looked
-- like before — today content_platforms.updated_at changes silently on any
-- edit with no record of who touched it or what changed, so an admin
-- reviewing a draft has no way to know a teammate edited the AI-generated
-- copy before approval. Insert-only from the app (savePlatform in
-- posts/page.tsx); RLS mirrors content_platforms' own update policy so only
-- someone who could actually make that edit can log one.

create table if not exists public.content_edit_history (
  id uuid default gen_random_uuid() primary key,
  content_platform_id uuid references public.content_platforms on delete cascade not null,
  edited_by uuid references public.profiles(id) on delete set null,
  old_caption text,
  new_caption text,
  old_scheduled_at timestamptz,
  new_scheduled_at timestamptz,
  created_at timestamptz default now() not null
);

create index if not exists idx_content_edit_history_platform on public.content_edit_history(content_platform_id, created_at desc);

alter table public.content_edit_history enable row level security;

create policy "Content edit history select" on public.content_edit_history
  for select to authenticated using (
    exists (
      select 1 from public.content_platforms cp
      join public.content c on c.id = cp.content_id
      where cp.id = content_platform_id and private.can_access_brand(c.brand_id)
    )
  );

-- Mirrors "Content platforms update" (0043, rewritten in place by 0044) so
-- exactly whoever is allowed to make the edit is allowed to log it: a brand
-- reviewer any time, or the content's own creator/assignee while it's still
-- DRAFT/NEEDS_REVIEW.
create policy "Content edit history insert" on public.content_edit_history
  for insert to authenticated with check (
    exists (
      select 1 from public.content_platforms cp
      join public.content c on c.id = cp.content_id
      join public.brands b on b.id = c.brand_id
      where cp.id = content_platform_id
        and (private.can_review_brand(b.id)
          or (private.can_access_brand(b.id) and c.status in ('DRAFT', 'NEEDS_REVIEW')
            and (c.created_by = (select auth.uid()) or c.draft_assignee_id = (select auth.uid()))))
    )
  );
