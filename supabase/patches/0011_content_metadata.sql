-- Patch: content.metadata — real structured storage for AI-generated extras
-- (hook, visual/video concept) that the weekly-pack feature needs.
--
-- Root cause of a real display bug: without this column, hook/visual_prompt
-- were being text-encoded into core_idea ("Kanca (Hook): ...\n\nGörsel/Video
-- Konsepti: ...") and re-parsed with regex in posts/page.tsx and
-- calendar/page.tsx. Any content with a plain core_idea (i.e. everything
-- created via the regular single-item Compose flow) matched neither regex,
-- and the fallback branch mislabeled the raw idea text as a "visual concept"
-- in the UI. Real columns replace the text-encode/regex-decode roundtrip.
alter table public.content
  add column if not exists metadata jsonb;
