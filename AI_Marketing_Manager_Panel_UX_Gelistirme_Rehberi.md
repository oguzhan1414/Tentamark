# AI Marketing Manager --- Panel / UX / Frontend Geliştirme Rehberi

## 1. Ürünün ana amacı

Ürün yalnızca bir AI post üreticisi veya sosyal medya scheduler
değildir.

**Ana konumlandırma:**

> AI Marketing Manager --- Markanı tanır, pazarlama planı oluşturur,
> içerik üretir, yayınlar, sonuçları analiz eder ve sonraki stratejiyi
> geliştirir.

Ana döngü:

``` text
Brand DNA → Strategy → Content → Approval → Publish → Analytics → AI Insights → New Strategy
```

Temel UX prensibi:

> Kullanıcıya daha fazla araç vermek yerine, daha az karar verdirmek.

------------------------------------------------------------------------

## 2. Önerilen panel yapısı

MVP sidebar:

``` text
🐙 ARMORA

🏠 Ana Sayfa

✨ İçerik Oluştur
📅 Takvim
📋 İçerikler

📊 Analitik
🧠 AI Önerileri

🪪 Marka
🔗 Bağlantılar

⚙ Ayarlar
```

Sonraki sürümler:

-   Kampanyalar
-   AI Marketing Manager
-   Raporlar
-   Ekip
-   Unified Inbox

MVP'de menüyü gereksiz büyütme.

------------------------------------------------------------------------

# 3. Global tasarım sistemi

## Görsel dil

Hedef:

-   Premium
-   Modern
-   AI SaaS
-   Profesyonel
-   Temiz
-   Güven veren
-   Fazla oyuncak/çocuksu olmayan

Ahtapot ürünün maskotu olmalı; fakat her kartta görünmemeli.

## Renkler

``` text
Background:      #F7F7F8
Surface:         #FFFFFF
Primary Text:    #111318
Secondary Text:  #6B7280
Primary:         #6E56CF
Success:         #16A34A
Warning:         #F59E0B
Danger:          #EF4444
Border:          #E8E8EC
```

## Kartlar

Başlangıç:

``` text
border-radius: 12px
border: 1px solid #E8E8EC
background: #FFFFFF
```

Aşırı gölge, neon ve sürekli gradient kullanma.

## Layout

``` text
Desktop

┌──────────────┬─────────────────────────────┐
│   Sidebar    │ Topbar                      │
│              ├─────────────────────────────┤
│              │                             │
│              │       Page Content          │
│              │                             │
└──────────────┴─────────────────────────────┘
```

Öneri:

-   Sidebar: 240--260px
-   Topbar: 64--72px
-   Main content: yaklaşık 1200--1400px
-   Desktop ana kullanım
-   Mobilde bottom navigation

------------------------------------------------------------------------

# 4. Ana Sayfa

## Kullanıcının problemi

> "Şu anda ne oluyor ve bugün ne yapmalıyım?"

Ana sayfa tüm verileri göstermek yerine karar vermeyi kolaylaştırmalı.

### Üst bölüm

``` text
Günaydın, Ahmet 👋

Nova Store için bugün 3 önerim var.

[ Haftalık planı incele ]
```

### KPI

``` text
Erişim       124.8K   ↑ 12%
Etkileşim      6.4%   ↑ 3.2%
Takipçi       +1.2K   ↑ 10%
Planlanan        12   Bu hafta
```

### AI önerisi

``` text
🧠 Bu hafta ne öğrendik?

Carousel içerikleriniz son 30 günde
tek görsel içeriklerden %34 daha fazla
etkileşim aldı.

Önerim:
Bu hafta 2 carousel planlayalım.

[ İçerik Planı Oluştur ]
```

### Bugün

``` text
10:00  Instagram
       Yeni koleksiyon carousel
       ✓ Yayınlandı

15:00  LinkedIn
       Ürün hikayesi
       ● Onay bekliyor

19:00  TikTok
       Ürün videosu
       ● Planlandı
```

### Bekleyen işlemler

``` text
3 içerik onayı
1 bağlantı yenileme
1 haftalık plan onayı
```

Ana sayfa = günlük kontrol merkezi.

------------------------------------------------------------------------

# 5. İçerik Oluştur

## Kullanıcının problemi

