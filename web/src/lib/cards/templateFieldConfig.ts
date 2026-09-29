// Drives the dashboard's template picker + form — one entry per type key in
// typeRegistry.ts. Kept as a small bilingual config here (not the big
// tr/en dashboard.ts dictionaries) since it's template-shape metadata, not
// prose copy; adding a card type only ever touches this file plus a
// new entry in typeRegistry.ts.
export type FieldKind = "text" | "textarea" | "url" | "image" | "lines" | "numbers" | "rating";

export type FieldConfig = {
  key: string;
  kind: FieldKind;
  label: { tr: string; en: string };
  placeholder?: { tr: string; en: string };
  maxLength?: number;
  optional?: boolean;
  // Image fields only. `fullBleed`: this image fills the entire card canvas
  // (position:absolute; inset:0 in the template), so its exact target size
  // is known (the card's own dimensions) and it's worth smart-cropping
  // server-side rather than leaving a plain center-crop to CSS. Most image
  // fields (product photos in a sub-box, avatars, etc.) are NOT full-bleed —
  // their real on-screen box depends on per-variant CSS we don't track here,
  // so they're deliberately left alone (still get a resolution check, just
  // no crop). `textSafeZone`: the region (canvas fractions, 0-1, format-
  // independent) where this template always places its fixed text/badges —
  // used to warn if the photo is too visually busy there for readability.
  fullBleed?: boolean;
  textSafeZone?: { left: number; top: number; width: number; height: number };
};

export type TemplateVariant = {
  key: string;
  label: { tr: string; en: string };
  colorPreview: string; // hex or background for the UI pill
};

export type TemplateCategory = "growth" | "content" | "announcement" | "engagement";

export const TEMPLATE_CATEGORIES: { key: "all" | TemplateCategory; label: { tr: string; en: string } }[] = [
  { key: "all", label: { tr: "Tümü (23)", en: "All (23)" } },
  { key: "growth", label: { tr: "🚀 Büyüme & Satış", en: "🚀 Growth & Sales" } },
  { key: "content", label: { tr: "📝 İçerik & Not", en: "📝 Content & Notes" } },
  { key: "announcement", label: { tr: "📢 Duyuru & Lansman", en: "📢 News & Launch" } },
  { key: "engagement", label: { tr: "🔥 Etkileşim & Fikir", en: "🔥 Engagement" } },
];

export type TemplateConfig = {
  key: string;
  category: TemplateCategory;
  label: { tr: string; en: string };
  fields: FieldConfig[];
  variants?: TemplateVariant[];
  exampleValues?: Record<string, string>;
};

