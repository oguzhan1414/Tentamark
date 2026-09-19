-- ==============================================================================
-- Patch 0048: MCP Aşama 1 (part 1) — connections + Personal Access Tokens.
--
-- OAuth 2.1 authorization server (the other half of Aşama 1) is deliberately
-- NOT in this patch — it's a separate, larger deliverable (redirect flow,
-- PKCE, dynamic client registration, token rotation) with its own schema.
-- This patch only covers what a PAT-based developer beta needs, which is
-- also the shared shape both a PAT and a future OAuth grant hang off of.
-- ==============================================================================

-- mcp_connections — one row per grant, regardless of how it was issued.
-- `connection_type` distinguishes a PAT from a (future) OAuth grant so both
-- can share the same audit_logs.mcp_connection_id, McpActorContext.connectionId,
-- and brand-grant shape without two parallel "what can this caller do" models.
create table if not exists public.mcp_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  connection_type text not null check (connection_type in ('pat', 'oauth')),
  client_name text not null, -- a user-chosen label for a PAT, or the OAuth client's self-reported name later
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id) on delete set null
);

comment on table public.mcp_connections is 'One row per granted MCP credential (PAT today, OAuth later) — see docs/mcp-entegrasyon-plani.md. The actual secret material lives in mcp_personal_access_tokens (or a future mcp_oauth_tokens), never here.';

-- mcp_connection_brands — explicit many-to-many, never an implicit "brand_id
-- is null so grant every brand in the org". docs/mcp-entegrasyon-plani.md
-- was specific about this: a connection's brand access must be a deliberate
-- list, not a wildcard default.
create table if not exists public.mcp_connection_brands (
  connection_id uuid not null references public.mcp_connections(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  primary key (connection_id, brand_id)
);

-- mcp_personal_access_tokens — the PAT's secret material, one-to-one with a
-- connection_type='pat' row. Only the hash and a display-only prefix are
-- stored; the raw token is shown to the user exactly once, at creation.
create table if not exists public.mcp_personal_access_tokens (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null unique references public.mcp_connections(id) on delete cascade,
  token_prefix text not null unique, -- e.g. "tmpat_3f9a" — safe to log/display, used for O(1) lookup before hash comparison
  token_hash text not null,          -- sha-256 of the full raw secret
  expires_at timestamptz not null,   -- PATs are never issued without an expiry (docs/mcp-entegrasyon-plani.md: "Token süresiz olmamalı")
  created_at timestamptz not null default now()
);

comment on table public.mcp_personal_access_tokens is 'Secret material for connection_type=pat rows. token_hash only — see lib/mcp/auth/pat.ts for issuance/verification.';

alter table public.mcp_connections enable row level security;
alter table public.mcp_connection_brands enable row level security;
alter table public.mcp_personal_access_tokens enable row level security;

-- Members can see their org's connections (to know what's connected and by
-- whom) but only issuance/revocation (service-role, via
-- lib/mcp/auth/pat.ts) can write — matches the ai_runs/audit_logs
-- insert-mostly-via-service-role pattern already used throughout this schema.
create policy "MCP connections select" on public.mcp_connections
  for select to authenticated using (private.is_org_member(organization_id));

create policy "MCP connection brands select" on public.mcp_connection_brands
  for select to authenticated using (
    exists (select 1 from public.mcp_connections c where c.id = connection_id and private.is_org_member(c.organization_id))
  );

-- No select policy on mcp_personal_access_tokens at all — token_hash must
-- never be readable from the API surface, even to the org that owns it.
-- The connection-management UI reads token_prefix/expires_at/created_at
-- via a service-role Server Action (getConnectionsForOrg in
-- lib/mcp/auth/pat.ts), not a direct client-side select.

create index if not exists idx_mcp_connections_org on public.mcp_connections(organization_id) where status = 'active';
create index if not exists idx_mcp_connection_brands_brand on public.mcp_connection_brands(brand_id);
create index if not exists idx_mcp_pat_prefix on public.mcp_personal_access_tokens(token_prefix);

-- Now that mcp_connections exists, tighten audit_logs.mcp_connection_id and
-- point idempotency at a real table.
alter table public.audit_logs
  add constraint audit_logs_mcp_connection_id_fkey
  foreign key (mcp_connection_id) references public.mcp_connections(id) on delete set null;

alter table public.mcp_idempotency_keys
  add constraint mcp_idempotency_keys_connection_id_fkey
  foreign key (connection_id) references public.mcp_connections(id) on delete cascade;

-- Real SELECT policy for mcp_idempotency_keys, replacing the "nobody but
-- service_role" placeholder from patches/0047 now that there's an org to
-- scope by.
drop policy if exists "MCP idempotency keys select" on public.mcp_idempotency_keys;
create policy "MCP idempotency keys select" on public.mcp_idempotency_keys
  for select to authenticated using (
    exists (select 1 from public.mcp_connections c where c.id = connection_id and private.is_org_member(c.organization_id))
  );
