# AI Marketing Manager --- Proje Teknik ve Ürün Spesifikasyonu

**Tarih:** 7 Eylül 2026\
**Durum:** Araştırılmış ürün/MVP taslağı\
**Hedef:** Marka sahiplerinin sosyal medya içeriklerini AI ile
planlamasını, üretmesini, yayınlamasını ve sonuçlarını analiz etmesini
sağlayan düşük maliyetli bir SaaS.

------------------------------------------------------------------------

## 1. Projenin Tanımı

Bu ürün basit bir "AI post oluşturucu" olarak konumlandırılmamalı.

Ana fikir:

> **Kullanıcının markası için çalışan bir AI Marketing Manager
> oluşturmak.**

Sistem;

1.  Markayı tanır.
2.  Marka kimliği oluşturur.
3.  Sosyal hesapları bağlar.
4.  Geçmiş içerikleri ve performansı toplar.
5.  İçerik fikirleri üretir.
6.  İçerik takvimi oluşturur.
7.  Metin/görsel/video brief'i üretir.
8.  Kullanıcı onayından sonra yayınlar.
9.  Sonuçları toplar.
10. Hangi içeriklerin daha iyi çalıştığını analiz eder.
11. Bir sonraki içerik planını buna göre günceller.

Ana döngü:

**Brand DNA → Strategy → Content → Approval → Publish → Analytics →
Learning → New Strategy**

------------------------------------------------------------------------

# 2. Ürünün Ana Prensibi

## Olması gereken

-   Marka tutarlılığı
-   İnsan onaylı yayınlama
-   Platform bazlı içerik uyarlama
-   İçerik takvimi
-   Otomatik yayınlama
-   Performans analizi
-   AI önerileri
-   OAuth ile güvenli hesap bağlantısı
-   Token yenileme
-   Hata/retry sistemi
-   Platformların farklı yeteneklerini kullanıcıdan gizleyen ortak bir
    içerik modeli

## Olmaması gereken

-   İlk sürümde her platformu desteklemek
-   İlk günden AI video üretimini zorunlu yapmak
-   Kullanıcı onayı olmadan her şeyi otomatik yayınlamak
-   Kullanıcı sosyal medya şifrelerini istemek
-   Platform API'lerini scraping ile taklit etmek
-   Her platforma aynı içeriği birebir göndermek
-   Kullanıcıyı 20+ ayar ile boğmak
-   İlk sürümde reklam yönetimini ana özellik yapmak
-   Gereksiz mikroservis mimarisi kurmak
-   İlk sürümde fine-tuning yapmak

------------------------------------------------------------------------

# 3. Hedef Kullanıcı

İlk hedef kitle:

### A. Küçük işletmeler

-   Kafe
-   Restoran
-   Güzellik merkezi
-   E-ticaret
-   Giyim markası
-   Yerel işletme
-   Eğitim/danışmanlık

### B. Solo girişimciler

-   Freelancer
-   Koç
-   Eğitmen
-   İçerik üreticisi
-   Kişisel marka

### C. Küçük marketing ekipleri

2--5 kişilik ekipler için içerik planlama ve onay sürecini
kolaylaştırabilir.

------------------------------------------------------------------------

# 4. Marka Onboarding

Kullanıcı ilk girişte marka oluşturur.

## Minimum bilgiler

-   Marka adı
-   Logo
-   Marka fotoğrafı / avatar
-   Sektör
-   Web sitesi
-   Ürün/hizmetler
-   Hedef müşteri
-   Marka dili
-   Marka tonu
-   Ana renkler
-   Yasak kelimeler/konular
-   Rakipler

## Opsiyonel

-   Instagram hesabı
-   TikTok hesabı
-   Facebook Page
-   LinkedIn Page
-   YouTube Channel

------------------------------------------------------------------------

# 5. Brand DNA

AI bu bilgilerden yapılandırılmış bir Brand DNA oluşturmalı.

Örnek:

``` json
{
  "brand_name": "Example Coffee",
  "industry": "Coffee Shop",
  "tone": ["friendly", "premium", "warm"],
  "target_audience": {
    "age": "18-35",
    "interests": ["coffee", "lifestyle", "design"]
  },
  "visual_identity": {
    "primary_colors": ["#..."],
    "secondary_colors": ["#..."],
    "style": "minimal, warm, premium"
  },
  "content_rules": {
    "avoid": ["aggressive sales", "political topics"],
    "cta_style": "soft"
  }
}
```

