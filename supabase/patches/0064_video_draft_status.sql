-- Faz 6 (storyboard editörü): a new 'draft' status — the AI-costly work
-- (scene copy, voice-over+transcription) now finishes BEFORE rendering,
-- landing in this status so the user can review/edit scenes without
-- triggering a re-render. See prepareVideoDraft.ts (new) / renderVideoJob.ts
-- (now render-only, no AI calls) / buildVideoInputProps.ts (split into
-- buildDraftScenePlan + assembleVideoInputProps).
--
-- status's check constraint was created inline/unnamed in 0051's original
-- `create table` (same situation source_type was in before 0059) — find and
-- drop it by definition rather than guessing the auto-generated name.
do $$
declare
  con record;
begin
  for con in
    select conname
    from pg_constraint
    where conrelid = 'public.video_render_jobs'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.video_render_jobs drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.video_render_jobs
  add constraint video_render_jobs_status_check
    check (status in ('pending', 'draft', 'rendering', 'completed', 'failed'));

-- 0051 deliberately had NO update policy at all ("status transitions...
-- written exclusively by renderVideoJob() via the service-role admin
-- client"). This punches one narrow, scoped hole in that: the brand's own
-- session can edit ONLY rows that are (and, after the edit, remain) their
-- own 'draft' — never rendering/completed/failed, never another brand's row.
create policy "Video render jobs update own draft" on public.video_render_jobs
  for update to authenticated
  using (private.is_own_brand(brand_id) and status = 'draft')
  with check (private.is_own_brand(brand_id) and status = 'draft');
