-- Patch: per-platform aspect-ratio cropping. Every attached photo used to go
-- out to every platform as the exact same file — Instagram/Facebook/Threads
-- want 4:5, Pinterest wants 2:3, and whichever platform's ratio didn't match
-- the source just got auto-cropped by that platform itself (often badly).
-- Compose now generates a real center-cropped variant per distinct ratio
-- actually needed and links it here instead of relying on that.
--
-- Run this once in the Supabase SQL Editor (this repo has no linked CLI
-- project, same as every other supabase/patches/*.sql file).

-- Which media row this platform's publish should actually use, if it
-- differs from the content's shared content_media. Null means "use the
-- shared media" (every existing row keeps behaving exactly as before).
alter table public.content_platforms
  add column if not exists media_override_id uuid references public.media(id) on delete set null;

-- Marks a media row as a cropped derivative of another (rather than
-- something the user actually uploaded/generated) — useMediaLibrary filters
-- these out of the picker so the library doesn't fill up with crop
-- variants nobody meant to browse or reuse directly.
alter table public.media
  add column if not exists derived_from_media_id uuid references public.media(id) on delete cascade;

create index if not exists idx_media_derived_from on public.media(derived_from_media_id);
