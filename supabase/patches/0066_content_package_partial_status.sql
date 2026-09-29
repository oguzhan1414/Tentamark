-- A package can be useful even when one best-effort output fails. Preserve
-- that distinction instead of reporting a partially generated package as
-- fully ready.
alter table public.content_packages
  drop constraint if exists content_packages_status_check;

alter table public.content_packages
  add constraint content_packages_status_check
    check (status in ('generating', 'partial_ready', 'ready', 'failed'));
