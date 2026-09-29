-- /api/scheduler/recycle (the evergreen content-recycling route) has never
-- had anything calling it — checked the whole repo, no vercel.json, no
-- pg_cron entry, nothing. "Zamansız İçerik" just sets three columns on
-- content and nothing ever acts on them. Mirrors 0029_real_publisher.sql's
-- pattern exactly: same vault secret, same pg_net async POST, just a slower
-- cadence since evergreen intervals are measured in days, not minutes.

create extension if not exists pg_net;

create or replace function private.dispatch_evergreen_recycle()
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
    url := 'https://tentamark.com/api/scheduler/recycle',
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || webhook_secret
    )
  );
end;
$$;

revoke execute on function private.dispatch_evergreen_recycle() from public, anon, authenticated;

select cron.schedule('dispatch-evergreen-recycle', '0 * * * *', $$select private.dispatch_evergreen_recycle();$$);
