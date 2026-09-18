-- ==============================================================================
-- 0041: ONBOARDING, TARGET MARKET (COUNTRY), & TEAM SIZE
-- Extends brands and profiles to persist onboarding wizard selections:
-- 1. brands.country (e.g. 'tr', 'us', 'eu', 'uk', 'global')
-- 2. brands.team_size (e.g. 'solo', 'small', 'medium', 'agency_large')
-- 3. profiles.onboarding_completed (boolean)
-- ==============================================================================

-- 1. Add country and team_size to brands
alter table public.brands
  add column if not exists country text default 'tr',
  add column if not exists team_size text default 'solo';

-- 2. Add onboarding_completed flag to profiles
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

-- Mark existing active users who already have brands as completed so we don't disrupt existing data
update public.profiles
set onboarding_completed = true
where active_brand_id is not null;
