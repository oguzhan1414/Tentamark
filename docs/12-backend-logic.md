# 12. Backend Mantığı — Kapsamlı Referans

> Bu dosya, `10-domain-architecture.md`'deki araştırmayı, 4 yeni repoyu (AI içerik
> üretimi turu) ve bir dış inceleme turunu (§12.15) **tek bir yerde** birleştirir.
> Amaç: backend'in tamamını tek dosyadan okuyup hatırlayabilmek, hangi kararın
> hangi kaynaktan geldiğini kaybetmemek.
>
> `10-domain-architecture.md` silinmedi — oradaki kanıt/alıntılar (migration adları,
> README cümleleri) detaylı referans olarak duruyor. Bu dosya onun **güncel,
> konsolide edilmiş** hali + üstüne eklenen yeni katmanlar.
>
> **Tarih:** 8 Eylül 2026

---

## 12.1 Kaynak repolar — tam liste

Toplam 12 repo incelendi, iki turda. Hiçbirinden kod kopyalanmadı — hepsi ya
**mimari kanıt** (neden böyle yaptılar, biz de mi yapmalıyız) ya da **prompt
içeriği** (MIT lisanslı pazarlama bilgisi) olarak kullanıldı.

### Tur 1 — Scheduler / Publisher mimarisi

