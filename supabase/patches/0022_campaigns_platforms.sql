-- Patch: campaigns.platforms — lets a campaign declare upfront which
-- channels it's meant to run on (matches the "Bağlantılar" / channel picker
-- seen in competitor campaign tools). Purely a scoping label for now — it
-- doesn't restrict which platforms content tagged to this campaign can
-- actually target, that's still Compose's own connected-accounts filter.
alter table public.campaigns add column if not exists platforms text[] not null default '{}';
