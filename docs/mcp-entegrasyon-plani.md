# Tentamark MCP Sunucusu — Kod Tabanı Envanteri ve Güvenlik Boşlukları

Bu doküman, "MCP'yi aşamalı yapalım: önce salt okunur, sonra taslak, sonra
onaylı işlemler, sonra yayınlama, sonra zengin arayüz" planına karşı gerçek
kod tabanının ne kadar hazır olduğunu çıkarır. Kod yazılmadı — bu, neyin
hazır/eksik olduğunun dökümü.

## Genel tablo

| Aşama | Ne kadar hazır | Ana eksik |
|---|---|---|
| 1. Salt okunur | %80 hazır — fonksiyonlar zaten var | Server-side "brand context" çağrılarını MCP token'ından org/brand'e çözen bir katman yok |
| 2. Taslak üretimi | %70 hazır — üretim fonksiyonları var | Merkezi yetki, kota, hız sınırı, maliyet kontrolü ve ortak AI run kaydı eksik |
| 3. Onaylı işlemler | %20 hazır — mantık var ama sadece tarayıcı istemcisiyle, komponent içine gömülü | Server-side mutation fonksiyonları hiç yok, yazılması lazım |
| 4. Yayınlama | %60 hazır — gerçek publish pipeline'ı sağlam ve güvenli | MCP'nin bu pipeline'ı *tetikleme* yolu var ama SCHEDULER_WEBHOOK_SECRET'a asla dokunmamalı |
| 5. Zengin arayüz (MCP Apps) | %0 | Sıfırdan iş |
| **Kimlik doğrulama (hepsinin temeli)** | **%0** | **Üretim istemcileri için OAuth, geliştirici betası için PAT ve merkezi actor context yok** |
| **Audit log** | **Şema var, hiç kullanılmıyor** | `audit_logs` tablosu duruyor ama tek bir `insert` bile yok |

---

## 1) Aşama 1 — Salt okunur araçlar

Bunların çoğu zaten `"use server"` Server Action olarak var. Ancak Server
Action'ları doğrudan MCP tool'una sarmak yerine içlerindeki iş mantığı ortak,
server-only domain servislerine çıkarılmalı. Hem mevcut UI hem MCP aynı servisleri
çağırmalı; kimlik doğrulama ve taşıma katmanları iş mantığına karışmamalı:

- `getAnalyticsOverview(brandId)` — **dikkat**: `channels`, `topPosts`,
  `bestPostingHours` alanları gerçek veri değil, sabit demo fixture'ları.
  MCP'ye gerçek gibi sunmadan önce bunu ya gerçek veriye bağlamalı ya da
  MCP tool açıklamasında "bu alanlar henüz örnek veri" diye işaretlemeliyiz.
- `getAudienceInsight(brandId)`
- `getBrandIntelligenceSummary(brandId)`
- `getDashboardBriefing(brandId)`
- `getLearningLog(brandId, days)`
- `getLatestStrategy(brandId)` / `listStrategyVersions(brandId)`
- `getBrandContext(brandId)` — marka DNA'sının formatlanmış hali, diğer
  AI fonksiyonlarının da beslendiği kaynak.
- `getCurrentBrand()` / `getUserWorkspaces()` — **oturuma bağlı**, `brandId`
  parametresi almıyor; MCP tarafında bunların server-action hallerini değil,
  doğrulanmış OAuth/PAT bağlantısının erişebildiği workspace ve markaları
  `McpActorContext` üzerinden çözen eşdeğerlerini yazmak lazım.
- Takvim/gönderi listesi (`fetchContentRows`) — önemli engellerden biri: bu
  fonksiyon tarayıcı Supabase client'ı parametre olarak alıyor, yani RLS'e
  (oturum çerezine) güveniyor. MCP sunucusunun oturumu olmayacağı için bu
  mantık server-side eşdeğere taşınmalı. Mümkün olan çağrılarda kullanıcı adına
  üretilen kısa ömürlü JWT ile RLS çalıştırılmalı. Service-role gereken
  işlemler merkezi bir `McpActorContext` olmadan çağrı kabul etmemeli.

## 2) Aşama 2 — Taslak üretimi

Burası işlev bakımından en hazır kısım. Aşağıdaki fonksiyonların çoğu "öneri
üretir, `content`/`content_platforms`'a yazmaz" prensibiyle yazılmış. Bu durum
veri mutasyonu riskini azaltır ama güvenlik ve maliyet kontrollerini ortadan
kaldırmaz:

