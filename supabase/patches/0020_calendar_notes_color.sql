-- Patch: calendar_notes.color — lets a note carry one of a small preset
-- palette (matches the color-swatch picker seen in competitor calendar
-- tools), not just a single fixed amber. Free text, not a check constraint,
-- since the palette is a client-side concern (NOTE_COLORS map) — adding a
-- new swatch later shouldn't require a migration.
alter table public.calendar_notes add column if not exists color text not null default 'amber';
