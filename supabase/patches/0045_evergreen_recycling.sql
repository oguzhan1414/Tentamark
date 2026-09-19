-- ==============================================================================
-- Patch 0045: Evergreen Content Recycling (Zamansız İçerik Döngüsü)
-- ==============================================================================

-- 1. Add evergreen lifecycle columns to public.content table
alter table public.content
  add column if not exists is_evergreen boolean default false not null,
  add column if not exists evergreen_interval_days integer default 30 not null,
  add column if not exists evergreen_max_recycles integer default null,
  add column if not exists evergreen_recycle_count integer default 0 not null,
  add column if not exists evergreen_last_recycled_at timestamptz default null,
  add column if not exists evergreen_auto_remix boolean default true not null;

-- 2. Index for querying ready-to-recycle evergreen content per brand
create index if not exists idx_content_evergreen 
  on public.content(brand_id, is_evergreen, evergreen_last_recycled_at)
  where is_evergreen = true;

comment on column public.content.is_evergreen is 'Whether this content is in the evergreen recycling pool.';
comment on column public.content.evergreen_interval_days is 'Recycle frequency in days (e.g. 15, 30, 60, 90).';
comment on column public.content.evergreen_max_recycles is 'Maximum number of times to recycle this post. Null means infinite.';
comment on column public.content.evergreen_recycle_count is 'How many times this evergreen content has been recycled.';
comment on column public.content.evergreen_last_recycled_at is 'Timestamp when this content was last cloned/recycled into the queue.';
comment on column public.content.evergreen_auto_remix is 'If true, AI generates a fresh hook and variation before re-publishing to prevent spam penalties.';
