# Tentamark Creative Studio — Görsel ve Video Geliştirme Planı

**Tarih:** 27.09.2026  
**Durum:** Uygulama öncesi ana çalışma dokümanı  
**Kapsam:** Görsel üretim, kısa video, kullanıcı medyası, Brand DNA, render altyapısı ve kalite kontrolü

## 1. Amaç

Tentamark'ın görsel ve video özellikleri birbirinden kopuk iki araç olarak değil, tek bir **Creative Studio** ürünü olarak geliştirilecektir.

Ana hedef:

> Kullanıcı bir konu, ürün URL'si, mevcut gönderi veya kendi medyasını verir; Tentamark markaya uygun yaratıcı brief hazırlar, doğru formatı seçer, düzenlenebilir görsel/video varyasyonları üretir ve platformlara uygun çıktılar oluşturur.

Mevcut iki teknoloji korunacaktır:

- Video: **Remotion**
- Görsel ve animasyonlu kart: **HTML/CSS + Playwright render**

Öncelik motorları değiştirmek değil; ürün akışını, gerçek medya kullanımını, marka tutarlılığını, düzenlenebilirliği ve render güvenilirliğini geliştirmektir.

## 2. Temel ürün kararları

### Yapılacak

- Görsel ve video tek Creative Studio akışında birleşecek.
- Kullanıcıya onlarca şablon yerine AI tarafından seçilen 2–3 öneri gösterilecek.
- Brand DNA, ortak tasarım token'larına dönüştürülecek.
- Video üretimi gerçek kullanıcı fotoğrafı ve videosunu merkeze alacak.
- Karmaşık timeline yerine sahne tabanlı storyboard kullanılacak.
- Bir fikirden platforma özel birden fazla çıktı üretilecek.
- AI çıktıları düzenlenebilir ve kullanıcı onaylı olacak.

### İlk aşamada yapılmayacak

- Premiere/CapCut seviyesinde tam video editörü
- Prompt'tan uzun sinematik AI video üretimi
- Her sahneyi generative video ile oluşturma
- HTML kart motorunu baştan yazma
- Yeni yüzlerce şablon ekleme
- Kullanım kanıtlanmadan pahalı dağıtık render sistemi kurma

## 3. Mevcut durum

### 3.1 Video

Mevcut sistem boş bir Remotion kurulumu değildir. Şunlar hazırdır:

- Dikey/yatay çıktı ve 10/15/20 saniye seçenekleri
- Marka renklerinden tema
- Sahne planlama
- Hook, feature, stat, carousel ve outro
- UGC split, product, review ve wrapped sahne bileşenleri
- Geçiş, light leak, müzik ve ses efektleri
- Voice-over sırasında müzik ducking
- Opsiyonel video arka planı
- Ürün URL'sinden içerik ve görsel alma
- Render job ve değiştirilebilir render executor sınırı

Temel eksik: otomatik plan çoğunlukla şu yapıyı kullanıyor:

```text
Hook → Feature / Stat / Carousel → Outro
```

Bu nedenle çıktı hareketli sunum gibi algılanabilir. Hazır olan `ugc_split`, `product`, `review` ve `wrapped` sahneleri planner'a yeterince bağlı değildir. `voiceoverAudio` ve `videoBackgroundUrl` render seviyesinde desteklense de uçtan uca ürün akışı tamamlanmamıştır.

### 3.2 Görsel

Mevcut sistemde çok sayıda kart türü, tasarım varyantı, feed/story/carousel ölçüsü, canlı önizleme, PNG render ve animasyonlu MP4 üretimi vardır.

Temel eksikler:

- Kullanıcı doğru şablonu kendisi bulmak zorunda kalıyor.
- Ortak marka tasarım token'ları sınırlı.
- Fotoğraf/ürün yerleşimi yeterince akıllı değil.
- Otomatik kalite kontrolü yok.
- Tek fikirden platform paketi merkezi bir akış değil.
- Her istekte yeni Chromium açılması büyüyen trafikte pahalı olabilir.

## 4. Hedef Creative Studio akışı

```text
Konu / ürün URL'si / mevcut gönderi / medya
                       ↓
                AI yaratıcı brief
                       ↓
             Amaç ve format seçimi
                       ↓
        Görsel / carousel / video önerileri
                       ↓
            Markaya uygun 2–3 varyasyon
                       ↓
       Kullanıcı metin, medya ve sahne düzenler
                       ↓
             Platforma özel çıktılar
                       ↓
              Önizleme ve onay
                       ↓
          İçeriğe ekle / planla / yayınla
```

Kullanıcıdan yalnızca konu, hedef, mevcut medya ve tercih edilen öneri gibi gerçek ürün kararları istenmelidir. Şablon, sahne yapısı ve ilk metin sistem tarafından hazırlanmalıdır.

## 5. Görsel üretim planı

### 5.1 Mevcut motor korunacak

HTML/CSS yaklaşımı hızlı şablon geliştirme, tipografi kontrolü, animasyon ve önizleme açısından uygundur. Kısa vadede Satori, SVG veya Canvas tabanlı yeni bir motora geçilmeyecektir.

### 5.2 Brand Design Tokens

Brand DNA şu token'lara dönüştürülecektir:

```ts
type BrandDesignTokens = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  typography: {
    headingFamily: string;
    bodyFamily: string;
    headingWeight: number;
    bodyWeight: number;
  };
  shape: {
    radiusStyle: "sharp" | "soft" | "rounded";
    borderStyle: "none" | "thin" | "bold";
    shadowStyle: "none" | "soft" | "editorial" | "dramatic";
  };
  imagery: {
    treatment: "clean" | "warm" | "vivid" | "editorial" | "cinematic";
    overlayStrength: number;
    preferredCrop: "product" | "person" | "environment";
  };
  layout: {
    density: "compact" | "balanced" | "spacious";
    logoPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    ctaStyle: "text" | "pill" | "button";
  };
};
```

