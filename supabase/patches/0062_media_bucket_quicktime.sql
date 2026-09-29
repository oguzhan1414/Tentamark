-- Faz 4 (video yükleme): iPhones default to .mov (video/quicktime), not
-- video/mp4/webm — the "ham telefon videosu" (raw phone video) use case this
-- phase targets would otherwise be rejected at the bucket level before a user
-- ever sees a validation error. Same shape as 0018, just a wider allowlist.
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'media';