Bu yapı bütün AI işlemlerinde kullanılmalı.

------------------------------------------------------------------------

# 6. Avatar / Marka Karakteri

Kullanıcının marka fotoğrafı/avatarsı ürünün görsel kimliğinin
başlangıcı olabilir.

Ancak:

> Avatar, ürünün ana değeri değildir.

Ana değer marka yönetimidir.

Avatar ileride:

-   AI spokesperson
-   Video presenter
-   Reels karakteri
-   Story karakteri

olarak kullanılabilir.

MVP'de sadece marka görsel kimliği olarak tutulması daha mantıklı.

------------------------------------------------------------------------

# 7. Sosyal Platform API Araştırması

## 7.1 Instagram

### Durum: MVP için güçlü aday

Instagram API, Professional hesaplar için içerik yayınlama ve
medya/metric yönetimi sunuyor.

Önemli kısıt:

-   Consumer/personal Instagram hesapları desteklenmez.
-   Professional hesap gerekir.
-   Facebook Login yaklaşımında Page bağlantısı gereken senaryolar
    vardır.
-   Content Publishing Professional hesaplarda kullanılabilir.
-   Stories tarafında Business hesap kısıtı vardır.

Instagram API ile:

-   Fotoğraf
-   Reel
-   Caption
-   İçerik yayınlama
-   Yorum yönetimi
-   Mention verileri
-   Bazı insight/metric verileri

yönetilebilir.

Kaynak: Meta Instagram API dokümantasyonu:
https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api

Not: Meta'nın API sürümleri ve permission isimleri değişebildiğinden
production öncesi güncel Meta dokümanı tekrar doğrulanmalıdır.

### Karar

**Instagram = MVP'nin ana platformu**

------------------------------------------------------------------------

# 7.2 Facebook Pages

Meta Graph API ekosistemi üzerinden Facebook Pages tarafı yönetilebilir.

Ürün açısından:

-   Page bağlantısı
-   Page içerikleri
-   Yayınlama
-   Engagement/metric tarafı

planlanabilir.

Ancak Facebook Pages ve Instagram aynı Meta ekosisteminde olsa da
izinler ve objeler ayrı modellenmelidir.

### Karar

**Facebook Page = MVP'de Instagram ile birlikte ikinci Meta kanalı**

Kişisel Facebook profilleri hedeflenmemeli.

------------------------------------------------------------------------

# 7.3 TikTok

### Durum: Teknik olarak mümkün fakat en riskli entegrasyonlardan biri

TikTok Content Posting API:

-   Video Direct Post
-   Video Upload/Draft
-   Fotoğraf postları

destekliyor.

Direct Post için:

-   `video.publish` scope
-   Kullanıcı yetkilendirmesi
-   Creator info sorgusu
-   App approval
-   TikTok'un UX gereksinimleri

gerekiyor.

Önemli:

**Unaudited client uygulamalarında yayınlanan içerikler private
görüntüleme ile sınırlandırılabilir.**

TikTok ayrıca kullanıcı access token'ları için rate limit uygular.

Kaynaklar:

https://developers.tiktok.com/docs/en/content-posting-api-get-started

https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post

https://developers.tiktok.com/docs/en/content-posting-api-reference-photo

https://developers.tiktok.com/docs/en/content-sharing-guidelines

### Karar

**TikTok = MVP'den sonra, fakat mimaride baştan connector olarak
tasarlanmalı.**

------------------------------------------------------------------------

# 7.4 YouTube

### Durum: Teknik olarak güçlü

YouTube Data API ile:

-   Video upload
-   Başlık
-   Açıklama
-   Tag
-   Privacy
-   Schedule
-   Thumbnail gibi işlemler

yapılabilir.

`videos.insert` video yükleme için kullanılabilir.

Ancak önemli kısıt:

> 28 Temmuz 2020 sonrası oluşturulan doğrulanmamış API projelerinde
> yüklenen videolar private görüntüleme moduyla sınırlanabilir. Bu
> kısıtı kaldırmak için API projesinin audit sürecinden geçmesi gerekir.

Ayrıca YouTube API'de quota sistemi vardır.

Resmi dokümana göre:

-   Default quota: 10.000 unit/day
-   `videos.insert`: 1600 quota
-   `videos.insert` için ayrıca günlük 100 çağrı sınırı belirtiliyor.

