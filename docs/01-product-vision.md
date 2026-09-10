# 1. Ürün Vizyonu

> Kaynak: `ai-marketing-manager-project-spec.md` bölüm 1, 2, 3, 36, 37, 38, 40, 50, 51, 52. Bkz. [00-README.md](00-README.md) için doküman haritası.

## 1.1 Projenin Tanımı

Bu ürün basit bir "AI post oluşturucu" olarak konumlandırılmamalı.

Ana fikir:

> **Kullanıcının markası için çalışan bir AI Marketing Manager oluşturmak.**

Sistem;

1. Markayı tanır.
2. Marka kimliği oluşturur.
3. Sosyal hesapları bağlar.
4. Geçmiş içerikleri ve performansı toplar.
5. İçerik fikirleri üretir.
6. İçerik takvimi oluşturur.
7. Metin/görsel/video brief'i üretir.
8. Kullanıcı onayından sonra yayınlar.
9. Sonuçları toplar.
10. Hangi içeriklerin daha iyi çalıştığını analiz eder.
11. Bir sonraki içerik planını buna göre günceller.

Ana döngü:

**Brand DNA → Strategy → Content → Approval → Publish → Analytics → Learning → New Strategy**

## 1.2 Ürünün Ana Prensibi

### Olması gereken

- Marka tutarlılığı
- İnsan onaylı yayınlama
- Platform bazlı içerik uyarlama
- İçerik takvimi
- Otomatik yayınlama
- Performans analizi
- AI önerileri
- OAuth ile güvenli hesap bağlantısı
- Token yenileme
- Hata/retry sistemi
- Platformların farklı yeteneklerini kullanıcıdan gizleyen ortak bir içerik modeli

### Olmaması gereken

- İlk sürümde her platformu desteklemek
- İlk günden AI video üretimini zorunlu yapmak
- Kullanıcı onayı olmadan her şeyi otomatik yayınlamak
- Kullanıcı sosyal medya şifrelerini istemek
- Platform API'lerini scraping ile taklit etmek
- Her platforma aynı içeriği birebir göndermek
- Kullanıcıyı 20+ ayar ile boğmak
- İlk sürümde reklam yönetimini ana özellik yapmak
- Gereksiz mikroservis mimarisi kurmak
- İlk sürümde fine-tuning yapmak

## 1.3 Hedef Kullanıcı

### A. Küçük işletmeler

- Kafe
- Restoran
- Güzellik merkezi
- E-ticaret
- Giyim markası
- Yerel işletme
- Eğitim/danışmanlık

### B. Solo girişimciler

- Freelancer
- Koç
- Eğitmen
- İçerik üreticisi
- Kişisel marka

### C. Küçük marketing ekipleri

2–5 kişilik ekipler için içerik planlama ve onay sürecini kolaylaştırabilir.

> **Not (eklenen değerlendirme):** Hedef kitle (kafe, esnaf, freelancer) büyük oranda Türkiye pazarını işaret ediyor, ama dokümanın geri kalanında fiyatlar $ cinsinden ve platform önceliklendirmesi global bir ürün varsayıyor. Bu ikisi arasındaki gerilim (dil, ödeme sağlayıcı, KVKK/GDPR) netleştirilmemiş — ayrıntı için [08-critical-risks.md](08-critical-risks.md).

## 1.4 En Önemli Ürün Özelliği: Content Repurposing

Tek bir fikirden:

```text
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

## 1.5 AI Marketing Plan — Örnek Akış

Kullanıcı:

> "Önümüzdeki hafta markam için plan yap."

dediğinde:

```text
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

```text
7 Days
12 Content Pieces

4 Reels
2 LinkedIn
3 Stories
2 Facebook
1 TikTok
```

Kullanıcı **Approve all** dediğinde scheduler devreye girer.

## 1.6 Kullanıcı Hedefi

Ürün kullanıcıya şunu hissettirmeli:

> "Sosyal medya için ne paylaşacağımı düşünmek zorunda değilim."

ve daha ileri:

> "Marketing ekibim yok ama AI Marketing Manager'ım var."

Bu ürünün ana değer önerisi olmalı.

## 1.7 En Büyük Ticari Risk

Rakiplerin olması değil.

Asıl risk:

> **Platformlara bağımlı olmak.**

Instagram API bugün bir şeyi destekler, yarın permission değişebilir.

Bu nedenle ürünün değeri sadece "Instagram'a post atıyorum" olmamalı.

Değer:

- Brand intelligence
- Strategy
- Content planning
- Analytics
- AI recommendations

olmalı. Platformlar değişse bile bu çekirdek değer kalır.

> **Not (eklenen değerlendirme):** Bu tespit doğru; "platform bağımlılığı" riskini azaltmak kadar "neden bu ürün mevcut oyunculardan daha iyi brand intelligence/strateji üretir" sorusunun da net bir cevabı olmalı. Rakip inceleme listesi için bkz. [09-competitive-references.md](09-competitive-references.md); risk kaydı için [08-critical-risks.md](08-critical-risks.md).

## 1.8 Kritik Ürün Kararı

**Ürün değil:** AI Content Generator ❌

**Ürün değil:** AI Social Media Scheduler ❌

**Ürün:** AI Marketing Manager ✅

Bu ayrım markalaşma açısından çok önemli.

## 1.9 İlk Sürüm İçin Net Kapsam

### Kullanıcı

```text
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

```text
Connect Instagram
Connect Facebook
Connect LinkedIn
```

### AI

```text
Generate weekly strategy
 ↓
Generate content ideas
 ↓
Generate posts
 ↓
Generate captions
```

### User

```text
Review
 ↓
Edit
 ↓
Approve
```

### System

```text
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

## 1.10 Sonuç

Bu proje teknik açıdan yapılabilir.

Ancak başarısı "kaç tane API bağladığımızla" değil:

> **AI'ın markayı ne kadar iyi anlayıp sürekli daha iyi pazarlama önerileri üretebildiğiyle**

belirlenecek.

Bu yüzden geliştirme sırası:

```text
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

TikTok ve YouTube mimaride desteklenmeli ama ilk aşamada ürünün tamamını bunlara bağımlı hale getirmemeli.

AI video, avatar, reklam ve ileri otomasyon ise kullanıcıların gerçekten talep ettiği kanıtlandıktan sonra eklenmeli.
