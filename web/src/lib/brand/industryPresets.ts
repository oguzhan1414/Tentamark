export interface IndustryPreset {
  industry: string;
  tone_of_voice: string;
  brand_traits: string[];
  color_palette: string[];
  target_audience: string[];
  competitors: string[];
  trait_scores: {
    samimi: number;
    profesyonel: number;
    teknolojik: number;
    enerjik: number;
    destekleyici: number;
    luks: number;
  };
  tone_position: { x: number; y: number };
  audience_persona: {
    label: string;
    age: string;
    location: string;
    language: string;
    career: string;
    goal: string;
    painPoint: string;
  };
  audience_pain_points: string[];
  audience_motivations: string[];
  market_comparison: {
    dimensions: string[];
    brandScores: Record<string, number>;
    competitiveGap: string;
    opportunity: string;
  };
  raw_notes: string;
}

export const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  saas: {
    industry: "SaaS & Yazılım Teknolojileri",
    tone_of_voice: "İnovatif, çözüm odaklı, dinamik ve net",
    brand_traits: ["Kullanıcı Dostu", "Yüksek Verimlilik", "Güvenli Altyapı", "Sürekli Gelişen"],
    color_palette: ["#6366F1", "#0EA5E9", "#1E293B", "#F8FAFC"],
    target_audience: ["Kurucu & Girişimciler", "Ürün Yöneticileri", "B2B Pazarlama Ekipleri", "Operasyon Liderleri"],
    competitors: ["Notion", "Linear", "HubSpot", "Zapier"],
    trait_scores: { samimi: 70, profesyonel: 85, teknolojik: 95, enerjik: 80, destekleyici: 85, luks: 60 },
    tone_position: { x: 30, y: 40 },
    audience_persona: {
      label: "Verimlilik Odaklı Teknoloji Lideri",
      age: "26-45",
      location: "Büyükşehirler & Global",
      language: "Türkçe / İngilizce",
      career: "Teknoloji Girişimcisi & Departman Müdürü",
      goal: "Manuel işleri otomatikleştirip ekip verimliliğini 3 katına çıkarmak",
      painPoint: "Karmaşık yazılımlar, yüksek entegrasyon maliyetleri ve vakit kaybı",
    },
    audience_pain_points: [
      "Manuel süreçlerden kaynaklanan zaman kaybı",
      "Kullanımı zor ve karmaşık arayüzler",
      "Entegrasyon eksiklikleri ve veri dağınıklığı",
    ],
    audience_motivations: [
      "Hızlı kurulum ve anında ölçülebilir ROI",
      "Kusursuz kullanıcı deneyimi ve otomasyon",
      "7/24 güvenilir destek ve kesintisiz altyapı",
    ],
    market_comparison: {
      dimensions: ["Hız & Kurulum", "Fiyat / Değer", "Kullanım Kolaylığı", "Yapay Zeka Yeteneği", "Destek Kalitesi"],
      brandScores: { "Hız & Kurulum": 90, "Fiyat / Değer": 85, "Kullanım Kolaylığı": 95, "Yapay Zeka Yeteneği": 90, "Destek Kalitesi": 85 },
      competitiveGap: "Pazardaki mevcut araçlar çok karmaşık ve yerel pazar ihtiyaçlarına yeterince esnek yanıt veremiyor.",
      opportunity: "Yalın arayüz, yerel pazar desteği ve entegre AI asistanı ile pazarda hızla ayrışma fırsatı.",
    },
    raw_notes: "SaaS odaklı modern B2B içerik stratejisi ve ürün odaklı büyüme (PLG) yaklaşımı.",
  },

  ecommerce: {
    industry: "E-Ticaret & Perakende",
    tone_of_voice: "Enerjik, samimi, harekete geçirici ve güven veren",
    brand_traits: ["Hızlı Teslimat", "Müşteri Memnuniyeti", "Özgün Seçki", "Şeffaf Fiyatlandırma"],
    color_palette: ["#EA580C", "#F97316", "#0F172A", "#FFFFFF"],
    target_audience: ["Online Alışveriş Tutkunları", "Fırsat & İndirim Takipçileri", "Kalite Arayan Tüketiciler"],
    competitors: ["Trendyol", "Hepsiburada", "Amazon TR"],
    trait_scores: { samimi: 85, profesyonel: 75, teknolojik: 70, enerjik: 90, destekleyici: 80, luks: 55 },
    tone_position: { x: 40, y: 50 },
    audience_persona: {
      label: "Bilinçli Online Tüketici",
      age: "22-42",
      location: "Türkiye Geneli",
      language: "Türkçe",
      career: "Özel Sektör Çalışanı / Profesyonel",
      goal: "Güvenilir ürünleri en uygun fiyata, zahmetsizce ve hızla teslim almak",
      painPoint: "Kargo gecikmeleri, yanıltıcı ürün görselleri ve zor iade süreçleri",
    },
    audience_pain_points: [
      "Güvenilirlik ve sahte ürün endişesi",
      "Geciken kargolar ve iletişim eksikliği",
      "Zor ve masraflı iade süreçleri",
    ],
    audience_motivations: [
      "Koşulsuz kolay iade ve hızlı teslimat garantisi",
      "Gerçek kullanıcı yorumları ve şeffaf değerlendirmeler",
      "Kişiselleştirilmiş indirimler ve sadakat avantajları",
    ],
    market_comparison: {
      dimensions: ["Teslimat Hızı", "Müşteri Deneyimi", "Fiyat Avantajı", "Sosyal Medya Etkileşimi", "Ürün Çeşitliliği"],
      brandScores: { "Teslimat Hızı": 85, "Müşteri Deneyimi": 90, "Fiyat Avantajı": 80, "Sosyal Medya Etkileşimi": 95, "Ürün Çeşitliliği": 75 },
      competitiveGap: "Büyük pazaryerleri soğuk ve kitleyle duygusal bağ kurmaktan uzak.",
      opportunity: "Topluluk odaklı, samimi sosyal medya hikayeleri ve hızlı kargo ile yüksek müşteri sadakati kazanmak.",
    },
    raw_notes: "D2C (Direct-to-Consumer) odaklı samimi marka hikayesi ve görsel ağırlıklı sosyal ticaret.",
  },

  agency: {
    industry: "Ajans & Danışmanlık",
    tone_of_voice: "Stratejik, prestijli, yaratıcı ve vizyoner",
    brand_traits: ["Veri Odaklı", "Yaratıcı Çözümler", "Sektörel Uzmanlık", "Proaktif İletişim"],
    color_palette: ["#18181B", "#3B82F6", "#64748B", "#F4F4F5"],
    target_audience: ["Pazarlama Direktörleri (CMO)", "KOBİ Sahipleri", "Kurumsal İletişim Ekipleri"],
    competitors: ["Ogilvy", "Havas", "Lokal Dijital Ajanslar"],
    trait_scores: { samimi: 65, profesyonel: 95, teknolojik: 85, enerjik: 75, destekleyici: 80, luks: 85 },
    tone_position: { x: -20, y: 20 },
    audience_persona: {
      label: "Büyüme Hedefleyen Marka Yöneticisi",
      age: "30-50",
      location: "Metropoller",
      language: "Türkçe / İngilizce",
      career: "Pazarlama Müdürü / Şirket Ortağı",
      goal: "Pazarlama bütçesini verimli kullanarak somut satış ve bilinirlik artışı sağlamak",
      painPoint: "Raporlanamayan bütçeler, iletişim kopukluğu ve klişe stratejiler",
    },
    audience_pain_points: [
      "Şeffaf olmayan ajans raporları ve belirsiz yatırım getirisi (ROI)",
      "Proje teslim tarihlerinin aksaması",
      "Markanın ruhunu anlamayan yüzeysel içerikler",
    ],
    audience_motivations: [
      "NetKPI'lar ve düzenli performans raporlaması",
      "Proaktif fikir üreten, iş ortağı gibi çalışan uzman bir ekip",
      "Yüksek tasarım ve içerik kalitesi",
    ],
    market_comparison: {
      dimensions: ["Stratejik Derinlik", "Tasarım Kalitesi", "Şeffaf Raporlama", "Teslim Hızı", "Fiyat Dengesi"],
      brandScores: { "Stratejik Derinlik": 90, "Tasarım Kalitesi": 95, "Şeffaf Raporlama": 90, "Teslim Hızı": 85, "Fiyat Dengesi": 80 },
      competitiveGap: "Geleneksel ajanslar yavaş, küçük ekipler ise stratejik vizyondan yoksun.",
      opportunity: "Yapay zeka hızını insan kreatifliğiyle birleştirip yüksek marjlı butik danışmanlık sunmak.",
    },
    raw_notes: "B2B düşünce liderliği (thought leadership), vaka analizleri ve uzmanlık içerikleri.",
  },

  creator: {
    industry: "İçerik Üretici & Medya",
    tone_of_voice: "Samimi, ilham verici, eğlenceli ve etkileşim odaklı",
    brand_traits: ["Özgün İçerik", "Samimi İletişim", "Trend Öncüsü", "Topluluk Dostu"],
    color_palette: ["#EC4899", "#8B5CF6", "#1E1B4B", "#FDF2F8"],
    target_audience: ["Genç Profesyoneller", "Teknoloji & Tasarım Takipçileri", "Dijital Topluluk Üyeleri"],
    competitors: ["Bağımsız YouTuberlar", "LinkedIn İçerik Üreticileri", "Substack Yazarları"],
    trait_scores: { samimi: 95, profesyonel: 60, teknolojik: 80, enerjik: 95, destekleyici: 85, luks: 40 },
    tone_position: { x: 60, y: 50 },
    audience_persona: {
      label: "Meraklı Dijital Takipçi",
      age: "18-35",
      location: "Dijital Ortamlar & Sosyal Medya",
      language: "Türkçe",
      career: "Öğrenci / Genç Profesyonel",
      goal: "Sektörel yenilikleri eğlenceli ve kolay tüketilebilir şekilde öğrenmek",
      painPoint: "Sıkıcı kurumsal dil, vakit alan uzun videolar ve yüzeysel bilgiler",
    },
    audience_pain_points: [
      "Bilgi kirliliği ve zaman kaybı",
      "Samimiyetsiz sponsorlu içerikler",
    ],
    audience_motivations: [
      "Gerçek deneyimler ve dürüst tavsiyeler",
      "Toplulukla doğrudan diyalog kurabilme",
    ],
    market_comparison: {
      dimensions: ["Etkileşim Oranı", "Özgünlük", "Yayın Düzeni", "Görsel Kalite", "Topluluk Bağı"],
      brandScores: { "Etkileşim Oranı": 95, "Özgünlük": 90, "Yayın Düzeni": 85, "Görsel Kalite": 85, "Topluluk Bağı": 95 },
      competitiveGap: "İçerik üreticileri düzenli yayın takvimini korumakta zorlanıyor.",
      opportunity: "Sürdürülebilir çok kanallı yayın temposu ve güçlü topluluk etkileşimi.",
    },
    raw_notes: "Kişisel marka odaklı, perde arkası (behind-the-scenes) hikaye anlatımı.",
  },

  local_business: {
    industry: "Kafe, Restoran & Yerel Hizmet",
    tone_of_voice: "Sıcak, davetkar, lezzet ve deneyim odaklı",
    brand_traits: ["Taze & Kaliteli", "Misafirperver", "Mahalle Ruhlu", "Temiz & Güvenilir"],
    color_palette: ["#B45309", "#78350F", "#FFFBEB", "#1C1917"],
    target_audience: ["Yerel Sakinler", "Gurmeler & Lezzet Arayanlar", "Hafta Sonu Ziyaretçileri"],
    competitors: ["Bölgesel Kafeler & Restoranlar", "Popüler Kahve Zincirleri"],
    trait_scores: { samimi: 95, profesyonel: 65, teknolojik: 40, enerjik: 85, destekleyici: 90, luks: 60 },
    tone_position: { x: 50, y: 40 },
    audience_persona: {
      label: "Keyif ve Lezzet Arayan Yerel Müşteri",
      age: "20-55",
      location: "İşletmenin Bulunduğu Şehir / Bölge",
      language: "Türkçe",
      career: "Yerel Halk & Çevre Çalışanları",
      goal: "Keyifli vakit geçirmek, lezzetli yemekler tatmak ve samimi ortamda dinlenmek",
      painPoint: "Kötü servis, tutarsız lezzet ve ilgisiz personel",
    },
    audience_pain_points: ["Tutarsız kalite ve hijyen endişesi", "Park yeri veya rezervasyon zorlukları"],
    audience_motivations: ["Güler yüzlü karşılama ve lezzet garantisi", "Özel ikramlar ve sıcak atmosfer"],
    market_comparison: {
      dimensions: ["Lezzet & Kalite", "Ortam & Atmosfer", "Fiyat Dengesi", "Sosyal Medya Görünürlüğü", "Hizmet Hızı"],
      brandScores: { "Lezzet & Kalite": 90, "Ortam & Atmosfer": 95, "Fiyat Dengesi": 85, "Sosyal Medya Görünürlüğü": 80, "Hizmet Hızı": 85 },
      competitiveGap: "Yerel mekanlar sosyal medyada düzenli ve kaliteli görsel paylaşım yapamıyor.",
      opportunity: "İştah açıcı Reels/TikTok videoları ve yerel etkinlik duyuruları ile bölgenin 1 numaralı mekanı olmak.",
    },
    raw_notes: "Yerel SEO, Google Haritalar entegrasyonu ve estetik mekan paylaşımları.",
  },

  marketplace: {
    industry: "Pazar Yeri & Platform",
    tone_of_voice: "Güvenilir, geniş kitleye hitap eden, organize ve pratik",
    brand_traits: ["Geniş Seçenek", "Güvenli Ödeme", "Kolay Arama", "İki Taraflı Değer"],
    color_palette: ["#2563EB", "#1D4ED8", "#0F172A", "#F8FAFC"],
    target_audience: ["Alıcılar & Tüketiciler", "Satıcılar & Hizmet Sağlayıcılar"],
    competitors: ["Sahibinden", "Armut", "Dolap"],
    trait_scores: { samimi: 70, profesyonel: 85, teknolojik: 90, enerjik: 75, destekleyici: 80, luks: 50 },
    tone_position: { x: 20, y: 20 },
    audience_persona: {
      label: "Aradığı Hizmeti Kolayca Bulmak İsteyen Kullanıcı",
      age: "22-50",
      location: "Türkiye Geneli",
      language: "Türkçe",
      career: "Çeşitli Meslek Grupları",
      goal: "İhtiyacı olan ürün veya hizmete en güvenli ve hızlı şekilde ulaşmak",
      painPoint: "Güvensiz satıcılar ve karmaşık komisyon yapıları",
    },
    audience_pain_points: ["Dolandırıcılık veya güvensizlik korkusu", "Platformda kaybolma hissi"],
    audience_motivations: ["Şeffaf kullanıcı puanlaması", "Güvenli havuz ödeme sistemi"],
    market_comparison: {
      dimensions: ["Güvenlik", "Çeşitlilik", "Arayüz Pratikliği", "Hızlı Eşleşme", "Destek"],
      brandScores: { "Güvenlik": 95, "Çeşitlilik": 85, "Arayüz Pratikliği": 90, "Hızlı Eşleşme": 85, "Destek": 85 },
      competitiveGap: "Büyük pazar yerlerinde kullanıcı desteği çok yavaş ve soğuk.",
      opportunity: "Kullanıcı deneyimi yüksek, güvenli ve niş pazar yeri konumlandırması.",
    },
    raw_notes: "Alıcı ve satıcıyı buluşturan güven odaklı içerik stratejisi.",
  },

  marketing: {
    industry: "Pazarlama & Reklamcılık",
    tone_of_voice: "Dinamik, veri odaklı, ikna edici ve modern",
    brand_traits: ["Yüksek Dönüşüm", "Trend Takibi", "Veri Analitiği", "Kreatif Çözümler"],
    color_palette: ["#7C3AED", "#6D28D9", "#0F172A", "#FFFFFF"],
    target_audience: ["Pazarlama Uzmanları", "E-Ticaret Yöneticileri", "Büyüme Odaklı Şirketler"],
    competitors: ["WPP", "Publicis", "Performans Ajansları"],
    trait_scores: { samimi: 75, profesyonel: 90, teknolojik: 90, enerjik: 85, destekleyici: 80, luks: 70 },
    tone_position: { x: 10, y: 30 },
    audience_persona: {
      label: "Büyüme ve Satış Odaklı Marka Yöneticisi",
      age: "25-45",
      location: "Metropoller",
      language: "Türkçe / İngilizce",
      career: "Pazarlama Uzmanı / Growth Hacker",
      goal: "Reklam maliyetlerini düşürüp müşteri kazanımını artırmak",
      painPoint: "Sürekli artan reklam maliyetleri ve düşük dönüşüm oranları",
    },
    audience_pain_points: ["Yüksek reklam bütçelerine rağmen düşük dönüşüm", "Hedef kitle doymuşluğu"],
    audience_motivations: ["Veriye dayalı A/B testleri", "Yüksek etkileşimli kreatifler"],
    market_comparison: {
      dimensions: ["Performans", "Kreatif Kalite", "Hız", "Veri Analizi", "Maliyet Avantajı"],
      brandScores: { "Performans": 90, "Kreatif Kalite": 90, "Hız": 95, "Veri Analizi": 90, "Maliyet Avantajı": 85 },
      competitiveGap: "Birçok reklam ajansı sadece yayın yapıyor, dönüşüm optimizasyonunu es geçiyor.",
      opportunity: "Veri ve kreatifliği harmanlayan sonuç odaklı pazarlama yaklaşımı.",
    },
    raw_notes: "Büyüme odaklı, performans ve ROI garantili pazarlama iletişimi.",
  },

  education: {
    industry: "Eğitim & Akademi",
    tone_of_voice: "Öğretici, ilham verici, güvenilir ve cesaretlendirici",
    brand_traits: ["Yetkin Eğitmenler", "Pratik Bilgi", "Sertifikalı Programlar", "Kariyer Desteği"],
    color_palette: ["#0284C7", "#0369A1", "#0F172A", "#F0F9FF"],
    target_audience: ["Öğrenciler", "Kariyer Değiştirmek İsteyenler", "Sürekli Gelişim Arayanlar"],
    competitors: ["Udemy", "Coursera", "BTK Akademi"],
    trait_scores: { samimi: 80, profesyonel: 90, teknolojik: 75, enerjik: 70, destekleyici: 95, luks: 50 },
    tone_position: { x: 10, y: 10 },
    audience_persona: {
      label: "Gelişime Açık Geleceğin Lideri",
      age: "20-40",
      location: "Türkiye & Global",
      language: "Türkçe",
      career: "Üniversite Öğrencisi / Kariyer Arayan",
      goal: "İş dünyasında geçerli pratik yetkinlikler kazanıp gelirini artırmak",
      painPoint: "Teorik ve güncelliğini yitirmiş sıkıcı eğitim içerikleri",
    },
    audience_pain_points: ["Zaman ve para kaybına neden olan kalitesiz kurslar", "Pratik yapamama"],
    audience_motivations: ["Gerçek hayat projeleri ile portföy oluşturma", "Topluluk ve mentorluk desteği"],
    market_comparison: {
      dimensions: ["Müfredat Güncelliği", "Eğitmen Kalitesi", "Kariyer Etkisi", "Etkileşim", "Fiyat/Performans"],
      brandScores: { "Müfredat Güncelliği": 95, "Eğitmen Kalitesi": 90, "Kariyer Etkisi": 90, "Etkileşim": 85, "Fiyat/Performans": 90 },
      competitiveGap: "Kitlesel platformlar kişisel mentorluk ve geri bildirim sağlamıyor.",
      opportunity: "Uygulamalı, mentor destekli ve doğrudan işe alım odaklı modern eğitim modeli.",
    },
    raw_notes: "Öğrenci başarı hikayeleri, ipuçları ve sektörel yetkinlik paylaşımları.",
  },

  other: {
    industry: "Genel İşletme & Hizmet",
    tone_of_voice: "Profesyonel, net, güvenilir ve çözüm odaklı",
    brand_traits: ["Güvenilirlik", "Kaliteli Hizmet", "Müşteri Memnuniyeti", "Şeffaflık"],
    color_palette: ["#0F172A", "#EA580C", "#38BDF8", "#F8FAFC"],
    target_audience: ["Genel Müşteri Kitlesi", "Hizmet Arayanlar", "İşletmeler"],
    competitors: ["Sektör Liderleri", "Yerel Hizmet Sağlayıcılar"],
    trait_scores: { samimi: 75, profesyonel: 85, teknolojik: 70, enerjik: 75, destekleyici: 80, luks: 60 },
    tone_position: { x: 10, y: 20 },
    audience_persona: {
      label: "Kaliteli Hizmet Arayan Müşteri",
      age: "25-50",
      location: "Türkiye Geneli",
      language: "Türkçe",
      career: "Çalışan & Girişimci",
      goal: "İhtiyacını en güvenilir ve hızlı şekilde karşılamak",
      painPoint: "Hizmet sonrası ilgisizlik ve iletişim eksikliği",
    },
    audience_pain_points: ["Belirsiz fiyatlandırma", "İletişim zorlukları"],
    audience_motivations: ["Şeffaf süreçler ve güvenilir iş ortaklığı"],
    market_comparison: {
      dimensions: ["Güven", "Hizmet Kalitesi", "İletişim", "Hız", "Fiyat"],
      brandScores: { "Güven": 90, "Hizmet Kalitesi": 85, "İletişim": 90, "Hız": 85, "Fiyat": 80 },
      competitiveGap: "Sektörde güven ve düzenli iletişim sağlayan marka sayısı az.",
      opportunity: "Yüksek şeffaflık ve proaktif iletişim ile müşteri güvenini kazanmak.",
    },
    raw_notes: "Müşteri odaklı şeffaf iletişim ve kurumsal itibar yönetimi.",
  },
};

export function getIndustryPreset(industryKey: string): IndustryPreset {
  const cleanKey = (industryKey || "").toLowerCase();
  return INDUSTRY_PRESETS[cleanKey] || INDUSTRY_PRESETS.other;
}