Kaynak:

https://developers.google.com/youtube/v3/docs/videos/insert

https://developers.google.com/youtube/v3/determine_quota_cost

### Analytics

YouTube Analytics API ile:

-   Views
-   Likes
-   Comments
-   Shares
-   Watch time
-   Average view duration
-   Subscribers gained/lost
-   Revenue gibi metrikler alınabilir.

Kaynak:

https://developers.google.com/youtube/analytics/metrics

### Karar

**YouTube = V2**

MVP'de analytics entegrasyonu yerine yayınlama veya planlama temel
düzeyde ele alınabilir.

------------------------------------------------------------------------

# 7.5 LinkedIn

### Durum: Teknik olarak mümkün ve B2B için değerli

LinkedIn Posts API:

-   Text
-   Image
-   Video
-   Document
-   Article
-   Multi-image gibi içerikleri destekler.

`Posts API`, eski `ugcPosts` yaklaşımının yerini almıştır.

Üyeler için:

-   `w_member_social`

Organizasyonlar için:

-   `w_organization_social`

izinleri kullanılabilir.

Organization posting, kullanıcının ilgili LinkedIn Page üzerinde uygun
role sahip olmasını gerektirir.

Kaynak:

https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

### Karar

**LinkedIn = MVP'de olabilir.**

Özellikle B2B/AI/SaaS müşterileri hedeflenecekse değerli.

------------------------------------------------------------------------

# 7.6 X / Twitter

İlk sürüm için önerilmez.

Neden:

-   API maliyetleri
-   Plan bağımlılığı
-   Değişken API politikaları
-   MVP'nin ana değerini oluşturmaması

### Karar

**V3+**

------------------------------------------------------------------------

# 7.7 Threads

Meta ekosisteminde olması nedeniyle ileride değerlendirilebilir.

Ancak ilk sürümde Instagram + Facebook + LinkedIn kombinasyonu daha
mantıklıdır.

### Karar

**V2/V3**

------------------------------------------------------------------------

# 8. Platform Önceliklendirmesi

  Platform           Publish          Analytics   API Riski   Öncelik
  ---------------- --------- ------------------ ----------- ---------
  Instagram             Evet               Evet        Orta        P0
  Facebook Pages        Evet               Evet        Orta        P0
  LinkedIn              Evet               Evet        Orta     P0/P1
  TikTok                Evet   Kısmi/ürüne göre      Yüksek        P1
  YouTube               Evet               Evet        Orta        P1
  Threads               Evet           Değişken        Orta        P2
  X                     Evet           Değişken      Yüksek        P3

------------------------------------------------------------------------

# 9. Ortak Social Connector Mimarisi

Platformları doğrudan business logic'e bağlama.

Her platform için connector oluştur.

``` text
SocialProvider
├── InstagramProvider
├── FacebookProvider
├── LinkedInProvider
├── TikTokProvider
└── YouTubeProvider
```

Ortak interface:

``` text
connect()
disconnect()
refreshToken()
getProfile()
createDraft()
publishPost()
schedulePost()
getPost()
getAnalytics()
```

Her provider bu interface'i kendi API'sine çevirir.

Böylece TikTok API değişirse tüm sistem bozulmaz.

------------------------------------------------------------------------

# 10. İçerik Veri Modeli

Platform bağımsız bir içerik modeli oluştur.

``` json
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

------------------------------------------------------------------------

# 11. İçerik Durumları

İçerik yaşam döngüsü:

``` text
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

``` text
PUBLISHING
 ↓
FAILED
 ↓
RETRY / USER_ACTION
```

------------------------------------------------------------------------

# 12. AI Marketing Engine

AI tek bir prompt olmamalı.

Modüler olmalı.

## Agent/Service 1 --- Brand Analyst

Brand DNA oluşturur.

## Agent/Service 2 --- Strategy Planner

Haftalık/aylık içerik stratejisi çıkarır.

## Agent/Service 3 --- Content Ideator

İçerik fikirleri üretir.

## Agent/Service 4 --- Copywriter

Platforma özel metin üretir.

## Agent/Service 5 --- Visual Director

Görsel brief oluşturur.

## Agent/Service 6 --- Performance Analyst

Geçmiş içerikleri analiz eder.

## Agent/Service 7 --- Recommendation Engine

"Sonraki hafta ne yapmalıyız?" sorusuna cevap verir.

