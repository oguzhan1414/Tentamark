-- Bluesky DM inbox polling. AT Protocol's chat.bsky.* namespace has no
-- webhook/push equivalent (unlike Meta/Telegram, which feed social_messages
-- via real-time webhooks) — this dispatcher mirrors
-- private.dispatch_video_render_queue() (0067) exactly, reusing the same
-- scheduler_webhook_secret Vault secret, so no new env var/secret setup is
-- needed for the cron path itself.
create or replace function private.dispatch_bluesky_inbox_poll()
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
    url := 'https://tentamark.com/api/workers/bluesky-inbox-poll',
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || webhook_secret
    )
  );
end;
$$;

revoke execute on function private.dispatch_bluesky_inbox_poll() from public, anon, authenticated;
select cron.schedule('dispatch-bluesky-inbox-poll', '*/5 * * * *', $$select private.dispatch_bluesky_inbox_poll();$$);
