-- brand_dna has SELECT and UPDATE policies but no INSERT policy. Postgres'
-- `INSERT ... ON CONFLICT DO UPDATE` (what every `.upsert()` call compiles
-- to) always requires INSERT privilege to even attempt the statement, even
-- when the conflict path ends up just updating an existing row. Since
-- handle_new_user() already seeds a placeholder brand_dna row for every new
-- signup, onboarding's brand_dna upsert has been hitting this gap on every
-- completion: "new row violates row-level security policy for table
-- brand_dna" (Postgres code 42501), leaving onboarding_completed stuck false.

create policy "Brand DNA insert" on public.brand_dna
  for insert to authenticated
  with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
