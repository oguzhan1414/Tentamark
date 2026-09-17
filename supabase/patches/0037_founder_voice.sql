-- Kurucu/CEO "Ghostwriter" Modu — lets Compose write a post in the
-- founder's personal first-person voice instead of the brand's corporate
-- voice, reusing the exact same generateDrafts() pipeline. Just two extra
-- fields on brand_dna (same table tone_of_voice already lives on); nothing
-- to build if a brand never fills them in — the founder-voice option in
-- Compose simply won't appear.

alter table public.brand_dna add column if not exists founder_name text;
alter table public.brand_dna add column if not exists founder_voice text;
