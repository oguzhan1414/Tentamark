# 10. Domain Mimarisi ve Scheduler Kararı

> Bu doküman, açık kaynak referansların incelenmesinden ve Supabase'in güncel
> dokümantasyonundan çıkan **kararları** kaydeder. Ürün vizyonu için
> [01-product-vision.md](01-product-vision.md), stack taslağı için
> [03-architecture.md](03-architecture.md).
>
> **Tarih:** 8 Eylül 2026

---

## 10.1 Kanıt tabanı

Aşağıdaki kararlar bu kaynakların doğrudan incelenmesine dayanıyor.

| Repo | Stack | Bizim için değeri |
|---|---|---|
| [trypostit/trypost](https://github.com/trypostit/trypost) | Laravel + Vue | 65 migration okundu. Şemanın 9 aylık **evrimi** (bkz. §10.2) |
| [clawnify/OpenPost](https://github.com/clawnify/OpenPost) | Preact + Hono + D1 (Cloudflare) | API yüzeyi, takvim okuma modeli (§10.3.1) |
| [dineshstack/post-scheduler-frontend](https://github.com/dineshstack/post-scheduler-frontend) | **Next.js 16 App Router + TS + Tailwind** | Bizimle **aynı stack**. Rota yapısı ve composer deseni (§10.9) |
| [cbsshekhawat18-lab/social-stats](https://github.com/cbsshekhawat18-lab/social-stats-social-media-manager) | Django + DRF + Celery + React | Token şifreleme ve **metrik saklama** kanıtı (§10.2, Ders 5) |
| [gitroomhq/postiz-app](https://github.com/gitroomhq/postiz-app) | Next.js + NestJS + Prisma + Temporal | 29.6k yıldızlı en büyük örnek, karşılaştırma noktası |
| [svar-widgets/react-calendar](https://github.com/svar-widgets/react-calendar) | React bileşeni, MIT çekirdek | Takvim kararı adayı (§10.8) |
| [GeorgeLxL/react-scheduled-calendar](https://github.com/GeorgeLxL/react-scheduled-calendar) | React bileşeni, MIT | **Elendi**: 1 yıldız, 9 commit, hobi projesi (§10.8) |
| [NafisRayan/Social-Media-Dashboard](https://github.com/NafisRayan/Social-Media-Dashboard) | Next.js 15 + Radix + Zustand | **Mock veriyle çalışan demo**, backend'i yok. Sadece UI fikri |

**Not:** "Hookpost" adlı repo bulunamadı, hakkında hiçbir çıkarım yapılmadı.

---

## 10.2 Referanslardan çıkan altı ders

Asıl değer mevcut tablolarda değil, neyin eklenip sonra **silindiğinde**.

### Ders 1: Genel amaçlı otomasyon motoru kurma

TryPost, Mayıs 2026'da node tabanlı bir görsel otomasyon motoru kurdu:
`automations`, `automation_trigger_items`, `automation_runs`, `automation_node_runs`,
`automation_node_states`. Beş tablo.

**5 Eylül 2026'da hepsini sildiler** (`drop_automation_tables`). Aynı gün, yerine
`repurposes` + `repurpose_items` koydular ve `posts` tablosuna
`repurpose_item_id` eklediler.

Yani: genel amaçlı workflow motoru 3.5 ay yaşadı ve çöpe gitti. Yerini alan şey,
**tek bir odaklı özellik** oldu: bir fikri alıp çoğaltmak.

**Kararımız:** Otomasyon/workflow motoru **yapmıyoruz**. Bunun yerine
[01-product-vision.md §1.4](01-product-vision.md)'teki "ONE IDEA → çoklu platform"
özelliğini birinci sınıf bir varlık olarak modelliyoruz. Bu karar zaten spec'teki
"gereksiz mikroservis mimarisi kurma" ilkesiyle örtüşüyor.

### Ders 2: Marka sesi serbest metin olarak çalışmıyor

`replace_brand_voice_notes_with_traits_on_workspaces` (Haziran 2026). Serbest metin
"marka tonunu yazın" alanını bırakıp **yapılandırılmış traits**'e geçtiler.

**Kararımız:** Brand DNA baştan yapılandırılmış JSON olarak tasarlanıyor
(bkz. [05-core-features-ux.md §5.2](05-core-features-ux.md)). Bu karar doğrulandı,
değiştirmiyoruz.

### Ders 3: `post_platforms` sistemin sıcak noktası

Tek `posts` kaydı, N tane `post_platforms` satırı. Her platformun kendi durumu ve
kendi `platform_post_id`'si var. Bu tabloya sonradan **iki ayrı index** eklendi
(Mart ve Eylül 2026), ikincisi `platform_post_id` üzerine.

`platform_post_id` index'i şunu söylüyor: platformun döndürdüğü uzak ID ile
**geriye doğru arama** yapıyorlar. Bu da analytics çekimi ve webhook eşleştirmesi
için zorunlu.

### Ders 4: Bağlantı sağlığı ayrı izleniyor

Üç ayrı migration bunun için eklendi:
- `social_accounts.is_active`
- `social_accounts.last_verified_at`
- `post_platforms.connection_warning_sent_at`

Yani token'ın ölüp ölmediğini periyodik kontrol edip, zamanlanmış gönderi
patlamadan **önce** kullanıcıyı uyarıyorlar. Bu, spec'teki "OAuth token
expire/refresh" riskinin ([08-critical-risks.md](08-critical-risks.md)) üretimdeki
somut çözümü.

### Ders 5: Metrik saklama tercihi ikiye ayrılıyor

TryPost'un 65 migration'ında **hiçbir analytics/metrics tablosu yok**. Metrikleri
ya canlı çekiyorlar ya hiç saklamıyorlar.

Buna karşılık **social-stats bir `DailyMetric` modeli tutuyor** ve Celery beat ile
günlük senkronize ediyor. OpenPost ise sadece `GET /api/stats` ile anlık özet
veriyor, geçmiş saklamıyor.

Yani üç referanstan yalnızca biri geçmiş metriği kalıcılaştırıyor.

**Kararımız: saklıyoruz.** [04-ai-engine.md §4.4](04-ai-engine.md)'teki öğrenme
döngüsü, geçmiş performansın saklanmasını **zorunlu** kılıyor. "Geçen ay eğitim
içerikleri %37 daha iyi performans gösterdi" cümlesini kurabilmek için zaman
serisi şart. Çoğu rakibin saklamadığı şey bizim çekirdek farkımız oluyor.

### Ders 6: Token şifreleme uygulamada nasıl yapılıyor

social-stats'ın README'si net: *"Tokens are encrypted at rest, per workspace"* ve
şifreleme **Fernet** ile yapılıyor. Yani RLS'e güvenilmiyor, uygulama katmanında
simetrik şifreleme var ve anahtar **workspace başına** ayrışıyor.

Bu, [08-critical-risks.md §8.7](08-critical-risks.md)'deki "RLS ≠ encryption"
uyarısının üretimdeki karşılığı. `social_tokens` için aynı yaklaşımı benimsiyoruz.

---

## 10.3 Domain modeli

TryPost'un hiyerarşisi (`accounts` → `workspaces` → içerik) bizim
[03-architecture.md §3.8](03-architecture.md)'deki `User → Organization → Brand`
modeliyle aynı şekilde. Değiştirmiyoruz, sadece isimlendirmeyi netleştiriyoruz.

```
organizations            faturalama ve abonelik sınırı
  └── brands             marka sınırı, Brand DNA burada yaşar
        ├── brand_dna              yapılandırılmış kimlik (JSON)
        ├── social_accounts        platform başına bağlantı + token sağlığı
        ├── media                  yüklenen görsel/video
        ├── content                platformdan bağımsız fikir/taslak
        │     └── content_platforms   platforma özel metin + durum + uzak ID
        ├── repurposes             bir fikirden türeyen çoklu içerik
        ├── analytics_snapshots    periyodik metrik yakalama (bizim farkımız)
        └── ai_usage               marka başına AI tüketimi
```

`organization_members` (kullanıcı ↔ organizasyon pivotu) yetkilendirmenin temeli.

### 10.3.1 Üç referansın da aynı yere varması

Bu model bir tercih değil, üç bağımsız projenin ortak sonucu:

| Proje | Aynı fikrin adı |
|---|---|
| TryPost | `posts` → `post_platforms` |
| social-stats | `UnifiedPost` ("write once, format per platform, schedule") |
| post-scheduler-frontend | Composer'da **"per-platform overrides"** |

Üçü de "tek içerik, platform başına varyant" diyor. `content` → `content_platforms`
ayrımı tartışmaya kapalı.

### Kritik tablo: `content_platforms`

Tek `content` kaydı, platform başına bir satır. Bu tablo şunları taşır:

| Alan | Neden |
|---|---|
| `content_id`, `platform` | hangi fikrin hangi platform sürümü |
| `caption`, `hashtags` | platforma özel yeniden yazılmış metin |
| `status` | **platform başına** durum (biri başarısız olsa diğerleri yayınlanır) |
| `platform_post_id` | uzak ID, analytics ve webhook eşleştirmesi için (index'li) |
| `scheduled_at` | platform başına farklı saat olabilir |
| `attempt_count`, `last_error` | retry mantığı |
| `connection_warning_sent_at` | token ölmüşse önceden uyarma |

Durum **platform başına** tutulur, bu tartışmasız. Instagram'a yayın başarısız
olduğunda LinkedIn'in de başarısız sayılması kabul edilemez.

---

## 10.4 İçerik durum makinesi

[03-architecture.md §3.2](03-architecture.md)'deki döngüyü koruyoruz, ama durumu
iki seviyeye ayırıyoruz:

**`content.status`** (fikrin genel hali):
`IDEA → GENERATING → DRAFT → NEEDS_REVIEW → APPROVED → SCHEDULED → PUBLISHED → ANALYZED`

**`content_platforms.status`** (her platformun kendi hali):
`PENDING → QUEUED → PUBLISHING → PUBLISHED`
Hata dalı: `PUBLISHING → FAILED → (retry) → QUEUED` veya `NEEDS_USER_ACTION`

`content.status = PUBLISHED` ancak **tüm** platform satırları terminal duruma
ulaştığında yazılır. Kısmi başarı `PARTIALLY_PUBLISHED` olarak işaretlenir.

---

## 10.5 Scheduler ve publisher: Supabase Cron + Queues

**Karar: Supabase Cron (pg_cron) + Supabase Queues (pgmq).** Ayrı bir Node worker
ve Redis kurulmuyor. Gerekçe: MVP'nin "$50/ay altı" hedefi
([07-business-model.md](07-business-model.md)) ve tek ekosistemde kalma.

### Güncel dokümandan doğrulanan kısıtlar

Supabase'in güncel dokümanından teyit edildi (eğitim verisine güvenilmedi):

- **Cron granülaritesi:** saniyeden yıla kadar. Dakika altı destekleniyor.
- **Cron ne çağırabilir:** SQL, veritabanı fonksiyonu, veya HTTP isteği
  (Edge Function tetikleme dahil).
- **Cron limiti:** *"no more than 8 Jobs run concurrently"* ve
  *"Each Job should run no more than 10 minutes."*
- **Queues teslim garantisi:** *"Exactly Once Message Delivery... within a
  customizable visibility window."* Mesajlar Postgres'te durur, arşivlenebilir.

### Bu kısıtların mimariye etkisi

En kritik sonuç: **marka başına veya platform başına cron job açılamaz.** 8 eşzamanlı
job limiti bunu imkansız kılar. Bu yüzden tek bir dispatcher deseni kullanıyoruz:

```
[1] Cron: dispatcher (dakikada bir)
       ↓ zamanı gelmiş content_platforms satırlarını bul
       ↓ pgmq'ya mesaj bas, satırı QUEUED yap
       ↓ (sadece kuyruğa basar, yayın yapmaz — 10 dk limitine takılmaz)

[2] Cron: publisher worker (dakikada bir, kısa batch)
       ↓ pgmq'dan mesaj oku (visibility timeout ile)
       ↓ token geçerli mi, medya hazır mı kontrol et
       ↓ platform connector'ı çağır
       ↓ başarı: platform_post_id yaz, PUBLISHED, mesajı arşivle
       ↓ hata: attempt_count++, backoff ile yeniden kuyruğa

[3] Cron: token health (günde bir)
       ↓ social_accounts.last_verified_at eski olanları doğrula
       ↓ ölü bağlantı varsa is_active=false + kullanıcıyı uyar

[4] Cron: analytics harvest (günde bir veya birkaç kez)
       ↓ PUBLISHED satırları platform_post_id ile sorgula
       ↓ analytics_snapshots'a yaz
```

Toplam 4 cron job. 8 limitinin altında, büyüme payı var.

**Idempotency:** pgmq exactly-once teslim garantisi verse de, publisher'ın kendisi
idempotent olmak zorunda. Çünkü platform API'sine istek gidip yanıt kaybolursa
mesaj yeniden görünür hale gelir ve **çift yayın** riski doğar. Çözüm: yayın
öncesi `content_platforms` satırını koşullu güncelleme ile `PUBLISHING`'e çekmek
(`WHERE status = 'QUEUED'`), böylece ikinci deneme satırı bulamaz ve çıkar.

**Neden kuyruk gerekli, doğrudan cron'dan yayın yapılamaz:** platform API çağrıları
yavaş ve rate-limit'e tabi. 10 dakikalık job limiti içinde onlarca markanın
gönderisini seri yayınlamak riskli. Kuyruk, işi küçük parçalara bölüp backoff
uygulamayı mümkün kılar.

### Referansların job altyapısı karşılaştırması

Bizim seçimimizi bağlama oturtmak için:

| Proje | Job altyapısı | Ek servis gerekiyor mu |
|---|---|---|
| Postiz | **Temporal** | Evet, ayrı Temporal cluster |
| social-stats | **Celery + beat + Redis** | Evet, Redis + worker |
| TryPost | Laravel queue (`jobs` tablosu) | Hayır, veritabanı kuyruğu |
| OpenPost | Cloudflare Workers | Hayır, edge runtime |
| **Tentamark** | **pg_cron + pgmq** | **Hayır, veritabanı içinde** |

TryPost'un veritabanı tabanlı kuyruğu bizim yaklaşımımıza en yakın olanı ve
üretimde 12 platformu taşıyor. Yani "Redis olmadan olmaz" doğru değil.

---

## 10.6 RLS ve marka izolasyonu

Multi-tenant bir üründe en kritik güvenlik sınırı bu. `public` şemasındaki **her
tabloda RLS açık** olacak.

Üyelik üzerinden izolasyon deseni:

```sql
alter table public.content enable row level security;

create policy "org members read content"
on public.content
for select
to authenticated
using (
  brand_id in (
    select b.id from public.brands b
    join public.organization_members m on m.organization_id = b.organization_id
    where m.user_id = (select auth.uid())
  )
);
```

Uyulacak kurallar (Supabase'in kendi güvenlik listesinden):

- **`TO authenticated` tek başına yetmez.** Sadece rolü kontrol eder, hangi satıra
  erişileceğini sınırlamaz. Sahiplik koşulu `USING` içinde olmak zorunda, aksi
  halde BOLA/IDOR açığı doğar.
- **UPDATE için hem `USING` hem `WITH CHECK` gerekir.** `WITH CHECK` olmadan
  kullanıcı bir satırın `brand_id`'sini başka bir markaya taşıyabilir.
- **UPDATE, SELECT policy'si de ister.** SELECT policy'si yoksa update sessizce
  0 satır döner, hata vermez.
- **`auth.uid()` her zaman `(select auth.uid())` olarak sarılır.** Performans için;
  aksi halde her satırda yeniden değerlendirilir.
- **`user_metadata` yetkilendirmede kullanılmaz.** Kullanıcı tarafından
  düzenlenebilir. Yetki verisi `app_metadata`'da durur.
- **`auth.role()` kullanılmaz**, deprecated. Anonim girişler açıkken sessizce
  kırılır.
- **Token'lar asla frontend'e gitmez.** `social_tokens` verisi yalnızca sunucu
  tarafında, service key ile okunur. Bu tablo Data API'ye hiç açılmaz.

**Not:** Yukarıdaki join'li policy her satırda çalıştığı için büyük tablolarda
maliyetli olabilir. Ölçüm yapıldıktan sonra, kullanıcının erişebildiği marka
listesini JWT `app_metadata`'ya taşımak veya private şemada `SECURITY DEFINER`
yardımcı fonksiyon kullanmak değerlendirilebilir. Erken optimize edilmiyor.

---

## 10.7 Yapmayacaklarımız

Referans incelemesinden çıkan, bilinçli olarak **kapsam dışı** bırakılanlar:

| Yapmıyoruz | Neden |
|---|---|
| Node tabanlı otomasyon/workflow motoru | TryPost kurdu, 3.5 ayda sildi |
| Sıfırdan takvim bileşeni | Hazır çözüm varken haftalar harcanmaz (§10.8) |
| Ayrı Node worker + Redis | MVP maliyet hedefini bozar, Cron+Queues yeterli |
| Temporal / Celery gibi ayrı job altyapısı | Postiz ve social-stats kullanıyor, bizim ölçeğimizde erken |
| Marka başına cron job | 8 eşzamanlı job limitine takılır |
| 12 platform | MVP'de 3 platform ([02-platform-research.md](02-platform-research.md)) |
| Unified inbox (DM/yorum yönetimi) | social-stats'ta var, bizim vaadimiz değil ([01-product-vision.md](01-product-vision.md)) |

---

## 10.8 Takvim kütüphanesi

Sıfırdan yazmıyoruz, bu net. Üç aday incelendi:

| Aday | Durum | Değerlendirme |
|---|---|---|
| [react-scheduled-calendar](https://github.com/GeorgeLxL/react-scheduled-calendar) | **1 yıldız, 9 commit, tek geliştirici** | **Elendi.** Özellik listesi iyi (day/week/month, drag-drop, i18n, CSS değişkenli tema) ama üretim olgunluğu yok. Takvim ürünün kalbi, hobi projesine bağlanamaz |
| [SVAR React Calendar](https://github.com/svar-widgets/react-calendar) | MIT çekirdek, ticari destekli | **Güçlü aday.** Day/week/month, drag-drop düzenleme ve oluşturma, olay editörü, filtreleme, tema, **iCal içe/dışa aktarım**, TypeScript, resmi Next.js rehberi var |
| FullCalendar | Endüstri standardı | post-scheduler-frontend bunu kullanıyor. Çok olgun, ama premium görünümler ayrı lisans ister; MVP'de gerekmiyor |

**Öneri: SVAR React Calendar.** Gerekçe: MIT çekirdeği bizim ihtiyacımızın
tamamını (drag-drop ile yeniden zamanlama dahil) karşılıyor, TypeScript yerli
destekli, ve Next.js entegrasyonu için resmi rehberi var. iCal dışa aktarım
ileride "takvimini Google Calendar'a bağla" özelliğini bedavaya getirir.

Karar kesinleşmeden önce her ikisinin de küçük bir prototiple denenmesi önerilir;
takvim geç değiştirilmesi pahalı bir bağımlılık.

---

## 10.9 Frontend deseni

[post-scheduler-frontend](https://github.com/dineshstack/post-scheduler-frontend)
bizimle **birebir aynı stack'i** kullanıyor (Next.js 16 App Router, TypeScript,
CSS değişkenli Tailwind), bu yüzden en doğrudan uygulanabilir referans.

**Rota yapısı** (bizim uyarlayacağımız hali):

```
app/
  (auth)/
  dashboard/
    compose/      içerik üretme ve düzenleme
    posts/        liste görünümü, durum filtreleri
    calendar/     takvim görünümü, sürükle bırak
    analytics/    performans ve AI önerileri
  settings/
```

**Composer deseni.** Onlarda akış şöyle: zengin metin gövdesi → **platform başına
override** → karakter sayacı → medya seçici → zamanlama seçici.

Bizim farkımız, akışın başına AI'ı koymak:

```
Brand DNA + geçmiş performans
        ↓
   AI taslakları üretir
        ↓
Instagram / Facebook / LinkedIn sürümleri (düzenlenebilir)
        ↓
   İnsan onayı  ← ürünün çekirdek vaadi
        ↓
      Zamanla
```

Yani onların "yaz, sonra platforma uyarla" akışı bizde "AI üretir, sen onaylarsın"
oluyor. Composer'ın veri modeli aynı (`content` + `content_platforms`), değişen
şey ilk taslağın nereden geldiği.

**Kütüphane seçimleri.** Onlar RHF + Zod, SWR, Lucide kullanıyor. Bizde form ve
doğrulama için **React Hook Form + Zod** mantıklı. Veri çekmede Next.js App
Router'ın kendi sunucu bileşenleri çoğu yerde yeterli; SWR/TanStack Query yalnızca
gerçekten istemci tarafı canlı veri gereken yerlerde eklenir.

**Not:** [Social-Media-Dashboard](https://github.com/NafisRayan/Social-Media-Dashboard)
mock veriyle çalışan bir demo, backend'i yok. Analytics **UI fikirleri** için
bakılabilir (takvim heatmap, zaman çizelgesi, etkileşim kartları) ama mimari
referans olarak kullanılmaz.

---

## 10.10 Açık kalan kararlar

1. **Connector arayüzü.** [02-platform-research.md §2.9](02-platform-research.md)'daki
   `SocialProvider` arayüzü TypeScript'te nasıl somutlaşacak, hata tipleri nasıl
   normalize edilecek. OpenPost'un deseni ilginç: yayın anında token'ı merkezi bir
   "credential" servisinden **taze** çekiyorlar, publisher token saklamıyor.
2. **Medya işleme.** Platform başına aspect ratio/süre/codec dönüşümü nerede
   yapılacak (Edge Function sınırları içinde mi, harici servis mi).
3. **Takvim prototipi.** SVAR ile FullCalendar arasındaki seçim, küçük bir deneme
   sonrası kesinleşmeli (§10.8).