> "Ne paylaşacağım?"

Klasik ChatGPT prompt kutusu yapılmamalı.

### İlk ekran

``` text
Yeni İçerik

Ne yapmak istiyorsun?

○ Ürün tanıt
○ Eğitim ver
○ Marka hikayesi
○ Kampanya duyur
○ Etkileşim artır
○ AI'a bırak

Konu:
[ Yeni yaz koleksiyonumuzu tanıtmak istiyorum ]

Platformlar:
☑ Instagram
☑ Facebook
☑ LinkedIn
☐ TikTok
☐ Pinterest

[ AI ile Oluştur ]
```

### AI üretim durumu

``` text
ARMORA düşünüyor...

✓ Marka kimliği analiz edildi
✓ Hedef kitle kontrol edildi
✓ Son içerik performansı incelendi
✓ Instagram formatı seçildi
✓ LinkedIn versiyonu hazırlanıyor
```

### Sonuç

Sol tarafta içerik preview:

``` text
Instagram

[ Görsel ]

Yeni sezon geldi.

Daha sade.
Daha zamansız.
Daha sen.

Caption...
#yenisezon #minimalstyle
```

Sağ tarafta:

``` text
AI ÖNERİSİ

✓ Carousel öneriliyor
✓ 19:00 öneriliyor
✓ CTA eklenmesi öneriliyor

Neden?
Son 30 günlük performansa göre...
```

Aksiyonlar:

-   Düzenle
-   Yeniden Üret
-   Onaya Gönder
-   Takvime Ekle

------------------------------------------------------------------------

# 6. Takvim

## Kullanıcının problemi

> "Hangi içerik ne zaman yayınlanacak?"

Takvim operasyon merkezi olmalı.

## Görünümler

MVP:

-   Hafta
-   Ay

Varsayılan: Hafta

## Filtreler

``` text
[Tümü]
Instagram
Facebook
TikTok
LinkedIn
Pinterest

[Taslak]
[Onay bekliyor]
[Planlandı]
[Yayınlandı]
```

## İçeriğe tıklama

Sağ drawer:

``` text
Instagram

Yeni Koleksiyon

[ Görsel ]

Caption...

Yayın zamanı:
12 Eylül · 19:00

Durum:
✓ Onaylandı

[ Düzenle ]
[ Şimdi Yayınla ]
[ Zamanı Değiştir ]
```

## AI ile takvimi doldur

Boş gün:

``` text
Perşembe günü içerik boş.

Marka stratejine göre bu güne
bir içerik önerebilirim.

[ AI ile Doldur ]
```

Takvim sadece scheduler değil, planlama asistanı olmalı.

------------------------------------------------------------------------

# 7. İçerikler

## Amaç

Takvim "ne zaman?" sorusunu çözer.

İçerikler sayfası:

> "Sistemde hangi içerikler var?"

Filtreler:

``` text
Tümü
Taslak
Onay Bekliyor
Onaylandı
Planlandı
Yayınlandı
Hatalı
```

Liste:

``` text
İçerik | Platform | Durum | Tarih | Sonuç | İşlem
```

Kart veya liste görünümü kullanılabilir.

Çok içerikte liste görünümü daha kullanışlıdır.

------------------------------------------------------------------------

# 8. Kampanyalar

## Kullanıcının problemi

> "Bu pazarlama hedefini nasıl yöneteceğim?"

Örnek:

``` text
Yeni Sezon Lansmanı

12 Eylül → 30 Eylül

Amaç:
Yeni koleksiyonu duyurmak

Hedef:
18–30 yaş

KPI:
Website ziyaretleri

12 içerik
8 yayınlandı
3 planlandı
1 taslak
```

AI:

> Kampanyanın ilk haftası ürün tanıtımı ağırlıklı. İkinci haftaya sosyal
> kanıt ve müşteri hikayeleri eklemeyi öneriyorum.

MVP'de basit tutulabilir.

------------------------------------------------------------------------

# 9. Analitik

## Kullanıcının problemi

> "Ne oldu?"

KPI:

``` text
Erişim       523K   ↑ 24%
Etkileşim     32K   ↑ 18%
Takipçi      +4.2K  ↑ 12%
Tıklama      12.6K  ↑ 32%
```

## Platform karşılaştırması