Şablonlar kendi karakterini korurken renk, tipografi, radius, gölge, logo ve CTA davranışını ortak token'lardan alacaktır.

### 5.3 AI şablon önerisi

İçerik şu amaçlardan birine sınıflandırılacaktır:

- Ürün tanıtımı
- İndirim/kampanya
- Eğitici içerik
- Liste/checklist
- İstatistik/veri
- Müşteri yorumu
- Karşılaştırma
- Etkinlik
- Duyuru/haber
- Kurucu/kişisel marka

Sonra en fazla üç öneri gösterilecektir:

- Güvenli, marka uyumlu
- Daha dikkat çekici
- Deneysel

### 5.4 Akıllı medya yerleşimi

- Yüz/ürün odaklı otomatik crop
- Arka plan kaldırma
- Şeffaf ürüne doğal gölge
- Görselden palet çıkarma
- Metin için güvenli boşluk tespiti
- Otomatik overlay/gradient
- Logo ve ana özne çakışma kontrolü
- Düşük çözünürlük uyarısı
- Uzak görselleri storage'a alma

### 5.5 İçerik paketi

Tek brief'ten şunlar üretilebilmelidir:

- 4:5 feed
- 1:1 kare
- 9:16 story
- 3–6 slayt carousel
- Reel/video kapağı
- 3 saniyelik animasyonlu teaser

Çıktılar aynı fikri taşımalı fakat yalnızca yeniden boyutlandırılmış kopyalar olmamalıdır.

### 5.6 Kalite kontrolü

Render öncesi/sonrası kontroller:

- Metin taşması ve minimum font boyutu
- Kontrast
- Logo ve platform safe area
- Metnin yüz/ürün üzerine binmesi
- Fazla metin
- Bozuk uzak görsel
- Yanlış en-boy oranı
- Marka rengi/logo kuralları

Kritik hata render'ı durdurmalı; düşük önem düzeyindekiler öneri olarak gösterilmelidir.

## 6. Video üretim planı

### 6.1 Mod 1 — Fotoğraflardan hızlı Reel

İlk tamamlanacak mod:

- 3–6 fotoğraf
- Konu veya mevcut gönderi
- AI hook
- Pan/zoom hareketi
- Kısa fayda metinleri
- Marka rengi/logo
- Beat'e uygun geçiş
- CTA/outro

Mevcut Remotion mimarisi bunun için yeterlidir.

### 6.2 Mod 2 — Ürün videosu

Girdi: ürün URL'si veya medyaları, fiyat, indirim, özellik ve isteğe bağlı yorum.

```text
Hook → Product → Feature → Review/Stat → CTA
```

Hazır `product`, `review`, `ugc_split` ve `wrapped` sahneleri scene planner'a bağlanacaktır.

### 6.3 Mod 3 — Kullanıcı videosunu otomatik düzenleme

- MP4/MOV/WebM yükleme
- Metadata ve süre doğrulama
- 9:16, 1:1, 16:9 crop
- Sessiz başlangıç/son temizleme
- Otomatik transkripsiyon
- Kelime zamanlamalı altyazı
- İlk 1–2 saniyeye hook
- Marka renkleri/logo
- Müzik ve voice ducking
- CTA/outro

Bu mod tamamen sentetik video üretiminden önce gelecektir.

### 6.4 Storyboard editörü

```text
[Hook] → [Ürün] → [Özellik] → [Yorum] → [CTA]
```

Her sahne için metni/medyayı değiştirme, yeniden üretme, silme, çoğaltma, sıralama ve süre seçme işlemleri sunulacaktır.

### 6.5 Voice-over ve altyazı

Voice-over opsiyonel olacaktır:

1. AI kısa metin üretir.
2. Kullanıcı düzenler.
3. Ses ve dil seçilir.
4. TTS storage'a kaydedilir.
5. Gerçek ses süresine göre sahneler hesaplanır.
6. Müzik konuşma sırasında kısılır.
7. Kelime zamanlamalı altyazı oluşturulur.

Altyazı en fazla 1–2 satır, aktif kelime vurgulu, marka renk/font uyumlu ve platform safe area içinde olacaktır.

### 6.6 Müzik

Tek sabit müzik yerine başlangıçta 5–10 lisanslı parça:

- Enerjik
- Sıcak
- Premium
- Teknolojik
- Sakin/eğitici

Kullanıcı müziği değiştirebilmeli veya kapatabilmelidir.

### 6.7 Generative video

İlk sürümün ana motoru olmayacaktır. İleride yalnızca 2–4 saniyelik atmosferik B-roll, soyut marka dokusu veya kısa açılış planı gibi yardımcı görevlerde kullanılabilir.

## 7. Hedef teknik mimari

### 7.1 Ortak Creative Brief

```ts
type CreativeBrief = {
  brandId: string;
  objective: "awareness" | "engagement" | "traffic" | "conversion";
  contentType: "product" | "education" | "social_proof" | "promotion" | "announcement";
  keyMessage: string;
  audience: string;
  offer?: string;
  callToAction?: string;
  selectedMediaIds: string[];
  requestedOutputs: Array<"feed" | "square" | "story" | "carousel" | "video">;
};
```

Render motorları serbest metin yorumlamak yerine çözülmüş bir üretim planı alacaktır.

### 7.2 Katmanlar

```text
Creative Brief
      ↓
Creative Planner
      ↓
Resolved Image Plan / Video Scene Plan
      ↓
HTML Renderer / Remotion Renderer
      ↓
Quality Checks
      ↓
Storage + Media Record
```

### 7.3 Medya metadata

