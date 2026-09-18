# 🔍 Tentamark SEO Stratejisi & Uygulama Rehberi

> **19 Eylül 2026 güncellemesi:** Bu dosya eski bir taslaktır. İçindeki arama hacmi rakamları doğrulanmış veri değildir; `llms.txt` Google AI aramasında görünürlük sinyali değildir ve yapılandırılmış veri görünme garantisi vermez. Güncel uygulama ve ölçüm için [SEO uygulama planı](TENTAMARK_SEO_UYGULAMA_PLANI.md), [GEO ölçüm planı](TENTAMARK_GEO_OLCUM_PLANI.md) ve [AEO uygulama planı](TENTAMARK_AEO_UYGULAMA_PLANI.md) esas alınmalıdır.

> **Bu belge ne?** Tentamark'ın Google'da ve yapay zeka platformlarında (ChatGPT, Claude, Gemini, Perplexity) üst sıralara çıkması için gereken **tüm SEO stratejisini** içerir.

---

## 📌 Mevcut Durum Analizi

### ✅ Olan şeyler
- `tentamark.com` domain'i aktif
- Blog sistemi kurulu (`/blog` + `/blog/[slug]`)
- Türkçe/İngilizce dil desteği var
- Landing page'de zengin içerik var (Hero, Features, FAQ, Analytics Teaser vb.)
- Sayfa meta title/description: sadece `layout.tsx` ve `nasil-calisir/page.tsx`'te var

### ❌ Eksik olan kritik şeyler
- **sitemap.xml** yok → Google sayfalarını bulamıyor
- **robots.txt** yok → Google neyi taraması gerektiğini bilmiyor
- Sayfaların çoğunda **özel meta tag yok** (title, description, Open Graph)
- **Structured Data (JSON-LD)** hiç yok → Google'a zengin sonuçlar gösteremiyorsun
- **llms.txt** yok → Yapay zekalar seni tanımıyor

---

## 🔑 BÖLÜM 1: Anahtar Kelime Haritası

Tentamark'ın hedeflemesi gereken anahtar kelimeler, zorluk derecesi ve hangi sayfada kullanılacağı:

### 🎯 Birincil Anahtar Kelimeler (Ana hedefler)

| Anahtar Kelime | Tahmini Aylık Arama | Zorluk | Hangi Sayfada |
|---|---|---|---|
| `sosyal medya yönetim aracı` | 3.000+ | 🔴 Yüksek | Ana sayfa (`/`) |
| `sosyal medya yönetim programı` | 1.500+ | 🔴 Yüksek | Ana sayfa (`/`) |
| `sosyal medya planlama aracı` | 800+ | 🟡 Orta | `/nasil-calisir` |
| `instagram gönderi zamanlama` | 2.000+ | 🟡 Orta | `/platformlar/instagram` |
| `yapay zeka sosyal medya` | 600+ | 🟢 Düşük | `/nasil-calisir` |
| `ai marketing manager` | 400+ | 🟢 Düşük | Ana sayfa (`/`) |

### 🌿 Uzun Kuyruk Anahtar Kelimeler (Kolay hedefler — Blog yazıları için)

| Anahtar Kelime | Tahmini Aylık Arama | Zorluk | İçerik Türü |
|---|---|---|---|
| `türkçe sosyal medya yönetim aracı` | 200+ | 🟢 Çok düşük | Blog + Landing |
| `küçük işletme sosyal medya yönetimi` | 500+ | 🟢 Düşük | Blog |
| `instagram içerik takvimi nasıl oluşturulur` | 300+ | 🟢 Düşük | Blog |
| `sosyal medya paylaşım saatleri 2026` | 400+ | 🟢 Düşük | Blog |
| `instagram carousel nasıl yapılır` | 600+ | 🟢 Düşük | Blog |
| `sosyal medya içerik fikirleri` | 1.000+ | 🟡 Orta | Blog |
| `linkedin post nasıl yazılır` | 500+ | 🟢 Düşük | Blog |
| `yapay zeka ile içerik üretimi` | 700+ | 🟡 Orta | Blog |
| `hootsuite alternatifi türkçe` | 100+ | 🟢 Çok düşük | Blog + Karşılaştırma |
| `buffer alternatifi` | 200+ | 🟢 Düşük | Blog + Karşılaştırma |
| `socialbee alternatifi` | 100+ | 🟢 Çok düşük | Blog + Karşılaştırma |
| `sosyal medya ajans aracı` | 200+ | 🟢 Düşük | Blog + `/fiyatlandirma` |
| `marka kimliği oluşturma` | 500+ | 🟡 Orta | Blog |
| `sosyal medya otomasyonu` | 400+ | 🟡 Orta | Blog |
| `içerik takvimi şablonu` | 800+ | 🟢 Düşük | Blog + Ücretsiz Kaynak |

