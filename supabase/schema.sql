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
  competitor_analysis jsonb default '[]'::jsonb, -- rich per-competitor insight (see patches/0012)
  trait_scores jsonb default '{}'::jsonb, -- e.g. {"samimi": 80, "profesyonel": 70, ...} (see patches/0013)
  tone_position jsonb default '{"x": 0, "y": 0}'::jsonb, -- tone quadrant dot: x=professional/casual, y=reserved/energetic
  audience_persona jsonb default '{}'::jsonb, -- structured persona: label/age/location/language/career/goal/pain_point (see patches/0014)
  audience_pain_points jsonb default '[]'::jsonb,
  audience_motivations jsonb default '[]'::jsonb,
  market_comparison jsonb default '{}'::jsonb, -- dimensions/brandScores/competitiveGap/opportunity (see patches/0015)
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
  input_snapshot jsonb default '{}'::jsonb, -- brand_dna fields used to generate this version (see patches/0016)
  change_notes jsonb default '{}'::jsonb, -- real diff vs previous version: changed_inputs[] + pillar_diffs[]
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
  -- Which channels this campaign is scoped to (patch 0022) — a scoping
  -- label only, doesn't restrict what Compose lets you target.
  platforms text[] not null default '{}',
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
  format text default 'post' not null, -- post, story, reel — classification + AI prompt tone only, no publish-path branching yet
  tags jsonb default '[]'::jsonb,
  -- AI-generated extras (hook, visual/video concept) from features like the
  -- weekly pack. Real structured storage — not text-encoded into core_idea.
  metadata jsonb,
  ai_generated boolean default true,
  created_by uuid references public.profiles(id) on delete set null,
  -- "Onaya ata" (patches/0027) — no notification infra exists, so this is
  -- just an assignment record/filter, not a "ping this person" feature.
  assigned_to uuid references public.profiles(id) on delete set null,
  -- Evergreen Recycling (patches/0045)
  is_evergreen boolean default false not null,
  evergreen_interval_days integer default 30 not null,
  evergreen_max_recycles integer default null,
  evergreen_recycle_count integer default 0 not null,
  evergreen_last_recycled_at timestamptz default null,
  evergreen_auto_remix boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists idx_content_assigned_to on public.content(assigned_to);
create index if not exists idx_content_evergreen on public.content(brand_id, is_evergreen, evergreen_last_recycled_at) where is_evergreen = true;

-- content_comments — a real threaded discussion on a piece of content
-- (Planable-style: teammates leaving notes like "Alright! Scheduled." right
-- on the post), separate from the approve/reject status change itself.
create table if not exists public.content_comments (
  id uuid default gen_random_uuid() primary key,
  content_id uuid references public.content on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz default now() not null
);
create index if not exists idx_content_comments_content on public.content_comments(content_id, created_at);

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
  platform text not null, -- 'instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'
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

-- Tracks who changed a platform draft's caption/schedule and what it looked
-- like before (patches/0054) — content_platforms.updated_at alone doesn't
-- say who touched it, so a reviewer had no way to know a teammate edited
-- the AI-generated copy before approval.
create table if not exists public.content_edit_history (
  id uuid default gen_random_uuid() primary key,
  content_platform_id uuid references public.content_platforms on delete cascade not null,
  edited_by uuid references public.profiles(id) on delete set null,
  old_caption text,
  new_caption text,
  old_scheduled_at timestamptz,
  new_scheduled_at timestamptz,
  created_at timestamptz default now() not null
);
create index if not exists idx_content_edit_history_platform on public.content_edit_history(content_platform_id, created_at desc);

-- updated_at auto-bump (patches/0047) — without this, `updated_at` only ever
-- reflects insert time; no application code sets it on UPDATE, which makes
-- it useless as an optimistic-concurrency token (MCP's reschedule_draft /
-- submit_for_approval tools rely on it actually changing).
create or replace function private.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.content;
create trigger set_updated_at before update on public.content
for each row execute function private.set_updated_at();

drop trigger if exists set_updated_at on public.content_platforms;
create trigger set_updated_at before update on public.content_platforms
for each row execute function private.set_updated_at();

drop trigger if exists set_updated_at on public.brand_dna;
create trigger set_updated_at before update on public.brand_dna
for each row execute function private.set_updated_at();

-- calendar_notes (patch 0019, color added in 0020) — free-text sticky notes
-- on a calendar day, independent of any real content/post.
create table if not exists public.calendar_notes (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  note_date date not null,
  text text not null,
  color text not null default 'amber',
  created_at timestamptz default now() not null
);
create index if not exists idx_calendar_notes_brand_date on public.calendar_notes(brand_id, note_date);

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

