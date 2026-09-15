-- Patch: WooCommerce integration — lets a brand connect its own WooCommerce
-- store (Consumer Key/Secret generated from the store's own WP admin, no
-- OAuth) so Compose can pull real products in as content ideas.
--
-- Deliberately not a social_accounts row — WooCommerce is a product data
-- SOURCE, not a publish target the way Instagram/Bluesky/etc. are. There is
-- no "post to WooCommerce" concept; the store's products just feed the AI
-- an idea (name/price/description/image), and the actual publish still
-- goes out through a real social platform.
--
-- Run this once in the Supabase SQL Editor (this repo has no linked CLI
-- project, same as every other supabase/patches/*.sql file).

create table if not exists public.woocommerce_connections (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  store_url text not null,
  store_name text,
  consumer_key_encrypted text not null,
  consumer_secret_encrypted text not null,
  status text default 'active' not null, -- 'active', 'needs_reauth'
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(brand_id)
);

alter table public.woocommerce_connections enable row level security;

create policy "WooCommerce connections select" on public.woocommerce_connections
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "WooCommerce connections insert" on public.woocommerce_connections
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "WooCommerce connections update" on public.woocommerce_connections
  for update to authenticated
  using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  )
  with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "WooCommerce connections delete" on public.woocommerce_connections
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
