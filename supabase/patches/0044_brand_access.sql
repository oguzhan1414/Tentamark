-- Run once after 0043. Organization owns billing; each brand grants access.
-- Existing organization-only invitations have no recorded brand target.
-- They receive no brand grant; owners must re-invite those teammates.
create table if not exists public.brand_memberships (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique (brand_id, user_id)
);
create index if not exists idx_brand_memberships_user on public.brand_memberships(user_id, brand_id);
alter table public.brand_memberships enable row level security;
grant select, insert, update, delete on public.brand_memberships to authenticated;

-- No backfill: active_brand_id is a UI preference and does not prove that a
-- legacy invite was intended for that brand.
update public.organization_members set role = 'member' where role = 'admin';

create or replace function private.user_can_access_brand(p_user_id uuid, p_brand_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.brands b
    join public.organization_members m on m.organization_id = b.organization_id and m.user_id = p_user_id
    where b.id = p_brand_id and (m.role = 'owner' or exists (
      select 1 from public.brand_memberships bm where bm.brand_id = b.id and bm.user_id = p_user_id
    ))
  );
$$;
revoke all on function private.user_can_access_brand(uuid, uuid) from public;
grant execute on function private.user_can_access_brand(uuid, uuid) to authenticated;

create or replace function private.can_access_brand(p_brand_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and private.user_can_access_brand((select auth.uid()), p_brand_id);
$$;
revoke all on function private.can_access_brand(uuid) from public;
grant execute on function private.can_access_brand(uuid) to authenticated;

create or replace function private.user_can_review_brand(p_user_id uuid, p_brand_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.brands b
    join public.organization_members m on m.organization_id = b.organization_id and m.user_id = p_user_id
    where b.id = p_brand_id and (m.role = 'owner' or exists (
      select 1 from public.brand_memberships bm where bm.brand_id = b.id and bm.user_id = m.user_id and bm.role = 'admin'
    ))
  );
$$;
revoke all on function private.user_can_review_brand(uuid, uuid) from public;
grant execute on function private.user_can_review_brand(uuid, uuid) to authenticated;

create or replace function private.can_review_brand(p_brand_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.user_can_review_brand((select auth.uid()), p_brand_id);
$$;
revoke all on function private.can_review_brand(uuid) from public;
grant execute on function private.can_review_brand(uuid) to authenticated;

create or replace function private.shares_brand_with(p_other_user_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.brands b
    where private.user_can_access_brand((select auth.uid()), b.id)
      and private.user_can_access_brand(p_other_user_id, b.id)
  );
$$;
revoke all on function private.shares_brand_with(uuid) from public;
grant execute on function private.shares_brand_with(uuid) to authenticated;

create policy "Brand memberships select" on public.brand_memberships for select to authenticated
using (private.can_access_brand(brand_id));
create policy "Brand memberships insert" on public.brand_memberships for insert to authenticated
with check (exists (select 1 from public.brands b where b.id = brand_id and private.is_org_owner(b.organization_id)));
create policy "Brand memberships update" on public.brand_memberships for update to authenticated
using (exists (select 1 from public.brands b where b.id = brand_id and private.is_org_owner(b.organization_id)))
with check (exists (select 1 from public.brands b where b.id = brand_id and private.is_org_owner(b.organization_id)));
create policy "Brand memberships delete" on public.brand_memberships for delete to authenticated
using (exists (select 1 from public.brands b where b.id = brand_id and private.is_org_owner(b.organization_id)));

-- Revoke organization-wide visibility of brand data. Rewrite the existing
-- named RLS policies in place, including policies added by earlier patches.
-- Fail closed if a future policy shape still contains the old predicate.
do $$
declare p record; new_qual text; new_check text; statement text;
begin
  for p in select schemaname, tablename, policyname, cmd, qual, with_check
           from pg_policies where schemaname = 'public'
             and (qual like '%private.is_org_member(b.organization_id)%'
               or with_check like '%private.is_org_member(b.organization_id)%'
               or qual like '%private.is_org_reviewer(b.organization_id)%'
               or with_check like '%private.is_org_reviewer(b.organization_id)%')
  loop
    new_qual := replace(replace(p.qual, 'private.is_org_member(b.organization_id)', 'private.can_access_brand(b.id)'),
      'private.is_org_reviewer(b.organization_id)', 'private.can_review_brand(b.id)');
    new_check := replace(replace(p.with_check, 'private.is_org_member(b.organization_id)', 'private.can_access_brand(b.id)'),
      'private.is_org_reviewer(b.organization_id)', 'private.can_review_brand(b.id)');
    statement := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if new_qual is not null then statement := statement || ' using (' || new_qual || ')'; end if;
    if new_check is not null then statement := statement || ' with check (' || new_check || ')'; end if;
    execute statement;
  end loop;
  if exists (select 1 from pg_policies where schemaname = 'public' and
    (qual like '%private.is_org_member(b.organization_id)%' or with_check like '%private.is_org_member(b.organization_id)%'
     or qual like '%private.is_org_reviewer(b.organization_id)%' or with_check like '%private.is_org_reviewer(b.organization_id)%')) then
    raise exception 'An organization-wide brand policy remains';
  end if;
end;
$$;

drop policy if exists "Org members can view brands" on public.brands;
drop policy if exists "Org members can update brands" on public.brands;
create policy "Brand access select" on public.brands for select to authenticated using (private.can_access_brand(id));
create policy "Brand access update" on public.brands for update to authenticated
using (private.can_access_brand(id)) with check (private.can_access_brand(id));

-- Catch a differently formatted legacy policy instead of silently leaving a
-- sibling brand exposed if pg_policies rendered the predicate unexpectedly.
do $$
begin
  if exists (
    select 1 from pg_policies p where p.schemaname = 'public'
      and (p.tablename in (
        select c.table_name from information_schema.columns c
        where c.table_schema = 'public' and c.column_name = 'brand_id'
      ) or p.tablename in ('content_platforms', 'content_media', 'content_comments',
        'content_share_links', 'publish_attempts'))
      and (p.qual like '%is_org_member%' or p.with_check like '%is_org_member%'
        or p.qual like '%is_org_reviewer%' or p.with_check like '%is_org_reviewer%')
  ) then raise exception 'A brand-scoped policy still grants organization-wide access'; end if;
end;
$$;

drop policy if exists "Members can view membership" on public.organization_members;
create policy "Members can view shared team" on public.organization_members for select to authenticated
using (user_id = (select auth.uid()) or private.is_org_owner(organization_id) or private.shares_brand_with(user_id));
drop policy if exists "Team members can view teammate profiles" on public.profiles;
create policy "Brand members can view teammate profiles" on public.profiles for select to authenticated
using (private.shares_brand_with(id));
drop policy if exists "Audit logs select" on public.audit_logs;
create policy "Audit logs select" on public.audit_logs for select to authenticated
using (private.is_org_owner(organization_id));

-- Storage API checks this helper; object listing/writes now honor brand grants.
create or replace function private.is_own_brand(p_brand_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.can_access_brand(p_brand_id);
$$;

-- Membership grants must be for users in that brand's organization.
create or replace function private.guard_brand_membership() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.brands b join public.organization_members m
    on m.organization_id = b.organization_id where b.id = new.brand_id and m.user_id = new.user_id) then
    raise exception 'User is not a member of this organization';
  end if;
  return new;
end;
$$;
revoke all on function private.guard_brand_membership() from public;
create trigger guard_brand_membership before insert or update on public.brand_memberships
for each row execute function private.guard_brand_membership();

-- The org row exists for billing and invitation bookkeeping. Remove an
-- invitee from it when the last brand grant is removed.
create or replace function private.remove_unassigned_org_member() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.organization_members m using public.brands b
  where b.id = old.brand_id and m.organization_id = b.organization_id and m.user_id = old.user_id
    and m.role <> 'owner' and not exists (
      select 1 from public.brand_memberships bm join public.brands sibling on sibling.id = bm.brand_id
      where bm.user_id = old.user_id and sibling.organization_id = b.organization_id
    );
  return old;
end;
$$;
revoke all on function private.remove_unassigned_org_member() from public;
create trigger remove_unassigned_org_member after delete on public.brand_memberships
for each row execute function private.remove_unassigned_org_member();

alter table public.organization_invites add column if not exists brand_id uuid references public.brands(id) on delete cascade;
update public.organization_invites set status = 'revoked' where brand_id is null and status = 'pending';
drop policy if exists "Org invites insert" on public.organization_invites;
drop policy if exists "Org invites update" on public.organization_invites;
create policy "Org invites insert" on public.organization_invites for insert to authenticated with check (
  private.is_org_owner(organization_id) and exists (
    select 1 from public.brands b where b.id = brand_id and b.organization_id = organization_id));
create policy "Org invites update" on public.organization_invites for update to authenticated
using (private.is_org_owner(organization_id)) with check (
  private.is_org_owner(organization_id) and (brand_id is null or exists (
    select 1 from public.brands b where b.id = brand_id and b.organization_id = organization_id)));

create or replace function public.resolve_invite(p_token text)
returns table (organization_name text, brand_name text, role text, email text, status text, expires_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select o.name, b.name, i.role, i.email, i.status, i.expires_at
  from public.organization_invites i
  join public.organizations o on o.id = i.organization_id
  join public.brands b on b.id = i.brand_id and b.organization_id = o.id
  where i.token = p_token limit 1;
$$;
revoke all on function public.resolve_invite(text) from public;
grant execute on function public.resolve_invite(text) to authenticated, anon;

-- accept_invite from 0026 creates the org membership. Its final invite status
-- change calls this trigger, which installs the brand grant and active brand.
create or replace function private.activate_accepted_invite() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status <> 'accepted' or old.status = 'accepted' or new.brand_id is null or (select auth.uid()) is null then return new; end if;
  if not exists (select 1 from auth.users u where u.id = (select auth.uid()) and lower(u.email) = lower(new.email)) then
    raise exception 'Invite email does not match the current user';
  end if;
  if not exists (select 1 from public.organization_members m where m.organization_id = new.organization_id and m.user_id = (select auth.uid())) then
    raise exception 'Organization membership is missing';
  end if;
  if not exists (select 1 from public.brands b where b.id = new.brand_id and b.organization_id = new.organization_id) then
    raise exception 'Invite brand does not belong to the organization';
  end if;
  update public.organization_members set role = 'member'
  where organization_id = new.organization_id and user_id = (select auth.uid()) and role <> 'owner';
  insert into public.brand_memberships (brand_id, user_id, role)
  values (new.brand_id, (select auth.uid()), new.role)
  on conflict (brand_id, user_id) do update set role = excluded.role;
  update public.profiles set active_brand_id = new.brand_id, onboarding_completed = true where id = (select auth.uid());
  return new;
end;
$$;

-- Keep owners from being downgraded by accept_invite's existing upsert.
create or replace function private.preserve_org_owner() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.role = 'owner' then new.role := 'owner'; end if;
  return new;
end;
$$;
revoke all on function private.preserve_org_owner() from public;
create trigger preserve_org_owner before update of role on public.organization_members
for each row execute function private.preserve_org_owner();

-- Brand-specific assignments, reviews and feedback cannot target another
-- brand's teammate merely because that person belongs to the same org.
create or replace function private.guard_content_team_fields() returns trigger
language plpgsql security definer set search_path = '' as $$
declare brand_org_id uuid;
begin
  select b.organization_id into brand_org_id from public.brands b where b.id = new.brand_id;
  if brand_org_id is null then raise exception 'Brand not found'; end if;
  if new.assigned_to is not null and not private.user_can_review_brand(new.assigned_to, new.brand_id) then
    raise exception 'Review assignee must be a brand owner or admin';
  end if;
  if new.draft_assignee_id is not null and not private.user_can_access_brand(new.draft_assignee_id, new.brand_id) then
    raise exception 'Draft assignee must have access to this brand';
  end if;
  if (select auth.uid()) is not null and not private.can_review_brand(new.brand_id) then
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

create or replace function private.guard_member_platform_status() returns trigger
language plpgsql security definer set search_path = '' as $$
declare content_brand_id uuid;
begin
  select c.brand_id into content_brand_id from public.content c where c.id = new.content_id;
  if (select auth.uid()) is not null and not private.can_review_brand(content_brand_id) then
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

-- Review/publish triggers from 0042 check brand access for the recipient.
create or replace function private.notify_content_review() returns trigger
language plpgsql security definer set search_path = '' as $$
declare recipient uuid;
begin
  if new.status <> 'NEEDS_REVIEW' then return new; end if;
  if tg_op = 'UPDATE' and old.status = new.status and old.assigned_to is not distinct from new.assigned_to then return new; end if;
  if new.assigned_to is not null and private.user_can_review_brand(new.assigned_to, new.brand_id) then
    recipient := new.assigned_to;
  else
    select m.user_id into recipient from public.organization_members m
    join public.brands b on b.organization_id = m.organization_id
    where b.id = new.brand_id and m.role = 'owner' order by m.created_at limit 1;
  end if;
  if recipient is not null then
    insert into public.notifications (brand_id, user_id, category, type, title, message, link, action_label, metadata)
    values (new.brand_id, recipient, 'approvals', 'pending_approval', 'İçerik onayınızı bekliyor',
      left(new.title, 160), '/dashboard/posts?post=' || new.id::text, 'İncele', jsonb_build_object('content_id', new.id));
  end if;
  return new;
end;
$$;

create or replace function private.notify_publish_result() returns trigger
language plpgsql security definer set search_path = '' as $$
declare content_row public.content%rowtype; recipient uuid;
begin
  if new.status not in ('PUBLISHED', 'NEEDS_USER_ACTION') or old.status is not distinct from new.status then return new; end if;
  select * into content_row from public.content where id = new.content_id;
  recipient := coalesce(content_row.created_by, content_row.assigned_to);
  if recipient is null or not private.user_can_access_brand(recipient, content_row.brand_id) then
    select m.user_id into recipient from public.organization_members m
    join public.brands b on b.organization_id = m.organization_id
    where b.id = content_row.brand_id and m.role = 'owner' order by m.created_at limit 1;
  end if;
  if recipient is null then return new; end if;
  if exists (select 1 from public.notification_preferences p where p.user_id = recipient and p.publish_alerts = false) then return new; end if;
  insert into public.notifications (brand_id, user_id, category, type, title, message, link, action_label, metadata)
  values (content_row.brand_id, recipient, 'publishing',
    case when new.status = 'PUBLISHED' then 'published_success' else 'publish_failed' end,
    case when new.status = 'PUBLISHED' then 'Gönderi yayınlandı' else 'Yayınlama başarısız' end,
    left(new.platform || ': ' || content_row.title, 180), '/dashboard/posts?post=' || new.content_id::text,
    'Gönderiyi gör', jsonb_build_object('content_id', new.content_id, 'content_platform_id', new.id));
  return new;
end;
$$;

create or replace function private.notify_content_comment() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (brand_id, user_id, category, type, title, message, link, action_label, metadata)
  select distinct c.brand_id, m.user_id, 'approvals', 'content_feedback', 'Yeni geri bildirim',
    left(c.title, 160), '/dashboard/posts?post=' || c.id::text, 'Yorumu gör', jsonb_build_object('content_id', c.id, 'comment_id', new.id)
  from public.content c
  join public.organization_members m on private.user_can_access_brand(m.user_id, c.brand_id)
  where c.id = new.content_id and m.user_id in (c.created_by, c.draft_assignee_id, c.assigned_to)
    and m.user_id is distinct from new.author_id;
  return new;
end;
$$;
