-- Patch: calendar_notes — free-text sticky notes on a calendar day,
-- independent of any real content/post (matches the "write a custom note"
-- cards seen in competitor calendar tools). Deliberately separate from
-- `content`: a note never becomes a post, has no platform/status/schedule
-- machinery, just a brand + date + text.
create table if not exists public.calendar_notes (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  note_date date not null,
  text text not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_calendar_notes_brand_date on public.calendar_notes(brand_id, note_date);

alter table public.calendar_notes enable row level security;

create policy "Calendar notes select" on public.calendar_notes
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Calendar notes insert" on public.calendar_notes
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Calendar notes delete" on public.calendar_notes
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
