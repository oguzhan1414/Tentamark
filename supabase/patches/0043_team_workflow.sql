-- Apply once after 0042. Keep draft production and review as separate assignments.
alter table public.content add column if not exists draft_assignee_id uuid references public.profiles(id) on delete set null;
create index if not exists idx_content_draft_assignee on public.content(draft_assignee_id) where draft_assignee_id is not null;

create or replace function private.is_org_reviewer(org_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.organization_members m
    where m.organization_id = org_id and m.user_id = (select auth.uid())
      and m.role in ('owner', 'admin'));
$$;
revoke all on function private.is_org_reviewer(uuid) from public;
grant execute on function private.is_org_reviewer(uuid) to authenticated;

create or replace function private.shares_org_with(other_user_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.organization_members mine
    join public.organization_members theirs on theirs.organization_id = mine.organization_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = other_user_id);
$$;
revoke all on function private.shares_org_with(uuid) from public;
grant execute on function private.shares_org_with(uuid) to authenticated;
create policy "Team members can view teammate profiles" on public.profiles
  for select to authenticated using (private.shares_org_with(id));

-- accept_invite already validates token, email and membership. This trigger
-- selects the invited workspace without changing the member's previous data.
create or replace function private.activate_accepted_invite() returns trigger
language plpgsql security definer set search_path = '' as $$
declare target_brand uuid;
begin
  if new.status <> 'accepted' or old.status = 'accepted' or (select auth.uid()) is null then return new; end if;
  if not exists (select 1 from auth.users u where u.id = (select auth.uid()) and lower(u.email) = lower(new.email)) then return new; end if;
  if not exists (select 1 from public.organization_members m where m.organization_id = new.organization_id and m.user_id = (select auth.uid())) then return new; end if;
  select b.id into target_brand from public.brands b where b.organization_id = new.organization_id order by b.created_at, b.id limit 1;
  if target_brand is not null then
    update public.profiles set active_brand_id = target_brand, onboarding_completed = true where id = (select auth.uid());
  end if;
  return new;
end;
$$;
revoke all on function private.activate_accepted_invite() from public;
drop trigger if exists activate_accepted_invite on public.organization_invites;
create trigger activate_accepted_invite after update of status on public.organization_invites
for each row execute function private.activate_accepted_invite();

-- Owners/admins review and manage all content. Members work on drafts they
-- created or were asked to prepare, then submit them for review.
drop policy if exists "Content insert" on public.content;
drop policy if exists "Content update" on public.content;
drop policy if exists "Content delete" on public.content;
create policy "Content insert" on public.content for insert to authenticated with check (
  exists (select 1 from public.brands b where b.id = brand_id
    and private.is_org_member(b.organization_id)
    and (private.is_org_reviewer(b.organization_id)
      or (created_by = (select auth.uid()) and status in ('DRAFT', 'NEEDS_REVIEW'))))
);
create policy "Content update" on public.content for update to authenticated using (
  exists (select 1 from public.brands b where b.id = brand_id
    and (private.is_org_reviewer(b.organization_id)
      or (private.is_org_member(b.organization_id) and status in ('DRAFT', 'NEEDS_REVIEW')
        and (created_by = (select auth.uid()) or draft_assignee_id = (select auth.uid())))))
) with check (
  exists (select 1 from public.brands b where b.id = brand_id
    and (private.is_org_reviewer(b.organization_id)
      or (private.is_org_member(b.organization_id) and status in ('DRAFT', 'NEEDS_REVIEW')
        and (created_by = (select auth.uid()) or draft_assignee_id = (select auth.uid())))))
);
create policy "Content delete" on public.content for delete to authenticated using (
  exists (select 1 from public.brands b where b.id = brand_id and private.is_org_reviewer(b.organization_id))
);