Her medya için MIME, boyut, genişlik/yükseklik, süre, orientation, thumbnail, kaynak, lisans/kullanım hakkı, işleme durumu ve hata bilgisi tutulacaktır.

### 7.4 Render job durumları

```text
QUEUED → PREPARING_ASSETS → PLANNING → RENDERING
       → VALIDATING → UPLOADING → COMPLETED
```

Hata:

```text
FAILED_RETRYABLE → QUEUED
FAILED_FINAL → USER_ACTION
```

Job'lar idempotent olmalıdır.

## 8. Uygulama fazları

### Faz 0 — Mevcut sistemi güvenceye alma

- [x] Görsel tür/varyant envanteri çıkar. (`npm run creative:inventory`)
- [x] Video sahneleri ve planner kullanım haritasını çıkar. (`npm run creative:check`)
- [ ] Temel görsel golden/snapshot çıktıları oluştur.
- [x] Remotion input fixture'ları oluştur. (`web/remotion/fixtures/`)
- [x] Dikey/yatay her-sahnenin-ortası golden snapshot kontrolü ekle. (`npm run creative:render-check`, baseline: `npm run creative:snapshots`)
- [x] Uzun Türkçe metin, emoji ve boş alan testleri ekle. (`stress-copy-vertical.json`)
- [ ] Render süresi, boyutu ve hata nedenini logla.

**Kabul:** Tasarım kırılmaları hızlı biçimde tespit edilebiliyor.

### Faz 1 — Mevcut video motorunu tamamla

- [x] `product`, `review`, `ugc_split`, `wrapped` sahnelerini planner'a bağla. (`scenePlan.ts`: `productArchetypes`/`contentStoryArchetypes`/`quickPromoArchetypes`)
- [x] Kaynak türüne göre sahne seç. (`selectVideoRecipe`)
- [x] Video recipe sistemi oluştur. (`VIDEO_RECIPES` + video sayfasında tarif seçici)
- [x] Arka plan video seçimini UI'a bağla. (video sayfası, "Video arka planı" seçici)
- [x] Müzik seçimi/kapatma kontrolü ekle. (video sayfası, "Müzik" seçici)
- [x] Sahne bazlı yeniden üretim modelini hazırla. — Veri katmanı (`scenePlanEditor.ts`: replaceScene/reorderScene/updateSceneCopy) burada hazırlandı, UI'a bağlanması Faz 6'ya (Storyboard editörü) taşındı — ✅ Faz 6'da tamamlandı.
- [x] Remotion Player ile render öncesi önizleme ekle. (`VideoPlanPreview.tsx`, gerçek `@remotion/player`)

**Kabul:** Aynı kaynak için en az üç sahne yapısı üretilebiliyor ve ürün videosu yalnızca slayt gibi görünmüyor. ✅ karşılandı.

### Faz 2 — Brand Design Tokens ve öneri sistemi

