-- Patch: store the real permalink a platform returns after a successful
-- publish, so the app can show "Gönderiyi Görüntüle" pointing at the actual
-- live post instead of just knowing it published (content_platforms already
-- had platform_post_id, but that's a raw API id, not always a working URL —
-- Instagram/Threads shortcodes in particular aren't derivable from it).
--
-- Run this once in the Supabase SQL Editor (this repo has no linked CLI
-- project, same as every other supabase/patches/*.sql file).

alter table public.content_platforms
  add column if not exists permalink_url text;
