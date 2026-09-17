-- "Şablonlarım" (Post Templates) — reusable caption skeletons a brand saves
-- once and reuses across posts (e.g. a customer-quote format, a weekly-tip
-- list format), instead of writing the same structure from scratch every
-- time. Deliberately no per-plan count limit: storage cost here is a text
-- row, same reasoning already applied to workspaces (supabase/patches/0034)
-- — no pricing policy exists yet to gate against, so nothing is gated.

create table if not exists public.content_templates (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  name text not null,
  body text not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_content_templates_brand on public.content_templates(brand_id, created_at desc);

alter table public.content_templates enable row level security;

-- Same access shape as content/brand_dna: reachable by anyone in the owning
-- org, no separate per-role gate — templates aren't sensitive the way
-- billing/invites are.
create policy "Content templates select" on public.content_templates
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
create policy "Content templates insert" on public.content_templates
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
create policy "Content templates delete" on public.content_templates
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
