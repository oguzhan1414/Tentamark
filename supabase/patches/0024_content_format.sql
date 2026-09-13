-- content.format — Gönderi (post) / Hikaye (story) / Makara (reel), matching
-- Planable's own format tabs. Purely a classification + AI-prompt-tone input
-- for now: none of the publish connectors branch on it yet (that needs
-- separate per-platform Stories/Reels API work), so this doesn't change
-- what actually gets published, only how it's organized and how the AI is
-- nudged to write for it.
alter table public.content add column if not exists format text not null default 'post';
