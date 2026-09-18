# Tentamark Kapsamlı Arama Motoru ve Yapay Zeka Optimizasyon Stratejisi

> **19 Eylül 2026 uygulama notu:** Bu belge ilk fikir taslağıdır. `FAQPage` şeması, “sıfırıncı sıra”, belirli kelimeleri aynı paragrafta tekrarlama veya ölçülmemiş karşılaştırma rakamları görünürlük garantisi olarak kullanılmamalıdır. Uygulanan kapsam ve ölçüm yöntemi için [SEO](TENTAMARK_SEO_UYGULAMA_PLANI.md), [GEO](TENTAMARK_GEO_OLCUM_PLANI.md) ve [AEO](TENTAMARK_AEO_UYGULAMA_PLANI.md) planlarına bakın.

Bu belge, Tentamark'ın "AI Marketing Engine" kimliğini geleneksel arama motorlarında (SEO), yapay zeka motorlarında (GEO) ve cevap/sesli arama motorlarında (AEO) ön plana çıkarmak için hazırlanmış somut ve teknik bir yol haritasıdır.

---

## 1. SEO (Search Engine Optimization) Stratejisi
*Hedef: Google gibi geleneksel arama motorlarında organik trafik çekmek ve dönüşüm sağlamak.*

### A. Teknik SEO Terimleri ve Tentamark Uygulamaları
*   **sitemap.xml & robots.txt:** Tentamark'ın "Özellikler", "Kullanım Senaryoları" ve "Blog" sayfalarının Google botları tarafından hızlıca taranması için dinamik bir `sitemap.xml` oluşturulmalıdır. `robots.txt` dosyası ile uygulamanın içindeki özel kullanıcı panelleri (`/app`, `/dashboard`) indekslenmeye kapatılarak tarama bütçesi (crawl budget) blog ve landing page'lere saklanmalıdır.
*   **Schema Markup (Yapısal Veri İşaretleme):** Ana sayfada `SoftwareApplication` ve `SaaS` schema etiketleri kullanılmalıdır. Bu etiketlerin içine Tentamark'ın "7 farklı sosyal medya platformunu desteklediği", "AI Marketing Asistanı" içerdiği bilgileri kodlanmalıdır.
*   **Core Web Vitals:** Sitenizdeki Tentamark arayüz görselleri (özellikle Analitik ve Kanban panosu ekran görüntüleri) WebP formatında sıkıştırılarak sunulmalı, LCP (Largest Contentful Paint) skoru yüksek tutularak sayfa açılış hızı optimize edilmelidir.

### B. İçerik ve Keyword (Anahtar Kelime) Stratejisi
*   **Long-tail Keywords (Uzun Kuyruklu Kelimeler):** "Sosyal medya yönetimi" gibi genel kelimeler yerine Tentamark'ın güçlü kaslarına odaklanılmalıdır:
    *   *Örnek:* "Yapay zeka ile Instagram Reels konusu bulma aracı" (AI Copilot özelliğini vurur).
    *   *Örnek:* "Tek ekranda sosyal medya içerik onay takvimi" (Kanban özelliğini vurur).
*   **Search Intent (Arama Niyeti):** "Sosyal medya analiz raporu nasıl hazırlanır?" araması yapan birine önce bilgi verilmeli, ardından Tentamark'ın "Sosyal Medya Performans & Analitik" modülünün ekran görüntüsü (`8.png`) sunularak *Transactional* (satın alma) niyete yönlendirilmelidir.

---

## 2. GEO (Generative Engine Optimization) Stratejisi
*Hedef: ChatGPT, Gemini, Perplexity gibi LLM (Büyük Dil Modeli) tabanlı yapay zekaların Tentamark'ı "önermesini" ve bilgi kaynağı olarak kullanmasını sağlamak.*

