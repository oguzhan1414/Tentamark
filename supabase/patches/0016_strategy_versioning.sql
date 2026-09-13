-- Patch: brand_strategy.input_snapshot + change_notes — real "why did this
-- version change" reasoning instead of a bare version number.
--
-- input_snapshot: the brand_dna fields (industry, tone_of_voice,
-- brand_traits, target_audience, competitors) actually used to generate
-- THIS version — kept so the next generation can diff against it honestly.
-- change_notes: { changed_inputs: string[], pillar_diffs: {name, old_pct,
-- new_pct}[] } computed by comparing to the previous version at generation
-- time — real diffs of real inputs, not invented "signals".
alter table public.brand_strategy
  add column if not exists input_snapshot jsonb default '{}'::jsonb,
  add column if not exists change_notes jsonb default '{}'::jsonb;
