import { type PlatformName } from "@/components/PlatformIcon";

export interface FormatCard {
  title: string;
  badge: string;
  desc: string;
  image: string;
  ratio: string;
}

export interface SetupStep {
  step: string;
  title: string;
  desc: string;
}

export interface PlatformConfig {
  slug: PlatformName;
  name: string;
  categoryBadge: string;
  status: "active" | "soon";
  statusLabel: string;
  category: "social" | "video" | "community" | "messaging" | "creative" | "ecommerce";
  headline: string;
  subhead: string;
  connectCta: string;
  formatSection: {
    badge: string;
    title: string;
    sub: string;
    cards: FormatCard[];
  };
  featureSection: {
    badge: string;
    title: string;
    sub: string;
    captionSample: string;
    tagsSample: string[];
    sourceLibrary: string;
  };
  setupSteps: SetupStep[];
  shortDesc: string;
}

export const PLATFORM_REGISTRY: Record<PlatformName, PlatformConfig> = {
  instagram: {
    slug: "instagram",
    name: "Instagram",
    categoryBadge: "Sosyal Medya · Instagram",
    status: "active",
    statusLabel: "Resmi Meta Graph API",
    category: "social",
    headline: "Paylaşmadan önce ızgaranızı görün.",
    subhead:
      "Akışınızı görsel olarak planlayın, Reels ve karuselleri önceden hazırlayın; Tentamark telefonunuza ihtiyaç duymadan doğrudan Instagram İşletme hesabınıza yayınlasın.",
    connectCta: "Instagram'ı Bağla",
    shortDesc: "Akış, Reels ve Karusel gönderilerini görsel ızgarada planlayın.",
    formatSection: {
      badge: "HER FORMAT",
      title: "Akış, karusel ve Reel — tam boyutunda.",
      sub: "Her format kendi tuval ölçüsüne göre optimize edilir; böylece kırpılmalar tesadüf değil, kasıtlı ve kusursuz olur.",
      cards: [
        {
          title: "Akış Gönderisi",
          badge: "4:5 / 1:1",
          desc: "Izgarada önemli hiçbir detayın kırpılmayacağı şekilde hizalanmış tekil görseller.",
          image: "/images/mock-data/orange-slices.jpg",
          ratio: "aspect-[4/5]",
        },
        {
          title: "Karusel",
          badge: "10 slayta kadar",
          desc: "Çok slaytlı eğitici hikayeleri stüdyoda hazırlayın ve tek gönderi halinde yayınlayın.",
          image: "/images/mock-data/acai-bowl.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Reel",
          badge: "9:16 Dikey Video",
          desc: "Telefon uygulamasına girmeden dikey videoyu kırpın, kancasını ekleyin ve zamanlayın.",
          image: "/images/mock-data/pink-lemons.jpg",
          ratio: "aspect-[9/16]",
        },
      ],
    },
    featureSection: {
      badge: "AKILLI ETİKETLER",
      title: "Açıklamayı temiz tutun.",
      sub: "Küratörlü etiket kütüphanelerinizden tek tıkla çekin veya yapay zekanın metne doğal şekilde işlemesine izin verin.",
      captionSample: "Yeni parti taze kavruldu ☕ Sıcakken hemen kapın.",
      tagsSample: ["#kahveseverler", "#niteliklikahve", "#sabahritueli", "#yerelkavurucu", "#kahvekeyfi"],
      sourceLibrary: "Kütüphaneden: “Kahve — Daimi Koleksiyon”",
    },
    setupSteps: [
      {
        step: "01",
        title: "İşletme Hesabını Bağlayın",
        desc: "Bir Facebook Sayfasına bağlı Instagram İşletme veya İçerik Üretici profilinizi seçin.",
      },
      {
        step: "02",
        title: "Izgarayı Planlayın",
        desc: "İçerikleri takvime sürükleyin ve yayınlanmadan önce akışın nasıl duracağını önceden görün.",
      },
      {
        step: "03",
        title: "Otonom Olarak Yayınlayın",
        desc: "Akış gönderileri, karuseller ve Reels tam saatinde yayınlanır; telefon bildirimi beklemenize gerek kalmaz.",
      },
    ],
  },

  linkedin: {
    slug: "linkedin",
    name: "LinkedIn",
    categoryBadge: "B2B & Profesyonel Ağ · LinkedIn",
    status: "active",
    statusLabel: "Resmi LinkedIn Community API",
    category: "social",
    headline: "B2B kitleniz için karusel ve makale otomasyonu.",
    subhead:
      "Şirket sayfalarınızı ve kişisel profillerinizi tek merkezden yönetin. Yüksek etkileşimli PDF karusellerini ve düşünce liderliği metinlerini saatinde yayınlayın.",
    connectCta: "LinkedIn'i Bağla",
    shortDesc: "Profiller, Şirket Sayfaları ve PDF belge karuselleri.",
    formatSection: {
      badge: "PROFESYONEL FORMATLAR",
      title: "Belgeler, makaleler ve şirket güncellemeleri.",
      sub: "B2B profesyonellerinin dikkatini çeken belge slaytları ve sektör analizleri için optimize tuval.",
      cards: [
        {
          title: "PDF Belge Karuseli",
          badge: "PDF Belgesi",
          desc: "Kaydırılabilir mikro rehberler oluşturun; LinkedIn organik algoritmasında en yüksek erişimi alın.",
          image: "/images/mock-data/smoothie-jars.jpg",
          ratio: "aspect-[4/3]",
        },
        {
          title: "Düşünce Liderliği Metni",
          badge: "3000 Karakter",
          desc: "Uzun soluklu içgörüler, kurucu hikayeleri ve sektör tavsiyeleri için formatlanmış metinler.",
          image: "/images/mock-data/iced-latte.jpg",
          ratio: "aspect-[4/5]",
        },
        {
          title: "Görsel ve Video Gönderisi",
          badge: "16:9 / 1:1",
          desc: "Şirket duyuruları, ürün lansmanları ve takım başarıları için profesyonel medya.",
          image: "/images/mock-data/fresh-pastry.jpg",
          ratio: "aspect-square",
        },
      ],
    },
    featureSection: {
      badge: "KURUCU SESİ",
      title: "Kişisel marka ile kurumsal kimliği harmanlayın.",
      sub: "Tentamark, kurucu ve şirket hesabı arasındaki ton farkını anlar; B2B karusellerini buna göre kurgular.",
      captionSample: "SaaS büyümesinde en çok gözden kaçan metrik: Tutundurma hızı. İşte ilk 90 günde churn oranını düşüren 4 taktik...",
      tagsSample: ["#b2bmarketing", "#saasgrowth", "#growthstrategy", "#leadership"],
      sourceLibrary: "Kütüphaneden: “B2B Büyüme Şablonları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Profilinizi veya Sayfanızı Bağlayın",
        desc: "LinkedIn resmi OAuth yetkilendirmesiyle güvenle bağlanın.",
      },
      {
        step: "02",
        title: "Karusel ve Gönderileri Hazırlayın",
        desc: "AI Asistanının ürettiği sektörel taslakları inceleyin, slaytları gözden geçirin.",
      },
      {
        step: "03",
        title: "Zirve Saatlerde Yayınlayın",
        desc: "B2B kitlenizin en aktif olduğu Salı ve Perşembe sabah saatlerinde otonom paylaşım.",
      },
    ],
  },

  tiktok: {
    slug: "tiktok",
    name: "TikTok",
    categoryBadge: "Kısa Video · TikTok",
    status: "active",
    statusLabel: "Resmi TikTok Direct Post API",
    category: "video",
    headline: "Trendleri yakalayın, dikey videoyu doğrudan yayınlayın.",
    subhead:
      "TikTok Direct Post API ile videolarınızı telefonla uğraşmadan hesabınıza yükleyin. İlk 3 saniye kancaları ve trend müzik önerileriyle keşfete çıkın.",
    connectCta: "TikTok'u Bağla",
    shortDesc: "Trend kısa dikey video yükleme ve zamanlama.",
    formatSection: {
      badge: "DİKEY FORMAT",
      title: "9:16 Video, Trend Kancası ve Akıllı Altyazı.",
      sub: "TikTok sadece video kabul eder; Tentamark dikey video formatına tam uyumlu kurguları doğrudan hesabınıza yükler.",
      cards: [
        {
          title: "TikTok Dikey Video",
          badge: "9:16 Full Screen",
          desc: "Telefon ekranını kaplayan, yüksek çözünürlüklü ve kaydırmayı durduran dikey video.",
          image: "/images/mock-data/pink-lemons.jpg",
          ratio: "aspect-[9/16]",
        },
        {
          title: "Trend Kancası Metni",
          badge: "İlk 3 Saniye",
          desc: "İzleyiciyi videoda tutan ve tamamlama oranını artıran dinamik altyazı kancaları.",
          image: "/images/mock-data/orange-slices.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Doğrudan Yükleme (Direct Post)",
          badge: "Resmi API",
          desc: "Telefon bildirimine tıklayıp dosyayı manuel seçmeye gerek kalmadan tam otonom yükleme.",
          image: "/images/mock-data/pineapple-summer.jpg",
          ratio: "aspect-[4/5]",
        },
      ],
    },
    featureSection: {
      badge: "VİRAL KANCALAR",
      title: "Algoritmayı besleyen ilk cümle.",
      sub: "AI Pazarlama Yöneticiniz, sektörünüze özel trend kanca şablonlarını otomatik videoya ekler.",
      captionSample: "Bunu bilseydim sosyal medyada 1 yılımı çöpe atmazdım 🤯 Siz de aynı hatayı yapıyorsanız mutlaka izleyin.",
      tagsSample: ["#tiktoktüyoları", "#keşfet", "#büyüme", "#girişimcilik"],
      sourceLibrary: "Kütüphaneden: “TikTok Viral Kancaları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "TikTok Hesabınızı Eşleştirin",
        desc: "TikTok Creator veya Business hesabınızı resmi arayüzden tek tıkla onaylayın.",
      },
      {
        step: "02",
        title: "Videonuzu Yükleyin & Kanca Ekleyin",
        desc: "Medya kütüphanenizden dikey videoyu seçin, AI başlığınızı hazırlasın.",
      },
      {
        step: "03",
        title: "Direct Post ile Yayına Alın",
        desc: "Tentamark dosyayı doğrudan TikTok sunucularına aktarsın.",
      },
    ],
  },

  facebook: {
    slug: "facebook",
    name: "Facebook",
    categoryBadge: "Sosyal Ağ · Facebook",
    status: "active",
    statusLabel: "Resmi Meta Graph API",
    category: "social",
    headline: "Sayfalar ve topluluklar için resmi API entegrasyonu.",
    subhead:
      "Facebook Şirket Sayfalarınıza tek görsel, albüm veya video paylaşın. Gelen yorum ve mesajları tek kutudan marka tonunda yanıtlayın.",
    connectCta: "Facebook'u Bağla",
    shortDesc: "İşletme sayfaları, albümler ve video gönderileri.",
    formatSection: {
      badge: "TOPLULUK FORMATLARI",
      title: "Sayfa gönderisi, çoklu albüm ve video.",
      sub: "Facebook kitlesinin etkileşim alışkanlıklarına göre optimize edilmiş görsel ve metin yapıları.",
      cards: [
        {
          title: "Fotoğraf Albümü",
          badge: "Çoklu Görsel",
          desc: "Etkinlikler, menü güncellemeleri ve ürün koleksiyonları için çoklu fotoğraf albümleri.",
          image: "/images/mock-data/fresh-pastry.jpg",
          ratio: "aspect-[4/3]",
        },
        {
          title: "Sayfa Güncellemesi",
          badge: "Tekil Görsel",
          desc: "Haberler ve önemli duyurular için yüksek tıklama oranlı bağlantı önizlemeleri.",
          image: "/images/mock-data/grapefruit-citrus.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Video Gönderisi",
          badge: "HD Video",
          desc: "Topluluğunuza hitap eden uzun soluklu eğitici veya tanıtıcı video içerikleri.",
          image: "/images/mock-data/acai-bowl.jpg",
          ratio: "aspect-[16/9]",
        },
      ],
    },
    featureSection: {
      badge: "GELEN KUTUSU",
      title: "Gelen yorumları kaçırmayın.",
      sub: "Gönderilerinize ve sayfanıza gelen soruları marka tonunuzda yapay zeka ile anında yanıtlayın.",
      captionSample: "Hafta sonu özel menümüz hazır! Siz de taze sıkılmış tatlarımızı denemek için bize katılın.",
      tagsSample: ["#haftasonu", "#lezzet", "#etkinlik", "#yerellezzetler"],
      sourceLibrary: "Kütüphaneden: “Facebook Topluluk Şablonu”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Meta Girişi Yapın",
        desc: "Yönettiğiniz Facebook Sayfasını listeden seçip izinleri onaylayın.",
      },
      {
        step: "02",
        title: "İçeriklerinizi Planlayın",
        desc: "Tek seferde haftalık gönderi albümlerinizi takvime yerleştirin.",
      },
      {
        step: "03",
        title: "Doğrudan Sayfada Yayınlayın",
        desc: "Günü gününe, takipçilerinizin uyanık olduğu saatlerde otomatik yayın.",
      },
    ],
  },

  youtube: {
    slug: "youtube",
    name: "YouTube",
    categoryBadge: "Video & Shorts · YouTube",
    status: "active",
    statusLabel: "Resmi YouTube Data API v3",
    category: "video",
    headline: "Shorts ve videolarınızı tek tıkla kanalınıza yükleyin.",
    subhead:
      "YouTube Data API üzerinden gerçek dosya yüklemesi yapın. Arama dostu SEO başlıkları, merak uyandıran açıklamalar ve etiketleri otomatik hazırlayın.",
    connectCta: "YouTube'u Bağla",
    shortDesc: "YouTube Shorts ve standart video yükleme & zamanlama.",
    formatSection: {
      badge: "VİDEO FORMATLARI",
      title: "Shorts ve Uzun Format Video Otomasyonu.",
      sub: "Kanalınızın büyümesini destekleyen dikey Shorts ve yatay video formatları.",
      cards: [
        {
          title: "YouTube Shorts",
          badge: "9:16 Dikey",
          desc: "Kanal abone sayısını hızla katlayan 60 saniyelik dikey Shorts içerikleri.",
          image: "/images/mock-data/orange-slices.jpg",
          ratio: "aspect-[9/16]",
        },
        {
          title: "Standart Video",
          badge: "16:9 Yatay",
          desc: "Tam ekran eğitim, inceleme veya podcast bölümleri için resmi API yüklemesi.",
          image: "/images/mock-data/iced-latte.jpg",
          ratio: "aspect-[16/9]",
        },
        {
          title: "Küçük Resim (Thumbnail)",
          badge: "1280x720",
          desc: "Tıklama oranını yükselten çarpıcı kapak görselleri ve kancalar.",
          image: "/images/mock-data/papaya-seeds.jpg",
          ratio: "aspect-video",
        },
      ],
    },
    featureSection: {
      badge: "YOUTUBE SEO",
      title: "Arama algoritması için tam optimize.",
      sub: "Video fikrinizden arama motorunda ilk sıralara çıkacak başlık, açıklama ve video etiketleri üretilir.",
      captionSample: "3 Dakikada Marka Dilinizi AI ile Eğitin | 2026 Sosyal Medya Otomasyon Rehberi",
      tagsSample: ["#yapayzeka", "#pazarlama", "#otomasyon", "#sosyalmedya"],
      sourceLibrary: "Kütüphaneden: “YouTube Büyüme Başlıkları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Google Hesabınızla Bağlanın",
        desc: "YouTube kanalınıza resmi Google API yetkisi tanımlayın.",
      },
      {
        step: "02",
        title: "Video Dosyasını Seçin",
        desc: "Dosyayı yükleyin; başlık, açıklama ve gizlilik ayarlarını belirleyin.",
      },
      {
        step: "03",
        title: "Otomatik Yayına Alın",
        desc: "Belirlediğiniz gün ve saatte YouTube kanalınızda canlıya geçsin.",
      },
    ],
  },

  threads: {
    slug: "threads",
    name: "Threads",
    categoryBadge: "Sohbet & Metin · Threads",
    status: "active",
    statusLabel: "Resmi Threads API",
    category: "social",
    headline: "Sohbet ritminde, anlık ve samimi paylaşımlar.",
    subhead:
      "Threads'in konuşma odaklı algoritmasına uygun kısa metinler, sorular ve görsel paylaşımları takviminizden otomatik yayınlayın.",
    connectCta: "Threads'i Bağla",
    shortDesc: "Topluluk için samimi metin ve görsel güncellemeleri.",
    formatSection: {
      badge: "METİN ODAKLI",
      title: "Kısa düşünceler, sorular ve görsel diziler.",
      sub: "Sosyal medyada viral tartışmalar başlatan samimi ve akıcı metin formatları.",
      cards: [
        {
          title: "Kısa Düşünce & Tartışma",
          badge: "500 Karakter",
          desc: "Topluluğu yoruma davet eden güncel soru ve gözlemler.",
          image: "/images/mock-data/iced-latte.jpg",
          ratio: "aspect-[4/3]",
        },
        {
          title: "Görselli Güncelleme",
          badge: "Tek Görsel",
          desc: "Düşüncenizi destekleyen yüksek çözünürlüklü estetik fotoğraf.",
          image: "/images/mock-data/fresh-pastry.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Video Paylaşımı",
          badge: "Kısa Klip",
          desc: "Hızlı sahne arkası anları veya ürün kullanım videoları.",
          image: "/images/mock-data/smoothie-jars.jpg",
          ratio: "aspect-[9/16]",
        },
      ],
    },
    featureSection: {
      badge: "SAMİMİ DİL",
      title: "Kurumsal havadan uzak, samimi.",
      sub: "Threads kullanıcıları aşırı cilalı metinleri sevmez; Tentamark doğal ve akıcı bir dil kullanır.",
      captionSample: "Yıllarca içerik takvimini Excel'de tuttuk. 2026'da hala Excel kullanan var mı gerçekten?",
      tagsSample: ["#threads", "#teknoloji", "#girisimcilik"],
      sourceLibrary: "Kütüphaneden: “Threads Sohbet Başlatıcılar”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Instagram/Threads Profilinizi Bağlayın",
        desc: "Resmi Meta Threads API ile tek tıkla entegre olun.",
      },
      {
        step: "02",
        title: "Akış Fikirlerini Takvime Ekleyin",
        desc: "Günün trendlerine uygun mikro metinleri zamanlayın.",
      },
      {
        step: "03",
        title: "Otomatik Paylaşın",
        desc: "Threads akışında takipçilerinizle anlık etkileşime başlayın.",
      },
    ],
  },

  x: {
    slug: "x",
    name: "X (Twitter)",
    categoryBadge: "Gerçek Zamanlı Ağ · X",
    status: "active",
    statusLabel: "Resmi X API v2",
    category: "social",
    headline: "Zincir gönderiler ve kancalarla etkileşimi katlayın.",
    subhead:
      "Tekli tweet'ler, kancalı zincir gönderiler (threads) ve medya içeriklerini en yoğun etkileşim saatlerinde otomatik yayınlayın.",
    connectCta: "X'i Bağla",
    shortDesc: "Gönderi zincirleri (threads) ve hızlı güncellemeler.",
    formatSection: {
      badge: "X FORMATLARI",
      title: "Gönderiler, Zincirler ve Görsel Kartlar.",
      sub: "Karakter limitlerine takılmadan fikirlerinizi derinlemesine anlatan zincir kurguları.",
      cards: [
        {
          title: "Zincir Gönderi (Thread)",
          badge: "1-10 Tweet",
          desc: "Adım adım rehberler ve sektör analizleri için otomatik ardışık tweet dizisi.",
          image: "/images/mock-data/papaya-seeds.jpg",
          ratio: "aspect-[4/3]",
        },
        {
          title: "Kancalı Tek Tweet",
          badge: "280 Karakter",
          desc: "Geri dönüş ve retweet oranını artıran net ve vurucu tekil tweet'ler.",
          image: "/images/mock-data/pink-lemons.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Medya Kartı",
          badge: "Görsel / Video",
          desc: "Akışta kaydırmayı durduran yüksek kontrastlı infografik ve görseller.",
          image: "/images/mock-data/pineapple-summer.jpg",
          ratio: "aspect-[16/9]",
        },
      ],
    },
    featureSection: {
      badge: "ZİNCİR YÖNETİMİ",
      title: "Kullanıcıyı sonuna kadar okutan kurgular.",
      sub: "AI Asistanı, her zincirin ilk tweet'ine güçlü bir merak unsuru yerleştirir.",
      captionSample: "Sıfırdan 100K takipçiye ulaşırken öğrendiğim en büyük 5 ders (3. madde her şeyi değiştirdi) 🧵👇",
      tagsSample: ["#pazarlama", "#strateji", "#büyüme"],
      sourceLibrary: "Kütüphaneden: “X Viral Kancaları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "X Hesabınızı Yetkilendirin",
        desc: "Resmi OAuth 2.0 ile hesabınızı güvenli şekilde bağlayın.",
      },
      {
        step: "02",
        title: "Zincir Taslaklarını Oluşturun",
        desc: "AI'ın ürettiği zinciri inceleyin, görselleri iliştirin.",
      },
      {
        step: "03",
        title: "Doğru Saatte Yayınlayın",
        desc: "Gündemin en sıcak olduğu dakikalarda otonom gönderim.",
      },
    ],
  },

  pinterest: {
    slug: "pinterest",
    name: "Pinterest",
    categoryBadge: "Görsel Arama Motoru · Pinterest",
    status: "active",
    statusLabel: "Resmi Pinterest API v5",
    category: "social",
    headline: "Panolarınıza doğru Pin'leri otomatik zamanlayın.",
    subhead:
      "Trafik çeken dikey Pin'leri ilgili panolara zamanlayın. E-ticaret sitenize ve blogunuza kalıcı organik ziyaretçi akışı sağlayın.",
    connectCta: "Pinterest'i Bağla",
    shortDesc: "Panolara hedefli Pin ve görsel zamanlama.",
    formatSection: {
      badge: "PİN FORMATLARI",
      title: "2:3 Dikey Pinler ve Ürün Bağlantıları.",
      sub: "Pinterest'in arama algoritmasında öne çıkan dikey görsel standartları.",
      cards: [
        {
          title: "Standart Dikey Pin",
          badge: "2:3 Format",
          desc: "Arama sonuçlarında en çok tıklanan ideal 1000x1500 dikey Pin ölçüsü.",
          image: "/images/mock-data/smoothie-jars.jpg",
          ratio: "aspect-[2/3]",
        },
        {
          title: "Ürün ve Tarif Pini",
          badge: "Zengin Pin",
          desc: "Doğrudan web sitenize yönlendiren hedef bağlantılı zengin Pin'ler.",
          image: "/images/mock-data/acai-bowl.jpg",
          ratio: "aspect-[4/5]",
        },
        {
          title: "Video Pin",
          badge: "Dikey Video",
          desc: "Panolarda otomatik oynayan hareketli tanıtım ve yapım videoları.",
          image: "/images/mock-data/orange-slices.jpg",
          ratio: "aspect-[9/16]",
        },
      ],
    },
    featureSection: {
      badge: "ORGANİK TRAFİK",
      title: "Aylar boyu süren ziyaretçi akışı.",
      sub: "Diğer sosyal ağlarda içerik 24 saatte ölürken, Pinterest'te doğru anahtar kelimelerle aylar boyu tıklama almaya devam eder.",
      captionSample: "Sabahları Enerjinizi Yükseltecek 5 Kolay Smoothie Tarifi | Evde Yapabileceğiniz Detoks İpuçları",
      tagsSample: ["#smoothietarifleri", "#sagliklibeslenme", "#kahvalti", "#detoks"],
      sourceLibrary: "Kütüphaneden: “Pinterest SEO Başlıkları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "İşletme Hesabınızı Bağlayın",
        desc: "Pinterest Business hesabınızı ve panolarınızı senkronize edin.",
      },
      {
        step: "02",
        title: "Panoları Seçin & Pinleri Diz",
        desc: "Her görsel için doğru panoyu ve hedef web sitesi URL'sini belirleyin.",
      },
      {
        step: "03",
        title: "Düzenli Olarak Pinleyin",
        desc: "Günde 3-5 Pin paylaşarak algoritmanın sizi öne çıkarmasını sağlayın.",
      },
    ],
  },

  telegram: {
    slug: "telegram",
    name: "Telegram",
    categoryBadge: "Topluluk & Kanal · Telegram",
    status: "active",
    statusLabel: "Resmi Bot API",
    category: "messaging",
    headline: "Topluluk kanallarınıza anında içerik yayını.",
    subhead:
      "Telegram kanallarınıza duyuruları, bültenleri ve medya dosyalarını tek tıkla iletin. VIP topluluklarınızı güncel tutun.",
    connectCta: "Telegram'ı Bağla",
    shortDesc: "Kanallara doğrudan duyuru ve medya iletimi.",
    formatSection: {
      badge: "KANAL FORMATLARI",
      title: "Medya bültenleri, butonlar ve duyurular.",
      sub: "Kanal üyelerinizin bildirim ekranında dikkat çeken temiz formatlama.",
      cards: [
        {
          title: "Resimli Kanal Duyurusu",
          badge: "Görsel + Metin",
          desc: "Görsel altında formatlanmış kalın ve italik zengin metin duyuruları.",
          image: "/images/mock-data/grapefruit-citrus.jpg",
          ratio: "aspect-[4/3]",
        },
        {
          title: "Hızlı Haber & Analiz",
          badge: "Zengin Metin",
          desc: "Son dakika gelişmeleri ve piyasa yorumları için formatlanmış metin.",
          image: "/images/mock-data/iced-latte.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Video ve Belge Paylaşımı",
          badge: "Dosya Gönderimi",
          desc: "Yüksek boyutlu videolar ve rapor dokümanları için kesintisiz iletim.",
          image: "/images/mock-data/fresh-pastry.jpg",
          ratio: "aspect-[16/9]",
        },
      ],
    },
    featureSection: {
      badge: "ANINDA İLETİM",
      title: "Sıfır algoritma engeli, %100 doğrudan erişim.",
      sub: "Telegram'da paylaştığınız her içerik abonelerinize doğrudan bildirim olarak düşer.",
      captionSample: "🚀 Haftalık bültenimiz yayında! Bu hafta pazarlama otomasyonunda öne çıkan 3 yenilik ve araç incelemesi...",
      tagsSample: ["#duyuru", "#bülten", "#gündem"],
      sourceLibrary: "Kütüphaneden: “Telegram Kanal Duyuruları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Telegram Botunu Kanalınıza Ekleyin",
        desc: "Tentamark resmi yayın botunu kanalınıza yönetici olarak atayın.",
      },
      {
        step: "02",
        title: "Yayın Saatlerinizi Belirleyin",
        desc: "Takvimden Telegram kanalınızı seçerek içerikleri sıralayın.",
      },
      {
        step: "03",
        title: "Abonelerinize Ulaşın",
        desc: "Gecikme olmadan, tam vaktinde üyelerinizin telefonuna bildirim gitsin.",
      },
    ],
  },

  bluesky: {
    slug: "bluesky",
    name: "Bluesky",
    categoryBadge: "Merkeziyetsiz Ağ · Bluesky",
    status: "active",
    statusLabel: "Resmi AT Protocol",
    category: "social",
    headline: "Açık ve merkeziyetsiz sosyal ağda yerinizi alın.",
    subhead:
      "AT Protocol altyapısıyla Bluesky'da organik kitlenizi oluşturun. 300 karakterlik samimi güncellemeleri, görselleri ve tartışma dizilerini doğrudan yayınlayın.",
    connectCta: "Bluesky'ı Bağla",
    shortDesc: "Açık sosyal ağda samimi metin, görsel ve tartışma dizileri.",
    formatSection: {
      badge: "AÇIK AĞ FORMATLARI",
      title: "Skeet'ler, fotoğraf dizileri ve tartışmalar.",
      sub: "Bluesky'ın açık besleme algoritmasına tam uyumlu, şeffaf ve organik içerik akışı.",
      cards: [
        {
          title: "Kısa Gönderi (Skeet)",
          badge: "300 Karakter",
          desc: "Akışta hızla yayılan samimi, açık ve tartışma başlatan kısa metinler.",
          image: "/images/mock-data/pink-lemons.jpg",
          ratio: "aspect-[4/3]",
        },
        {
          title: "Görsel Albümü",
          badge: "4 Görsele Kadar",
          desc: "Akışı canlandıran yüksek çözünürlüklü estetik fotoğraf dizileri.",
          image: "/images/mock-data/acai-bowl.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Özel Besleme (Custom Feed)",
          badge: "AT Protocol",
          desc: "Topluluk tarafından oluşturulan niş besleme listelerinde öne çıkma.",
          image: "/images/mock-data/iced-latte.jpg",
          ratio: "aspect-[16/9]",
        },
      ],
    },
    featureSection: {
      badge: "ORGANİK ERİŞİM",
      title: "Algoritmasız, saf topluluk iletişimi.",
      sub: "Bluesky'da etkileşim yapay kısıtlamalara takılmaz; takipçileriniz paylaştığınız her gönderiyi kronolojik akışta görür.",
      captionSample: "Sosyal medyada açık protokol dönemi başladı. Tentamark ile Bluesky akışınız her zaman canlı ve tutarlı 🦋",
      tagsSample: ["#bluesky", "#atprotocol", "#tech", "#socialmedia"],
      sourceLibrary: "Kütüphaneden: “Bluesky Topluluk Şablonları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Bluesky Handle ile Giriş Yapın",
        desc: "Hesap adınız ve uygulama şifrenizle (App Password) güvenli bağlantı kurun.",
      },
      {
        step: "02",
        title: "Gönderilerinizi Takvime Diz",
        desc: "Diğer sosyal ağlarla eşzamanlı olarak içeriklerinizi sıralayın.",
      },
      {
        step: "03",
        title: "Merkeziyetsiz Ağa Yayınlayın",
        desc: "Zamanı geldiğinde AT Protocol ağına anında iletilsin.",
      },
    ],
  },

  woocommerce: {
    slug: "woocommerce",
    name: "WooCommerce",
    categoryBadge: "E-Ticaret & Katalog · WooCommerce",
    status: "active",
    statusLabel: "Resmi REST API v3",
    category: "social",
    headline: "Yeni ürünleriniz otomatik olarak sosyal medya gönderilerine dönüşsün.",
    subhead:
      "WooCommerce mağazanızdaki yeni ürünleri, indirimleri ve stok güncellemelerini anında Instagram, Facebook ve TikTok için çarpıcı vitrin gönderilerine dönüştürün.",
    connectCta: "Mağazanızı Bağlayın",
    shortDesc: "Yeni ürünleri otomatik olarak sosyal medya kampanyalarına dönüştürün.",
    formatSection: {
      badge: "E-TİCARET FORMATLARI",
      title: "Ürün vitrinleri, indirim karuselleri ve fırsatlar.",
      sub: "Mağazanızdaki ürün fotoğraflarını ve fiyat etiketlerini sosyal medya satış makinelerine çevirin.",
      cards: [
        {
          title: "Ürün Lansman Gönderisi",
          badge: "Fiyat + Görsel",
          desc: "Mağazaya yeni eklenen ürünün fotoğrafı, fiyatı ve satın alma linkiyle otomatik paylaşım.",
          image: "/images/mock-data/fresh-pastry.jpg",
          ratio: "aspect-square",
        },
        {
          title: "İndirim Karuseli",
          badge: "Çoklu Ürün",
          desc: "Sezon indirimine giren ürünleri tek karuselde toplayan görsel albüm.",
          image: "/images/mock-data/orange-slices.jpg",
          ratio: "aspect-[4/5]",
        },
        {
          title: "Stok Bildirimi",
          badge: "FOMO Kancası",
          desc: "Yeniden stoklara giren popüler ürünler için aciliyet hissi oluşturan bildirim gönderisi.",
          image: "/images/mock-data/pineapple-summer.jpg",
          ratio: "aspect-[4/3]",
        },
      ],
    },
    featureSection: {
      badge: "OTOMATİK DÖNÜŞÜM",
      title: "Ürün açıklamasından viral sosyal medya metnine.",
      sub: "Yapay zeka, WooCommerce ürün başlığını ve detaylarını okur; doğrudan satın almaya yönlendiren dikkat çekici kancalar yazar.",
      captionSample: "🔥 Çok beklenen lezzet stoklara geri döndü! Sınırlı sayıda kavanoz için profildeki linke hemen tıklayın. Ücretsiz kargo fırsatıyla!",
      tagsSample: ["#eticaret", "#yenisezon", "#fırsat", "#onlinealisveris"],
      sourceLibrary: "Kütüphaneden: “WooCommerce Satış Kancaları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "WooCommerce API Anahtarlarını Girin",
        desc: "WordPress panelinizden Consumer Key ve Secret bilgilerinizi güvenle ekleyin.",
      },
      {
        step: "02",
        title: "Otomatik Paylaşım Kurallarını Seçin",
        desc: "'Yeni ürün eklendiğinde' veya 'Fiyat düştüğünde' otomatik taslak oluşturulsun.",
      },
      {
        step: "03",
        title: "Satışlarınızı Katlayın",
        desc: "Onaylanan ürün gönderileri tüm bağlı sosyal ağlarınızda eşzamanlı yayınlansın.",
      },
    ],
  },
  shopify: {
    slug: "shopify",
    name: "Shopify",
    categoryBadge: "E-Ticaret · Shopify",
    status: "active",
    statusLabel: "Shopify Admin API v2026",
    category: "social",
    headline: "Mağazanızdaki ürünleri otonom içeriklere dönüştürün.",
    subhead:
      "Shopify mağazanızı bağlayın; yeni koleksiyonlar, indirimler ve çok satan ürünler yapay zeka ile Instagram, TikTok ve Pinterest gönderilerine anında dönüştürülsün.",
    connectCta: "Shopify Mağazasını Bağla",
    shortDesc: "Ürün kataloğu, indirim duyuruları ve otomatik vitrin paylaşımları.",
    formatSection: {
      badge: "E-TİCARET FORMATLARI",
      title: "Ürün vitrinleri, koleksiyon albümleri ve indirim kartları.",
      sub: "Shopify mağazanızdaki ürün fotoğraflarını ve fiyat etiketlerini sosyal medya satış makinelerine çevirin.",
      cards: [
        {
          title: "Ürün Vitrini & Fiyat Etiketi",
          badge: "Fiyat + Stok",
          desc: "Mağazaya yeni eklenen ürünün fotoğrafı, fiyatı ve satın alma linkiyle otomatik paylaşım.",
          image: "/images/mock-data/fresh-pastry.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Yeni Koleksiyon Lansmanı",
          badge: "Koleksiyon Karuseli",
          desc: "Yeni sezona giren ürünleri tek albümde toplayan çok kanallı görsel karusel.",
          image: "/images/mock-data/pineapple-summer.jpg",
          ratio: "aspect-[4/5]",
        },
        {
          title: "Flaş İndirim Duyurusu",
          badge: "Aciliyet & FOMO",
          desc: "Fiyatı düşen ürünler için aciliyet hissi oluşturan bildirim ve story formatı.",
          image: "/images/mock-data/orange-slices.jpg",
          ratio: "aspect-[4/3]",
        },
      ],
    },
    featureSection: {
      badge: "KATALOG SENKRONİZASYONU",
      title: "Ürün açıklamasından satın almaya yönlendiren kancaya.",
      sub: "Yapay zeka, Shopify ürün başlığını ve detaylarını okur; doğrudan satın almaya yönlendiren dikkat çekici kancalar yazar.",
      captionSample:
        "🥐 Taze fırından yeni çıktı! Sınırlı sayıda üretilen Fransız kruvasan paketimiz Shopify mağazamızda yayında. İlk siparişinize özel TENTA10 koduyla sepette %10 indirim fırsatını kaçırmayın.",
      tagsSample: ["#shopify", "#eticaret", "#yenisezon", "#kampanya", "#onlinealisveris"],
      sourceLibrary: "Kütüphaneden: “Shopify E-Ticaret Satış Kancaları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Shopify Mağazanızı Bağlayın",
        desc: "Shopify mağaza URL'nizi girip Tentamark App ile güvenli OAuth yetkilendirmesi verin.",
      },
      {
        step: "02",
        title: "Koleksiyon ve Stok Kurallarını Belirleyin",
        desc: "'Yeni ürün eklendiğinde' veya 'Stok kritik seviyeye indiğinde' otomatik taslaklar hazırlansın.",
      },
      {
        step: "03",
        title: "Sosyal Satışlarınızı Otomatikleştirin",
        desc: "Onaylanan ürün içerikleri Instagram, TikTok ve Pinterest hesaplarınızda anında yayınlansın.",
      },
    ],
  },
  "google-business": {
    slug: "google-business",
    name: "Google Business Profile",
    categoryBadge: "Yerel Arama · Google İşletme",
    status: "active",
    statusLabel: "Google My Business API",
    category: "social",
    headline: "Haritalarda ve aramada yerel müşterilerinizi yakalayın.",
    subhead:
      "Haftalık işletme güncellemelerinizi, çalışma saatlerinizi ve özel tekliflerinizi doğrudan Google Haritalar profilinize otomatik olarak yayınlayın.",
    connectCta: "Google İşletme Profilini Bağla",
    shortDesc: "Google Haritalar ve Yerel Arama için haftalık güncellemeler ve teklifler.",
    formatSection: {
      badge: "YEREL ARAMA FORMATLARI",
      title: "Haftalık güncellemeler, özel teklifler ve etkinlikler.",
      sub: "Google Arama ve Haritalar'da üst sıralara çıkaran düzenli işletme yayınları.",
      cards: [
        {
          title: "Haftalık İşletme Güncellemesi",
          badge: "Haritalar Gönderisi",
          desc: "Kafe, klinik veya mağazanızdaki haftalık menü veya hizmet yenilikleri.",
          image: "/images/mock-data/acai-bowl.jpg",
          ratio: "aspect-[4/3]",
        },
        {
          title: "Özel Teklif & İndirim Kuponu",
          badge: "Kupon Kodu",
          desc: "Google Haritalar kullanıcılarına özel geçerlilik tarihi olan indirim duyuruları.",
          image: "/images/mock-data/grapefruit-citrus.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Etkinlik & Çalışma Saati",
          badge: "Lokasyon Duyurusu",
          desc: "Tatil çalışma saatleri, tadilat veya özel etkinlik duyurusu.",
          image: "/images/mock-data/iced-latte.jpg",
          ratio: "aspect-[16/9]",
        },
      ],
    },
    featureSection: {
      badge: "YEREL SEO GÜCÜ",
      title: "Haritalarda arayan müşterileri kapınıza getirin.",
      sub: "Yapay zeka, yerel arama kelimelerini kullanarak Google Haritalar profilinizde otorite inşa eden güncellemeler üretir.",
      captionSample:
        "🍓 Güne taze bir başlangıç yapın! Bugün kafemizde taze orman meyveleri ve chia tohumlu Acai Bowl servisimiz başladı. Konumumuza gelin veya paket servis siparişi verin.",
      tagsSample: ["#googlebusiness", "#yerelisletme", "#haritalar", "#kafe", "#sehirrehberi"],
      sourceLibrary: "Kütüphaneden: “Google Yerel SEO & Arama Kancaları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Google Hesabınızla Giriş Yapın",
        desc: "Google İşletme Profilinizin bağlı olduğu Google hesabını tek tıkla bağlayın.",
      },
      {
        step: "02",
        title: "Lokasyonunuzu Seçin",
        desc: "Yönetmek istediğiniz işletme şubesini veya birden fazla lokasyonu seçin.",
      },
      {
        step: "03",
        title: "Haftalık Yerel Akışı Başlatın",
        desc: "Haftalık fotoğraflı güncellemeler otomatik yayınlansın, yerel sıralamanız yükselsin.",
      },
    ],
  },
  discord: {
    slug: "discord",
    name: "Discord",
    categoryBadge: "Topluluk · Discord",
    status: "active",
    statusLabel: "Discord Webhook & Bot API",
    category: "messaging",
    headline: "Topluluğunuza doğrudan duyuru kanallarından seslenin.",
    subhead:
      "Discord sunucunuzdaki duyuru, güncelleme ve etkinlik kanallarına zengin embed ve görsel formatında otonom içerik gönderin.",
    connectCta: "Discord Sunucusunu Bağla",
    shortDesc: "Topluluk sunucuları, zengin embed duyuruları ve anlık etkinlik bildirimleri.",
    formatSection: {
      badge: "TOPLULUK FORMATLARI",
      title: "Zengin embed duyuruları, etkinlikler ve sürüm notları.",
      sub: "Discord sunucunuzdaki binlerce üyeye profesyonel bot mesajlarıyla ulaşın.",
      cards: [
        {
          title: "Zengin Embed Duyurusu",
          badge: "Embed Kartı",
          desc: "Başlık, açıklama, renk çubuğu ve görsel içeren şık sunucu duyuruları.",
          image: "/images/mock-data/iced-latte.jpg",
          ratio: "aspect-[16/9]",
        },
        {
          title: "Topluluk Etkinliği",
          badge: "Etkinlik & Soru",
          desc: "Üyelerin etkileşimini artıran soru-cevap ve canlı yayın hatırlatmaları.",
          image: "/images/mock-data/smoothie-jars.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Sürüm Notları (Changelog)",
          badge: "Ürün Güncellemesi",
          desc: "Ürün ve hizmet güncellemelerini yazılımcı ve topluluk dostu dilde iletin.",
          image: "/images/mock-data/orange-slices.jpg",
          ratio: "aspect-[4/3]",
        },
      ],
    },
    featureSection: {
      badge: "SUNUCU ETKİLEŞİMİ",
      title: "Aktif ve canlı bir Discord topluluğu.",
      sub: "Yapay zeka, topluluk dilinize uygun samimi duyurular yazar; rol etiketleri (@everyone, @here) ile üyelerinizi bilgilendirir.",
      captionSample:
        "📢 @everyone Tentamark v2.4 yayında! Bu sürümle birlikte Shopify ve WooCommerce e-ticaret otomasyonu tam erişime açıldı. Görüşlerinizi ve sorularınızı #feedback kanalında bekliyoruz! 🎉",
      tagsSample: ["#discord", "#topluluk", "#changelog", "#web3", "#duyuru"],
      sourceLibrary: "Kütüphaneden: “Discord Topluluk & Bot Duyuruları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Webhook URL'sini Ekleyin",
        desc: "Sunucu ayarlarınızdan duyuru kanalının Webhook bağlantısını tek tıkla yapıştırın.",
      },
      {
        step: "02",
        title: "Rol Etiketlerini ve Rengi Seçin",
        desc: "Hangi gönderide hangi rolün etiketleneceğini ve embed rengini belirleyin.",
      },
      {
        step: "03",
        title: "Otomasyonu Başlatın",
        desc: "Onaylanan duyurular saniyesinde sunucu kanalınıza zengin formatta düşsün.",
      },
    ],
  },
  whatsapp: {
    slug: "whatsapp",
    name: "WhatsApp Business",
    categoryBadge: "Mesajlaşma · WhatsApp",
    status: "active",
    statusLabel: "WhatsApp Cloud API",
    category: "messaging",
    headline: "Müşterilerinizin en aktif olduğu ekranda yer alın.",
    subhead:
      "WhatsApp Business Kanalı veya onaylı şablon mesajları ile yeni ürünleri, duyuruları ve sadakat kampanyalarını doğrudan müşterinizin eline ulaştırın.",
    connectCta: "WhatsApp Business'ı Bağla",
    shortDesc: "WhatsApp Kanalları ve onaylı şablonlarla doğrudan müşteri iletişimi.",
    formatSection: {
      badge: "MESAJLAŞMA FORMATLARI",
      title: "Kanal duyuruları, görsel kartlar ve hızlı butonlar.",
      sub: "Müşterinizin bildirim çubuğunda dikkat çeken profesyonel WhatsApp formatları.",
      cards: [
        {
          title: "WhatsApp Kanal Güncellemesi",
          badge: "Kanal Bülteni",
          desc: "WhatsApp kanalınızdaki takipçilere doğrudan ulaşan fotoğraflı bülten.",
          image: "/images/mock-data/fresh-pastry.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Görselli Kampanya Kartı",
          badge: "Özel İndirim",
          desc: "VIP müşteri gruplarına özel görsel ve kişiselleştirilmiş kampanya metni.",
          image: "/images/mock-data/pink-lemons.jpg",
          ratio: "aspect-[4/5]",
        },
        {
          title: "Etkileşimli Butonlu Mesaj",
          badge: "Tek Tıkla Sipariş",
          desc: "'Siparişi Tamamla' veya 'Canlı Destek' butonlu resmi onaylı mesaj.",
          image: "/images/mock-data/pineapple-summer.jpg",
          ratio: "aspect-[16/9]",
        },
      ],
    },
    featureSection: {
      badge: "BİREBİR DÖNÜŞÜM",
      title: "En yüksek açılma oranına sahip doğrudan kanal.",
      sub: "%98 açılma oranıyla WhatsApp, e-posta bültenlerinin 5 katı etkileşim sağlar. Yapay zeka ile spam yapmadan, samimi ve değerli mesajlar üretin.",
      captionSample:
        "Merhaba! ✨ Sadakat kulübümüze özel bu hafta sonu geçerli %20 indirim kodunuz: TENTA20. Taze fırın ürünlerinde geçerlidir. Hemen menüyü incelemek için aşağıdaki butona dokunun! 🥖",
      tagsSample: ["#whatsapp", "#whatsappbusiness", "#vipkampanya", "#musteriiletisimi"],
      sourceLibrary: "Kütüphaneden: “WhatsApp Business Sadakat & Satış Şablonları”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Meta WhatsApp Hesabınızı Bağlayın",
        desc: "Meta Business Manager üzerinden telefon numaranızı ve Cloud API'yi yetkilendirin.",
      },
      {
        step: "02",
        title: "Kanalınızı veya Şablonları Seçin",
        desc: "Yayın kanalı mı yoksa onaylı şablon mesajları mı kullanacağınızı belirleyin.",
      },
      {
        step: "03",
        title: "Değerli İçerikler Gönderin",
        desc: "Müşterilerinizin telefonuna değer katan, doğrudan satış getiren mesajlar ulaştırın.",
      },
    ],
  },
  canva: {
    slug: "canva",
    name: "Canva",
    categoryBadge: "Tasarım & Kreatif · Canva",
    status: "active",
    statusLabel: "Resmi Canva Connect API",
    category: "creative",
    headline: "Yapay zeka fikirlerinizi tek tıkla Canva şablonlarına aktarın.",
    subhead:
      "Tentamark'ın ürettiği marka odaklı görsel konseptleri ve metinleri doğrudan Canva hesabınıza aktarın; kurumsal renkleriniz ve tipografinizle dilediğiniz gibi özelleştirin.",
    connectCta: "Canva ile Bağlan",
    shortDesc: "AI görsel ve içerik taslaklarını tek tıkla Canva şablonlarına aktarın.",
    formatSection: {
      badge: "KREATİF FORMATLAR",
      title: "Sosyal medya gönderisi, hikaye ve afiş şablonları.",
      sub: "Tentamark'ın oluşturduğu konseptler Canva'da tam boyutlu ve katmanları düzenlenebilir şablonlara dönüşür.",
      cards: [
        {
          title: "Kare Gönderi Şablonu",
          badge: "1:1 Instagram / Feed",
          desc: "Kurumsal renk paletiniz ve logonuz otomatik yerleştirilmiş kare tuval şablonu.",
          image: "/images/mock-data/fresh-pastry.jpg",
          ratio: "aspect-square",
        },
        {
          title: "Dikey Hikaye & Reels Kapağı",
          badge: "9:16 Hikaye / Dikey",
          desc: "Metin hiyerarşisi hazır, tipografisi ve fotoğraf alanı ayarlanmış dikey şablon.",
          image: "/images/mock-data/orange-slices.jpg",
          ratio: "aspect-[9/16]",
        },
        {
          title: "B2B Karusel Slayt Seti",
          badge: "Çoklu Sayfa",
          desc: "LinkedIn veya Instagram için 5-10 slaytlık kurumsal karusel şablon seti.",
          image: "/images/mock-data/acai-bowl.jpg",
          ratio: "aspect-[4/5]",
        },
      ],
    },
    featureSection: {
      badge: "CANVA CONNECT API",
      title: "Stüdyo kalitesinde tasarım özgürlüğü.",
      sub: "AI tarafından üretilen fikirleri Canva'nın zengin tasarım kütüphanesiyle birleştirin. Tasarımcıya ihtiyaç duymadan dakikalar içinde yayına hazır hale getirin.",
      captionSample:
        "✨ Haftalık menü lansman konsepti Canva'ya aktarıldı. 3 farklı şablon boyutu ve marka renk paleti otomatik olarak hazırlandı.",
      tagsSample: ["#canva", "#canvadesign", "#brandkit", "#grafiktasarim", "#sosyalmedyatasarim"],
      sourceLibrary: "Kütüphaneden: “Canva Kurumsal Sosyal Medya Kiti”",
    },
    setupSteps: [
      {
        step: "01",
        title: "Canva Hesabınızı Bağlayın",
        desc: "Resmi Canva Connect OAuth ile Canva Pro veya Ücretsiz hesabınızı tek tıkla yetkilendirin.",
      },
      {
        step: "02",
        title: "Marka Kitinizi Eşitleyin",
        desc: "Tentamark Brand DNA renkleriniz, yazı tipleriniz ve logonuz Canva marka kitinizle anında eşleşsin.",
      },
      {
        step: "03",
        title: "Tek Tıkla Canva'da Düzenleyin",
        desc: "Onayladığınız içeriklerin görsellerini dilediğiniz an Canva arayüzünde açıp son dokunuşları yapın.",
      },
    ],
  },
};
