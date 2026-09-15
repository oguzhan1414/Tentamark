-- Patch: Canva Connect API integration — lets a brand connect its own Canva
-- account once (OAuth 2.0 + PKCE, same shape as Pinterest's confidential
-- client flow) so Compose's media library can offer "Canva ile Tasarla":
-- open a design in Canva's editor, then pull the finished export back in as
-- a normal media library item.
--
-- Deliberately not a social_accounts row — Canva is a design tool, not a
-- publish target, so it carries none of that table's publish bookkeeping
-- (platform_post_id, publish_attempts, capabilities, etc. don't apply here).
--
-- Run this once in the Supabase SQL Editor (this repo has no linked CLI
-- project, same as every other supabase/patches/*.sql file).

create table if not exists public.canva_connections (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  canva_user_id text not null,
  canva_team_id text,
  display_name text,
  access_token_encrypted text not null,
  refresh_token_encrypted text not null,
  token_expires_at timestamptz not null,
  status text default 'active' not null, -- 'active', 'needs_reauth'
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(brand_id)
);

alter table public.canva_connections enable row level security;

create policy "Canva connections select" on public.canva_connections
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Canva connections insert" on public.canva_connections
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Canva connections update" on public.canva_connections
  for update to authenticated
  using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  )
  with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Canva connections delete" on public.canva_connections
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