Instagram / TikTok / LinkedIn / Pinterest

## Zaman serisi

Filtreler:

-   7 gün
-   30 gün
-   90 gün
-   Özel

Metrikler:

-   Reach
-   Impressions
-   Engagement
-   Followers
-   Clicks
-   Views

## En iyi içerikler

``` text
1. Yeni Koleksiyon — 12.4K engagement
2. Müşteri Hikayesi — 10.8K
3. Ürün Kullanımı — 9.7K
```

## AI analiz

``` text
🧠 Pazarlama Özeti

Son 30 günün performansını inceledim.

Carousel içerikleriniz tek görsellere göre
daha yüksek etkileşim sağlıyor.

Ürün odaklı içerikleriniz,
bilgilendirici içeriklerden daha düşük performans gösteriyor.

En iyi zaman:
18:00–20:00

Önerim:
2 carousel
1 eğitim
1 müşteri hikayesi
1 ürün tanıtımı

[ Bu planı oluştur ]
```

Analytics = ne oldu?

------------------------------------------------------------------------

# 10. AI Önerileri / Insights

Analytics'ten farkı:

``` text
Analytics → NE OLDU?
Insights  → NEDEN OLDU? NE YAPMALIYIZ?
```

Örnek:

``` text
💡 İçgörü #18

Carousel içerikleriniz
%34 daha yüksek engagement aldı.

Muhtemel nedenler:
• İlk slide güçlü
• Daha fazla kaydetme
• Daha fazla paylaşım

Öneri:
Gelecek hafta 2 carousel deneyelim.

[ Planı Uygula ]
```

Insight durumları:

``` text
Yeni
İncelendi
Uygulandı
Reddedildi
```

------------------------------------------------------------------------

# 11. AI Marketing Manager

Klasik chatbot değil.

Amaç:

> Kullanıcıya yanında sürekli çalışan bir pazarlama yöneticisi hissi
> vermek.

Örnek:

``` text
🧠 ARMORA

Markanı analiz ettim.

Bu hafta için 4 önceliğim var:

01 Instagram etkileşimini artır
02 Ürün içeriklerini hikayeli hale getir
03 LinkedIn'de uzmanlık içeriğini artır
04 Haftalık paylaşım sıklığını 4 → 5 yap
```

Kullanıcı:

> Neden Instagram?

AI:

> Son 8 carousel ortalamanız normal postlara göre daha yüksek kaydetme
> ve paylaşma oranına sahip.

Hızlı aksiyonlar:

``` text
[ İçerik fikri üret ]
[ Caption yaz ]
[ Hashtag öner ]
[ Rakipleri analiz et ]
[ Haftalık strateji oluştur ]
[ Performansı yorumla ]
```

Bu butonlar gerçek backend action'larına bağlanmalı; sadece prompt
doldurmamalı.

------------------------------------------------------------------------

# 12. Marka

## Kullanıcının problemi

> "AI markamı doğru tanıyor mu?"

Sekmeler:

``` text
Marka Bilgileri
Marka DNA
Hedef Kitle
Konumlandırma
Ton & Dil
İçerik Sütunları
Görsel Kimlik
```

Marka bilgileri:

-   Marka adı
-   Website
-   Sektör
-   Ürün/hizmet
-   Lokasyon
-   Hedef pazar

Brand DNA:

``` text
Modern
Minimal
Güvenilir
Eğlenceli
Kurumsal
```

Tone:

``` text
Profesyonel ─────●── Samimi
Ciddi ───────●──── Eğlenceli
Teknik ─────●───── Basit
```

Görsel kimlik:

-   Logo
-   Ana renk
-   İkincil renk
-   Font
-   Fotoğraf stili
-   Görsel kurallar

Bu alan AI generation'ın temel veri kaynağıdır.

------------------------------------------------------------------------

# 13. Bağlantılar

## Amaç

Sosyal hesapları yönetmek.

``` text
Instagram
@novastore
🟢 Bağlı

Facebook
Nova Store
🟢 Bağlı

LinkedIn
Nova Store
🟢 Bağlı

TikTok
🔴 Bağlanmadı

Pinterest
🔴 Bağlanmadı
```

Kart:

