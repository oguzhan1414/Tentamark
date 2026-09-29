-- Adds a third video source: an e-commerce product page URL (scraped for
-- title/price/description/images, images re-hosted into the brand's media
-- library, then fed into the EXISTING scene-plan/Remotion pipeline
-- unchanged — see web/src/lib/video/buildVideoInputProps.ts's new
-- resolveSource() branch and web/src/lib/video/scrapeProductUrl.ts).
--
-- The two original check constraints on source_type (0051) were created
-- inline with no explicit name, so Postgres auto-named them — rather than
-- guess those names, find and drop anything referencing source_type, then
-- re-add both with explicit names this time so a future patch doesn't have
-- to guess either.
do $$
declare
  con record;
begin
  for con in
    select conname
    from pg_constraint
    where conrelid = 'public.video_render_jobs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%source_type%'
  loop
    execute format('alter table public.video_render_jobs drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.video_render_jobs add column if not exists product_url text;

alter table public.video_render_jobs
  add constraint video_render_jobs_source_type_check
    check (source_type in ('existing_content', 'custom_topic', 'product_url'));

alter table public.video_render_jobs
  add constraint video_render_jobs_source_check
    check (
      (source_type = 'existing_content' and source_content_id is not null)
      or (source_type = 'custom_topic' and topic is not null)
      or (source_type = 'product_url' and product_url is not null)
    );
