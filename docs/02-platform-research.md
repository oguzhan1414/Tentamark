# 2. Sosyal Platform API Araştırması

> Kaynak: `ai-marketing-manager-project-spec.md` bölüm 7 (7.1–7.7), 8, 9, 53. Bkz. [00-README.md](00-README.md) için doküman haritası.

## 2.1 Instagram

### Durum: MVP için güçlü aday

Instagram API, Professional hesaplar için içerik yayınlama ve medya/metric yönetimi sunuyor.

Önemli kısıt:

- Consumer/personal Instagram hesapları desteklenmez.
- Professional hesap gerekir.
- Facebook Login yaklaşımında Page bağlantısı gereken senaryolar vardır.
- Content Publishing Professional hesaplarda kullanılabilir.
- Stories tarafında Business hesap kısıtı vardır.

Instagram API ile: fotoğraf, reel, caption, içerik yayınlama, yorum yönetimi, mention verileri, bazı insight/metric verileri yönetilebilir.

Kaynak: [Meta Instagram API dokümantasyonu](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api)

Not: Meta'nın API sürümleri ve permission isimleri değişebildiğinden production öncesi güncel Meta dokümanı tekrar doğrulanmalıdır.

### Karar

**Instagram = MVP'nin ana platformu**

> **Not (eklenen değerlendirme):** Bu bölümde geçmeyen ama onboarding'i doğrudan etkileyen bir kısıt var: IG Graph API'de çoğu publish/insight işlemi, Instagram hesabının bir Facebook Page'e bağlı olmasını gerektirir. Küçük işletme kullanıcıları için "önce bir FB Page oluştur/bağla, sonra IG'yi ona linkle" adımı ciddi bir onboarding sürtünmesi. Ayrıca app review gereksinimi için bkz. [08-critical-risks.md](08-critical-risks.md).

## 2.2 Facebook Pages

Meta Graph API ekosistemi üzerinden Facebook Pages tarafı yönetilebilir.

Ürün açısından: Page bağlantısı, Page içerikleri, yayınlama, engagement/metric tarafı planlanabilir.

Ancak Facebook Pages ve Instagram aynı Meta ekosisteminde olsa da izinler ve objeler ayrı modellenmelidir.

### Karar

**Facebook Page = MVP'de Instagram ile birlikte ikinci Meta kanalı**

Kişisel Facebook profilleri hedeflenmemeli.

## 2.3 TikTok

### Durum: Teknik olarak mümkün fakat en riskli entegrasyonlardan biri

TikTok Content Posting API: Video Direct Post, Video Upload/Draft, fotoğraf postları destekliyor.

Direct Post için: `video.publish` scope, kullanıcı yetkilendirmesi, creator info sorgusu, app approval, TikTok'un UX gereksinimleri gerekiyor.

Önemli:

**Unaudited client uygulamalarında yayınlanan içerikler private görüntüleme ile sınırlandırılabilir.**

TikTok ayrıca kullanıcı access token'ları için rate limit uygular.

Kaynaklar:

- https://developers.tiktok.com/docs/en/content-posting-api-get-started
- https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post
- https://developers.tiktok.com/docs/en/content-posting-api-reference-photo
- https://developers.tiktok.com/docs/en/content-sharing-guidelines

### Karar

**TikTok = MVP'den sonra, fakat mimaride baştan connector olarak tasarlanmalı.**

## 2.4 YouTube

### Durum: Teknik olarak güçlü

YouTube Data API ile: video upload, başlık, açıklama, tag, privacy, schedule, thumbnail gibi işlemler yapılabilir.

`videos.insert` video yükleme için kullanılabilir.

Ancak önemli kısıt:

> 28 Temmuz 2020 sonrası oluşturulan doğrulanmamış API projelerinde yüklenen videolar private görüntüleme moduyla sınırlanabilir. Bu kısıtı kaldırmak için API projesinin audit sürecinden geçmesi gerekir.

Ayrıca YouTube API'de quota sistemi vardır.

Resmi dokümana göre:

- Default quota: 10.000 unit/day
- `videos.insert`: 1600 quota
- `videos.insert` için ayrıca günlük 100 çağrı sınırı belirtiliyor.

Kaynak:

- https://developers.google.com/youtube/v3/docs/videos/insert
- https://developers.google.com/youtube/v3/determine_quota_cost

### Analytics

