-- Run after 0040 and 0041. Also upgrades databases where 0040 was already applied.
insert into public.notifications (brand_id, user_id, category, type, title, message, link, action_label, is_read, metadata, created_at)
select n.brand_id, m.user_id, n.category, n.type, n.title, n.message, n.link, n.action_label, n.is_read, n.metadata, n.created_at
from public.notifications n
join public.brands b on b.id = n.brand_id
join public.organization_members m on m.organization_id = b.organization_id
where n.user_id is null;
delete from public.notifications where user_id is null;
alter table public.notifications alter column user_id set not null;

drop policy if exists "Notifications select" on public.notifications;
drop policy if exists "Notifications insert" on public.notifications;
drop policy if exists "Notifications update" on public.notifications;
drop policy if exists "Notifications delete" on public.notifications;

create policy "Notifications select" on public.notifications for select to authenticated
using (user_id = (select auth.uid()) and exists (
  select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id)
));
create policy "Notifications insert" on public.notifications for insert to authenticated
with check (user_id = (select auth.uid()) and exists (
  select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id)
));
create policy "Notifications update" on public.notifications for update to authenticated
using (user_id = (select auth.uid()) and exists (
  select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id)
))
with check (user_id = (select auth.uid()) and exists (
  select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id)
));
create policy "Notifications delete" on public.notifications for delete to authenticated
using (user_id = (select auth.uid()) and exists (
  select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id)
));

grant select, insert, update, delete on public.notifications to authenticated;

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  publish_alerts boolean not null default true
);
alter table public.notification_preferences enable row level security;
create policy "Notification preferences select" on public.notification_preferences
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Notification preferences insert" on public.notification_preferences
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Notification preferences update" on public.notification_preferences
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select, insert, update on public.notification_preferences to authenticated;

-- Notifications are created by the event itself. A trigger cannot depend on
-- the acting user's inbox INSERT policy when the recipient is a teammate.
create or replace function private.notify_content_review() returns trigger
language plpgsql security definer set search_path = '' as $$
declare recipient uuid;
begin
  if new.status <> 'NEEDS_REVIEW' then return new; end if;
  if tg_op = 'UPDATE' then
    if old.status = new.status and old.assigned_to is not distinct from new.assigned_to then return new; end if;
  end if;
  if new.assigned_to is not null then
    select m.user_id into recipient
    from public.organization_members m
    join public.brands b on b.organization_id = m.organization_id
    where b.id = new.brand_id and m.user_id = new.assigned_to;
  else
    select m.user_id into recipient
    from public.organization_members m
    join public.brands b on b.organization_id = m.organization_id
    where b.id = new.brand_id and m.role in ('owner', 'admin')
    order by case when m.role = 'owner' then 0 else 1 end, m.created_at
    limit 1;
  end if;
  if recipient is not null then
    insert into public.notifications (brand_id, user_id, category, type, title, message, link, action_label, metadata)
    values (new.brand_id, recipient, 'approvals', 'pending_approval', 'İçerik onayınızı bekliyor',
      left(new.title, 160), '/dashboard/approvals', 'İncele', jsonb_build_object('content_id', new.id));
  end if;
  return new;
end;
$$;
revoke all on function private.notify_content_review() from public;
drop trigger if exists content_review_notification on public.content;
create trigger content_review_notification after insert or update of status, assigned_to on public.content
for each row execute function private.notify_content_review();

create or replace function private.notify_publish_result() returns trigger
language plpgsql security definer set search_path = '' as $$
declare content_row public.content%rowtype;
declare recipient uuid;
begin
  if new.status not in ('PUBLISHED', 'NEEDS_USER_ACTION') or old.status is not distinct from new.status then return new; end if;
  select * into content_row from public.content where id = new.content_id;
  recipient := coalesce(content_row.created_by, content_row.assigned_to);
  if recipient is null or not exists (
    select 1 from public.organization_members m
    join public.brands b on b.organization_id = m.organization_id
    where b.id = content_row.brand_id and m.user_id = recipient
  ) then
    select m.user_id into recipient
    from public.organization_members m
    join public.brands b on b.organization_id = m.organization_id
    where b.id = content_row.brand_id and m.role in ('owner', 'admin')
    order by case when m.role = 'owner' then 0 else 1 end, m.created_at
    limit 1;
  end if;
  if recipient is null then return new; end if;
  if exists (select 1 from public.notification_preferences p where p.user_id = recipient and p.publish_alerts = false) then return new; end if;
  insert into public.notifications (brand_id, user_id, category, type, title, message, link, action_label, metadata)
  values (content_row.brand_id, recipient, 'publishing',
    case when new.status = 'PUBLISHED' then 'published_success' else 'publish_failed' end,
    case when new.status = 'PUBLISHED' then 'Gönderi yayınlandı' else 'Yayınlama başarısız' end,
    left(new.platform || ': ' || content_row.title, 180), '/dashboard/posts', 'Gönderiyi gör',
    jsonb_build_object('content_id', new.content_id, 'content_platform_id', new.id));
  return new;
end;
$$;
revoke all on function private.notify_publish_result() from public;
drop trigger if exists publish_result_notification on public.content_platforms;
create trigger publish_result_notification after update of status on public.content_platforms
for each row execute function private.notify_publish_result();
