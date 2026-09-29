-- Faz 4 (video yükleme): a fourth video source — the user's own uploaded
-- clip (already landable in `media` today via useMediaLibrary.ts, just never
-- consumed by a video job) — fed into the EXISTING scene-plan/Remotion
-- pipeline as a new "user_clip" archetype (see
-- web/src/lib/video/buildVideoInputProps.ts's new resolveSource() branch and
-- web/remotion/scenes/UserClipShowcase.tsx).
--
-- Unlike 0059 (which had to find-and-drop unnamed constraints), 0059 itself
-- already re-created both source_type constraints with explicit names, so
-- this patch can drop them by name directly.
alter table public.video_render_jobs drop constraint if exists video_render_jobs_source_type_check;
alter table public.video_render_jobs drop constraint if exists video_render_jobs_source_check;

alter table public.video_render_jobs add column if not exists source_media_id uuid references public.media(id) on delete set null;

alter table public.video_render_jobs
  add constraint video_render_jobs_source_type_check
    check (source_type in ('existing_content', 'custom_topic', 'product_url', 'user_upload'));

alter table public.video_render_jobs
  add constraint video_render_jobs_source_check
    check (
      (source_type = 'existing_content' and source_content_id is not null)
      or (source_type = 'custom_topic' and topic is not null)
      or (source_type = 'product_url' and product_url is not null)
      or (source_type = 'user_upload' and source_media_id is not null)
    );