------------------------------------------------------------------------

# 13. AI'ın İlk Sürümde Yapması Gerekenler

Kullanıcı:

> "Bu hafta markam için içerik hazırla."

dediğinde sistem:

1.  Brand DNA'yı alır.
2.  Geçmiş performansı inceler.
3.  Platformları kontrol eder.
4.  İçerik hedeflerini belirler.
5.  7 günlük içerik planı çıkarır.
6.  Platformlara özel içerik üretir.
7.  Kullanıcıya gösterir.
8.  Kullanıcı onaylar.
9.  Scheduler yayınlar.
10. Analytics sistemi sonuçları toplar.

------------------------------------------------------------------------

# 14. İçerik Takvimi

Dashboard'ın merkezinde Content Calendar bulunmalı.

Örnek:

``` text
MON
Instagram Reel       10:00
LinkedIn Post        14:00

TUE
Instagram Story      19:00

WED
TikTok Video         18:00

THU
LinkedIn Post        12:00

FRI
Instagram Reel       20:00
```

Her içerik:

-   Draft
-   Approved
-   Scheduled
-   Published
-   Failed

durumlarından birinde olmalı.

------------------------------------------------------------------------

# 15. Platforma Özel İçerik

Aynı içerik bütün platformlara aynen gönderilmemeli.

Örneğin:

### Instagram

Kısa caption + emoji + hook + CTA

### LinkedIn

Profesyonel anlatım + insight + discussion CTA

### TikTok

Kısa hook + hızlı açıklama + hashtag

### YouTube

Title + description + tags

AI aynı kampanyadan platforma özel versiyonlar üretmeli.

------------------------------------------------------------------------

# 16. İçerik Üretimi

## MVP

### Metin

AI ile:

-   Caption
-   Hook
-   CTA
-   Hashtag
-   LinkedIn post
-   Video script
-   Content idea

üret.

### Görsel

İlk sürümde iki seçenek:

1.  Kullanıcı görsel yükler.
2.  AI görsel üretimi opsiyonel olarak kullanılır.

### Video

MVP'de AI video üretimini zorunlu özellik yapma.

Kullanıcı:

-   MP4 yükleyebilir.
-   AI script oluşturabilir.
-   AI caption oluşturabilir.
-   Videoyu platform formatına hazırlayabilir.

Bu yaklaşım maliyeti ciddi şekilde düşürür.

------------------------------------------------------------------------

# 17. AI Görsel Üretimi

Görsel üretimini provider abstraction ile yap.

``` text
ImageGenerator
├── OpenAI
├── ExternalProvider
└── FutureProvider
```

Böylece tek sağlayıcıya kilitlenmezsin.

Görsel üretimi kullanıcı planına göre limitlenebilir.

Örnek:

``` text
Free:
5 AI images / month

Pro:
50 AI images / month

Business:
200 AI images / month
```

------------------------------------------------------------------------

# 18. Analytics

Platformlardan gelen metrikler ortak modele dönüştürülmeli.

``` text
ContentAnalytics

views
likes
comments
shares
saves
reach
engagement_rate
clicks
followers_gained
watch_time
```

Platformların desteklemediği metric:

``` text
null
```

olabilir.

Asla sahte/uydurulmuş metric gösterme.

------------------------------------------------------------------------

# 19. AI Performance Loop

En önemli özelliklerden biri.

Örnek:

``` text
Son 30 gün

18 içerik
142K views
4.8% engagement

En başarılı:
"5 hata..."

AI analizi:

- Hook güçlü
- İlk 3 saniye iyi
- Eğitim içerikleri daha iyi
- 18-24 yaş kitlesinde daha yüksek engagement
```

Sonra:

> "Gelecek hafta 3 eğitim odaklı Reel öneriyorum."

AI sadece içerik üretmemeli.

**Sonuçlardan öğrenmeli.**

------------------------------------------------------------------------

# 20. Approval Sistemi

Otomatik yayınlama kullanıcıya bırakılmalı.

Varsayılan:

``` text
AI generated
      ↓
User review
      ↓
Approve
      ↓
Schedule
      ↓
Publish
```

İleri planda:

``` text
Auto-publish mode
```

eklenebilir.

Ancak kullanıcı bunu açıkça aktif etmeli.

------------------------------------------------------------------------

# 21. Scheduler

Backend scheduler:

