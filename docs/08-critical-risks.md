# 8. Kritik Riskler — Öncelikli Okuma

> Bu dosya orijinal `ai-marketing-manager-project-spec.md` içindeki bölüm 39'un (teknik riskler) yeniden düzenlenmiş ve genişletilmiş halidir. Diğer dosyalardaki `> **Not (eklenen değerlendirme)**` blokları da buraya toplanmıştır. Amaç: geliştirmeye başlamadan önce hangi varsayımların netleşmesi gerektiğini tek yerde göstermek.

Risk seviyesi, "launch tarihini ne kadar geciktirebilir / kapsamı ne kadar zorlar" temelinde sıralanmıştır.

## 8.1 [YÜKSEK] Meta App Review — Instagram + Facebook publish izinleri

Instagram/Facebook Content Publishing için gereken izinler (`instagram_content_publish`, `pages_manage_posts` ve benzerleri) **Advanced Access** seviyesinde onay gerektirir. Bu:

- Haftalar–aylar sürebilen bir inceleme süreci,
- Genellikle bir ekran kaydı/demo videosu,
- Yayında bir gizlilik politikası (privacy policy) URL'i,
- Birden fazla ret/düzeltme turu

gerektirebilir. [06-roadmap-scope.md](06-roadmap-scope.md) içindeki Phase 4 ("Social") bu süreci geliştirme bittikten sonra başlatacak şekilde okunabilir — oysa bu sürecin **mümkün olduğunca erken, geliştirmeyle paralel** başlatılması gerekir, çünkü Phase 6 (Beta) bu onay olmadan gerçek kullanıcılarla canlı yayın yapamaz.

Ayrıca: Meta, production'a giren uygulamalardan bir **Data Deletion Request callback endpoint**'i talep eder (kullanıcı Facebook/Instagram bağlantısını kestiğinde verisinin silinmesini talep edebileceği bir mekanizma). Bu, [03-architecture.md](03-architecture.md) içindeki güvenlik listesinde hiç geçmiyor ama production checklist'ine eklenmesi zorunlu.

**Aksiyon:** Meta Developer hesabı ve app review sürecini roadmap'in en başında (Phase 1-2 ile paralel) başlat; privacy policy sayfasını erken yayınla.

## 8.2 [YÜKSEK] LinkedIn — kişisel profil vs. organization posting farkı

