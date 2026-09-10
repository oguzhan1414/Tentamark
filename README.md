# Tentamark

AI destekli sosyal medya pazarlama yöneticisi. Kullanıcı marka bilgisini girer, AI haftalık içerik paketi üretir, kullanıcı onaylar, sistem yayınlar.

## Yapı

- `web/` — Next.js 16 + Supabase uygulaması (asıl kod burada)
- `docs/` — mimari kararlar, faz bazlı ilerleme takibi (`13-build-checklist.md` en güncel durumun özeti)
- `supabase/` — veritabanı şeması ve sıralı SQL patch'leri (`schema.sql` + `patches/`)
- `images/`, `video/` — marka/tasarım referans varlıkları
- `*.md` (kök) — ürün spesifikasyonu ve UX geliştirme rehberi

## Geliştirme

```bash
cd web
npm install
npm run dev
```

Gerekli ortam değişkenleri için `web/.env.example` dosyasına bakın; `web/.env.local` olarak kopyalayıp doldurun.
