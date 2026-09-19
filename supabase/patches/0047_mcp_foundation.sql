-- ==============================================================================
-- Patch 0047: MCP Aşama 0 — audit trail, idempotency, and optimistic
-- concurrency foundations (docs/mcp-entegrasyon-plani.md).
--
-- Does NOT create mcp_connections or mcp_personal_access_tokens yet — those
-- are Aşama 1 (real OAuth/PAT issuance). This patch only builds the three
-- things every later stage depends on: a real updated_at that actually
-- changes (needed for expected_updated_at concurrency checks to mean
-- anything at all), a richer audit_logs shape, and an idempotency ledger.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. updated_at auto-bump trigger
--
-- Verified against the live schema: every table's `updated_at` column is set
-- ONLY by its `default now()` at insert time. No trigger and no application
-- code (approvalItems.ts, posts/page.tsx, calendar/page.tsx) ever sets it on
-- UPDATE. Concretely: `content.updated_at` for a row created last month and
-- edited five times today still reads last month's timestamp.
--
-- This matters beyond MCP — but it matters *urgently* for MCP, because
-- reschedule_draft/submit_for_approval's `expectedUpdatedAt` optimistic-
-- concurrency check (docs/mcp-entegrasyon-plani.md, "Dördüncü kritik eksik")
-- is meaningless against a column that never changes: two concurrent editors
-- would both read the same stale updated_at, both pass the check, and the
-- second write would silently clobber the first — exactly the race the
-- check exists to catch.
-- ------------------------------------------------------------------------------
create or replace function private.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Scoped to the tables MCP's Aşama 3/4 tools actually touch (content,
-- content_platforms) plus brand_dna (read/summarized by get_brand_profile,
-- and edited by the existing Brand Profile page) — not a blanket "every
-- table in the schema" change, to keep this patch's blast radius reviewable.
-- Widen the list in a follow-up patch if more tables grow a real concurrency
-- need.
drop trigger if exists set_updated_at on public.content;
create trigger set_updated_at before update on public.content
for each row execute function private.set_updated_at();

drop trigger if exists set_updated_at on public.content_platforms;
create trigger set_updated_at before update on public.content_platforms
for each row execute function private.set_updated_at();

drop trigger if exists set_updated_at on public.brand_dna;
create trigger set_updated_at before update on public.brand_dna
for each row execute function private.set_updated_at();

-- ------------------------------------------------------------------------------
-- 2. audit_logs — richer actor/connection/request shape
--
-- The existing table already has RLS that only lets `service_role` insert
-- (no INSERT policy exists for `authenticated`/`anon`) — so it is already
-- insert-only from a normal session's point of view. What it's missing is
-- the columns to say *which kind* of caller wrote a row, and the shape a
-- future MCP mutation needs. `user_id` stays as the human this credential
-- traces back to; the new columns describe the credential/call itself.
--
-- Honest limitation, not silently glossed over: service_role bypasses RLS
-- (and typically holds full table grants) by design elsewhere in this
-- schema, so no DB-level constraint here can stop an admin-client caller
-- from issuing an UPDATE/DELETE against this table. The real enforcement
-- point is convention: exactly one function (lib/mcp/audit.ts's
-- recordAuditEvent, and its future non-MCP UI equivalent) is ever allowed to
-- touch this table, and it only ever INSERTs. The `revoke` below is
-- defense-in-depth against a normal authenticated/anon session, not a
-- guarantee against a compromised service-role key.
-- ------------------------------------------------------------------------------
alter table public.audit_logs
  add column if not exists actor_type text not null default 'user'
    check (actor_type in ('user', 'mcp_oauth', 'mcp_pat', 'system')),
  -- No FK yet — mcp_connections doesn't exist until Aşama 1. A follow-up
  -- patch adds `references public.mcp_connections(id) on delete set null`
  -- once that table lands, without needing to touch existing rows.
  add column if not exists mcp_connection_id uuid,
  add column if not exists request_id text,
  add column if not exists tool_name text,
  add column if not exists outcome text not null default 'success'
    check (outcome in ('success', 'denied', 'failed')),
  add column if not exists before_state jsonb,
  add column if not exists after_state jsonb,
  add column if not exists client_name text;