-- Assistant Messages (persisted chat history for the AI marketing copilot —
-- see patches/0017). Doubles as the raw dataset for future fine-tuning:
-- draft + draft_status (pending/accepted/rejected) is a real quality signal
-- (did the user accept the draft as-is, or reject it) without any extra
-- logging work.
create table if not exists public.assistant_messages (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  role text not null, -- 'user' | 'assistant'
  content text not null,
  draft jsonb, -- ContentDraft shape (title/category/day_offset/captions), null if this turn wasn't a draft
  draft_status text, -- 'pending' | 'accepted' | 'rejected', null if no draft
  content_id uuid references public.content on delete set null, -- set once an accepted draft becomes real content
  created_at timestamptz default now() not null
);

create index if not exists idx_assistant_messages_brand_created on public.assistant_messages(brand_id, created_at);

-- Audit Logs (Tamper-evident history: who did what, when)
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null, -- e.g. CONTENT_APPROVED, SOCIAL_ACCOUNT_CONNECTED, BRAND_DNA_UPDATED
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null,
  -- MCP actor/connection/request shape (patches/0047) — user_id stays "which
  -- human this credential traces back to"; these describe the credential and
  -- call itself. No FK on mcp_connection_id yet: mcp_connections doesn't
  -- exist until the MCP OAuth/PAT stage.
  actor_type text not null default 'user' check (actor_type in ('user', 'mcp_oauth', 'mcp_pat', 'system')),
  mcp_connection_id uuid,
  request_id text,
  tool_name text,
  outcome text not null default 'success' check (outcome in ('success', 'denied', 'failed')),
  before_state jsonb,
  after_state jsonb,
  client_name text
);

create index if not exists idx_audit_logs_mcp_connection on public.audit_logs(mcp_connection_id) where mcp_connection_id is not null;
create index if not exists idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);

-- mcp_idempotency_keys (patches/0047) — replay ledger for MCP write tools.
-- No SELECT policy for authenticated/anon on purpose: `result`/`error` can
-- contain another org's cached tool output, and without mcp_connections yet
-- there's no join target to scope a policy by. RLS with zero policies denies
-- every role except service_role, which is all lib/mcp/idempotency.ts needs.
create table if not exists public.mcp_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null,
  tool_name text not null,
  idempotency_key text not null,
  request_hash text not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed')),
  result jsonb,
  error jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (connection_id, tool_name, idempotency_key)
);
alter table public.mcp_idempotency_keys enable row level security;
create index if not exists idx_mcp_idempotency_lookup
  on public.mcp_idempotency_keys(connection_id, tool_name, idempotency_key);

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
alter table public.content_edit_history enable row level security;
alter table public.content_comments enable row level security;
alter table public.calendar_notes enable row level security;
alter table public.publish_attempts enable row level security;
alter table public.analytics_snapshots enable row level security;
alter table public.ai_runs enable row level security;
alter table public.assistant_messages enable row level security;
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
-- Scoped via private.can_access_brand (brand_memberships-aware, see
-- 0044_brand_access.sql), not raw org-membership — matches how `brands`
-- itself is scoped. Fixed in 0053 after 0052's insert policy shipped with
-- the org-wide check by mistake, which reopened a cross-brand leak.
create policy "Brand DNA select" on public.brand_dna
  for select to authenticated using (private.can_access_brand(brand_id));
create policy "Brand DNA update" on public.brand_dna
  for update to authenticated
  using (private.can_access_brand(brand_id))
  with check (private.can_access_brand(brand_id));
-- INSERT policy: required even though handle_new_user() pre-seeds a row for
-- every brand — `.upsert()` compiles to INSERT ... ON CONFLICT DO UPDATE,
-- which needs INSERT privilege to even attempt the statement, regardless of
-- whether the conflict path (falling back to UPDATE) ends up being taken.
create policy "Brand DNA insert" on public.brand_dna
  for insert to authenticated
  with check (private.can_access_brand(brand_id));

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

-- Content Edit History (patches/0054) — select mirrors brand access; insert
-- mirrors Content Platforms' own real (post-0043/0044) update predicate, not
-- the stale is_org_member version shown just above (see this file's header
-- note on schema.sql drift), so exactly whoever could make the edit can log it.
create policy "Content edit history select" on public.content_edit_history
  for select to authenticated using (
    exists (
      select 1 from public.content_platforms cp
      join public.content c on c.id = cp.content_id
      where cp.id = content_platform_id and private.can_access_brand(c.brand_id)
    )
  );
create policy "Content edit history insert" on public.content_edit_history
  for insert to authenticated with check (
    exists (
      select 1 from public.content_platforms cp
      join public.content c on c.id = cp.content_id
      join public.brands b on b.id = c.brand_id
      where cp.id = content_platform_id
        and (private.can_review_brand(b.id)
          or (private.can_access_brand(b.id) and c.status in ('DRAFT', 'NEEDS_REVIEW')
            and (c.created_by = (select auth.uid()) or c.draft_assignee_id = (select auth.uid()))))
    )
  );

