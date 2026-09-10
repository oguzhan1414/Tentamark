# 4. AI Marketing Engine

> Kaynak: `ai-marketing-manager-project-spec.md` bölüm 12, 13, 17, 19, 27, 28, 29. Bkz. [00-README.md](00-README.md) için doküman haritası.
>
> **Bu dosya, orijinal dokümana göre en çok genişletilen bölüm.** Bölüm 4.4 (AI Performance Loop) orijinalde sadece bir örnek senaryo/transkriptti, mekanizma tanımlanmamıştı — burada somut bir tasarım önerisi eklendi.

## 4.1 AI Marketing Engine — Agent/Servis Yapısı

AI tek bir prompt olmamalı. Modüler olmalı.

| Agent/Servis | Görev |
|---|---|
| **Brand Analyst** | Brand DNA oluşturur |
| **Strategy Planner** | Haftalık/aylık içerik stratejisi çıkarır |
| **Content Ideator** | İçerik fikirleri üretir |
| **Copywriter** | Platforma özel metin üretir |
| **Visual Director** | Görsel brief oluşturur |
| **Performance Analyst** | Geçmiş içerikleri analiz eder |
| **Recommendation Engine** | "Sonraki hafta ne yapmalıyız?" sorusuna cevap verir |

## 4.2 AI'ın İlk Sürümde Yapması Gerekenler

Kullanıcı:

> "Bu hafta markam için içerik hazırla."

dediğinde sistem:

1. Brand DNA'yı alır.
2. Geçmiş performansı inceler.
3. Platformları kontrol eder.
4. İçerik hedeflerini belirler.
5. 7 günlük içerik planı çıkarır.
6. Platformlara özel içerik üretir.
7. Kullanıcıya gösterir.
8. Kullanıcı onaylar.
9. Scheduler yayınlar.
10. Analytics sistemi sonuçları toplar.

## 4.3 AI Görsel Üretimi

Görsel üretimini provider abstraction ile yap.

```text
ImageGenerator
├── OpenAI
├── ExternalProvider
└── FutureProvider
```

Böylece tek sağlayıcıya kilitlenmezsin.

Görsel üretimi kullanıcı planına göre limitlenebilir.

Örnek:

```text
Free:
5 AI images / month

Pro:
50 AI images / month

Business:
200 AI images / month
```

## 4.4 AI Performance Loop

En önemli özelliklerden biri.

### Orijinal senaryo (örnek çıktı)

