-- Visual DNA, part 2 (color extraction already existed via
-- extractBrandColors() — this patch is just the missing piece: a short
-- AI-read aesthetic descriptor alongside it, e.g. "minimal ve pastel" or
-- "maksimalist ve enerjik renkli". Same nature as trait_scores/tone_position
-- (a subjective read, editable, not a hard factual claim like brand_claims),
-- so it's populated on both the real-scrape and fallback autofill branches
-- exactly like those two already are.

alter table public.brand_dna add column if not exists visual_style text;
