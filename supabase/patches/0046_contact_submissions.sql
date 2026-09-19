-- 0046_contact_submissions.sql
-- Inquiries sent from Tentamark public Contact Us page (/iletisim)

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

comment on table public.contact_submissions is 'Inbound inquiries and contact messages from tentamark.com/iletisim';

-- Enable RLS
alter table public.contact_submissions enable row level security;

-- Anyone (including public anonymous visitors) can insert contact inquiries
drop policy if exists "Anyone can submit contact form" on public.contact_submissions;
create policy "Anyone can submit contact form"
  on public.contact_submissions
  for insert
  to public
  with check (true);

-- Authenticated team members or service role can view submissions
drop policy if exists "Team can view contact submissions" on public.contact_submissions;
create policy "Team can view contact submissions"
  on public.contact_submissions
  for select
  to authenticated
  using (true);

-- Index for quick sorting by creation date
create index if not exists idx_contact_submissions_created_at
  on public.contact_submissions (created_at desc);
