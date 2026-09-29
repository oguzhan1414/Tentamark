-- Faz 7 (çoklu format paketi): a small grouping table so one idea's 4
-- outputs (feed image, story image, carousel post, video) can be created,
-- bulk-approved, and bulk-scheduled as a unit — without touching the shape
-- of `content`/`content_platforms`/`video_render_jobs` at all, just adding
-- a nullable grouping FK to the latter two. RLS mirrors `campaigns`'s own
-- 4-policy shape exactly (same is_org_member-via-brand_id gate).
create table if not exists public.content_packages (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  campaign_id uuid references public.campaigns on delete set null,
  title text not null,
  core_idea text not null,
  status text default 'generating' not null check (status in ('generating', 'ready', 'failed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.content_packages enable row level security;

drop trigger if exists set_updated_at on public.content_packages;
create trigger set_updated_at before update on public.content_packages
for each row execute function private.set_updated_at();

create policy "Content packages select" on public.content_packages
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Content packages insert" on public.content_packages
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Content packages update" on public.content_packages
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Content packages delete" on public.content_packages
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

alter table public.content
  add column if not exists package_id uuid references public.content_packages(id) on delete cascade;

alter table public.video_render_jobs
  add column if not exists package_id uuid references public.content_packages(id) on delete cascade;

create index if not exists idx_content_package on public.content(package_id) where package_id is not null;
create index if not exists idx_video_render_jobs_package on public.video_render_jobs(package_id) where package_id is not null;
