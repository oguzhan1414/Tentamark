-- Patch: brand_dna.audience_persona / audience_pain_points / audience_motivations
-- — structured Audience Intelligence, replacing the single free-text
-- "Hedef Kitle Segmentleri" textarea with a real persona + pain points +
-- motivations breakdown that autofill can populate directly.
--
-- target_audience (existing jsonb column) stays untouched — it's still the
-- flat segment list every AI prompt reads via getBrandContext.ts.
alter table public.brand_dna
  add column if not exists audience_persona jsonb default '{}'::jsonb,
  add column if not exists audience_pain_points jsonb default '[]'::jsonb,
  add column if not exists audience_motivations jsonb default '[]'::jsonb;