- [x] Token modelini tanımla. (`web/src/lib/brand/designTokens.ts`)
- [x] Brand DNA'dan deterministik varsayılan üret. (`color_palette` + `visual_style`/`trait_scores` → renk + 6 arketip; boş marka için de tam, geçerli bir tokens objesi üretiyor)
- [x] Şablonları ortak token'lara bağla. **23/23 kart tipi tamamlandı.** İki farklı derinlikte uygulandı:
  - **Tam entegrasyon** (renk + font + köşe/gölge + logo pozisyonu + CTA şekli): `quote`, `stat`, `product`, `testimonial`, `comparison`, `event`, `changelog`, `checklist`, `featuretable`, `matrix`, `thisorthat`, `carousel`, `trend`, `problemsolution`, `notification`, `notes` (16 tip — hepsi açık/nötr "editorial" karakterli, brand rengi doğal olarak oturuyor).
  - **Kasıtlı sınırlı entegrasyon** (sadece font, bazen tek bir accent dokunuşu): `chat` (iMessage mavisi), `podcast` (neon mor/pembe/camgöbeği), `newsflash` (kırmızı "breaking news" kimliği), `coupon` (siyah "premium kupon" zemini, sadece altın→marka rengi), `deal` (fotoğraf odaklı nötr zemin, sadece fiyat rozeti rengi), `socialpost` (kod içi yorumla kasıtlı olarak "gerçek ekran görüntüsü" hissini bozmamak için font bile sabit, sadece accent). Bu 7 tip için tam renk geçişi uygulanmadı çünkü **sabit renk paleti şablonun kendi kimliği** (ör. "neonPurple" adının kendisi mor demek, "breakingRed" kırmızı demek) — marka rengiyle değiştirmek şablonun amacını bozar.
  - Bu turda 8 gerçek "hesaplanıp hiç kullanılmayan accent" bug'ı (event, changelog, checklist, featuretable, notes, chat, podcast, deal, newsflash) ve 1 gerçek render bug'ı (carousel'in inline `style=""` içinde `font-family` değerinin çift tırnak içermesi — HTML özniteliğini erken kapatıp tüm stili geçersiz kılıyordu, tarayıcı varsayılan serif fonta düşüyordu) bulundu ve düzeltildi.
  - Doğrulama: `npm run creative:design-tokens` — 3 sahte marka × 23 tip = 69 render, hepsi görsel olarak kontrol edilebilir durumda `web/scripts/design-token-fixtures/output/` altında.
- [x] İçerik amacı sınıflandırıcısı ekle. (`web/src/lib/ai/classifyContentPurpose.ts` — Groq/`FAST_MODEL`, 10 kategori, `ai_runs`'a `classify_content_purpose` aşamasıyla loglanıyor, `suggestPostIdea.ts` ile aynı iskelet)
- [x] En uygun üç varyantı öner. (`web/src/lib/cards/contentPurpose.ts` — kategori→3 şablon+varyant (güvenli/dikkat çekici/deneysel) statik, doğrulanmış tablo; `web/src/app/api/cards/suggest-template/route.ts`; Görsel Oluştur sayfasında elle-seçim akışının üstüne opsiyonel "Ne oluşturmak istiyorsun?" kutusu olarak eklendi, mevcut akışı bozmuyor)
  - Yan bulgu: `templateFieldConfig.ts`'te `podcast`/`photoreview`/`deal`/`newsflash`'ın varyant anahtarları kebab-case yazılmıştı ama gerçek registry'ler camelCase — bu 3 tipte UI'daki stil pillerinin ilkinden başkasına tıklamak sessizce hiçbir şey değiştirmiyordu. 10 anahtar düzeltildi.
  - Doğrulama: `npm run creative:verify-suggestions` — 10 kategori × 3 slot, hepsi gerçek şablon+varyanta çözümleniyor.

**Kabul:** Farklı şablonlar aynı marka kimliğini taşıyor. ✅ **23/23 kart tipinde tamamlandı.** Faz 2'nin tüm maddeleri kapandı.

### Faz 3 — Akıllı görsel işleme

- [x] Otomatik crop ve focal point. (`web/src/lib/media/imageAnalysis.ts` — `smartCropToSize()`, sharp'ın `resize({fit:"cover", position: sharp.strategy.attention})` özelliği; libvips'in kendi saliency algoritması, ücretsiz/deterministik, ML API'ye ihtiyaç yok)
- [~] Arka plan kaldırma abstraction'ı. **Şimdilik atlandı** (kullanıcı kararı) — gerçek ML segmentasyon gerektiriyor, ücretsiz/deterministik bir yol yok. Tekrar gündeme gelirse ayrı bir plan gerekir.
- [~] Ürün gölgesi. **Şimdilik atlandı** (kullanıcı kararı) — arka plan kaldırmaya bağımlı, o olmadan anlamsız.
- [x] Çözünürlük uyarısı. (`checkResolutionWarning()` — hedefin ~0.7x altındaki görseller için Türkçe uyarı metni; hem `photoreview`/`newsflash`'ın full-bleed crop akışında hem `data:` URI yüklemelerinde çalışıyor)
- [x] Metin/obje çakışma kontrolü. (`isRegionBusy()` — greyscale stdev eşiği; sadece arka planı gerçekten tam-canvas olan `photoreview` ve `newsflash` için `textSafeZone` bölgesinde çalıştırılıyor, layout'u değiştirmiyor, sadece kullanıcıyı uyarıyor)
- [x] Uzak asset ingest standardı. (`ingestRemoteImage()` genişletildi — `cropTo` opsiyonu ile smart-crop + upload; kartların görsel alanları artık video'nun ürün-URL akışıyla simetrik şekilde brand'in kendi Storage'ına re-host ediliyor, canlı bir CDN'e render zamanında bağımlı kalmıyor)

Uygulama: `web/src/lib/cards/processImageField.ts` (yeni) — her görsel alanı üretim anında işler (`data:` URI'da sadece çözünürlük kontrolü, `https://` URL'de ingest+opsiyonel crop+opsiyonel yoğunluk kontrolü); `templateFieldConfig.ts`'in `FieldConfig`'ine `fullBleed`/`textSafeZone` eklendi (sadece `photoreview.bgImageUrl` ve `newsflash.bgImageUrl` — bu ikisi tam canvas'ı kaplayan tek arka plan görseli); `api/cards/[type]/route.ts` devreye alındı, uyarılar `{results, warnings}` olarak dönüyor; `dashboard/image/page.tsx`'te üretim sonrası engelleyici olmayan amber uyarı listesi eklendi; `api/cards/preview/route.ts`'e dokunulmadı (önizleme hızlı/ücretsiz kalıyor).

Doğrulama: `npm run creative:verify-image-processing` — sentetik (ağ bağımsız) görsellerle `smartCropToSize`'ın merkez yerine yoğun köşeyi seçtiğini, `checkResolutionWarning`'in her iki eşiği de doğru işlediğini, `isRegionBusy`'nin düz/yoğun bölgeleri doğru ayırt ettiğini kanıtlıyor.

**Kabul:** Ana konu farklı formatlarda kaybolmuyor ve metinle çakışmıyor. ✅ **4/6 maddede tamamlandı**, arka plan kaldırma + ürün gölgesi kullanıcı kararıyla şimdilik dışarıda.

### Faz 4 — Video yükleme ve otomatik edit

- [x] MIME/boyut doğrulama. (Storage bucket allowlist'ine `video/quicktime` eklendi — patch 0062 — iPhone'un varsayılan `.mov`'u önceden reddediliyordu; API rotası ayrıca `duration_seconds <= 180` render-maliyet sınırı ve dosya türü kontrolü yapıyor)
- [x] Metadata ve poster üretimi. (`web/src/lib/media/videoUploadMeta.ts` — tamamen istemci tarafında: off-DOM `<video>` + canvas ile genişlik/yükseklik/süre okunuyor ve bir poster JPEG'i üretiliyor, sunucuya hiç round-trip yok; `media.poster_url` — patch 0060)
- [x] Video medya kütüphanesi. (Büyük ölçüde zaten vardı — `MediaLibraryModal.tsx` video yükleme/önizleme/seçim akışını zaten destekliyordu, sadece hiçbir video job'a bağlanmıyordu; şimdi `defaultFilter="video"` ile video-öncelikli açılabiliyor, poster'lar küçük resim olarak kullanılıyor)
- [x] Remotion sahnesinde kullanıcı videosu. (`web/remotion/scenes/UserClipShowcase.tsx` — yeni `"user_clip"` sahne arketipi, `"user_clip_reel"` tarifi: `hook → user_clip → outro`; `<Video trimBefore trimAfter loop>` kullanıyor — `loop`, kırpılan klip sahne süresinden kısa kaldığında gerekiyor)
- [x] Crop/trim. (Trim tamamen ücretsiz — Remotion'ın kendi `trimBefore`/`trimAfter` prop'ları, re-encode yok; crop için `web/src/lib/media/focalPoint.ts` — Faz 3'ün `isRegionBusy()` primitive'ini genelleştirip poster kare üzerinde birkaç aday pencere deneyerek statik bir focal-point offset'i hesaplıyor)
- [x] Sessizlik tespiti. **İstemci-taraflı öneri niteliğinde** (kullanıcı kararı) — `web/src/lib/media/silenceDetection.ts`, tarayıcının native Web Audio `decodeAudioData`'sıyla (ffmpeg/mediabunny değil) best-effort RMS analizi; trim editöründe sessiz bölgeleri amber renkle işaretliyor, hiçbir şeyi bloklamıyor, desteklenmeyen tarayıcı/codec'te sessizce devre dışı kalıyor.
- [x] Dikey/kare/yatay varyasyon. **Kare (1:1) şimdilik ayrı bir iş olarak bırakıldı** (kullanıcı kararı) — kare eklemek mevcut TÜM Remotion sahnelerinin layout mantığını etkiliyor. Bu turda: kendi videosunu yükleyen kullanıcı, aynı klip+trim ayarlarıyla Dikey VE Yatay formatı tek işlemde üretebiliyor (ikinci format arka planda ayrı bir job olarak kuyruğa alınıyor, canlı takip edilmiyor — çıktısı medya kütüphanesinde beliriyor).

Uygulama notu: Bu turda **hiçbir yeni npm bağımlılığı** eklenmedi — metadata/poster tamamen tarayıcı `<video>`+canvas ile, sessizlik tespiti native Web Audio API ile, crop/trim Remotion'ın kendi prop'larıyla çözüldü.

Yan bulgu: `estimateFocalOffset()`'i doğrularken, Faz 3'te şimdiye kadar fark edilmeyen gerçek bir bug ortaya çıktı — `imageAnalysis.ts`'teki `isRegionBusy()` (ve onu birebir örnek alan yeni `focalPoint.ts`), sharp/libvips'in bu sürümünde `.extract(region).stats()` zincirlemesi bölgeyi sessizce yok sayıp HER ZAMAN görselin TÜMÜNÜN istatistiğini döndürüyordu — yalnızca extract'i önce ayrı bir buffer'a "materialize" edip stats'ı YENİ bir sharp örneği üzerinde çalıştırınca doğru sonuç geliyordu. Faz 3'ün doğrulama scripti bunu yakalayamamıştı çünkü test bölgesi her zaman görselin tamamıyla aynıydı; hem `isRegionBusy()` hem `verify-image-processing.ts`'in testi düzeltildi (artık bir görselin gerçek bir ALT bölgesini kırpıp test ediyor). Bu, `processImageField.ts`'nin `photoreview`/`newsflash` için metin-çakışma uyarısının Faz 3'ten beri hiç doğru çalışmadığı, her zaman TÜM arka plan görselinin yoğunluğunu kontrol ettiği anlamına geliyor — şimdi düzeldi.

Doğrulama: `npm run creative:verify-video-upload` — sentetik (ağdan bağımsız) bir poster görseliyle `estimateFocalOffset`'in yoğun köşeye kaydığını, `classifySilentWindows`'un art arda sessiz pencereleri doğru gruplandırdığını, `planScenes({sourceType:"user_upload"})`'un her zaman `[hook, user_clip, outro]`'ya çözümlendiğini kanıtlıyor.

**Kabul:** Ham telefon videosundan yayınlanabilir markalı Reel alınabiliyor. ✅ **6/7 maddede tamamlandı**, kare format kullanıcı kararıyla ayrı bir işe bırakıldı.

### Faz 5 — Voice-over ve altyazı

Araştırma, `VideoInputProps.voiceoverAudio`'nun ve `Main.tsx`'in ses/ducking mantığının **zaten tam çalışır durumda ama uçtan uca hiç beslenmediğini** ortaya çıkardı (tek kullanan yer, git'e hiç işlenmemiş bir manuel benchmark scripti) — bu faz büyük ölçüde var olan bir player'ı gerçek bir üretici ile besleme işiydi. Sağlayıcı: **OpenAI TTS (`tts-1`)** + **Groq Whisper (`whisper-large-v3`, kelime zaman damgalarıyla)** — kullanıcı kararıyla, ikisi de zaten projede kurulu API key'leri kullanıyor (sıfır yeni hesap/key).

- [x] TTS provider abstraction. (`web/src/lib/ai/ttsProvider.ts` — `embeddings.ts`'in `OPENAI_API_KEY` deseniyle aynı, `POST /v1/audio/speech`, `tts-1`)
- [x] Metin düzenleme ve ses seçimi. (Görsel Oluştur değil, Video sayfasında "Seslendirme ekle (opsiyonel)" bölümü — checkbox + serbest metin kutusu + 6 OpenAI sesinden seçim; `user_upload` kaynağında gizli — klibin kendi sesi korunuyor, iki ses üst üste binmesin diye)
- [x] TTS storage kaydı. (`web/src/lib/video/generateVoiceover.ts` — üretilen mp3 `media` Storage bucket'ına yükleniyor, kütüphanede görünmesin diye `media` TABLOSUNA satır eklenmiyor — geçici bir render girdisi; patch 0063 bucket'a `audio/mpeg` ekledi)
- [x] Ses süresine göre sahne hesabı. (`scenePlan.ts`'in yeni `rescaleSlotsToDuration()`'ı — `durationSeconds`/DB constraint'e hiç dokunmadan, `planScenes()`'in kendi `allocateFrames()`'ini tekrar kullanarak sahneleri gerçek ses uzunluğuna orantılı yeniden dağıtıyor; `Root.tsx`'in render süresini SADECE `scenePlan`'dan hesapladığı doğrulandı)
- [x] Transkripsiyon/kelime zamanlama. (`web/src/lib/ai/transcribeAudio.ts` — Groq Whisper endpoint'i gerçek bir çağrıyla smoke-test edildi, `duration` + kelime-seviyesi `words[]` doğrulandı)
- [x] Caption component bağlantısı. (`web/remotion/components/VoiceoverCaptions.tsx` — resmi `@remotion/captions` paketi (zaten kuruluydu, sadece `package.json`'a eklendi) ile TikTok-stili sayfalama; `Main.tsx`'te `StoryProgressBar`'ın yanına üst-seviye overlay olarak eklendi, `HormoziCaptions`/`HookText.tsx`'e hiç dokunulmadı — her sahne archetype'ının üzerinde otomatik görünüyor)
- [x] Müzik ducking kontrolü. (Kod değişikliği gerekmedi — `Main.tsx`'teki ducking mantığı zaten vardı, sadece `voiceoverAudio` gerçekten set edildiğinde aktifleşti)

Hata/geri düşüş: TTS veya transkripsiyon başarısız olursa render asla düşmüyor — video seslendirmesiz/altyazısız/ducking'siz normal şekilde üretiliyor (mevcut best-effort felsefesiyle tutarlı, `generateSceneCopy()`/`ingestRemoteImage()` ile aynı desen).

Doğrulama: `npm run creative:verify-voiceover` — `rescaleSlotsToDuration`'ın hedefi tuttuğunu ve `MIN_SCENE_FRAMES` tabanını koruduğunu, `wordsToCaptions`'ın saniye→ms ve boşluk-öneki kuralını doğru uyguladığını, `clampTargetFrames`'in sınır durumlarını, ve gerçek (kurulu) `createTikTokStyleCaptions()`'ın sentetik veriyle doğru sayfaladığını kanıtlıyor.

**Kabul:** Ses, sahne ve altyazı senkron; kullanıcı metni düzeltebiliyor. ✅ **7/7 madde tamamlandı.**

### Faz 6 — Storyboard editörü

**Mimari değişiklik (kullanıcı kararıyla, mevcut akışın yerine geçti):** Video işi artık tek atımlık değil — `POST /api/video/jobs` bir taslak hazırlıyor (`prepareVideoDraft.ts`: tüm AI-maliyetli iş — sahne metni, seslendirme+transkripsiyon — burada TEK sefer çalışıyor), iş `'draft'` durumuna geçiyor, kullanıcı storyboard editöründe düzenliyor, `POST /api/video/jobs/[id]/render` ile render'ı açıkça tetikliyor. `buildVideoInputProps.ts` ikiye bölündü: `buildDraftScenePlan()` (AI'lı) + `assembleVideoInputProps()` (AI'sız, sadece DB okuması — `renderVideoJob.ts` artık bunu kullanıyor, render anında hiç AI çağrısı yok). Bu değişiklik aynı zamanda gerçek bir UX iyileştirmesi: kullanıcı artık render'dan önce GERÇEK AI-yazılmış sahne metnini görüyor (önceden sadece sahte önizleme metni görüyordu).

- [x] Sahne kartları ve drag-and-drop. (`StoryboardEditor.tsx` — `@dnd-kit/sortable` ile liste-içi yeniden sıralama; `@dnd-kit/core` zaten kuruluydu ama mevcut kullanımı takvimin kartı-farklı-bölgeye-bırakma deseniydi, doğrusal sıralama için `sortable` eklendi)
- [x] Silme/çoğaltma. (`scenePlanEditor.ts`'e `deleteScene`/`duplicateScene` eklendi — hook/outro sahneleri silinemez/çoğaltılamaz, en az bir orta sahne kuralı korunuyor)
- [x] Metin/medya düzenleme. (`sceneFieldConfig.ts` — kartlar için `templateFieldConfig.ts`'in yaptığı işin video arketipleri karşılığı; görsel taşıyan arketiplerde `MediaLibraryModal`'ın zaten var olan tek-seçim modu)
- [x] Tek sahneyi AI ile yeniden üretme. (`regenerateSceneCopy()` — tüm-video `generateSceneCopy()`'nin tek büyük promptu yerine, `slotCopyInstruction()`'ı tek sahne için yeniden kullanan küçük ve izole bir Groq çağrısı; kaynak metni/ürün verisi taslak aşamasında `scene_plan`'e önbelleklendiği için `product_url` tekrar scrape edilmiyor)
- [x] Sahne süresi. (`setSceneFrames()` — sadece hedeflenen sahneyi değiştirir, komşu sahnelerden "ödünç almaz"; toplam süre buna göre canlı değişir)

Önemli bulgu: bu fazın veri katmanı (`scenePlanEditor.ts`: `replaceScene`/`reorderScene`/`updateSceneCopy`) Faz 1'de zaten hazırlanmış ama hiç kullanılmamıştı (Faz 1'in kendi notu: "veri katmanı hazır ama henüz UI'a bağlı değil") — bu faz büyük ölçüde onu gerçek bir taslak durumuna ve UI'a bağlama işiydi.

Şema: `supabase/patches/0064_video_draft_status.sql` — `status`'a `'draft'` eklendi, brand'in kendi `'draft'` satırlarını düzenleyebilmesi için (ve SADECE `'draft'` kalmaya devam ederse) yetkili bir UPDATE RLS politikası eklendi — durum geçişleri (draft→rendering) hâlâ admin client'a özel.

Doğrulama: `npm run creative:verify-storyboard` — `scenePlanEditor.ts`'in 6 fonksiyonunun (3 eski + 3 yeni) hepsi sentetik bir sahne planıyla test ediliyor: reorder/delete/duplicate/setFrames/updateCopy/replaceScene beklenen sonucu üretiyor mu, hook/outro silme/çoğaltma reddediliyor mu, `MIN_SCENE_FRAMES` clamp'i çalışıyor mu.

**Kabul:** Bütün videoyu yeniden üretmeden tek sahne değiştirilebiliyor. ✅ **5/5 madde tamamlandı.**

### Faz 7 — Çoklu format paketi

Bu faz, Faz 1-6'da inşa edilen Creative Studio'yu (kart üretimi + video pipeline'ı) roadmap'ten ÖNCE var olan Compose/Calendar/onay sistemine bağlayan ilk fazdı. Yeni, küçük bir `content_packages` tablosu (patch 0065) — `content` ve `video_render_jobs`'a nullable `package_id` FK'leri — dört çıktıyı gruplamak için tek eklenen şema; mevcut satır şekillerine hiç dokunulmadı.

Kullanıcı kararları: **video, paket oluşturulduğunda otomatik render'a girmiyor** — Faz 6'nın storyboard incelemesinden geçiyor, paket önizleme ekranında kullanıcı onu da inceleyip Render'a basıyor. **Carousel, otomatik olarak gerçek/zamanlanabilir bir gönderiye dönüşüyor** (sadece görsel üretmekle kalmıyor).

- [x] Tek brief'ten feed, story, carousel ve video. (`createContentPackage.ts` — tek bir `generatePackageBrief()` Groq çağrısı tüm metni üretiyor; feed+story `quote` kart tipiyle [kasıtlı kapsam kararı: 23 tipin AI-sınıflandırıcısı değil, tek güvenilir tip — aynı metin iki formatta], carousel `carousel` kart tipiyle, video mevcut `POST /api/video/jobs`'un aynı insert'i + `prepareVideoDraft()` ile — Faz 1-6 hiç değişmedi)
- [x] Mesaj tutarlılığı. (Tek Groq çağrısının dört çıktıya da aynı `PackageBrief` nesnesinden beslenmesiyle bedavaya geliyor — feed/story literal olarak aynı metni taşıyor)
- [x] Formata göre yeniden layout. (Aynı `quoteText`, kart render pipeline'ının kendi `square`/`story` format mantığıyla iki farklı boyutta; carousel kendi cover+item+CTA çok-slaytlı layout'unu kullanıyor)
- [x] Paket önizleme ve toplu onay. (`dashboard/packages/[id]/page.tsx` — 4 çıktı tek ekranda; video hâlâ taslaksa Faz 6'nın `StoryboardEditor`'ı doğrudan gömülü; onay `dashboard/posts/page.tsx`'in mevcut `approveAll()`'ının BİREBİR aynı sorgu şekli, `package_id` ile filtrelenmiş — yeni bir onay makinesi icat edilmedi)
- [x] Takvime paket ekleme. (Aynı "Onayla ve Zamana Ekle" aksiyonu — `content_platforms.scheduled_at`'ı paketin tüm satırları için aynı anda set ediyor)

Kapanan boşluk: render tamamlanan bir videonun `content`/`content_platforms`'a hiç otomatik bağlanmadığı (`renderVideoJob.ts`'in artık `attachToPackage()` hook'u) bir gerçek mimari eksiklikti — bu fazda kapatıldı, paket dışı videolar için hâlâ manuel (kabul edilmiş, kapsam dışı).

**Kabul:** Tek fikirden en az dört yayınlanabilir çıktı alınabiliyor. ✅ **5/5 madde tamamlandı.** Faz 8 sertleştirmesinde orkestrasyonun hata sonuçları artık kontrol ediliyor; paket `ready`, `partial_ready` veya `failed` olarak gerçek çıktı sayısına göre kapanıyor. Video taslağı route seviyesinde gerçek `after()` ile başlatılıyor. `npm run creative:verify-package` paket durumlarını ve markalar arası medya reddi kontratını doğruluyor; gerçek Supabase üzerinde canlı paket üretimi dağıtım smoke-test'i olarak korunuyor.

### Faz 8 — Ölçekleme ve operasyon

- [x] Chromium browser pool. (`browserPool.ts`: süreç başına paylaşılan Chromium, varsayılan 2 eşzamanlı context, 45 sn sayfa timeout'u, kopmada tek kontrollü reconnect; sistem Chrome/Edge fallback'i)
- [x] Timeout ve kontrollü retry. (`localRenderer.ts`: 8 dk üst render timeout'u + Remotion cancel signal; DB queue: 15/30/60 sn üstel backoff, varsayılan 3 deneme)
- [x] Görsel/video worker ayrımı. (Görsel işler sınırlı `browserPool` üzerinden; video işler HTTP yaşam döngüsünden ayrılmış kalıcı DB queue + `/api/workers/video-render` worker endpoint'i üzerinden yürür)
- [x] Queue ve render metriği. (`queued_at`, `next_attempt_at`, `attempt_count`, `worker_id`, `queue_wait_ms`, `render_duration_ms`; takılan render'lar worker tarafından yeniden kuyruğa alınır)
- [x] Job başına maliyet. (`estimated_cost_usd`; yerel altyapı maliyeti `VIDEO_RENDER_COST_PER_MINUTE_USD` ile gerçek çalışma süresinden hesaplanır)
- [x] Geçici dosya temizliği. (MP4 her sonuçta `finally/unlink`; kart clip frame klasörü `finally/rm`; medya DB kaydı başarısızsa yüklenen Storage nesnesi geri silinir)
- [x] Render provider geçiş testi. (`renderProvider.ts` provider registry; `npm run creative:verify-operations` local seçim, bilinmeyen provider reddi, retry ve maliyet kontratını doğrular)
- [x] Yük testi. (`npm run creative:load-test -- 12`: ortak pool üzerinde 12 eşzamanlı 540×540 render; yerel ölçüm 9.1 sn toplam / 8.5 sn p95)

Operasyon şeması: `0066_content_package_partial_status.sql` ve `0067_video_render_queue.sql`. İkinci patch dakikalık Supabase Cron dispatcher'ını da ekler; request içindeki `after()` hızlı ilk çalıştırmadır, cron ise restart/retry garantisidir. Worker bearer doğrulaması `RENDER_WORKER_SECRET`, `SCHEDULER_WEBHOOK_SECRET` veya `CRON_SECRET` ile yapılır.

Doğrulama: production build ve TypeScript geçti; ESLint **0 hata**; 13/13 Remotion fixture snapshot eşleşti; design-token PNG seti üç sahte marka için üretildi; package/security, provider/retry/cost ve 12-job görsel yük kontrolleri geçti. Playwright CDN indirmesi yerel ağda timeout verdiği için pool mevcut sistem Chrome'una güvenli fallback yaptı; CI kendi Chromium'unu `playwright install --with-deps chromium` ile kurar.

**Kabul:** Trafik web uygulamasını kilitlemeden render işleri izlenebiliyor ve tekrar denenebiliyor. ✅ **8/8 madde kod ve yerel doğrulama düzeyinde tamamlandı.** Canlı kabul için 0066/0067 patch'leri uygulanmalı, scheduler secret tanımlanmalı ve staging'de bir gerçek video queue smoke-test'i yapılmalı.

## 9. İlk geliştirme sprinti

### Hedef

Ürün URL'sinden veya ürün görsellerinden daha zengin bir 15 saniyelik dikey video:

```text
Hook → Product → Feature → Review/Stat → CTA
```

### Görev sırası

1. [ ] `scenePlan.ts` kaynak ve medya türlerini alacak şekilde genişlet.
2. [ ] Video recipe modelini oluştur.
3. [ ] Ürün URL'si için product recipe seç.
4. [ ] `product`, `review`, `ugc_split`, `wrapped` copy modellerini tamamla.
5. [ ] `buildVideoInputProps.ts` içinde verileri çöz.
6. [ ] Review verisi yoksa stat/feature fallback uygula.
7. [ ] Deterministik sahne seçimini koru.
8. [ ] Dikey/yatay fixture render üret.
9. [ ] Uzun metin, eksik görsel ve fiyat testleri ekle.
10. [ ] Video sayfasında recipe/sahne özeti göster.

### Kabul kriterleri

- Gerçek `ProductShowcase` otomatik kullanılıyor.
- En az bir zengin sahne planner tarafından seçiliyor.
- Eksik veri render'ı kırmıyor.
- 10/15/20 saniye süresi doğru.
- 9:16 ve 16:9 render tamamlanıyor.
- Aynı job aynı planı üretiyor.
- Çıktı yalnızca metin ve fotoğraf slaytı gibi görünmüyor.

## 10. Başarı metrikleri

### Ürün

- İlk önizlemeye ulaşma süresi
- İlk öneriyi kabul oranı
- Şablon/sahne değiştirme oranı
- Düzenleme ve yeniden üretim sayısı
- Onay ve gerçek yayın oranı

### Teknik

- Ortalama/p95 render süresi
- Queue bekleme süresi
- Render başarı ve retry oranı
- CPU/bellek ve job maliyeti
- Asset indirme/font hataları

### Kalite

- Text overflow
- Düşük kontrast
- Safe area ihlali
- Marka dışı işaretlenen çıktı
- Aynı marka içindeki görsel tutarlılık

## 11. Riskler

| Risk | Önlem |
|---|---|
| Çok fazla şablon | AI önerisi, en fazla üç ilk seçenek |
| Videonun slayt gibi görünmesi | Gerçek video, zengin recipe, ses ve altyazı |
| Render maliyeti | Metrik, cache, concurrency ve süre limiti |
| Uzak asset bozulması | Storage ingest, timeout ve fallback |
| Marka tutarsızlığı | Ortak Brand Design Tokens |
| AI'ın fazla metin üretmesi | Alan limiti, metin ölçümü, otomatik kısaltma |
| Editörün büyümesi | Timeline yerine storyboard |
| TTS/caption senkronu | Ses metadata'sı ve zamanlama testleri |
| Generative video maliyeti | Yalnızca opsiyonel kısa B-roll |
| Telif/lisans | Asset kaynak ve lisans metadata'sı |

## 12. Açık kararlar

- TTS sağlayıcısı
- Transkripsiyon/forced-alignment sağlayıcısı
- Arka plan kaldırma yöntemi
- Müzik lisans kaynağı
- Focal-point tespiti
- Tam veya proxy Remotion Player önizlemesi
- Ayrı worker/Lambda'ya geçiş eşiği
- Maksimum video süresi/dosya boyutu
- Görsel/video kredi maliyeti

Bu kararlar ilk sprinti engellemez; ilk sprint mevcut bağımlılıklarla yapılabilir.

## 13. Nihai yön

Tentamark yalnızca tasarım üretmemelidir:

> Kullanıcı bir fikir veya ürün verir; sistem markaya uygun yaratıcı yönü seçer, doğru görsel/video formatlarını üretir, kullanıcıya kontrol verir ve yayınlanabilir içerik paketi hazırlar.

Öncelik sırası:

```text
Yaratıcı brief kalitesi
        +
Marka tutarlılığı
        +
Gerçek kullanıcı medyası
        +
Düzenlenebilir storyboard
        +
Güvenilir render
```

**Başlangıç:** Faz 0 güvence çalışmasından sonra Faz 1 ürün video recipe'si uygulanacaktır.
