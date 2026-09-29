-- Durable Faz 8 render queue metadata. The web route only enqueues; a
-- worker/cron invocation owns queued -> rendering and controlled retries.
alter table public.video_render_jobs
  drop constraint if exists video_render_jobs_status_check;

alter table public.video_render_jobs
  add constraint video_render_jobs_status_check
    check (status in ('pending', 'draft', 'queued', 'rendering', 'completed', 'failed'));

alter table public.video_render_jobs
  add column if not exists queued_at timestamptz,
  add column if not exists next_attempt_at timestamptz not null default now(),
  add column if not exists attempt_count integer not null default 0 check (attempt_count >= 0),
  add column if not exists max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  add column if not exists worker_id text,
  add column if not exists render_provider text not null default 'local',
  add column if not exists queue_wait_ms integer check (queue_wait_ms is null or queue_wait_ms >= 0),
  add column if not exists render_duration_ms integer check (render_duration_ms is null or render_duration_ms >= 0),
  add column if not exists estimated_cost_usd numeric(12,6) not null default 0 check (estimated_cost_usd >= 0);

create index if not exists idx_video_render_jobs_queue
  on public.video_render_jobs(status, next_attempt_at, created_at)
  where status in ('queued', 'rendering');

-- The request-triggered after() gives immediate local feedback; this durable
-- minute-level dispatcher is what recovers retries and jobs left behind by a
-- restarted web process.
create or replace function private.dispatch_video_render_queue()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_secret text;
begin
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'scheduler_webhook_secret';

  if webhook_secret is null then
    return;
  end if;

  perform net.http_post(
    url := 'https://tentamark.com/api/workers/video-render',
    body := '{"limit":1}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || webhook_secret
    )
  );
end;
$$;

revoke execute on function private.dispatch_video_render_queue() from public, anon, authenticated;
select cron.schedule('dispatch-video-render-queue', '* * * * *', $$select private.dispatch_video_render_queue();$$);
