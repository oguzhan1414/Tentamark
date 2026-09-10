-- Patch: checklist phase 7 — the queue mechanism (dispatcher + publisher),
-- built and testable now even though phase 5 (real account connections) is
-- paused pending a stable domain. The publish step below is a MOCK — it
-- proves the state machine (QUEUED -> PUBLISHING -> PUBLISHED/FAILED, retry
-- with backoff, idempotency) works, without needing a real connector call.
-- Swap the marked block for a real HTTP call to the connector once phase 5
-- is live. See 12-backend-logic.md §12.6 for the full design this follows.

create extension if not exists pg_cron;
create extension if not exists pgmq;

select pgmq.create('publish_queue');

-- ---------------------------------------------------------------------------
-- Helper: recompute content.status from its content_platforms rows.
-- All platforms terminal (PUBLISHED or NEEDS_USER_ACTION) and all published
-- -> PUBLISHED. All terminal but some needed action -> PARTIALLY_PUBLISHED if
-- at least one published, otherwise left alone (still APPROVED/SCHEDULED —
-- nothing succeeded yet, not really "partial").
-- ---------------------------------------------------------------------------

create or replace function private.recompute_content_status(p_content_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total int;
  v_published int;
  v_needs_action int;
begin
  select
    count(*),
    count(*) filter (where status = 'PUBLISHED'),
    count(*) filter (where status = 'NEEDS_USER_ACTION')
  into v_total, v_published, v_needs_action
  from public.content_platforms
  where content_id = p_content_id;

  if v_total = 0 or (v_published + v_needs_action) < v_total then
    return; -- something is still in flight, leave content.status as-is
  end if;

  update public.content
  set status = case
    when v_published = v_total then 'PUBLISHED'
    when v_published > 0 then 'PARTIALLY_PUBLISHED'
    else status
  end
  where id = p_content_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Dispatcher: due, approved content_platforms -> pgmq + mark QUEUED.
-- Also re-dispatches QUEUED rows whose backoff window (next_retry_at) has
-- passed — their original queue message is long gone (archived after the
-- failed attempt), so a retry needs a fresh one.
-- ---------------------------------------------------------------------------

create or replace function private.dispatch_due_content()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  for r in
    select cp.id
    from public.content_platforms cp
    join public.content c on c.id = cp.content_id
    where cp.scheduled_at <= now()
      and c.status in ('APPROVED', 'SCHEDULED')
      and (
        cp.status = 'PENDING'
        or (cp.status = 'QUEUED' and cp.next_retry_at is not null and cp.next_retry_at <= now())
      )
  loop
    update public.content_platforms
    set status = 'QUEUED', next_retry_at = null
    where id = r.id and status in ('PENDING', 'QUEUED');

    perform pgmq.send('publish_queue', jsonb_build_object('content_platform_id', r.id));
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Publisher: claims QUEUED rows, "publishes" (mocked), records the attempt,
-- retries with exponential backoff on failure, gives up after 5 attempts.
-- ---------------------------------------------------------------------------

create or replace function private.process_publish_queue()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  msg record;
  cp public.content_platforms;
  is_test_fail boolean;
  new_attempt_count int;
  backoff_minutes int;
begin
  for msg in select * from pgmq.read('publish_queue', 30, 10)
  loop
    -- Idempotency (§12.6): only proceed if still QUEUED. A message that
    -- reappears after a crash mid-processing finds nothing to claim and is
    -- just archived — no double publish.
    update public.content_platforms
    set status = 'PUBLISHING'
    where id = (msg.message ->> 'content_platform_id')::uuid
      and status = 'QUEUED'
    returning * into cp;

    if cp.id is null then
      perform pgmq.archive('publish_queue', msg.msg_id);
      continue;
    end if;

    -- ===== MOCK PUBLISHER — replace with a real connector call when phase 5 is live =====
    is_test_fail := cp.caption ilike '%test-fail%';

    if not is_test_fail then
      update public.content_platforms
      set status = 'PUBLISHED',
          published_at = now(),
          platform_post_id = 'mock-' || gen_random_uuid()::text,
          last_error = null
      where id = cp.id;

      insert into public.publish_attempts (content_platform_id, status)
      values (cp.id, 'SUCCESS');
    else
      new_attempt_count := coalesce(cp.attempt_count, 0) + 1;

      if new_attempt_count >= 5 then
        update public.content_platforms
        set status = 'NEEDS_USER_ACTION',
            attempt_count = new_attempt_count,
            failure_code = 'RATE_LIMIT',
            last_error = 'Mock RATE_LIMIT: deneme sayısı (5) aşıldı'
        where id = cp.id;
      else
        backoff_minutes := (2 ^ new_attempt_count)::int; -- 2, 4, 8, 16...
        update public.content_platforms
        set status = 'QUEUED',
            attempt_count = new_attempt_count,
            next_retry_at = now() + (backoff_minutes || ' minutes')::interval,
            failure_code = 'RATE_LIMIT',
            last_error = 'Mock RATE_LIMIT (deneme ' || new_attempt_count || '/5)'
        where id = cp.id;
      end if;

      insert into public.publish_attempts (content_platform_id, status, failure_code, error_detail)
      values (cp.id, 'FAILED', 'RATE_LIMIT', 'Mock hata: caption ''test-fail'' metnini içeriyor');
    end if;
    -- ===== MOCK PUBLISHER sonu =====

    perform private.recompute_content_status(cp.content_id);
    perform pgmq.archive('publish_queue', msg.msg_id);
  end loop;
end;
$$;

revoke execute on function private.dispatch_due_content() from public, anon, authenticated;
revoke execute on function private.process_publish_queue() from public, anon, authenticated;
revoke execute on function private.recompute_content_status(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Cron: both jobs every minute. Well under the 8-concurrent-job limit
-- (§12.6) — this patch adds 2, token-health/analytics-harvest add 2 more
-- once phase 5's real connectors exist.
-- ---------------------------------------------------------------------------

select cron.schedule('dispatch-due-content', '* * * * *', $$select private.dispatch_due_content();$$);
select cron.schedule('process-publish-queue', '* * * * *', $$select private.process_publish_queue();$$);

-- publish_attempts had RLS enabled with zero policies since schema creation
-- (13-build-checklist.md note). This is the first phase that writes rows
-- into it (via the SECURITY DEFINER publisher above, which bypasses RLS to
-- insert) — a select policy is needed so the brand's own members can read
-- their publish history from the client. Insert stays server-only: no policy
-- is added for it, so only the SECURITY DEFINER function (or service role)
-- can write.
alter table public.publish_attempts enable row level security;

create policy "Publish attempts select" on public.publish_attempts
  for select to authenticated using (
    exists (
      select 1 from public.content_platforms cp
      join public.content c on c.id = cp.content_id
      join public.brands b on b.id = c.brand_id
      where cp.id = content_platform_id and private.is_org_member(b.organization_id)
    )
  );
