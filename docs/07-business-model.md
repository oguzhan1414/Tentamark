# 7. İş Modeli ve Doğrulama Planı

> Kaynak: `ai-marketing-manager-project-spec.md` bölüm 30, 45, 46, 47, 48, 49. Bkz. [00-README.md](00-README.md) için doküman haritası.

## 7.1 Tahmini MVP Aylık Maliyet

Erken aşamada:

```text
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

> **$50/ay altında çalışabilecek mimari**

olmalı.

Üretim trafiği artınca Supabase Pro ve ek servisler devreye alınabilir.

Supabase Pro güncel olarak $25/aydan başlıyor. Pro planında ayrıca kullanım bazlı maliyetler bulunabiliyor.

## 7.2 Monetizasyon

Basit subscription:

### Free — $0

- 1 brand
- 1 social connection
- 5 AI contents/month
- Basic calendar
- Limited analytics

### Starter — $9–15/month

- 1–2 brands
- 3–5 social accounts
- 50 AI contents
- Scheduling
- Analytics

### Pro — $29–49/month

- 5 brands
- More AI usage
- All platforms
- Advanced analytics
- AI strategy
- Auto publishing

### Business — $79+

- Team
- Multiple brands
- Higher limits
- Approval workflows
- Advanced analytics

Fiyatlar test edilmelidir; başlangıçta düşük fiyatla gerçek kullanım ölçülmeli.

> **Not (eklenen değerlendirme):** Hedef pazar (bkz. [08-critical-risks.md](08-critical-risks.md)) netleşmeden bu fiyatların hangi para biriminde, hangi ödeme sağlayıcısıyla sunulacağı belirsiz. Ayrıca Starter planın $9-15 seviyesinde, OpenAI + Meta review/support maliyetini karşılayıp karşılamayacağı erken beta'da gerçek kullanım verisiyle doğrulanmalı — düşük fiyatla başlamak doğru bir strateji ama marj hesaplaması gözden kaçmamalı.

## 7.3 Kullanım Bazlı AI Maliyeti

Subscription içinde sınırsız AI vermek riskli.

Örneğin: `AI credits` kullanılabilir.

```text
1 content generation = 1 credit
1 image = 3 credits
1 long analysis = 2 credits
1 video = 20+ credits
```

Böylece maliyet kontrol edilir.

## 7.4 İlk Beta Testi

İlk kullanıcılar:

- 3 kafe
- 3 e-commerce
- 3 freelancer
- 3 küçük SaaS/startup
- 3 kişisel marka

gibi farklı kategorilerden seçilebilir.

Toplam: **10–20 kullanıcı** yeterli.

Ölçülecek:

- Haftada kaç içerik üretiyor?
- AI önerilerini kullanıyor mu?
- Gerçekten yayınlıyor mu?
- Hangi platformu bağlıyor?
- Kaç dakika zaman kazanıyor?
- AI içeriklerini düzenliyor mu?
- Ödeme yapmaya hazır mı?

## 7.5 Başarı Metrikleri

Ana metric:

> **Published AI-assisted content / active brand / month**

Diğerleri:

- Connected accounts
- Generated contents
- Approved contents
- Published contents
- Failed publications
- AI acceptance rate
- Average editing time
- Weekly active brands
- Retention
- MRR
- AI cost per customer

## 7.6 MVP Başarı Kriteri

MVP başarılı sayılmalı eğer:

1. Kullanıcı 5 dakikadan kısa sürede marka oluşturabiliyor.
2. En az bir sosyal hesabını bağlayabiliyor.
3. AI bir haftalık plan çıkarabiliyor.
4. Kullanıcı planı düzenleyebiliyor.
5. İçeriği onaylayabiliyor.
6. Sistem içeriği zamanında yayınlayabiliyor.
7. Performansı dashboard'da gösterebiliyor.
8. AI sonraki önerilerini geçmiş performansa göre değiştirebiliyor.

> **Not (eklenen değerlendirme):** Bu kriterler "yapıldı mı yapılmadı mı" tipinde — beta'nın gerçekten başarılı olup olmadığına karar verecek eşik/hedef değerler (ör. "AI acceptance rate en az %X olmalı", "kullanıcıların en az %Y'si ikinci haftada da içerik onaylamalı") tanımlı değil. 7.5'teki metrikler için somut hedefler belirlemek, beta sonunda "devam mı, pivot mu" kararını nesnelleştirir.
