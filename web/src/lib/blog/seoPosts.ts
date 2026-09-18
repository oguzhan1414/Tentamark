import type { BlogPost } from "./blogTypes";

const author = {
  name: "Tentamark İçerik Ekibi",
  role: "Pazarlama Rehberleri",
  avatar: "/brand/tentamark-mark.svg",
};

export const SEO_POSTS: BlogPost[] = [
  {
    id: 28,
    slug: "kucuk-isletmeler-icin-sosyal-medya-yonetimi",
    title: "Küçük İşletmeler İçin Sosyal Medya Yönetimi: Uygulanabilir Başlangıç Planı",
    subtitle: "Sınırlı zaman ve bütçeyle hangi kanala, içeriğe ve metriğe odaklanmalısınız?",
    excerpt: "Küçük işletmeler için sosyal medya yönetimini hedef, kanal, içerik takvimi, onay ve ölçüm adımlarına ayıran pratik bir rehber.",
    question: "Küçük işletmeler sosyal medya yönetimine nasıl başlamalı?",
    shortAnswer: "Önce tek bir iş hedefi ve müşterilerin kullandığı bir veya iki kanal seçin. Haftalık içerik takvimini müşteri soruları, ürün kanıtı ve açık bir sonraki adım etrafında kurun. Her hafta bağlantı tıklaması veya talep gibi iş sonuçlarını ölçüp planı güncelleyin.",
    category: "strateji-planlama",
    categoryLabel: "Strateji & Planlama",
    readingTime: 6,
    publishedAt: "19 Eylül 2026",
    author,
    coverImage: "/blog/10/Marketing_team_planning_content_20260917182622.jpeg",
    images: [],
    tags: ["küçük işletme sosyal medya yönetimi", "sosyal medya planı", "içerik takvimi"],
    tableOfContents: [
      { id: "hedef", title: "Önce tek bir iş hedefi seçin" },
      { id: "kanal", title: "Kanal seçimini müşteriye göre yapın" },
      { id: "takvim", title: "Haftalık içerik takvimi kurun" },
      { id: "olcum", title: "Sonuçları ve iş yükünü ölçün" },
    ],
    sections: [
      {
        id: "hedef",
        title: "Önce tek bir iş hedefi seçin",
        paragraphs: [
          "Sosyal medyada düzenli paylaşım yapmak tek başına iş hedefi değildir. Bir kafe için hafta içi masa rezervasyonu, bir danışman için nitelikli görüşme talebi, bir e-ticaret markası için ürün sayfası ziyareti daha anlamlı hedefler olabilir. İlk ay bir ana hedef seçin ve her içeriğin bu hedefe nasıl hizmet ettiğini yazın.",
          "Hedefi ölçülebilir hale getirin: örneğin sosyal medya bağlantısından gelen rezervasyon veya iletişim formu gönderimi. Platformun gösterdiği erişim ve beğeni sayıları yararlıdır, fakat satışa giden davranışı tek başına göstermez.",
        ],
        callout: { type: "checklist", title: "Başlamadan önce", items: ["Tek bir müşteri grubu tanımlayın.", "Bir ana iş hedefi seçin.", "Bu hedefi ölçen bağlantı veya formu hazırlayın."] },
      },
      {
        id: "kanal",
        title: "Kanal seçimini müşteriye göre yapın",
        paragraphs: [
          "Her platformda hesap açmak zorunda değilsiniz. Müşterilerinizin ürün araştırdığı ve size soru sorduğu bir veya iki kanalla başlayın. Görsel ürünü olan yerel işletmeler için Instagram anlamlı olabilir; uzmanlık satan bir danışman için LinkedIn daha uygun olabilir. Seçimi alışkanlıklara göre yapın, popülerliğe göre değil.",
          "Seçtiğiniz kanalın içerik formatını ve üretim maliyetini hesaba katın. Haftada üç video üretemiyorsanız video ağırlıklı bir program vaat etmeyin. Düzenli sürdürülebilen bir plan, kısa süreli yoğun bir yayın akışından daha değerlidir.",
        ],
      },
      {
        id: "takvim",
        title: "Haftalık içerik takvimi kurun",
        paragraphs: [
          "Takvimi üç içerik göreviyle doldurun: müşterinin sorusunu cevaplayan öğretici içerik, ürün veya hizmetin kullanımını gösteren kanıt, açık bir sonraki adım sunan teklif. Her gönderi için konu, hedef kitle, format, sorumlu kişi, onay tarihi ve yayın tarihi belirleyin.",
          "Örneğin bir kafe pazartesi çekirdek seçimini anlatabilir, çarşamba hazırlık sürecinden kısa bir video paylaşabilir, cuma ise hafta sonu rezervasyon bağlantısını gösterebilir. Aynı fikri farklı kanallara taşıyacaksanız başlığı, görsel oranını ve çağrıyı platforma göre düzenleyin.",
          "Taslakları toplu hazırlayıp yayın öncesi kontrol etmek zaman kazandırır. Tentamark'ın marka bilgisi, içerik planlama ve insan onayı akışı bu süreci tek yerde toplamak için tasarlanmıştır; hangi yayın bağlantılarının kullanılabildiğini ürün içinden ayrıca kontrol edin.",
        ],
      },
      {
        id: "olcum",
        title: "Sonuçları ve iş yükünü ölçün",
        paragraphs: [
          "Her hafta aynı gün kısa bir değerlendirme yapın. Kaç içerik planlandı ve yayımlandı? Hangi içerik kaydetme, bağlantı tıklaması veya görüşme talebi üretti? Üretim ve onay kaç saat aldı? Az veriyle kesin hükümler vermek yerine birkaç haftalık eğilime bakın.",
          "Bir format sonuç üretmiyorsa hemen kanalı terk etmeyin. Önce konu, açılış cümlesi, görsel ve çağrıyı ayrı ayrı değiştirin. Bir sonraki ayın takvimini en çok iş sonucu getiren soru ve örneklerden oluşturun.",
        ],
      },
    ],
  },
  {
    id: 29,
    slug: "sosyal-medya-gonderi-onay-sureci",
    title: "Sosyal Medya Gönderi Onay Süreci Nasıl Kurulur?",
    subtitle: "Taslakların kaybolmadığı, düzeltmelerin izlendiği basit bir ekip akışı.",
    excerpt: "Sosyal medya içerik onay sürecini roller, kontrol listesi ve yayın takvimiyle kurmak için adım adım rehber.",
    question: "Sosyal medya gönderi onay süreci nasıl kurulur?",
    shortAnswer: "Her gönderi için hazırlayan ve son onayı veren kişiyi belirleyin. İçeriği fikir, taslak, onay bekliyor ve yayına hazır aşamalarından geçirin. Son onayda metin, görsel, ürün iddiası, bağlantı ve yayın tarihini kontrol edin.",
    category: "strateji-planlama",
    categoryLabel: "Strateji & Planlama",
    readingTime: 5,
    publishedAt: "19 Eylül 2026",
    author,
    coverImage: "/blog/10/Planning_social_media_calendar_20260917182620.jpeg",
    images: [],
    tags: ["sosyal medya içerik onayı", "gönderi onay süreci", "içerik iş akışı"],
    tableOfContents: [
      { id: "roller", title: "Rolleri belirleyin" },
      { id: "asamalar", title: "Dört aşamalı akış kurun" },
      { id: "kontrol", title: "Yayın öncesi kontrol listesi" },
      { id: "darbogaz", title: "Onay gecikmelerini azaltın" },
    ],
    sections: [
      {
        id: "roller",
        title: "Rolleri belirleyin",
        paragraphs: [
          "Bir gönderinin sahibi belli değilse düzeltmeler sohbet mesajlarında dağılır. Her içerik için bir hazırlayan, bir son karar veren ve bir yayın sorumlusu atayın. Küçük bir işletmede aynı kişi iki rolü üstlenebilir; önemli olan son onayın kimde olduğunun açık olmasıdır.",
          "Onay verecek kişiye yalnızca görseli göndermeyin. Amaç, hedef kitle, yayın kanalı, metin ve planlanan tarih aynı kayıt içinde olsun. Böylece yorumlar doğru bağlamda yapılır.",
        ],
      },
      {
        id: "asamalar",
        title: "Dört aşamalı akış kurun",
        paragraphs: [
          "Basit bir akış çoğu ekip için yeterlidir: fikir, taslak, onay bekliyor ve yayına hazır. Revizyon istenirse içerik yeniden taslağa döner; değişikliğin nedeni bir notla kaydedilir. Yayın sonrası bağlantıyı aynı kayda eklemek, geriye dönük incelemeyi kolaylaştırır.",
          "Her aşama için beklenen süreyi belirleyin. Örneğin haftalık plan pazartesi hazırlanır, salı öğlene kadar yorumlanır, çarşamba yayıma hazır olur. Bu süreler ekibin gerçek kapasitesine göre ayarlanmalıdır.",
        ],
      },
      {
        id: "kontrol",
        title: "Yayın öncesi kontrol listesi",
        paragraphs: [
          "Son onayda marka dili, yazım, ürün bilgisi, fiyat, bağlantı, görsel kullanım izni ve platform formatını kontrol edin. Kampanya içeriklerinde geçerlilik tarihi ve koşullar özellikle görünür olmalıdır. Sağlık, hukuk veya finans gibi alanlarda alan uzmanı incelemesi ayrıca gerekebilir.",
          "Yapay zekâ bir taslak ürettiyse aynı kontrol uygulanır. Otomatik yazılmış bir iddia, doğrulanmadan markanın sözüne dönüşmemelidir. Tentamark'ın insan onayı yaklaşımı bu kontrol noktasını içerik üretimiyle yayın arasına yerleştirir.",
        ],
        callout: { type: "checklist", title: "Son kontrol", items: ["Metin ve görsel aynı vaadi iletiyor mu?", "Bağlantı doğru sayfaya gidiyor mu?", "Yayın tarihi ve sorumlu kişi belli mi?"] },
      },
      {
        id: "darbogaz",
        title: "Onay gecikmelerini azaltın",
        paragraphs: [
          "Onay süresi uzuyorsa daha fazla hatırlatma göndermeden önce sebebi ayırın: eksik bilgi, çok sayıda karar verici veya geç teslim edilen taslak. Tek karar verici, standart brief ve haftalık toplu onay saati çoğu zaman süreci hızlandırır.",
          "Ay sonunda üç ölçüye bakın: taslaktan onaya geçen ortalama süre, revizyon sayısı ve zamanında yayımlanan içerik oranı. Bu ölçüler ekip içi sürtünmeyi görünür kılar; daha fazla gönderi üretmeden önce akışı düzeltmenizi sağlar.",
        ],
      },
    ],
  },
  {
    id: 30,
    slug: "sosyal-medya-yonetim-araci-nasil-secilir",
    title: "Sosyal Medya Yönetim Aracı Nasıl Seçilir? 7 Soruluk Kontrol Listesi",
    subtitle: "Küçük ekipler için özellik listesinden önce iş akışını değerlendirme rehberi.",
    excerpt: "Sosyal medya yönetim aracı seçerken platform bağlantısı, içerik onayı, analiz, güvenlik ve toplam maliyeti nasıl değerlendireceğinizi öğrenin.",
    question: "Sosyal medya yönetim aracı seçerken nelere bakılmalı?",
    shortAnswer: "Önce ekibinizin zorlandığı iş adımlarını belirleyin. Ardından kendi hesap türünüzle platform bağlantısını, desteklenen yayın formatlarını, onay akışını, hata bildirimlerini, kullanım sınırlarını ve toplam maliyeti gerçek bir denemede doğrulayın.",
    category: "strateji-planlama",
    categoryLabel: "Strateji & Planlama",
    readingTime: 5,
    publishedAt: "19 Eylül 2026",
    author,
    coverImage: "/blog/10/Team_creating_social_media_content_20260917182626.jpeg",
    images: [],
    tags: ["sosyal medya yönetim aracı", "sosyal medya planlama aracı", "araç seçimi"],
    tableOfContents: [
      { id: "ihtiyac", title: "İhtiyacı bir iş akışı olarak tanımlayın" },
      { id: "platform", title: "Platform desteğini doğrulayın" },
      { id: "ekip", title: "Ekip ve onay akışını deneyin" },
      { id: "maliyet", title: "Maliyeti ve çıkış yolunu hesaplayın" },
    ],
    sections: [
      {
        id: "ihtiyac",
        title: "İhtiyacı bir iş akışı olarak tanımlayın",
        paragraphs: [
          "Araç karşılaştırmasına özellik sayısıyla başlamayın. Son iki haftada içerik hazırlarken hangi adımlar zaman aldı: fikir bulmak, görsel toplamak, metni onaylatmak, yayınlamak veya sonuçları raporlamak? En çok aksayan iki adımı yazın. Seçeceğiniz araç önce bunları çözmeli.",
          "Tek kişilik bir işletmenin gereksinimiyle müşteri onayı alan bir ajansın gereksinimi farklıdır. Kendi sürecinizi fikir, taslak, inceleme, yayın ve ölçüm olarak çizin; demoda her adımı gerçekten deneyin.",
        ],
      },
      {
        id: "platform",
        title: "Platform desteğini doğrulayın",
        paragraphs: [
          "Bir aracın platform logosunu göstermesi, her içerik türünü otomatik yayımladığı anlamına gelmez. Kullandığınız hesap türünü, görsel ve video formatlarını, zamanlamayı, yayın sonrası hata bildirimini ayrı ayrı kontrol edin. Resmi API izinleri ve platform kuralları nedeniyle bazı işlemler manuel adım gerektirebilir.",
          "Deneme sırasında kendi hesabınızla bir taslak oluşturun ve yayın akışının sonuna kadar ilerleyin. Henüz bağlanamayan kanallar için hazırlık ve önizleme özellikleri yine yararlı olabilir; fakat bunları doğrudan yayın desteğiyle karıştırmayın.",
        ],
      },
      {
        id: "ekip",
        title: "Ekip ve onay akışını deneyin",
        paragraphs: [
          "İçeriği hazırlayan kişiyle onaylayan kişi farklıysa roller, yorumlar ve revizyon geçmişi önem kazanır. Onay bekleyen taslağın yanlışlıkla yayımlanmasını önleyen bir adım var mı? Son değişikliği kim yaptı? Yayın tarihi değişirse ekip bunu görebiliyor mu? Bu soruları gerçek bir örnek üzerinden sınayın.",
          "Yapay zekâ destekli metin üretimi değerlendirirken yalnızca ilk taslağın hızına bakmayın. Marka tonunu düzeltmek, yanlış iddiayı ayıklamak ve platforma uygun hale getirmek için harcanan süreyi de ölçün. İnsan kontrolü sürecin görünür bir parçası olmalı.",
        ],
        callout: { type: "checklist", title: "Demoda sorulacaklar", items: ["Kendi hesap türümle hangi formatları yayımlayabilirim?", "Onay verilmeden yayın mümkün mü?", "Başarısız yayın nasıl bildirilir?"] },
      },
      {
        id: "maliyet",
        title: "Maliyeti ve çıkış yolunu hesaplayın",
        paragraphs: [
          "Aylık ücrete ek olarak kullanıcı, marka alanı, sosyal hesap, yapay zekâ kullanımı ve medya depolama sınırlarını inceleyin. Ekibiniz büyüdüğünde toplam maliyetin nasıl değişeceğini hesaplayın. Ücretsiz denemede hangi özelliklerin açık olduğunu ve ücretli plana geçiş şartlarını yazılı olarak kontrol edin.",
          "Bir gün araç değiştirmek isterseniz içerik ve raporları dışa aktarabilmeniz önemlidir. Hesap bağlantısını kaldırma ve verileri silme sürecini de değerlendirin. Tentamark'ı incelerken aynı kontrol listesini uygulayın; güncel özellik ve plan ayrıntılarını ürün sayfalarında doğrulayın.",
        ],
      },
    ],
  },
];
