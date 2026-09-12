-- Patch: widen the `media` Storage bucket to accept video, not just images.
--
-- Needed for TikTok: tiktokProvider.ts's publish() requires a real video
-- (Direct Post has no text/image-only path, unlike Facebook/Instagram/
-- Threads) and its own validateMedia() already allows video/mp4|webm up to
-- 128MB — the bucket itself was still image-only/10MB from
-- 0006_media_storage.sql, so Compose could never actually produce a file the
-- TikTok connector could accept. This just raises the bucket-level ceiling to
-- match; per-platform limits still live in each provider's validateMedia().
update storage.buckets
set
  file_size_limit = 134217728, -- 128MB, matches tiktokProvider.validateMedia()
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
where id = 'media';