``` text
Scheduled Job
     ↓
Check content
     ↓
Check platform token
     ↓
Check media
     ↓
Publish
     ↓
Save response
     ↓
Update status
```

Gerekli:

-   Retry
-   Exponential backoff
-   Idempotency
-   Error logging
-   Timezone
-   Platform rate-limit handling

------------------------------------------------------------------------

# 22. OAuth / Token Yönetimi

Kullanıcı sosyal medya şifresini kesinlikle istemiyoruz.

Akış:

``` text
Connect Instagram
        ↓
OAuth
        ↓
Authorization
        ↓
Access Token
        ↓
Encrypt / secure storage
        ↓
Refresh when necessary
```

Tokenlar:

-   DB'de plain text tutulmamalı.
-   Loglara yazılmamalı.
-   Frontend'e gereksiz şekilde gönderilmemeli.

------------------------------------------------------------------------

# 23. Önerilen Teknik Stack

Maliyeti düşük tutmak için:

## Frontend

**Next.js + TypeScript**

Neden:

-   SaaS dashboard için uygun
-   SEO
-   React ekosistemi
-   Tek proje
-   Kolay deploy

## Backend

İki seçenek:

### Seçenek A --- Önerilen

**Next.js API + Supabase Edge Functions**

MVP için en düşük operasyon maliyeti.

### Seçenek B

**Node.js + Fastify/NestJS**

Platform entegrasyonları ve queue sistemi büyüdüğünde daha rahat
olabilir.

Başlangıçta A tercih edilebilir.

------------------------------------------------------------------------

# 24. Database

**Supabase PostgreSQL**

Tablolar:

``` text
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

Supabase güncel fiyatlandırmasında Free plan \$0; Pro plan \$25/aydan
başlıyor. Free planda 500 MB DB, 1 GB storage ve 5 GB egress gibi
limitler bulunuyor.

Kaynak: https://supabase.com/pricing

------------------------------------------------------------------------

# 25. Storage

Media için:

### MVP

Supabase Storage

Avantaj:

-   Aynı ekosistem
-   Basit auth
-   PostgreSQL
-   Storage
-   Edge Functions

İleride:

Cloudflare R2 / S3 benzeri object storage'a geçilebilir.

------------------------------------------------------------------------

# 26. Queue / Job Sistemi

MVP:

Supabase Edge Functions + scheduled jobs.

Büyüyünce:

``` text
Redis
+
BullMQ
```

veya managed queue.

İlk günden Redis kurmak zorunlu değil.

------------------------------------------------------------------------

# 27. AI Model Stratejisi

Tek model kullanma.

### Cheap model

-   İçerik fikirleri
-   Classification
-   Tagging
-   Basit rewriting
-   Analytics summary

### Strong model

-   Brand strategy
-   Complex content strategy
-   Final copy
-   Performance reasoning

Maliyeti kontrol etmek için AI kullanımını görev bazlı ayır.

------------------------------------------------------------------------

# 28. AI Maliyet Stratejisi

Güncel OpenAI API fiyatlandırmasında düşük maliyetli GPT-5.6 Luna modeli
için:

-   Input: \$0.20 / 1M token
-   Output: \$1.20 / 1M token

olarak listeleniyor.

Kaynak: https://openai.com/api/

Bu nedenle metin tabanlı AI işlemleri doğru cache ve model seçimiyle
SaaS'ın ana maliyet problemi olmayabilir.

Asıl maliyet potansiyeli:

-   AI image generation
-   AI video generation
-   Video processing
-   Storage
-   Bandwidth

tarafında olacaktır.

------------------------------------------------------------------------

# 29. Maliyeti Düşürmek İçin Temel Kararlar

## Yap

-   Text AI'ı ucuz modelle çalıştır.
-   Brand DNA'yı her istekte yeniden oluşturma.
-   Cache kullan.
-   Aynı görseli tekrar üretme.
-   AI generation limitleri koy.
-   Kullanıcı başına usage tracking yap.
-   Video generation'ı MVP'den çıkar.
-   Storage lifecycle kullan.
-   Media'yı gereksiz çoğaltma.
-   Webhook/event varsa polling yerine kullan.
-   Analytics'i sürekli değil, periyodik çek.

## Yapma

-   Her butona AI çağrısı koyma.
-   Her sayfa açılışında AI çalıştırma.
-   Her platform için ayrı AI çağrısı yapma.
-   Aynı içeriği 5 defa baştan üretme.

------------------------------------------------------------------------

# 30. Tahmini MVP Aylık Maliyet

Erken aşamada:

``` text
Domain                    ~$10-20/year
Supabase                  $0
Frontend hosting          $0-$20
AI text                   ~$5-$30
Storage                   $0-$10
Email                     $0-$10
Monitoring                $0

