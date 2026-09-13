-- Dış paylaşım linki — a token-based, no-login-required approval page for
-- a single piece of content. Fixes a real dishonest button too: Approval
-- detail's "Paylaşmak" button previously just copied the dashboard URL
-- (window.location.href), which is useless to anyone without an account —
-- it now creates/reuses one of these links instead.

create table if not exists public.content_share_links (
  id uuid default gen_random_uuid() primary key,
  content_id uuid references public.content on delete cascade not null,
  token text unique not null default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'active', -- 'active' | 'revoked'
  created_at timestamptz default now() not null
);

create index if not exists idx_content_share_links_content on public.content_share_links(content_id);

alter table public.content_share_links enable row level security;

create policy "Content share links select" on public.content_share_links
  for select to authenticated using (
    exists (
      select 1 from public.content c join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

create policy "Content share links insert" on public.content_share_links
  for insert to authenticated with check (
    exists (
      select 1 from public.content c join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

create policy "Content share links update" on public.content_share_links
  for update to authenticated using (
    exists (
      select 1 from public.content c join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

-- content_comments needs to distinguish "a real teammate wrote this" from
-- "an external viewer left this via a share link" — author_id is already
-- nullable for the latter case, but without this flag the UI would have to
-- guess (or wrongly show a null-author comment as if it came from "Ekip
-- Üyesi").
alter table public.content_comments add column if not exists is_external boolean not null default false;

-- Public (in `public`, like resolve_invite/accept_invite — see
-- 0026_organization_invites.sql for why these two live outside `private`):
-- the external viewer has no session, so this can't rely on the
-- content/content_share_links RLS policies above at all.
create or replace function public.resolve_share_link(p_token text)
returns table (
  link_status text,
  brand_name text,
  platform text,
  caption text,
  media_url text,
  media_type text,
  content_status text
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    l.status,
    b.name,
    cp.platform,
    coalesce(cp.caption, c.core_idea),
    m.file_url,
    m.file_type,
    c.status
  from public.content_share_links l
  join public.content c on c.id = l.content_id
  join public.brands b on b.id = c.brand_id
  left join lateral (
    select platform, caption from public.content_platforms where content_id = c.id order by created_at asc limit 1
  ) cp on true
  left join lateral (
    select media_id from public.content_media where content_id = c.id order by position asc limit 1
  ) cm on true
  left join public.media m on m.id = cm.media_id
  where l.token = p_token
  limit 1;
$$;

grant execute on function public.resolve_share_link(text) to authenticated, anon;

-- action: 'approve' | 'feedback'. Feedback always just records a comment
-- (mirrors the in-app "add comment" flow, which doesn't force a status
-- change either) — approve sets content.status = 'APPROVED' directly, same
-- as the in-app toggle.
create or replace function public.respond_to_share_link(p_token text, p_action text, p_note text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_content_id uuid;
  v_status text;
begin
  select l.content_id, l.status into v_content_id, v_status
  from public.content_share_links l
  where l.token = p_token;

  if v_content_id is null then
    raise exception 'Bağlantı bulunamadı.';
  end if;
  if v_status <> 'active' then
    raise exception 'Bu bağlantı artık geçerli değil.';
  end if;

  if p_action = 'approve' then
    update public.content set status = 'APPROVED' where id = v_content_id;
  elsif p_action = 'feedback' then
    if p_note is null or trim(p_note) = '' then
      raise exception 'Geri bildirim boş olamaz.';
    end if;
    insert into public.content_comments (content_id, author_id, body, is_external)
    values (v_content_id, null, p_note, true);
  else
    raise exception 'Geçersiz işlem.';
  end if;
end;
$$;

grant execute on function public.respond_to_share_link(text, text, text) to authenticated, anon;
