-- Patch: brand_dna.market_comparison — brand-level competitive positioning,
-- separate from the existing per-competitor competitor_analysis array.
--
-- Shape: { dimensions: string[], brandScores: Record<string, number>,
--          competitiveGap: string, opportunity: string }
--
-- Explicitly framed as an AI-estimate based on general market knowledge, not
-- measured data — same honesty boundary as competitor_analysis. No live
-- monitoring backs any of these numbers.
alter table public.brand_dna
  add column if not exists market_comparison jsonb default '{}'::jsonb;