TOPLAM
≈ $5-$70 / month
```

Gerçek maliyet kullanıcı sayısı ve AI kullanımına bağlıdır.

İlk MVP için hedef:

> **\$50/ay altında çalışabilecek mimari**

olmalı.

Üretim trafiği artınca Supabase Pro ve ek servisler devreye alınabilir.

Supabase Pro güncel olarak \$25/aydan başlıyor. Pro planında ayrıca
kullanım bazlı maliyetler bulunabiliyor.

------------------------------------------------------------------------

# 31. MVP'de Olması Gerekenler

## P0

### Authentication

-   Email
-   Google OAuth

### Brand

-   Brand oluştur
-   Logo
-   Marka bilgileri
-   Brand DNA

### Social

-   Instagram
-   Facebook Page
-   LinkedIn

### Content

-   AI idea generation
-   AI caption
-   AI post
-   Image upload
-   Basic image generation
-   Content preview

### Calendar

-   Weekly calendar
-   Monthly calendar
-   Schedule

### Publishing

-   Publish now
-   Schedule publish
-   Publish status
-   Retry

### Analytics

-   Basic metrics
-   Content performance
-   Top posts

### AI

-   Weekly recommendations
-   Content suggestions

------------------------------------------------------------------------

# 32. MVP'de Olmaması Gerekenler

Şimdilik çıkar:

-   AI video generation
-   AI avatar videos
-   Full ad management
-   CRM
-   Email marketing
-   WhatsApp marketing
-   Competitor scraping
-   Advanced social listening
-   Sentiment analysis
-   Influencer marketplace
-   Team approval workflows
-   White label
-   Mobile app
-   Fine-tuning
-   RAG
-   Complex agent swarm

Bunların hepsi ürünün ilerleyen sürümlerine bırakılabilir.

------------------------------------------------------------------------

# 33. V1 Yol Haritası

## Phase 1 --- Foundation

-   Next.js
-   Supabase
-   Auth
-   Brand model
-   Database
-   Dashboard

## Phase 2 --- Brand AI

-   Brand onboarding
-   Brand DNA
-   AI strategy
-   Content ideas

## Phase 3 --- Content

-   Content editor
-   Media upload
-   AI copy
-   Calendar

## Phase 4 --- Social

-   Instagram
-   Facebook
-   LinkedIn
-   OAuth
-   Publish

## Phase 5 --- Analytics

-   Metrics
-   Content performance
-   AI recommendations

## Phase 6 --- Beta

-   10--20 test customer
-   Usage tracking
-   API failures
-   Cost measurement
-   UX improvements

------------------------------------------------------------------------

# 34. V2

Eklenebilir:

-   TikTok
-   YouTube
-   Threads
-   AI image generation
-   Better analytics
-   Competitor research
-   Content repurposing
-   Automatic weekly plans
-   Approval workflows

------------------------------------------------------------------------

# 35. V3

Daha ileri özellikler:

-   AI video generation
-   AI avatar
-   Voice generation
-   Social listening
-   Trend detection
-   Automated campaigns
-   Ads
-   A/B testing
-   Advanced team features

------------------------------------------------------------------------

# 36. En Önemli Ürün Özelliği: Content Repurposing

Tek bir fikirden:

``` text
ONE IDEA

       ↓

Instagram Reel
       ↓
TikTok
       ↓
YouTube Short
       ↓
LinkedIn Post
       ↓
Instagram Story
       ↓
Facebook Post
```

üretmek.

Ancak içerikler platforma göre yeniden yazılmalı.

Bu özellik kullanıcıya çok ciddi zaman kazandırır.

------------------------------------------------------------------------

# 37. AI Marketing Plan

Kullanıcı:

> "Önümüzdeki hafta markam için plan yap."

dediğinde:

``` text
Brand DNA
   +
Past Performance
   +
Available Platforms
   +
Business Goals
   +
Content History
        ↓
   AI STRATEGY
        ↓
Content Calendar
```

çıktısı:

``` text
7 Days
12 Content Pieces

