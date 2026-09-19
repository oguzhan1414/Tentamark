-- Shared, atomic rate limiting for unauthenticated MCP/OAuth endpoints.
create table if not exists public.mcp_rate_limits (
  bucket text not null,
  identifier_hash text not null,
  window_start timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  primary key (bucket, identifier_hash, window_start)
);

alter table public.mcp_rate_limits enable row level security;

create or replace function public.consume_mcp_rate_limit(
  p_bucket text,
  p_identifier_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit configuration';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into public.mcp_rate_limits(bucket, identifier_hash, window_start, request_count)
  values (p_bucket, p_identifier_hash, v_window_start, 1)
  on conflict (bucket, identifier_hash, window_start)
  do update set request_count = public.mcp_rate_limits.request_count + 1
  returning request_count into v_count;

  return query select
    v_count <= p_limit,
    greatest(p_limit - v_count, 0),
    v_window_start + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on table public.mcp_rate_limits from public, anon, authenticated;
revoke all on function public.consume_mcp_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_mcp_rate_limit(text, text, integer, integer) to service_role;

create index if not exists idx_mcp_rate_limits_cleanup on public.mcp_rate_limits(window_start);

