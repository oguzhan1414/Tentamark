# 5. Temel Özellikler ve Kullanıcı Akışları

> Kaynak: `ai-marketing-manager-project-spec.md` bölüm 4, 5, 6, 14, 15, 16, 20, 21, 22. Bkz. [00-README.md](00-README.md) için doküman haritası.

## 5.1 Marka Onboarding

Kullanıcı ilk girişte marka oluşturur.

### Minimum bilgiler

- Marka adı
- Logo
- Marka fotoğrafı / avatar
- Sektör
- Web sitesi
- Ürün/hizmetler
- Hedef müşteri
- Marka dili
- Marka tonu
- Ana renkler
- Yasak kelimeler/konular
- Rakipler

### Opsiyonel

- Instagram hesabı
- TikTok hesabı
- Facebook Page
- LinkedIn Page
- YouTube Channel

## 5.2 Brand DNA

AI bu bilgilerden yapılandırılmış bir Brand DNA oluşturmalı.

Örnek:

```json
{
  "brand_name": "Example Coffee",
  "industry": "Coffee Shop",
  "tone": ["friendly", "premium", "warm"],
  "target_audience": {
    "age": "18-35",
    "interests": ["coffee", "lifestyle", "design"]
  },
  "visual_identity": {
    "primary_colors": ["#..."],
    "secondary_colors": ["#..."],
    "style": "minimal, warm, premium"
  },
  "content_rules": {
    "avoid": ["aggressive sales", "political topics"],
    "cta_style": "soft"
  }
}
```

Bu yapı bütün AI işlemlerinde kullanılmalı.

## 5.3 Avatar / Marka Karakteri

Kullanıcının marka fotoğrafı/avatarsı ürünün görsel kimliğinin başlangıcı olabilir.

Ancak:

> Avatar, ürünün ana değeri değildir.

Ana değer marka yönetimidir.

Avatar ileride: AI spokesperson, video presenter, Reels karakteri, story karakteri olarak kullanılabilir.

MVP'de sadece marka görsel kimliği olarak tutulması daha mantıklı.

## 5.4 İçerik Takvimi

Dashboard'ın merkezinde Content Calendar bulunmalı.

Örnek:

```text
MON
Instagram Reel       10:00
LinkedIn Post        14:00

TUE
Instagram Story      19:00

WED
TikTok Video         18:00

THU
LinkedIn Post        12:00

FRI
Instagram Reel       20:00
```

Her içerik: Draft, Approved, Scheduled, Published, Failed durumlarından birinde olmalı.

> **Not (eklenen değerlendirme):** Bu bölümde takvim UI'ının kendisi (haftalık/aylık görünüm, sürükle-bırak ile yeniden zamanlama, çoklu platform gösterimi) hiç detaylandırılmamış — spec seviyesinde bu normal, ama tasarıma geçmeden önce en az birkaç kullanıcı akışı (ör. "kullanıcı bir içeriği reddedip yeniden ürettirmek isterse ne olur?") somutlaştırılmalı. Aşağıdaki 5.6 Approval Sistemi de bu boşluğu kısmen paylaşıyor.

## 5.5 Platforma Özel İçerik

Aynı içerik bütün platformlara aynen gönderilmemeli.

Örneğin:

**Instagram** — Kısa caption + emoji + hook + CTA

**LinkedIn** — Profesyonel anlatım + insight + discussion CTA

**TikTok** — Kısa hook + hızlı açıklama + hashtag

**YouTube** — Title + description + tags

AI aynı kampanyadan platforma özel versiyonlar üretmeli.

## 5.6 İçerik Üretimi (MVP)

### Metin

AI ile: caption, hook, CTA, hashtag, LinkedIn post, video script, content idea üret.

### Görsel

İlk sürümde iki seçenek:

1. Kullanıcı görsel yükler.
2. AI görsel üretimi opsiyonel olarak kullanılır.

### Video

MVP'de AI video üretimini zorunlu özellik yapma.

Kullanıcı:

- MP4 yükleyebilir.
- AI script oluşturabilir.
- AI caption oluşturabilir.
- Videoyu platform formatına hazırlayabilir.

Bu yaklaşım maliyeti ciddi şekilde düşürür.

> **Not (eklenen değerlendirme):** "Kullanıcı görsel yükler" seçeneği hedef kitlenin (kafe, esnaf, e-ticaret) çoğunun zaten kendi fotoğraf/tasarımına sahip olduğu gerçeğiyle uyumlu — bu, MVP'de AI görsel üretimine göre önceliklendirilmeli. AI görsel üretimi "opsiyonel" olarak doğru konumlandırılmış.

## 5.7 Approval Sistemi

Otomatik yayınlama kullanıcıya bırakılmalı.

Varsayılan:

```text
AI generated
      ↓
User review
      ↓
Approve
      ↓
Schedule
      ↓
Publish
```

İleri planda:

```text
Auto-publish mode
```

eklenebilir. Ancak kullanıcı bunu açıkça aktif etmeli.

## 5.8 Scheduler

Backend scheduler:

```text
Scheduled Job
     ↓
Check content
     ↓
Check platform token
     ↓
Check media
     ↓
Publish
     ↓
Save response
     ↓
Update status
```

Gerekli: Retry, Exponential backoff, Idempotency, Error logging, Timezone, Platform rate-limit handling.

## 5.9 OAuth / Token Yönetimi

Kullanıcı sosyal medya şifresini kesinlikle istemiyoruz.

Akış:

```text
Connect Instagram
        ↓
OAuth
        ↓
Authorization
        ↓
Access Token
        ↓
Encrypt / secure storage
        ↓
Refresh when necessary
```

Tokenlar:

- DB'de plain text tutulmamalı.
- Loglara yazılmamalı.
- Frontend'e gereksiz şekilde gönderilmemeli.