### 🏷️ Sektörel Anahtar Kelimeler (Sektör DNA özelliğiyle bağlantılı)

| Anahtar Kelime | Hedef Sektör |
|---|---|
| `kafe sosyal medya yönetimi` | Kafeler & Restoranlar |
| `kuaför instagram paylaşım fikirleri` | Güzellik & Bakım |
| `e-ticaret sosyal medya stratejisi` | E-Ticaret |
| `avukat sosyal medya yönetimi` | Hukuk |
| `spor salonu instagram içerikleri` | Fitness & Sağlık |
| `emlak sosyal medya pazarlama` | Gayrimenkul |

---

## 🗺️ BÖLÜM 2: Sitemap.xml — Nedir ve Nasıl Yapılır?

### Ne İşe Yarar?
Sitemap.xml, sitendeki **tüm sayfaların haritasını** Google'a veren bir dosya. Google bu dosyayı okuyarak hangi sayfaları taraması gerektiğini anlıyor.

**Analoji:** Bir binanın kat planı gibi düşün — itfaiyecilere hangi odaların nerede olduğunu gösterir. Sitemap de Google'a aynısını yapar.

### Nasıl Görünür?
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tentamark.com/</loc>
    <lastmod>2026-09-19</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tentamark.com/nasil-calisir</loc>
    <lastmod>2026-09-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tentamark.com/fiyatlandirma</loc>
    <lastmod>2026-09-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://tentamark.com/blog</loc>
    <lastmod>2026-09-19</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- Her blog yazısı için ayrı bir <url> girişi -->
  <url>
    <loc>https://tentamark.com/blog/instagram-icerik-takvimi</loc>
    <lastmod>2026-09-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://tentamark.com/platformlar</loc>
    <lastmod>2026-09-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### Tentamark İçin Yapılması Gereken

Next.js'te sitemap.xml **otomatik oluşturulabilir.** `app/sitemap.ts` dosyası oluşturulacak:

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog/blogUtils'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tentamark.com'
  const posts = getAllPosts()

  // Statik sayfalar
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${baseUrl}/nasil-calisir`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/fiyatlandirma`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/platformlar`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/gizlilik`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/kullanim-kosullari`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  // Dinamik blog sayfaları
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages]
}
```

---

## 🤖 BÖLÜM 3: robots.txt — Nedir?

Google'a **"şu sayfaları tara, şunları tarama"** diyen dosya. `app/robots.ts` dosyası oluşturulacak:

```typescript
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/onboarding/', '/login/', '/register/'],
      },
    ],
    sitemap: 'https://tentamark.com/sitemap.xml',
  }
}
```