comment on column public.audit_logs.actor_type is 'Who/what performed the action: a human session, an OAuth-connected MCP client, a PAT-authenticated caller, or an internal system process (cron, trigger).';
comment on column public.audit_logs.mcp_connection_id is 'Which MCP connection this came from, when actor_type is mcp_oauth/mcp_pat. No FK yet (see comment above) — validate the referenced row exists in application code until Aşama 1 adds the constraint.';
comment on column public.audit_logs.request_id is 'End-to-end correlation id for tracing one logical request across the MCP transport, tool handler, and any downstream Server Action it calls.';
comment on column public.audit_logs.tool_name is 'The MCP tool name (see web/src/lib/mcp/contracts/tools) that produced this row, null for actions taken directly in the Tentamark UI.';
comment on column public.audit_logs.outcome is 'success | denied (scope/brand check failed before anything ran) | failed (ran but errored partway through).';
comment on column public.audit_logs.before_state is 'Minimal snapshot of the fields the action changed, before the change. Never include secrets, social-platform access tokens, or full AI prompts here — see docs/mcp-entegrasyon-plani.md''s privacy section.';
comment on column public.audit_logs.after_state is 'Same shape as before_state, after the change.';
comment on column public.audit_logs.client_name is 'The connecting MCP client''s self-reported name (Claude, ChatGPT, Cursor, ...), null for the Tentamark UI itself.';

revoke update, delete on public.audit_logs from authenticated, anon;

create index if not exists idx_audit_logs_mcp_connection on public.audit_logs(mcp_connection_id) where mcp_connection_id is not null;
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);

-- ------------------------------------------------------------------------------
-- 3. mcp_idempotency_keys
--
-- Every write tool in web/src/lib/mcp/contracts/tools/writeTools.ts requires
-- an idempotencyKey precisely because an MCP client is expected to retry a
-- timed-out call — this table is what makes a retry return the original
-- result instead of creating a second draft / re-submitting for approval /
-- minting a second publish-approval link.
--
-- `connection_id` is `not null` even though mcp_connections doesn't exist
-- yet, on purpose: nothing can legitimately call an idempotent tool before
-- Aşama 1 issues a real connection anyway, and this avoids a nullable
-- uniqueness edge case (multiple NULLs don't conflict under a unique
-- constraint) that would otherwise let two connection-less test calls
-- silently collide or silently not collide depending on Postgres version
-- behavior around nulls in unique indexes.
-- ------------------------------------------------------------------------------
create table if not exists public.mcp_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null,
  tool_name text not null,
  idempotency_key text not null,
  -- sha-256 of the canonicalized input payload — lets us detect "same key,
  -- different input" (a client bug, or a forged replay) and reject it with
  -- CONFLICT instead of returning a cached result for the wrong call.
  request_hash text not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed')),
  result jsonb,
  error jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (connection_id, tool_name, idempotency_key)
);

comment on table public.mcp_idempotency_keys is 'Replay ledger for MCP write tools. One row per (connection, tool, idempotency key); see lib/mcp/idempotency.ts for the check-then-claim logic that writes it.';

alter table public.mcp_idempotency_keys enable row level security;

-- No policies for authenticated/anon at all, on purpose: `result`/`error`
-- can contain another org's cached tool output (a draft caption, a brand
-- profile snapshot, ...), and without mcp_connections yet there's no join
-- target to scope a SELECT policy by connection-owning-org. RLS with zero
-- policies denies every role except service_role, which is exactly what
-- lib/mcp/idempotency.ts needs and nothing more. Aşama 1 adds a real
-- "connection belongs to caller's org" SELECT policy once mcp_connections
-- exists — until then this table is deliberately unreadable from the API
-- surface, not "loosely readable".

create index if not exists idx_mcp_idempotency_lookup
  on public.mcp_idempotency_keys(connection_id, tool_name, idempotency_key);
