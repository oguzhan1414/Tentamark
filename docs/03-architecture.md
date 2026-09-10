# 3. Teknik Mimari

> Kaynak: `ai-marketing-manager-project-spec.md` bölüm 10, 11, 23, 24, 25, 26, 41, 42, 43, 44 ve "Final Architecture Decision". Bkz. [00-README.md](00-README.md) için doküman haritası.

## 3.1 İçerik Veri Modeli

Platform bağımsız bir içerik modeli oluştur.

```json
{
  "content_id": "...",
  "brand_id": "...",
  "content_type": "reel",
  "title": "...",
  "caption": "...",
  "media_url": "...",
  "hashtags": [],
  "platforms": [
    "instagram",
    "facebook",
    "tiktok"
  ],
  "status": "scheduled",
  "scheduled_at": "...",
  "approval_status": "approved"
}
```

Platform adapter daha sonra bunu platformun istediği formata dönüştürür.

## 3.2 İçerik Durumları

İçerik yaşam döngüsü:

```text
IDEA
 ↓
GENERATING
 ↓
DRAFT
 ↓
NEEDS_REVIEW
 ↓
APPROVED
 ↓
SCHEDULED
 ↓
PUBLISHING
 ↓
PUBLISHED
 ↓
ANALYZED
```

Hata:

```text
PUBLISHING
 ↓
FAILED
 ↓
RETRY / USER_ACTION
```

## 3.3 Önerilen Teknik Stack

Maliyeti düşük tutmak için:

### Frontend

**Next.js + TypeScript**

Neden: SaaS dashboard için uygun, SEO, React ekosistemi, tek proje, kolay deploy.

### Backend

İki seçenek:

#### Seçenek A — Önerilen

**Next.js API + Supabase Edge Functions**

MVP için en düşük operasyon maliyeti.

#### Seçenek B

**Node.js + Fastify/NestJS**

Platform entegrasyonları ve queue sistemi büyüdüğünde daha rahat olabilir.

Başlangıçta A tercih edilebilir.

## 3.4 Database

**Supabase PostgreSQL**

Tablolar:

```text
users
organizations
brands
brand_assets
brand_dna
social_accounts
social_tokens
content
content_assets
content_platforms
scheduled_posts
publish_attempts
analytics_snapshots
ai_generations
usage_records
subscriptions
```

Supabase Free planı MVP için yeterli olabilir.

Supabase güncel fiyatlandırmasında Free plan $0; Pro plan $25/aydan başlıyor. Free planda 500 MB DB, 1 GB storage ve 5 GB egress gibi limitler bulunuyor.

Kaynak: https://supabase.com/pricing

> **Not (eklenen değerlendirme):** Tablo listesi doğru bir başlangıç ama henüz kolon/ilişki/index seviyesinde bir şema yok — bu spec seviyesinde normal, ancak geliştirmeye başlamadan önce ayrı bir migration/şema dokümanı (ya da doğrudan Supabase migration dosyaları) gerekecek. `social_tokens` tablosu en hassas veri olduğu için şema tasarımında satır bazlı encryption/envelope encryption stratejisi ayrıca netleştirilmeli (bkz. 3.8 Güvenlik).

## 3.5 Storage

Media için:

### MVP

Supabase Storage

Avantaj: aynı ekosistem, basit auth, PostgreSQL, storage, edge functions.

### İleride

Cloudflare R2 / S3 benzeri object storage'a geçilebilir.

## 3.6 Queue / Job Sistemi

### MVP

Supabase Edge Functions + scheduled jobs.

### Büyüyünce

```text
Redis
+
BullMQ
```

veya managed queue.

İlk günden Redis kurmak zorunlu değil.

## 3.7 Önerilen Mimari

```text
                    ┌───────────────────┐
                    │      FRONTEND     │
                    │     Next.js       │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    API / BFF      │
                    │   Next.js API     │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
        ┌──────────┐    ┌───────────┐    ┌───────────┐
        │ Supabase │    │ AI Engine │    │ Scheduler │
        │ Postgres │    │           │    │           │
        └──────────┘    └─────┬─────┘    └─────┬─────┘
                              │                │
                    ┌─────────┼─────────┐      │
                    ▼         ▼         ▼      ▼
                  Brand     Content   Analytics Social
                    AI        AI        AI      Connectors
                                                   │
                         ┌─────────┬────────┬──────┼──────┐
                         ▼         ▼        ▼      ▼      ▼
                    Instagram Facebook LinkedIn TikTok YouTube
```

## 3.8 Database İlişkileri

```text
User
 │
 └── Organization
       │
       └── Brand
             │
             ├── BrandDNA
             ├── Assets
             ├── SocialAccounts
             │
             ├── Content
             │     ├── ContentAsset
             │     ├── ScheduledPost
             │     └── Analytics
             │
             └── AIUsage
```

## 3.9 Güvenlik

Kesinlikle:

- OAuth
- Encryption at rest
- Token encryption
- HTTPS
- Row Level Security
- Rate limiting
- Audit logs
- Secure secrets
- No social password storage
- No access token logging

kullanılmalı.

Supabase kullanılırsa RLS aktif tutulmalı.

> **Not (eklenen değerlendirme):** RLS, satır seviyesinde *erişim kontrolü* sağlar ama tek başına veriyi *şifrelemez*. Access token'lar için RLS'e ek olarak uygulama katmanında (insert öncesi) envelope encryption (ör. bir KMS/Vault ile üretilen data key) kullanılması, sadece "RLS açık" demekten daha güçlü bir garanti verir. Ayrıca Meta production app'leri için Data Deletion Request callback URL zorunluluğu bu bölümde hiç geçmiyor — bkz. [08-critical-risks.md](08-critical-risks.md).

## 3.10 Kullanıcı Yetki Modeli

MVP:

```text
Owner
```

yeterli.

V2:

```text
Owner
Admin
Editor
Viewer
```

eklenebilir.

## 3.11 Final Architecture Decision

**Recommended MVP stack:**

```text
Frontend:
Next.js + TypeScript + Tailwind

Backend:
Next.js API Routes / Server Actions

Database:
Supabase PostgreSQL

Auth:
Supabase Auth

Storage:
Supabase Storage

AI:
OpenAI API
+
provider abstraction

Scheduler:
Supabase Scheduled Functions / Cron

Social:
Instagram
Facebook
LinkedIn

Future:
TikTok
YouTube
Threads

Queue:
Start simple
→ Redis/BullMQ only when necessary

Payments:
Stripe / Paddle / local payment provider depending on target market
```

> **Not (eklenen değerlendirme):** "Payments: ... depending on target market" satırı aslında henüz verilmemiş bir karara işaret ediyor. Hedef pazar (Türkiye vs global) netleşmeden Stripe mi iyzico mu sorusu cevaplanamaz — bkz. [08-critical-risks.md](08-critical-risks.md) ve [01-product-vision.md](01-product-vision.md#13-hedef-kullanıcı).