| Repo | Ne aldık | Nereye işledik |
|---|---|---|
| [trypostit/trypost](https://github.com/trypostit/trypost) | 65 migration'ın evrimi: otomasyon motoru kurup silmeleri, `posts→post_platforms` ayrımı, bağlantı sağlığı takibi | §12.3, §12.6 |
| [clawnify/OpenPost](https://github.com/clawnify/OpenPost) | "Token'ı yayın anında taze çek, saklama" deseni | §12.7 |
| [dineshstack/post-scheduler-frontend](https://github.com/dineshstack/post-scheduler-frontend) | Bizimle aynı stack (Next.js 16 App Router). Rota yapısı, composer deseni, RHF+Zod | §12.11 |
| [cbsshekhawat18-lab/social-stats](https://github.com/cbsshekhawat18-lab/social-stats-social-media-manager) | `DailyMetric` ile geçmiş metrik saklama kanıtı, Fernet ile per-workspace token şifreleme | §12.3, §12.9 |
| [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) | Karşılaştırma noktası (Temporal kullanıyorlar, biz kullanmıyoruz) | §12.6 |
| [svar-widgets/react-calendar](https://github.com/svar-widgets/react-calendar) | Takvim kararı — önerilen aday | §12.10 |
| [GeorgeLxL/react-scheduled-calendar](https://github.com/GeorgeLxL/react-scheduled-calendar) | **Elendi** — 1 yıldız, hobi projesi | §12.10 |
| [NafisRayan/Social-Media-Dashboard](https://github.com/NafisRayan/Social-Media-Dashboard) | Sadece UI fikri (mock veri, backend yok) | §12.11 |

### Tur 2 — AI içerik üretim zekası

| Repo | Gerçek yıldız/durum (GitHub API'den doğrulandı) | Ne aldık | Nereye işledik |
|---|---|---|---|
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 48.5k yıldız, MIT, aktif | 60+ pazarlama prompt/framework dosyası (positioning, content-strategy, copywriting, social). Hiyerarşik yapı: "product-marketing" temel bağlam, diğerleri onu okuyor | §12.5 — **prompt kütüphanesinin omurgası** |
| [blader/humanizer](https://github.com/blader/humanizer) | 45.2k yıldız, MIT, aktif | AI metninde görülen 25 deseni tespit eden taksonomi | §12.5 — **kalite geçişi kontrol listesi** |
| [Emily2040/seedance-2.0](https://github.com/Emily2040/seedance-2.0) | 7.2k yıldız, MIT, çok aktif | Video **üretmiyor**, sadece çekim planlama/prompt katmanı. Gerçek üretim harici ücretli API ister | §12.12 — **MVP kapsamı dışı** |
| [AKCodez/higgsfield-claude-skills](https://github.com/AKCodez/higgsfield-claude-skills) | 349 yıldız, **lisans yok** | — | §12.12 — **kullanılmıyor** (lisans yok, API değil tarayıcı otomasyonu) |

**Önemli düzeltme:** İlk okumada "seedance-2.0 video üretir" sanılmıştı. Doğrulandı: **üretmiyor**, sadece senaryo/çekim listesi hazırlıyor.

---

## 12.2 Sistem bir bakışta

```
                         organizations (faturalama sınırı)
                                │
                              brands (marka sınırı, Brand DNA burada yaşar)
                                │
    ┌──────────┬────────┬──────┴───────┬──────────────┬────────────┬──────────┐
    ▼          ▼        ▼              ▼              ▼            ▼          ▼
social_accounts media  brand_dna  analytics_snapshots ai_usage  campaigns  audit_logs
    │                       │                                       │
    │                       ▼                                       │
    │            ┌─────────────────────┐                            │
    │            │ AI İÇERİK ZEKASI     │  ← §12.5                   │
    │            │ (marketingskills +   │  → her adım ai_runs'a       │
    │            │  humanizer'dan       │    log yazar               │
    │            │  esinlenen)          │                            │
    │            └──────────┬───────────┘                           │
    │                       ▼                                       │
    │                    content ◄──────────────────────────────────┘
    │                       │        (opsiyonel campaign_id ile gruplanır)
    │                       ├── content_media (hangi görsel/video)
    │                       ▼
    │             content_platforms (platform başına satır)
    │                       │
    │                       ▼
    │              publish_attempts (her deneme, tam geçmiş)
    │                       │
    └──────────┬────────────┘
               ▼
     Scheduler (pg_cron + pgmq, §12.6)
               │
               ▼
     Publisher → platform API'leri (capability-farkında connector, §12.7)
               │
               ▼
     analytics_snapshots'a geri besleme
               │
               └──────────→ AI İçerik Zekası (bir sonraki hafta daha iyi öneri)
```

Tek cümleyle: **Brand DNA bir kere kuruluyor, AI İçerik Zekası her hafta ondan ve
geçmiş performanstan besleniyor (her adımı loglanarak), insan onaylıyor, scheduler
yayınlıyor (her denemesi kaydedilerek), analytics döngüyü kapatıyor.**

---

## 12.3 Domain modeli

```
organizations            faturalama ve abonelik sınırı
  └── brands             marka sınırı, Brand DNA burada yaşar
        ├── brand_dna              yapılandırılmış kimlik (JSON, serbest metin DEĞİL)
        ├── brand_strategy         AI'ın ürettiği pozisyonlama/strateji (versiyonlu JSONB)
        ├── social_accounts        platform başına bağlantı + token sağlığı
        ├── media                  yüklenen görsel/video
        ├── campaigns              içerik gruplama (hafif — ayrı metrik tablosu yok)
        ├── content                platformdan bağımsız fikir/taslak
        │     ├── content_media        hangi medya bu içerikte kullanılıyor
        │     └── content_platforms    platforma özel metin + durum + uzak ID
        │           └── publish_attempts   her yayın denemesi, tam geçmiş
        ├── repurposes             bir fikirden türeyen çoklu içerik
        ├── analytics_snapshots    periyodik metrik yakalama (bizim farkımız)
        ├── ai_runs                her AI çağrısının izi (prompt versiyonu, maliyet, sonuç)
        ├── ai_usage               marka başına AI tüketimi (ai_runs'tan türetilen özet)
        └── audit_logs             kim ne yaptı (organizations seviyesinde de olabilir)
```

`organization_members` (kullanıcı ↔ organizasyon pivotu) yetkilendirmenin temeli.

Bu model bir tercih değil, üç bağımsız projenin (TryPost, social-stats,
post-scheduler-frontend) **bağımsız olarak aynı yere varmasının** sonucu — üçü de
"tek içerik, platform başına varyant" diyor. Detaylı kanıt: `10-domain-architecture.md §10.3.1`.

### `content_platforms` — sistemin sıcak noktası

| Alan | Neden |
|---|---|
| `content_id`, `platform` | hangi fikrin hangi platform sürümü |
| `caption`, `hashtags` | platforma özel yeniden yazılmış metin |
| `status` | **platform başına** durum (biri başarısız olsa diğerleri yayınlanır) |
| `platform_post_id` | uzak ID, analytics ve webhook eşleştirmesi için (index'li) |
| `scheduled_at` (timestamptz, UTC) | platform başına farklı saat olabilir. UI'da `brand.timezone` ile gösterilir |
| `published_at` (timestamptz, nullable) | gerçek yayın anı — `scheduled_at`'ten farklı olabilir (kuyruk gecikmesi) |
| `attempt_count`, `next_retry_at`, `last_error` | **özet** alanlar, hızlı UI okuması için. Tam geçmiş `publish_attempts`'te |

### `content_media` — dış incelemeden eklendi

Daha önce eksikti: bir içerikte hangi görsel/video kullanıldığı modellenmemişti.

| Alan | Neden |
|---|---|
| `content_id`, `media_id` | ilişki |
| `position` | carousel/çoklu görsel sırası |

MVP'de tüm platformlar aynı medyayı paylaşır (tek `content_media` seti). Platform
başına farklı kırpma/oran ihtiyacı çıkarsa (Instagram kare, TikTok dikey), bu
`media_variants` ile çözülür (§12.8) — ayrı bir `content_platform_media` tablosuna
gerek yok, medyanın kendisi platform-şekilli varyantlara sahip olur.

### `publish_attempts` — dış incelemeden eklendi

`content_platforms` mevcut durumu tutar, bu tablo **tam geçmişi** tutar (insert-only).

| Alan | Neden |
|---|---|
| `content_platform_id` | hangi yayının denemesi |
| `attempted_at` | ne zaman denendi |
| `status` | `SUCCESS` / `FAILED` |
| `failure_code` | normalize edilmiş hata tipi (§12.4) |
| `error_detail` | ham hata mesajı, debug için |
| `http_status` | platform API'sinin döndüğü kod (varsa) |

### `social_accounts` — dış incelemeden genişletildi

| Alan | Neden |
|---|---|
| `platform`, `external_account_id` | hangi hesap. **Unique kısıt gerekiyor** (§12.16 açık karar — kapsamı: marka başına mı, global mi) |
| `username`, `display_name`, `avatar_url` | "bağlı hesaplar" ekranında gösterim |
| `access_token_encrypted`, `refresh_token_encrypted` | Fernet ile per-brand şifreli (§12.9) |
| `token_expires_at`, `scopes` | yenileme mantığı için |
| `status` | `active` / `disconnected` / `needs_reauth` |
| `last_health_check_at`, `last_error` | token health cron'unun (§12.6, job 3) yazdığı alanlar |
| `metadata` (JSONB) | platform-özel ekstra veri |

### `ai_runs` — dış incelemeden eklendi

AI İçerik Zekası'nın (§12.5) her adımının izi. Bunsuz "bu içerik neden böyle
üretildi" sorusu asla cevaplanamaz.

| Alan | Neden |
|---|---|
| `brand_id`, `content_id` (nullable) | pozisyonlama/strateji adımları tek içeriğe bağlı değildir |
| `stage` | `positioning` / `content_strategy` / `idea` / `platform_adapt` / `quality_pass` |
| `prompt_version` | ör. `"social-instagram-v3"` — prompt değişince hangi versiyonun neyi ürettiğini bilme |
| `model`, `input_tokens`, `output_tokens`, `cost`, `latency_ms` | maliyet ve performans izleme |
| `status`, `error` | başarı/hata |

`ai_usage` (marka başına toplam tüketim) artık ayrı elle tutulan bir sayaç değil,
**`ai_runs` üzerinden türetilen bir özet** — çifte defter tutmayı önler.

### `audit_logs` — dış incelemeden eklendi

Insert-only, asla `UPDATE`/`DELETE` yok (denetim kaydının bütünlüğü için).

| Alan | Neden |
|---|---|
| `organization_id`, `user_id` (nullable — sistem tetiklerse boş) | kim |
| `action` | `CONTENT_APPROVED`, `SOCIAL_ACCOUNT_CONNECTED`, `BRAND_DNA_UPDATED` vb. |
| `entity_type`, `entity_id` | ne üzerinde |
| `metadata` (JSONB) | ek bağlam |

Ekip kullanımı geldiğinde (§12.12'de MVP dışı bırakılan `approval_requests`)
zaten hazır bir temel olur.

### `campaigns` — dış incelemeden eklendi, kapsamı küçültülerek

Dış inceleme 4 tablo (`campaigns` + `campaign_goals` + `campaign_content` +
`campaign_metrics`) önerdi. **Küçültüldü:** tek tablo + `content.campaign_id`
(nullable FK). Kampanya performansı, o kampanyaya bağlı içeriklerin
`analytics_snapshots` toplamından **türetilir** — ayrı bir metrik tablosuna
gerek yok. Gerekçe: Ders 1 (TryPost'un otomasyon motoru) — henüz kullanılmayan
tabloyu şimdiden inşa etmiyoruz.

| Alan | Neden |
|---|---|
| `brand_id`, `name` | temel |
| `objective` (text, opsiyonel) | serbest metin, MVP'de yapılandırılmış hedef gerekmiyor |
| `start_date`, `end_date` (opsiyonel) | zaman aralığı |
| `status` | `active` / `completed` / `archived` |

### `analytics_snapshots` — dış incelemeden genişletildi

| Alan | Neden |
|---|---|
| `brand_id` | temel |
| `social_account_id` **veya** `content_platform_id` (tam olarak biri set) | hesap seviyesi mi, gönderi seviyesi mi |
| `captured_at` | ne zaman ölçüldü |
| `impressions`, `reach`, `likes`, `comments`, `shares`, `saves`, `clicks`, `views`, `watch_time`, `followers` | ortak metrik seti (hepsi nullable, her platform hepsini doldurmaz) |
| `metadata` (JSONB) | platform-özel ekstra metrik |

---

## 12.4 İçerik durum makinesi

**`content.status`** (fikrin genel hali):
`IDEA → GENERATING → DRAFT → NEEDS_REVIEW → APPROVED → SCHEDULED → PUBLISHED → ANALYZED`

**`content_platforms.status`** (her platformun kendi hali):

```
PENDING → QUEUED → PUBLISHING → PUBLISHED
                        │
                        ▼ (hata)
                     FAILED
                        │
              is_retryable(failure_code)?
              ┌─────────┴─────────┐
             evet                hayır
              │                    │
      next_retry_at yaz      NEEDS_USER_ACTION
      → QUEUED (backoff)      (kullanıcı aksiyon almalı)
```

`content.status = PUBLISHED` ancak **tüm** platform satırları terminal duruma
ulaştığında yazılır. Kısmi başarı `PARTIALLY_PUBLISHED`.

### Hata kodu normalizasyonu — dış incelemeden eklendi, önceki açık kararı çözüyor

| `failure_code` | `is_retryable` | Anlamı |
|---|---|---|
| `TOKEN_EXPIRED` | Hayır → `NEEDS_USER_ACTION` | Yeniden bağlanma gerekir |
| `RATE_LIMIT` | Evet, backoff ile | Platform geçici olarak sınırlandı |
| `MEDIA_INVALID` | Hayır → `NEEDS_USER_ACTION` | Kullanıcı medyayı düzeltmeli |
| `PLATFORM_ERROR` | Evet | Platform tarafı geçici sorun olabilir |
| `NETWORK_ERROR` | Evet | Geçici bağlantı sorunu |
| `UNKNOWN` | Evet, düşük deneme limitiyle | Sınıflandırılamayan hata |

Her deneme `publish_attempts`'e (§12.3) tam olarak kaydedilir; `content_platforms`
sadece en güncel özeti taşır.

---

## 12.5 AI İçerik Zekası Katmanı

Önceki tur (scheduler/publisher) "içerik nasıl yayınlanır"ı çözdü; bu tur
"içerik nasıl **iyi** üretilir"i çözüyor.

### Neden ayrı bir katman gerekiyor

`brand_dna` yapılandırılmış JSON olarak duruyor. Ama JSON'dan doğrudan "Instagram
caption'ı yaz" demek generic AI çıktısı üretir — kendi pazarlama sitemiz için
yasakladığımız "AI kokusu"nun aynısı, bu sefer müşteri içeriğinde.

### Prompt zinciri

marketingskills'in kurduğu hiyerarşiden esinlenildi: "product-marketing" temel
bağlam, diğer skill'ler onu okuyup üstüne inşa ediyor. **Her adım `ai_runs`'a
loglanır** (§12.3) — hangi versiyon promptun neyi ürettiğini kaybetmeden.

```
[1] brand_dna (yapılandırılmış: sektör, hedef kitle, ton, palet, yasaklı konular)
        │  ← HER adımda temel bağlam olarak enjekte edilir
        ▼
[2] Positioning katmanı  →  ai_runs (stage: positioning)
        marketingskills/positioning + product-marketing çerçevelerinden
        esinlenilen prompt. Çıktı `brand_strategy`'ye yazılır (versiyonlu JSONB,
        brand_dna değişmediği sürece yeniden hesaplanmaz).
        ▼
[3] İçerik stratejisi katmanı  →  ai_runs (stage: content_strategy)
        marketingskills/content-strategy + marketing-plan'dan esinlenilen
        prompt. Girdi: brand_strategy + analytics_snapshots (geçmiş performans).
        Çıktı: haftalık içerik temaları, brand_strategy'nin bir sonraki versiyonu.
        ▼
[4] Fikir üretimi  →  ai_runs (stage: idea)
        marketingskills/social + copywriting'den esinlenilen prompt.
        Çıktı: content (platformdan bağımsız taslak kavram)
        ▼
[5] Platforma uyarlama  →  ai_runs (stage: platform_adapt)
        Her platform için ayrı prompt. Çıktı: content_platforms.caption taslağı.
        ▼
[6] Kalite geçişi — Marka Sesi Kontrolü  →  ai_runs (stage: quality_pass)
        humanizer'ın 25 desenlik taksonomisinden esinlenilen son kontrol.
        `/humanizer` komutu olarak KURULMUYOR (AI detector bypass ürünleştirmesi
        riskli). Desen listesi kendi son-düzenleme prompt'umuza gömülüyor.
        ▼
content_platforms.status = DRAFT → insan onayına düşer
```

### `brand_strategy` — dış incelemeden eklendi

Positioning/strateji çıktıları artık ham prompt sonucu olarak kaybolmuyor,
versiyonlu bir tabloda kalıcılaşıyor:

| Alan | Neden |
|---|---|
| `brand_id`, `version` | artan versiyon numarası |
| `payload` (JSONB) | positioning, hedef kitle, içerik sütunları, mesajlaşma — **sabit kolon değil**, şekli henüz oturmadığı için JSONB (Ders 2'deki brand_dna kararıyla aynı gerekçe) |
| `source_ai_run_id` | hangi `ai_runs` kaydının ürettiği (izlenebilirlik) |
| `generated_at` | ne zaman üretildi |

### Lisans notu

marketingskills ve humanizer MIT lisanslı. **Literal kopyalamak yerine** her
skill dosyasının çerçevesi Tentamark'ın kendi Brand DNA'sına özel yeniden
yazılıyor — hem kalite hem orijinallik için.

---

## 12.6 Scheduler ve Publisher: Supabase Cron + Queues

**Karar: Supabase Cron (pg_cron) + Supabase Queues (pgmq).** Ayrı Node worker
ve Redis kurulmuyor. Gerekçe: MVP'nin "$50/ay altı" hedefi ve tek ekosistemde
kalma.

Doğrulanmış kısıtlar: cron saniyeden yıla granülarite, SQL/DB fonksiyonu/HTTP
tetikleyebilir; **maksimum 8 eşzamanlı job**, job başına maksimum 10 dakika;
pgmq tam olarak bir kez teslim garantisi verir.

```
[1] dispatcher (dakikada bir)       → zamanı gelen satırları bul, pgmq'ya bas, QUEUED yap
[2] publisher worker (dakikada bir) → kuyruktan oku, connector çağır,
                                       PUBLISHED/FAILED yaz + publish_attempts'e kaydet
[3] token health (günde bir)        → ölü bağlantıları işaretle (social_accounts.last_error),
                                       kullanıcıyı uyar
[4] analytics harvest (günde bir)   → platform_post_id ile metrik çek, analytics_snapshots'a yaz
```

Toplam 4 cron job, 8 limitinin altında.

### Zaman dilimi — dış incelemeden eklendi

`scheduled_at` ve `published_at` her zaman `timestamptz` (UTC) olarak saklanır.
`brands.timezone` (IANA string, ör. `"Europe/Istanbul"`) UI'da gösterim ve
kullanıcı girdisinin UTC'ye çevrilmesi için kullanılır. Veritabanı asla
"kullanıcının saati mi, markanın saati mi" belirsizliğine düşmez — tek gerçek
kaynak UTC, tek görüntüleme kaynağı `brand.timezone`.

**Idempotency:** publisher, yayın öncesi satırı koşullu `UPDATE ... WHERE status
= 'QUEUED'` ile `PUBLISHING`'e çeker. İkinci deneme satırı bulamaz, çift yayın
önlenir.

| Proje | Job altyapısı | Ek servis |
|---|---|---|
| Postiz | Temporal | Evet |
| social-stats | Celery + Redis | Evet |
| TryPost | DB kuyruğu (Laravel) | Hayır |
| OpenPost | Cloudflare Workers | Hayır |
| **Tentamark** | **pg_cron + pgmq** | **Hayır** |

---

## 12.7 Connector mimarisi ve OAuth

### Capability-farkında arayüz — dış incelemeden yeniden tasarlandı

İlk taslak sadece `publish` + `verifyConnection` içeriyordu. Sorun: platform
API'leri eşit değil (ör. LinkedIn kişisel profil API'si sayfa API'sinden çok
daha kısıtlı, her platform post silmeyi desteklemiyor). Sabit bir arayüz
yerine **yetenek bayrakları**:

```ts
interface SocialProvider {
  capabilities: {
    publishing: boolean;
    analytics: boolean;
    deletion: boolean;
    video: boolean;
    image: boolean;
    carousel: boolean;
  };

  publish(contentPlatform, freshToken): Promise<{ remoteId: string }>;
  verifyConnection(account): Promise<{ healthy: boolean }>;
  refreshToken(account): Promise<{ token: string; expiresAt: Date }>;
  getAnalytics(remoteId, freshToken): Promise<AnalyticsSnapshot>;
  validateMedia(media, capabilities): Promise<{ valid: boolean; reason?: string }>;
}
```

MVP'de bu 5 metot yeterli. `deletePost`, `getPost`, `authorize` gibi ek metotlar
gerçekten ihtiyaç doğduğunda eklenir (YAGNI — ilk taslakta 9 metot önerilmişti,
kullanılmayanı şimdiden yazmıyoruz).

**Token deseni:** OpenPost'un yaklaşımı izleniyor — publisher token'ı kendi
içinde saklamaz, yayın anında merkezi bir credential kaynağından **taze çeker**.

---

## 12.8 Medya işleme

**Açık karar.** Platform başına aspect ratio/süre/codec dönüşümü Edge Function
sınırları içinde mi yapılacak yoksa harici bir servise mi devredilecek, henüz
belirlenmedi.

Karar verildiğinde hedef şekil netleşti (dış inceleme): `media` tablosu orijinal
dosyayı tutar, `media_variants` platform-şekilli render'ları tutar (ör. Instagram
1080×1350, TikTok 1080×1920). Böylece aynı dosya her yayında yeniden
dönüştürülmez. Bu tablo, medya işleme **nerede** yapılacağı netleşmeden inşa
edilmiyor — önce yer kararı, sonra şema.

---

## 12.9 RLS ve güvenlik

Her tabloda RLS açık. Üyelik üzerinden izolasyon:

```sql
alter table public.content enable row level security;

create policy "org members read content"
on public.content
for select to authenticated
using (
  brand_id in (
    select b.id from public.brands b
    join public.organization_members m on m.organization_id = b.organization_id
    where m.user_id = (select auth.uid())
  )
);
```

Kurallar:
- `TO authenticated` tek başına yetmez, `USING` içinde sahiplik şartı zorunlu
- UPDATE için hem `USING` hem `WITH CHECK` gerekir
- UPDATE, SELECT policy'si de ister (yoksa sessizce 0 satır döner)
- `auth.uid()` her zaman `(select auth.uid())` sarmalı (performans)
- `user_metadata` yetkilendirmede **kullanılmaz**
- `auth.role()` kullanılmaz, deprecated
- Token'lar frontend'e hiç gitmez, Data API'ye açılmaz

**Token şifreleme:** RLS'e güvenilmez, uygulama katmanında **Fernet ile
per-brand** şifreleme uygulanır (social-stats'ın deseni).

**`audit_logs` erişimi:** organizasyon üyeleri kendi organizasyonlarının
kayıtlarını okuyabilir (SELECT policy), ama satır **sadece sunucu tarafından
(service role) yazılır** — client'tan doğrudan INSERT yok. `UPDATE`/`DELETE`
policy'si hiç tanımlanmaz (denetim kaydı değiştirilemez olmalı).

---

## 12.10 Takvim kütüphanesi

**Öneri: SVAR React Calendar.** MIT çekirdek, TypeScript yerli destekli, resmi
Next.js rehberi var, iCal içe/dışa aktarım var. `react-scheduled-calendar`
elendi (1 yıldız, hobi projesi). FullCalendar alternatif ama premium görünümler
ayrı lisans ister.

Kesinleşmeden önce küçük bir prototip önerilir.

---

## 12.11 Frontend bağlantı noktaları

```
app/
  (auth)/
  dashboard/
    compose/      içerik üretme ve düzenleme
    posts/        liste görünümü, durum filtreleri
    calendar/     takvim görünümü, sürükle bırak
    analytics/    performans ve AI önerileri
  settings/
```

```
Brand DNA + geçmiş performans → AI taslakları üretir (§12.5)
        → Instagram/Facebook/LinkedIn sürümleri (düzenlenebilir)
        → İnsan onayı  ← ürünün çekirdek vaadi
        → Zamanla
```

RHF + Zod form/doğrulama için. Tasarım sistemi detayları için `11-design-system.md`.

---

## 12.12 Yapmayacaklarımız

| Yapmıyoruz | Neden |
|---|---|
| Node tabanlı otomasyon/workflow motoru | TryPost kurdu, 3.5 ayda sildi |
| Sıfırdan takvim bileşeni | Hazır olgun çözüm varken gerekmiyor |
| Ayrı Node worker + Redis | MVP maliyet hedefini bozar |
| Temporal / Celery gibi ayrı job altyapısı | Bizim ölçeğimizde erken |
| Marka başına cron job | 8 eşzamanlı job limitine takılır |
| 12 platform | MVP'de 3 platform |
| Unified inbox | Bizim vaadimiz değil |
| Video üretimi (MVP'de) | seedance-2.0 bile sadece planlama yapıyor — V2/V3 adayı |
| Higgsfield tarzı tarayıcı otomasyonu | Lisanssız + API değil, üretim riski taşır |
| `/humanizer` komutunu ürün özelliği yapmak | "AI detector bypass" ürünleştirmesi olur |
| **`approval_requests` ayrı varlık (MVP'de)** | Tek kullanıcılı/küçük ekip MVP'de `status` alanı yeterli. Ekip özelliği gelince eklenir, `audit_logs` zaten temeli hazırlıyor |
| **`webhook_events` (MVP'de)** | Analytics cron ile çekiliyor (push değil, pull). MVP'de tüketilecek bir webhook yok |
| **Tam `media_variants` pipeline'ı** | Medya işleme "nerede" kararı (§12.8) netleşmeden şema kurulmuyor |

---

## 12.13 Uçtan uca akış

```
1. Marka onboarding
   Kullanıcı sektör, ton, renk, yasaklı konu girer → brand_dna yazılır

2. Hesap bağlama
   OAuth ile Instagram/Facebook/LinkedIn bağlanır → social_accounts
   → audit_logs: SOCIAL_ACCOUNT_CONNECTED

3. Haftalık döngü başlar
   AI İçerik Zekası (§12.5) → içerik fikirleri + platform taslakları üretir
   → content + content_media + content_platforms (status: DRAFT)
   → her adım ai_runs'a loglanır

4. İnsan onayı
   Kullanıcı inceler, düzenler, onaylar → status: APPROVED → SCHEDULED
   → audit_logs: CONTENT_APPROVED

5. Yayın
   Scheduler (§12.6) zamanı gelince kuyruğa alır, publisher yayınlar
   → platform_post_id yazılır, status: PUBLISHED, publish_attempts'e kaydedilir
   → audit_logs: CONTENT_PUBLISHED

6. Analitik toplama
   Cron, platform_post_id ile metrik çeker → analytics_snapshots

7. Öğrenme
   Bir sonraki haftanın İçerik Stratejisi katmanı (§12.5 adım 3) geçmiş
   performansı okur → brand_strategy'nin yeni versiyonu → somut öneriler üretir

   → adım 3'e geri döner, döngü kapanmaz
```

---

## 12.14 Sistem sonunda elimizde ne olacak

- [ ] Marka başına yapılandırılmış kimlik (Brand DNA) — serbest metin değil, JSON
- [ ] 3 platform ile OAuth bağlantısı, token sağlığı izleme ve otomatik uyarı
- [ ] Marka bağlamından + geçmiş performanstan beslenen, hiyerarşik prompt zinciriyle üretilen içerik fikirleri
- [ ] Platform başına otomatik uyarlanmış metin (tek fikir → çoklu varyant)
- [ ] Üretilen her metnin yayına gitmeden önce geçtiği marka-sesi kalite kontrolü
- [ ] İnsan onayı olmadan hiçbir içeriğin yayınlanamadığı bir onay kapısı
- [ ] Platform başına bağımsız durum takibi
- [ ] **Normalize edilmiş hata kodlarıyla akıllı retry** (backoff + kullanıcı aksiyonu ayrımı)
- [ ] **Her yayın denemesinin tam geçmişi** (`publish_attempts`)
- [ ] Veritabanı-içi zamanlayıcı ve kuyruk, idempotent yayın, **doğru zaman dilimi işleme**
- [ ] Yayınlanan her içeriğin performansının periyodik olarak toplanıp saklanması
- [ ] Geçmiş performansın bir sonraki haftanın stratejisine somut geri beslemesi (**versiyonlu `brand_strategy`**)
- [ ] **AI üretiminin tam izlenebilirliği** (`ai_runs`, prompt versiyonlama, maliyet/gecikme ölçümü)
- [ ] **Kim-ne-yaptı denetim kaydı** (`audit_logs`)
- [ ] **Hafif kampanya gruplama** (metrikleri analytics'ten türeyen, ayrı tablo yükü olmayan)
- [ ] Marka bazında tam veri izolasyonu (RLS, her tablo)
- [ ] Token'ların uygulama katmanında per-marka şifrelenmesi
- [ ] **Platform yeteneklerine duyarlı connector mimarisi** (her platform aynı şeyi desteklemiyor)
- [ ] Sürükle-bırak destekli, iCal uyumlu bir içerik takvimi
- [ ] AI kullanımının marka bazında ölçülmesi

**Bilinçli olarak içermeyecek:** genel amaçlı otomasyon/workflow motoru, unified
inbox, 12 platform desteği, MVP'de video üretimi, ayrı job altyapısı, ayrı
`approval_requests` varlığı, webhook tüketimi, tam medya varyant pipeline'ı.

---

## 12.15 Dış inceleme — kabul edilen ve ertelenen değişiklikler

8 Eylül 2026'da bu dokümanın bir önceki hali dışarıdan (başka bir AI aracı
üzerinden) incelendi, 14 maddelik bir eksik/öneri listesi geldi. Unutulmasın
diye karar gerekçeleriyle burada:

| Öneri | Karar | Gerekçe |
|---|---|---|
| `content_media` pivotu | ✅ Aynen kabul | Gerçek boşluktu |
| Zaman dilimi modeli | ✅ Aynen kabul | Ucuz, klasik bug kaynağı |
| Hata kodu normalizasyonu | ✅ Aynen kabul | Zaten açık karardı, iyi bir cevap |
| `publish_attempts` | ✅ Aynen kabul | content vs content_platforms ayrımıyla aynı desen |
| `audit_logs` | ✅ Aynen kabul | Ucuz, sonradan eklenemez |
| `ai_runs` + prompt versiyonlama | ✅ Aynen kabul | AI katmanı bunsuz debug edilemez |
| `social_accounts` tam alan seti | ✅ Aynen kabul | Zaten cron tasarımımızın (§12.6) ima ettiği alanlar |
| Capability-farkında connector | ✅ Kabul, metot seti küçültüldü | 9 metot yerine MVP'nin kullandığı 5'i |
| `analytics_snapshots` genişletme | ✅ Aynen kabul | Ucuz, ileride pahalı migration'ı önler |
| `campaigns` | 🔧 Kabul, 4 tablo yerine 1 tablo + FK | Metrik ayrı tabloya değil, analytics'ten türer |
| `brand_strategy` | 🔧 Kabul, sabit kolon yerine versiyonlu JSONB | Şekli henüz oturmadı |
| `repurposes` detaylandırma | ✅ Aynen kabul | Zaten var olan tabloyu tamamlıyor |
| `approval_requests` ayrı varlık | ⏸️ MVP'ye ertelendi | Önerinin kendisi de "MVP'de şart değil" diyor |
| `webhook_events` | ⏸️ MVP'ye ertelendi | MVP'de tüketen bir akış yok |
| Tam `media_variants` pipeline'ı | ⏸️ Ertelendi | Medya işleme yer kararı (§12.8) önce netleşmeli |

---

## 12.16 Açık kalan kararlar

1. **`external_account_id` unique kısıtının kapsamı** — marka başına mı (aynı hesap iki markaya bağlanabilir mi), yoksa global mi (bir sosyal hesap sistemde bir kere var olur)? Ajans senaryosu ("bir hesabı iki farklı marka olarak yönetme" ihtimali var mı) netleşmeli.
2. **Medya işleme** — dönüştürme nerede yapılacak (§12.8), `media_variants` şekli buna bağlı.
3. **Takvim prototipi** — SVAR ile FullCalendar arasında küçük bir denemeyle kesinleştirme.
4. **Prompt kütüphanesinin somut içeriği** — marketingskills'ten hangi çerçevelerin nasıl uyarlanacağı, ilk sürümde kaç platform/senaryo kapsanacağı.
5. **Connector capability setinin kesinleşmesi** — Instagram/Facebook/LinkedIn'in gerçek API dokümanlarına bakılınca `capabilities` bayrakları netleşecek.
6. **Billing/subscription modellemesi** — `07-business-model.md`'de fiyatlandırma konseptsel olarak var ama veritabanı şeması hiç tasarlanmadı (muhtemelen çoğu durumu Stripe/Paddle tutar, biz sadece webhook'larını dinleriz — ayrı bir araştırma konusu).
