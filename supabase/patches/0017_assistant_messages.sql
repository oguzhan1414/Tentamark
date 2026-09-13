-- Patch: assistant_messages — persisted chat history for the AI marketing
-- copilot (previously React state only, lost on reload).
--
-- Doubles as the raw dataset for future fine-tuning: draft + draft_status
-- (pending/accepted/rejected) is a real quality signal — did the user accept
-- the AI's content draft as-is, or reject it — captured as a free byproduct
-- of normal usage, no extra logging work needed later.
create table if not exists public.assistant_messages (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  role text not null, -- 'user' | 'assistant'
  content text not null,
  draft jsonb,
  draft_status text,
  content_id uuid references public.content on delete set null,
  created_at timestamptz default now() not null
);

create index if not exists idx_assistant_messages_brand_created on public.assistant_messages(brand_id, created_at);

alter table public.assistant_messages enable row level security;

create policy "Assistant messages select" on public.assistant_messages
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Assistant messages insert" on public.assistant_messages
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Assistant messages update" on public.assistant_messages
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
