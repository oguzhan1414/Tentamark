-- Social Inbox: stores inbound comments/DMs received via Meta's real-time
-- event webhooks (Instagram + Facebook Page), plus outbound replies sent
-- from the app. Distinct from the signed_request-based deauthorize/
-- data-deletion callbacks in api/connections/*/deauthorize — those verify a
-- form-field payload; this table is fed by api/webhooks/meta, which verifies
-- the X-Hub-Signature-256 header scheme instead (see
-- src/lib/social/webhookSignature.ts).

create table if not exists public.social_messages (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  social_account_id uuid references public.social_accounts on delete set null,
  platform text not null, -- 'instagram' | 'facebook'
  kind text not null, -- 'comment' | 'dm'
  direction text not null default 'inbound', -- 'inbound' | 'outbound'
  external_id text not null, -- comment_id, or message mid for DMs
  external_thread_id text, -- post/media id (comment) or the other party's PSID/IGSID (dm)
  author_name text,
  author_external_id text,
  body text,
  status text not null default 'open', -- 'open' | 'done'
  external_created_at timestamptz,
  created_at timestamptz default now() not null,
  unique(platform, external_id)
);

create index if not exists idx_social_messages_brand on public.social_messages(brand_id, created_at desc);
create index if not exists idx_social_messages_thread on public.social_messages(brand_id, external_thread_id);

alter table public.social_messages enable row level security;

create policy "Social messages select" on public.social_messages
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Social messages insert" on public.social_messages
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Social messages update" on public.social_messages
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