``` text
Instagram
@novastore

● Bağlı
Son kontrol: 2 dakika önce

[ Yönet ] [ Yenile ]
```

Token, OAuth, API scope gibi teknik detaylar kullanıcıya gösterilmez.

Hata:

``` text
⚠ Instagram bağlantısının süresi dolmuş olabilir.

Yayınlama işlemleri durduruldu.

[ Bağlantıyı Yenile ]
```

------------------------------------------------------------------------

# 14. Ayarlar

MVP:

``` text
Profil
Workspace
Bildirimler
Abonelik
Güvenlik
```

Sonraki:

``` text
Ekip
Roller
API
Webhooks
Audit Log
```

------------------------------------------------------------------------

# 15. Onboarding

Yeni kullanıcı doğrudan boş dashboard'a atılmamalı.

## Adım 1

``` text
Markanızın pazarlama yöneticisini oluşturalım.

Birkaç bilgi verin,
geri kalanını AI ile analiz edelim.

[ Başla ]
```

## Adım 2

-   Marka adı
-   Website
-   Sektör
-   Ürün/hizmet

## Adım 3

-   Yaş
-   Lokasyon
-   İlgi alanları
-   Müşteri tipi

## Adım 4

``` text
Profesyonel ↔ Samimi
Ciddi ↔ Eğlenceli
Teknik ↔ Basit
```

## Adım 5

``` text
Instagram [ Bağla ]
Facebook  [ Bağla ]
LinkedIn  [ Bağla ]
TikTok    [ Bağla ]
Pinterest [ Bağla ]
```

Bağlanmayan platform onboarding'i engellememeli.

## Adım 6

``` text
Markanı analiz ediyorum...

✓ Website incelendi
✓ Marka bilgileri oluşturuldu
✓ Hedef kitle profili çıkarıldı
✓ İçerik sütunları oluşturuldu
✓ İlk strateji hazırlandı
```

## Adım 7

``` text
Markanız için ilk haftaya
5 içerik öneriyorum.

[ Planı Gör ]
```

------------------------------------------------------------------------

# 16. Content Status → UI

Backend:

``` text
IDEA
GENERATING
DRAFT
NEEDS_REVIEW
APPROVED
SCHEDULED
PUBLISHED
ANALYZED
```

UI:

``` text
Fikir
Üretiliyor
Taslak
Onay Bekliyor
Onaylandı
Planlandı
Yayınlandı
Analiz Edildi
```

Hata:

``` text
FAILED → Yayınlama Hatası
```

Platformlar farklı sonuç verebilir:

``` text
Instagram ✓ Published
LinkedIn  ✓ Published
TikTok    ✕ Failed
```

Genel:

``` text
PARTIALLY_PUBLISHED
```

------------------------------------------------------------------------

# 17. Content Detail

Önerilen yapı:

``` text
┌──────────────────────────────────────────────┐
│ İçerik Başlığı                     [Durum]   │
├────────────────────────┬─────────────────────┤
│                        │ Platformlar          │
│      Preview            │ Instagram ✓         │
│                        │ LinkedIn ✓           │
│                        │ TikTok ✕             │
├────────────────────────┤                     │
│ Caption                │ Yayın zamanı        │
│                        │ 12 Eyl · 19:00      │
│ Hashtags               │                     │
│                        │ [ Düzenle ]         │
│                        │ [ Onayla ]          │
└────────────────────────┴─────────────────────┘
```

------------------------------------------------------------------------

# 18. AI Content Flow

UI tek bir "Generate" işlemi gibi görünse de backend'de:

``` text
Brand DNA
 ↓
Positioning
 ↓
Content Strategy
 ↓
Idea
 ↓
Platform Adaptation
 ↓
Generation
 ↓
Quality Gate
 ↓
Draft
```

UI'da sadece kullanıcı için anlamlı ilerleme göster:

``` text
✓ Marka analiz edildi
✓ Strateji kontrol edildi
✓ Platforma uyarlandı
✓ Brand voice kontrol edildi
```

Prompt ve sistem detaylarını göstermeye gerek yok.

------------------------------------------------------------------------

# 19. Analytics → Learning Loop

Ürünün en önemli uzun vadeli özelliği:

``` text
CONTENT
 ↓
PUBLISH
 ↓
ANALYTICS
 ↓
AI ANALYSIS
 ↓
INSIGHT
 ↓
STRATEGY UPDATE
 ↓
NEW CONTENT
```

