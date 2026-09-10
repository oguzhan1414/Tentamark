# 9. Rekabet / Referans Ürün Analizi

> Bu dosya, [08-critical-risks.md](08-critical-risks.md#85-orta-rakip-analizi-eksik) içinde "rakip analizi eksik" olarak işaretlenen boşluğu dolduruyor. İçerik kullanıcı tarafından sağlandı; burada incelenebilir/aksiyona dönüştürülebilir şekilde yapılandırıldı.
>
> **Kullanım amacı:** Sadece özellik kıyaslaması değil — ürün stratejisi, UX ve **web sitesi/dashboard tasarımı** için de referans olarak kullanılacak. Yani bu doküman sadece 06-roadmap-scope.md'yi değil, ileride tasarım kararlarını da besleyecek.

## 9.1 İnceleme Sırası

| Sıra | Ürün | Odak |
|---|---|---|
| 1 | Hootsuite | Komple ürün (en geniş referans) |
| 2 | Buffer | UX / basitlik |
| 3 | Predis.ai | AI content generation |
| 4 | Ocoya | AI + e-commerce entegrasyonu |
| 5 | Antle | Brand-first AI (logo/palet → içerik) |
| 6 | Later | Visual content calendar |
| 7 | Metricool | Analytics → recommendation |
| 8 | Sprout Social | Enterprise seviye (V3/V4 vizyonu) |
| 9 | Taplio | Niş odaklanma stratejisi |

## 9.2 Ürün Bazlı Notlar

### 1. Hootsuite — en önemli referans

Sosyal medya yönetiminin büyük oyuncularından biri. Yayınlama, takvim, analytics, social listening, competitor analysis, AI ve ekip yönetimini tek platformda topluyor. AI tarafında içerik üretiminden sosyal intelligence'a kadar genişliyor.

**İncelenecek ekranlar:** Dashboard, Content Calendar, Create Post, Social Account Connection, Analytics, Competitor Analysis, AI önerileri, Approval workflow, Social listening.

**Özel not:** "Lumen / Wisdom / Perch" gibi AI özelliklerinin ürünleştirilme şekli — Perch, fikir → draft → schedule akışını AI ile birleştiriyor, bu bizim [01-product-vision.md](01-product-vision.md#15-ai-marketing-plan--örnek-akış)'taki ana döngüyle doğrudan örtüşüyor.

**Stratejik soru:** "Hootsuite'in AI-first ve SMB odaklı yeni nesil versiyonunu yapabilir miyim?"

### 2. Buffer — UX için

Asıl gücü basitlik. Hootsuite çok geniş bir platform; Buffer ise "hesabı bağla → içerik hazırla → takvime koy → yayınla" akışında çok daha sade. Solo creator ve küçük ekipler için öne çıkıyor.

**İncelenecek ekranlar:** Onboarding, Calendar, Post Composer, AI Assistant, Scheduling, Analytics, Pricing.

**Kullanım:** MVP dashboard UX'i için ana referans — hedef kitlemiz (kafe, esnaf, freelancer, bkz. [01-product-vision.md](01-product-vision.md#13-hedef-kullanıcı)) Hootsuite'in karmaşıklığından çok Buffer'ın sadeliğine yakın durmalı.

### 3. Predis.ai — AI content tarafı için

Fikrimize en yakın örneklerden biri: "Bir fikir/brief ver → AI içerik oluştursun." AI tarafında post, caption, hashtag, görsel, video, carousel, content calendar üretimine odaklanıyor. Yüksek hacimli AI içerik üretiminde öne çıkıyor.

**İncelenecek şey:** AI'ın kullanıcıdan kaç bilgi istediği — bizim akışımız `"Markamı anlat" → Brand DNA → AI → 30 günlük içerik` ([05-core-features-ux.md](05-core-features-ux.md#52-brand-dna)). Predis'in content generation tarafını nasıl çözdüğüne bakılmalı.

### 4. Ocoya — özellikle önemli

Ticari tarafımıza çok yakın: **AI + Content + Scheduling + E-commerce** kombinasyonu. Ürün bilgilerini (Shopify/WooCommerce gibi kaynaklardan) alıp sosyal medya içeriğine dönüştürme yaklaşımı var.

**Bizim için fikir:** İleride kullanıcı "Shopify mağazamı bağla" dediğinde:

```text
Shopify
 ↓
Products
 ↓
AI
 ↓
Marketing Strategy
 ↓
Instagram / TikTok / Facebook / Pinterest
```

akışı, ürünü sadece "AI sosyal medya aracı" olmaktan çıkarıp **AI e-commerce marketing manager** haline getirebilir.

> **Not:** Bu, [06-roadmap-scope.md](06-roadmap-scope.md)'daki V2/V3 kapsamına girecek büyüklükte bir özellik — MVP'ye eklenmemeli, ama connector mimarisi ([02-platform-research.md](02-platform-research.md#29-ortak-social-connector-mimarisi)) tasarlanırken "veri kaynağı" olarak Shopify gibi bir e-ticaret entegrasyonunun da ileride bir `DataSourceProvider` olabileceği akılda tutulmalı.

### 5. Antle — Brand AI

Branding + AI content + scheduling kesişiminde konumlanıyor. Logo, palet, brand guidelines'a göre içerik üretme yaklaşımı var.

**Doğrudan örtüştüğü fikrimiz:** "Markanın fotoğrafını/avatarını oluştur → AI markayı tanısın" — bkz. [05-core-features-ux.md](05-core-features-ux.md#53-avatar--marka-karakteri) ve [Brand DNA](05-core-features-ux.md#52-brand-dna). Bu ürün, Brand DNA konseptimizin pazarda nasıl karşılık bulduğunu görmek için en yakın referans.

### 6. Later — Görsel içerik & Calendar

Instagram/visual content tarafında güçlü. Öne çıkan yaklaşım: **Visual Content Calendar** — kullanıcı içerikleri takvimde görsel olarak görüyor.

**Neden önemli:** Hedefimiz sadece "post oluştur" değil, "markanın önümüzdeki 30 günlük sosyal medya hayatını göster" ([01-product-vision.md](01-product-vision.md#15-ai-marketing-plan--örnek-akış)). [05-core-features-ux.md](05-core-features-ux.md#54-i̇çerik-takvimi)'teki takvim şu an metin tabanlı bir örnek — Later'ın görsel-öncelikli takvim UX'i doğrudan tasarım referansı olmalı.

### 7. Metricool — Analytics tarafı

Bu, ürünün en çok farklılaşabileceği alanlardan biri: **analytics → AI recommendation**.

Klasik araç: "Son post 12.000 görüntülenme aldı."

Bizim ürün: "Son 30 günde eğitim içerikleri, ürün tanıtımlarından %37 daha yüksek engagement aldı. Gelecek hafta 3 eğitim Reel'i öneriyorum."

**Doğrudan bağlantı:** [04-ai-engine.md](04-ai-engine.md#44-ai-performance-loop) içindeki AI Performance Loop tasarımı — Metricool'un analytics sunumu, "Brand Performance Profile" özetinin dashboard'da nasıl görselleştirileceği için iyi bir referans.

### 8. Sprout Social — Enterprise seviye

"İleride ne olabiliriz?" perspektifiyle incele: Analytics, social listening, customer care, reporting, team workflow, AI.

**Kullanım:** V3/V4 vizyonu için referans — [06-roadmap-scope.md](06-roadmap-scope.md#65-v3)'teki "Advanced team features" gibi maddelerin ne kadar ileri gidebileceğini gösteriyor. MVP kapsamına dahil edilmemeli.

### 9. Taplio — Niş ürün örneği

LinkedIn personal branding üzerine yoğunlaşan niş bir ürün.

**Çıkarılacak ders:** Her şeyi yapmaya çalışmak yerine tek bir problemi çok iyi çözmek.

**Stratejik soru:** Ürün genel olarak "AI Marketing Manager" olabilir, ama başlangıçta **"AI Marketing Manager for Small Businesses"** gibi daha dar bir konumlandırma daha güçlü olabilir. Bu, [01-product-vision.md](01-product-vision.md#13-hedef-kullanıcı)'da zaten işaret edilen hedef kitleyle (kafe, esnaf, freelancer) tutarlı — sadece pazarlama diline netlik olarak yansıtılmalı.

## 9.3 Sentez — Bu ürünlerden çıkan ortak temalar

| Tema | Referans | Bizim projede karşılığı |
|---|---|---|
| Basitlik / düşük sürtünmeli onboarding | Buffer | [05-core-features-ux.md](05-core-features-ux.md#51-marka-onboarding) — özellikle IG↔FB Page adımı ([08-critical-risks.md](08-critical-risks.md#83-orta-yüksek-instagram-onboarding-sürtünmesi-ürünux-riski-sadece-api-riski-değil)) |
| Brief → AI içerik üretimi | Predis.ai | [04-ai-engine.md](04-ai-engine.md#41-ai-marketing-engine--agentservis-yapısı) |
| Marka kimliğinden içerik üretimi | Antle | Brand DNA konsepti |
| Görsel-öncelikli takvim | Later | Takvim UI tasarımı (henüz detaylandırılmadı) |
| Analytics'ten somut öneriye geçiş | Metricool | AI Performance Loop |
| Niş/dar konumlandırma | Taplio | Pazarlama dili: "for Small Businesses" |
| Veri kaynağı olarak e-ticaret | Ocoya | Uzun vadede connector mimarisine eklenebilecek `DataSourceProvider` |
| Komple platform vizyonu | Hootsuite | Ürünün nihai (V3/V4) hali |
| Enterprise özellikler | Sprout Social | Ürünün nihai (V3/V4) hali |

## 9.4 Açık Aksiyon

Bu dosya bir inceleme listesi — henüz gerçek kullanım/ekran incelemesi yapılmadı. İnceleme yapıldıkça:

- Her ürün için "bizde olmalı / bizde olmamalı" notları bu dosyaya eklenmeli.
- [08-critical-risks.md](08-critical-risks.md#85-orta-rakip-analizi-eksik) içindeki "rakip analizi eksik" maddesi, incelemeler tamamlandıkça kapatılabilir.
- Web sitesi/dashboard tasarımına geçildiğinde, 9.2'deki "İncelenecek ekranlar" notları tasarım referansı olarak kullanılmalı (özellikle Buffer'ın onboarding/composer akışı ve Later'ın görsel takvimi).