4 Reels
2 LinkedIn
3 Stories
2 Facebook
1 TikTok
```

Kullanıcı:

**Approve all**

dediğinde scheduler devreye girer.

------------------------------------------------------------------------

# 38. Kullanıcı Hedefi

Ürün kullanıcıya şunu hissettirmeli:

> "Sosyal medya için ne paylaşacağımı düşünmek zorunda değilim."

ve daha ileri:

> "Marketing ekibim yok ama AI Marketing Manager'ım var."

Bu ürünün ana değer önerisi olmalı.

------------------------------------------------------------------------

# 39. En Büyük Teknik Riskler

## 1. Platform API değişiklikleri

Özellikle:

-   TikTok
-   Meta
-   LinkedIn

API izinleri ve review süreçleri değişebilir.

## 2. OAuth

Token expire/refresh problemleri.

## 3. Media formatları

Her platform farklı:

-   aspect ratio
-   file size
-   duration
-   codec
-   resolution

gerektirebilir.

## 4. Rate limits

Her platform için ayrı rate limiter gerekir.

## 5. App review

Production yayınlama yetenekleri için platform onayı gerekebilir.

## 6. AI maliyetleri

Özellikle image/video.

------------------------------------------------------------------------

# 40. En Büyük Ticari Risk

Rakiplerin olması değil.

Asıl risk:

> **Platformlara bağımlı olmak.**

Instagram API bugün bir şeyi destekler, yarın permission değişebilir.

Bu nedenle ürünün değeri sadece:

"Instagram'a post atıyorum"

olmamalı.

Değer:

-   Brand intelligence
-   Strategy
-   Content planning
-   Analytics
-   AI recommendations

olmalı.

Platformlar değişse bile bu çekirdek değer kalır.

------------------------------------------------------------------------

# 41. Önerilen Mimari

``` text
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

------------------------------------------------------------------------

# 42. Database İlişkileri

``` text
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

------------------------------------------------------------------------

# 43. Güvenlik

Kesinlikle:

-   OAuth
-   Encryption at rest
-   Token encryption
-   HTTPS
-   Row Level Security
-   Rate limiting
-   Audit logs
-   Secure secrets
-   No social password storage
-   No access token logging

kullanılmalı.

Supabase kullanılırsa RLS aktif tutulmalı.

------------------------------------------------------------------------

# 44. Kullanıcı Yetki Modeli

MVP:

``` text
Owner
```

yeterli.

V2:

``` text
Owner
Admin
Editor
Viewer
```

eklenebilir.

------------------------------------------------------------------------

# 45. Monetizasyon

Basit subscription:

## Free

\$0

-   1 brand
-   1 social connection
-   5 AI contents/month
-   Basic calendar
-   Limited analytics

## Starter

\$9--15/month

-   1--2 brands
-   3--5 social accounts
-   50 AI contents
-   Scheduling
-   Analytics

## Pro

\$29--49/month

-   5 brands
-   More AI usage
-   All platforms
-   Advanced analytics
-   AI strategy
-   Auto publishing

## Business

\$79+

-   Team
-   Multiple brands
-   Higher limits
-   Approval workflows
-   Advanced analytics

Fiyatlar test edilmelidir; başlangıçta düşük fiyatla gerçek kullanım
ölçülmeli.

------------------------------------------------------------------------

# 46. Kullanım Bazlı AI Maliyeti

Subscription içinde sınırsız AI vermek riskli.

Örneğin:

``` text
AI credits
```

kullanılabilir.

``` text
1 content generation = 1 credit
1 image = 3 credits
1 long analysis = 2 credits
1 video = 20+ credits
```

Böylece maliyet kontrol edilir.

------------------------------------------------------------------------

# 47. İlk Beta Testi

İlk kullanıcılar:

-   3 kafe
-   3 e-commerce
-   3 freelancer
-   3 küçük SaaS/startup
-   3 kişisel marka

gibi farklı kategorilerden seçilebilir.

Toplam:

**10--20 kullanıcı**

yeterli.

Ölçülecek:

-   Haftada kaç içerik üretiyor?
-   AI önerilerini kullanıyor mu?
-   Gerçekten yayınlıyor mu?
-   Hangi platformu bağlıyor?
-   Kaç dakika zaman kazanıyor?
-   AI içeriklerini düzenliyor mu?
-   Ödeme yapmaya hazır mı?

------------------------------------------------------------------------

# 48. Başarı Metricleri

Ana metric:

> **Published AI-assisted content / active brand / month**

Diğerleri:

-   Connected accounts
-   Generated contents
-   Approved contents
-   Published contents
-   Failed publications
-   AI acceptance rate
-   Average editing time
-   Weekly active brands
-   Retention
-   MRR
-   AI cost per customer

------------------------------------------------------------------------

# 49. MVP Başarı Kriteri

MVP başarılı sayılmalı eğer:

1.  Kullanıcı 5 dakikadan kısa sürede marka oluşturabiliyor.
2.  En az bir sosyal hesabını bağlayabiliyor.
3.  AI bir haftalık plan çıkarabiliyor.
4.  Kullanıcı planı düzenleyebiliyor.
5.  İçeriği onaylayabiliyor.
6.  Sistem içeriği zamanında yayınlayabiliyor.
7.  Performansı dashboard'da gösterebiliyor.
8.  AI sonraki önerilerini geçmiş performansa göre değiştirebiliyor.

------------------------------------------------------------------------

# 50. Kritik Ürün Kararı

## Ürün:

**AI Content Generator ❌**

## Ürün:

**AI Social Media Scheduler ❌**

## Ürün:

**AI Marketing Manager ✅**

Bu ayrım markalaşma açısından çok önemli.

------------------------------------------------------------------------

# 51. İlk Sürüm İçin Net Kapsam

### Kullanıcı

``` text
Sign up
 ↓