YouTube Analytics API ile: views, likes, comments, shares, watch time, average view duration, subscribers gained/lost, revenue gibi metrikler alınabilir.

Kaynak: https://developers.google.com/youtube/analytics/metrics

### Karar

**YouTube = V2**

MVP'de analytics entegrasyonu yerine yayınlama veya planlama temel düzeyde ele alınabilir.

## 2.5 LinkedIn

### Durum: Teknik olarak mümkün ve B2B için değerli

LinkedIn Posts API: Text, Image, Video, Document, Article, Multi-image gibi içerikleri destekler.

`Posts API`, eski `ugcPosts` yaklaşımının yerini almıştır.

Üyeler için: `w_member_social`

Organizasyonlar için: `w_organization_social`

izinleri kullanılabilir.

Organization posting, kullanıcının ilgili LinkedIn Page üzerinde uygun role sahip olmasını gerektirir.

Kaynak: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

### Karar

**LinkedIn = MVP'de olabilir.**

Özellikle B2B/AI/SaaS müşterileri hedeflenecekse değerli.

> **Not (eklenen değerlendirme):** `w_member_social` (kişisel profil) ile `w_organization_social` (şirket sayfası) çok farklı zorluk seviyeleri. Organization posting için LinkedIn'in access review'undan geçmek ya da Marketing Partner tipi bir ilişki gerekebiliyor; bağımsız/küçük geliştiriciler için bu pratikte kapanmış bir kapı olabilir. Roadmap'te ikisi aynı P0/P1 etiketiyle anılmamalı — bkz. [08-critical-risks.md](08-critical-risks.md).

## 2.6 X / Twitter

İlk sürüm için önerilmez.

Neden: API maliyetleri, plan bağımlılığı, değişken API politikaları, MVP'nin ana değerini oluşturmaması.

### Karar

**V3+**

## 2.7 Threads

Meta ekosisteminde olması nedeniyle ileride değerlendirilebilir.

Ancak ilk sürümde Instagram + Facebook + LinkedIn kombinasyonu daha mantıklıdır.

### Karar

**V2/V3**

## 2.8 Platform Önceliklendirmesi

| Platform | Publish | Analytics | API Riski | Öncelik |
|---|---|---|---|---|
| Instagram | Evet | Evet | Orta | P0 |
| Facebook Pages | Evet | Evet | Orta | P0 |
| LinkedIn | Evet | Evet | Orta | P0/P1 |
| TikTok | Evet | Kısmi/ürüne göre | Yüksek | P1 |
| YouTube | Evet | Evet | Orta | P1 |
| Threads | Evet | Değişken | Orta | P2 |
| X | Evet | Değişken | Yüksek | P3 |

## 2.9 Ortak Social Connector Mimarisi

Platformları doğrudan business logic'e bağlama.

Her platform için connector oluştur.

```text
SocialProvider
├── InstagramProvider
├── FacebookProvider
├── LinkedInProvider
├── TikTokProvider
└── YouTubeProvider
```

Ortak interface:

```text
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

## 2.10 Resmi Kaynaklar

- Meta / Instagram API: https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- TikTok Content Posting API: https://developers.tiktok.com/docs/en/content-posting-api-get-started
- TikTok Direct Post: https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post
- TikTok Photo Posting: https://developers.tiktok.com/docs/en/content-posting-api-reference-photo-post
- TikTok Guidelines: https://developers.tiktok.com/docs/en/content-sharing-guidelines
- LinkedIn Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- YouTube Videos Insert: https://developers.google.com/youtube/v3/docs/videos/insert
- YouTube Quota: https://developers.google.com/youtube/v3/determine_quota_cost
- YouTube Analytics: https://developers.google.com/youtube/analytics/metrics
- Supabase Pricing: https://supabase.com/pricing
- OpenAI API Pricing: https://openai.com/api/

> **Not (eklenen değerlendirme):** Kaynakların çoğu doğru ve güncel API'lere işaret ediyor, ancak Meta/TikTok/LinkedIn izin politikaları sık değişiyor. Production'a girmeden hemen önce bu sayfaların tekrar doğrulanması gerektiği doğru şekilde vurgulanmış — bunu roadmap'e (bkz. [06-roadmap-scope.md](06-roadmap-scope.md)) bir "pre-launch checklist" maddesi olarak eklemek faydalı olur.
