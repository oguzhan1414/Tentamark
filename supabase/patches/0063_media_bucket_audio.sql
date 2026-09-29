-- Faz 5 (voice-over): generated TTS voiceover clips (OpenAI tts-1, mp3) need
-- to upload into the same `media` Storage bucket every other render asset
-- uses. Same one-line shape as 0062 (video/quicktime).
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg']
where id = 'media';
