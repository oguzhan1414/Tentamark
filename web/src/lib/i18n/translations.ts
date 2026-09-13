export type Locale = "tr" | "en";

export const translations = {
  tr: {
    header: {
      nav: {
        howItWorks: "Nasıl çalışır",
        features: "Özellikler",
        platforms: "Platformlar",
        pricing: "Fiyatlandırma",
        faq: "SSS",
      },
      login: "Giriş yap",
      joinEarlyAccess: "Erken erişime katıl",
    },
    hero: {
      eyebrow: "AI Marketing Manager",
      headlineBefore: "Markanızın sosyal medyasını yöneten bir ekip. ",
      headlineHighlight: "Tek kişi bile olsanız.",
      copy: "Tentamark markanızı öğrenir, haftalık içerik planını hazırlar ve her platforma ayrı yazar. Siz onaylarsınız, o yayınlar ve sonuçlardan öğrenir.",
      emailPlaceholder: "ornek@marka.com",
      emailLabel: "E-posta adresiniz",
      ctaButton: "Erken erişime katıl",
      watchDemo: "Demo izle",
      trustText: "Instagram, Facebook ve LinkedIn ile çalışır",
      statValue: "Etkileşim +%18",
      statPeriod: "son 30 gün",
      portraitAlt: "Kendi markasının sosyal medyasını Tentamark ile yöneten bir işletme sahibi",
    },
    adShowcase: {
      badge: "Yakında · Vizyonumuz",
      titleBefore: "Markanız adına ",
      titleHighlight: "içeriği de biz üretelim.",
      copy: "Bugün metni ve görseli Brand DNA'nızdan üretiyoruz. Sırada video var — sadece planlamıyoruz, üretip önünüze koyuyoruz. Siz sadece onaylıyorsunuz.",
      fallbackText: "Video yakında",
      ctaButton: "Erken erişime katıl",
    },
    connect: {
      badge: "Omnichannel Orkestrasyon Merkezi",
      titleBefore: "Bir kere oluşturun, ",
      titleHighlight: "her platforma kusursuz adapte edin.",
      description:
        "Tentamark içeriklerinizi sadece farklı kanallara göndermez, onları mecraya göre dönüştürür. Ana fikriniz yapay zeka tarafından analiz edilir; en doğru format, çözünürlük ve dille doğrudan hedef kitlenize ulaştırılır.",
      hoverDefault:
        "Herhangi bir platformun üzerine gelin — Tentamark'ın o mecraya özel adaptasyon kurgusunu görün.",
      adaptationLabel: "Adaptasyonu:",
      zones: [
        { id: "gorsel-video", title: "Görsel & Video", badge: "1. Öncelik" },
        { id: "metin-topluluk", title: "Metin & Topluluk", badge: "2. Öncelik" },
        { id: "e-ticaret", title: "E-Ticaret & Arama", badge: "3. Öncelik" },
        { id: "mesajlasma", title: "Doğrudan İletişim", badge: "Gelişmiş Aşama" },
      ],
      platformRoles: {
        instagram: "9:16 Reels & Hikaye kurgusu, renk uyumu ve trend hashtag analizi",
        tiktok: "Trend sesler, dinamik video kancaları (hook) ve viral formatlama",
        youtube: "Shorts dikey video akışı ve görsel topluluk gönderileri",
        pinterest: "Görsel ilham panoları, ürün pinleri ve organik arama trafiği",
        linkedin: "B2B düşünce liderliği, sektörel analiz tonu ve profesyonel ağ etkileşimi",
        facebook: "Geniş kitle erişimi, topluluk grupları ve kurumsal haber paylaşımları",
        threads: "Mikro blog formatı, samimi sohbet dili ve hızlı düşünce paylaşımları",
        x: "Gündem takibi, anlık etkileşim kurgusu ve vurucu kısa tweet akışı",
        shopify: "Otomatik ürün kataloğu beslemesi, yeni koleksiyon vitrini ve satış dönüşümü",
        "google-business": "Google Harita & Arama görünürlüğü, haftalık yerel işletme güncellemeleri",
        whatsapp: "VIP müşteri listeleri, duyuru kanalları ve doğrudan satın alma yönlendirmesi",
        telegram: "Özel duyuru kanalları, sadakat kulüpleri ve anlık bildirim yayını",
        discord: "Marka sunucuları, kapalı topluluk etkileşimi ve üyelere özel duyurular",
      },
      security: {
        oauth: "Resmi OAuth 2.0 & Sıfır Şifre Paylaşımı",
        api: "Uçtan Uca Şifreli Güvenli API",
        format: "Otomatik Format & Çözünürlük Dönüşümü",
      },
    },
    positioning: {
      items: [
        { label: "AI Content Generator", verdict: "cross" },
        { label: "AI Social Media Scheduler", verdict: "cross" },
        { label: "AI Marketing Manager", verdict: "check" },
      ],
    },
    productShowcase: {
      eyebrow: "Haftalık Akış & Planlama",
      titleBefore: "Haftanın tamamı ",
      titleHighlight: "tek ekranda.",
      copy: "Hangi içerik hangi platforma ne zaman gidiyor, hangisi sizi bekliyor. Karmaşık ayar yok, menü avı yok.",
      imageAlt: "Tentamark Haftalık İçerik Takvimi",
    },
    loop: {
      badge: "Nasıl Çalışır",
      titleBefore: "Bir kere kurulmuyor, ",
      titleHighlight: "her yayında daha akıllı hale geliyor.",
      copy: "Çoğu araç içerik üretip bırakır. Tentamark'ta döngü hiç kapanmaz: Her yayından öğrenilen sonuç, bir sonraki haftanın stratejisine geri beslenir.",
      scrollHint: "kaydırdıkça ilerler",
      steps: [
        {
          key: "brand-dna",
          label: "Brand DNA",
          title: "Markanızı tanır, dijital kimliğini çıkarır.",
          badge: "Marka DNA'sı",
        },
        {
          key: "content-ai",
          label: "TentaCast",
          title: "Tek bir fikri tüm platformlara uyarlar.",
          badge: "Çoklu Yayın",
        },
        {
          key: "approval",
          label: "1-Tıkla Onay",
          title: "Son söz her zaman sizdedir.",
          badge: "İnsan Onaylı",
        },
        {
          key: "publish",
          label: "Otomatik Yayın",
          title: "Doğru saatte, doğru kanalda yayında.",
          badge: "Akıllı Zamanlama",
        },
        {
          key: "learning",
          label: "Öğrenme Döngüsü",
          title: "Rakamlar bir sonraki haftanın planını yazar.",
          badge: "Sürekli Gelişim",
        },
      ],
    },
    platforms: {
      eyebrow: "Çoklu Platform Yönetimi",
      titleBefore: "Cebinizde veya masanızda. ",
      titleHighlight: "Her platforma tek dokunuşla.",
      copy: "Bugün Instagram, Facebook ve LinkedIn'de yayında. Yol haritamız çok daha geniş: görsel/video, metin/topluluk, e-ticaret ve mesajlaşma kanallarının tamamını tek panelden yönetilebilir hale getiriyoruz.",
      imageAlt: "Tentamark bilgisayar, tablet ve telefon ekranında",
      deviceBadge: "Tek Dokunuşla Onay",
      tiers: [
        { key: "gorsel-video", label: "Görsel & Video", hint: "Birinci öncelik" },
        { key: "metin-topluluk", label: "Metin & Topluluk", hint: "İkinci öncelik" },
        { key: "e-ticaret", label: "E-Ticaret & Dönüşüm", hint: "Üçüncü öncelik" },
        { key: "mesajlasma", label: "Mesajlaşma", hint: "Gelişmiş aşama" },
      ],
      statusActive: "Aktif",
      statusSoon: "yakında",
    },
    useCases: {
      eyebrow: "Kullanım Senaryoları",
      titleBefore: "Farklı işler, ",
      titleHighlight: "aynı ihtiyaç.",
      copy: "Sektör farklı olsa da sorun aynı: içerik üretecek zaman veya ekip yok. Tentamark'ı kullananların gerçek profilleri.",
      cases: [
        {
          key: "solo",
          title: "Tek başına yöneten işletme sahibi",
          desc: "Sosyal medyaya ayıracak vaktiniz yok. Tentamark haftalık planı hazırlar, siz onaylarsınız.",
          tag: "Zaman kazanır",
          points: [
            "Haftalık içerik planı otomatik hazırlanır.",
            "Tek tıkla onaylarsınız, gerisini biz hallederiz.",
          ],
        },
        {
          key: "local",
          title: "Lokal işletme (kafe, kuaför, klinik)",
          desc: "Düzenli paylaşım disiplinini tutturmak zor. Tentamark hatırlatma beklemeden, her hafta aynı kalitede üretir.",
          tag: "Düzeni korur",
          points: [
            "Her hafta aynı kalitede içerik, hatırlatmaya gerek yok.",
            "Kafe, kuaför, klinik — hepsi için aynı disiplin.",
          ],
        },
        {
          key: "team",
          title: "Küçük ekip veya ajans",
          desc: "Birden fazla markayı tek panelden yönetin — her biri kendi Brand DNA'sıyla ayrışır.",
          tag: "Ölçeklenir",
          points: [
            "Birden fazla markayı tek panelden yönetin.",
            "Her marka kendi Brand DNA'sıyla ayrışır.",
          ],
        },
        {
          key: "ecommerce",
          title: "E-ticaret markası",
          desc: "Kampanya dönemlerinde içerik hacmi patlar. Tek fikri her platforma doğru formatta uyarlarız.",
          tag: "Kampanyaya hazır",
          points: [
            "Kampanya dönemlerinde içerik hacmini karşılar.",
            "Tek fikri her platforma doğru formatta uyarlar.",
          ],
        },
        {
          key: "consultant",
          title: "Danışman, koç, kişisel marka",
          desc: "Uzmanlığınızı düzenli içerikle görünür kılın. Fikir üretme yükünü biz alırız, sözü siz söylersiniz.",
          tag: "Görünürlük kazandırır",
          points: [
            "Uzmanlığınızı düzenli içerikle görünür kılar.",
            "Fikir üretme yükünü biz alırız, sözü siz söylersiniz.",
          ],
        },
        {
          key: "startup",
          title: "Yeni kurulan marka veya girişim",
          desc: "Sıfırdan görünürlük inşa etmek zaman alır. Tentamark ilk günden düzenli, tutarlı bir içerik akışı kurar.",
          tag: "Hızlı görünürlük kazandırır",
          points: [
            "İlk günden itibaren düzenli içerik akışı kurar.",
            "Sıfırdan marka bilinirliği hızla inşa edilir.",
          ],
        },
      ],
    },
    whoUses: {
      eyebrow: "Kimler İçin",
      titleBefore: "Tentamark ",
      titleHighlight: "herkes için değil.",
      copy: "Kimin için doğru olduğunu net söylemek, olmayan biri için zaman kaybetmenizi engeller.",
      fitBadge: "En uygun profil",
      fitTitle: "Sizin için doğru, eğer:",
      fitItems: [
        "Sosyal medyayı siz veya tek kişilik bir ekip yönetiyor",
        "Markanızın sesini biliyorsunuz ama her gün yazacak vaktiniz yok",
        "İçeriğin yayınlanmadan önce sizden geçmesini istiyorsunuz",
        "Hangi platformda olursanız olun (bugün veya yarın), sosyal medyada aktif ve görünür kalmak istiyorsunuz",
      ],
      fitConclusion:
        "Bu maddelerin çoğu size uyuyorsa, Tentamark ilk haftadan itibaren fark yaratır.",
      notFitTitle: "Muhtemelen değil, eğer",
      notFitItems: [
        "İçerik üretimini uçtan uca tamamen bir ajansa devretmek istiyorsunuz",
        "Sosyal medya stratejiniz yok, önce bir insan danışman arıyorsunuz",
        "Hiçbir içeriğin AI yardımıyla hazırlanmasını istemiyorsunuz",
      ],
    },
    features: {
      eyebrow: "Neler Yapar",
      titleBefore: "Bir asistan değil, ",
      titleHighlight: "bir yönetici.",
      copy: "Stratejiden içerik üretimine, onaydan analize kadar; markanızın sosyal medya operasyonunun tamamı tek elden yürür.",
      foundation: {
        tag: "Temel",
        title: "Marka tutarlılığı",
        body: "Her içerik, markanızın tonuna, renklerine ve yasak konularına sadık kalır. Brand DNA'nız tüm üretimin temelidir.",
      },
      groups: [
        {
          key: "uretim",
          label: "İçerik Üretimi",
          items: [
            {
              title: "Platforma özel uyarlama",
              body: "Aynı fikir; Instagram'da kısa ve enerjik, LinkedIn'de profesyonel ve tartışmaya açık şekilde yeniden yazılır.",
            },
            {
              title: "Görsel üretimi",
              body: "Çekim konseptini yazın, markanızın renk paletine uygun profesyonel bir görsel AI ile üretilsin.",
            },
            {
              title: "Video üretimi",
              body: "Aynı motor, kısa reklam ve sosyal medya videoları da üretir — stüdyoya gerek kalmadan.",
            },
          ],
        },
        {
          key: "operasyon",
          label: "Operasyon & Onay",
          items: [
            {
              title: "İnsan onaylı yayınlama",
              body: "AI önerir, siz onaylarsınız. Onayınız olmadan tek bir gönderi bile yayınlanmaz.",
            },
            {
              title: "İçerik takvimi",
              body: "Haftalık ve aylık görünümde, markanızın önümüzdeki 30 gününü tek bakışta görün.",
            },
          ],
        },
        {
          key: "analiz",
          label: "Analiz & Öğrenme",
          items: [
            {
              title: "Performanstan öneriye",
              body: "Hangi içerik neden iyi çalıştı, AI analiz eder ve bir sonraki planı buna göre yeniden kurar.",
            },
            {
              title: "Haftalık AI önerileri",
              body: "Boş sayfa yok. Her hafta markanıza özel, hazır içerik fikirleriyle başlarsınız.",
            },
          ],
        },
      ],
    },
    analytics: {
      eyebrow: "Performans Analitiği",
      titleBefore: "Sadece kuru bir rapor değil, ",
      titleHighlight: "bir sonraki haftanın stratejisi.",
      copy: "Klasik araçlar \"bu gönderi 12.000 görüntülenme aldı\" der ve sizi boş sayfayla baş başa bırakır. Tentamark'ın yapay zekası ise hangi içeriğin neden çalıştığını çözümler ve döngüyü kapatır.",
      imageAlt:
        "Tentamark performans verisini analiz edip gelecek haftanın içerik önerisine dönüştürür",
      card1Number: "01",
      card1Title: "Veriyi toplar, örüntüyü çıkarır",
      card1Desc:
        "Instagram, TikTok ve LinkedIn performanslarını aynı anda ölçerek en çok kaydedilen ve paylaşılan formatları bulur.",
      card2Number: "02",
      card2Title: "Eyleme dönüşen somut öneri üretir",
      card2QuotePart1: "Eğitim içerikleri ürün tanıtımlarından ",
      card2QuoteHighlight1: "%37 daha yüksek etkileşim",
      card2QuotePart2: " aldı. Gelecek hafta için ",
      card2QuoteHighlight2: "3 eğitim Reel'i",
      card2QuotePart3: " hazırladım.",
    },
    pricing: {
      eyebrow: "Fiyatlandırma",
      titleBefore: "Küçük başlayın, ",
      titleHighlight: "büyüdükçe genişletin.",
      copy: "Fiyatlar henüz kesinleşmedi. İlk kullanıcılarımızla birlikte test ediyoruz, ama aşağıdaki rakamlar bir taslak değil — bugünkü hedef politikamız bu.",
      creditExplainer:
        "AI kredisi nedir? Bir metin gönderisi ~1, bir görsel ~5, bir video ~15 kredi kullanır — üretim gücü farklı olduğu için tüketimleri de farklıdır.",
      perMonth: "/ay",
      tiers: [
        { name: "Free", price: "$0", for: "Denemek isteyenler için" },
        { name: "Starter", price: "$19", for: "Tek başına yönetenler için" },
        { name: "Pro", price: "$49", for: "Büyüyen markalar için" },
        { name: "Business", price: "$99", for: "Ekip ve ajanslar için" },
      ],
      features: [
        { label: "Marka sayısı", values: ["1", "2", "5", "Sınırsız"] },
        { label: "Sosyal hesap sayısı", values: ["1", "5", "15", "40"] },
        { label: "AI kredisi / ay", values: ["5", "150", "500", "1.500"] },
        { label: "Görsel üretimi", values: ["—", "✓", "✓", "✓"] },
        { label: "Video üretimi", values: ["—", "—", "✓", "✓"] },
        {
          label: "İçerik takvimi",
          values: ["Temel", "Temel", "Sürükle-bırak + öneriler", "Sürükle-bırak + öneriler"],
        },
        {
          label: "Onay akışı",
          values: ["Tek aşama", "Tek aşama", "Çok aşama", "Çok aşama + roller"],
        },
        { label: "Haftalık AI içerik paketi", values: ["—", "✓", "✓", "✓"] },
        {
          label: "Performans → strateji analizi",
          values: ["—", "Temel", "Gelişmiş", "Gelişmiş"],
        },
        { label: "Ekip üyesi", values: ["1", "1", "3", "Sınırsız"] },
        {
          label: "Destek",
          values: ["Topluluk", "E-posta", "Öncelikli e-posta", "Öncelikli + özel temsilci"],
        },
      ],
    },
    faq: {
      eyebrow: "Sıkça Sorulan Sorular",
      titleBefore: "Merak ettikleriniz ",
      titleHighlight: "muhtemelen burada.",
      groups: [
        {
          label: "Ürün & Marka",
          items: [
            {
              q: "Hangi platformlarda yayın yapabiliyorum?",
              a: "Bugün Instagram, Facebook ve LinkedIn'de doğrudan yayın yapılıyor. TikTok, YouTube, Pinterest, Threads ve X yol haritamızda; sırayla açılıyor.",
            },
            {
              q: "Markamın tonunu nasıl öğreniyor?",
              a: "Kurulumda sektörünüzü, konuşma tonunuzu, renk paletinizi ve yasaklı konularınızı tanımlayan bir Brand DNA oluşturuyoruz. Üretilen her içerik bu DNA'ya göre yazılır.",
            },
            {
              q: "Görsel ve video içerikleri nasıl üretiliyor?",
              a: "Çekim konseptini kısaca anlatırsınız; Tentamark markanızın renk paletine ve tonuna uygun bir görsel veya video üretir. Diğer her içerik gibi, siz onaylamadan hiçbir şey yayına gitmez.",
            },
          ],
        },
        {
          label: "Güven & Kontrol",
          items: [
            {
              q: "Onayım olmadan bir şey yayınlanır mı?",
              a: "Hayır. Tentamark taslakları hazırlar, siz inceler ve onaylarsınız. Onayınız olmadan tek bir gönderi bile hesaplarınıza gitmez.",
            },
            {
              q: "Verilerim ve hesap şifrelerim güvende mi?",
              a: "Şifrenizi hiçbir zaman istemeyiz. Hesaplarınız resmi OAuth ile bağlanır, erişim istediğiniz an tek tıkla iptal edilebilir.",
            },
          ],
        },
        {
          label: "Fiyatlandırma & Erken Erişim",
          items: [
            {
              q: "Fiyatlandırma ne zaman netleşecek?",
              a: "Fiyatlandırma sayfasındaki rakamlar bugünkü hedef politikamız, ama ilk kullanıcılarımızla test ederken değişebilir. Erken erişime katılanlar herhangi bir değişiklik olursa ilk haberdar olur.",
            },
            {
              q: "Erken erişime katılırsam ne oluyor?",
              a: "Listeye e-posta adresinizi bırakıyorsunuz. Ürün kullanıma açıldığında ilk davet edilen grup arasında oluyorsunuz, spam göndermiyoruz.",
            },
          ],
        },
      ],
    },
    finalCta: {
      eyebrow: "Erken Erişim",
      titleBefore: "Markanızı anlatın, ",
      titleHighlight: "planınızı görelim.",
      copy: "Şu an erken erişim listesi oluşturuyoruz. İlk kullanıcı grubuna katılın, ürün hazır olduğunda ilk siz haberdar olun.",
      emailPlaceholder: "ornek@marka.com",
      buttonText: "Listeye katıl",
      guarantee: "Spam yok · İstediğiniz zaman ayrılın",
    },
    footer: {
      tagline: "Markanız için çalışan AI Marketing Manager.",
      privacy: "Gizlilik Politikası",
      terms: "Kullanım Koşulları",
      status: "Ürün geliştirme aşamasında",
      languageToggleLabel: "Dil Seçimi",
    },
  },
  en: {
    header: {
      nav: {
        howItWorks: "How it works",
        features: "Features",
        platforms: "Platforms",
        pricing: "Pricing",
        faq: "FAQ",
      },
      login: "Log in",
      joinEarlyAccess: "Join early access",
    },
    hero: {
      eyebrow: "AI Marketing Manager",
      headlineBefore: "A dedicated team managing your brand's social media. ",
      headlineHighlight: "Even if you're a team of one.",
      copy: "Tentamark learns your brand identity, prepares your weekly content plan, and writes specifically for each platform. You approve, it publishes and learns from the results.",
      emailPlaceholder: "name@brand.com",
      emailLabel: "Your email address",
      ctaButton: "Join early access",
      watchDemo: "Watch demo",
      trustText: "Works with Instagram, Facebook, and LinkedIn",
      statValue: "Engagement +18%",
      statPeriod: "last 30 days",
      portraitAlt: "A business owner managing their social media with Tentamark",
    },
    adShowcase: {
      badge: "Coming Soon · Our Vision",
      titleBefore: "Let us also produce the ",
      titleHighlight: "content for your brand.",
      copy: "Today we generate copy and visuals directly from your Brand DNA. Next up is video — we don't just schedule it, we create it and present it to you. You simply approve.",
      fallbackText: "Video coming soon",
      ctaButton: "Join early access",
    },
    connect: {
      badge: "Omnichannel Orchestration Hub",
      titleBefore: "Create once, ",
      titleHighlight: "adapt seamlessly to every platform.",
      description:
        "Tentamark doesn't just broadcast content across channels—it transforms it for each medium. Your core concept is analyzed by AI and delivered in the optimal format, resolution, and voice directly to your target audience.",
      hoverDefault:
        "Hover over any platform to see Tentamark's tailored adaptation framework for that medium.",
      adaptationLabel: "Adaptation:",
      zones: [
        { id: "gorsel-video", title: "Visual & Video", badge: "Priority 1" },
        { id: "metin-topluluk", title: "Text & Community", badge: "Priority 2" },
        { id: "e-ticaret", title: "E-Commerce & Search", badge: "Priority 3" },
        { id: "mesajlasma", title: "Direct Messaging", badge: "Advanced Phase" },
      ],
      platformRoles: {
        instagram: "9:16 Reels & Stories framing, chromatic harmony, and trending hashtag analysis",
        tiktok: "Trending audio hooks, high-retention pacing, and viral algorithm formatting",
        youtube: "Shorts vertical video stream and visual community discussions",
        pinterest: "Inspirational aesthetic boards, rich product pins, and search discovery",
        linkedin: "B2B thought leadership, industry analysis tone, and professional engagement",
        facebook: "Broad audience reach, active community groups, and brand announcements",
        threads: "Micro-blogging format, conversational dialogue, and quick thought-sharing",
        x: "Trend tracking, real-time cultural dialogue, and high-impact concise updates",
        shopify: "Automated product catalog sync, new collection spotlights, and sales conversion",
        "google-business": "Google Maps & Local Search visibility, weekly verified company updates",
        whatsapp: "VIP customer broadcast lists, loyalty alerts, and direct purchase routing",
        telegram: "Exclusive broadcast channels, member clubs, and instant notifications",
        discord: "Brand community servers, closed-door discussions, and subscriber-only perks",
      },
      security: {
        oauth: "Official OAuth 2.0 & Zero Password Sharing",
        api: "End-to-End Encrypted Secure API",
        format: "Automated Format & Resolution Adaptation",
      },
    },
    positioning: {
      items: [
        { label: "AI Content Generator", verdict: "cross" },
        { label: "AI Social Media Scheduler", verdict: "cross" },
        { label: "AI Marketing Manager", verdict: "check" },
      ],
    },
    productShowcase: {
      eyebrow: "Weekly Flow & Scheduling",
      titleBefore: "Your entire week ",
      titleHighlight: "on a single screen.",
      copy: "See which post goes to which platform, when it publishes, and what's waiting for you. No confusing settings, no menu hunting.",
      imageAlt: "Tentamark Weekly Content Calendar",
    },
    loop: {
      badge: "How It Works",
      titleBefore: "Not just a one-off setup, ",
      titleHighlight: "it gets smarter with every single post.",
      copy: "Most tools generate content and stop there. With Tentamark, the feedback loop never closes: insights from every post continually refine next week's strategic plan.",
      scrollHint: "scroll to advance",
      steps: [
        {
          key: "brand-dna",
          label: "Brand DNA",
          title: "Learns your brand, extracts its digital identity.",
          badge: "Brand DNA",
        },
        {
          key: "content-ai",
          label: "TentaCast",
          title: "Adapts a single idea across every platform.",
          badge: "Omnichannel",
        },
        {
          key: "approval",
          label: "1-Click Approval",
          title: "You always hold the final say.",
          badge: "Human-in-the-Loop",
        },
        {
          key: "publish",
          label: "Auto-Publish",
          title: "Live on the right channel at the prime hour.",
          badge: "Smart Scheduling",
        },
        {
          key: "learning",
          label: "Learning Loop",
          title: "Real metrics draft next week's master plan.",
          badge: "Continuous Growth",
        },
      ],
    },
    platforms: {
      eyebrow: "Multi-Platform Management",
      titleBefore: "In your pocket or at your desk. ",
      titleHighlight: "One tap to every platform.",
      copy: "Live today on Instagram, Facebook, and LinkedIn. Our roadmap spans visual/video, text/community, e-commerce, and direct messaging channels—all managed from a single unified hub.",
      imageAlt: "Tentamark on desktop, tablet, and mobile screens",
      deviceBadge: "One-Touch Approval",
      tiers: [
        { key: "gorsel-video", label: "Visual & Video", hint: "First Priority" },
        { key: "metin-topluluk", label: "Text & Community", hint: "Second Priority" },
        { key: "e-ticaret", label: "E-Commerce & Conversion", hint: "Third Priority" },
        { key: "mesajlasma", label: "Messaging", hint: "Advanced Stage" },
      ],
      statusActive: "Active",
      statusSoon: "coming soon",
    },
    useCases: {
      eyebrow: "Use Cases",
      titleBefore: "Different businesses, ",
      titleHighlight: "the same core need.",
      copy: "Industries vary, but the struggle is universal: no bandwidth or team to produce content consistently. Here is who Tentamark empowers.",
      cases: [
        {
          key: "solo",
          title: "Solo business owner",
          desc: "No time to dedicate hours to social media. Tentamark prepares the weekly plan, you simply approve.",
          tag: "Saves time",
          points: [
            "Weekly content plans generated automatically.",
            "Approve with one tap, we handle the rest.",
          ],
        },
        {
          key: "local",
          title: "Local business (cafe, salon, clinic)",
          desc: "Staying consistent every week is tough. Tentamark delivers consistent quality without needing reminders.",
          tag: "Maintains cadence",
          points: [
            "Consistent quality every week, zero reminder fatigue.",
            "Cafes, salons, clinics — identical reliability for all.",
          ],
        },
        {
          key: "team",
          title: "Small team or agency",
          desc: "Manage multiple client brands from a single dashboard — each distinct with its own Brand DNA.",
          tag: "Scales effortlessly",
          points: [
            "Operate multiple client brands from one place.",
            "Each brand stays authentic to its unique Brand DNA.",
          ],
        },
        {
          key: "ecommerce",
          title: "E-commerce brand",
          desc: "Campaign season requires high content volume. We format one product idea for every channel.",
          tag: "Campaign-ready",
          points: [
            "Meets peak content demand during promotions.",
            "Adapts every concept to the optimal format per channel.",
          ],
        },
        {
          key: "consultant",
          title: "Consultant, coach, or creator",
          desc: "Showcase your expertise with regular thought leadership. We handle the ideation burden; you provide the voice.",
          tag: "Builds authority",
          points: [
            "Keeps your expertise visible with consistent posts.",
            "We remove the blank page panic; you keep full control.",
          ],
        },
        {
          key: "startup",
          title: "New startup or emerging brand",
          desc: "Building brand awareness from scratch takes time. Tentamark establishes a consistent, high-trust presence from day one.",
          tag: "Rapid traction",
          points: [
            "Establishes regular content cadence from day one.",
            "Builds organic brand credibility at venture speed.",
          ],
        },
      ],
    },
    whoUses: {
      eyebrow: "Who It's For",
      titleBefore: "Tentamark ",
      titleHighlight: "isn't for everyone.",
      copy: "Being candid about who we serve saves everyone valuable time.",
      fitBadge: "Best Fit Profile",
      fitTitle: "Right for you, if:",
      fitItems: [
        "You or a one-person team manages your brand's social channels",
        "You know your brand's voice, but lack the hours to write every single day",
        "You insist that every post receives your explicit review before going live",
        "No matter which channel trends next, you want your brand active and visible",
      ],
      fitConclusion:
        "If most of these resonate with you, Tentamark delivers measurable impact from week one.",
      notFitTitle: "Probably not for you, if:",
      notFitItems: [
        "You prefer outsourcing everything entirely to a traditional high-retainer agency",
        "You have no brand direction and want a human consultant to build one from scratch",
        "You object to using AI assistance anywhere in your marketing workflow",
      ],
    },
    features: {
      eyebrow: "What It Does",
      titleBefore: "Not just an assistant, ",
      titleHighlight: "a dedicated manager.",
      copy: "From strategic planning to content generation, approvals to analytics; your entire social media operation runs under one roof.",
      foundation: {
        tag: "Foundation",
        title: "Brand consistency",
        body: "Every post honors your voice, color palette, and boundary rules. Your Brand DNA anchors all output.",
      },
      groups: [
        {
          key: "uretim",
          label: "Content Generation",
          items: [
            {
              title: "Channel-specific adaptation",
              body: "The same idea is rewritten punchy for Instagram, yet insightful and discussion-focused for LinkedIn.",
            },
            {
              title: "Visual generation",
              body: "Describe your concept, and AI generates studio-grade imagery faithful to your color palette.",
            },
            {
              title: "Video generation",
              body: "The same engine produces engaging short-form social video ads — without booking a studio.",
            },
          ],
        },
        {
          key: "operasyon",
          label: "Operations & Approvals",
          items: [
            {
              title: "Human-approved publishing",
              body: "AI drafts, you approve. Not a single post ever goes live without your explicit green light.",
            },
            {
              title: "Content calendar",
              body: "Review your brand's upcoming 30 days at a glance across weekly and monthly schedules.",
            },
          ],
        },
        {
          key: "analiz",
          label: "Analytics & Learning",
          items: [
            {
              title: "Performance to strategy",
              body: "AI identifies why specific posts performed well and dynamically adapts the next cycle's plan.",
            },
            {
              title: "Weekly AI recommendations",
              body: "No blank screens. Every Monday starts with custom-tailored, ready-to-refine post proposals.",
            },
          ],
        },
      ],
    },
    analytics: {
      eyebrow: "Performance Analytics",
      titleBefore: "Not just a dry report, ",
      titleHighlight: "the blueprint for next week.",
      copy: "Standard tools report \"this post got 12,000 views\" and leave you staring at an empty calendar. Tentamark's AI decodes why content succeeded and closes the loop.",
      imageAlt:
        "Tentamark analyzes performance metrics and transforms them into next week's content recommendations",
      card1Number: "01",
      card1Title: "Collects data, spots patterns",
      card1Desc:
        "Measures Instagram, TikTok, and LinkedIn performance simultaneously to uncover top saved and shared formats.",
      card2Number: "02",
      card2Title: "Generates actionable next steps",
      card2QuotePart1: "Educational formats gained ",
      card2QuoteHighlight1: "37% higher engagement",
      card2QuotePart2: " than standard product promos. I've prepared ",
      card2QuoteHighlight2: "3 educational Reels",
      card2QuotePart3: " for next week.",
    },
    pricing: {
      eyebrow: "Pricing",
      titleBefore: "Start lean, ",
      titleHighlight: "expand as you scale.",
      copy: "Pricing is currently in pilot testing with early adopters. These numbers aren't placeholders—they reflect our target tier policy.",
      creditExplainer:
        "What are AI credits? A text post consumes ~1, an image ~5, and a video ~15 credits depending on output complexity.",
      perMonth: "/mo",
      tiers: [
        { name: "Free", price: "$0", for: "For exploring and testing" },
        { name: "Starter", price: "$19", for: "For solo business operators" },
        { name: "Pro", price: "$49", for: "For growing brands" },
        { name: "Business", price: "$99", for: "For teams and agencies" },
      ],
      features: [
        { label: "Brand accounts", values: ["1", "2", "5", "Unlimited"] },
        { label: "Social accounts", values: ["1", "5", "15", "40"] },
        { label: "AI credits / mo", values: ["5", "150", "500", "1,500"] },
        { label: "Visual generation", values: ["—", "✓", "✓", "✓"] },
        { label: "Video generation", values: ["—", "—", "✓", "✓"] },
        {
          label: "Content calendar",
          values: ["Basic", "Basic", "Drag-and-drop + suggestions", "Drag-and-drop + suggestions"],
        },
        {
          label: "Approval flow",
          values: ["Single-stage", "Single-stage", "Multi-stage", "Multi-stage + custom roles"],
        },
        { label: "Weekly AI content batch", values: ["—", "✓", "✓", "✓"] },
        {
          label: "Performance → strategy loop",
          values: ["—", "Basic", "Advanced", "Advanced"],
        },
        { label: "Team members", values: ["1", "1", "3", "Unlimited"] },
        {
          label: "Support",
          values: ["Community", "Email", "Priority email", "Priority + dedicated account rep"],
        },
      ],
    },
    faq: {
      eyebrow: "Frequently Asked Questions",
      titleBefore: "Everything you're wondering, ",
      titleHighlight: "answered right here.",
      groups: [
        {
          label: "Product & Brand",
          items: [
            {
              q: "Which platforms can I publish to directly?",
              a: "Direct automated publishing is live today for Instagram, Facebook, and LinkedIn. TikTok, YouTube, Pinterest, Threads, and X are on our active roadmap and launching in phases.",
            },
            {
              q: "How does it learn my brand's distinct voice?",
              a: "During onboarding, we formulate a Brand DNA capturing your industry, voice, color palette, and negative keywords. Every generated post strictly adheres to this DNA.",
            },
            {
              q: "How are visual and video assets created?",
              a: "Briefly specify your visual concept; Tentamark renders a custom image or video aligned with your brand's aesthetic. Nothing is ever published without your explicit review.",
            },
          ],
        },
        {
          label: "Trust & Control",
          items: [
            {
              q: "Will anything ever publish without my explicit approval?",
              a: "Never. Tentamark drafts the proposals; you review, edit, or approve. Not a single post will ever touch your social accounts without your confirmation.",
            },
            {
              q: "Are my passwords and account credentials secure?",
              a: "We never ask for or store your social passwords. Channels connect via official, industry-standard OAuth 2.0, and access can be revoked instantly at any time.",
            },
          ],
        },
        {
          label: "Pricing & Early Access",
          items: [
            {
              q: "When will pricing be finalized?",
              a: "The tiers shown represent our target policy while we gather feedback from early cohorts. Founding early-access members will receive first notice and preferred benefits.",
            },
            {
              q: "What happens when I join early access?",
              a: "You secure your position on our waitlist. When invites roll out, you'll be among the very first welcomed into the platform. No spam, ever.",
            },
          ],
        },
      ],
    },
    finalCta: {
      eyebrow: "Early Access",
      titleBefore: "Introduce your brand, ",
      titleHighlight: "preview your roadmap.",
      copy: "We are currently accepting early access applications. Join the founding group to secure priority access as soon as we open doors.",
      emailPlaceholder: "name@brand.com",
      buttonText: "Join waitlist",
      guarantee: "No spam · Unsubscribe at any time",
    },
    footer: {
      tagline: "The AI Marketing Manager working for your brand.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      status: "Product in active development",
      languageToggleLabel: "Language selection",
    },
  },
} as const;

export type Translations = (typeof translations)[Locale];