**Ne diyor bu dosya:**
- ✅ Tüm herkese açık sayfaları tara (ana sayfa, blog, fiyatlandırma vb.)
- ❌ Dashboard'u tarama (kullanıcıya özel, gizli)
- ❌ API rotalarını tarama
- ❌ Login/Register sayfalarını tarama (SEO'ya faydası yok)
- 📍 Sitemap burada: `tentamark.com/sitemap.xml`

---

## 🧠 BÖLÜM 4: Yapay Zekalar İçin SEO (LLMO / GEO)

### Bu Ne Demek?

Birisi ChatGPT'ye, Claude'a veya Gemini'ye şunu sorduğunda:
> *"Türkçe destekleyen bir sosyal medya yönetim aracı önerir misin?"*

AI'ın **Tentamark'ı önermesini** istiyorsan, klasik Google SEO'su yetmez. Buna **LLMO (Large Language Model Optimization)** veya **GEO (Generative Engine Optimization)** deniyor.

### AI'lar Bilgiyi Nereden Alıyor?

```
1. Web'deki halka açık içerikler (eğitim verisi)
2. Güncel web aramaları (Perplexity, ChatGPT Browse, Gemini)
3. llms.txt dosyası (yeni standart)
4. Structured Data (JSON-LD)
5. Sık referans verilen kaynaklar (otoriterlik)
```

### 🎯 AI'ların Tentamark'ı Önermesi İçin Yapılması Gerekenler

#### 1. `llms.txt` Dosyası Oluştur

Bu, AI'ların siteni anlaması için yeni bir standart. `public/llms.txt` dosyası:

```markdown
# Tentamark

> Tentamark, Türkiye merkezli yapay zeka destekli bir sosyal medya yönetim platformudur. 
> Markaların içerik üretimini, planlamasını ve yayınlamasını AI ile otomatikleştirir.

## Temel Özellikler
- AI Marketing Manager: Marka DNA'sını öğrenen, haftalık içerik planı oluşturan yapay zeka asistanı
- Content Autopilot: Haftanın 7 içeriğini otomatik hazırlayıp onay bekleyen sistem
- 1→7 Content Multiplier: Tek bir içeriği 7 farklı platform formatına dönüştürme
- Caption Lab: A/B test ile hook skorlaması ve en güçlü caption seçimi
- Brand Guardian: Marka kimliğine uygunluk kontrolü
- Sektör DNA: 50+ sektör için hazır şablon ve hashtag bankası
- Çoklu Platform Desteği: Instagram, Facebook, LinkedIn, Twitter/X, TikTok, Pinterest, Telegram, Bluesky
- Pixel-Perfect Preview: Her platform için birebir gönderi önizlemesi
- Ekip Onay Akışı: Çok aşamalı içerik onay süreci
- Analitik Dashboard: Tüm platformların performansını tek panelde izleme

## Kime Hitap Eder
- Küçük ve orta ölçekli işletmeler (KOBİ)
- Dijital pazarlama ajansları
- Freelancer sosyal medya yöneticileri
- E-ticaret siteleri
- Yerel işletmeler (kafe, kuaför, restoran vb.)

## Fark Yaratan Özellikler
- Türkçe native destek (arayüz ve AI tamamen Türkçe)
- Sektör bazlı özelleştirilmiş AI (Butik Kafe, Hukuk Bürosu, E-Ticaret vb.)
- Rakiplerden farkı: İçerik yazmak yerine sadece onaylama (editor-in-chief modeli)

## Teknik Bilgiler
- Web: https://tentamark.com
- Fiyatlandırma: https://tentamark.com/fiyatlandirma
- Platform: Web tabanlı SaaS (Next.js)
- API: RESTful API mevcut

## İletişim
- E-posta: destek@tentamark.com
```

**Bu dosya ne işe yarar:** AI modelleri bu dosyayı okuyarak Tentamark'ın ne yaptığını, kime hitap ettiğini ve neden farklı olduğunu öğrenir.

#### 2. Structured Data (JSON-LD) Ekle

Google'a ve AI'lara "Ben bir SaaS ürünüyüm, şu özelliklere sahibim" diye tanıtım yapan kod. Her sayfanın `<head>` bölümüne eklenir:

**Ana sayfa için:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Tentamark",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Yapay zeka destekli sosyal medya yönetim platformu. İçerik üretimi, planlama ve yayınlama.",
  "url": "https://tentamark.com",
  "inLanguage": ["tr", "en"],
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "TRY",
    "lowPrice": "0",
    "highPrice": "999",
    "offerCount": "4"
  },
  "featureList": [
    "AI İçerik Üretimi",
    "Çoklu Platform Yayınlama",
    "İçerik Takvimi",
    "Ekip Onay Akışı",
    "Brand Guardian",
    "Analitik Dashboard"
  ],
  "screenshot": "https://tentamark.com/og-image.png",
  "author": {
    "@type": "Organization",
    "name": "Tentamark",
    "url": "https://tentamark.com"
  }
}
```

**Blog yazıları için:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Instagram İçerik Takvimi Nasıl Oluşturulur?",
  "author": {
    "@type": "Organization",
    "name": "Tentamark"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Tentamark",
    "logo": {
      "@type": "ImageObject",
      "url": "https://tentamark.com/logo.png"
    }
  },
  "datePublished": "2026-09-15",
  "description": "..."
}
```