[02-platform-research.md](02-platform-research.md#25-linkedin) içinde LinkedIn "MVP'de olabilir" olarak P0/P1 etiketlenmiş, ama iki farklı izin çok farklı zorluk seviyesinde:

- `w_member_social` (kişisel profile post) — nispeten erişilebilir.
- `w_organization_social` (şirket/marka sayfasına post) — LinkedIn'in access review'undan geçmeyi veya bir Marketing Partner ilişkisini gerektirebiliyor; bağımsız/küçük geliştiriciler için bu **pratikte kapalı bir kapı olabilir**.

Ürünün hedef kullanıcısı (kafe, esnaf, freelancer, küçük ekip) büyük olasılıkla **şirket sayfası** değil kişisel/marka hesabı üzerinden paylaşım yapmak isteyecek — bu da `w_organization_social` yerine `w_member_social` ile çalışmanın yeterli olabileceği anlamına gelebilir. Bu ayrım netleşmeden LinkedIn'in roadmap'teki yeri (P0 mı P1 mi) belirsiz kalıyor.

**Aksiyon:** Hedef kullanıcı için hangi LinkedIn izninin yeterli olduğunu erken doğrula; `w_organization_social` gerekiyorsa LinkedIn'in güncel partner/access programını kontrol et.

## 8.3 [ORTA-YÜKSEK] Instagram onboarding sürtünmesi (ürün/UX riski, sadece API riski değil)

IG Graph API'de publish ve çoğu insight işlemi, Instagram hesabının bir Facebook Page'e bağlı olmasını gerektiriyor. [05-core-features-ux.md](05-core-features-ux.md#51-marka-onboarding) içindeki onboarding akışı bunu hiç ele almıyor.

Hedef kullanıcı (kafe sahibi, esnaf) için "önce bir Facebook Page'in olmalı, sonra Instagram'ı ona bağlamalısın" adımı teknik bir detay değil, **gerçek bir kayıp noktası** — birçok küçük işletme sahibinin ya FB Page'i yok ya da hangi hesabın "professional" olduğunu bilmiyor.

**Aksiyon:** Onboarding akışına, bu bağlantıyı adım adım anlatan (ve gerekirse Page oluşturmayı tetikleyen) özel bir ekran/yardım akışı eklenmeli — bu bir "nice to have" değil, Instagram'ı P0 platform yapmanın maliyetinin bir parçası.

## 8.4 [ORTA] Pazar belirsizliği: Türkiye mi, global mi?

Aşağıdaki sinyaller birbiriyle çelişiyor:

- Hedef kullanıcı örnekleri (kafe, esnaf, freelancer) ve beta planı ([07-business-model.md](07-business-model.md#74-i̇lk-beta-testi)) Türkiye pazarını işaret ediyor.
- Fiyatlandırma $ cinsinden ([07-business-model.md](07-business-model.md#72-monetizasyon)).
- Ödeme sağlayıcısı seçimi "Stripe / Paddle / local payment provider depending on target market" olarak açık bırakılmış ([03-architecture.md](03-architecture.md#311-final-architecture-decision)) — yani karar zaten verilmemiş olduğu biliniyor, sadece netleştirilmemiş.

Bu belirsizlik şunları doğrudan etkiler: ödeme altyapısı (Stripe vs iyzico), ürün dili (TR-first mi, EN-first mi), yasal uyumluluk (KVKK vs GDPR vs ikisi birden), ve pazarlama/GTM stratejisi.

**Aksiyon:** İlk pazar açıkça seçilmeli (ör. "önce Türkiye, validasyondan sonra global"). Bu, mimari kararı değiştirmez ama ödeme/lokalizasyon/legal kararlarını hızlandırır.

## 8.5 [ORTA] Rakip analizi — inceleme listesi hazır, uygulama bekliyor

~~Doküman platform API risklerini çok iyi araştırmış ama mevcut rakipler hiç analiz edilmemişti.~~ **Güncelleme:** [09-competitive-references.md](09-competitive-references.md) içinde 9 referans ürünün (Hootsuite, Buffer, Predis.ai, Ocoya, Antle, Later, Metricool, Sprout Social, Taplio) inceleme sırası ve her birinden çıkarılacak dersler belirlendi.

Kalan iş: bu bir *inceleme planı* — henüz gerçek ekran/özellik incelemesi yapılmadı. [01-product-vision.md](01-product-vision.md#17-en-büyük-ticari-risk)'daki "neden bu ürün, brand intelligence/strateji tarafında zaten var olan oyunculardan daha iyi olacak" sorusu, incelemeler tamamlanınca [09-competitive-references.md](09-competitive-references.md#93-sentez--bu-ürünlerden-çıkan-ortak-temalar) içindeki sentez tablosu üzerinden cevaplanabilir.

**Aksiyon:** 9.1'deki sırayla (Hootsuite → Buffer → Predis.ai → ...) incelemeleri yap, bulguları `09-competitive-references.md` içine ekle.

## 8.6 [ORTA] AI Performance Loop'un somut mekanizması

Ürünün ana değer önerisi ("AI markayı öğrenir ve gelecek planını buna göre günceller") [01-product-vision.md](01-product-vision.md#110-sonuç) içinde açıkça öncelik olarak belirtilmiş, ama orijinal spec'te bu mekanizma sadece bir örnek senaryoydu, teknik tasarımı yoktu.

[04-ai-engine.md](04-ai-engine.md#44-ai-performance-loop) içine somut bir öneri eklendi (performans özetleme → küçük "Brand Performance Profile" → prompt injection). Bu henüz sadece bir öneri, uygulama öncesi ekip içinde onaylanmalı.

**Aksiyon:** Bu mekanizmayı (ya da alternatifini) Phase 2/5 arasında netleştir — MVP'nin "öğrenme" iddiasını gerçekten karşılayıp karşılamadığı buna bağlı.

## 8.7 [DÜŞÜK-ORTA] Token güvenliği: RLS ≠ encryption

[03-architecture.md](03-architecture.md#39-güvenlik) içinde "RLS aktif tutulmalı" deniyor, doğru ama yetersiz bir çerçeve. RLS satır seviyesinde erişimi kontrol eder, veriyi şifrelemez. `social_tokens` gibi en hassas tablo için uygulama katmanında envelope encryption stratejisi ayrıca tanımlanmalı.

**Aksiyon:** Token şifreleme yaklaşımını (ör. Supabase Vault, ya da uygulama tarafında KMS ile üretilen data key) mimari kararına ekle.

## 8.8 [DÜŞÜK] Diğer teknik riskler (orijinal listeden, hâlâ geçerli)

Orijinal dokümanın doğru tespit ettiği ve hâlâ geçerli olan riskler:

- **Platform API değişiklikleri** — özellikle TikTok, Meta, LinkedIn; API izinleri ve review süreçleri değişebilir.
- **OAuth token expire/refresh problemleri.**
- **Media formatları** — her platform farklı aspect ratio, file size, duration, codec, resolution gerektirebilir.
- **Rate limits** — her platform için ayrı rate limiter gerekir.
- **AI maliyetleri** — özellikle image/video tarafında.

Bunlar için ek bir aksiyon önerilmiyor, orijinal dokümandaki farkındalık yeterli — sadece kayıt altına alınıyor.

## 8.9 Özet — netleşmesi gereken açık kararlar

| # | Karar | Nerede etkili |
|---|---|---|
| 1 | Meta app review süreci ne zaman başlatılacak? | Roadmap Phase 1-4 |
| 2 | LinkedIn: kişisel profil mi, organization mı? | Platform önceliklendirme |
| 3 | IG↔FB Page onboarding akışı nasıl tasarlanacak? | Onboarding UX |
| 4 | İlk pazar: Türkiye mi, global mi? | Ödeme, dil, legal |
| 5 | Rakiplere karşı somut fark nedir? (inceleme listesi hazır, bkz. [09-competitive-references.md](09-competitive-references.md)) | GTM, pazarlama |
| 6 | AI Performance Loop mekanizması onaylanacak mı? | AI Engine tasarımı |
| 7 | Token encryption stratejisi ne olacak? | Güvenlik mimarisi |
