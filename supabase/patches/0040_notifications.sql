-- ==============================================================================
-- PATCH 0040: NOTIFICATIONS SYSTEM
-- Provides in-app notification infrastructure for team approvals, publishing
-- alerts, AI autopilot insights, calendar gaps, and account token health.
-- Inbox ownership requires both organization membership and auth.uid().
-- ==============================================================================

create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null check (category in ('approvals', 'publishing', 'ai_guardian', 'calendar', 'connections')),
  type text not null,
  title text not null,
  message text not null,
  link text,
  action_label text,
  is_read boolean default false not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- Indexes for lightning fast queries
create index if not exists idx_notifications_brand_user on public.notifications(brand_id, user_id, is_read, created_at desc);
create index if not exists idx_notifications_unread on public.notifications(brand_id, is_read) where is_read = false;

-- Enable RLS
alter table public.notifications enable row level security;

-- RLS policies: only the recipient can access their inbox row.
create policy "Notifications select" on public.notifications
  for select to authenticated using (
    exists (
      select 1 from public.brands b
      where b.id = brand_id and private.is_org_member(b.organization_id)
    ) and user_id = (select auth.uid())
  );

create policy "Notifications insert" on public.notifications
  for insert to authenticated with check (
    exists (
      select 1 from public.brands b
      where b.id = brand_id and private.is_org_member(b.organization_id)
    ) and user_id = (select auth.uid())
  );

create policy "Notifications update" on public.notifications
  for update to authenticated using (
    exists (
      select 1 from public.brands b
      where b.id = brand_id and private.is_org_member(b.organization_id)
    ) and user_id = (select auth.uid())
  ) with check (
    exists (
      select 1 from public.brands b
      where b.id = brand_id and private.is_org_member(b.organization_id)
    ) and user_id = (select auth.uid())
  );

create policy "Notifications delete" on public.notifications
  for delete to authenticated using (
    exists (
      select 1 from public.brands b
      where b.id = brand_id and private.is_org_member(b.organization_id)
    ) and user_id = (select auth.uid())
  );