`suggestPostIdea`, `generateDrafts`, `generateWeeklyPack`,
`analyzePostHookAndVirality`, `getBrandVoiceConsistency`,
`suggestPostImprovement`, `recycleContentHook`, `generateSmartHashtags`,
`remixContent`, `fixBrandSafetyIssues` (+ senkron `scanCaptionForBrandIssues`
dedektörü), `askAssistant`, `generateCaptionLab`, `multiplyContent`,
`generateImage`/`generateImagePrompt`.

`generateDrafts`, `generateWeeklyPack`, `suggestPostIdea` ve `askAssistant`
gibi temel fonksiyonlar `ai_runs` kaydı yazıyor. Ancak listelenen tüm AI
fonksiyonları bunu yapmıyor. Örneğin `analyzePostHookAndVirality`,
`getBrandVoiceConsistency`, `recycleContentHook`, `generateSmartHashtags`,
`remixContent`, `fixBrandSafetyIssues`, `generateCaptionLab` ve `generateImage`
için ortak kayıt garantisi yok.

Her AI tool'u aşağıdaki merkezi çalıştırıcıdan geçmeli:

```ts
executeAiOperation({
  actor,
  source: "mcp",
  operation: "generate_weekly_pack",
  idempotencyKey,
  run: () => generateWeeklyPack(/* ... */),
});
```

Bu katman yetki, plan kotası, marka erişimi, eş zamanlı çağrı sınırı, zaman
aşımı, token/maliyet bütçesi ve `ai_runs` kaydını garanti etmeli. MCP ajanının
aynı üretim aracını döngü içinde tekrar tekrar çağırabileceği varsayılmalı.

## 3) Aşama 3 — Onaylı işlemler (tarih değiştirme, onaya gönderme, onaylama)

**Burası gerçek iş gerektiren yer.** Şu an bu mantığın hiçbiri server-side,
paylaşılan bir fonksiyon olarak yok — hepsi tarayıcı bileşenlerinin içine
gömülü, tarayıcı Supabase client'ı ve oturum çerezine güveniyor:

