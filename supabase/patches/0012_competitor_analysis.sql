-- Patch: brand_dna.competitor_analysis — structured, detailed competitor
-- insight, separate from the existing flat `competitors` name list.
--
-- `competitors` stays exactly as-is (a plain jsonb array of name strings) —
-- getBrandContext.ts and the Marka Profili "Ana Rakipler & Alternatifler"
-- text field both already treat it as flat strings via `.map(String)` /
-- comma-list parsing, and overloading that same column with richer objects
-- would silently break both. This is a new column instead.
alter table public.brand_dna
  add column if not exists competitor_analysis jsonb default '[]'::jsonb;