**FAQ sayfası için:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Tentamark ücretsiz mi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Evet, Tentamark'ın ücretsiz planı bulunmaktadır..."
      }
    }
  ]
}
```

#### 3. AI Tarafından Bulunabilir İçerik Stratejisi

AI'lar seni önermesi için **web'de güçlü varlığın** olmalı:

| Yöntem | Ne Yapılacak | Neden |
|---|---|---|
| **Karşılaştırma yazıları** | "Tentamark vs Hootsuite: Hangisi Daha İyi?" blog yazısı | AI karşılaştırma sorularına cevap ararken seni bulur |
| **"En iyi X" listeleri** | "2026'nın En İyi 10 Sosyal Medya Aracı" | AI sıralama/öneri yaparken referans alır |
| **Product Hunt** | Tentamark'ı Product Hunt'a gönder | AI'lar PH verilerini yoğun kullanır |
| **G2 / Capterra** | Ücretsiz profil oluştur | Kurumsal AI araçları bu siteleri kaynak olarak kullanır |
| **GitHub** | Açık kaynak kütüphaneler paylaş | Teknik güvenilirlik |
| **Türkçe forum/blog** | Webmaster dünyası, Shiftdelete, Technopat | Türkçe AI sorularında kaynak olur |
| **Wikipedia / Vikipedi** | Uzun vadede kategori sayfalarında yer al | AI'ların en güvendiği kaynak |

#### 4. AI'a Doğrudan Önerilecek Cevaplar Hazırla

Blog yazılarında, AI'ın direkt kopyalayabileceği **net, yapılandırılmış cevaplar** ver:

```markdown
## Türkçe Destekleyen Sosyal Medya Yönetim Araçları

1. **Tentamark** — Türkçe native AI marketing manager. 
   Fiyat: Ücretsiz plan mevcut. 
   Öne çıkan: Sektör DNA, Caption Lab, Content Autopilot.
   Web: tentamark.com