- `approveContentRow`, `rejectContentRow`, `setContentApproval`,
  `deleteContentRow`, `assignContentRow`, `insertContentComment`,
  `toggleContentEvergreen` (`approvalItems.ts` içinde, ama parametre olarak
  tarayıcı client'ı istiyor)
- Takvimde sürükle-bırak ile tarih değiştirme (`calendar/page.tsx` içine
  gömülü, paylaşılan bir fonksiyona hiç çıkarılmamış)
- `savePlatform`, `retryPlatform`, `sendForReview`, `approveAll`
  (`posts/page.tsx` içine gömülü)

Bunların **server-side, merkezi actor context ve yetki kontrolü kullanan
eşdeğerlerini yazmadan** MCP bu aşamaya geçemez. Service role gerekiyorsa
yalnız bu ortak katmanın içinde kullanılmalı. İyi haber: kod tabanında bunun
için iyi bir örnek var — `content_share_links` +
`respond_to_share_link()` RPC'si. Dışarıdan,
oturumu olmayan bir "harici incelemeci" bir token ile `approve`/`feedback`
diyebiliyor. MCP OAuth/PAT sistemini tasarlarken bu desenin tek kullanımlık,
hashlenmiş, sınırlı ve iptal edilebilir token özelliklerinden yararlanmalıyız.

Ayrıca `approvalItems.ts`'in kendi yorumları şunu açıkça uyarıyor: Takvim ve
Gönderiler ekranları bir zamanlar bu mantığı ayrı ayrı kopyalamış ve
birbirinden sapmıştı. MCP için üçüncü bir kopya yazmak yerine, önce bu
mantığı gerçekten paylaşılan, server-callable bir modüle taşımak (Takvim ve
Gönderiler de ondan çağırsın) hem MCP'yi hem de mevcut UI'ı aynı anda
sağlamlaştırır.

## 4) Aşama 4 — Gerçek yayınlama

Buradaki gerçek yayın altyapısı zaten sağlam ve dokunmamak gereken bir
"kutsal" akış: `dispatch_due_content()` (her dakika pg_cron) →
`process_publish_queue()` → `net.http_post` ile
`/api/scheduler/publish`'e `Bearer SCHEDULER_WEBHOOK_SECRET` ile çağrı →
gerçek platform API'sine yayın.

**MCP'nin bu akışı asla kısayoldan geçmemesi gerekiyor.** Yani bir MCP
"şimdi yayınla" tool'u:
- ASLA `content_platforms.status`'u doğrudan `PUBLISHING`/`PUBLISHED` yapmamalı
  (bu sahte bir yayın kaydı üretir, gerçek platforma hiçbir şey gitmez).
- ASLA `SCHEDULER_WEBHOOK_SECRET`'ı bilmemeli/kullanmamalı (bu sunucu-only,
  Vercel/Vault sırrı — bir MCP client'ına asla verilmemeli).
- Bunun yerine UI'ın `retryPlatform()` akışıyla aynı domain servisini
  çağırmalı. Mevcut fonksiyon zamanı `now()` değil yaklaşık iki dakika ileri
  ayarlıyor, hata/retry alanlarını temizliyor ve platformu `PENDING` durumuna
  getiriyor. Ayrıca `require_approval_schedule` trigger'ı içerik `APPROVED`
  olmadan önce bütün platform varyantlarında geçerli yayın zamanı bekliyor.
- Bu iki tablo güncellemesi MCP tool'u içinde ayrı ayrı yapılmamalı. Tek bir
  transaction/RPC; rolü ve scope'u doğrulamalı, kaydı kilitlemeli, daha önce
  yayınlanmadığını kontrol etmeli, zamanı atamalı, onaylamalı, audit kaydı
  oluşturmalı ve mevcut kuyruğa bırakmalı.

Bu, "MCP kendi yayın mekanizmasını icat etmiyor, var olanı güvenle tetikliyor"
demek.

## 5) Aşama 5 — Zengin arayüz (MCP Apps)

Kod tabanında bunun bir emsali yok — takvim/onay kartları şu an sadece React
bileşenleri. Bu tamamen yeni bir iş, aşama 1-4 oturana kadar konuşmaya
gerek yok.

---

## En kritik eksik: OAuth, PAT ve merkezi yetki bağlamı

Tentamark'ın MCP istemcileri için OAuth yetkilendirme sunucusu veya geliştirici
Personal Access Token (PAT) kavramı yok. İki yöntem farklı kullanım alanlarına
sahip olmalı:

- **OAuth 2.1:** Claude, ChatGPT ve son kullanıcı bağlantılarının ana yöntemi.
- **PAT:** CLI, Cursor, şirket içi otomasyonlar ve kontrollü geliştirici betası.

Yalnız PAT/API key ile başlamak üretim entegrasyonunu tamamlamaz. Remote MCP
istemcilerinin standart bağlantısı için OAuth keşif metadatası, yetkilendirme,
token ve iptal akışları gerekir. En az şu yüzey planlanmalı:

```text
POST /mcp
GET  /.well-known/oauth-protected-resource
GET  /.well-known/oauth-authorization-server
GET  /oauth/authorize
POST /oauth/token
POST /oauth/revoke
```

Var olan iki "oturumsuz güvenilir çağıran" örneği:

1. `SCHEDULER_WEBHOOK_SECRET` — tek, global, paylaşılan bir sır (env
   variable), `timingSafeEqual` ile karşılaştırılıyor. Org/brand'e özel
   değil, sadece "bu cron/webhook gerçekten bizden mi" sorusuna cevap
   veriyor.
2. `content_share_links.token` — tek bir içerik kaydına, iki eyleme
   (`approve`/`feedback`) sınırlı, iptal edilebilir token.

PAT betası için ikisinin güvenli özelliklerini taşıyan yeni tablolar gerekir.
Üretim OAuth bağlantıları PAT tablosunda tutulmamalı:

```sql
create table public.mcp_personal_access_tokens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  brand_id uuid references public.brands(id),
  label text not null,
  token_prefix text not null unique,
  token_hash text not null,
  scopes text[] not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked_at timestamptz
);
```

`brand_id = null` değerini otomatik olarak "organizasyondaki bütün markalar"
saymak tehlikelidir. Çoklu marka erişimi gerekiyorsa ayrı bir bağlantı-marka
ilişki tablosunda açıkça verilmelidir.

Token'ın yalnız hash'i saklanmalı; arama için güvenli bir `token_prefix`, UI
için son dört karakter tutulabilir. Ham token yalnız oluşturulurken bir kez
gösterilmeli. Token süresiz olmamalı.

OAuth bağlantıları için ayrıca bağlantı sahibi, istemci kimliği, izin verilen
markalar, scopes, token ailesi, son kullanım ve iptal durumunu saklayan bir
`mcp_connections` modeli gerekir.

Her doğrulanmış çağrı aşağıdaki merkezi bağlama dönüştürülmeli:

```ts
type McpActorContext = {
  actorType: "user" | "mcp_oauth" | "mcp_pat";
  userId: string;
  organizationId: string;
  brandIds: string[];
  scopes: McpScope[];
  connectionId: string;
};
```

Domain servisleri doğrudan dışarıdan gelen `brandId` değerine güvenmemeli;
markanın `actor.brandIds` içinde olduğunu merkezi olarak doğrulamalı.

RLS `private.is_org_member(org_id)` üzerinden `auth.uid()`'e bakıyor. Mümkün
olan işlemlerde kullanıcı adına kısa ömürlü JWT ile RLS çalıştırmak, service
role + elle filtre yaklaşımından daha güvenlidir. Service role gereken
işlemler yalnız `McpActorContext` alan ortak repository/domain katmanından
geçmeli. Her tool içinde tekrar tekrar manuel org filtresi yazılmamalı.

Scope'lar geniş `read/draft/approve/publish` etiketleri yerine en az şu kadar
ayrıntılı olmalı:

```text
brand:read
calendar:read
analytics:read
media:read
draft:create
draft:update
approval:request
approval:decide
schedule:update
publish:request
```

## İkinci kritik eksik: audit log şeması var, hiç kullanılmıyor

`audit_logs` tablosu (`organization_id, user_id, action, entity_type,
entity_id, metadata`) schema.sql'de duruyor, RLS'i bile hazır — ama
**tüm kod tabanında tek bir `insert into audit_logs` yok**. Aşama
3-4'teki her MCP eylemi (onaylama, tarih değiştirme, yayınlama) bu tabloya
gerçek bir satır yazan **ilk** kod olacak.

Şemadaki yorum tabloyu "tamper-evident" olarak adlandırıyor ancak mevcut yapı
tek başına kurcalamaya dayanıklı değildir. Audit kayıtlarında update/delete
engellenmeli ve insert yalnız kontrollü bir RPC/service üzerinden yapılmalı.

`user_id` insan profiline referans verdiği için aşağıdaki alanları eklemek
`metadata` içine serbest metin yazmaktan daha güvenli ve sorgulanabilirdir:

```text
actor_type        user | mcp_oauth | mcp_pat | system
actor_id          kullanıcı veya bağlantı kimliği
mcp_connection_id OAuth/PAT bağlantısı
request_id        uçtan uca korelasyon kimliği
tool_name         çağrılan MCP tool'u
outcome           success | denied | failed
before_state      değişiklik öncesi sınırlı snapshot
after_state       değişiklik sonrası sınırlı snapshot
client_name       Claude, ChatGPT, Cursor vb.
```

Hassas token, sosyal medya access token'ı, tam prompt veya kişisel veri audit
metadata'sına yazılmamalı.

## Üçüncü nokta: yayınlama tool'unda insan onayı nasıl garanti edilir

MCP tool çağrıları bir insanın butona tıklamasından değil, bir LLM'in karar
vermesinden gelir. "Yayınla" tool'unun açıklamasına "önce kullanıcıya göster,
onay al" yazmak yeterli değil — modelin buna uymayabileceğini varsaymalıyız.
Önerim: yayınlama tool'u asla tek adımda çalışmasın; önce bir
`content_share_links` benzeri, insanın tıklayıp gerçekten onayladığı bir
bağlantı üretsin, tool sadece o bağlantıyı döndürsün. Gerçek durum değişikliği
(status → APPROVED) yalnızca o bağlantıya insan tıkladığında olsun. Bu,
"konuşma içinde otomatik yayın" riskini tamamen ortadan kaldırır.

MCP istemcisinin kendi "tool approval" ekranına güvenilmemeli; bu davranış
istemciye göre değişebilir. Tentamark tarafındaki insan onayı sunucu tarafından
zorlanmalı. `publish:request` yalnız kısa ömürlü, tek kullanımlık bir onay
işlemi oluşturmalı; gerçek durum değişikliği Tentamark onay ekranında yapılmalı.

## Dördüncü kritik eksik: idempotency ve eş zamanlı değişiklik kontrolü

MCP istemcileri zaman aşımı veya ağ hatasında aynı tool çağrısını yeniden
gönderebilir. Bütün yazma ve maliyet oluşturan araçlar `idempotency_key`
almalı. Aynı bağlantı + tool + anahtar kombinasyonu ikinci defa yan etki
üretmemeli; önceki sonucu dönmeli.

Bu özellikle şu işlemler için zorunludur:

- AI taslağı veya haftalık plan üretme
- İçerik oluşturma
- Tarih değiştirme
- Onaylama/reddetme
- Yayınlama isteği

Kullanıcı UI'da bir içeriği değiştirirken ajan eski veri üzerinden işlem
yapabilir. Mutation tool'ları `expected_version` veya `expected_updated_at`
almalı. Değer güncel kayıtla eşleşmiyorsa `CONFLICT` dönüp yeni verinin
okunmasını istemeli.

## Tool sözleşmeleri ve veri sınırları

Her MCP tool'u için isim, amaç, JSON Schema girdisi, yapılandırılmış çıktı,
scope, risk sınıfı, idempotency davranışı ve hata kodları belgelenmeli.

Önerilen ilk salt-okunur yüzey:

```text
get_brand_profile
get_weekly_calendar
get_pending_approvals
get_post_details
search_media
get_performance_summary
find_calendar_gaps
```

İlk yazma yüzeyi:

```text
create_content_brief
create_post_draft
generate_weekly_plan
reschedule_draft
submit_for_approval
request_publish_approval
```

Liste araçları cursor tabanlı pagination ve düşük bir varsayılan limit
kullanmalı. Tool çıktıları bütün DB satırını değil sadece gerekli alanları
dönmeli. Takvim tarihleri ISO 8601 olarak dönmeli ve workspace zaman dilimi
her cevapta açıkça belirtilmeli.

Standart hata kodları en az şunları içermeli:

```text
UNAUTHENTICATED
FORBIDDEN
NOT_FOUND
CONFLICT
VALIDATION_ERROR
RATE_LIMITED
QUOTA_EXCEEDED
APPROVAL_REQUIRED
TEMPORARILY_UNAVAILABLE
```

## Gizlilik ve operasyon

MCP bağlantısı marka, içerik ve performans verilerinin Claude, OpenAI veya
başka bir istemci tarafından işlenmesine yol açabilir. Bağlantı ekranı hangi
verilerin paylaşılacağını ve hangi işlemlere izin verildiğini göstermeli.

Gerekli ürün/operasyon kontrolleri:

- Workspace yöneticisi MCP'yi tamamen kapatabilmeli.
- Bağlantı ve izinler marka bazında sınırlandırılabilmeli.
- OAuth/PAT anında iptal edilebilmeli.
- Erişim ve audit saklama süreleri tanımlanmalı.
- Gizlilik politikası üçüncü taraf AI istemcilerini kapsamalı.
- IP/connection/tool bazlı rate limit bulunmalı.
- Tool süresi, hata oranı, reddedilen erişim ve AI maliyeti izlenmeli.
- Health check, request ID ve alarm eşikleri tanımlanmalı.
- Sosyal medya token'ları ve `SCHEDULER_WEBHOOK_SECRET` tool çıktısına,
  modele veya audit kaydına hiçbir zaman girmemeli.

## MCP protokol ve SDK kararı

Uzak sunucu tek bir standart `/mcp` yüzeyi sunmalı; Claude, ChatGPT ve diğer
istemciler için ayrı iş mantıkları yazılmamalı. İstemciye özel bağlantı
dokümantasyonu olabilir ancak tool sözleşmeleri ortak kalmalı.

Yeni uygulamada eski monolitik `@modelcontextprotocol/sdk` yerine güncel
TypeScript sunucu paketi `@modelcontextprotocol/server` ve gerekli HTTP
adapter'ı kullanılmalı. Protokol/SDK sürümü sabitlenmeli, conformance testleri
CI'da çalıştırılmalı ve sürüm yükseltmeleri kontrollü yapılmalı.

---

## Önerilen geliştirme sırası

### Aşama 0 — Sözleşme ve güvenlik temeli

1. İlk tool listesini, JSON Schema girdilerini, çıktıları, hata kodlarını,
   scope'ları ve risk sınıflarını dondur.
2. `McpActorContext` ve merkezi marka/organizasyon yetki kontrolünü yaz.
3. UI ve gelecekteki MCP'nin birlikte kullanacağı server-only domain
   servislerini çıkar. Server Action'lar bu servislerin ince adaptörü olsun.
4. Audit insert servisini, idempotency kayıtlarını ve optimistic concurrency
   kontrolünü kur.
5. AI işlemleri için ortak kota/maliyet/loglama çalıştırıcısını oluştur.

### Aşama 1 — Kimlik doğrulama

1. OAuth authorization server, metadata, token, refresh/revoke akışlarını kur.
2. Kontrollü geliştirici betası için süreli ve scope'lu PAT sistemini ekle.
3. Bağlantı yönetimi ekranını ekle: istemci, markalar, izinler, son kullanım,
   iptal.
4. Tenant izolasyonu, token iptali ve scope testlerini yaz.

### Aşama 2 — Salt okunur MCP beta

1. `@modelcontextprotocol/server` ile uzak `/mcp` sunucusunu kur.
2. Marka, haftalık takvim, onay kuyruğu ve sınırlı performans araçlarını aç.
3. Demo fixture döndüren analytics alanlarını kaldır veya açıkça unavailable
   olarak işaretle; örnek veriyi gerçek metrik gibi sunma.
4. Pagination, timezone, rate limit, structured error ve gözlemlemeyi doğrula.

### Aşama 3 — AI ve taslak araçları

1. Brief, fikir ve taslak üretimini kota/maliyet katmanı üzerinden aç.
2. Taslağı DB'ye kaydeden ayrı tool'u idempotent hale getir.
3. MCP kaynaklı AI kullanımını `source = mcp` ve connection/request kimliğiyle
   raporla.

### Aşama 4 — Kontrollü mutation

1. Tarih değiştirme ve onaya gönderme araçlarını ortak domain servisine bağla.
2. Her mutation'da audit, idempotency ve version conflict testi çalıştır.
3. Rol/scope matrisi için negatif testler ekle.

### Aşama 5 — Yayınlama isteği

1. Doğrudan `publish_post` yerine `request_publish_approval` aç.
2. Kısa ömürlü, tek kullanımlık Tentamark onay ekranı üret.
3. İnsan onayından sonra mevcut scheduler kuyruğunu transaction/RPC üzerinden
   tetikle.
4. Aynı içeriğin iki kez yayınlanamadığını uçtan uca test et.

### Aşama 6 — Zengin arayüz

Kullanım verisi MCP'nin benimsendiğini gösterirse MCP Apps ile takvim, onay
kartı ve performans özeti gibi zengin yüzeyleri değerlendir. Bu aşama ilk
MCP sürümünün ön koşulu değildir.

## İlk sürümün tamamlanma ölçütleri

- Bir Claude/ChatGPT istemcisi standart OAuth ile Tentamark'a bağlanabiliyor.
- Kullanıcı yalnız açıkça izin verdiği workspace ve markaları görebiliyor.
- Salt okunur araçlar demo veriyi gerçek veri gibi döndürmüyor.
- Yazma araçları scope, idempotency ve version kontrolü olmadan çalışmıyor.
- Her MCP çağrısı request/connection kimliğiyle izlenebiliyor.
- AI maliyeti kullanıcı, marka, tool ve MCP bağlantısı bazında raporlanıyor.
- Yayınlama yalnız Tentamark içindeki insan onayından sonra mevcut scheduler
  kuyruğundan geçiyor.
- Token iptali bir sonraki çağrıyı anında engelliyor.
- Tenant izolasyonu ve yetki testleri CI'da geçiyor.

## Resmî teknik referanslar

- MCP server primitives: https://modelcontextprotocol.io/specification/draft/server/index
- MCP authorization: https://apps.extensions.modelcontextprotocol.io/api/documents/authorization.html
- MCP TypeScript SDK v2: https://ts.sdk.modelcontextprotocol.io/v2/
- Anthropic MCP desteği: https://docs.anthropic.com/en/docs/mcp
- OpenAI remote MCP araçları: https://platform.openai.com/docs/api-reference/responses
