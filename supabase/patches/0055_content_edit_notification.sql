-- content_edit_history rows (0054) were silent — a reviewer had to open the
-- post and expand "Geçmişi gizle/göster" to ever learn a draft was touched.
-- Mirrors notify_content_review's recipient logic (0044): the content's own
-- reviewer if it has one and can actually review, else the brand's org
-- owner. Never notifies the person who made the edit.

create or replace function private.notify_content_edit() returns trigger
language plpgsql security definer set search_path = '' as $$
declare content_row public.content%rowtype; recipient uuid;
begin
  select c.* into content_row
  from public.content_platforms cp
  join public.content c on c.id = cp.content_id
  where cp.id = new.content_platform_id;

  if content_row.id is null then return new; end if;

  if content_row.assigned_to is not null and private.user_can_review_brand(content_row.assigned_to, content_row.brand_id) then
    recipient := content_row.assigned_to;
  else
    select m.user_id into recipient from public.organization_members m
    join public.brands b on b.organization_id = m.organization_id
    where b.id = content_row.brand_id and m.role = 'owner' order by m.created_at limit 1;
  end if;

  if recipient is null or recipient is not distinct from new.edited_by then return new; end if;

  insert into public.notifications (brand_id, user_id, category, type, title, message, link, action_label, metadata)
  values (content_row.brand_id, recipient, 'approvals', 'content_edited', 'İçerik düzenlendi',
    left(content_row.title, 160), '/dashboard/posts?post=' || content_row.id::text, 'İncele',
    jsonb_build_object('content_id', content_row.id, 'content_platform_id', new.content_platform_id));
  return new;
end;
$$;
revoke all on function private.notify_content_edit() from public;

drop trigger if exists content_edit_notification on public.content_edit_history;
create trigger content_edit_notification after insert on public.content_edit_history
for each row execute function private.notify_content_edit();
