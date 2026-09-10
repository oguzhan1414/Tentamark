-- Patch: two small additions from competitive research (docs/repo-research):
--
-- 1. content_platforms snapshot columns (TryPost's PostPlatform pattern) —
--    social_account_id is `on delete set null`, so today, if a connected
--    account is later disconnected, a historical post's "which account did
--    this actually go to" is silently lost. These are nullable and NOT
--    populated yet — real values arrive once phase 5 wires an actual
--    account-selection step into content creation (right now Compose
--    inserts content_platforms rows with no social_account_id at all).
--
-- 2. dashboard_briefings — cache table for a short AI-written "today's
--    summary" card (Social Stats' dashboard_briefing.py pattern), backed by
--    Postgres instead of Redis since we don't run a cache layer. One row per
--    brand; the server action checks generated_at before re-calling Groq.

alter table public.content_platforms
  add column if not exists platform_username text,
  add column if not exists platform_display_name text;

create table if not exists public.dashboard_briefings (
  brand_id uuid primary key references public.brands on delete cascade,
  text text not null,
  generated_at timestamptz not null default now()
);

alter table public.dashboard_briefings enable row level security;

create policy "Dashboard briefings select" on public.dashboard_briefings
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Dashboard briefings insert" on public.dashboard_briefings
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Dashboard briefings update" on public.dashboard_briefings
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
