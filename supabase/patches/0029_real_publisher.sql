-- Patch: swap the MOCK PUBLISHER block inside process_publish_queue() for a
-- real call — Postgres can't run the TypeScript connectors in
-- src/lib/social/*Provider.ts directly, so the cron job now fires an
-- authenticated async HTTP call (via pg_net) to a new Next.js route
-- (src/app/api/scheduler/publish/route.ts) that does the actual publish and
-- writes PUBLISHED/FAILED/retry state back itself. dispatch_due_content()
-- and the retry/backoff state machine are untouched — only the marked block
-- changes. See docs/12-backend-logic.md §12.6.
--
-- Run this once in the Supabase SQL Editor (this repo has no linked CLI
-- project, same as every other supabase/patches/*.sql file).

create extension if not exists pg_net;

-- Idempotent: only creates the secret if it doesn't already exist, so this
-- patch is safe to re-run. Replace the literal value below with your own
-- generated secret before running, and use the SAME value for
-- SCHEDULER_WEBHOOK_SECRET in Vercel's environment variables.
do $$
begin
  if not exists (select 1 from vault.decrypted_secrets where name = 'scheduler_webhook_secret') then
    perform vault.create_secret(
      'ta2OsGXCrRjMCOBGA_Wibr0L6ELQmdwZUF4I1XsK6t4',
      'scheduler_webhook_secret',
      'Shared bearer secret so /api/scheduler/publish can trust calls coming from process_publish_queue() via pg_net.'
    );
  end if;
end $$;

-- The webhook target — update this literal if the production domain ever
-- changes. Deliberately hardcoded rather than a second Vault secret: it's a
-- single, rarely-changing value, not sensitive.
create or replace function private.process_publish_queue()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  msg record;
  cp public.content_platforms;
  webhook_secret text;
begin
  select decrypted_secret into webhook_secret
  from vault.decrypted_secrets
  where name = 'scheduler_webhook_secret';

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

    -- ===== REAL PUBLISHER =====
    -- Fire-and-forget: the actual publish + PUBLISHED/FAILED/retry state
    -- transition happens inside the API route itself (it has the decrypted
    -- token, the connector registry, and an admin DB client — none of which
    -- SQL can use). This function's job ends at "handed off".
    perform net.http_post(
      url := 'https://tentamark.com/api/scheduler/publish',
      body := jsonb_build_object('content_platform_id', cp.id),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || webhook_secret
      )
    );
    -- ===== REAL PUBLISHER sonu =====

    perform pgmq.archive('publish_queue', msg.msg_id);
  end loop;
end;
$$;

revoke execute on function private.process_publish_queue() from public, anon, authenticated;

-- Not granted anywhere before this patch (only ever revoked from
-- public/anon/authenticated) — the new API route calls this via the admin
-- (service_role) client after a successful or failed publish attempt.
grant execute on function private.recompute_content_status(uuid) to service_role;
