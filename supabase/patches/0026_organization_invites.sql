-- Ekip / rol yönetimi (team invites): lets an org owner invite a new
-- teammate by email, assign them a role (admin/member), and share a
-- link-based invite (no email-sending infra required — the owner shares the
-- link however they like, same reasoning as this project never having built
-- transactional email yet). Scoped to "invite links are for brand-new
-- teammates" — accept_invite only auto-cleans the invitee's own
-- just-created, still-empty organization (see its guard conditions below);
-- it never touches an org that already has real content or connected
-- accounts, to avoid any chance of destroying an existing user's real data.

create table if not exists public.organization_invites (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  email text not null,
  role text not null default 'member', -- 'admin' | 'member' — never 'owner' via invite
  token text unique not null default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  invited_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending', -- 'pending' | 'accepted' | 'revoked'
  created_at timestamptz default now() not null,
  expires_at timestamptz not null default (now() + interval '14 days')
);

create index if not exists idx_org_invites_org on public.organization_invites(organization_id);

alter table public.organization_invites enable row level security;

-- Mirrors private.is_org_member's shape/reasoning (schema.sql §9) — same
-- SECURITY DEFINER + search_path='' hardening, kept in the private schema so
-- it's usable inside RLS policies without being reachable as a public RPC.
create or replace function private.is_org_owner(org_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = org_id
      and user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

grant execute on function private.is_org_owner(uuid) to authenticated;

create policy "Org invites select" on public.organization_invites
  for select to authenticated using (private.is_org_owner(organization_id));

create policy "Org invites insert" on public.organization_invites
  for insert to authenticated with check (private.is_org_owner(organization_id));

create policy "Org invites update" on public.organization_invites
  for update to authenticated using (private.is_org_owner(organization_id)) with check (private.is_org_owner(organization_id));

create policy "Org invites delete" on public.organization_invites
  for delete to authenticated using (private.is_org_owner(organization_id));

-- Owners can now actually manage membership — organization_members only had
-- a select policy before this (schema.sql §9), so no client could change a
-- role or remove someone even though the `role` column always existed.
create policy "Org members update by owner" on public.organization_members
  for update to authenticated using (private.is_org_owner(organization_id)) with check (private.is_org_owner(organization_id));

create policy "Org members delete by owner" on public.organization_members
  for delete to authenticated using (private.is_org_owner(organization_id));

-- Unlike is_org_member/is_org_owner (kept in `private` specifically so they
-- can NEVER be called directly via PostgREST — see schema.sql §9), these two
-- functions live in `public` on purpose: the invite acceptance page has to
-- call them directly as RPCs (`supabase.rpc(...)`), including while signed
-- out for resolve_invite. Safe to expose because both are narrowly scoped —
-- resolve_invite only ever returns the one row matching an exact (unguessable)
-- token, and accept_invite only mutates state tied to that same token plus
-- the caller's own auth.uid().
--
-- Returns an invite's public-safe details for a given token — callable
-- while signed out (the invitee hasn't logged in yet), so it can't rely on
-- organization_invites' owner-only select policy. Security here is the
-- token itself (an unguessable 64-hex-char secret): SECURITY DEFINER lets
-- this bypass RLS internally, but it only ever returns the ONE row matching
-- the exact token passed in — no enumeration surface, unlike a broad
-- `for select using (true)` policy would be.
create or replace function public.resolve_invite(p_token text)
returns table (
  organization_name text,
  brand_name text,
  role text,
  email text,
  status text,
  expires_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select o.name, b.name, i.role, i.email, i.status, i.expires_at
  from public.organization_invites i
  join public.organizations o on o.id = i.organization_id
  left join public.brands b on b.organization_id = o.id
  where i.token = p_token
  limit 1;
$$;

grant execute on function public.resolve_invite(text) to authenticated, anon;

-- Accepts a pending invite for the currently signed-in user. Requires the
-- caller's own auth email to match the invite's email (the token is the
-- bearer credential, but email-matching avoids a confusing "accepted an
-- invite meant for someone else" mismatch). See the file header for the
-- org-cleanup safety conditions.
create or replace function public.accept_invite(p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invite record;
  v_uid uuid;
  v_email text;
  v_old_org uuid;
  v_old_membership_created_at timestamptz;
  v_old_org_has_content boolean;
  v_old_org_has_accounts boolean;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Bu daveti kabul etmek için önce giriş yapmalısınız.';
  end if;

  select * into v_invite from public.organization_invites where token = p_token for update;
  if not found then
    raise exception 'Davet bulunamadı.';
  end if;
  if v_invite.status <> 'pending' then
    raise exception 'Bu davet artık geçerli değil.';
  end if;
  if v_invite.expires_at < now() then
    raise exception 'Bu davetin süresi dolmuş.';
  end if;

  select email into v_email from auth.users where id = v_uid;
  if v_email is null or lower(v_email) <> lower(v_invite.email) then
    raise exception 'Bu davet farklı bir e-posta adresi için oluşturuldu.';
  end if;

  select organization_id, created_at into v_old_org, v_old_membership_created_at
    from public.organization_members
    where user_id = v_uid
    order by created_at asc
    limit 1;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_invite.organization_id, v_uid, v_invite.role)
  on conflict (organization_id, user_id) do update set role = excluded.role;

  -- Only delete the invitee's prior org if it was created within the last
  -- hour (i.e. this really was a fresh signup made just to accept this
  -- invite) AND it has no real content or connected accounts yet. Both
  -- conditions together make it effectively impossible to ever touch an
  -- established user's real workspace.
  if v_old_org is not null and v_old_org <> v_invite.organization_id
     and v_old_membership_created_at > now() - interval '1 hour' then
    select exists(
      select 1 from public.content c join public.brands b on b.id = c.brand_id where b.organization_id = v_old_org
    ) into v_old_org_has_content;
    select exists(
      select 1 from public.social_accounts sa join public.brands b on b.id = sa.brand_id where b.organization_id = v_old_org
    ) into v_old_org_has_accounts;

    if not v_old_org_has_content and not v_old_org_has_accounts then
      delete from public.organizations where id = v_old_org;
    end if;
  end if;

  update public.organization_invites set status = 'accepted' where id = v_invite.id;
end;
$$;

grant execute on function public.accept_invite(text) to authenticated;
