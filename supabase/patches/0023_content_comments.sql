-- content_comments — a real threaded discussion on a piece of content
-- (Planable-style: teammates leaving notes like "Alright! Scheduled." right
-- on the post), separate from the approve/reject status change itself.
create table if not exists public.content_comments (
  id uuid default gen_random_uuid() primary key,
  content_id uuid references public.content on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz default now() not null
);
create index if not exists idx_content_comments_content on public.content_comments(content_id, created_at);

alter table public.content_comments enable row level security;

-- Same brand-membership gate as content_platforms — join through content -> brands.
create policy "Content comments select" on public.content_comments
  for select to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

create policy "Content comments insert" on public.content_comments
  for insert to authenticated with check (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );
