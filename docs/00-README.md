# AI Marketing Manager — Doküman İndeksi

Bu klasör, tek parça olan `ai-marketing-manager-project-spec.md` dosyasının konuya göre bölünmüş halidir. Orijinal dosya olduğu gibi projenin kök dizininde duruyor (ham taslak / tarihçe olarak); güncel çalışma kaynağı artık bu klasördür.

**Tarih:** 7 Eylül 2026
**Durum:** Araştırılmış ürün/MVP taslağı — yapılandırıldı, kritik riskler öne çıkarıldı.

## Önce bunu oku

→ [08-critical-risks.md](08-critical-risks.md) — Meta/LinkedIn app review süreçleri, pazar belirsizliği, AI öğrenme döngüsünün eksik tasarımı gibi, launch tarihini doğrudan etkileyebilecek riskler burada. Roadmap'e başlamadan önce bu dosyadaki maddeler netleşmeli.

## Doküman haritası

| Dosya | İçerik |
|---|---|
| [01-product-vision.md](01-product-vision.md) | Proje tanımı, ana prensipler, hedef kullanıcı, ürünün "neden"i, kritik ürün kararı, sonuç |
| [02-platform-research.md](02-platform-research.md) | Instagram/Facebook/TikTok/YouTube/LinkedIn/X/Threads API araştırması, önceliklendirme, connector mimarisi, kaynaklar |
| [03-architecture.md](03-architecture.md) | Teknik stack, veri modeli, database, storage, queue, sistem mimarisi, güvenlik, yetki modeli |
| [04-ai-engine.md](04-ai-engine.md) | AI agent/servis yapısı, model stratejisi, maliyet stratejisi, AI Performance Loop (+ somutlaştırma önerisi) |
| [05-core-features-ux.md](05-core-features-ux.md) | Marka onboarding, Brand DNA, avatar, içerik takvimi, platforma özel içerik, approval, scheduler, OAuth akışı |
| [06-roadmap-scope.md](06-roadmap-scope.md) | MVP kapsamı (P0/P1), V1 fazları, V2, V3 |
| [07-business-model.md](07-business-model.md) | Fiyatlandırma, AI credit sistemi, maliyet tahmini, beta test planı, başarı metrikleri |
| [08-critical-risks.md](08-critical-risks.md) | **Yeni** — teknik + ticari risk kaydı, önceliklendirilmiş |
| [09-competitive-references.md](09-competitive-references.md) | **Yeni** — Hootsuite, Buffer, Predis.ai, Ocoya, Antle, Later, Metricool, Sprout Social, Taplio: inceleme sırası ve her birinden çıkarılacak dersler |
| [10-domain-architecture.md](10-domain-architecture.md) | **Yeni** — 8 açık kaynak referansın (TryPost, OpenPost, post-scheduler-frontend, social-stats, Postiz, SVAR/react-scheduled-calendar, Social-Media-Dashboard) incelenmesi; domain modeli, içerik durum makinesi, Supabase Cron+Queues scheduler kararı, RLS izolasyonu, takvim kütüphanesi ve frontend deseni |
| [11-design-system.md](11-design-system.md) | **Yeni** — ölçülmüş palet, üç token rampası (yüzey/metin/aksan), WCAG kontrast hesapları, yüzey ve yarıçap kuralı, tipografi, tema geçişi, token sözlüğü |
| [12-backend-logic.md](12-backend-logic.md) | **Ana referans** — 12 repodan (8 scheduler + 4 AI içerik üretimi) konsolide edilmiş tam backend mantığı: domain modeli, durum makinesi, **AI İçerik Zekası katmanı** (marketingskills + humanizer'dan esinlenen prompt zinciri), scheduler, RLS, kaynak repo attribution tablosu, uçtan uca akış, "sistem sonunda ne olacak" kontrol listesi |
| [13-build-checklist.md](13-build-checklist.md) | **Yeni** — Supabase bağlandı, gerçek backend inşasına başlandı. 8 fazlık kısa yapım listesi, her madde 12'nin ilgili bölümüne işaret ediyor |

## Bu bölmede neyi değiştirdim, neyi değiştirmedim

- **Değiştirmedim:** Orijinal araştırma, kararlar (Instagram=P0, TikTok=V2 vb.), fiyatlandırma taslağı, roadmap içeriği — hepsi olduğu gibi taşındı.
- **Ekledim:** `08-critical-risks.md` içinde Meta App Review süreci, LinkedIn organization posting kısıtı, IG↔FB Page onboarding sürtünmesi, pazar belirsizliği (TR vs global) ve rakip analizi eksikliği üzerine somut değerlendirmeler. Bunlar orijinal dokümanda ya çok kısa geçilmiş ya da hiç yoktu.
- **Genişlettim:** `04-ai-engine.md` içinde AI Performance Loop için bir teknik tasarım taslağı ekledim — orijinalde bu bölüm sadece örnek bir senaryo/transkriptti, mekanizma tanımlı değildi. Eklenen kısımlar `> **Not (eklenen değerlendirme):**` olarak işaretli, orijinal metinle karışmıyor.
- **Doldurdum:** `09-competitive-references.md` — daha önce `08-critical-risks.md`'de "rakip analizi eksik" olarak işaretlenen boşluk, kullanıcının sağladığı 9 referans ürün (Hootsuite, Buffer, Predis.ai, Ocoya, Antle, Later, Metricool, Sprout Social, Taplio) analiziyle dolduruldu. Bu dosya sadece özellik kıyaslaması değil, ileride web sitesi/dashboard tasarımı için de referans olarak kullanılacak.

## Bir sonraki karar noktası

Roadmap'teki P0 listesi (bkz. [06-roadmap-scope.md](06-roadmap-scope.md)) hâlâ oldukça geniş — gerçek bir "ilk çıkış" için muhtemelen daha da daraltılabilir (ör. tek platformla başlamak). Bu, ayrı bir tartışma konusu olarak bırakıldı; istersen bir sonraki adımda ele alabiliriz.

Ayrıca [12-backend-logic.md §12.16](12-backend-logic.md) içinde altı açık karar duruyor: `external_account_id` unique kısıtının kapsamı, medya dönüştürmenin nerede yapılacağı, takvim prototipi, prompt kütüphanesinin somut içeriği, connector capability setinin kesinleşmesi ve billing/subscription modellemesi.
