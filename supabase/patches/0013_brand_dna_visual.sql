-- Patch: brand_dna.trait_scores + brand_dna.tone_position — structured,
-- numeric backing for the new visual Brand DNA sliders and Tone of Voice
-- quadrant on the Marka Profili page, replacing/augmenting free-text inputs
-- with something draggable/sliderable that can be redrawn exactly on reload.
--
-- tone_of_voice (existing text column) stays as the plain-language string
-- every AI prompt already reads via getBrandContext.ts — the quadrant writes
-- a derived description into it, it does not replace it. tone_position is
-- the raw {x, y} needed to redraw the dot at its exact saved spot.
alter table public.brand_dna
  add column if not exists trait_scores jsonb default '{}'::jsonb,
  add column if not exists tone_position jsonb default '{"x": 0, "y": 0}'::jsonb;