```text
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

AI sadece içerik üretmemeli. **Sonuçlardan öğrenmeli.**

> **Not (eklenen değerlendirme):** Bu senaryo *ne* göstermek istediğini net anlatıyor ama *nasıl* çalıştığı tanımlı değil. Ürünün merkezi vaadi ("AI markayı öğrenir") bu mekanizmanın somut olmasına bağlı — aşağıda fine-tuning/RAG'a girmeden (bilinçli olarak MVP dışı bırakıldı, bkz. [06-roadmap-scope.md](06-roadmap-scope.md)) uygulanabilir bir tasarım önerisi var.

### Önerilen mekanizma: "context injection + structured scoring", fine-tuning değil

Fine-tuning ve RAG bilinçli olarak MVP dışı bırakılmış (doğru karar — erken aşamada gereksiz karmaşıklık). Bunun yerine üç parçalı, tamamen prompt-engineering seviyesinde bir mekanizma öneriliyor:

**1) Performans özetleme (periyodik, AI çağrısı ucuz modelle)**

Her içerik yayınlandıktan N gün sonra (ör. 3 ve 14 gün), `ContentAnalytics` verisi ham sayılardan yapılandırılmış bir "performance tag" setine indirgenir — bu adım LLM'siz de, basit eşik/percentile kurallarıyla yapılabilir:

```json
{
  "content_id": "...",
  "relative_performance": "top_20_percent",
  "tags": ["educational", "hook_first_3s", "reel", "18-24_audience"],
  "engagement_rate": 0.048,
  "vs_brand_average": "+35%"
}
```

Bu adım maliyetsiz veya çok ucuzdur — LLM çağrısı gerektirmeyebilir.

**2) Brand Performance Profile (Brand DNA'nın yanında, ayrı ve küçük bir obje)**

Ham analytics tablosunu her seferinde AI'a vermek yerine, periyodik olarak (ör. haftalık) *özetlenmiş* ve küçük bir "performans profili" tutulur — bu, Brand DNA'ya ek, ayrı bir alan:

```json
{
  "brand_id": "...",
  "updated_at": "...",
  "top_performing_tags": ["educational", "hook_first_3s"],
  "underperforming_tags": ["promotional", "long_caption"],
  "best_audience_segment": "18-24",
  "best_posting_windows": ["Tue 12:00", "Thu 19:00"],
  "sample_size": 18
}
```

Bunun avantajı: her yeni içerik üretiminde ham 30 günlük veri yerine bu küçük özet prompt'a enjekte edilir — token maliyeti sabit kalır, veri arttıkça büyümez.

**3) Strategy Planner prompt'una enjeksiyon**

`Strategy Planner` ve `Content Ideator` çağrılarına Brand DNA'nın yanında bu profil de eklenir; model "geçmişte eğitim içerikleri daha iyi performans gösterdi, bu yüzden 3 eğitim odaklı Reel öner" çıkarımını *kendi* yapar — ayrı bir ML modeline gerek kalmaz.

`sample_size` düşükken (ör. < 10 yayınlanmış içerik) sistem bu profili prompt'a hiç eklememeli veya "yetersiz veri, genel best-practice kullanılıyor" olarak işaretlemeli — aksi halde küçük örneklemden yanlış genelleme riski var.

### Bu tasarımın MVP'ye etkisi

- Ekstra altyapı gerekmez (ayrı bir ML pipeline, vektör DB vs. yok).
- Maliyet öngörülebilir kalır (özet her zaman sabit boyutlu).
- "Öğrenme" kullanıcıya somut ve açıklanabilir şekilde gösterilebilir (ör. dashboard'da "AI şunu öğrendi" kartı — bu aynı zamanda güven inşa eden bir UX unsuru olur).
- V2'de bu profil, gerçek bir ranking/skorlama modeline (ör. basit bir regresyon) evrilebilir; MVP'de buna gerek yok.

## 4.5 AI Model Stratejisi

Tek model kullanma.

### Cheap model

- İçerik fikirleri
- Classification
- Tagging
- Basit rewriting
- Analytics summary

### Strong model

- Brand strategy
- Complex content strategy
- Final copy
- Performance reasoning

Maliyeti kontrol etmek için AI kullanımını görev bazlı ayır.

## 4.6 AI Maliyet Stratejisi

Güncel OpenAI API fiyatlandırmasında düşük maliyetli GPT-5.6 Luna modeli için:

- Input: $0.20 / 1M token
- Output: $1.20 / 1M token

olarak listeleniyor.

Kaynak: https://openai.com/api/

Bu nedenle metin tabanlı AI işlemleri doğru cache ve model seçimiyle SaaS'ın ana maliyet problemi olmayabilir.

Asıl maliyet potansiyeli:

- AI image generation
- AI video generation
- Video processing
- Storage
- Bandwidth

tarafında olacaktır.

> **Not (eklenen değerlendirme):** Fiyat rakamları hızlı değişen bir alan — production bütçesi kesinleştirilmeden hemen önce güncel fiyatlandırma sayfasından teyit edilmeli. Ayrıca 4.4'teki performans özetleme adımı ekstra (küçük) bir AI maliyeti kalemi olarak bütçeye eklenmeli.

## 4.7 Maliyeti Düşürmek İçin Temel Kararlar

### Yap

- Text AI'ı ucuz modelle çalıştır.
- Brand DNA'yı her istekte yeniden oluşturma.
- Cache kullan.
- Aynı görseli tekrar üretme.
- AI generation limitleri koy.
- Kullanıcı başına usage tracking yap.
- Video generation'ı MVP'den çıkar.
- Storage lifecycle kullan.
- Media'yı gereksiz çoğaltma.
- Webhook/event varsa polling yerine kullan.
- Analytics'i sürekli değil, periyodik çek.

### Yapma

- Her butona AI çağrısı koyma.
- Her sayfa açılışında AI çalıştırma.
- Her platform için ayrı AI çağrısı yapma.
- Aynı içeriği 5 defa baştan üretme.