Örnek:

``` text
Carousel ↑ Engagement
Single Image ↓ Engagement

AI:
Carousel içeriklerinin daha iyi
performans gösterdiğini tespit etti.

Yeni öneri:
Haftada 2 carousel.
```

Bu öğrenme sonraki generation aşamasında kullanılmalı.

------------------------------------------------------------------------

# 20. Hata / Loading / Empty State

## Hata

Kötü:

``` text
Error
```

İyi:

``` text
Instagram yayınlanamadı.

Neden:
Bağlantının süresi dolmuş olabilir.

Ne yapabilirsiniz:
Instagram hesabınızı yeniden bağlayın.

[ Bağlantıyı Yenile ]
```

## Loading

AI:

``` text
Analiz ediliyor...
```

Dashboard:

-   KPI skeleton
-   chart skeleton
-   insight skeleton

Publish:

``` text
Instagram'a gönderiliyor...
```

Success:

``` text
✓ Instagram'da yayınlandı
```

## Empty state

Analytics:

``` text
Henüz yeterli veri yok.

İlk içeriklerinizi yayınlayın.
Performans verileri geldikçe
burada analiz edeceğiz.

[ İçerik Oluştur ]
```

Calendar:

``` text
Takvim boş.

AI'ın sizin için ilk haftayı
planlamasını ister misiniz?

[ İlk Planı Oluştur ]
```

------------------------------------------------------------------------

# 21. Frontend Component Yapısı

``` text
components/
├── layout/
│   ├── Sidebar
│   ├── Topbar
│   └── PageContainer
│
├── dashboard/
│   ├── KpiCard
│   ├── AiInsightCard
│   ├── TodaySchedule
│   └── QuickActions
│
├── content/
│   ├── ContentCard
│   ├── ContentEditor
│   ├── ContentPreview
│   ├── PlatformTabs
│   ├── StatusBadge
│   └── ApprovalActions
│
├── calendar/
│   ├── CalendarView
│   ├── CalendarFilters
│   └── ContentDrawer
│
├── analytics/
│   ├── MetricCard
│   ├── PerformanceChart
│   ├── PlatformComparison
│   └── AiAnalysis
│
├── brand/
│   ├── BrandProfile
│   ├── BrandDNA
│   ├── ToneSelector
│   └── VisualIdentity
│
├── connections/
│   ├── SocialAccountCard
│   ├── ConnectionStatus
│   └── ConnectionError
│
└── ai/
    ├── AiAssistant
    ├── AiMessage
    ├── AiAction
    └── InsightCard
```

------------------------------------------------------------------------

# 22. Route Yapısı

``` text
(auth)/
├── login
├── register
└── onboarding

dashboard/
├── page.tsx
├── compose/
│   └── page.tsx
├── calendar/
│   └── page.tsx
├── content/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx
├── analytics/
│   └── page.tsx
├── insights/
│   └── page.tsx
├── brand/
│   └── page.tsx
├── connections/
│   └── page.tsx
└── settings/
    └── page.tsx
```

------------------------------------------------------------------------

# 23. Geliştirme Sırası

## Faz 1 --- App Shell

-   Sidebar
-   Topbar
-   Routing
-   Theme
-   Button
-   Card
-   Modal
-   Drawer
-   Toast
-   Loading
-   Empty state
-   Error state

## Faz 2 --- Ana Sayfa

-   Greeting
-   KPI
-   AI insight
-   Today schedule
-   Quick actions

## Faz 3 --- Marka

-   Brand profile
-   Brand DNA
-   Target audience
-   Tone
-   Visual identity

## Faz 4 --- Content

-   Create content
-   AI generation
-   Preview
-   Edit
-   Platform adaptation
-   Approval

## Faz 5 --- Calendar

-   Week
-   Month
-   Filters
-   Drawer
-   Drag/drop
-   Reschedule

## Faz 6 --- Connections

-   Instagram
-   Facebook
-   LinkedIn
-   OAuth
-   Connection status
-   Token health

## Faz 7 --- Publishing

-   Schedule
-   Queue
-   Publish
-   Retry
-   Failure UI
-   Partial publish

## Faz 8 --- Analytics

