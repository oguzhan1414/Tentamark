-- Brand Voice Consistency Score infra: embeds every successfully published
-- caption (real, finalized brand voice — not rough drafts) so a brand's
-- "voice centroid" can be computed and new drafts scored against it by
-- cosine similarity. See src/lib/ai/getBrandVoiceConsistency.ts.
--
-- Requires OPENAI_API_KEY to actually produce embeddings (Groq has no
-- production-grade embedding model) — nothing in this migration itself
-- needs it, but the feature is inert without it.

create extension if not exists vector;

create table if not exists public.content_embeddings (
  id uuid default gen_random_uuid() primary key,
  brand_id uuid references public.brands on delete cascade not null,
  content_platform_id uuid references public.content_platforms on delete cascade not null unique,
  -- text-embedding-3-small's native dimension.
  embedding vector(1536) not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_content_embeddings_brand on public.content_embeddings(brand_id);

alter table public.content_embeddings enable row level security;

-- Written only by the scheduler publish route (admin client, bypasses RLS) —
-- an insert policy isn't needed for that path. Select is real user-facing
-- data (Compose reads the brand's own centroid), so that needs a policy,
-- same access shape as content/brand_dna.
create policy "Content embeddings select" on public.content_embeddings
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
