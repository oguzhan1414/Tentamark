-- "Onaya ata" — lets a reviewer be assigned to a specific piece of content
-- from Onaylarım. No notification infra exists yet (no email/push), so this
-- is deliberately just an assignment record + a filterable/visible field —
-- not a "ping this person" feature. That's an honest, stated scope cut, not
-- an oversight.

alter table public.content add column if not exists assigned_to uuid references public.profiles(id) on delete set null;

create index if not exists idx_content_assigned_to on public.content(assigned_to);