export const CARD_TEMPLATES: TemplateConfig[] = [
  {
    key: "quote",
    category: "content",
    label: { tr: "Alıntı Kartı", en: "Quote Card" },
    variants: [
      { key: "aurora", label: { tr: "Aurora Glass", en: "Aurora Glass" }, colorPreview: "linear-gradient(135deg, #6366F1, #EC4899, #10B981)" },
      { key: "editorial", label: { tr: "Editorial Luxury", en: "Editorial Luxury" }, colorPreview: "#FAF8F5" },
      { key: "clay", label: { tr: "Soft Clay", en: "Soft Clay" }, colorPreview: "#F5F3EC" },
      { key: "cyber", label: { tr: "Cyber Terminal", en: "Cyber Terminal" }, colorPreview: "#00FF9D" },
      { key: "centered", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#F4F2EC" },
      { key: "pastel", label: { tr: "Soft Pastel", en: "Soft Pastel" }, colorPreview: "#FDE2E4" },
    ],
    fields: [
      { key: "quote", kind: "textarea", label: { tr: "Alıntı Metni", en: "Quote Text" }, maxLength: 280 },
    ],
    exampleValues: {
      quote: "Müşterinin ne istediğini sormak yetmez; ~onların bile henüz hayal edemediği~ çözümü sunan _ilk kişi_ *sen olmalısın*.",
    },
  },
  {
    key: "comparison",
    category: "growth",
    label: { tr: "Karşılaştırma (Vs.)", en: "Comparison (Vs.)" },
    variants: [
      { key: "aurora", label: { tr: "Aurora Glass", en: "Aurora Glass" }, colorPreview: "linear-gradient(135deg, #6366F1, #EC4899, #10B981)" },
      { key: "split", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF8F5" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#F4F2EC" },
    ],
    fields: [
      { key: "leftLabel", kind: "text", label: { tr: "Sol Etiket", en: "Left Label" }, maxLength: 40, placeholder: { tr: "Eski Yöntem", en: "Old Way" } },
      { key: "leftText", kind: "textarea", label: { tr: "Sol Metin", en: "Left Text" }, maxLength: 160 },
      { key: "rightLabel", kind: "text", label: { tr: "Sağ Etiket", en: "Right Label" }, maxLength: 40, placeholder: { tr: "Tentamark Yöntemi", en: "The Tentamark Way" } },
      { key: "rightText", kind: "textarea", label: { tr: "Sağ Metin", en: "Right Text" }, maxLength: 160 },
    ],
    exampleValues: {
      leftLabel: "Eski Yöntem",
      leftText: "Her gün 4 saat manuel paylaşım, dağınık Excel tabloları ve _sıfır tutarlılık_.",
      rightLabel: "Tentamark Yöntemi",
      rightText: "Haftalık tek oturumda *otonom içerik motoru* ve ~5x daha yüksek~ organik büyüme.",
    },
  },
  {
    key: "carousel",
    category: "content",
    label: { tr: "Carousel Serisi", en: "Carousel Series" },
    variants: [
      { key: "centered", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF9F6" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFFDF5" },
    ],
    fields: [
      { key: "title", kind: "text", label: { tr: "Kapak Başlığı", en: "Cover Title" }, maxLength: 80 },
      {
        key: "items",
        kind: "lines",
        label: { tr: "Maddeler (her satıra bir tane)", en: "Items (one per line)" },
        placeholder: { tr: "İlk 2 saniyede dikkat çeken bir kanca kullan.\nYorumlara ilk 1 saat içinde cevap ver.", en: "Use a hook that grabs attention in 2 seconds.\nReply to comments within the first hour." },
      },
      { key: "ctaLabel", kind: "text", label: { tr: "Kapanış Mesajı (opsiyonel)", en: "Closing Message (optional)" }, maxLength: 60, optional: true },
    ],
    exampleValues: {
      title: "Sıfırdan 100K Takipçiye Ulaşan 5 Altın Kural",
      items: "İlk 2 saniyede merak uyandıran bir kanca kullan.\nTek bir gönderide tek bir problemi derinlemesine çöz.\nHer slaytta görsel hiyerarşiyi sade tut.\nYorumlara ilk 45 dakika içinde bizzat yanıt ver.\nAçıklamada net ve tek bir harekete geçirici mesaj (CTA) ver.",
      ctaLabel: "Kaydet ve ekibinle paylaş ↗",
    },
  },
  {
    key: "notification",
    category: "announcement",
    label: { tr: "Bildirim Kartı", en: "Notification Card" },
    variants: [
      { key: "bubble", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "light", label: { tr: "Clean Light", en: "Clean Light" }, colorPreview: "#F5F7FB" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFE600" },
    ],
    fields: [
      { key: "headline", kind: "text", label: { tr: "Başlık", en: "Headline" }, maxLength: 80, placeholder: { tr: "Tebrikler! 🎉", en: "Congrats! 🎉" } },
      { key: "subtext", kind: "textarea", label: { tr: "Alt Metin", en: "Subtext" }, maxLength: 160 },
    ],
    exampleValues: {
      headline: "Hedefe Ulaşıldı! 🚀",
      subtext: "Bu ayki organik web trafiğin geçen aya kıyasla %184 artış gösterdi.",
    },
  },
  {
    key: "socialpost",
    category: "content",
    label: { tr: "Sosyal Post Simülasyonu", en: "Social Post Simulation" },
    variants: [
      { key: "feed", label: { tr: "Clean Light", en: "Clean Light" }, colorPreview: "#FFFFFF" },
      { key: "dark", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFFDF9" },
    ],
    fields: [
      { key: "text", kind: "textarea", label: { tr: "Gönderi Metni", en: "Post Text" }, maxLength: 280 },
    ],
    exampleValues: {
      text: "Pazarlamada en büyük hata: herkese hitap etmeye çalışmak. Nişini daralttığın gün organik büyümen hızlanır.",
    },
  },
  {
    key: "trend",
    category: "growth",
    label: { tr: "Trend / Grafik Kartı", en: "Trend / Chart Card" },
    variants: [
      { key: "chart", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF9F6" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFFDEB" },
    ],
    fields: [
      { key: "statNumber", kind: "text", label: { tr: "Büyük Sayı", en: "Big Number" }, maxLength: 20, placeholder: { tr: "%40", en: "40%" } },
      { key: "statLabel", kind: "text", label: { tr: "Etiket", en: "Label" }, maxLength: 80 },
      {
        key: "trendPoints",
        kind: "numbers",
        label: { tr: "Trend Verisi (virgülle ayırın)", en: "Trend Data (comma-separated)" },
        placeholder: { tr: "12, 18, 15, 24, 30, 28, 40", en: "12, 18, 15, 24, 30, 28, 40" },
      },
    ],
    exampleValues: {
      statNumber: "+340%",
      statLabel: "Organik Ziyaretçi Artışı (Son Çeyrek)",
      trendPoints: "15, 22, 28, 45, 60, 85, 110",
    },
  },
  {
    key: "problemsolution",
    category: "growth",
    label: { tr: "Problem & Çözüm", en: "Problem & Solution" },
    variants: [
      { key: "stacked", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF8F5" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFFDF5" },
    ],
    fields: [
      { key: "problem", kind: "textarea", label: { tr: "Sorun", en: "Problem" }, maxLength: 160 },
      { key: "solution", kind: "textarea", label: { tr: "Çözüm", en: "Solution" }, maxLength: 160 },
    ],
    exampleValues: {
      problem: "Düzenli içerik üretememek ve her gün 'bugün ne paylaşsam' stresine girmek.",
      solution: "Tentamark AI ile tüm ayın içeriğini 15 dakikada planlayıp otomatik yayına almak.",
    },
  },
  {
    key: "product",
    category: "growth",
    label: { tr: "Ürün Kartı", en: "Product Card" },
    variants: [
      { key: "hero", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Boutique", en: "Light Boutique" }, colorPreview: "#FAF9F6" },
      { key: "brutalist", label: { tr: "Bold Poster", en: "Bold Poster" }, colorPreview: "#FFFDF5" },
    ],
    fields: [
      { key: "imageUrl", kind: "image", label: { tr: "Ürün Görseli", en: "Product Image" } },
      { key: "title", kind: "text", label: { tr: "Başlık", en: "Title" }, maxLength: 80 },
      { key: "description", kind: "textarea", label: { tr: "Açıklama", en: "Description" }, maxLength: 160 },
    ],
    exampleValues: {
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      title: "Minimalist Akıllı Saat Series X",
      description: "Titanyum kasa, 7 günlük pil ömrü ve yapay zeka destekli sağlık koçu bileğinde.",
    },
  },
  {
    key: "stat",
    category: "growth",
    label: { tr: "İstatistik Kartı", en: "Stat Card" },
    variants: [
      { key: "aurora", label: { tr: "Aurora Glass", en: "Aurora Glass" }, colorPreview: "linear-gradient(135deg, #6366F1, #EC4899, #10B981)" },
      { key: "editorial", label: { tr: "Editorial Luxury", en: "Editorial Luxury" }, colorPreview: "#FAF8F5" },
      { key: "clay", label: { tr: "Soft Clay", en: "Soft Clay" }, colorPreview: "#F5F3EC" },
      { key: "cyber", label: { tr: "Cyber Terminal", en: "Cyber Terminal" }, colorPreview: "#00FF9D" },
      { key: "hero", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#F4F2EC" },
    ],
    fields: [
      { key: "statNumber", kind: "text", label: { tr: "Büyük Sayı", en: "Big Number" }, maxLength: 20, placeholder: { tr: "500+", en: "500+" } },
      { key: "statLabel", kind: "text", label: { tr: "Etiket", en: "Label" }, maxLength: 80 },
      { key: "supportingText", kind: "text", label: { tr: "Destek Metni (opsiyonel)", en: "Supporting Text (optional)" }, maxLength: 120, optional: true },
    ],
    exampleValues: {
      statNumber: "10M+",
      statLabel: "Aylık Üretilen ~Otomatik İçerik~",
      supportingText: "Dünya çapında *2.400'den fazla marka* ve ajans tarafından _güvenle_ kullanılıyor.",
    },
  },
  {
    key: "testimonial",
    category: "growth",
    label: { tr: "Müşteri Yorumu", en: "Customer Testimonial" },
    variants: [
      { key: "spotlight", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF9F6" },
      { key: "pastel", label: { tr: "Soft Pastel", en: "Soft Pastel" }, colorPreview: "#FFF1F2" },
    ],
    fields: [
      { key: "testimonialText", kind: "textarea", label: { tr: "Yorum Metni", en: "Testimonial Text" }, maxLength: 220 },
      { key: "customerName", kind: "text", label: { tr: "Müşteri Adı", en: "Customer Name" }, maxLength: 40 },
      { key: "customerRole", kind: "text", label: { tr: "Ünvan / Rol (opsiyonel)", en: "Title / Role (optional)" }, maxLength: 60, optional: true },
      { key: "customerAvatarUrl", kind: "image", label: { tr: "Müşteri Fotoğrafı (opsiyonel)", en: "Customer Photo (optional)" }, optional: true },
      { key: "rating", kind: "rating", label: { tr: "Puan (opsiyonel)", en: "Rating (optional)" }, optional: true },
    ],
    exampleValues: {
      testimonialText: "Tentamark'a geçtikten sonra içerik üretim maliyetimiz %70 düştü, etkileşim oranımız ise iki katına çıktı!",
      customerName: "Selin Yılmaz",
      customerRole: "Growth Lead @ TechFlow",
      customerAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      rating: "5",
    },
  },
  {
    key: "changelog",
    category: "announcement",
    label: { tr: "Changelog / Sürüm Notu", en: "Changelog / Feature Release" },
    variants: [
      { key: "dark", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF9F6" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFFDF5" },
    ],
    fields: [
      { key: "badge", kind: "text", label: { tr: "Sürüm / Etiket", en: "Version / Tag" }, maxLength: 40, placeholder: { tr: "v2.4 Yayında 🚀", en: "v2.4 Released 🚀" } },
      { key: "title", kind: "text", label: { tr: "Özellik Başlığı", en: "Feature Title" }, maxLength: 80, placeholder: { tr: "Shopify Entegrasyonu", en: "Shopify Integration" } },
      { key: "description", kind: "textarea", label: { tr: "Açıklama", en: "Description" }, maxLength: 280 },
      { key: "codeSnippet", kind: "textarea", label: { tr: "Kod / Terminal (opsiyonel)", en: "Code / Terminal (optional)" }, maxLength: 300, optional: true, placeholder: { tr: "npm i @tentamark/shopify-sync", en: "npm i @tentamark/shopify-sync" } },
    ],
    exampleValues: {
      badge: "v2.5 Canlıda ⚡",
      title: "Otomatik Reels & Carousel Stüdyosu",
      description: "Artık tek tıkla 19 farklı viral kart formatında görsel ve hikaye üretebilirsiniz.",
      codeSnippet: "npm i @tentamark/studio-sdk\ntentamark.render('chat', { theme: 'whatsapp' })",
    },
  },
  {
    key: "checklist",
    category: "content",
    label: { tr: "Kontrol Listesi / Adımlar", en: "Checklist / Action Plan" },
    variants: [
      { key: "aurora", label: { tr: "Aurora Glass", en: "Aurora Glass" }, colorPreview: "linear-gradient(135deg, #6366F1, #EC4899, #10B981)" },
      { key: "cyber", label: { tr: "Cyber Terminal", en: "Cyber Terminal" }, colorPreview: "#00FF9D" },
      { key: "dark", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF9F6" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFFDF5" },
    ],
    fields: [
      { key: "title", kind: "text", label: { tr: "Rehber Başlığı", en: "Checklist Title" }, maxLength: 80 },
      {
        key: "items",
        kind: "lines",
        label: { tr: "Maddeler (her satıra bir tane)", en: "Items (one per line)" },
        placeholder: { tr: "İlk 2 saniyede kanca kullan\nAçıklamaya net bir CTA koy", en: "Hook in the first 2 seconds\nInclude a clear CTA" },
      },
      { key: "subtitle", kind: "text", label: { tr: "Alt Başlık (opsiyonel)", en: "Subtitle (optional)" }, maxLength: 40, optional: true, placeholder: { tr: "Lansman Öncesi Liste", en: "Pre-Launch Checklist" } },
    ],
    exampleValues: {
      title: "Viral Gönderi Öncesi ~Kontrol Listesi~",
      items: "İlk 3 kelimede güçlü bir *kanca (Hook)* var mı?\n_Smart Highlight_ ile anahtar kelimeler vurgulandı mı?\nMobilde rahat okunabilir font ve satır aralığı seçildi mi?\nKaydırma / yorum yapma çağrısı (~CTA~) eklendi mi?\nHikayelerde paylaşmak için 9:16 safe-zone korundu mu?",
      subtitle: "Lansman Rehberi",
    },
  },
  {
    key: "event",
    category: "announcement",
    label: { tr: "Webinar / Canlı Yayın", en: "Webinar / Live Event" },
    variants: [
      { key: "dark", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF9F6" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFFDF5" },
    ],
    fields: [
      { key: "eventTitle", kind: "text", label: { tr: "Etkinlik Başlığı", en: "Event Title" }, maxLength: 80 },
      { key: "dateText", kind: "text", label: { tr: "Tarih & Saat", en: "Date & Time" }, maxLength: 60, placeholder: { tr: "28 Eylül Perşembe • 20:00", en: "Thursday, Sep 28 • 8:00 PM" } },
      { key: "speaker1Name", kind: "text", label: { tr: "1. Konuşmacı Adı", en: "Speaker 1 Name" }, maxLength: 40 },
      { key: "speaker1Role", kind: "text", label: { tr: "1. Konuşmacı Ünvanı", en: "Speaker 1 Role" }, maxLength: 60 },
      { key: "speaker1AvatarUrl", kind: "image", label: { tr: "1. Konuşmacı Fotoğrafı (opsiyonel)", en: "Speaker 1 Photo (optional)" }, optional: true },
      { key: "speaker2Name", kind: "text", label: { tr: "2. Konuşmacı Adı (opsiyonel)", en: "Speaker 2 Name (optional)" }, maxLength: 40, optional: true },
      { key: "speaker2Role", kind: "text", label: { tr: "2. Konuşmacı Ünvanı (opsiyonel)", en: "Speaker 2 Role (optional)" }, maxLength: 60, optional: true },
      { key: "speaker2AvatarUrl", kind: "image", label: { tr: "2. Konuşmacı Fotoğrafı (opsiyonel)", en: "Speaker 2 Photo (optional)" }, optional: true },
      { key: "badgeText", kind: "text", label: { tr: "Etiket (opsiyonel)", en: "Badge (optional)" }, maxLength: 30, optional: true, placeholder: { tr: "CANLI YAYIN 🔴", en: "LIVE STREAM 🔴" } },
    ],
    exampleValues: {
      eventTitle: "Yapay Zeka ile 10X Organik Büyüme Masterclass",
      dateText: "28 Eylül Perşembe • 20:30 (Canlı)",
      speaker1Name: "Oğuzhan Kaya",
      speaker1Role: "Kurucu, Tentamark",
      speaker1AvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      speaker2Name: "Mert Demir",
      speaker2Role: "Head of Marketing",
      speaker2AvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      badgeText: "ÜCRETSİZ WEBINAR 🔴",
    },
  },
  {
    key: "thisorthat",
    category: "engagement",
    label: { tr: "Hangisi? / Etkileşim", en: "This or That / Poll" },
    variants: [
      { key: "dark", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF9F6" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFFDF5" },
    ],
    fields: [
      { key: "question", kind: "text", label: { tr: "Soru", en: "Question" }, maxLength: 90, placeholder: { tr: "Pazarlamada Hangisi Daha Önemli?", en: "Which Matters More in Marketing?" } },
      { key: "optionA", kind: "text", label: { tr: "A Seçeneği", en: "Option A" }, maxLength: 100, placeholder: { tr: "Tutarlı Organik İçerik", en: "Consistent Organic Content" } },
      { key: "optionB", kind: "text", label: { tr: "B Seçeneği", en: "Option B" }, maxLength: 100, placeholder: { tr: "Yüksek Reklam Bütçesi", en: "Aggressive Ad Budget" } },
      { key: "ctaText", kind: "text", label: { tr: "Çağrı Metni (opsiyonel)", en: "Call to Action (optional)" }, maxLength: 60, optional: true, placeholder: { tr: "Yorumlarda Fikrini Belirt 👇", en: "Drop Your Thoughts Below 👇" } },
    ],
    exampleValues: {
      question: "Büyümek için 2026'da hangisi daha kritik?",
      optionA: "Her gün 10+ kısa video (Reels/TikTok) üretmek",
      optionB: "Haftada 1 derin ve benzersiz vaka analizi paylaşmak",
      ctaText: "Sen hangi taraftasın? Yorumda tartışalım 👇",
    },
  },
  {
    key: "matrix",
    category: "engagement",
    label: { tr: "2x2 Matris / Çeyrek", en: "2x2 Matrix / Quadrant" },
    variants: [
      { key: "dark", label: { tr: "Dark Studio", en: "Dark Studio" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Light Editorial", en: "Light Editorial" }, colorPreview: "#FAF9F6" },
      { key: "brutalist", label: { tr: "Bold Brutalist", en: "Bold Brutalist" }, colorPreview: "#FFFDF5" },
    ],
    fields: [
      { key: "title", kind: "text", label: { tr: "Matris Başlığı", en: "Matrix Title" }, maxLength: 80, placeholder: { tr: "İçerik Üretim Araçları Haritası", en: "Content Tools Matrix" } },
      { key: "q1Label", kind: "text", label: { tr: "1. Kategori Başlığı", en: "Q1 Category" }, maxLength: 30, placeholder: { tr: "Fikir & Metin", en: "Ideation & Copy" } },
      { key: "q1Text", kind: "textarea", label: { tr: "1. Kategori İçeriği", en: "Q1 Content / Items" }, maxLength: 120, placeholder: { tr: "ChatGPT, Claude, Notion AI", en: "ChatGPT, Claude, Notion AI" } },
      { key: "q2Label", kind: "text", label: { tr: "2. Kategori Başlığı", en: "Q2 Category" }, maxLength: 30, placeholder: { tr: "Görsel & Tasarım", en: "Visual & Design" } },
      { key: "q2Text", kind: "textarea", label: { tr: "2. Kategori İçeriği", en: "Q2 Content / Items" }, maxLength: 120, placeholder: { tr: "Midjourney, Figma, Canva", en: "Midjourney, Figma, Canva" } },
      { key: "q3Label", kind: "text", label: { tr: "3. Kategori Başlığı", en: "Q3 Category" }, maxLength: 30, placeholder: { tr: "Video & Reels", en: "Video & Reels" } },
      { key: "q3Text", kind: "textarea", label: { tr: "3. Kategori İçeriği", en: "Q3 Content / Items" }, maxLength: 120, placeholder: { tr: "CapCut, Premiere, Runway", en: "CapCut, Premiere, Runway" } },
      { key: "q4Label", kind: "text", label: { tr: "4. Kategori Başlığı", en: "Q4 Category" }, maxLength: 30, placeholder: { tr: "Otonomi & Dağıtım", en: "Automation & Distribution" } },
      { key: "q4Text", kind: "textarea", label: { tr: "4. Kategori İçeriği", en: "Q4 Content / Items" }, maxLength: 120, placeholder: { tr: "Tentamark, Buffer, Typefully", en: "Tentamark, Buffer, Typefully" } },
    ],
    exampleValues: {
      title: "2026 İçerik Pazarlaması Ekosistemi",
      q1Label: "1. Fikir & Metin",
      q1Text: "ChatGPT, Claude 3.5, Notion AI",
      q2Label: "2. Görsel & Grafik",
      q2Text: "Tentamark Studio, Midjourney v6, Figma",
      q3Label: "3. Video & Animasyon",
      q3Text: "CapCut, Runway Gen-3, Remotion",
      q4Label: "4. Dağıtım & Otonomi",
      q4Text: "Tentamark Engine, Typefully, Buffer",
    },
  },
  {
    key: "chat",
    category: "growth",
    label: { tr: "Sohbet / DM Simülasyonu", en: "Chat / DM Simulation" },
    variants: [
      { key: "ios", label: { tr: "iMessage (iOS)", en: "iMessage (iOS)" }, colorPreview: "#007AFF" },
      { key: "whatsapp", label: { tr: "WhatsApp", en: "WhatsApp" }, colorPreview: "#25D366" },
      { key: "dark", label: { tr: "Dark DM", en: "Dark DM" }, colorPreview: "#0B0A0F" },
    ],
    fields: [
      { key: "senderName", kind: "text", label: { tr: "Müşteri Adı", en: "Customer Name" }, maxLength: 40, placeholder: { tr: "Ayşe Yılmaz", en: "Sarah Jenkins" } },
      { key: "incomingMessage", kind: "textarea", label: { tr: "Müşterinin Mesajı / Sorusu", en: "Customer Question / Query" }, maxLength: 200, placeholder: { tr: "Siparişim ne zaman kargoya verilir acaba?", en: "When will my order be shipped?" } },
      { key: "outgoingMessage", kind: "textarea", label: { tr: "Cevabınız / Çözüm", en: "Your Response / Solution" }, maxLength: 240, placeholder: { tr: "Tüm siparişlerimiz aynı gün kargoda ve 24 saatte kapınızda! 🚀", en: "All orders ship the same day and arrive in 24 hours! 🚀" } },
      { key: "timeText", kind: "text", label: { tr: "Zaman / Durum (opsiyonel)", en: "Time / Status (optional)" }, maxLength: 30, optional: true, placeholder: { tr: "14:32 • İletildi", en: "2:32 PM • Delivered" } },
    ],
    exampleValues: {
      senderName: "Ece Yılmaz",
      incomingMessage: "Selam! 1 ayda sosyal medyadan gelen siparişlerimizi nasıl 3 katına çıkardınız? Gerçekten inanılmaz!",
      outgoingMessage: "Tentamark'ın *otonom görsel stüdyosu* ile her gün akışta durduran içerikler ürettik 🎯",
      timeText: "14:32 • İletildi",
    },
  },
  {
    key: "notes",
    category: "content",
    label: { tr: "Kişisel Not (Notes/Notion)", en: "Personal Notes (Notes/Notion)" },
    variants: [
      { key: "applenotes", label: { tr: "Apple Notes", en: "Apple Notes" }, colorPreview: "#F7F5EB" },
      { key: "notion", label: { tr: "Notion Minimal", en: "Notion Minimal" }, colorPreview: "#FFFFFF" },
      { key: "darknotes", label: { tr: "Midnight Journal", en: "Midnight Journal" }, colorPreview: "#121316" },
    ],
    fields: [
      { key: "noteTitle", kind: "text", label: { tr: "Not Başlığı", en: "Note Title" }, maxLength: 80, placeholder: { tr: "2026 Büyüme Notları #14", en: "2026 Growth Notes #14" } },
      { key: "content", kind: "textarea", label: { tr: "Not İçeriği / Maddeler", en: "Note Content / Items" }, maxLength: 400, placeholder: { tr: "1. Müşterinin problemine odaklan...\n2. Tutarlılık zekadan daha değerlidir...", en: "1. Focus on customer pain...\n2. Consistency beats intensity..." } },
      { key: "dateLabel", kind: "text", label: { tr: "Tarih & Saat", en: "Date & Time" }, maxLength: 40, placeholder: { tr: "23 Eylül 2026, 10:45", en: "Sep 23, 2026, 10:45 AM" } },
      { key: "folderName", kind: "text", label: { tr: "Klasör Adı (opsiyonel)", en: "Folder Name (optional)" }, maxLength: 40, optional: true, placeholder: { tr: "📌 Strateji Notları", en: "📌 Strategy Notes" } },
    ],
    exampleValues: {
      noteTitle: "SaaS Şirketini 0'dan 100K MRR'a Getiren 4 İlke:",
      content: "1. Müşterinin problemine aşık ol, kendi ürününe değil.\n2. İlk 100 müşterinle bizzat birebir konuş.\n3. *Basit arayüz* her zaman karmaşık özelliklerden daha çok kazandırır.\n4. İçerik pazarlaması bileşik faiz gibi büyüyen en ucuz büyüme kanalıdır.",
      dateLabel: "23 Eylül 2026, 10:45",
      folderName: "📌 Gizli Notlar",
    },
  },
  {
    key: "coupon",
    category: "growth",
    label: { tr: "İndirim Kuponu / Bilet", en: "Discount Coupon / Ticket" },
    variants: [
      { key: "ticket", label: { tr: "Retro Bilet", en: "Retro Ticket" }, colorPreview: "#1E1B2E" },
      { key: "modern", label: { tr: "Gold Luxury", en: "Gold Luxury" }, colorPreview: "#0B0A0F" },
      { key: "brutalist", label: { tr: "Neon Brutalist", en: "Neon Brutalist" }, colorPreview: "#FFE600" },
    ],
    fields: [
      { key: "discountText", kind: "text", label: { tr: "İndirim Oranı", en: "Discount Text" }, maxLength: 30, placeholder: { tr: "%30 İNDİRİM", en: "30% OFF" } },
      { key: "couponCode", kind: "text", label: { tr: "Kupon Kodu", en: "Coupon Code" }, maxLength: 30, placeholder: { tr: "TENTA30", en: "TENTA30" } },
      { key: "headline", kind: "text", label: { tr: "Kampanya Başlığı", en: "Campaign Headline" }, maxLength: 80, placeholder: { tr: "Büyük Sezon Sonu Fırsatı Başladı", en: "Big End of Season Sale" } },
      { key: "expiryText", kind: "text", label: { tr: "Son Geçerlilik (opsiyonel)", en: "Expiry Date (optional)" }, maxLength: 40, optional: true, placeholder: { tr: "Son Gün: Pazar 23:59", en: "Ends Sunday 11:59 PM" } },
    ],
    exampleValues: {
      discountText: "%30 İNDİRİM",
      couponCode: "GROWTH30",
      headline: "Erken Erişim Lansman Kuponu",
      expiryText: "Son Gün: 30 Eylül 2026 • 23:59",
    },
  },
  {
    key: "featuretable",
    category: "growth",
    label: { tr: "Özellik Kıyaslama Tablosu", en: "Feature Comparison Table" },
    variants: [
      { key: "dark", label: { tr: "Glow Dark", en: "Glow Dark" }, colorPreview: "#0B0A0F" },
      { key: "editorial", label: { tr: "Ivory Journal", en: "Ivory Journal" }, colorPreview: "#FAF8F5" },
      { key: "brutalist", label: { tr: "Bold Grid", en: "Bold Grid" }, colorPreview: "#FFFDF5" },
    ],
    fields: [
      { key: "title", kind: "text", label: { tr: "Tablo Başlığı", en: "Table Title" }, maxLength: 80, placeholder: { tr: "Neden Tentamark?", en: "Why Tentamark?" } },
      { key: "feature1", kind: "text", label: { tr: "1. Kriter Adı", en: "1. Feature Name" }, maxLength: 40, placeholder: { tr: "Haftalık İçerik Üretimi", en: "Weekly Content Creation" } },
      { key: "competitor1", kind: "text", label: { tr: "1. Rakip / Eski Yöntem", en: "1. Competitor / Old Way" }, maxLength: 40, placeholder: { tr: "15 - 20 Saat (Manuel) ❌", en: "15-20 Hours (Manual) ❌" } },
      { key: "tentamark1", kind: "text", label: { tr: "1. Çözümünüz", en: "1. Your Solution" }, maxLength: 40, placeholder: { tr: "5 Dakika (Otonom) ✅", en: "5 Minutes (Autonomous) ✅" } },
      { key: "feature2", kind: "text", label: { tr: "2. Kriter Adı", en: "2. Feature Name" }, maxLength: 40, placeholder: { tr: "Görsel Tasarım & Safe Zone", en: "Visual Design & Safe Zone" } },
      { key: "competitor2", kind: "text", label: { tr: "2. Rakip / Eski Yöntem", en: "2. Competitor / Old Way" }, maxLength: 40, placeholder: { tr: "Bozuk Şablonlar ❌", en: "Broken Templates ❌" } },
      { key: "tentamark2", kind: "text", label: { tr: "2. Çözümünüz", en: "2. Your Solution" }, maxLength: 40, placeholder: { tr: "Pixel-Perfect Güvenli Alan ✅", en: "Pixel-Perfect Safe Area ✅" } },
      { key: "feature3", kind: "text", label: { tr: "3. Kriter Adı", en: "3. Feature Name" }, maxLength: 40, placeholder: { tr: "Marka DNA & Renk Uyumu", en: "Brand DNA & Colors" } },
      { key: "competitor3", kind: "text", label: { tr: "3. Rakip / Eski Yöntem", en: "3. Competitor / Old Way" }, maxLength: 40, placeholder: { tr: "Her Seferinde Sıfırdan ❌", en: "Start from scratch ❌" } },
      { key: "tentamark3", kind: "text", label: { tr: "3. Çözümünüz", en: "3. Your Solution" }, maxLength: 40, placeholder: { tr: "Otomatik Logo & Renk Kilidi ✅", en: "Auto Logo & Color Lock ✅" } },
      { key: "feature4", kind: "text", label: { tr: "4. Kriter (opsiyonel)", en: "4. Feature (optional)" }, maxLength: 40, optional: true, placeholder: { tr: "Aylık Maliyet", en: "Monthly Cost" } },
      { key: "competitor4", kind: "text", label: { tr: "4. Rakip (opsiyonel)", en: "4. Competitor (optional)" }, maxLength: 40, optional: true, placeholder: { tr: "Ajans: 30K+ TL ❌", en: "Agency: $3000+ ❌" } },
      { key: "tentamark4", kind: "text", label: { tr: "4. Çözümünüz (opsiyonel)", en: "4. Your Solution (optional)" }, maxLength: 40, optional: true, placeholder: { tr: "Tek Platform: 0 TL Ek Masraf ✅", en: "One Platform: $0 Extra ✅" } },
    ],
    exampleValues: {
      title: "Neden Tentamark?",
      feature1: "Haftalık İçerik Üretimi",
      competitor1: "15 - 20 Saat (Manuel) ❌",
      tentamark1: "5 Dakika (Otonom) ✅",
      feature2: "Görsel Tasarım & Safe Zone",
      competitor2: "Bozuk Şablonlar ❌",
      tentamark2: "Pixel-Perfect Güvenli Alan ✅",
      feature3: "Marka DNA & Renk Uyumu",
      competitor3: "Her Seferinde Sıfırdan ❌",
      tentamark3: "Otomatik Logo & Renk Kilidi ✅",
      feature4: "Aylık Maliyet",
      competitor4: "Ajans Faturası: 30K+ TL ❌",
      tentamark4: "Tek Platform: 0 TL Ek Masraf ✅",
    },
  },
  {
    key: "podcast",
    category: "content",
    label: { tr: "Podcast & YouTube Kapağı", en: "Podcast & YouTube Cover" },
    variants: [
      { key: "neonPurple", label: { tr: "Neon Purple", en: "Neon Purple" }, colorPreview: "#A855F7" },
      { key: "electricOrange", label: { tr: "Electric Orange", en: "Electric Orange" }, colorPreview: "#F97316" },
      { key: "emeraldGreen", label: { tr: "Emerald Green", en: "Emerald Green" }, colorPreview: "#10B981" },
      { key: "cyberBlue", label: { tr: "Cyber Blue", en: "Cyber Blue" }, colorPreview: "#06B6D4" },
    ],
    fields: [
      { key: "title", kind: "textarea", label: { tr: "Bölüm Başlığı", en: "Episode Title" }, maxLength: 80, placeholder: { tr: "Sosyal Medyadan Milyonluk Satışa Giden Yol", en: "From Social Media to $1M in Sales" } },
      { key: "subtitle", kind: "text", label: { tr: "Alt Başlık (opsiyonel)", en: "Subtitle (optional)" }, maxLength: 80, optional: true, placeholder: { tr: "Büyüme & Pazarlama Sohbetleri", en: "Growth & Marketing Talks" } },
      { key: "episodeTag", kind: "text", label: { tr: "Bölüm Etiketi", en: "Episode Tag" }, maxLength: 40, placeholder: { tr: "ÖZEL BÖLÜM #24", en: "SPECIAL EPISODE #24" } },
      { key: "hostName", kind: "text", label: { tr: "Sunucu Adı", en: "Host Name" }, maxLength: 40, placeholder: { tr: "Oğuzhan Kaya", en: "John Doe" } },
      { key: "hostImageUrl", kind: "image", label: { tr: "Sunucu Fotoğrafı", en: "Host Photo" } },
      { key: "guestName", kind: "text", label: { tr: "Konuk Adı (opsiyonel)", en: "Guest Name (optional)" }, maxLength: 40, optional: true, placeholder: { tr: "Mert Yılmaz", en: "Guest Name" } },
      { key: "guestImageUrl", kind: "image", label: { tr: "Konuk Fotoğrafı (opsiyonel)", en: "Guest Photo (optional)" }, optional: true },
    ],
    exampleValues: {
      title: "Sosyal Medyadan Milyonluk Satışa Giden Yol",
      subtitle: "Büyüme & Pazarlama Sohbetleri",
      episodeTag: "ÖZEL BÖLÜM #24",
      hostName: "Oğuzhan Kaya",
      hostImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
      guestName: "Mert Yılmaz",
      guestImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    },
  },
  {
    key: "photoreview",
    category: "growth",
    label: { tr: "Fotoğraf Üstü Müşteri Yorumu", en: "Photo-Review Overlay" },
    variants: [
      { key: "cleanFloat", label: { tr: "Clean Float", en: "Clean Float" }, colorPreview: "#FFFFFF" },
      { key: "glassFrost", label: { tr: "Aurora Glass", en: "Aurora Glass" }, colorPreview: "rgba(255,255,255,0.7)" },
      { key: "warmEditorial", label: { tr: "Warm Editorial", en: "Warm Editorial" }, colorPreview: "#FAF8F5" },
    ],
    fields: [
      {
        key: "bgImageUrl",
        kind: "image",
        label: { tr: "Arka Plan Fotoğrafı", en: "Background Photo" },
        fullBleed: true,
        // Bottom half: header-text sits near the top, but the floating
        // review card (avatar + quote + name + stars) dominates the whole
        // lower half of the canvas — that's the band worth checking.
        textSafeZone: { left: 0, top: 0.5, width: 1, height: 0.5 },
      },
      { key: "headerText", kind: "text", label: { tr: "Kart Üst Başlığı", en: "Card Header" }, maxLength: 60, placeholder: { tr: "MÜŞTERİ DENEYİMİ", en: "CUSTOMER EXPERIENCE" } },
      { key: "reviewText", kind: "textarea", label: { tr: "Müşteri Yorumu", en: "Review Text" }, maxLength: 350, placeholder: { tr: "Hizmet kalitesi ve hız gerçekten beklentilerimizin çok ötesindeydi. Kesinlikle herkese tavsiye ediyorum!", en: "The experience was truly incredible and beyond our expectations!" } },
      { key: "customerName", kind: "text", label: { tr: "Müşteri Adı", en: "Customer Name" }, maxLength: 50, placeholder: { tr: "Amanda S. • Seyahat Yazarı", en: "Amanda S. • Travel Writer" } },
      { key: "customerAvatarUrl", kind: "image", label: { tr: "Müşteri Profil Fotoğrafı (opsiyonel)", en: "Customer Avatar (optional)" }, optional: true },
      { key: "badgeText", kind: "text", label: { tr: "Doğrulama Rozeti (opsiyonel)", en: "Verification Badge (optional)" }, maxLength: 40, optional: true, placeholder: { tr: "Doğrulanmış Misafir ✅", en: "Verified Guest ✅" } },
    ],
    exampleValues: {
      bgImageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1080&q=80",
      headerText: "MÜŞTERİ DENEYİMİ",
      reviewText: "Hizmet kalitesi ve hız gerçekten beklentilerimizin çok ötesindeydi. Kesinlikle herkese tavsiye ediyorum!",
      customerName: "Amanda S. • Seyahat Yazarı",
      customerAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      badgeText: "Doğrulanmış Misafir ✅",
    },
  },
  {
    key: "deal",
    category: "growth",
    label: { tr: "Fiyat Rozetli Ürün Vitrini", en: "Product Deal & Price Tag" },
    variants: [
      { key: "lifestyleSplit", label: { tr: "Lifestyle Split", en: "Lifestyle Split" }, colorPreview: "#FF4500" },
      { key: "boldBanner", label: { tr: "Bold Banner", en: "Bold Banner" }, colorPreview: "#111827" },
    ],
    fields: [
      { key: "productImageUrl", kind: "image", label: { tr: "Ürün Fotoğrafı", en: "Product Photo" } },
      { key: "badgeText", kind: "text", label: { tr: "Kampanya Rozeti", en: "Campaign Badge" }, maxLength: 40, placeholder: { tr: "GÜNÜN FIRSATI 🔥", en: "HOT DEAL 🔥" } },
      { key: "title", kind: "text", label: { tr: "Ürün Başlığı", en: "Product Title" }, maxLength: 70, placeholder: { tr: "TimeFlex Pro Akıllı Saat", en: "TimeFlex Pro Smartwatch" } },
      { key: "priceText", kind: "text", label: { tr: "Fiyat Etiketi", en: "Price Tag" }, maxLength: 30, placeholder: { tr: "1.490 TL", en: "$699" } },
      { key: "features", kind: "lines", label: { tr: "Ürün Özellikleri (her satıra bir tane)", en: "Features (one per line)" }, placeholder: { tr: "Suya Dayanıklı Titanyum\nAI Sağlık ve Nabız Koçu\n7 Gün Kesintisiz Pil", en: "Titanium Waterproof Casing\nAI Health & Pulse Coach\n7-Day Battery Life" } },
      { key: "ctaText", kind: "text", label: { tr: "Aksiyon Butonu (opsiyonel)", en: "CTA Button (optional)" }, maxLength: 40, optional: true, placeholder: { tr: "Hemen İncele ↗", en: "Shop Now ↗" } },
    ],
    exampleValues: {
      productImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      badgeText: "GÜNÜN FIRSATI 🔥",
      title: "TimeFlex Pro Akıllı Saat",
      priceText: "1.490 TL",
      features: "Suya Dayanıklı Titanyum Kasa\nAI Sağlık ve Nabız Koçu\n7 Gün Kesintisiz Pil Ömrü",
      ctaText: "Hemen İncele ↗",
    },
  },
  {
    key: "newsflash",
    category: "announcement",
    label: { tr: "Son Dakika / Canlı Haber", en: "Breaking News & Live Update" },
    variants: [
      { key: "breakingRed", label: { tr: "Breaking Crimson", en: "Breaking Crimson" }, colorPreview: "#EF4444" },
    ],
    fields: [
      {
        key: "bgImageUrl",
        kind: "image",
        label: { tr: "Haber Fotoğrafı", en: "News Photo" },
        fullBleed: true,
        // Headline + reaction bubble + footer are all bottom-anchored
        // (justify-content: space-between with the badges up top) — the
        // bottom ~45% is where readability actually matters.
        textSafeZone: { left: 0, top: 0.55, width: 1, height: 0.45 },
      },
      { key: "badgeText", kind: "text", label: { tr: "Haber Rozeti", en: "News Badge" }, maxLength: 40, placeholder: { tr: "🔴 SON DAKİKA", en: "🔴 BREAKING NEWS" } },
      { key: "headline", kind: "textarea", label: { tr: "Haber Başlığı", en: "Headline" }, maxLength: 140, placeholder: { tr: "Yapay Zeka ile Sosyal Medya Yönetiminde Yeni Çağ Başladı", en: "New Era in Social Media Automation Begins" } },
      { key: "sourceText", kind: "text", label: { tr: "Kaynak / Zaman", en: "Source / Time" }, maxLength: 50, optional: true, placeholder: { tr: "kaynak: @tentamark • 5 dk önce", en: "source: @tentamark • 5m ago" } },
      { key: "bubbleText", kind: "text", label: { tr: "Viral Tepki Baloncuğu (opsiyonel)", en: "Reaction Bubble (optional)" }, maxLength: 60, optional: true, placeholder: { tr: "Gerçekten inanılmaz bir adım 🔥", en: "This changes everything 🔥" } },
      { key: "ctaText", kind: "text", label: { tr: "Etkileşim Sorusu / CTA (opsiyonel)", en: "Interaction CTA (optional)" }, maxLength: 60, optional: true, placeholder: { tr: "Sizce bu gelişme sektörü nasıl etkiler? 👇", en: "How will this impact your workflow? 👇" } },
    ],
    exampleValues: {
      bgImageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1080&q=80",
      badgeText: "🔴 SON DAKİKA",
      headline: "Yapay Zeka ile Sosyal Medya Yönetiminde Yeni Çağ Başladı",
      sourceText: "kaynak: @tentamark • 5 dk önce",
      bubbleText: "Gerçekten inanılmaz bir adım 🔥",
      ctaText: "Sizce bu gelişme sektörü nasıl etkiler? 👇",
    },
  },
];

export function getCardTemplate(key: string): TemplateConfig | undefined {
  return CARD_TEMPLATES.find((t) => t.key === key);
}