Create Brand
 ↓
Upload Logo
 ↓
Describe Business
 ↓
AI creates Brand DNA
```

### Sosyal

``` text
Connect Instagram
Connect Facebook
Connect LinkedIn
```

### AI

``` text
Generate weekly strategy
 ↓
Generate content ideas
 ↓
Generate posts
 ↓
Generate captions
```

### User

``` text
Review
 ↓
Edit
 ↓
Approve
```

### System

``` text
Schedule
 ↓
Publish
 ↓
Collect metrics
 ↓
Analyze
 ↓
Recommend next content
```

Bu döngü ürünün ilk gerçek versiyonudur.

------------------------------------------------------------------------

# 52. Sonuç

Bu proje teknik açıdan yapılabilir.

Ancak başarısı "kaç tane API bağladığımızla" değil:

> **AI'ın markayı ne kadar iyi anlayıp sürekli daha iyi pazarlama
> önerileri üretebildiğiyle**

belirlenecek.

Bu yüzden geliştirme sırası:

``` text
Brand Intelligence
        ↓
Content Strategy
        ↓
Content Generation
        ↓
Publishing
        ↓
Analytics
        ↓
Learning
```

olmalı.

İlk hedef:

> **Instagram + Facebook + LinkedIn + AI + Calendar + Analytics**

ile çalışan sağlam bir MVP.

TikTok ve YouTube mimaride desteklenmeli ama ilk aşamada ürünün tamamını
bunlara bağımlı hale getirmemeli.

AI video, avatar, reklam ve ileri otomasyon ise kullanıcıların gerçekten
talep ettiği kanıtlandıktan sonra eklenmeli.

------------------------------------------------------------------------

# 53. Resmi Kaynaklar

-   Meta / Instagram API:
    https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
-   TikTok Content Posting API:
    https://developers.tiktok.com/docs/en/content-posting-api-get-started
-   TikTok Direct Post:
    https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post
-   TikTok Photo Posting:
    https://developers.tiktok.com/docs/en/content-posting-api-reference-photo-post
-   TikTok Guidelines:
    https://developers.tiktok.com/docs/en/content-sharing-guidelines
-   LinkedIn Posts API:
    https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
-   YouTube Videos Insert:
    https://developers.google.com/youtube/v3/docs/videos/insert
-   YouTube Quota:
    https://developers.google.com/youtube/v3/determine_quota_cost
-   YouTube Analytics:
    https://developers.google.com/youtube/analytics/metrics
-   Supabase Pricing: https://supabase.com/pricing
-   OpenAI API Pricing: https://openai.com/api/

------------------------------------------------------------------------

## Final Architecture Decision

**Recommended MVP stack:**

``` text
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

**Primary product promise:**

> **"Markanız için ne paylaşacağınızı düşünmeyin. AI Marketing
> Manager'ınız planlasın, hazırlasın, yayınlasın ve sonuçlardan
> öğrenerek bir sonraki planı geliştirsin."**
