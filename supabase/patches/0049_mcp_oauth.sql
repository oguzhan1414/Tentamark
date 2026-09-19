-- ==============================================================================
-- Patch 0049: MCP Aşama 1 (part 2) — OAuth 2.1 authorization server schema.
--
-- Builds on patches/0047 (audit_logs, updated_at triggers, idempotency) and
-- 0048 (mcp_connections, mcp_connection_brands, mcp_personal_access_tokens).
-- An OAuth grant becomes a connection_type='oauth' row in mcp_connections,
-- exactly like a PAT is a connection_type='pat' row — the tables here only
-- hold what's specific to the OAuth dance itself: registered clients,
-- short-lived authorization codes, and the access/refresh token pair a
-- successful token exchange produces.
-- ==============================================================================

-- mcp_oauth_clients — populated by Dynamic Client Registration
-- (POST /api/oauth/register, RFC 7591). MCP clients (Claude, ChatGPT) are
-- public clients: PKCE replaces a client secret, so client_secret_hash is
-- nullable and unused by the public flow this patch implements — kept for a
-- future confidential-client path rather than modeled in later.
create table if not exists public.mcp_oauth_clients (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  client_secret_hash text,
  client_name text not null,
  redirect_uris text[] not null,
  is_confidential boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.mcp_connections
  add column if not exists oauth_client_id text references public.mcp_oauth_clients(client_id) on delete set null;

comment on table public.mcp_oauth_clients is 'Dynamically registered OAuth clients (RFC 7591). redirect_uris is matched exactly (no prefix/wildcard matching) at both /oauth/authorize and the token exchange — see lib/mcp/auth/oauthFlow.ts.';

-- mcp_authorization_codes — one row per code issued from the consent screen,
-- consumed exactly once at the token endpoint. Storing a hash of the code
-- (not the code itself) means a read-only DB leak doesn't hand over usable
-- codes, same reasoning as mcp_personal_access_tokens.token_hash.
create table if not exists public.mcp_authorization_codes (
  code_hash text primary key,
  client_id text not null references public.mcp_oauth_clients(client_id) on delete cascade,
  redirect_uri text not null,
  code_challenge text not null,
  code_challenge_method text not null default 'S256' check (code_challenge_method = 'S256'),
  scopes text[] not null,
  brand_ids uuid[] not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.mcp_authorization_codes is 'Short-lived (created with a ~5 minute expiry by lib/mcp/auth/oauthFlow.ts), single-use codes from the /oauth/authorize consent screen. consumed_at set on first successful exchange; a second exchange attempt with the same code must fail, not silently succeed again.';

-- mcp_oauth_tokens — the live access/refresh token pair for an active OAuth
-- connection. One row per connection at a time in practice (refresh
-- rotates this row's tokens rather than inserting a new one), but not
-- constrained to exactly one here — refreshOAuthTokens deciding to keep
-- history instead of overwriting is a reasonable future choice this schema
-- doesn't foreclose.
create table if not exists public.mcp_oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.mcp_connections(id) on delete cascade,
  access_token_hash text not null unique,
  access_token_expires_at timestamptz not null,
  refresh_token_hash text unique,
  refresh_token_expires_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.mcp_oauth_tokens is 'Hashed access/refresh token pair for an OAuth-issued connection. Never store the raw token — see lib/mcp/auth/oauthFlow.ts.';

alter table public.mcp_oauth_clients enable row level security;
alter table public.mcp_authorization_codes enable row level security;
alter table public.mcp_oauth_tokens enable row level security;

-- No SELECT policies on any of these three for authenticated/anon: client
-- registration is a public, unauthenticated action (any MCP client can
-- register itself, same as it would against a real OAuth server), and
-- reading it back offers no legitimate use from the browser session side —
-- the connection-management UI already gets everything it needs to display
-- from mcp_connections/mcp_connection_brands (patches/0048), which do have
-- scoped SELECT policies. Authorization codes and token hashes must never
-- be readable from the API surface at all, by anyone.

create index if not exists idx_mcp_oauth_codes_expiry on public.mcp_authorization_codes(expires_at) where consumed_at is null;
create index if not exists idx_mcp_oauth_tokens_connection on public.mcp_oauth_tokens(connection_id);
create index if not exists idx_mcp_connections_oauth_client on public.mcp_connections(oauth_client_id)
  where oauth_client_id is not null;

-- MCP publish approval links are security-sensitive capabilities. Existing
-- human-created review links keep their legacy behavior, while MCP links are
-- short-lived and single-use.
alter table public.content_share_links
  add column if not exists purpose text not null default 'review'
    check (purpose in ('review', 'mcp_publish')),
  add column if not exists expires_at timestamptz,
  add column if not exists used_at timestamptz;

create or replace function public.respond_to_share_link(p_token text, p_action text, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link_id uuid;
  v_content_id uuid;
  v_status text;
  v_purpose text;
  v_expires_at timestamptz;
  v_used_at timestamptz;
begin
  select l.id, l.content_id, l.status, l.purpose, l.expires_at, l.used_at
    into v_link_id, v_content_id, v_status, v_purpose, v_expires_at, v_used_at
  from public.content_share_links l
  where l.token = p_token
  for update;

  if v_content_id is null then raise exception 'Bağlantı bulunamadı.'; end if;
  if v_status <> 'active' then raise exception 'Bu bağlantı artık geçerli değil.'; end if;
  if v_expires_at is not null and v_expires_at <= now() then raise exception 'Bu bağlantının süresi doldu.'; end if;
  if v_purpose = 'mcp_publish' and v_used_at is not null then raise exception 'Bu bağlantı daha önce kullanıldı.'; end if;

  if p_action = 'approve' then
    update public.content set status = 'APPROVED'
    where id = v_content_id and status = 'NEEDS_REVIEW';
    if not found then raise exception 'Content is no longer awaiting review.'; end if;
    if v_purpose = 'mcp_publish' then
      update public.content_share_links set used_at = now(), status = 'revoked' where id = v_link_id;
    end if;
  elsif p_action = 'feedback' then
    if p_note is null or trim(p_note) = '' then raise exception 'Geri bildirim boş olamaz.'; end if;
    insert into public.content_comments (content_id, author_id, body, is_external)
    values (v_content_id, null, p_note, true);
    if v_purpose = 'mcp_publish' then
      update public.content_share_links set used_at = now(), status = 'revoked' where id = v_link_id;
    end if;
  else
    raise exception 'Geçersiz işlem.';
  end if;
end;
$$;

revoke all on function public.respond_to_share_link(text, text, text) from public;
grant execute on function public.respond_to_share_link(text, text, text) to authenticated, anon;
