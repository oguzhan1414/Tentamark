# Tentamark AI Marketing Manager — Sistem Analizi & Rakip Karşılaştırma & Öneriler

## 📋 Analiz Özeti

Projeyi kod tabanı, veritabanı şeması, AI modülleri, sosyal platform connector'ları ve frontend bileşenleri düzeyinde inceledim. Ardından **SocialBee**, **Sprout Social**, **Planable** ve **SocialPilot** rakiplerini analiz ettim. Aşağıda bulgularım, eleştirilerim ve önerilerim var.

---

## 🔴 Bölüm 1: Kritik Sorunlar & Eksikler

### 1.1 Middleware'de Auth Koruması Yok

[middleware.ts](file:///d:/marketing-project/web/src/middleware.ts) şu anda **sadece www redirect** yapıyor. `/dashboard/*` rotalarında **hiçbir auth kontrolü yok**. Supabase SSR auth middleware'i entegre edilmemiş.

```diff
- Sadece www.tentamark.com → tentamark.com redirect
+ Auth kontrolü: session yoksa login'e redirect
+ Token refresh: expired session'ları otomatik yenile
```

> [!CAUTION]
> Bu, dashboard'a giriş yapmadan URL'den erişilebileceği anlamına gelir. Production'da **ciddi güvenlik açığı**.

### 1.2 ComposeForm.tsx — 2.175 Satırlık Dev Bileşen

[ComposeForm.tsx](file:///d:/marketing-project/web/src/components/dashboard/ComposeForm.tsx) **108 KB**, tek bir dosyada 2.175 satır. Bu:

- **Test edilemez** — unit test yazmak pratikte imkansız
- **Bakımı çok zor** — her değişiklik regresyon riski taşıyor
- **Bundle size** — client-side JS bundle'ı şişiriyor

> [!WARNING]
> Bu dosya acilen parçalanmalı: `ComposeFormHeader`, `ComposePlatformSelector`, `ComposeMediaSection`, `ComposeAIAssist`, `ComposeScheduler`, `ComposePreviewPanel` gibi alt bileşenlere bölünmeli.

### 1.3 Publisher Hâlâ Mock

[schema.sql](file:///d:/marketing-project/supabase/schema.sql#L741-L778)'daki `process_publish_queue()` fonksiyonu tamamen **MOCK**. Gerçek bir sosyal platform API çağrısı yapılmıyor. Connector'lar ([instagramProvider.ts](file:///d:/marketing-project/web/src/lib/social/instagramProvider.ts), [metaProvider.ts](file:///d:/marketing-project/web/src/lib/social/metaProvider.ts) vb.) yazılmış ama scheduler bunları **kullanmıyor**.

```
MOCK PUBLISHER:
- caption'da "test-fail" varsa → FAILED
- yoksa → mock-UUID ile PUBLISHED
```

> [!IMPORTANT]
> Connector'lar ile scheduler arasındaki entegrasyon tamamlanmalı. `process_publish_queue()` → `getProviderFor(platform).publish()` zinciri kurulmalı.

### 1.4 Token Encryption Eksik

`social_accounts` tablosunda `access_token_encrypted` ve `refresh_token_encrypted` alanları var ama [crypto](file:///d:/marketing-project/web/src/lib/crypto) dizinindeki şifreleme modülü incelendiğinde token'ların **gerçekten encrypt edilip edilmediği** doğrulanmalı. Spec'te "DB'de plain text tutulmamalı" diyor.

### 1.5 Rate Limiting Yok

API route'larda (`/api/connections/*`, `/api/scheduler/*`, `/api/media/*`) hiçbir **rate limiting** mekanizması yok. Bir kullanıcı sınırsız AI generation çağrısı yapabilir.

### 1.6 Error Boundary Yok

Tüm dashboard sayfaları `"use client"` ve hiçbirinde React Error Boundary yok. Bir AI çağrısı fail ederse **tüm sayfa crash** eder.

### 1.7 Test Altyapısı Sıfır

Projede:
- ❌ Unit test yok
- ❌ Integration test yok
- ❌ E2E test yok
- ❌ Test framework kurulu değil (jest/vitest/playwright)

---

## 🟡 Bölüm 2: Yapısal Eksikler & İyileştirmeler

### 2.1 Analytics Sayfası — Gerçek Veri Yok

[analytics/page.tsx](file:///d:/marketing-project/web/src/app/(app)/dashboard/analytics/page.tsx) 27KB'lık bir dosya ama `analytics_snapshots` tablosundan **gerçek veri çekimi** yapılıp yapılmadığı belirsiz. Rakiplerle karşılaştırıldığında:

| Özellik | Tentamark | SocialBee | Sprout Social | SocialPilot |
|---------|-----------|-----------|---------------|-------------|
| Post-level analytics | ❌ Mock | ✅ Gerçek | ✅ Derin | ✅ Gerçek |
| Audience demographics | ❌ Yok | ✅ Var | ✅ Detaylı | ✅ Var |
| Best time to post | ❌ Yok | ✅ AI-önerili | ✅ ViralPost™ | ✅ Var |
| Competitor benchmarking | 🟡 Temel | ❌ Yok | ✅ Var | ❌ Yok |
| Exportable reports | ❌ Yok | ✅ PDF | ✅ PDF/CSV | ✅ PDF |
| Engagement rate trend | ❌ Yok | ✅ Grafik | ✅ Grafik | ✅ Grafik |

### 2.2 Onboarding Flow Eksik

Kullanıcı register olunca `handle_new_user()` trigger'ı otomatik org/brand/DNA oluşturuyor — bu iyi. Ama **guided onboarding wizard** yok:

- Marka bilgilerini adım adım toplayan bir akış yok
- Sosyal hesap bağlama rehberi yok
- İlk içerik oluşturma tutoriali yok

**Planable** ve **SocialBee** bunu çok iyi yapıyor — ilk 5 dakikada kullanıcıyı "aha moment"e taşıyorlar.

### 2.3 Notification Sistemi Yok

- İçerik onay bekliyor → bildirim yok
- Yayınlama başarısız oldu → bildirim yok
- Token süresi doldu → bildirim yok
- Takım arkadaşı yorum yaptı → bildirim yok

Schema'da `assigned_to` alanı var ama spec'te kendisi diyor: *"no notification infra exists"*.

### 2.4 Undo/Redo & Autosave Yok

ComposeForm'da bir yazı yazarken:
- Sayfa yenilenirse → **her şey kaybolur**
- Yanlışlıkla silersen → **geri alma yok**
- Draft otomatik kaydedilmiyor

### 2.5 i18n Yapısı Zayıf

[LanguageContext.tsx](file:///d:/marketing-project/web/src/context/LanguageContext.tsx) ve bileşenlerde inline `TR/EN` string'ler var (`IDEA_CHIPS_TR` / `IDEA_CHIPS_EN`). Ama:
- Tüm bileşenler Türkçe ve İngilizce string'leri **kodun içinde** tutuyor
- Merkezi bir translation dosyası yok
- next-intl veya benzeri bir i18n kütüphanesi kullanılmıyor

### 2.6 LinkedIn Provider Eksik

[registry.ts](file:///d:/marketing-project/web/src/lib/social/registry.ts)'da LinkedIn connector **yok**. Spec'te MVP P0 olarak listeniyor ama implementasyon yapılmamış. Mevcut connector'lar:

✅ Instagram, ✅ Facebook, ✅ Threads, ✅ TikTok, ✅ Pinterest, ✅ Telegram, ✅ YouTube, ✅ Bluesky
❌ **LinkedIn** — MVP P0'da olması gerekirken yok

### 2.7 Content Repurposing Yapısı Eksik

Spec'te "En Önemli Ürün Özelliği" olarak tanımlanan **Content Repurposing** (tek fikirden çoklu platform içerik üretme) sadece ComposeForm'daki platform seçimi seviyesinde. Gerçek anlamda:
- Bir Instagram Reel'den otomatik LinkedIn post versiyonu çıkarmıyor
- "Repurpose this" butonu yok
- Platform-specific tone adaptation otomatik değil

---

## 🟢 Bölüm 3: İyi Yapılmış Şeyler

| Özellik | Değerlendirme |
|---------|---------------|
| **Database schema** | Çok düşünceli ve üretim kalitesinde. RLS politikaları, `private` schema kullanımı, `SECURITY DEFINER` güvenlik kararları profesyonel |
| **Social connector mimarisi** | `SocialProvider` interface'i, capability-aware design, provider registry — temiz ve genişletilebilir |
| **AI model stratejisi** | `MODEL` / `FAST_MODEL` / `VISION_MODEL` ayrımı, maliyet hesaplama, Groq API wrapper — iyi düşünülmüş |
| **Brand DNA & Strategy** | Versiyonlu strateji, input snapshot, change notes ile diff — rakiplerin çoğundan daha sofistike |
| **Calendar** | Drag-and-drop, month/week view, media panel, smart fill, notes — zengin UX |
| **Scheduler queue** | pgmq + pg_cron, exponential backoff, idempotent claiming — production-grade tasarım |
| **Team invites** | Token-based, org cleanup on accept — akıllı tasarım |
| **Content share links** | External approval without login — Planable'dan ilham alınmış, iyi implement edilmiş |
| **Approval workflow** | Comment thread, assign to member, status lifecycle — temel ekip iş akışı var |

---

## 🔵 Bölüm 4: Rakip Analizi

### Sprout Social ($79-$399/mo)
**Pozisyon:** Enterprise social intelligence platform

Tentamark'tan **farklılaşan** ana özellikler:
- 🧠 **AI Agent "Trellis"** — sosyal konuşmalardan actionable insight çıkaran otonom AI agent
- 📊 **Social Listening** — milyonlarca konuşmadan sentiment, trend, spike detection
- 🤝 **Influencer Marketing** — 10M+ creator veritabanı, kampanya yönetimi
- 👥 **Employee Advocacy** — çalışanların marka içeriklerini kendi ağlarında paylaşması
- 🔗 **Zendesk/Salesforce/Slack entegrasyonları** — CRM entegrasyonu
- 📈 **Competitive benchmarking** — rakip hesapların performans karşılaştırması

### SocialBee ($29-$179/mo)
**Pozisyon:** AI-powered SMM for growing businesses

Tentamark'tan **farklılaşan** ana özellikler:
- 📂 **Content Categories** — evergreen, promotional, educational gibi kategoriler + otomatik rotasyon
- ♻️ **Evergreen recycling** — eski başarılı içerikleri otomatik tekrar paylaşma
- 🤖 **AI Copilot** — Canva entegrasyonu ile görsel üretim
- 📋 **Content curation** — RSS feed'lerden otomatik içerik toplama
- 🔗 **URL shortener + tracking** — dahili link kısaltma ve tıklama analizi
- 📊 **Workspace-level analytics** — birden fazla marka için karşılaştırmalı rapor

### Planable ($39-$Custom)
**Pozisyon:** Collaboration-first content planning

Tentamark'tan **farklılaşan** ana özellikler:
- 👁️ **Pixel-perfect preview** — her platform için gerçek görünüm simülasyonu
- ✅ **Multi-level approval** — None/Optional/Required/Multi-level approval workflows
- 💬 **Real-time collaboration** — Google Docs tarzı eş zamanlı düzenleme
- 🏷️ **Labels & filters** — zengin etiketleme ve filtreleme sistemi
- 📐 **Grid view** — Instagram grid planlama
- 🔄 **Version history** — her düzenlemenin geçmişi

### SocialPilot ($25-$170/mo)
**Pozisyon:** Affordable SMM for agencies

Tentamark'tan **farklılaşan** ana özellikler:
- 🏢 **White-label** — ajanslar için markalı panel
- 📊 **Client reporting** — otomatik haftalık/aylık müşteri raporları
- 🎨 **Canva/Giphy/Unsplash** dahili entegrasyonlar
- 📥 **Bulk scheduling** — CSV ile toplu içerik yükleme
- 👥 **Client management** — ajans-müşteri ilişki yönetimi
- 🔗 **Social inbox** — birleşik mesaj yönetimi (Tentamark'ta başlanmış)

---

## 💡 Bölüm 5: Niş Fark Yaratan Öneriler

### 5.1 🎯 "Sektör DNA" — Otomatik Sektör Şablonları (Rakiplerde Yok)

**Fikir:** Kullanıcı sektörünü seçtiğinde (kafe, kuaför, e-ticaret, avukat, SaaS) sistem otomatik olarak:
- O sektöre özel **içerik pillars** üretir
- Sektörel **hashtag paketleri** önerir  
- **Rakip içerik kalıplarını** analiz eder
- Sektöre özel **best posting times** verir
- Hazır **1 aylık içerik takvimi şablonu** sunar

Hiçbir rakip bunu bu derinlikte yapmıyor. SocialBee'nin content categories'i en yakını ama sektöre özel değil.

**Implementasyon:**
```
brand_dna.industry → AI Sector Analysis → Pre-built templates
                                       → Sector hashtag bank
                                       → Competitor pattern matching
```

### 5.2 📈 "Growth Radar" — Büyüme Fırsatı Algılama (Rakiplerde Yok)

**Fikir:** AI, kullanıcının içerik performansını analiz edip **spesifik büyüme fırsatları** gösterir:

- "Son 7 günde eğitim içerikleriniz %340 daha fazla kaydedildi → Bu hafta 3 eğitim Reel'i daha paylaşın"
- "Rakibiniz X bu hafta 'behind the scenes' içerik paylaştı ve viral oldu → Siz de deneyin"
- "Perşembe 14:00 sizin en güçlü saatiniz ama boş → Otomatik planla"
- "Carousel postlarınız tek görselden %180 daha fazla erişim alıyor → Daha fazla carousel üretin"

Bu, Sprout Social'ın AI Assist'ine benzer ama **küçük işletmeler için** optimize edilmiş, uygulanabilir aksiyon odaklı.

### 5.3 🎬 "1→7 Content Multiplier" — İçerik Çarpanı

**Fikir:** Kullanıcı tek bir video/post yükler, AI bunu 7 farklı formata dönüştürür:

```
1 Blog Post →  Instagram Carousel
            →  LinkedIn Post  
            →  Twitter Thread
            →  Instagram Reel Script
            →  Facebook Post
            →  Story Serisi (3 slide)
            →  TikTok Caption
```

Bu, spec'teki Content Repurposing'in **gerçek implementasyonu**. Tek bir "Çoğalt" butonu ile 7 platform-specific içerik üretilir.

### 5.4 💬 "AI Müşteri Temsilcisi" — Inbox AI (Kısmen Var, Geliştirilmeli)

**Fikir:** Sosyal mesajlara AI ile otomatik yanıt önerisi:
- DM'lere marka tonunda cevap taslağı
- Yorumlara akıllı yanıt önerisi
- Olumsuz yorumlara kriz yönetimi taslağı
- FAQ bazlı otomatik yanıtlar

[generateInboxReply.ts](file:///d:/marketing-project/web/src/lib/ai/generateInboxReply.ts) ve [sendInboxReply.ts](file:///d:/marketing-project/web/src/lib/social/sendInboxReply.ts) var ama bunların daha güçlü, marka-aware bir sisteme dönüştürülmesi gerekiyor.

### 5.5 📊 "Haftalık CEO Raporu" — Otomatik Performans Özeti

**Fikir:** Her Pazartesi sabahı otomatik oluşturulan, e-posta ile gönderilen bir rapor:

```
📊 Tentamark Haftalık Rapor — 8-14 Eylül 2026

Bu Hafta:
✅ 12 içerik yayınlandı (geçen hafta: 8)
📈 Toplam erişim: 24.5K (+32%)
💬 142 yorum aldınız (+18%)
🏆 En başarılı: "5 Kahve Hatası" Reel — 8.2K görüntülenme

AI Önerisi:
→ Eğitim içerikleri %3x daha fazla kaydediliyor
→ Salı 10:00 en güçlü saatiniz
→ Bu hafta 2 carousel, 3 Reel öneriyorum
```

Hiçbir rakip bu kadar basit ve actionable bir haftalık özet sunmuyor. `getDashboardBriefing` zaten var, bunu scheduled e-mail haline getirmek güçlü bir retention aracı olur.

### 5.6 🎨 "Brand Kit" — Görsel Kimlik Asistanı

**Fikir:** Brand DNA'daki renk paleti ve ton bilgilerini kullanarak:
- Otomatik **branded template'ler** üretme
- Her post için **tutarlı görsel stil** önerme
- Logo watermark otomatik ekleme
- Marka fontları ile text overlay

Bu, Canva entegrasyonuyla veya AI image generation ile yapılabilir. [canva](file:///d:/marketing-project/web/src/lib/canva) dizini var — bu entegrasyon genişletilebilir.

### 5.7 🛒 "E-Ticaret Bridge" — WooCommerce/Shopify İçerik Otomasyonu

**Fikir:** E-ticaret entegrasyonu zaten başlamış ([woocommerce](file:///d:/marketing-project/web/src/lib/woocommerce)). Bunu şöyle genişlet:
- Yeni ürün eklendiğinde **otomatik sosyal medya içeriği** üret
- Stok tükendiğinde **otomatik "sold out" story** paylaş
- İndirim kampanyası başladığında **countdown story serisi** oluştur
- Ürün yorumlarından **müşteri başarı hikayesi** içeriği üret

Bu, küçük e-ticaret işletmeleri için **killer feature**.

---

## 🗺️ Bölüm 6: Önerilen Öncelik Sırası

### Hemen Yapılması Gerekenler (Sprint 1-2)

1. **Auth middleware** — Güvenlik açığı kapatılmalı
2. **ComposeForm refactor** — 2175 satırlık dosya parçalanmalı
3. **Error boundaries** — Tüm dashboard sayfalarına ekle
4. **Publisher integration** — Mock publisher'ı gerçek connector'lara bağla
5. **LinkedIn provider** — MVP P0 olarak eksik

### Kısa Vadede (Sprint 3-5)

6. **Onboarding wizard** — İlk kullanıcı deneyimi
7. **Notification system** — En azından in-app bildirimler
8. **Draft autosave** — Compose'da otomatik kayıt
9. **Analytics gerçek veri** — Platform API'lerinden metric çekimi
10. **Rate limiting** — AI ve API çağrıları için limit

### Orta Vadede (Sprint 6-10)

11. **Sektör DNA şablonları** — Niş farklılaşma
12. **1→7 Content Multiplier** — Content repurposing
13. **Haftalık CEO Raporu** — E-mail ile otomatik rapor
14. **Growth Radar** — AI büyüme önerileri
15. **Brand Kit** — Görsel kimlik otomasyonu

### Uzun Vadede (V2+)

16. **E-Ticaret Bridge** gelişmiş
17. **White-label** — Ajans desteği
18. **Mobile app** — PWA veya React Native
19. **Social Listening** — Trend/sentiment analiz
20. **A/B Testing** — İçerik varyant testi

---

## Open Questions

> [!IMPORTANT]
> 1. **LinkedIn API erişiminiz var mı?** MVP P0'da olmasına rağmen provider yok — LinkedIn developer app oluşturuldu mu?
> 2. **Gerçek kullanıcı testi yapıldı mı?** Onboarding akışının ne kadar acil olduğunu belirler.
> 3. **E-posta servisi planlanıyor mu?** Bildirimler ve haftalık rapor için transactional email gerekli (Resend, SendGrid vb.).
> 4. **Monetizasyon timeline'ı ne?** Rate limiting ve usage tracking'in aciliyetini belirler.
> 5. **Hangi niş önerileri en çok ilginizi çekti?** Önceliklendirmeyi buna göre yaparız.




# 💡 Tentamark — Niş Fark Yaratan Öneriler (Genişletilmiş)

> Bu doküman Tentamark'ı rakiplerinden ayıracak, kullanıcıya **"bunu başka hiçbir yerde bulamam"** dedirtecek özellik fikirlerini toplar. Her öneri kullanıcı hikayesi, nasıl çalışacağı ve rakiplerden farkı ile detaylandırılmıştır.

---

## 1️⃣ AI-Native İçerik Zekası

### 1.1 🎯 Sektör DNA — "Sektörümü benden iyi bilen asistan"

**Kullanıcı hikayesi:** Bir kuaför, kayıt olur ve sektörünü seçer. Sistem anında:
- O sektörün **en çok etkileşim alan içerik türlerini** bilir (önce/sonra fotoğrafları, müşteri dönüşümleri, "gün sonu temizlik" reels'leri)
- Sektöre özel **hashtag paketleri** sunar (#sacbakimi #kesimsaati #kuaforgunlugu değil genel #beauty)
- O sektörün **hedef kitlesinin aktif olduğu saatleri** bilir
- **1 aylık hazır içerik takvimi şablonu** verir — "İlk haftanız bizden"
- Sektörün **sezonsal takvimini** otomatik yükler (güzellik sektörü → düğün sezonu, balo dönemi, yılbaşı partileri)

**Nasıl çalışır:**
```
Kullanıcı sektör seçer
       ↓
AI, o sektörün 500+ başarılı hesabının pattern'larını bilir (pre-computed)
       ↓
Sektör DNA paketi yüklenir:
  → 12 haftalık içerik takvimi şablonu
  → 50 sektörel hashtag seti
  → 20 içerik fikri başlangıç paketi
  → Best posting times (sektöre özel)
  → "Yapma" listesi (sektördeki klişeler)
       ↓
Kullanıcı ilk gün bile içerik üretebilir
```

**Neden güçlü:** Hiçbir rakip sektöre bu kadar özel bir başlangıç sunmuyor. SocialBee'nin content categories'i genel, Sprout Social enterprise odaklı. Küçük işletme sahibi "ne paylaşacağımı bilmiyorum" derdinden ilk 5 dakikada kurtulur.

**Derinleştirme:** Her sektör için bir "sektör mentoru" persona oluşturulabilir. Kuaför için "Stil Asistanı", kafe için "Barista Coach", avukat için "Hukuk İletişim Danışmanı". Bu persona, AI assistant chat'inde o sektörün diline ve sorunlarına hakim bir şekilde konuşur.

---

### 1.2 🌊 Trend Surfer — "Trendleri yakala, 24 saat önce içerik üret"

**Kullanıcı hikayesi:** Kullanıcı sabah dashboardu açar. "Bugün sektörünüzde bu konuşuluyor" kartı görür:

```
🔥 Bugün Sektörünüzde Trend
━━━━━━━━━━━━━━━━━━━━━━━━

☕ Kahve sektörü
"Oat milk cold brew" arama hacmi %240 arttı

💡 İçerik Önerisi:
"Oat milk cold brew deneyimini paylaş —
müşterilerine sor: süt mü, yulaf sütü mü?"

[📝 İçerik Oluştur]  [📅 Takvime Ekle]  [🔇 İlgilenmiyorum]
```

**Nasıl çalışır:**
```
Her gece cron job çalışır
       ↓
Sektör bazlı trend kaynakları taranır:
  → Google Trends API (sektör keyword'leri)
  → Instagram Explore pattern'ları (hashtag volume değişimi)
  → TikTok trending sounds/topics
  → Twitter/X trending topics
       ↓
AI, kullanıcının sektörüne uygun olanları filtreler
       ↓
Marka tonuna uygun içerik önerisi üretir
       ↓
Dashboard'da "Trend Alert" kartı olarak gösterir
```

**Rakiplerden farkı:** Sprout Social'ın Social Listening'i $299+/mo plan gerektirir ve kurumsal. Bu, küçük işletmeler için **ücretsiz/düşük maliyetli** bir trend algılama sistemi — derin listening değil ama "bugün ne paylaşsam" sorusuna gerçek zamanlı cevap.

---

### 1.3 🧪 Caption Lab — "A/B test etmeden en iyi caption'ı bul"

**Kullanıcı hikayesi:** Kullanıcı bir post oluşturur. AI 3 farklı caption versiyonu üretir ve her birini puanlar:

```
┌─────────────────────────────────────────────┐
│  Caption Lab — 3 Versiyon Karşılaştırma     │
├─────────────────────────────────────────────┤
│                                             │
│  🏆 Versiyon A — Merak Kancası       92/100 │
│  "Bu kahveyi deneyenlerin %87'si geri       │
│   geliyor. Sebebini tahmin edin..."         │
│  ├ Hook gücü: ████████░░ 85%               │
│  ├ CTA netliği: █████████░ 92%             │
│  ├ Marka uyumu: █████████░ 95%             │
│  └ Kaydetme potansiyeli: ████████░░ 88%    │
│                                             │
│  🥈 Versiyon B — Eğitici Ton         78/100 │
│  "3. dalga kahve akımı nedir ve neden       │
│   herkes bundan bahsediyor?"                │
│                                             │
│  🥉 Versiyon C — Direkt CTA         71/100 │
│  "Bugün gel, 3. dalga espresso'muzu         │
│   dene! ☕ Link bio'da"                     │
│                                             │
│  [A'yı Kullan] [B'yi Kullan] [Karıştır]    │
└─────────────────────────────────────────────┘
```

**Neden güçlü:** `analyzePostHookAndVirality.ts` ve `getBrandVoiceConsistency.ts` zaten var. Bunlar birleştirilerek **caption üretim anında** skorlama yapılabilir. Kullanıcı rastgele değil, **veriye dayalı** karar verir.

**Ek katman — Geçmiş öğrenme:** Kullanıcının geçmiş postlarından "hangi tip caption daha çok etkileşim aldı" analizi yapılıp, skorlama modeli kişiselleştirilebilir. "Senin kitlen merak kancalarına %40 daha fazla tepki veriyor" gibi.

---

### 1.4 🤖 Content Autopilot — "Bu hafta hiç dokunmadan içerik akacak"

**Kullanıcı hikayesi:** Kullanıcı "Autopilot modu" açar. Sistem:

1. Brand DNA'yı okur
2. Bu haftanın strateji pillar'larına göre 7 günlük plan çıkarır
3. Her gün için caption + görsel brief üretir
4. Kullanıcıya push notification: "Yarın paylaşılacak 2 içerik hazır — onaylar mısın?"
5. Kullanıcı onaylar veya düzenler
6. Otomatik yayınlanır

```
           Autopilot Akışı
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pazar gecesi:
  AI haftalık plan üretir (7 içerik)
       ↓
Pazartesi sabahı:
  "Bu haftanın planı hazır" bildirimi
       ↓
Kullanıcı toplu onay veya tek tek düzenler
       ↓
Her gün belirlenen saatte yayınlanır
       ↓
Hafta sonu performans özeti gelir
       ↓
Sonraki hafta planı bu veriye göre güncellenir
```

**Rakiplerden farkı:** SocialBee'nin recycling'i ve SocialPilot'un bulk scheduling'i var ama ikisi de **kullanıcının içerik üretmesini** bekler. Autopilot, **AI'ın proaktif olarak** plan yapıp içerik üretmesi. Kullanıcı sadece onaylıyor.

**Dikkat:** Spec'te "kullanıcı onayı olmadan yayınlama" yapılmamalı diyor — bu tam uyumlu: AI üretir, kullanıcı onaylar, sistem yayınlar.

---

### 1.5 🎤 Voice Clone — "Sosyal medyamı benim gibi konuşsun"

**Kullanıcı hikayesi:** Kullanıcı 5-10 eski postunu sisteme yapıştırır (veya Instagram'dan otomatik çekilir). AI, kullanıcının yazım stilini öğrenir:

```
🎤 Ses Klonlama Tamamlandı!
━━━━━━━━━━━━━━━━━━━━━━━━━━

Senin stilin:
  → Kısa cümleler, çok emoji kullanımı
  → Soru ile başlama alışkanlığı
  → "Biliyor musun?" kalıbını sık kullanıyorsun
  → Hashtag'leri caption sonuna koyuyorsun
  → CTA'larda "Link bio'da" tercih ediyorsun
  → Rahat ve samimi ton, argo az

Bundan sonra üretilen tüm içerikler
bu stile uygun olacak.

[Örnek Göster]  [Stili Düzenle]  [Harika!]
```

**Nasıl çalışır:**
```
Kullanıcının 10+ eski postu analiz edilir
       ↓
Stil profili çıkarılır:
  → Cümle uzunluğu ortalaması
  → Emoji kullanım sıklığı ve tipi
  → Yaygın ifade kalıpları
  → Hook tercihleri
  → CTA stili
  → Hashtag pozisyonu
       ↓
Bu profil Brand DNA'ya "writing_style" olarak eklenir
       ↓
Tüm AI generation prompt'larına stil constraint olarak enjekte edilir
```

**Neden önemli:** Tüm rakiplerin AI'ı "genel" yazıyor. Kullanıcı üretilen metni hep düzenlemek zorunda çünkü "bu benim gibi konuşmuyor". Voice Clone bu sürtünmeyi ortadan kaldırır.

---

## 2️⃣ Büyüme & Performans Zekası

### 2.1 📈 Growth Radar — "Büyüme fırsatlarını kaçırma"

**Kullanıcı hikayesi:** Dashboard'da sürekli güncellenen bir "Growth Radar" kartı:

```
📡 Growth Radar — Bu Hafta
━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 Fırsat: Carousel'ler patlıyor!
   Son 14 günde carousel'lerin tek görsele göre
   %240 daha fazla kaydetme aldı.
   → [3 carousel fikri üret]

🟡 Uyarı: Cuma paylaşımları düşük
   Son 4 Cuma içerik paylaşmadınız.
   Rakipleriniz Cuma'yı aktif kullanıyor.
   → [Cuma için otomatik planla]

🔴 Kaçırılan: Reels trendi
   Sektörünüzde Reels paylaşımı
   %180 arttı ama siz hiç paylaşmadınız.
   → [İlk Reel'imi oluştur]

🏆 Başarı: Eğitim içerikleri kazanıyor
   "Nasıl yapılır" içerikleriniz diğerlerinden
   %3.2x daha fazla erişim alıyor.
   → Devam edin! Bu hafta 2 tane daha öneriyorum.
```

**Derinleştirme:** Growth Radar sadece göstermemeli, **tek tıkla aksiyon** aldırmalı. "3 carousel fikri üret" butonuna basınca gerçekten ComposeForm açılıp AI tarafından üretilmiş 3 carousel draft hazır olmalı.

---

### 2.2 ⏰ Best Time Engine — "Her platformun altın saatini bul"

**Kullanıcı hikayesi:** Kullanıcı içerik planlarken bir ısı haritası görür:

```
📊 Senin Altın Saatlerin
━━━━━━━━━━━━━━━━━━━━━━━━

         06  08  10  12  14  16  18  20  22
Pzt      ░░  ░░  ██  ░░  ██  ░░  ░░  ██  ░░
Sal      ░░  ░░  ░░  ██  ░░  ░░  ██  ██  ░░
Çar      ░░  ██  ██  ░░  ░░  ░░  ░░  ██  ░░
Per      ░░  ░░  ░░  ██  ██  ░░  ░░  ██  ░░
Cum      ░░  ░░  ██  ░░  ░░  ░░  ██  ██  ██
C.tesi   ░░  ░░  ░░  ░░  ░░  ░░  ░░  ██  ██
Pazar    ░░  ░░  ██  ██  ░░  ░░  ░░  ░░  ░░

██ = En yüksek etkileşim  ░░ = Düşük

🤖 AI Önerisi: Perşembe 14:00 ve Cumartesi 20:00
   sizin en güçlü iki slotunuz. Bu saatlere
   en önemli içeriklerinizi planlayın.
```

**Nasıl çalışır:**
- İlk aşamada: Sektör DNA'dan sektörel best time verileri
- İkinci aşamada: Kullanıcının kendi post performansından kişiselleştirilmiş ısı haritası
- Smart Schedule modal'ında otomatik "en iyi saat" önerisi

**Rakiplerden farkı:** Sprout Social'ın ViralPost™ özelliği benzer ama $199+/mo planında. SocialBee'de temel seviyede var. Tentamark bunu **Free/Starter** plandan sunarak fark yaratır.

---

### 2.3 🧬 Viral DNA Analiz — "Neden bu post patladı?"

**Kullanıcı hikayesi:** Kullanıcının bir postu beklenmedik şekilde iyi performans gösterir. Sistem otomatik analiz çıkarır:

```
🧬 Viral DNA Raporu
━━━━━━━━━━━━━━━━━━

"5 Kahve Hatası" postu neden patladı?

📊 Performans: 8.2K görüntülenme (ortalamanızın 12x'i)

🔍 AI Analizi:
  1. Hook gücü: "Hatalardan öğrenmek" kalıbı
     merak uyandırıyor (kaydetme ↑ %340)

  2. Carousel formatı: 5 slide = tam dikkat süresi
     (3'ten az az okunur, 7'den fazla terk edilir)

  3. Zamanlama: Çarşamba 10:00 — hedef kitlenizin
     en aktif olduğu 2. slot

  4. Hashtag karışımı: 3 niş + 2 geniş = ideal dağılım

  5. İlk slide tasarımı: Büyük bold yazı + kontrast
     arka plan = feed'de durdurucu

🎯 Bu Formülü Tekrarla:
  → "X tane Y hatası" formatında 3 yeni fikir:
    • "3 Instagram Bio Hatası"
    • "4 Story Anket Hatası"
    • "6 Hashtag Hatası"

  [Bu fikirlerden içerik oluştur]
```

**Neden güçlü:** Hiçbir rakip **neden** sorusuna bu kadar detaylı cevap vermiyor. Analytics araçları "ne oldu" gösterir ama "neden oldu" ve "nasıl tekrarlarım" göstermez. Bu, Tentamark'ın AI marketing manager pozisyonunun tam karşılığı.

---

### 2.4 🗺️ Follower Journey Map — "Takipçin nasıl müşteriye dönüşüyor?"

**Kullanıcı hikayesi:** Kullanıcı, sosyal medya çabasının gerçek iş sonuçlarına dönüşüp dönüşmediğini görmek ister:

```
🗺️ Takipçi Yolculuğu
━━━━━━━━━━━━━━━━━━━━

Keşfet/Hashtag → Profil Ziyareti → Takip
    2.400            890              340
                                       ↓
Story Görüntüleme → Link Tıklama → Müşteri
      180               45            12

💡 Bu ay sosyal medyadan tahmini 12 müşteri kazandınız
   Müşteri başına maliyet: ~₺0 (organik)

📊 En çok müşteri getiren içerik tipi:
   1. Ürün tanıtım Reels (%45)
   2. Müşteri yorumu paylaşımları (%30)
   3. Behind the scenes (%25)
```

**Önemli not:** Bu tam funnel tracking, platform API limitleri nedeniyle tamamen doğru olamaz. Ama **tahmini bir harita** bile kullanıcıya "sosyal medya işe yarıyor mu" sorusunu yanıtlar — küçük işletmelerin en büyük sorusu.

---

## 3️⃣ İçerik Çoğaltma & Yeniden Kullanma

### 3.1 🎬 1→7 Content Multiplier — "Tek fikirden 7 platform"

**Kullanıcı hikayesi:** Kullanıcı bir blog yazısı URL'si yapıştırır veya bir video yükler. Sistem:

```
🎬 İçerik Çarpanı
━━━━━━━━━━━━━━━━━

Kaynak: "Evde Barista Gibi Kahve Yapmanın 5 Sırrı" (blog)

7 Platform Versiyonu Hazır:

☑️ Instagram Carousel — 5 slide, her sır bir kart
☑️ Instagram Reel — 60 sn script + hook önerisi
☑️ LinkedIn Post — Profesyonel anlatım, insight odaklı
☑️ Facebook Post — Uzun form, tartışma tetikleyici
☑️ TikTok — 30 sn script, hızlı kesim tarzı
☑️ Story Serisi — 5 story, soru-cevap formatı
☑️ Threads — Kısa, punchy, tweet-like

[Tümünü Takvime Ekle]  [Tek Tek Düzenle]
```

**Detay:** Her platform versiyonunda:
- Platform-specific karakter limitlerine uyum
- O platformun **trending formatına** uygun yapı (carousel, list, thread)
- Platform-specific hashtag önerisi
- Platform-specific CTA (Instagram → "Kaydet", LinkedIn → "Ne düşünüyorsun?", TikTok → "Duet at")

**Rakiplerden farkı:** SocialBee aynı metni küçük düzenlemelerle çoklu platforma gönderir. Tentamark her platform için **gerçekten farklı** bir versiyon üretir — bu spec'teki "aynı içeriği birebir göndermeme" prensibinin tam implementasyonu.

---

### 3.2 ♻️ Evergreen Recycler — "Eskiyen ama hâlâ işe yarayan içerikleri geri getir"

**Kullanıcı hikayesi:** 3 ay önce iyi performans gösteren bir post var. Sistem otomatik önerir:

```
♻️ Yeniden Paylaş Önerisi
━━━━━━━━━━━━━━━━━━━━━━━━

Bu içerik 3 ay önce çok iyi performans gösterdi:
"Latte Art Başlangıç Rehberi" — 4.2K görüntülenme

O zamandan bu yana 1,200 yeni takipçi kazandınız.
Onlar bu içeriği hiç görmedi.

Önerilen yeniden paylaşım:
  → Aynı içerik, güncellenmiş caption
  → "Çok sorulan bir konu — tekrar paylaşıyorum" framing
  → Yeni hashtag seti (mevsimsel güncelleme)

[Yeniden Paylaş]  [Caption'ı Güncelle]  [Geç]
```

**Akıllı kurallar:**
- Yalnızca performansı ortalamanın 2x üstünde olan içerikler önerilir
- Minimum 60 gün arayla önerilir
- Evergreen olmayan içerikler (sezonsal, tarihli) filtrelenir
- Her yeniden paylaşımda caption AI tarafından **taze** tutulur

---

### 3.3 🎵 Content Remix DJ — "Aynı fikri farklı açılardan döndür"

**Kullanıcı hikayesi:** Kullanıcının iyi performans gösteren bir "hook" veya konusu var. Sistem o konuyu farklı formatlarda yeniden üretir:

```
🎵 İçerik Remiksi
━━━━━━━━━━━━━━━━━

Orijinal: "Evde espresso yapmanın 5 sırrı" (Carousel, 4.2K view)

Remix Versiyonları:

🎥 Reel: "POV: Evde espresso ustası olmaya karar verdin"
📊 Anket Story: "Evde espresso yapıyor musun? Evet/Hayır"
🧵 Thread: "Bir barista olarak evde espresso için
           asla taviz vermeyeceğim 5 şey 🧵👇"
💬 Soru Post: "Evde espresso yaparken en çok
              zorlandığınız adım hangisi?"
📖 Hikaye: "İlk espressomu evde yaptığım gün —
           çıkan şey kahveye değil, çamura benziyordu..."
🎯 Liste: "Espresso ekipmanı checklist'i —
          başlangıç seviyesi ₺500 altı setup"
```

**Neden güçlü:** Bir fikrin tükenmesi küçük işletmelerin en büyük sorunu. "Ne paylaşsam" yerine "bu fikri kaç farklı şekilde paylaşabilirim" sorusu — içerik üreticilerinin gerçek ihtiyacı.

---

### 3.4 📖 Story Builder — "Instagram Story serisini AI kurgulasın"

**Kullanıcı hikayesi:** Kullanıcı "Bu hafta yeni menü tanıtmak istiyorum" der. AI 8 story'lik bir seri kurgular:

```
📖 Story Serisi — "Yeni Menü Lansmanı"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Story 1: 🎬 HOOK
  "Yarın menümüzde BİR şey değişiyor..."
  [Geri sayım sticker önerisi]

Story 2: 📊 ANKET
  "Tahmin edin ne ekliyoruz?"
  Seçenek A: Yeni tatlı
  Seçenek B: Yeni kahve
  [Anket sticker]

Story 3: 🤫 TEASER
  Bulanık ürün fotoğrafı + "Yaklaşıyor..."

Story 4: 🎉 REVEAL
  Ürün fotoğrafı + isim + fiyat

Story 5: 👨‍🍳 BEHIND THE SCENES
  "Bunu nasıl geliştirdik" kısa video önerisi

Story 6: ⭐ SOCIAL PROOF
  "İlk tadanların yorumları" ekran görüntüsü

Story 7: 🛒 CTA
  "Denemek için bugün gel!"
  [Link sticker önerisi]

Story 8: 💬 ETKILEŞIM
  "Deneyen var mı? DM'den fotoğraf at!"
  [Soru sticker]
```

**Neden güçlü:** Kimse story serisi kurgulamıyor otomatik olarak. Stories, Instagram'ın en güçlü engagement aracı ama "ne paylaşsam" sorunu burada en ağır. AI'ın **dramatik yapı** (hook → tension → reveal → CTA) kurması oyun değiştirici.

---

## 4️⃣ E-Ticaret Bridge

### 4.1 🚀 Ürün Lansman Otomasyonu

**Kullanıcı hikayesi:** WooCommerce'e yeni ürün eklendiğinde otomatik tetiklenir:

```
🚀 Yeni Ürün Algılandı!
━━━━━━━━━━━━━━━━━━━━━━

"El Yapımı Lavanta Sabun" — ₺85

Otomatik Lansman Paketi:

📅 Gün -2: Teaser Story serisi (3 story)
📅 Gün -1: "Yarın geliyor" countdown post
📅 Gün  0: Ürün tanıtım carousel + Reel script
📅 Gün +1: "İlk müşteri yorumları" story
📅 Gün +3: "Stok azalıyor" urgency postu
📅 Gün +7: "En çok sorulan sorular" Q&A post

[Lansman Paketini Başlat]  [Düzenle]
```

### 4.2 📉 Stok Bazlı Akıllı İçerik

- Stok 10'un altına düşünce → "Son birkaç tane!" story
- Tükenen ürün geri geldiğinde → "Geri döndü!" duyurusu
- İndirim başladığında → Countdown sticker'lı story serisi
- Yeni koleksiyon eklendiğinde → Grid planlı carousel serisi

### 4.3 🌟 UGC Harvester — "Müşteri fotoğraflarını içeriğe dönüştür"

Müşteriler ürünle ilgili fotoğraf paylaşıp etiketlediğinde:
- Otomatik algıla (mention/hashtag tracking)
- İzin iste (otomatik DM taslağı)
- Onaylananları "müşteri hikayesi" postuna dönüştür
- Sosyal kanıt galerisi oluştur

---

## 5️⃣ Ekip & Müşteri İlişkileri

### 5.1 📊 Haftalık CEO Raporu — "Patron'a gönderilecek 30 saniyelik özet"

**Kullanıcı hikayesi:** Her Pazartesi sabahı otomatik oluşturulan, e-posta ile gönderilebilen rapor:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Example Coffee — Haftalık Rapor
   8-14 Eylül 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Bu Hafta vs. Geçen Hafta

Yayınlanan: 12 içerik (+50%)
Erişim:     24.5K      (+32%)
Etkileşim:  1,840      (+18%)
Yeni takip: +89        (+12%)
Web trafik: 340 tık    (+45%)

🏆 Haftanın Yıldızı
"5 Kahve Hatası" Carousel — 8.2K view

📉 İyileştirme Alanı
Cuma içerikleri düşük performans

🤖 AI Önerisi
→ Gelecek hafta 3 Reel, 2 Carousel öneriyorum
→ Eğitim içeriklerine ağırlık verin
→ Cuma 14:00 slot'unu deneyin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Fark:** Bu rapor **ajans müşterileri** için de sunulabilir. Ajans sahibi, 10 müşterisinin her birine otomatik haftalık rapor gönderir — SocialPilot'un client reporting özelliğine benzer ama AI-generated insight'larla.

### 5.2 🏢 Client Portal — "Müşteriniz sadece onaylasın"

Ajanslar için minimal bir dış portal:
- Müşteri giriş yapar → sadece kendi markasının içeriklerini görür
- Onaylar veya geri bildirim yazar
- Takvimi görür ama düzenleyemez
- Haftalık raporu görür

`content_share_links` zaten var — bu yapının genişletilmiş hali.

### 5.3 🛡️ AI Brand Guardian — "Marka kurallarını ihlal etmeni engelle"

**Kullanıcı hikayesi:** Brand DNA'da yasaklı kelimeler, rakip isimleri ve ton kuralları tanımlı. İçerik yayınlanmadan önce AI **son bir kontrol** geçirir:

```
🛡️ Brand Guardian — 2 Uyarı Bulundu
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Yasak kelime: "en ucuz"
   Brand DNA'nızda fiyat odaklı agresif
   dil yasaklanmış. Öneri: "uygun fiyatlı"

⚠️ Ton uyumsuzluğu: %62 (minimum: %75)
   Bu caption gereğinden fazla satış odaklı.
   Markanızın tonu "samimi ve eğitici".
   Öneri: CTA'yı yumuşatın.

✅ Hashtag kontrolü: Temiz
✅ Karakter limiti: Uygun
✅ Görsel kontrolü: Logo watermark var

[Düzelt ve Devam Et]  [Yine de Yayınla]
```

**Neden güçlü:** Ekipte birden fazla kişi içerik üretiyorsa, marka tutarlılığı kaybolur. Brand Guardian bunu **otomatik** kontrol eder. `getBrandVoiceConsistency.ts` zaten var — bunu publish akışına entegre etmek yeterli.

---

## 6️⃣ Türkiye & Yerelleşme Avantajı

### 6.1 🇹🇷 Türkçe NLP Üstünlüğü

Rakiplerin hiçbiri Türkçe'ye optimize değil. Tentamark:
- Türkçe hashtag önerileri (çekimli kelimeler, birleşik yazım)
- Türk kullanıcı davranışı bilgisi (Instagram ağırlıklı, TikTok büyüyen)
- Türkçe caption kalıpları ("Biliyor musun?", "Sen de denedin mi?")
- Türk marka tonu (samimi, içten, abartısız)

### 6.2 📅 Özel Gün & Sezonsal Takvim

Türkiye'ye özel otomatik içerik takvimi:
- Ramazan / Bayram içerik serisi
- 23 Nisan, 19 Mayıs, 29 Ekim kampanyaları
- Anneler/Babalar Günü lansman paketleri
- Yılbaşı kampanya takvimi
- Okul açılışı, mezuniyet sezonu
- Düğün sezonu (Haziran-Eylül)
- Black Friday / İndirim Festivali
- Sevgililer Günü

Her özel gün için **hazır içerik şablonları** ve **kampanya paketleri**.

### 6.3 📍 Yerel İşletme Haritası

Yerel işletmeler için:
- "Bölgenizdeki rakiplerin en çok paylaştığı içerik türleri"
- Yerel hashtag önerileri (#kadıköykafe, #beşiktaşkuaför)
- Google Business Profile entegrasyonu
- Yerel etkinlik takvimi entegrasyonu

### 6.4 🤝 Türk Influencer Eşleşme (V2+)

- Mikro-influencer veritabanı (1K-50K takipçi)
- Sektör + konum bazlı eşleşme
- Influencer'a otomatik brief gönderme
- Kampanya takibi ve ROI ölçümü

---

## 7️⃣ Görsel Kimlik & Tasarım

### 7.1 🎨 Brand Kit — "Her postum aynı aileye ait görünsün"

Brand DNA'daki renk paleti + logo + font bilgilerinden:
- **Template gallery:** 20+ hazır post template (quote, ürün, tip, behind scenes)
- Her template markanın renklerine otomatik uyarlanır
- Logo watermark pozisyonu ayarlanabilir
- Consistent border/frame stilleri
- Story template'leri (quiz, anket, soru-cevap)

### 7.2 🖼️ AI Thumbnail Optimizer

Video içerikler için:
- Reel/TikTok kapak görseli AI ile üretme
- A/B kapak görseli önerisi (merak uyandırıcı vs. bilgilendirici)
- Text overlay otomatik ekleme (bold, kontrast, okunabilir)
- Yüz algılama + "en iyi kare" seçimi

### 7.3 📐 Instagram Feed Planner — "Grid'in nasıl görüneceğini önceden gör"

- 9-post grid preview
- Renk uyumu analizi ("grid'in çok karışık, daha tutarlı renkler kullanın")
- Alternating content type önerisi (carousel-reel-single-carousel-reel-single)
- Brand color consistency skoru

### 7.4 🎭 Moodboard to Content

Kullanıcı bir moodboard yükler (Pinterest screenshot, collage, referans görseller). AI:
- Renk paleti çıkarır
- Stil tonu analiz eder ("minimal, warm, earthy")
- Bu stile uygun content template'ler önerir
- Görsel brief'leri bu moodboard'a referansla üretir

---

## 8️⃣ Otomasyon & Akıllı Tetikleyiciler

### 8.1 💬 Inbox AI — "DM'lere 30 saniyede marka tonunda yanıt"

```
💬 Yeni DM — @ayse_kaya
━━━━━━━━━━━━━━━━━━━━━━

"Merhaba, çikolatalı pastanız kaç kişilik?"

🤖 AI Yanıt Önerisi:
"Merhaba Ayşe! 🎂 Çikolatalı pastamız 8-10
kişilik ve siparişler 2 gün önceden alınıyor.
Hangi gün için düşünüyorsun? ✨"

[Gönder]  [Düzenle]  [Yoksay]
```

**Gelişmiş versiyonu:**
- Sık sorulan sorular otomatik algılanır → FAQ bank oluşturulur
- Fiyat soruları → otomatik fiyat listesi gönderir
- Randevu talepleri → takvim linki gönderir
- Olumsuz mesajlar → kriz modu, insan operatöre yönlendir

### 8.2 🚨 Crisis Shield — "Negatif dalga erken uyarı"

- Belirli bir sürede normalden fazla olumsuz yorum/DM geldiğinde uyarı
- AI, olumsuz yorumları kategorize eder (ürün şikayeti, servis, genel)
- Kriz yanıt şablonları önerir (özür, açıklama, çözüm)
- "Şu an en hassas konunuz: teslimat gecikmesi. 5 olumsuz yorum son 24 saatte."

### 8.3 🏷️ Smart Hashtag Engine — "Doğru hashtag = doğru kitle"

```
🏷️ Akıllı Hashtag Motoru
━━━━━━━━━━━━━━━━━━━━━━━━

İçeriğiniz: Latte art eğitim Reel

Önerilen Mix (30 hashtag):
  🎯 Niş (10): #latteart #kahvesanati #baristaturk
               #coffeeart #pourlatte ...
  📊 Orta (10): #kahvekulturu #turkishcoffee
               #kahveseverler #coffeelover ...
  🌍 Geniş (5): #coffee #barista #coffeetime ...
  📍 Yerel (5): #kadıköykafe #istanbulcoffee ...

Engagement tahmini: Bu mix ile %23 daha fazla
keşfet erişimi bekleniyor.

[Kopyala]  [Takvime Kaydet]  [Yeni Mix Oluştur]
```

**Fark:** Statik hashtag listeleri değil, her post için **dinamik** ve **performans bazlı** hashtag önerisi. Hangi hashtag'ler kullanıcının geçmişte iyi çalıştığını analiz eder.

### 8.4 👀 Competitor Shadow — "Rakibini sessizce takip et"

Brand DNA'daki rakip bilgilerinden:
- Rakibin son 7 günde ne paylaştığı (public data)
- Hangi içerik türlerinin daha çok etkileşim aldığı
- Rakibin posting frekansı ve saatleri
- "Rakibiniz bu hafta 3 Reel paylaştı, siz 0. Geride kalıyorsunuz."
- Rakibin kullandığı hashtag'lerden ilham

**Önemli:** Bu scraping değil, public Instagram/LinkedIn bilgilerinin yapılandırılmış analizi. Brand DNA'daki `competitor_analysis` alanı zaten var.

---

## ⭐ Tüm Önerilerin Özet Tablosu

| # | Öneri | Kategori | Zorluk | Etki | Rakiplerde Var mı? |
|---|-------|----------|--------|------|---------------------|
| 1.1 | Sektör DNA | AI İçerik | Orta | 🔥🔥🔥🔥🔥 | ❌ Bu derinlikte yok |
| 1.2 | Trend Surfer | AI İçerik | Yüksek | 🔥🔥🔥🔥 | Sprout'ta var ($299+) |
| 1.3 | Caption Lab | AI İçerik | Düşük | 🔥🔥🔥🔥 | ❌ |
| 1.4 | Content Autopilot | AI İçerik | Orta | 🔥🔥🔥🔥🔥 | ❌ Bu seviyede yok |
| 1.5 | Voice Clone | AI İçerik | Orta | 🔥🔥🔥🔥 | ❌ |
| 2.1 | Growth Radar | Büyüme | Orta | 🔥🔥🔥🔥🔥 | ❌ |
| 2.2 | Best Time Engine | Büyüme | Düşük | 🔥🔥🔥 | SocialBee/Sprout'ta var |
| 2.3 | Viral DNA Analiz | Büyüme | Orta | 🔥🔥🔥🔥 | ❌ |
| 2.4 | Follower Journey | Büyüme | Yüksek | 🔥🔥🔥 | Sprout'ta kısmen |
| 3.1 | 1→7 Multiplier | Çoğaltma | Orta | 🔥🔥🔥🔥🔥 | ❌ Bu kalitede yok |
| 3.2 | Evergreen Recycler | Çoğaltma | Düşük | 🔥🔥🔥 | SocialBee'de var |
| 3.3 | Content Remix DJ | Çoğaltma | Düşük | 🔥🔥🔥🔥 | ❌ |
| 3.4 | Story Builder | Çoğaltma | Orta | 🔥🔥🔥🔥 | ❌ |
| 4.1 | Ürün Lansman Otomasyonu | E-Ticaret | Orta | 🔥🔥🔥🔥 | ❌ |
| 4.2 | Stok Bazlı İçerik | E-Ticaret | Orta | 🔥🔥🔥 | ❌ |
| 4.3 | UGC Harvester | E-Ticaret | Yüksek | 🔥🔥🔥 | Sprout'ta var ($299+) |
| 5.1 | Haftalık CEO Raporu | Ekip | Düşük | 🔥🔥🔥🔥 | SocialPilot'ta kısmen |
| 5.2 | Client Portal | Ekip | Orta | 🔥🔥🔥 | Planable/SocialPilot |
| 5.3 | AI Brand Guardian | Ekip | Düşük | 🔥🔥🔥🔥🔥 | ❌ |
| 6.1 | Türkçe NLP | Yerel | Düşük | 🔥🔥🔥🔥🔥 | ❌ |
| 6.2 | Özel Gün Takvimi | Yerel | Düşük | 🔥🔥🔥🔥 | ❌ Türkiye'ye özel yok |
| 6.3 | Yerel İşletme Haritası | Yerel | Orta | 🔥🔥🔥 | ❌ |
| 7.1 | Brand Kit | Tasarım | Orta | 🔥🔥🔥🔥 | SocialBee'de kısmen |
| 7.2 | AI Thumbnail | Tasarım | Orta | 🔥🔥🔥 | ❌ |
| 7.3 | Feed Planner | Tasarım | Düşük | 🔥🔥🔥 | Planable'da var |
| 8.1 | Inbox AI | Otomasyon | Düşük | 🔥🔥🔥🔥 | Sprout'ta var ($199+) |
| 8.2 | Crisis Shield | Otomasyon | Yüksek | 🔥🔥🔥 | Sprout'ta var ($299+) |
| 8.3 | Smart Hashtag Engine | Otomasyon | Düşük | 🔥🔥🔥🔥 | ❌ Bu kalitede yok |
| 8.4 | Competitor Shadow | Otomasyon | Orta | 🔥🔥🔥🔥 | Sprout'ta var ($199+) |

---

## 🎯 En Yüksek ROI Önerileri (İlk Yapılacaklar)

Eğer sadece 5 özellik yapacak olsanız, bunlar en çok fark yaratır:

1. **Sektör DNA** — Onboarding'i devrim niteliğinde iyileştirir, ilk 5 dakika deneyimi
2. **Content Autopilot** — "Marketing ekibim yok ama AI Marketing Manager'ım var" vizyonunun tam karşılığı
3. **Caption Lab** — Mevcut AI generation'a düşük eforla eklenebilir, anında WOW etkisi
4. **1→7 Content Multiplier** — Kullanıcıya en çok zaman kazandıran özellik
5. **AI Brand Guardian** — Güven veren, premium hissettiren, marka tutarlılığı garantisi