-- Content Comments: same brand-membership gate as Content Platforms above.
create policy "Content comments select" on public.content_comments
  for select to authenticated using (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

create policy "Content comments insert" on public.content_comments
  for insert to authenticated with check (
    exists (
      select 1 from public.content c
      join public.brands b on b.id = c.brand_id
      where c.id = content_id and private.is_org_member(b.organization_id)
    )
  );

-- Calendar Notes: plain brand-scoped CRUD (no update — delete + re-add is
-- simpler than an edit path for a short sticky note).
create policy "Calendar notes select" on public.calendar_notes
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Calendar notes insert" on public.calendar_notes
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "Calendar notes delete" on public.calendar_notes
  for delete to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

-- Notes are edited in place (text/color both change post-creation), so an
-- update path is needed (added in patch 0021).
create policy "Calendar notes update" on public.calendar_notes
  for update to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  ) with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

-- Audit Logs: Members can read org audit logs, only service_role can insert
create policy "Audit logs select" on public.audit_logs
  for select to authenticated using (private.is_org_member(organization_id));
revoke update, delete on public.audit_logs from authenticated, anon;

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

-- Assistant Messages: needs update (unlike ai_runs) — accepting/rejecting a
-- draft updates draft_status + content_id on the existing row rather than
-- logging a new one, since it's the same conversational turn.
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

-- 128MB / video/mp4|webm added for TikTok (patch 0018) — Direct Post has no
-- text/image-only path, so Compose needs to be able to produce a file
-- tiktokProvider.ts's publish() can actually accept.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 134217728, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
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

-- ==============================================================================
-- 13. SOCIAL INBOX — inbound comments/DMs via Meta's real-time event
-- webhooks (Instagram + Facebook Page), plus outbound replies sent from the
-- app. Distinct from the signed_request-based deauthorize/data-deletion
-- callbacks (api/connections/*/deauthorize) — this table is fed by
-- api/webhooks/meta, which verifies the X-Hub-Signature-256 header scheme
-- instead (see src/lib/social/webhookSignature.ts).
-- ==============================================================================

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

-- ==============================================================================
-- 14. TEAM INVITES — org owners invite teammates by email + role, via a
-- shareable link (no transactional email infra exists in this project, so
-- invites aren't sent automatically — the owner shares the link themselves).
-- See supabase/patches/0026_organization_invites.sql for the full reasoning,
-- especially accept_invite's org-cleanup safety conditions.
-- ==============================================================================

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

-- organization_members only ever had a select policy (§9) — the `role`
-- column existed from day one but nothing could ever change it or remove a
-- member. These two close that gap, owner-gated.
create policy "Org members update by owner" on public.organization_members
  for update to authenticated using (private.is_org_owner(organization_id)) with check (private.is_org_owner(organization_id));

create policy "Org members delete by owner" on public.organization_members
  for delete to authenticated using (private.is_org_owner(organization_id));

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

-- ==============================================================================
-- 15. DIŞ PAYLAŞIM LİNKİ — token-based, no-login-required approval page for
-- a single piece of content. See patches/0028_content_share_links.sql for
-- full reasoning, including why this also fixed a pre-existing dishonest
-- "Paylaşmak" button (it used to copy the dashboard URL, useless to anyone
-- without an account).
-- ==============================================================================

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

alter table public.content_comments add column if not exists is_external boolean not null default false;

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

-- ==========================================
-- CONTACT SUBMISSIONS
-- ==========================================
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'replied', 'archived')),
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.contact_submissions enable row level security;

create policy "Anyone can submit contact form"
  on public.contact_submissions for insert
  to public with check (true);

create policy "Team can view contact submissions"
  on public.contact_submissions for select
  to authenticated using (true);

create index if not exists idx_contact_submissions_created_at
  on public.contact_submissions (created_at desc);

-- ==========================================
-- VIDEO RENDER JOBS (patch 0051)
-- ==========================================
create table if not exists public.video_render_jobs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade not null,
  created_by uuid references public.profiles(id) on delete set null,

  format text not null check (format in ('vertical', 'horizontal')),
  duration_seconds integer not null check (duration_seconds in (10, 15, 20)),

  source_type text not null check (source_type in ('existing_content', 'custom_topic')),
  source_content_id uuid references public.content(id) on delete set null,
  topic text,
  selected_media_ids uuid[] not null default '{}',
  check (
    (source_type = 'existing_content' and source_content_id is not null)
    or (source_type = 'custom_topic' and topic is not null)
  ),

  scene_plan jsonb,

  status text not null default 'pending' check (status in ('pending', 'rendering', 'completed', 'failed')),
  error text,
  output_media_id uuid references public.media(id) on delete set null,
  output_url text,

  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.video_render_jobs enable row level security;

drop trigger if exists set_updated_at on public.video_render_jobs;
create trigger set_updated_at before update on public.video_render_jobs
for each row execute function private.set_updated_at();

create policy "Video render jobs select own brand" on public.video_render_jobs
  for select to authenticated using (private.is_own_brand(brand_id));

create policy "Video render jobs insert own brand" on public.video_render_jobs
  for insert to authenticated with check (private.is_own_brand(brand_id));

create index if not exists idx_video_render_jobs_brand on public.video_render_jobs(brand_id, created_at desc);
