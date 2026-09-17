-- Multi-brand "workspaces": an organization can now hold more than one
-- brand, switchable per user. The column below is the hook a real pricing
-- tier will eventually set — but that pricing policy hasn't been decided
-- yet, so the default is deliberately generous (not "starter=1") rather than
-- guessing numbers ahead of an actual decision. Tighten it later per-org once
-- real plans exist; nothing else in the app needs to change to do that.

alter table public.organizations
  add column if not exists max_brands integer not null default 20;

update public.organizations set max_brands = 20 where max_brands = 1;

alter table public.profiles
  add column if not exists active_brand_id uuid references public.brands(id) on delete set null;

-- Brands never had an insert policy — nothing could create one outside the
-- handle_new_user() signup trigger (security definer, bypasses RLS). Workspace
-- creation needs a real one now, gated to org owners the same way invites and
-- member-role changes already are (private.is_org_owner, defined in §9).
create policy "Org owners can create brands" on public.brands
  for insert to authenticated with check (private.is_org_owner(organization_id));
