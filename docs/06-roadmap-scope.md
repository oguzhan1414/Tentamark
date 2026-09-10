# 6. Kapsam ve Yol Haritası

> Kaynak: `ai-marketing-manager-project-spec.md` bölüm 31, 32, 33, 34, 35. Bkz. [00-README.md](00-README.md) için doküman haritası.

> **Not (eklenen değerlendirme — okumadan önce):** Aşağıdaki P0 listesi orijinal dokümandan olduğu gibi taşındı, içerik değiştirilmedi. Ancak şunu açıkça belirtmek gerekiyor: bu liste (auth + 3 platform OAuth/publish/analytics + AI content + calendar + scheduler + analytics dashboard + haftalık öneri) tek başına 3-6 aylık bir V1 ürünü tanımlıyor, klasik anlamda bir "MVP" değil. Eğer amaç en hızlı şekilde "kullanıcı AI'ın ürettiği içeriği gerçekten onaylayıp yayınlar mı?" hipotezini test etmekse, bu listeyi daha da daraltmak (ör. tek platform = Instagram, analytics loop'u olmadan) değerlendirilmeli. Bu, roadmap'i şu an için değiştirmiyor — ayrı bir karar noktası olarak burada işaretlendi.

## 6.1 MVP'de Olması Gerekenler (P0)

### Authentication

- Email
- Google OAuth

### Brand

- Brand oluştur
- Logo
- Marka bilgileri
- Brand DNA

### Social

- Instagram
- Facebook Page
- LinkedIn

### Content

- AI idea generation
- AI caption
- AI post
- Image upload
- Basic image generation
- Content preview

### Calendar

- Weekly calendar
- Monthly calendar
- Schedule

### Publishing

- Publish now
- Schedule publish
- Publish status
- Retry

### Analytics

- Basic metrics
- Content performance
- Top posts

### AI

- Weekly recommendations
- Content suggestions

## 6.2 MVP'de Olmaması Gerekenler

Şimdilik çıkar:

- AI video generation
- AI avatar videos
- Full ad management
- CRM
- Email marketing
- WhatsApp marketing
- Competitor scraping
- Advanced social listening
- Sentiment analysis
- Influencer marketplace
- Team approval workflows
- White label
- Mobile app
- Fine-tuning
- RAG
- Complex agent swarm

Bunların hepsi ürünün ilerleyen sürümlerine bırakılabilir.

## 6.3 V1 Yol Haritası

### Phase 1 — Foundation

- Next.js
- Supabase
- Auth
- Brand model
- Database
- Dashboard

### Phase 2 — Brand AI

- Brand onboarding
- Brand DNA
- AI strategy
- Content ideas

### Phase 3 — Content

- Content editor
- Media upload
- AI copy
- Calendar

### Phase 4 — Social

- Instagram
- Facebook
- LinkedIn
- OAuth
- Publish

### Phase 5 — Analytics

- Metrics
- Content performance
- AI recommendations

### Phase 6 — Beta

- 10–20 test customer
- Usage tracking
- API failures
- Cost measurement
- UX improvements

> **Not (eklenen değerlendirme):** Phase 4 ("Social") en riskli fazdır çünkü Meta/LinkedIn app review süreçleri (bkz. [08-critical-risks.md](08-critical-risks.md)) haftalar sürebilir ve bu süreç geliştirme bitmeden, mümkün olduğunca erken (ör. Phase 1-2 ile paralel) başlatılmalı — aksi halde Phase 6 beta testi review onayını beklemek zorunda kalabilir.

## 6.4 V2

Eklenebilir:

- TikTok
- YouTube
- Threads
- AI image generation
- Better analytics
- Competitor research
- Content repurposing
- Automatic weekly plans
- Approval workflows

## 6.5 V3

Daha ileri özellikler:

- AI video generation
- AI avatar
- Voice generation
- Social listening
- Trend detection
- Automated campaigns
- Ads
- A/B testing
- Advanced team features
