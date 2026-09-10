-- ==============================================================================
-- TENTAMARK AI MARKETING MANAGER — INITIAL DATABASE SCHEMA
-- Based on docs/12-backend-logic.md (September 2026 Architecture Spec)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES & ORGANIZATIONS (Multi-tenant Foundation)
-- ==============================================================================

-- User Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Organizations (Billing & Workspace boundary)
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique,
  plan text default 'starter' not null, -- starter, pro, agency
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Organization Members (RBAC)
create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'owner' not null, -- owner, admin, member
  created_at timestamptz default now() not null,
  unique(organization_id, user_id)
);

-- Brands (Brand Boundary & Brand DNA Host)
create table if not exists public.brands (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  name text not null,
  slug text,
  logo_url text,
  website text,
  timezone text default 'Europe/Istanbul' not null, -- IANA timezone for scheduling
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Brand DNA (Structured identity: Sector, Target Audience, Tone, Color Palette, Forbidden Words)
create table if not exists public.brand_dna (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null unique,
  industry text,
  target_audience jsonb default '[]'::jsonb, -- e.g. ["B2B SaaS Founders", "Marketing Directors"]
  brand_traits jsonb default '[]'::jsonb,   -- e.g. ["Innovative", "Direct", "Confident", "Friendly"]
  tone_of_voice text default 'Profosyonel, net ve dinamik',
  color_palette jsonb default '[]'::jsonb,  -- Primary, secondary, accents
  forbidden_words jsonb default '[]'::jsonb, -- Competitors, clichés, negative keywords
  competitors jsonb default '[]'::jsonb,
  raw_notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Brand Strategy (AI generated positioning & content strategy, versioned JSONB)
create table if not exists public.brand_strategy (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  version integer default 1 not null,
  payload jsonb not null, -- Positioning pillars, weekly themes, content pillars
  source_ai_run_id uuid,  -- Reference to ai_runs table
  generated_at timestamptz default now() not null,
  unique(brand_id, version)
);

-- ==============================================================================
-- 2. SOCIAL ACCOUNTS & CONNECTIONS
-- ==============================================================================

create table if not exists public.social_accounts (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  platform text not null, -- 'instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'
  external_account_id text not null,
  username text,
  display_name text,
  avatar_url text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes jsonb default '[]'::jsonb,
  status text default 'active' not null, -- 'active', 'disconnected', 'needs_reauth'
  last_health_check_at timestamptz,
  last_error text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(brand_id, platform, external_account_id)
);

-- ==============================================================================
-- 3. MEDIA ASSETS
-- ==============================================================================

create table if not exists public.media (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  file_name text not null,
  file_url text not null,
  file_type text not null, -- 'image/png', 'video/mp4', etc.
  file_size integer,       -- in bytes
  dimensions jsonb,        -- { width: 1080, height: 1080 }
  duration_seconds integer, -- for video
  alt_text text,
  created_at timestamptz default now() not null
);

-- ==============================================================================
-- 4. CAMPAIGNS (Lightweight grouping)
-- ==============================================================================

create table if not exists public.campaigns (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  name text not null,
  objective text,
  start_date date,
  end_date date,
  status text default 'active' not null, -- 'active', 'completed', 'archived'
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ==============================================================================
-- 5. CONTENT, VARIANTS & PUBLISHING ENGINE (The Hot Spot)
-- ==============================================================================

-- Master Content Record (Platform-agnostic idea/draft)
create table if not exists public.content (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  campaign_id uuid references public.campaigns on delete set null,
  title text not null,
  core_idea text not null,
  category text, -- 'educational', 'promotional', 'behind_the_scenes', 'product_update'
  status text default 'DRAFT' not null, -- IDEA, GENERATING, DRAFT, NEEDS_REVIEW, APPROVED, SCHEDULED, PUBLISHED, PARTIALLY_PUBLISHED, ANALYZED
  tags jsonb default '[]'::jsonb,
  -- AI-generated extras (hook, visual/video concept) from features like the
  -- weekly pack. Real structured storage — not text-encoded into core_idea.
  metadata jsonb,
  ai_generated boolean default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Content Media Pivot (Order/Positioning of assets)
create table if not exists public.content_media (
  id uuid default gen_random_uuid() primary key,
  content_id uuid references public.content on delete cascade not null,
  media_id uuid references public.media on delete cascade not null,
  position integer default 0 not null,
  created_at timestamptz default now() not null,
  unique(content_id, media_id)
);

-- Platform-specific Content Variants (Single idea -> Multi platform)
create table if not exists public.content_platforms (
  id uuid default gen_random_uuid() primary key,
  content_id uuid references public.content on delete cascade not null,
  social_account_id uuid references public.social_accounts on delete set null,
  platform text not null, -- 'instagram', 'facebook', 'linkedin', 'twitter'
  -- Snapshot of the connected account at publish time — social_account_id is
  -- ON DELETE SET NULL, so without these a disconnected account would erase
  -- "which account did this actually go to" from historical posts. Not
  -- populated yet: real values arrive once phase 5 wires account selection
  -- into content creation (docs/repo-research — TryPost's PostPlatform).
  platform_username text,
  platform_display_name text,
  caption text not null,
  hashtags jsonb default '[]'::jsonb,
  status text default 'PENDING' not null, -- PENDING, QUEUED, PUBLISHING, PUBLISHED, FAILED, NEEDS_USER_ACTION
  platform_post_id text, -- Remote ID returned by social platform API
  scheduled_at timestamptz, -- Scheduled publication time in UTC
  published_at timestamptz, -- Actual publication time in UTC
  attempt_count integer default 0 not null,
  next_retry_at timestamptz,
  last_error text,
  failure_code text, -- TOKEN_EXPIRED, RATE_LIMIT, MEDIA_INVALID, PLATFORM_ERROR, NETWORK_ERROR, UNKNOWN
  connection_warning_sent_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes on content_platforms for high-performance scheduling & lookup
create index if not exists idx_cp_platform_post_id on public.content_platforms(platform_post_id);
create index if not exists idx_cp_scheduled_status on public.content_platforms(status, scheduled_at);
create index if not exists idx_cp_content_id on public.content_platforms(content_id);

-- Publishing Attempts (Complete historical log of all publish requests)
create table if not exists public.publish_attempts (
  id uuid default gen_random_uuid() primary key,
  content_platform_id uuid references public.content_platforms on delete cascade not null,
  attempted_at timestamptz default now() not null,
  status text not null, -- 'SUCCESS', 'FAILED'
  failure_code text,
  error_detail text,
  http_status integer,
  response_body jsonb
);

-- ==============================================================================
-- 6. ANALYTICS SNAPSHOTS (Time-series performance learning loop)
-- ==============================================================================

create table if not exists public.analytics_snapshots (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  social_account_id uuid references public.social_accounts on delete set null,
  content_platform_id uuid references public.content_platforms on delete set null,
  captured_at timestamptz default now() not null,
  impressions integer default 0,
  reach integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  saves integer default 0,
  clicks integer default 0,
  views integer default 0,
  watch_time_seconds integer default 0,
  followers integer,
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_analytics_brand_captured on public.analytics_snapshots(brand_id, captured_at desc);

-- ==============================================================================
-- 7. AI ENGINE TELEMETRY & AUDIT LOGS
-- ==============================================================================

-- AI Runs (Traceability of all LLM prompts, costs, latencies and versions)
create table if not exists public.ai_runs (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  content_id uuid references public.content on delete set null,
  stage text not null, -- 'positioning', 'content_strategy', 'idea', 'platform_adapt', 'quality_pass'
  prompt_version text not null,
  model text not null,
  input_tokens integer default 0,
  output_tokens integer default 0,
  cost_estimate_usd numeric(8, 6) default 0,
  latency_ms integer default 0,
  status text default 'SUCCESS' not null,
  error text,
  created_at timestamptz default now() not null
);

-- Audit Logs (Tamper-evident history: who did what, when)
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null, -- e.g. CONTENT_APPROVED, SOCIAL_ACCOUNT_CONNECTED, BRAND_DNA_UPDATED
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

-- ==============================================================================
-- 8. AUTOMATIC ONBOARDING TRIGGER (auth.users -> profiles & initial workspace)
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  new_brand_id uuid;
  user_brand_name text;
  user_full_name text;
begin
  -- Extract metadata provided during signup
  user_brand_name := coalesce(new.raw_user_meta_data->>'brand_name', 'Markam');
  user_full_name  := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  -- 1. Create Profile
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, user_full_name);

  -- 2. Create Default Organization
  insert into public.organizations (name, plan)
  values (user_brand_name || ' Organizasyonu', 'starter')
  returning id into new_org_id;

  -- 3. Add User as Organization Owner
  insert into public.organization_members (organization_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  -- 4. Create Brand
  insert into public.brands (organization_id, name, timezone)
  values (new_org_id, user_brand_name, 'Europe/Istanbul')
  returning id into new_brand_id;

  -- 5. Create Initial Brand DNA
  insert into public.brand_dna (brand_id, industry, tone_of_voice)
  values (new_brand_id, 'Genel', 'Profosyonel, yenilikçi ve ilgi çekici');

  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RETURNS TRIGGER functions can only be invoked by the trigger mechanism
-- (Postgres rejects a direct call), so this grant was never practically
-- exploitable — but it's a free fix: revoking it doesn't affect the trigger,
-- which doesn't check EXECUTE on the invoking role to fire.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.brands enable row level security;
alter table public.brand_dna enable row level security;
alter table public.brand_strategy enable row level security;
alter table public.social_accounts enable row level security;
alter table public.media enable row level security;
alter table public.campaigns enable row level security;
alter table public.content enable row level security;
alter table public.content_media enable row level security;
alter table public.content_platforms enable row level security;
alter table public.publish_attempts enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.ai_runs enable row level security;
alter table public.audit_logs enable row level security;

-- Helper function: check if user is a member of an organization.
--
-- Lives in `private` (a schema PostgREST never exposes), not `public`. It has
-- to be SECURITY DEFINER to bypass RLS internally — it's used inside the
-- policy ON organization_members itself, and a policy that re-queries its
-- own table under its own policy is a self-referential RLS bug. But that
-- same SECURITY DEFINER grant, in an exposed schema, would make the function
-- directly callable via /rest/v1/rpc/is_org_member by any signed-in user.
-- Keeping it in `private` lets `authenticated` keep EXECUTE (required for
-- RLS to evaluate) without it ever being reachable as an RPC endpoint.
-- `search_path = ''` plus fully-qualified names closes the search-path-hijack
-- gap that a SECURITY DEFINER function is otherwise exposed to.
create schema if not exists private;

create or replace function private.is_org_member(org_id uuid)
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
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;

-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Users can update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Organizations: Members can view their organizations
create policy "Members can view their orgs" on public.organizations
  for select to authenticated using (private.is_org_member(id));

-- Organization Members: Members can view other members in the same org
create policy "Members can view membership" on public.organization_members
  for select to authenticated using (private.is_org_member(organization_id));

-- Brands: Members can view and manage brands in their orgs
create policy "Org members can view brands" on public.brands
  for select to authenticated using (private.is_org_member(organization_id));
create policy "Org members can update brands" on public.brands
  for update to authenticated using (private.is_org_member(organization_id)) with check (private.is_org_member(organization_id));

-- Brand DNA: Accessible through brand membership
create policy "Brand DNA select" on public.brand_dna
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
create policy "Brand DNA update" on public.brand_dna
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

-- Content: Accessible through brand membership
create policy "Content select" on public.content
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
create policy "Content insert" on public.content
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
create policy "Content update" on public.content
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
create policy "Content delete" on public.content
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

-- Content Platforms: Inherits content access
create policy "Content platforms select" on public.content_platforms
  for select to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );
create policy "Content platforms update" on public.content_platforms
  for update to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

create policy "Content platforms insert" on public.content_platforms
  for insert to authenticated with check (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

-- Audit Logs: Members can read org audit logs, only service_role can insert
create policy "Audit logs select" on public.audit_logs
  for select to authenticated using (private.is_org_member(organization_id));

-- AI Runs: insert-mostly, like publish_attempts. No update/delete — a wrong
-- run gets a corrected one logged after it, not rewritten.
create policy "AI runs select" on public.ai_runs
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "AI runs insert" on public.ai_runs
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

-- Social Accounts: full CRUD for org members. Unlike brands/content,
-- disconnecting an account is a normal action and non-destructive
-- (content_platforms.social_account_id is `on delete set null`).
create policy "Social accounts select" on public.social_accounts
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Social accounts insert" on public.social_accounts
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Social accounts update" on public.social_accounts
  for update to authenticated
  using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  )
  with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Social accounts delete" on public.social_accounts
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

-- ==============================================================================
-- 10. SCHEDULER & QUEUE (pg_cron + pgmq) — checklist phase 7
-- ==============================================================================
-- The publish step inside process_publish_queue() is a MOCK: no real
-- connector call yet, since phase 5 (account connections) is paused pending
-- a stable domain. It proves the state machine (QUEUED -> PUBLISHING ->
-- PUBLISHED/FAILED, retry with backoff, idempotent claiming) end to end.
-- Swap the marked block for a real connector call once phase 5 is live.
-- See 12-backend-logic.md §12.6 and supabase/patches/0005_scheduler_queue.sql.

create extension if not exists pg_cron;
create extension if not exists pgmq;

select pgmq.create('publish_queue');

create or replace function private.recompute_content_status(p_content_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total int;
  v_published int;
  v_needs_action int;
begin
  select
    count(*),
    count(*) filter (where status = 'PUBLISHED'),
    count(*) filter (where status = 'NEEDS_USER_ACTION')
  into v_total, v_published, v_needs_action
  from public.content_platforms
  where content_id = p_content_id;

  if v_total = 0 or (v_published + v_needs_action) < v_total then
    return; -- something is still in flight, leave content.status as-is
  end if;

  update public.content
  set status = case
    when v_published = v_total then 'PUBLISHED'
    when v_published > 0 then 'PARTIALLY_PUBLISHED'
    else status
  end
  where id = p_content_id;
end;
$$;

create or replace function private.dispatch_due_content()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  for r in
    select cp.id
    from public.content_platforms cp
    join public.content c on c.id = cp.content_id
    where cp.scheduled_at <= now()
      and c.status in ('APPROVED', 'SCHEDULED')
      and (
        cp.status = 'PENDING'
        or (cp.status = 'QUEUED' and cp.next_retry_at is not null and cp.next_retry_at <= now())
      )
  loop
    update public.content_platforms
    set status = 'QUEUED', next_retry_at = null
    where id = r.id and status in ('PENDING', 'QUEUED');

    perform pgmq.send('publish_queue', jsonb_build_object('content_platform_id', r.id));
  end loop;
end;
$$;

create or replace function private.process_publish_queue()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  msg record;
  cp public.content_platforms;
  is_test_fail boolean;
  new_attempt_count int;
  backoff_minutes int;
begin
  for msg in select * from pgmq.read('publish_queue', 30, 10)
  loop
    update public.content_platforms
    set status = 'PUBLISHING'
    where id = (msg.message ->> 'content_platform_id')::uuid
      and status = 'QUEUED'
    returning * into cp;

    if cp.id is null then
      perform pgmq.archive('publish_queue', msg.msg_id);
      continue;
    end if;

    -- ===== MOCK PUBLISHER — replace with a real connector call when phase 5 is live =====
    is_test_fail := cp.caption ilike '%test-fail%';

    if not is_test_fail then
      update public.content_platforms
      set status = 'PUBLISHED',
          published_at = now(),
          platform_post_id = 'mock-' || gen_random_uuid()::text,
          last_error = null
      where id = cp.id;

      insert into public.publish_attempts (content_platform_id, status)
      values (cp.id, 'SUCCESS');
    else
      new_attempt_count := coalesce(cp.attempt_count, 0) + 1;

      if new_attempt_count >= 5 then
        update public.content_platforms
        set status = 'NEEDS_USER_ACTION',
            attempt_count = new_attempt_count,
            failure_code = 'RATE_LIMIT',
            last_error = 'Mock RATE_LIMIT: deneme sayısı (5) aşıldı'
        where id = cp.id;
      else
        backoff_minutes := (2 ^ new_attempt_count)::int; -- 2, 4, 8, 16...
        update public.content_platforms
        set status = 'QUEUED',
            attempt_count = new_attempt_count,
            next_retry_at = now() + (backoff_minutes || ' minutes')::interval,
            failure_code = 'RATE_LIMIT',
            last_error = 'Mock RATE_LIMIT (deneme ' || new_attempt_count || '/5)'
        where id = cp.id;
      end if;

      insert into public.publish_attempts (content_platform_id, status, failure_code, error_detail)
      values (cp.id, 'FAILED', 'RATE_LIMIT', 'Mock hata: caption ''test-fail'' metnini içeriyor');
    end if;
    -- ===== MOCK PUBLISHER sonu =====

    perform private.recompute_content_status(cp.content_id);
    perform pgmq.archive('publish_queue', msg.msg_id);
  end loop;
end;
$$;

revoke execute on function private.dispatch_due_content() from public, anon, authenticated;
revoke execute on function private.process_publish_queue() from public, anon, authenticated;
revoke execute on function private.recompute_content_status(uuid) from public, anon, authenticated;

select cron.schedule('dispatch-due-content', '* * * * *', $$select private.dispatch_due_content();$$);
select cron.schedule('process-publish-queue', '* * * * *', $$select private.process_publish_queue();$$);

-- publish_attempts: first phase writing to it (via the SECURITY DEFINER
-- publisher above). Select-only policy — insert stays server-only.
create policy "Publish attempts select" on public.publish_attempts
  for select to authenticated using (
    exists (
      select 1 from public.content_platforms cp
      join public.content c on c.id = cp.content_id
      join public.brands b on b.id = c.brand_id
      where cp.id = content_platform_id and private.is_org_member(b.organization_id)
    )
  );

-- ==============================================================================
-- 11. MEDIA STORAGE — real file uploads (original only, no per-platform
-- variants — 12-backend-logic.md §12.8 leaves that pipeline's "where"
-- undecided). Public bucket: Meta's servers fetch the image over plain
-- HTTPS with no auth, which Supabase's own storage host already provides
-- without needing a VPS/domain.
-- ==============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Object path convention: {brand_id}/{uuid}-{filename} — write access scoped
-- to the uploader's own brand via the first path segment.
--
-- Goes through private.is_own_brand (SECURITY DEFINER), not a plain
-- `exists(select ... from public.brands ...)` subquery: confirmed live that
-- storage-api's session can't satisfy brands' own RLS-gated read the way a
-- normal PostgREST request can (a trivial `bucket_id = 'media'`-only policy
-- passed with the same JWT; the direct-subquery version 403'd). Same shape
-- of problem private.is_org_member already exists to solve, one level up.
create or replace function private.is_own_brand(p_brand_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.brands b
    where b.id = p_brand_id and private.is_org_member(b.organization_id)
  );
$$;

grant execute on function private.is_own_brand(uuid) to authenticated;

create policy "Media objects select own brand" on storage.objects
  for select to authenticated using (
    bucket_id = 'media' and private.is_own_brand(((storage.foldername(name))[1])::uuid)
  );

create policy "Media objects insert own brand" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'media' and private.is_own_brand(((storage.foldername(name))[1])::uuid)
  );

create policy "Media objects delete own brand" on storage.objects
  for delete to authenticated using (
    bucket_id = 'media' and private.is_own_brand(((storage.foldername(name))[1])::uuid)
  );

create policy "Media select" on public.media
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Media insert" on public.media
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Media delete" on public.media
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Content media select" on public.content_media
  for select to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

create policy "Content media insert" on public.content_media
  for insert to authenticated with check (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

create policy "Content media delete" on public.content_media
  for delete to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

-- ==============================================================================
-- 12. DASHBOARD BRIEFING — cached AI summary card (docs/repo-research —
-- Social Stats' dashboard_briefing.py pattern). One row per brand; the
-- server action checks generated_at before re-calling Groq. Postgres-backed
-- cache since we don't run Redis.
-- ==============================================================================

create table if not exists public.dashboard_briefings (
  brand_id uuid primary key references public.brands on delete cascade,
  text text not null,
  generated_at timestamptz not null default now()
);

alter table public.dashboard_briefings enable row level security;

create policy "Dashboard briefings select" on public.dashboard_briefings
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Dashboard briefings insert" on public.dashboard_briefings
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Dashboard briefings update" on public.dashboard_briefings
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

-- Campaigns: had RLS enabled, zero policies since schema creation. First
-- real UI built against it (Kampanyalar page + optional campaign tag on content).
create policy "Campaigns select" on public.campaigns
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Campaigns insert" on public.campaigns
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Campaigns update" on public.campaigns
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Campaigns delete" on public.campaigns
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