-   KPI
-   Charts
-   Platform comparison
-   Top content
-   AI analysis

## Faz 9 --- AI Learning

-   Insights
-   Performance interpretation
-   Strategy update
-   Next content recommendations

------------------------------------------------------------------------

# 24. MVP'de yapılmaması gerekenler

``` text
❌ 15+ platform
❌ Unified Inbox
❌ Video generation engine
❌ Browser automation
❌ Çok gelişmiş workflow builder
❌ Enterprise permissions
❌ Gelişmiş reklam yönetimi
❌ Çok karmaşık campaign management
❌ Calendar'ı sıfırdan yazmak
❌ Gereksiz Redis/worker karmaşası
❌ Her özelliğe AI eklemek
```

İlk hedef:

``` text
Instagram
Facebook
LinkedIn
```

ile uçtan uca çalışan sistem.

------------------------------------------------------------------------

# 25. MVP başarı kriteri

Kullanıcı:

``` text
1. Kayıt olur
↓
2. Marka oluşturur
↓
3. Brand DNA oluşturulur
↓
4. Sosyal hesap bağlar
↓
5. AI strateji oluşturur
↓
6. AI içerik fikirleri oluşturur
↓
7. İçerikleri inceler
↓
8. Onaylar
↓
9. Takvime yerleştirir
↓
10. Scheduler çalışır
↓
11. İçerik yayınlanır
↓
12. Analytics gelir
↓
13. AI sonucu yorumlar
↓
14. Yeni öneri oluşturur
```

Bu akış çalışıyorsa ürünün temel vaadi kanıtlanmıştır.

------------------------------------------------------------------------

# 26. Tasarım sırasında ana kural

Her sayfa şu sırayla tasarlanmalı:

1.  Sayfanın amacı
2.  Kullanıcı problemi
3.  Kullanıcı journey
4.  Wireframe
5.  Component listesi
6.  Backend endpointleri
7.  Database ilişkileri
8.  Loading state
9.  Empty state
10. Error state
11. Success state
12. Responsive
13. Accessibility
14. Test

Sadece güzel görünen ekran tamamlanmış sayılmaz.

------------------------------------------------------------------------

# 27. Ürünün ana UX cümlesi

> **"Kullanıcıya daha fazla özellik değil, daha az iş yaptır."**

Kötü:

``` text
Post oluştur
Caption yaz
Hashtag seç
Format seç
Platform seç
Saat seç
Takvime koy
Analytics bak
```

İyi:

``` text
ARMORA:
Bu hafta için 5 içerik öneriyorum.

Neden:
Geçen haftanın performansı bunu gösteriyor.

[ Planı Oluştur ]

↓

İçerikler hazır.

[ Tümünü İncele ]

↓

3 onaylandı.
2 tanesi önerilere göre değiştirildi.

[ Planla ]

↓

Yayınlandı.

↓

Sonuç:
Carousel performansı yükseldi.

[ Gelecek Haftayı Oluştur ]
```

------------------------------------------------------------------------

# 28. Son ürün hiyerarşisi

``` text
NE OLUYOR?
↓
Ana Sayfa

NE YAPMALIYIM?
↓
AI Önerileri

NE YAYINLAYACAĞIZ?
↓
İçerik Oluştur

NE ZAMAN?
↓
Takvim

NE YAYINLANDI?
↓
İçerikler

NASIL PERFORMANS GÖSTERDİ?
↓
Analitik

NE ÖĞRENDİK?
↓
Insights

GELECEKTE NE YAPACAĞIZ?
↓
AI Strategy
```

------------------------------------------------------------------------

# 29. Son geliştirme hedefi

Panel bir "sosyal medya araç kutusu" gibi değil:

> **"Dijital pazarlama yöneticimin çalışma masası"**

gibi hissettirmeli.

Temel deneyim:

``` text
Markamı tanıtıyorum
↓
AI markamı öğreniyor
↓
AI strateji oluşturuyor
↓
AI içerik üretiyor
↓
Ben kontrol ediyorum
↓
AI yayınlıyor
↓
Sonuçları ölçüyor
↓
AI öğreniyor
↓
Yeni plan öneriyor
```

**Ana hedef: Daha çok özellik değil, daha az kullanıcı emeği.**