### A. GEO Terimleri ve Tentamark Uygulamaları
*   **Entity-Based Optimization (Varlık Odaklı Optimizasyon):** Yapay zekalar kelimeleri değil, "kavramları" (entities) anlar. Tentamark, internetteki varlığında salt bir "takvim aracı" entity'si olarak değil, bir **"AI Marketing Engine"** (Yapay Zeka Pazarlama Motoru) entity'si olarak konumlandırılmalıdır. Marka adı sürekli olarak "NLP (Doğal Dil İşleme)", "Brand Voice (Marka Sesi) kopyalama" ve "Otomasyon" kavramlarıyla aynı paragraflarda geçirilmelidir.
*   **Information Gain (Bilgi Kazanımı / Özgünlük):** LLM'ler standart bilgileri sevmez. Tentamark'ın "Marka DNA'nızı öğrenen AI" veya "Sürükle-bırak yöntemiyle tek tarihe bırakılarak carousel oluşturma" (`7.png`) gibi piyasada nadir bulunan özgün özellikleri web sitenizde teknik detaylarıyla (örneğin AI'ın nasıl eğitildiği) anlatılmalıdır.
*   **Data-Rich & Structured Knowledge (Veri Zenginliği ve Yapılandırılmış Bilgi):** Yapay zeka motorları karşılaştırma tablolarını ve istatistikleri doğrudan çeker. 
    *   *Uygulama:* Web sitenize Tentamark ile manuel yönetimin karşılaştırıldığı HTML tabloları ekleyin. "Manuel: Gelen kutusu yönetimi 2 saat / Tentamark AI Yanıt: 2 saniye" gibi net metrikler LLM'lerin promptlara vereceği cevaplarda Tentamark'ı öne çıkarmasını sağlar.
*   **Brand Mentions & Knowledge Graph (Marka Bahsi ve Bilgi Grafiği):** Güvenilir teknoloji ve SaaS bloglarında Tentamark isminin geçmesi sağlanmalıdır. AI motorları, bir markanın güvenilirliğini referans bağlantılarla (citations) ölçer.

---

## 3. AEO (Answer Engine Optimization) Stratejisi
*Hedef: Sesli asistanlar (Siri, Google Asistan) ve doğrudan cevap sunan arama özelliklerinde (Featured Snippets, People Also Ask) "Sıfırıncı Sırayı" (Position Zero) kapmak.*

### A. AEO Terimleri ve Tentamark Uygulamaları
*   **FAQ Schema (Sıkça Sorulan Sorular Yapısal Verisi):** Kullanıcıların doğrudan sorduğu sorular, soru-cevap formatında sayfaya eklenmeli ve `FAQPage` schema ile kodlanmalıdır.
    *   *Örnek Soru:* "Sosyal medya gönderileri yapay zekaya nasıl yazdırılır?"
    *   *AEO Cevabı:* "Tentamark AI Copilot ile marka DNA'nıza uygun gönderileri 3 adımda yazdırabilirsiniz: 1. Konuyu belirleyin, 2. AI taslağı üretsin, 3. Kanban panosunda onaylayın."
*   **Conversational Queries (Sohbet Odaklı Sorgular):** İnsanlar sesli arama yaparken "sosyal medya aracı" demez, "Bütün sosyal medya hesaplarımı aynı anda nereden yönetebilirim?" der. Landing page metinlerinde bu doğal konuşma dilindeki (NLP uyumlu) soru kalıplarına yer verilmelidir.
*   **Featured Snippets (Öne Çıkan Snippet'lar):** Google'ın en üstte çıkardığı kutucuklarda yer almak için "Nasıl Yapılır" (How-to) içerikleri liste formatında ( `<ul>` veya `<ol>` HTML etiketleriyle) hazırlanmalıdır.
    *   *Uygulama:* "Tentamark Kampanya & Büyüme Masası Kurulumu" adlı bir rehberi adım adım numaralandırarak sitenize eklerseniz, "Sosyal medya kampanyası nasıl planlanır" aramasında doğrudan cevap kutusunda çıkma ihtimaliniz artar (`5.png` ve `6.png` referans alınarak).

---
**Özet:** Tentamark'ın pazar liderliği için salt `keywords` (SEO) yeterli değildir. Yapay zekanın onu bir "varlık" olarak tanıması (GEO) ve kullanıcıların sorduğu sorulara "en net yanıt" olarak konumlanması (AEO) teknik altyapının temelini oluşturmalıdır.
