-- Adds a category to content_templates (supabase/patches/0035), for the
-- template picker's visual grouping (Müşteri Yorumu / Haftalık İpucu / Ürün
-- Lansmanı / Genel — see web/src/lib/content/templateCategories.ts). Free
-- text, not an enum: the category list lives in app code, not the DB, so
-- adding one doesn't need a migration.

alter table public.content_templates add column if not exists category text;
