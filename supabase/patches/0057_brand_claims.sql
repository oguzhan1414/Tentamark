-- Claim ledger — today autofillFromWebsite() dumps everything factual it
-- finds into one free-text brand_dna.raw_notes field, which then flows into
-- every AI generation call as loose "helpful context". Nothing stops a
-- generation from inventing a number/promise that was never actually on the
-- site. This table makes claims individually structured (with their source),
-- and getBrandContext.ts (next patch's app-code change) turns them into a
-- hard "only use these, don't invent others" instruction instead of a
-- polite suggestion.
--
-- Same trust tier as brand_dna itself: any brand member can trigger a
-- re-scan from Marka Profili, so RLS mirrors brand_dna's own policies
-- exactly (private.can_access_brand, not can_review_brand).

create table if not exists public.brand_claims (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  claim_text text not null,
  source_url text,
  extracted_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_brand_claims_brand on public.brand_claims(brand_id);

alter table public.brand_claims enable row level security;

create policy "Brand claims select" on public.brand_claims
  for select to authenticated using (private.can_access_brand(brand_id));
create policy "Brand claims insert" on public.brand_claims
  for insert to authenticated with check (private.can_access_brand(brand_id));
create policy "Brand claims delete" on public.brand_claims
  for delete to authenticated using (private.can_access_brand(brand_id));
