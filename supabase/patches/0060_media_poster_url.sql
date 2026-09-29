-- Faz 4 (video yükleme): user-uploaded video needs a still thumbnail for the
-- media library grid and for the server-side smart-crop focal-point estimate
-- (see web/src/lib/media/focalPoint.ts) — neither can decode the source clip
-- itself cheaply, so a poster JPEG (generated client-side at upload time, see
-- web/src/lib/media/videoUploadMeta.ts) is stored alongside it.
alter table public.media add column if not exists poster_url text;
