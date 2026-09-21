-- ==============================================================================
-- Patch 0051: video_render_jobs — job tracking for the per-brand short promo
-- video generator (Remotion). Rendering itself runs server-side (locally for
-- now, see web/src/lib/video/localRenderer.ts; swappable to Remotion Lambda
-- later without touching this table) and can take real wall-clock time, so
-- this table is what the UI polls for progress instead of holding one HTTP
-- request open for the whole render.
-- ==============================================================================

create table if not exists public.video_render_jobs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,

  format text not null check (format in ('vertical', 'horizontal')),
  duration_seconds integer not null check (duration_seconds in (10, 15, 20)),

  source_type text not null check (source_type in ('existing_content', 'custom_topic')),
  source_content_id uuid references public.content(id) on delete set null,
  topic text,
  selected_media_ids uuid[] not null default '{}',
  check (
    (source_type = 'existing_content' and source_content_id is not null)
    or (source_type = 'custom_topic' and topic is not null)
  ),

  -- The fully resolved, ordered scene list (see lib/video/scenePlan.ts),
  -- written once before rendering starts. Kept here (not re-derived at
  -- render time) so a past job stays inspectable/reproducible on its own.
  scene_plan jsonb,

  status text not null default 'pending' check (status in ('pending', 'rendering', 'completed', 'failed')),
  error text,
  output_media_id uuid references public.media(id) on delete set null,
  output_url text,

  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.video_render_jobs enable row level security;

drop trigger if exists set_updated_at on public.video_render_jobs;
create trigger set_updated_at before update on public.video_render_jobs
for each row execute function private.set_updated_at();

-- Read/insert only from the authenticated side — status transitions
-- (pending -> rendering -> completed/failed) and output_url/output_media_id
-- are written exclusively by renderVideoJob() via the service-role admin
-- client, same reasoning as content_platforms' status machine and 0047's
-- audit_logs: no update/delete policy for authenticated at all.
create policy "Video render jobs select own brand" on public.video_render_jobs
  for select to authenticated using (private.is_own_brand(brand_id));

create policy "Video render jobs insert own brand" on public.video_render_jobs
  for insert to authenticated with check (private.is_own_brand(brand_id));

create index if not exists idx_video_render_jobs_brand on public.video_render_jobs(brand_id, created_at desc);