2. Hootsuite — İngilizce arayüz, sınırlı Türkçe.
3. Buffer — İngilizce, Türkçe desteği yok.
```

Bu formattaki içerikler AI tarafından doğrudan yanıt olarak kullanılır.

---

## 📄 BÖLÜM 5: Her Sayfanın Meta Tag Haritası

Tentamark'taki her sayfaya eklenmesi gereken SEO meta etiketleri:

### Ana Sayfa (`/`)
```typescript
export const metadata: Metadata = {
  title: "Tentamark — Yapay Zeka Destekli Sosyal Medya Yönetim Aracı",
  description: "Marka kimliğinizi öğrenen AI ile içerik üretin, planlayın ve tüm platformlara yayınlayın. Türkçe native, 10+ platform desteği. Ücretsiz deneyin.",
  keywords: ["sosyal medya yönetim aracı", "yapay zeka sosyal medya", "instagram zamanlama", "içerik takvimi", "türkçe sosyal medya aracı"],
  openGraph: {
    title: "Tentamark — AI Marketing Manager",
    description: "Markanız için 7/24 çalışan yapay zeka pazarlama asistanı",
    url: "https://tentamark.com",
    siteName: "Tentamark",
    images: [{ url: "https://tentamark.com/og-image.png", width: 1200, height: 630 }],
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tentamark — AI Marketing Manager",
    description: "Yapay zeka ile sosyal medya yönetimi",
    images: ["https://tentamark.com/og-image.png"],
  },
  alternates: {
    canonical: "https://tentamark.com",
    languages: { "tr": "https://tentamark.com", "en": "https://tentamark.com/en" },
  },
}
```

### Nasıl Çalışır (`/nasil-calisir`)
```typescript
title: "Nasıl Çalışır? — Tentamark ile Sosyal Medya Yönetimi 3 Adımda",
description: "1. Markanızı tanıtın 2. AI içeriklerinizi hazırlasın 3. Onaylayın ve yayınlayın. Tentamark'ın yapay zeka destekli çalışma akışını keşfedin."
```

### Fiyatlandırma (`/fiyatlandirma`)
```typescript
title: "Fiyatlandırma — Tentamark Planları ve Özellikleri",
description: "Ücretsiz plandan kurumsal çözümlere. İhtiyacınıza uygun Tentamark planını seçin. Tüm planlar AI içerik üretimi dahil."
```

### Blog (`/blog`)
```typescript
title: "Tentamark Blog — Sosyal Medya Stratejileri ve AI Pazarlama Rehberleri",
description: "Sosyal medya yönetimi, içerik stratejisi, AI pazarlama ve dijital büyüme hakkında uzman rehberler."
```

### Platformlar (`/platformlar`)
```typescript
title: "Desteklenen Platformlar — Instagram, LinkedIn, Twitter ve Daha Fazlası | Tentamark",
description: "Tentamark ile Instagram, Facebook, LinkedIn, Twitter/X, TikTok, Pinterest, Telegram ve Bluesky'a tek panelden içerik yayınlayın."
```

---

## ✅ BÖLÜM 6: SEO Aksiyon Planı (Öncelik Sırasıyla)

### 🔴 Hemen Yapılacaklar (Bu Hafta)

- [ ] **1. `app/sitemap.ts` oluştur** → Google sayfalarını bulsun
- [ ] **2. `app/robots.ts` oluştur** → Google'a neyi taraması gerektiğini söyle
- [ ] **3. `public/llms.txt` oluştur** → AI'lar seni tanısın
- [ ] **4. Tüm sayfaların metadata'sını güncelle** → title, description, openGraph ekle
- [ ] **5. Google Search Console'a kayıt ol** → Sitemap'i gönder

### 🟡 İlk 30 Gün

- [ ] **6. JSON-LD Structured Data ekle** → Ana sayfa + Blog + FAQ
- [ ] **7. Karşılaştırma blog yazıları yaz** →
  - "Tentamark vs Hootsuite: Hangisi Daha İyi?"
  - "Tentamark vs Buffer: Farkları Neler?"  
  - "Tentamark vs SocialBee: Türkçe Alternatif"
- [ ] **8. Open Graph görseli (og-image.png) oluştur** → Paylaşımlarda görsel çıksın
- [ ] **9. Google Business Profile oluştur** → Yerel SEO
- [ ] **10. Product Hunt'a hazırlan** → AI'lar tarafından tanınma

### 🟢 İlk 90 Gün

- [ ] **11. Haftalık blog yazısı yaz** (uzun kuyruk anahtar kelimelere odaklan)
- [ ] **12. G2 ve Capterra profillerini oluştur**
- [ ] **13. Backlink stratejisi** → Türk teknoloji bloglarında tanıtım yazısı
- [ ] **14. Video içerik** → YouTube'da "Tentamark ile 5 dakikada içerik planlama" videosu
- [ ] **15. Misafir blog yazıları** → Dijital pazarlama bloglarında yaz, Tentamark'a link ver

### 🔵 Sürekli (Ongoing)

- [ ] **16. Search Console verilerini haftalık kontrol et**
- [ ] **17. "Düşük asılı meyve" kelimeleri bul** (sıralama 10-30 arası kelimeler) ve o sayfaları iyileştir
- [ ] **18. Blog yazılarını güncelle** → Güncel tarih, yeni bilgiler ekle
- [ ] **19. İç linkleme** → Her blog yazısında en az 3 iç link
- [ ] **20. Kullanıcı yorumları ve vaka çalışmaları** → Sosyal kanıt

---

## 📊 BÖLÜM 7: Anahtar Kelimeler Sitede Nerede Kullanılır?

Anahtar kelimeleri rastgele serpme — **stratejik olarak yerleştir:**

### Her Sayfada Olması Gereken Yerler

```
1. <title> etiketi        → "Sosyal Medya Yönetim Aracı | Tentamark"
2. <meta description>     → İlk 155 karakterde ana kelime geçmeli
3. <h1> başlık             → Sayfada 1 tane, ana anahtar kelimeyi içermeli
4. İlk paragraf            → İlk 100 kelime içinde ana kelime
5. Alt başlıklar (h2, h3)  → İkincil anahtar kelimeler
6. URL yapısı              → /blog/instagram-icerik-takvimi (temiz, Türkçe)
7. Görsel alt metni         → <img alt="sosyal medya içerik takvimi örneği">
8. İç linkler              → Diğer sayfalarına "sosyal medya planlama aracı" gibi metinlerle link ver
```

### ⚠️ Yapılmaması Gerekenler

| ❌ Yapma | ✅ Yap |
|---|---|
| Aynı kelimeyi 20 kez tekrarla (keyword stuffing) | Doğal akışta 3-5 kez kullan |
| Gizli metin olarak anahtar kelime koy | Görünür, okunabilir içerik yaz |
| Tüm sayfalarda aynı title/description kullan | Her sayfa için benzersiz yaz |
| Anlamsız URL: `/page1`, `/post123` | Anlamlı URL: `/blog/instagram-rehberi` |
| Sadece Google botu için yazı yaz | İnsanlar için yaz, SEO'yu doğal entegre et |

---

## 🔗 BÖLÜM 8: Faydalı Araçlar ve Kaynaklar

| Araç | Ücretsiz mi? | Link | Ne İçin |
|---|---|---|---|
| Google Search Console | ✅ Tamamen | search.google.com/search-console | Sıralama takibi |
| Google Analytics 4 | ✅ Tamamen | analytics.google.com | Trafik analizi |
| Google Trends | ✅ Tamamen | trends.google.com | Trend kelimeleri bul |
| Ubersuggest | 🟡 Günde 3 ücretsiz | neilpatel.com/ubersuggest | Hacim ve zorluk |
| Answer The Public | 🟡 Günde 3 ücretsiz | answerthepublic.com | Soru bazlı kelimeler |
| PageSpeed Insights | ✅ Tamamen | pagespeed.web.dev | Site hızı testi |
| Rich Results Test | ✅ Tamamen | search.google.com/test/rich-results | JSON-LD test |
| Schema Markup Generator | ✅ Tamamen | technicalseo.com/tools/schema-markup-generator | JSON-LD oluştur |
| Screaming Frog | 🟡 500 URL ücretsiz | screamingfrog.co.uk | Teknik SEO taraması |

---

## 📝 BÖLÜM 9: Önerilen İlk 10 Blog Yazısı Başlığı

Bu başlıklar hem uzun kuyruk anahtar kelimelere yönelik hem de AI tarafından referans alınabilir:

| # | Başlık | Hedef Anahtar Kelime |
|---|---|---|
| 1 | 2026'da Instagram İçerik Takvimi Nasıl Oluşturulur? (Adım Adım) | `instagram içerik takvimi` |
| 2 | Sosyal Medya Paylaşım Saatleri: Platform Platform En İyi Zamanlar | `sosyal medya paylaşım saatleri` |
| 3 | Yapay Zeka ile Sosyal Medya Yönetimi: Başlangıç Rehberi | `yapay zeka sosyal medya` |
| 4 | Hootsuite vs Tentamark: Türkçe Sosyal Medya Aracı Karşılaştırması | `hootsuite alternatifi türkçe` |
| 5 | Küçük İşletmeler İçin Sosyal Medya Stratejisi (Bütçesiz Büyüme) | `küçük işletme sosyal medya` |
| 6 | LinkedIn'de Etkileşim Artıran Post Nasıl Yazılır? | `linkedin post nasıl yazılır` |
| 7 | Instagram Carousel Tasarımı: 10 Altın Kural | `instagram carousel nasıl yapılır` |
| 8 | 2026'nın En İyi 10 Sosyal Medya Yönetim Aracı (Türkçe Karşılaştırma) | `sosyal medya yönetim aracı` |
| 9 | Marka Kimliği Rehberi: Dijital Dünyada Tutarlı Marka Nasıl Oluşturulur? | `marka kimliği oluşturma` |
| 10 | Sosyal Medya İçerik Fikirleri: 50 Hazır Şablon | `sosyal medya içerik fikirleri` |

---

> [!IMPORTANT]
> SEO bir maraton, sprint değil. İlk sonuçları **3-6 ay** içinde görmeye başlarsın. Ama yapay zeka SEO'su (LLMO) daha hızlı sonuç verebilir çünkü AI modelleri web'i sürekli tarıyor ve güncel içerikleri hızla indeksliyor.