create or replace function private.guard_content_team_fields() returns trigger
language plpgsql security definer set search_path = '' as $$
declare org_id uuid;
begin
  select b.organization_id into org_id from public.brands b where b.id = new.brand_id;
  if org_id is null then raise exception 'Brand not found'; end if;
  if new.assigned_to is not null and not exists (select 1 from public.organization_members m where m.organization_id = org_id and m.user_id = new.assigned_to) then
    raise exception 'Review assignee must be in the brand organization';
  end if;
  if new.draft_assignee_id is not null and not exists (select 1 from public.organization_members m where m.organization_id = org_id and m.user_id = new.draft_assignee_id) then
    raise exception 'Draft assignee must be in the brand organization';
  end if;
  if (select auth.uid()) is not null and not private.is_org_reviewer(org_id) then
    if tg_op = 'INSERT' then
      if new.created_by is distinct from (select auth.uid()) or new.assigned_to is not null or new.draft_assignee_id is not null then
        raise exception 'Members cannot assign work or another author';
      end if;
    elsif new.brand_id is distinct from old.brand_id or new.created_by is distinct from old.created_by
       or new.assigned_to is distinct from old.assigned_to or new.draft_assignee_id is distinct from old.draft_assignee_id then
      raise exception 'Members cannot change ownership or assignments';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.guard_content_team_fields() from public;
drop trigger if exists guard_content_team_fields on public.content;
create trigger guard_content_team_fields before insert or update on public.content
for each row execute function private.guard_content_team_fields();

drop policy if exists "Content platforms insert" on public.content_platforms;
drop policy if exists "Content platforms update" on public.content_platforms;
create policy "Content platforms insert" on public.content_platforms for insert to authenticated with check (
  exists (select 1 from public.content c join public.brands b on b.id = c.brand_id where c.id = content_id
    and (private.is_org_reviewer(b.organization_id)
      or (private.is_org_member(b.organization_id) and c.status in ('DRAFT', 'NEEDS_REVIEW')
        and (c.created_by = (select auth.uid()) or c.draft_assignee_id = (select auth.uid())))))
);
create policy "Content platforms update" on public.content_platforms for update to authenticated using (
  exists (select 1 from public.content c join public.brands b on b.id = c.brand_id where c.id = content_id
    and (private.is_org_reviewer(b.organization_id)
      or (private.is_org_member(b.organization_id) and c.status in ('DRAFT', 'NEEDS_REVIEW')
        and (c.created_by = (select auth.uid()) or c.draft_assignee_id = (select auth.uid())))))
) with check (
  exists (select 1 from public.content c join public.brands b on b.id = c.brand_id where c.id = content_id
    and (private.is_org_reviewer(b.organization_id)
      or (private.is_org_member(b.organization_id) and c.status in ('DRAFT', 'NEEDS_REVIEW')
        and (c.created_by = (select auth.uid()) or c.draft_assignee_id = (select auth.uid())))))
);
create or replace function private.guard_member_platform_status() returns trigger
language plpgsql security definer set search_path = '' as $$
declare org_id uuid;
begin
  select b.organization_id into org_id from public.content c join public.brands b on b.id = c.brand_id where c.id = new.content_id;
  if (select auth.uid()) is not null and not private.is_org_reviewer(org_id) then
    if tg_op = 'INSERT' then
      if new.status not in ('PENDING', 'DRAFT', 'NEEDS_REVIEW') then raise exception 'Members cannot publish content'; end if;
    elsif new.status is distinct from old.status or new.content_id is distinct from old.content_id
       or new.platform_post_id is distinct from old.platform_post_id or new.published_at is distinct from old.published_at
       or new.attempt_count is distinct from old.attempt_count or new.next_retry_at is distinct from old.next_retry_at
       or new.last_error is distinct from old.last_error or new.failure_code is distinct from old.failure_code then
      raise exception 'Members cannot change publication state';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.guard_member_platform_status() from public;
drop trigger if exists guard_member_platform_status on public.content_platforms;
create trigger guard_member_platform_status before insert or update on public.content_platforms
for each row execute function private.guard_member_platform_status();

-- A saved draft can carry a legacy DRAFT platform status. Approval puts its
-- variants into the scheduler's PENDING state in the same transaction.
create or replace function private.require_approval_schedule() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'APPROVED' and old.status is distinct from new.status and exists (
    select 1 from public.content_platforms p where p.content_id = new.id and p.scheduled_at is null
  ) then
    raise exception 'Set a schedule for every platform before approval';
  end if;
  return new;
