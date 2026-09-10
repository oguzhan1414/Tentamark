-- Patch: ai_runs had RLS enabled but zero policies (flagged as a known gap
-- in docs/13-build-checklist.md). Needed now: checklist phase 6 writes to
-- this table every time a draft is generated.
--
-- Insert-mostly like publish_attempts / audit_logs — a run is a record of
-- what happened, not something a user edits. No update/delete policy: if a
-- run logged wrong, you log a corrected one, you don't rewrite history.

create policy "AI runs select" on public.ai_runs
  for select to authenticated using (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );

create policy "AI runs insert" on public.ai_runs
  for insert to authenticated with check (
    exists (select 1 from public.brands b where b.id = brand_id and private.is_org_member(b.organization_id))
  );