end;
$$;
revoke all on function private.require_approval_schedule() from public;
drop trigger if exists require_approval_schedule on public.content;
create trigger require_approval_schedule before update of status on public.content
for each row execute function private.require_approval_schedule();

create or replace function private.queue_approved_variants() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'APPROVED' and old.status is distinct from new.status then
    update public.content_platforms set status = 'PENDING'
    where content_id = new.id and status in ('DRAFT', 'NEEDS_REVIEW');
  end if;
  return new;
end;
$$;
revoke all on function private.queue_approved_variants() from public;
drop trigger if exists queue_approved_variants on public.content;
create trigger queue_approved_variants after update of status on public.content
for each row execute function private.queue_approved_variants();

drop policy if exists "Content media insert" on public.content_media;
drop policy if exists "Content media delete" on public.content_media;
create policy "Content media insert" on public.content_media for insert to authenticated with check (
  exists (select 1 from public.content c join public.brands b on b.id = c.brand_id where c.id = content_id
    and (private.is_org_reviewer(b.organization_id)
      or (private.is_org_member(b.organization_id) and c.status in ('DRAFT', 'NEEDS_REVIEW')
        and (c.created_by = (select auth.uid()) or c.draft_assignee_id = (select auth.uid())))))
);
create policy "Content media delete" on public.content_media for delete to authenticated using (
  exists (select 1 from public.content c join public.brands b on b.id = c.brand_id where c.id = content_id
    and (private.is_org_reviewer(b.organization_id)
      or (private.is_org_member(b.organization_id) and c.status in ('DRAFT', 'NEEDS_REVIEW')
        and (c.created_by = (select auth.uid()) or c.draft_assignee_id = (select auth.uid())))))
);

drop policy if exists "Content comments insert" on public.content_comments;
create policy "Content comments insert" on public.content_comments for insert to authenticated with check (
  author_id = (select auth.uid()) and exists (
    select 1 from public.content c join public.brands b on b.id = c.brand_id
    where c.id = content_id and private.is_org_member(b.organization_id))
);

create or replace function private.notify_content_comment() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (brand_id, user_id, category, type, title, message, link, action_label, metadata)
  select distinct c.brand_id, m.user_id, 'approvals', 'content_feedback', 'Yeni geri bildirim',
    left(c.title, 160), '/dashboard/posts?post=' || c.id::text, 'Yorumu gör', jsonb_build_object('content_id', c.id, 'comment_id', new.id)
  from public.content c
  join public.brands b on b.id = c.brand_id
  join public.organization_members m on m.organization_id = b.organization_id
  where c.id = new.content_id and m.user_id in (c.created_by, c.draft_assignee_id, c.assigned_to)
    and m.user_id is distinct from new.author_id;
  return new;
end;
$$;
revoke all on function private.notify_content_comment() from public;
drop trigger if exists content_comment_notification on public.content_comments;
create trigger content_comment_notification after insert on public.content_comments
for each row execute function private.notify_content_comment();

create or replace function private.notify_draft_assignment() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status <> 'DRAFT' or new.draft_assignee_id is null then return new; end if;
  if tg_op = 'UPDATE' then
    if old.draft_assignee_id is not distinct from new.draft_assignee_id then return new; end if;
  end if;
  insert into public.notifications (brand_id, user_id, category, type, title, message, link, action_label, metadata)
  values (new.brand_id, new.draft_assignee_id, 'approvals', 'draft_assigned', 'Taslak görevi atandı',
    left(new.title, 160), '/dashboard/posts?post=' || new.id::text, 'Taslağı aç', jsonb_build_object('content_id', new.id));
  return new;
end;
$$;
revoke all on function private.notify_draft_assignment() from public;
drop trigger if exists draft_assignment_notification on public.content;
create trigger draft_assignment_notification after insert or update of draft_assignee_id on public.content
for each row execute function private.notify_draft_assignment();
