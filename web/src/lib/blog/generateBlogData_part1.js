const fs = require('fs');
const path = require('path');

const imageMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'blogImagesMap.json'), 'utf8'));

function getImagesForPost(id) {
  const list = imageMap[String(id)] || [];
  return list.map(f => `/blog/${id}/${f}`);
}

const rawArticles = [
  // ═══════════════════════════════════════════════════════════════════
  // MAKALE 1: 7-11-4 Kuralı
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 1,
    slug: "7-11-4-kurali-marka-guveni",
    title: "7-11-4 Kuralı: İnsanlar Bir Markaya Ne Zaman Güvenmeye Başlar?",
    subtitle: "Modern pazarlamada çoklu temas psikolojisi ve satın alma kararının arkasındaki gizli matematik.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 12,
    publishedAt: "14 Eylül 2026",
    tags: ["7-11-4 Kuralı", "Marka Güveni", "Müşteri Yolculuğu", "Çoklu Temas", "Pazarlama Psikolojisi"],
    featured: true,
    excerpt: "Bir müşterinin ilk gördüğü anda markanızdan satın alma ihtimali neden %1'in altındadır? 7 saatlik içerik tüketimi, 11 farklı temas noktası ve 4 ayrı kanal mantığıyla sürdürülebilir marka güveni inşa etmenin formülü.",
    sections: [
      {
        id: "nedir-bu-7-11-4",
        title: "1. 7-11-4 Çerçevesi Nedir ve Nereden Gelir?",
        paragraphs: [
          "Google'ın 2011 yılında yayınladığı 'Zero Moment of Truth' (ZMOT — Sıfırıncı Karar Anı) araştırması, dijital pazarlamanın temel varsayımını altüst etti. Araştırma, tüketicilerin bir ürünü ilk kez gördüklerinde hemen satın almadığını; bunun yerine ortalama 10,4 farklı kaynak incelediğini ortaya koydu. Bu bulguyu temel alan ve yıllar içinde sosyal medya çağına uyarlanan 7-11-4 çerçevesi, güvenin matematiksel formülünü sunar.",
          "7 rakamı toplam 7 saatlik içerik tüketimini (blog yazıları, videolar, podcast bölümleri, sosyal medya paylaşımları), 11 rakamı 11 bağımsız temas noktasını (reklam, hikaye, yorum, e-posta, web sitesi ziyareti vb.) ve 4 rakamı ise en az 4 farklı platformda karşılaşmayı ifade eder. Bu üç koşul bir arada sağlandığında yabancı bir marka, tüketicinin zihninde 'tanıdık ve güvenilir' kategorisine geçer.",
          "Elbette 7-11-4 kesinlikle bir doğa yasası değildir. Her sektör, ürün fiyat noktası ve hedef kitle profili için bu sayılar değişebilir. Örneğin, 15 dolarlık bir kozmetik ürünü için 4-5 temas yeterli olabilirken, 50.000 dolarlık bir B2B SaaS çözümü için 25-30 temas noktası gerekebilir. Ancak temel prensip değişmez: güven, tek bir parlak reklam ile değil, tutarlı ve çok kanallı tekrar ile inşa edilir."
        ],
        callout: {
          type: "takeaway",
          title: "7-11-4 Formülünün Özeti",
          text: "7 Saat İçerik Tüketimi + 11 Ayrı Temas Noktası + 4 Farklı Kanal = Kırılmaz Marka Güveni ve Yüksek Dönüşüm Oranı. Bu formula katı bir yasa değil, stratejik bir pusuladır."
        }
      },
      {
        id: "musteri-yolculugu-asamalari",
        title: "2. Müşteri Yolculuğu: Görmekten Satın Almaya Uzanan 6 Aşama",
        paragraphs: [
          "Geleneksel pazarlama anlayışı 'Gör → Satın Al' kısayoluna inanır. Oysa nöropazarlama araştırmaları, tüketici beyninin çok daha uzun ve karmaşık bir süreçten geçtiğini kanıtlamıştır. Bu süreç altı temel aşamadan oluşur: Farkındalık (Awareness), Tanıma (Recognition), Değerlendirme (Consideration), Güven (Trust), Karar (Decision) ve Son Adım (Action).",
          "Farkındalık aşamasında tüketici markanızı ilk kez görür; beyin bunu sadece bir gürültü olarak kaydeder. Tanıma aşamasında ikinci ve üçüncü karşılaşmalarda 'Ben bunu daha önce görmüştüm' hissi uyanır. Psikolog Robert Zajonc'un 'Salt Maruz Kalma Etkisi' (Mere Exposure Effect) teorisine göre, bir uyarıcıyla ne kadar çok karşılaşırsak, ona karşı o kadar sıcak duygular besleriz. Bu etkinin devreye girmesi için minimum 3-5 temas gerekir.",
          "Değerlendirme aşamasında tüketici artık markayı bilinçli olarak inceler: 'Ne yapıyorlar? Benim sorunumu çözebilirler mi? Başkaları ne diyor?' sorularını sorar. Güven aşamasında yeterli sayıda olumlu temas biriktiğinde, beyin risk algısını düşürür ve marka 'güvenli' kategorisine alınır. Karar aşamasında tüketici zihinsel olarak 'evet, deneyeceğim' der ve son adımda fiziksel eylemi (tıklama, sepete ekleme, arama) gerçekleştirir.",
          "Kritik nokta şudur: Çoğu marka yalnızca farkındalık ve son adım arasına reklam koyar ve ortadaki 4 aşamayı tamamen boş bırakır. Oysa dönüşümü belirleyen tam da bu ortadaki sessiz süreçtir."
        ],
        keyPoints: [
          "1. Temas (Farkındalık): Bilinçaltı markayı kayıt altına alır ama henüz işlemez.",
          "3-4. Temas (Tanıma): 'Mere Exposure Effect' devreye girer, yabancılık hissi çözülür.",
          "5-7. Temas (Değerlendirme): Tüketici bilinçli olarak markayı inceler ve karşılaştırır.",
          "8-10. Temas (Güven): Beyin risk bariyerini düşürür, marka 'güvenilir' ilan edilir.",
          "11+ Temas (Karar & Eylem): Satın alma direnci kırılır, dönüşüm gerçekleşir."
        ]
      },
      {
        id: "7-saat-icerik-tuketimi",
        title: "3. 7 Saatlik İçerik Tüketimi: Hangi Formatlar Saati Doldurur?",
        paragraphs: [
          "7 saat ilk duyduğunuzda çok uzun gelebilir, ancak bu süre tek seferde değil, haftalar ve aylar içinde kümülatif olarak birikir. Bir kullanıcı Instagram'da 45 saniyelik Reels'inizi izlediğinde, 2 dakikalık bir blog özetini okuduğunda, 8 dakikalık bir YouTube videosunu seyrettiğinde ve 15 dakikalık bir podcast bölümünü dinlediğinde toplamda yaklaşık 26 dakikayı size harcamış olur. Bu şekilde 15-20 farklı içerik parçasıyla 7 saatlik eşik aşılır.",
          "Kısa formatlı içerikler (15-60 saniyelik Reels, TikTok ve Stories) farkındalık ve tanıma aşamalarını besler. Orta formatlı içerikler (2-5 dakikalık carousel açıklamaları, LinkedIn makaleleri, e-posta bültenleri) değerlendirme aşamasını güçlendirir. Uzun formatlı içerikler (10-30 dakikalık blog yazıları, vaka analizleri, webinarlar ve podcast bölümleri) güven aşamasını pekiştirir ve markanızı 'sektör otoritesi' konumuna yükseltir.",
          "En etkili strateji bu üç format katmanını paralel olarak üretmektir. Tek bir ana fikir (çekirdek içerik) üretir, ardından bunu platforma uygun mikro parçalara (atomize content) bölersiniz. Örneğin, 20 dakikalık bir YouTube videosu → 3 adet Reels klibi + 1 carousel özeti + 1 blog transkripti + 5 tweet dizisi + 1 bülten makalesi olarak dağıtılabilir. Böylece tek bir çekirdekten 11 farklı temas noktası yaratmış olursunuz."
        ],
        callout: {
          type: "tip",
          title: "İçerik Atomizasyonu Taktiği",
          text: "Her hafta 1 uzun çekirdek içerik (video, blog veya podcast) üretin. Ardından bu çekirdeği 8-12 mikro parçaya bölüp farklı platformlara dağıtın. Tek bir fikirle hem 7 saatlik eşiği hem de 11 temas noktasını besleyebilirsiniz."
        }
      },
      {
        id: "11-temas-noktasi",
        title: "4. 11 Temas Noktası: Tekrar Eden Görünürlük Nasıl Tasarlanır?",
        paragraphs: [
          "11 temas noktasını aynı kanalda arka arkaya reklam basarak oluşturmak mümkün değildir. Aynı kanalda ardışık 11 reklam görmek güven değil, antipati yaratır (reklam yorgunluğu). Doğru strateji, tüketicinin günlük dijital rutininde farklı bağlamlarda organik olarak karşısına çıkmaktır.",
          "Bir Instagram Reels videosu izlendiğinde bu 1 temas noktasıdır. Aynı kullanıcı Google'da bir sorun aradığında markanızın SEO uyumlu blog yazısına denk gelmesi 2. temas noktasıdır. Ertesi gün LinkedIn'de sektörel bir vaka analizi görmesi 3. temas noktasıdır. Bir arkadaşının Instagram hikayesinde markanızın ürününü paylaşması 4. temas noktasıdır. E-posta kutusuna değerli bir içerik bülteni düşmesi 5. temas noktasıdır.",
          "Dikkat edilmesi gereken nokta, bu 11 temasın 'doğal' ve 'organik' hissettirmesidir. Kullanıcı 'Bu marka beni takip ediyor' hissine kapılmamalı; bunun yerine 'Bu markayı her yerde görüyorum, demek ki gerçekten büyükler ve işlerini biliyorlar' izlenimine ulaşmalıdır. Bu algı farkı, retargeting pixel'lerle bombardıman etmek ile gerçek değer üreten çok kanallı içerik stratejisi arasındaki uçurumdur.",
          "Pratik uygulama için müşteri temas noktası haritası (touchpoint map) çıkartın: Hedef kitleniz günde hangi platformlarda ne kadar vakit geçiriyor? Sabah LinkedIn mı, akşam Instagram mı? Hafta sonu YouTube mu, iş saatlerinde e-posta mı? Bu harita üzerinden 11 temasın hangi kanallara ve hangi saatlere dağıtılacağını planlayın."
        ]
      },
      {
        id: "4-farkli-kanal",
        title: "5. 4 Farklı Platform: Çok Kanallı Güvenin Nörolojik Temeli",
        paragraphs: [
          "Bir markayı yalnızca Instagram'da görmek ile aynı markayı aynı zamanda Google arama sonuçlarında, YouTube incelemelerinde, bir podcast konuşmasında ve LinkedIn'deki bir vaka analizinde görmek arasında tüketici psikolojisinde devasa bir fark vardır. Nöropazarlama araştırmaları bunu 'Omnipresence Effect' (Her Yerde Bulunma Etkisi) olarak adlandırır.",
          "Her platformun farklı bir 'güven kodu' vardır. Google aramada çıkmak yetkinlik (competence) sinyali verir: 'Bu marka arama motorunun bile öne çıkardığı bir kaynak.' LinkedIn'de görünmek profesyonellik sinyali verir: 'Bu insanlar ciddi iş yapıyorlar.' Instagram'da görünmek erişilebilirlik sinyali verir: 'Bu marka benim dünyamda, yakınımda.' YouTube'da görünmek derinlik sinyali verir: 'Bu insanlar konuyu gerçekten biliyorlar ve uzun uzun anlatabiliyorlar.' Bu dört sinyalin birleşimi, tek bir kanalın asla sağlayamayacağı bütüncül bir güven hissi yaratır.",
          "Minimum 4 kanal önerisi şudur: 1 keşif kanalı (Instagram, TikTok), 1 derinlik kanalı (blog, YouTube), 1 profesyonel kanal (LinkedIn, e-posta) ve 1 sohbet kanalı (X/Twitter, Threads, topluluk forumları). Bu dört kanal birlikte çalıştığında marka, tüketicinin hayatının her köşesinde tutarlı ve güvenilir bir varlık olarak algılanır."
        ],
        callout: {
          type: "takeaway",
          title: "Minimum Kanal Formülü",
          text: "1 Keşif Kanalı (Instagram/TikTok) + 1 Derinlik Kanalı (Blog/YouTube) + 1 Profesyonel Kanal (LinkedIn/E-posta) + 1 Sohbet Kanalı (X/Threads) = 360° Marka Güveni."
        }
      },
      {
        id: "pratik-uygulama-plani",
        title: "6. Pratik Uygulama: 7-11-4'ü Kendi Markanıza Nasıl Uygularsınız?",
        paragraphs: [
          "Teoriyi pratiğe dönüştürmek için şu 5 adımlı çerçeveyi kullanın. İlk adım: Hedef kitlenizin dijital ayak izini çıkarın. Google Analytics, sosyal medya insights ve basit anketlerle müşterilerinizin hangi platformlarda, hangi saatlerde ve hangi formatlarda içerik tükettiğini belirleyin.",
          "İkinci adım: İçerik atomizasyon sistemi kurun. Her hafta 1 uzun form 'çekirdek içerik' (pillar content) üretin ve bunu en az 8 mikro parçaya bölün. Üçüncü adım: Temas noktası takvimi oluşturun. Her hafta hedef kitlenizin minimum 3 farklı platformda sizinle karşılaşmasını sağlayacak bir yayın takvimi hazırlayın.",
          "Dördüncü adım: Retargeting ve remarketing kampanyalarını organik içerikle harmanlayın. Reklamlarınız 'Şimdi satın al!' demek yerine 'Bu konuda faydalı bir rehberimiz var' yaklaşımıyla tasarlanmalıdır. Beşinci adım: Ölçümleyin. Attribution (ilişkilendirme) modellerini kullanarak hangi temas noktasının satın alma kararına en çok katkıda bulunduğunu izleyin ve bütçenizi buna göre optimize edin.",
          "Son bir not: Sabırlı olun. 7-11-4 bir sprint değil, maratondur. İlk 30 günde sonuç beklemeyin; 90 günlük bir döngüde çoklu temas noktalarınızı tutarlı biçimde inşa ettiğinizde, dönüşüm oranlarında belirgin bir sıçrama göreceksiniz. Araştırmalar, çok kanallı pazarlama stratejilerinin tek kanallı stratejilere kıyasla %250'ye kadar daha yüksek satın alma oranı ürettiğini göstermektedir."
        ],
        keyPoints: [
          "1. Adım: Hedef kitlenin dijital ayak izini çıkarın (hangi platform, hangi saat, hangi format?).",
          "2. Adım: Haftalık 1 çekirdek içerikten 8-12 mikro parça türetin (atomizasyon).",
          "3. Adım: Minimum 3 farklı platformda haftalık yayın takvimi oluşturun.",
          "4. Adım: Reklam kampanyalarını 'değer ver' odaklı tasarlayın, doğrudan satış baskısından kaçının.",
          "5. Adım: Attribution modeliyle ölçümleyin, 90 günlük döngülerle optimize edin."
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // MAKALE 2: Marka Hafızasının Psikolojisi
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 2,
    slug: "marka-hafizasinin-psikolojisi",
    title: "Bir Marka Nasıl Akılda Kalır? Marka Hafızasının Psikolojisi",
    subtitle: "İnsan beyni markaları logolarla değil, çoklu duyu kodlarıyla ve tekrar eden görsel sinyallerle hatırlar.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 11,
    publishedAt: "13 Eylül 2026",
    tags: ["Marka Hafızası", "Nöropazarlama", "Distinctive Brand Assets", "Görsel Kimlik", "Tutarlılık"],
    excerpt: "İnsanların markaları yalnızca logodan değil; renk, ambalaj, fotoğraf dili, tipografi, slogan, ses tonu ve tekrar eden görsel unsurlardan hatırlıyor. Distinctive brand assets, tutarlılık ve tekrar kavramlarının bilimsel temeli ve uygulanabilir stratejileri.",
    sections: [
      {
        id: "beyin-markalari-nasil-kodlar",
        title: "1. İnsan Beyni Markaları Nasıl Kodlar?",
        paragraphs: [
          "İnsan beyni günde yaklaşık 10.000 marka mesajına maruz kalır. Bu devasa bilgi bombardımanında hayatta kalabilmek için beyin, muazzam bir filtreleme sistemi kullanır: İşine yaramayan, tanımadığı ve tekrar etmeyen uyarıcıları anında siler. Bu yüzden markanızın adını bir kez gören kişinin onu 24 saat sonra hatırlama ihtimali %10'un altındadır.",
          "Ancak beyin bir kısayol daha kullanır: Sözel (verbal) bilgiyi hatırlamak zordur ama görsel ve duygusal kodları hatırlamak çok kolaydır. Tiffany'nin turkuaz mavisi, Coca-Cola'nın kırmızı ve beyaz dalgası, McDonald's'ın altın sarısı kemeri... Bu markaların logosunu görmeden, sadece renk ve formdan tanıyabilirsiniz. İşte buna 'Distinctive Brand Assets' (Ayırt Edici Marka Varlıkları) denir.",
          "Nöropazarlama araştırmacısı Byron Sharp, 'How Brands Grow' kitabında bu olguyu bilimsel verilerle kanıtlar: Rekabet avantajı, ürünün özelliklerinden çok markanın zihinsel erişilebilirliğinden (mental availability) kaynaklanır. Yani insanlar ihtiyaç anında hangi markayı ilk akıllarına getiriyorsa, onu satın alır. Ve akla gelmenin yolu, güçlü ve tekrar eden duyu kodları oluşturmaktan geçer."
        ]
      },
      {
        id: "6-duyu-kodu",
        title: "2. Markanızın 6 Temel Duyu Kodu",
        paragraphs: [
          "Güçlü bir marka hafızası inşa etmek için en az 3, ideal olarak 6 ayırt edici duyu kodu oluşturmanız gerekir. Bunlar: (1) Renk Kodu — Markanızla özdeşleşen baskın renk. Tek renk bile yeterlidir; Spotify yeşili, Tiffany turkuazı gibi. (2) Tipografi Kodu — Başlıklarda ve gövde metinlerinde tutarlı olarak kullandığınız yazı tipi ailesi. (3) Görsel Dil Kodu — Fotoğraflarınızdaki ortak atmosfer: sıcak mı soğuk mu? Minimal mi kalabalık mı? Doğal ışık mı stüdyo mı?",
          "(4) Ses ve Ton Kodu — Yazılı iletişiminizdeki kişilik: esprili mi ciddi mi? Samimi mi kurumsal mı? (5) Layout ve Çerçeve Kodu — Paylaşımlarınızdaki tutarlı yerleşim düzeni: logo pozisyonu, metin hizası, kenarlık stili. (6) Kanca ve Açılış Kodu — İçeriklerinizi başlatma ritüeliniz: 'Bugünkü konumuz...', 'Biliyor muydunuz?' veya markanıza özgü bir signature açılış cümlesi.",
          "Bu 6 kod birlikte çalıştığında kullanıcı, feed'i hızla kaydırırken bile gönderinizin size ait olduğunu 0,3 saniyede tanır. Bu tanıma anı, beynin 'güvenli alan' korumasını devre dışı bırakır ve içeriğinize duraklamasını sağlar. Tanıma olmadan duraksama, duraksama olmadan okuma, okuma olmadan güven oluşmaz."
        ],
        callout: {
          type: "checklist",
          title: "Marka Duyu Kodu Kontrol Listesi",
          items: [
            "Baskın marka rengimiz belirli ve tutarlı mı?",
            "Başlık ve gövde yazı tipi çiftimiz (font pairing) sabit mi?",
            "Fotoğraf ve görsel dilimizde ortak bir atmosfer var mı?",
            "Yazı tonumuz 3 sıfatla tanımlanabilir mi? (örn: Bilgili, Samimi, Net)",
            "Sosyal medya paylaşımlarımızda tutarlı bir layout şablonu kullanıyor muyuz?",
            "İçeriklerimizde tanınabilir bir açılış kancası veya ritüelimiz var mı?"
          ]
        }
      },
      {
        id: "tutarlilik-ve-tekrar",
        title: "3. Tutarlılık Sıkıcılık Demek Değildir",
        paragraphs: [
          "Marka sahiplerinin en sık yaptığı hata, kendi görsel kimliklerinden çabuk sıkılmalarıdır. 'Her ay yeni bir konsept deneyelim, taze kalalım' dürtüsü yaratıcı hissettirse de, nörolojik açıdan bir felakettir. Her yeni görsel tarz, beyinin önceki temaslarla kurduğu sinirsel bağı kopar ve süreci sıfırdan başlatır.",
          "Coca-Cola 136 yıldır aynı kırmızıyı, aynı font stilini ve aynı şişe formunu kullanıyor. Apple 25 yıldır aynı minimalist beyaz estetiği koruyor. Bu markalar sıkıcı mı? Kesinlikle hayır. Tutarlılık, içerik konularını sınırlamaz; görsel grameri sabitler. İçerik konuları her gün değişebilir ama renk paleti, tipografi ve layout kalıpları değişmemelidir.",
          "Buradaki altın kural şudur: Marka sahibi olarak siz kendi renklerinizden, şablonlarınızdan ve ses tonunuzdan sıkıldığınız an, hedef kitleniz onları henüz yeni yeni fark etmeye ve tanımaya başlamıştır. Bir varlığı 'yeterince gördüm' hissediyorsanız, muhtemelen müşterileriniz onu yeterince görmemiştir. Bu yüzden tutarlılığı minimum 12-18 ay sürdürün, ardından ince ayarlar yapın, radikal değişikliklerden kaçının."
        ],
        callout: {
          type: "takeaway",
          title: "Tutarlılığın Altın Kuralı",
          text: "Siz kendi marka renklerinizden ve şablonlarınızdan sıkıldığınız an, müşterileriniz onları henüz yeni fark etmeye başlamıştır. Tutarlılığı minimum 12-18 ay sürdürün; ince ayar yapın ama radikal değişikliklerden kaçının."
        }
      },
      {
        id: "marka-varliklari-envanteri",
        title: "4. Marka Varlıkları Envanteri: Audit Nasıl Yapılır?",
        paragraphs: [
          "Markanızın ne kadar 'hatırlanabilir' olduğunu ölçmek için bir 'Distinctive Assets Audit' (Ayırt Edici Varlık Denetimi) yapabilirsiniz. Bu denetim 3 basit adımdan oluşur. İlk adım: Son 30 günde tüm platformlarda yayınladığınız her içerik parçasını (gönderi, hikaye, e-posta, web sayfası) bir klasöre toplayın.",
          "İkinci adım: Tüm bu içerikleri yan yana koyun ve şu soruyu sorun — 'Logomuz kaldırılsa, bir yabancı bu içeriklerin aynı markaya ait olduğunu anlayabilir mi?' Eğer cevap 'hayır' veya 'belki' ise, ayırt edici varlıklarınız yetersizdir. Üçüncü adım: Bu içeriklerden ortak elementleri (renk, font, yerleşim, ton) tespit edin ve bunları 'Marka Görsel Kılavuzu' (Brand Visual Playbook) olarak belgelendirin. Artık her yeni içerik üretildiğinde bu kılavuza uygunluğu kontrol edilir.",
          "Bu denetimi her çeyrekte (3 ayda bir) tekrarlayın. Zamanla tutarlılık oranınız artacak ve markanız feed'de bir reklam değil, 'eski bir tanıdık' gibi algılanacaktır."
        ]
      },
      {
        id: "dijital-cagda-hafiza-mekanikleri",
        title: "5. Dijital Çağda Hafıza Mekaniği: Scrolla Karşı Kazanmak",
        paragraphs: [
          "Sosyal medya feed'lerinde kullanıcılar saniyede ortalama 3-5 gönderi geçer. Bu, her gönderinin yaklaşık 0,3 saniyelik bir 'dikkat penceresi' olduğu anlamına gelir. Bu 0,3 saniyede logoyu okumak imkansızdır; ancak rengi, formu ve genel atmosferi algılamak mümkündür. Bu yüzden marka hafızasının dijital çağdaki en kritik silahı, logo değil, çevresel kodlardır.",
          "İşe yarayan bir dijital hafıza stratejisi şöyle çalışır: Kullanıcı kaydırırken, bilinçaltı 'Bu renk ve düzen bana tanıdık geliyor' sinyalini gönderir. Bu sinyal, kaydırma hızını yavaşlatır (scroll deceleration). Yavaşlayan kullanıcı gönderiyi bilinçli olarak fark eder, başlığı okur ve 'Aa bu Tentamark'ın paylaşımı' der. Tanıma otomatik bir güven hissi tetikler ve içeriğe etkileşimde bulunma olasılığı 3-5 kat artar.",
          "Bu mekanizmayı güçlendirmek için her paylaşımınızda tutarlı bir 'görsel imza' kullanın: Sabit bir renk çerçevesi, sabit bir logo pozisyonu, sabit bir font ailesi ve sabit bir filtre/renk sıcaklığı. Bu dört unsur birlikte, feed'in gürültüsünde sizin 'parmak iziniz' olur."
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // MAKALE 3: İnsanlar Neden Bazı Markalara Güvenir?
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 3,
    slug: "insanlar-neden-bazi-markalara-guvenir",
    title: "İnsanlar Neden Bazı Markalara Güvenir?",
    subtitle: "Güven rasyonel bir hesaplaşma değil, duygusal bir emniyet hissidir. Ve bu his, bilinçli olarak tasarlanabilir.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 10,
    publishedAt: "12 Eylül 2026",
    tags: ["Marka Güveni", "Sosyal Kanıt", "Şeffaflık", "Kullanıcı Yorumları", "Müşteri Deneyimi"],
    excerpt: "Marka güvenini oluşturan sosyal kanıt, tutarlılık, uzmanlık, şeffaflık, kaliteli deneyim, yorumlar ve tekrar eden olumlu temasların ardındaki bilimsel mekanizma ve 6 uygulama stratejisi.",
    sections: [
      {
        id: "guven-bilesenleri",
        title: "1. Marka Güveninin 4 Temel Sütunu",
        paragraphs: [
          "Bir kullanıcı yeni bir markanın web sitesine veya sosyal medya profiline girdiğinde, beyin bilinçaltında hızlı bir güvenilirlik taraması yapar. Bu tarama 4 temel sütun üzerinden gerçekleşir: Yetkinlik (Competence), Dürüstlük (Integrity), İyiniyet (Benevolence) ve Tutarlılık (Consistency).",
          "Yetkinlik sütunu 'Bu insanlar işini biliyor mu?' sorusunu cevaplar. Web sitenizin tasarım kalitesi, içeriklerinizin derinliği, müşteri portföyünüz ve sektörel bilginiz bu sütunu güçlendirir. Dürüstlük sütunu 'Söyledikleri ile yaptıkları uyuşuyor mu?' sorusunu cevaplar. Tutarsızlıklar, abartılı vaatler ve gizli koşullar bu sütunu yıkar.",
          "İyiniyet sütunu 'Bu marka gerçekten benim sorunumu çözmeyi mi yoksa sadece cüzdanımı boşaltmayı mı istiyor?' sorusunu cevaplar. Ücretsiz değer sunan içerikler, müşteri sorunlarını proaktif olarak çözen destek ve karşılık beklemeden eğiten marka yaklaşımı bu sütunu besler. Tutarlılık sütunu ise 'Bu marka her zaman böyle mi yoksa sadece satış anında mı bu kadar nazik?' sorusunu cevaplar. 6 aylık tutarlı ve kaliteli bir iletişim, 1 ay boyunca yapılan 50 reklamdan daha güçlü güven inşa eder."
        ]
      },
      {
        id: "sosyal-kanitin-gucu",
        title: "2. Sosyal Kanıt: 'Başkaları Ne Demiş?' Refleksi",
        paragraphs: [
          "Psikolog Robert Cialdini'nin 'Influence' kitabında tanımladığı 'Sosyal Kanıt' (Social Proof) prensibi, insanların belirsizlik anında diğer insanların davranışlarını referans aldığını söyler. Bu, marka güveninde en güçlü kaldıraçtır: Sizin kendiniz hakkında söylediğiniz her şey 'reklam'dır; başkalarının sizin hakkınızda söylediği her şey ise 'kanıt'tır.",
          "Etkili sosyal kanıt stratejisi 5 katmandan oluşur: (1) Gerçek müşteri yorumları ve yıldız puanları — Google, Trustpilot, App Store'daki inceleme sayınız ve ortalamanız. (2) Müşteri başarı hikayeleri ve vaka analizleri — 'X markası Tentamark ile 3 ayda organik erişimini %340 artırdı' gibi somut rakamlar. (3) Kullanıcı tarafından üretilen içerikler (UGC) — Müşterilerinizin sizin ürününüzü kullanırken çektiği fotoğraf ve videolar. (4) Medya görünürlüğü — Sektörel yayınlarda çıkan haberler, podcast röportajları, konferans konuşmaları. (5) Sosyal medya etkileşim kanıtları — Gönderilerinizdeki beğeni, yorum ve paylaşım sayıları.",
          "Kritik bir nüans: Sadece 5 yıldızlı, kusursuz yorumları öne çıkarmak paradoksal olarak güveni zedeler. İnsanlar mükemmelliğe şüpheyle yaklaşır. Bunun yerine, bir sorunun nasıl çözüldüğünü anlatan 4 yıldızlı bir yorum ('Kargoda küçük bir aksaklık oldu ama müşteri destek ekibi aynı gün çözdü') çok daha ikna edicidir. Şeffaf problem çözme, kusursuzluk iddiasından daha güçlü güven inşa eder."
        ],
        callout: {
          type: "tip",
          title: "Sosyal Kanıt Stratejisi",
          text: "Sadece 5 yıldızlı kusursuz yorumları değil; bir aksaklığın nasıl hızla çözüldüğünü anlatan gerçek müşteri hikayelerini de paylaşın. Şeffaf problem çözme, kusursuzluk iddiasından çok daha güçlü güven yaratır."
        }
      },
      {
        id: "seffaflik-stratejisi",
        title: "3. Şeffaflık: Güvenin En Hızlı İnşa Aracı",
        paragraphs: [
          "2026'da tüketiciler her zamankinden daha şüpheci. 'En iyi', 'piyasanın lideri', '1 numaralı tercih' gibi boş superlatiflere karşı neredeyse bağışıklık geliştirdiler. Şeffaflık, bu şüphe kalkanını aşmanın en etkili yoludur.",
          "Şeffaflık stratejisi şu alanlarda uygulanabilir: Fiyatlandırma şeffaflığı (gizli ücretler yok, neyin ne kadara olduğu net), süreç şeffaflığı (ürün nasıl üretiliyor, içerik nasıl hazırlanıyor), sonuç şeffaflığı (hangi müşteriler ne sonuç aldı, gerçek rakamlarla), sınır şeffaflığı (ürününüzün neyi yapamadığını da açıkça söylemek) ve hata şeffaflığı (bir şey ters gittiğinde bunu gizlememek, proaktif olarak iletişim kurmak).",
          "Buffer, şirket gelirlerini ve çalışan maaşlarını tamamen kamuya açık hale getirerek 'Radical Transparency' (Radikal Şeffaflık) stratejisiyle sektörde benzersiz bir güven pozisyonu kazandı. Siz bu kadar radikal olmak zorunda değilsiniz; ancak müşterilerinizle paylaştığınız her bilgi parçası, güven hesabınıza yapılan bir yatırımdır."
        ]
      },
      {
        id: "guven-yikan-5-hata",
        title: "4. Güveni Bir Anda Yıkan 5 Kritik Hata",
        paragraphs: [
          "Güven inşa etmek aylar alır; yıkılması ise tek bir hata ile gerçekleşebilir. En sık yapılan 5 güven yıkıcı hata şunlardır: (1) Tutarsız mesajlar — Bir platformda 'premium kalite' derken diğerinde 'en ucuz fiyat' vaat etmek. (2) Gizli koşullar — Fiyatlandırmada, iade politikasında veya hizmet kapsamında küçük yazılarla gizlenen istisnalar.",
          "(3) Taklit ve kopyacılık — Rakip markaların görsel dilini, içerik formatını veya hatta slogan yapısını kopyalamak. (4) Agresif satış baskısı — Henüz güven oluşmadan 'Hemen al! Son 2 adet!' gibi aciliyet baskısı uygulamak. (5) Yanıtsız kalmak — Müşteri sorularına, şikayetlere veya yorumlara gün veya haftalarca cevap vermemek.",
          "Bu 5 hatanın her biri, haftalar boyunca biriktirdiğiniz güven puanını sıfırlayabilir. Özellikle sosyal medya çağında olumsuz bir deneyim, olumlu deneyimlerden 7 kat daha hızlı yayılır."
        ],
        keyPoints: [
          "Tutarsız mesajlar: Farklı platformlarda çelişen vaatler vermek.",
          "Gizli koşullar: Küçük yazılarla saklanan istisnalar ve ek ücretler.",
          "Taklit ve kopyacılık: Rakiplerin görsel dilini veya sloganlarını kopyalamak.",
          "Agresif satış baskısı: Güven oluşmadan aciliyet hissi yaratmaya çalışmak.",
          "Yanıtsız kalmak: Müşteri iletişimlerine günler/haftalarca cevap vermemek."
        ]
      },
      {
        id: "guven-olcumu",
        title: "5. Güveni Nasıl Ölçersiniz? 4 Somut Metrik",
        paragraphs: [
          "Marka güveni soyut bir kavram gibi görünse de, somut metriklerle ölçülebilir. İlk metrik 'Brand Search Volume' — markanızın adının Google'da aranma sıklığı. Güven arttıkça insanlar sizi doğrudan arayarak bulur, genel anahtar kelimelerle değil. İkinci metrik 'Direct Traffic Oranı' — web sitenize doğrudan URL yazarak gelen ziyaretçi yüzdesi. Bu oran ne kadar yüksekse, marka bilinirliğiniz o kadar güçlüdür.",
          "Üçüncü metrik 'Net Promoter Score (NPS)' — müşterilerinize 'Bu markayı bir arkadaşınıza tavsiye eder misiniz?' sorusunu sorduğunuzda aldığınız puan. 50 üzeri NPS mükemmel güven seviyesini gösterir. Dördüncü metrik 'Repeat Purchase Rate' — müşterilerinizin tekrar satın alma oranı. Güven varsa insanlar geri gelir; güven yoksa tek seferlik alışverişte kalırlar.",
          "Bu 4 metriği aylık olarak takip edin ve güven inşası çalışmalarınızın etkisini somut verilerle görün. Güven, artık 'iyi hissediyoruz' gibi öznel bir yargı değil; izlenebilir ve optimize edilebilir bir büyüme metriğidir."
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // MAKALE 4: Marka Kimliği Nedir?
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 4,
    slug: "marka-kimligi-nedir-logo-yapmaktan-fazlasi",
    title: "Marka Kimliği Nedir? Logo Yapmaktan Çok Daha Fazlası",
    subtitle: "Logo sadece bir rozettir; marka kimliği ise müşterinizin kalbinde ve aklında inşa ettiğiniz tüm dünyadır.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 11,
    publishedAt: "11 Eylül 2026",
    tags: ["Marka Kimliği", "Brand DNA", "Görsel Kimlik", "Positioning", "Müşteri Deneyimi"],
    excerpt: "Logo, visual identity, brand voice, positioning, values, customer experience ve Brand DNA arasındaki farkları somut örneklerle anlatan kapsamlı bir rehber.",
    sections: [
      {
        id: "logo-vs-kimlik",
        title: "1. Logo ile Marka Kimliği Arasındaki Uçurum",
        paragraphs: [
          "Bir grafik tasarımcıya 100 dolara bir logo çizdirmekle marka kimliği sahibi olunmaz. Logo, bir insanın pasaport fotoğrafı gibidir; kimlik ise o insanın karakteri, duruşu, espri anlayışı, konuşma tarzı ve değerleridir. Pasaport fotoğrafınız değişse bile siz aynı insan kalırsınız; ancak karakteriniz değişirse insanlar sizi tanıyamaz.",
          "Marka kimliği; web sitenizin yüklenme hızından müşteri destek ekibinizin attığı emojilere, paketleme bandınızın renginden Instagram kancalarınıza, fiyatlandırma sayfanızın tonundan sipariş onay e-postanızın sıcaklığına kadar müşterinin hissettiği bütüncül ruhtur. Bu ruh tutarlı olduğunda marka güçlüdür; tutarsız olduğunda 'profesyonel ama sıkıcı' veya daha kötüsü 'güvenilmez' algısı oluşur.",
          "Apple'ı düşünün: Kutusunu açma deneyimi (unboxing), mağaza atmosferi, web sitesindeki minimalist beyaz alan, ürün sunumlarındaki Steve Jobs mirası, müşteri desteğindeki Genius Bar konsepti... Tüm bunlar tek bir kimliğin farklı yüzeylerinde tutarlı bir şekilde yansır. Logo (ısırılmış elma) tüm bu kimliğin sadece %2'sidir."
        ]
      },
      {
        id: "brand-dna-katmanlari",
        title: "2. Brand DNA: Kimliğin 5 Kritik Katmanı",
        paragraphs: [
          "Tentamark sisteminde de uyguladığımız Brand DNA mimarisi, marka kimliğini 5 iç içe geçmiş katmanda ele alır. En içteki çekirdek katman 'Misyon ve Değerler' katmanıdır: Neden varız? Dünyada neyi değiştirmeye çalışıyoruz? Bu soruların cevabı her kararın filtresidir.",
          "İkinci katman 'Konumlandırma Matrisi'dir: Pazarda kime, neyi, nasıl ve neden farklı sunuyoruz? Üçüncü katman 'Marka Sesi ve Tonu'dur: Nasıl konuşuyoruz? Esprili mi, ciddi mi? Samimi mi, otoriter mi? Dördüncü katman 'Görsel Kimlik Sistemi'dir: Renk paleti, tipografi, fotoğraf dili, ikonografi ve layout kuralları. Beşinci ve en dıştaki katman 'Müşteri Deneyimi Tasarımı'dır: İlk temastan satış sonrası desteğe kadar her temas noktasının bilinçli olarak tasarlanması.",
          "Bu 5 katmanın hepsi birbiriyle uyumlu olmalıdır. Kurumsal ve ciddi bir ton seçip web sitenizde neon renkler kullanmak bir uyumsuzluktur. Samimi ve esprili bir ses tonu belirleyip müşteri destek e-postalarında bürokratik dil kullanmak bir uyumsuzluktur. Katmanlar arası tutarlılık, markanızın 'sahici' algılanmasının temelidir."
        ],
        keyPoints: [
          "Çekirdek Katman: Misyon, vizyon ve temel değerler (Neden varız?).",
          "2. Katman: Konumlandırma Matrisi (Kime, neyi, nasıl farklı sunuyoruz?).",
          "3. Katman: Marka Sesi ve Tonu (Nasıl konuşuyoruz ve yazıyoruz?).",
          "4. Katman: Görsel Kimlik Sistemi (Renk, tipografi, fotoğraf dili).",
          "5. Katman: Müşteri Deneyimi Tasarımı (Her temas noktasında tutarlı his)."
        ]
      },
      {
        id: "anti-goals",
        title: "3. Anti-Goals: Markanızın 'Asla Yapmayacakları' Listesi",
        paragraphs: [
          "Çoğu marka kılavuzu 'ne yapacağınızı' söyler ama 'ne yapmayacağınızı' belirlemez. Oysa markanızın sınırlarını çizmek, kimliğini netleştirmenin en güçlü aracıdır. Anti-Goals (Karşı-Hedefler), markanızın bilinçli olarak reddettiği davranışlardır.",
          "Örneğin: 'Rakiplerimizi asla isimleriyle karalamayız', 'Müşteriye agresif süreli indirim baskısı uygulamayız', 'Yanıltıcı karşılaştırma tabloları kullanmayız', 'İçeriklerimizde abartılı ve kanıtlanamaz vaatler vermeyiz', 'Müşteri verilerini üçüncü taraflarla paylaşmayız'. Bu net sınırlar, ekibinizdeki herkese karar verme netliği sağlar ve markanın uzun vadeli itibarını korur.",
          "Anti-Goals listesi aynı zamanda kriz anlarında pusula görevi görür. Bir satış hedefine ulaşmak için agresif taktik önerildiğinde, ekip bu listeye bakarak 'Bu bizim değerlerimize uymuyor' diyebilir. Bu tür yapısal bütünlük, kısa vadeli kazançlardan çok daha değerli uzun vadeli güven inşa eder."
        ]
      },
      {
        id: "kimlik-auditi",
        title: "4. Marka Kimliği Auditi: Mevcut Durumunuzu Nasıl Değerlendirirsiniz?",
        paragraphs: [
          "Marka kimliğinizin gücünü ölçmek için 'Brand Identity Audit' yapabilirsiniz. Bu audit 3 aşamadan oluşur. İlk aşama 'Görsel Tutarlılık Testi': Son 90 günde tüm platformlarda yayınladığınız içerikleri toplayın ve yan yana koyun. Logos kaldırıldığında, bir yabancı bunların aynı markaya ait olduğunu anlayabilir mi?",
          "İkinci aşama 'Ses Tutarlılık Testi': Tüm yazılı metinlerinizi (web sitesi, sosyal medya, e-posta, müşteri destek) toplayın ve okuyun. Hepsinde aynı kişilik konuşuyor mu? Yoksa web sitesinde kurumsal, Instagram'da esprili, e-postada bürokratik birbirine uymayan 3 farklı kişilik mi var?",
          "Üçüncü aşama 'Deneyim Tutarlılık Testi': Bir arkadaşınızdan ilk kez müşteri gibi markanızla etkileşime geçmesini isteyin (web sitesi ziyareti, sosyal medya inceleme, e-posta sorma, satın alma süreci). Sonunda deneyimini anlatmasını isteyin. Anlattığı his, sizin hedeflediğiniz kimlikle örtüşüyor mu?"
        ],
        callout: {
          type: "tip",
          title: "Hızlı Kimlik Testi",
          text: "Bir yabancıya markanızın 5 farklı platformdaki içeriklerini gösterin (logoları kapatarak). 'Bunlar aynı markaya mı ait?' sorusuna verdiği cevap, kimliğinizin gücünü gösterir."
        }
      },
      {
        id: "kimlik-olusturma-sureci",
        title: "5. Sıfırdan Marka Kimliği Oluşturma: 6 Adımlı Süreç",
        paragraphs: [
          "Marka kimliğini sıfırdan inşa etmek için sistematik bir süreç gerekir. 1. Adım: Temel soruları cevaplayın — Kime hizmet ediyoruz? Hangi sorunu çözüyoruz? Neden biz bu işi yapıyoruz? Rakiplerimizden ne farkımız var? 2. Adım: 3-5 temel marka değeri belirleyin — Örneğin 'Şeffaflık, Yenilikçilik, Erişilebilirlik'. Bu değerler her kararınızın filtresi olacak.",
          "3. Adım: Marka kişiliğini tanımlayın — Markanız bir insan olsaydı nasıl birisi olurdu? 3 sıfatla tanımlayın. 4. Adım: Görsel kimlik sistemini tasarlayın — Renk paleti, tipografi, fotoğraf dili, ikon seti ve layout kuralları. Mümkünse profesyonel bir marka tasarımcısıyla çalışın.",
          "5. Adım: Marka Sesi Kılavuzu (Voice Guide) oluşturun — Do's & Don'ts listesi, örnek cümleler, yasak kelimeler, emoji kuralları. 6. Adım: Tüm bunları tek bir 'Brand Book' (Marka Kitabı) belgesinde derleyin ve ekipteki herkesin erişimine açın. Bu belge yaşayan bir doküman olmalı; çeyrekte bir gözden geçirilmeli ve gerektiğinde güncellenmeli."
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // MAKALE 5: Marka Sesi Nasıl Oluşturulur?
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 5,
    slug: "marka-sesi-nasil-olusturulur",
    title: "Marka Sesi Nasıl Oluşturulur? (Brand Voice & Tone)",
    subtitle: "Kelimeleriniz markanızın yüzüdür. Her kanalda aynı karakteri korumanın formülü.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 10,
    publishedAt: "10 Eylül 2026",
    tags: ["Brand Voice", "Tone of Voice", "İçerik Yazımı", "Marka Dili", "Do and Dont"],
    excerpt: "Brand Voice ve Tone of Voice farkı, marka kişiliğinin yazıya dönüştürülmesi, kelime seçimi, Do/Don't kuralları, farklı platformlarda aynı kişiliğin korunması ve ekip uyumunun sağlanması.",
    sections: [
      {
        id: "voice-vs-tone",
        title: "1. Brand Voice ile Tone of Voice Arasındaki Fark",
        paragraphs: [
          "Bu iki kavram sıklıkla karıştırılır ama aralarında temel bir fark vardır. Brand Voice (Marka Sesi) değişmez; markanızın temel kişiliğidir. Bir insan nasıl her ortamda aynı kişilikle kalıyorsa, marka sesi de her platformda tutarlıdır. Eğitici misiniz, esprili misiniz, otoriter misiniz, samimi misiniz? Bu seçim kalıcıdır.",
          "Tone of Voice (Ses Tonu) ise duruma göre uyarlanır. Aynı insan bir cenaze töreninde farklı, bir doğum günü partisinde farklı konuşur; ama kişiliği değişmez. Aynı şekilde, müşterinize kutlama e-postası atarken heyecanlı ve neşeli olabilirsiniz; bir kargo gecikmesini çözerken empati dolu ve sakin olabilirsiniz. Ancak temel kişilik (sıcak, bilgili, net) asla değişmez.",
          "Pratik örnek: Mailchimp'in marka sesi 'zeki, eğlenceli ve insancıl'dır. Bu ses, bir özellik duyurusunda 'Yeni özelliğimiz inanılmaz havalı!' (heyecanlı ton), bir hata bildiriminde 'Bir şeyler ters gitti ama üzerinde çalışıyoruz, merak etmeyin' (sakinleştirici ton), bir blog yazısında 'E-posta pazarlamanın 7 sırrı' (eğitici ton) olarak farklı tonlarda ifade edilir ama her üçünde de aynı 'zeki ve insancıl' kişilik yansır."
        ]
      },
      {
        id: "kisiligi-tanimlamak",
        title: "2. Marka Kişiliğini 3 Sıfatla Tanımlamak",
        paragraphs: [
          "Marka sesinizi netleştirmenin en etkili yolu, markanızı 3 sıfatla tanımlamaktır. Neden 3? Çünkü 1 sıfat çok genel kalır, 5 sıfat ise tutarsızlık riski yaratır. 3 sıfat, yeterli derinlikte bir kişilik çerçevesi sunar. Örnekler: Nike → Cesur, İlham Veren, Kararlı. Innocent Smoothies → Esprili, Doğal, Cana Yakın. The Economist → Keskin, Entelektüel, Ironik.",
          "Bu 3 sıfatı belirlerken şu soruları sorun: Markanız bir insana dönüşse, bir yemek masasında nasıl konuşurdu? Hangi kelimeler doğal gelirdi? Hangi kelimeler 'yapay' hissettirirdi? Hangi tarz espri yapardı — ince ironi mi, sıcak mizah mı, yoksa hiç espri yapmaz mı?",
          "Sıfatlarınızı belirledikten sonra her birini bir spektrumda konumlandırın: 'Samimi' ne kadar samimi? Arkadaş gibi mi, komşu gibi mi, yoksa sırdaş gibi mi? 'Bilgili' ne düzeyde bilgili? Profesör gibi mi, ağabey/abla gibi mi, yoksa araştırmacı gazeteci gibi mi? Bu ayrıntı düzeyi, farklı içerik üreticilerin aynı sesi tutturmasını sağlar."
        ]
      },
      {
        id: "dodont-listesi",
        title: "3. Do's & Don'ts Sözlüğü: Marka Dil Kılavuzu",
        paragraphs: [
          "Marka kişiliğini operasyonel hale getirmenin en somut aracı, bir Do's & Don'ts (Yap / Yapma) sözlüğü oluşturmaktır. Bu sözlük kelime, cümle ve yaklaşım düzeyinde net kurallar içerir.",
          "Do's (Yap) örneği: 'Okuyucuya doğrudan hitap et (sen/siz)', 'Somut sayılar ve veriler kullan', 'Kısa ve aktif cümleler kur', 'Sektör jargonunu Türkçe karşılığıyla birlikte ver', 'Emojileri ölçülü ve tutarlı kullan (max 2 emoji per post)'. Don'ts (Yapma) örneği: 'Abartılı ve kanıtlanamaz ifadeler kullanma (en iyi, piyasanın lideri)', 'Pasif ve belirsiz dil kullanma (yapılabilir, düşünülebilir)', 'Rakip isimleri küçümseyici bağlamda anma', 'Uzun ve karmaşık cümleler kurma (bir cümlede max 25 kelime)', 'Klişe pazarlama kalıplarını kopyalama (Sınırlı süre! Kaçırma!)'.",
          "Bu sözlüğü bir Google Docs veya Notion sayfasında yaşayan bir belge olarak tutun. Her yeni ekip üyesine ilk gün paylaşın. Yeni içerik üretildiğinde bu belgeye uygunluğunu kontrol edin. Zamanla bu belge markanızın en değerli operasyonel varlığı haline gelecektir."
        ],
        callout: {
          type: "checklist",
          title: "Do's & Don'ts Kontrol Listesi",
          items: [
            "Markamız bir insan olsaydı nasıl selam verirdi? (Tespit edildi mi?)",
            "3 sıfatla konuşma tarzımız belirli mi? (örn: Bilgili, Samimi, Net)",
            "Yasaklı kelimeler listesi hazır mı?",
            "Hata anında nasıl özür dileriz? (Ton kılavuzu mevcut mu?)",
            "Emoji kurallarımız net mi? (Hangileri, kaç tane?)",
            "Jargon politikamız var mı? (Sektör terimleri Türkçe ile mi açıklanıyor?)"
          ]
        }
      },
      {
        id: "platformlarda-ses-uyarlama",
        title: "4. Her Platformda Aynı Kişilik, Farklı Format",
        paragraphs: [
          "LinkedIn'de 'Sevgili takipçiler, bugünkü eğlenceli içeriğimize hoş geldiniz 🎉' yazmak tuhaf kaçar. TikTok'ta 'Değerli iş ortaklarımız, stratejik bir perspektifle ele aldığımız bu konuyu...' demek ise izleyiciyi kaçırır. Her platformun kendi kültürü, dili ve beklentisi vardır; ancak temel kişilik değişmez.",
          "Aynı mesaj farklı platformlarda nasıl uyarlanır? Diyelim ki mesajınız 'E-posta açılma oranlarını artırmanın 3 yolu'. LinkedIn'de: 'Son 6 ayda müşterilerimizin e-posta açılma oranlarını ortalama %40 artırdık. İşte kanıtlanmış 3 strateji...' (kurumsal, veri odaklı ton). Instagram Carousel'de: 'E-postalarınızı kimse açmıyor mu? 😅 Swipe yapın, 3 dakikada çözüm bulun →' (samimi, görsel ağırlıklı ton). TikTok'ta: 'E-posta açılma oranım %8'den %47'ye çıktı. İşte yaptığım 3 şey...' (kişisel hikaye, doğrudan kameraya konuşma tonu).",
          "Dikkat edin: Üç versiyonda da markanın temel kişiliği (bilgili, samimi, net) aynı. Değişen sadece format, uzunluk ve platformun kültürel kodlarına uyum."
        ]
      },
      {
        id: "ekip-uyumu",
        title: "5. Ekip Uyumu: Herkesin Aynı Sesi Konuşması Nasıl Sağlanır?",
        paragraphs: [
          "Tek kişilik bir ekipte marka sesi tutarlılığı kolaydır; çünkü her şeyi siz yazarsınız. Ancak ekip büyüdükçe — freelance yazarlar, sosyal medya yöneticileri, müşteri destek ekibi, ajans ortakları devreye girdikçe — tutarlılığı korumak zorlaşır. İşte bu noktada sistemleştirme devreye girer.",
          "İlk araç: Marka Sesi Kılavuzu (Brand Voice Guide). 3-5 sayfalık bir belge: sıfatlar, do's/don'ts, platformlara özel örnekler, yasaklı kelimeler. İkinci araç: İçerik Onay Akışı (Approval Flow). Her içerik yayınlanmadan önce marka sesi kılavuzuna uygunluğunun kontrol edildiği bir adım. Üçüncü araç: Ses Tonu Şablonları. Farklı durumlarda (duyuru, kriz, kutlama, eğitim) kullanılacak hazır cümle kalıpları ve ton referansları.",
          "Tentamark'ın Brand DNA ve Brand Guardian modülleri tam olarak bu sorunu çözmek için tasarlanmıştır: AI, marka kılavuzunuzu öğrenir ve her üretilen veya düzenlenen içeriğin bu kılavuza uygunluğunu otomatik olarak kontrol eder. İnsan gözden kaçırabilir; tutarlı bir AI asla kaçırmaz."
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // MAKALE 6: Positioning Nedir?
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 6,
    slug: "positioning-nedir-zihinde-yer-edinmek",
    title: "Positioning Nedir? İnsanların Zihninde Bir Yer Kazanmak",
    subtitle: "Rakiplerle yarışmak yerine kendi kategorinizi yaratmanın stratejik temeli.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 10,
    publishedAt: "9 Eylül 2026",
    tags: ["Positioning", "Konumlandırma", "Farklılaşma", "Value Proposition", "Strateji"],
    excerpt: "Hedef kitle, kategori, rakipler, farklılaşma ve value proposition üzerinden positioning oluşturmanın adım adım rehberi. Al Ries'tan April Dunford'a modern konumlandırma stratejileri.",
    sections: [
      {
        id: "positioning-ozeti",
        title: "1. Konumlandırma Üründe Değil, Zihinde Yapılır",
        paragraphs: [
          "Al Ries ve Jack Trout'un 1981'de yayınladığı 'Positioning: The Battle for Your Mind' kitabı pazarlama tarihinin en etkili eserlerinden biridir. Temel tez şudur: Konumlandırma, ürününüze bir şey yapmak değildir; potansiyel müşterinin zihninde bir yer açmaktır. Ürününüz ne kadar iyi olursa olsun, müşterinin zihninde doğru yerde konumlanmadıysanız, rekabette kaybolursunuz.",
          "İnsan beyni her kategori için en fazla 3-5 marka hatırlar. 'Kola' dediğinizde Coca-Cola ve Pepsi; 'arama motoru' dediğinizde Google; 'elektrikli araba' dediğinizde Tesla ilk akla gelir. Bu zihinsel pozisyonlar son derece yapışkandır ve bir kez oluştuğunda değiştirmek çok zordur. Bu yüzden asıl soru 'Ürünümüz ne kadar iyi?' değil; 'Müşterinin zihninde hangi kategoriyi sahipleniyoruz?' sorusudur.",
          "April Dunford, 'Obviously Awesome' kitabında bu kavramı güncelleyerek 'Konumlandırma = Bağlam' formülünü sunar. Ürününüzü hangi bağlama yerleştirdiğiniz, müşterinin onu nasıl değerlendireceğini belirler. Aynı ürünü 'e-posta pazarlama aracı' olarak konumlandırırsanız Mailchimp ile rekabet edersiniz; 'müşteri ilişki platformu' olarak konumlandırırsanız farklı bir değer algısı yaratırsınız."
        ]
      },
      {
        id: "positioning-cumlesi",
        title: "2. Konumlandırma Cümlesi: Tek Cümlelik Stratejik Pusula",
        paragraphs: [
          "Etkili bir konumlandırma cümlesi şu formülü takip eder: '[Hedef kitle] için, [kategori] alanında [farklılaşma noktası] sunan [marka adı], [kanıtlayıcı unsur] sayesinde [temel vaat]i gerçekleştirir.' Karmaşık görünse de somut örnekle netleşir.",
          "Tentamark örneği: 'Büyüyen markalar ve ajanslar için, sosyal medya yönetimi alanında otonom AI Marketing Manager konseptini sunan Tentamark, marka DNA öğrenme teknolojisi sayesinde insan kalitesinde içerik üretimini dakikalara indirir.' Bu cümle tüm ekibin aynı stratejik yöne bakmasını sağlar; her pazarlama kararı bu cümleye uygunlukla test edilir.",
          "Konumlandırma cümlenizi oluştururken şu hataları yapmayın: Çok geniş kategori seçmek ('teknoloji şirketi' yerine 'yapay zeka destekli sosyal medya yönetim platformu'), çok belirsiz farklılaşma ('en iyi' yerine 'otonom AI Marketing Manager konseptini ilk sunan'), kanıtlanabilir olmayan vaatler ('devrim yaratıyor' yerine 'içerik üretim süresini %80 kısaltıyor')."
        ],
        callout: {
          type: "takeaway",
          title: "Konumlandırma Formülü",
          text: "[Hedef Kitle] için, [Kategori] alanında [Farklılaşma Noktası] sunan [Marka], [Kanıtlayıcı] sayesinde [Temel Vaat]i gerçekleştirir."
        }
      },
      {
        id: "farklilasmak",
        title: "3. Farklılaşma: Daha İyi Değil, Farklı Olmak",
        paragraphs: [
          "Çoğu marka 'daha iyi' olmaya çalışarak rekabet eder: Daha hızlı, daha ucuz, daha çok özellik. Bu yaklaşım, zaten güçlü bir liderle savaşmak anlamına gelir ve genellikle kaybedersiniz. Bunun yerine, tamamen farklı bir eksen açarak kendi kategorinizi yaratın.",
          "Stratejist Michael Porter'ın dediği gibi: 'Stratejinin özü, neyi yapmayacağınızı seçmektir.' Rakipleriniz 'herkese hizmet' vermeye çalışıyorsa, siz yalnızca küçük e-ticaret markalarına odaklanın. Rakipleriniz 'en çok özellik' yarışındaysa, siz 'en basit ve en hızlı kurulum' ile farklılaşın. Rakipleriniz 'self-servis' modeldeyse, siz 'tam hizmet yönetilen' modelle öne çıkın.",
          "Farklılaşmanın en güçlü formu, rakiplerin asla kopyalayamayacağı yapısal avantajlar üzerine kuruludur: Benzersiz veri seti (Tentamark'ın Brand DNA öğrenme teknolojisi), benzersiz süreç (otonom planlama-üretim-yayınlama döngüsü) veya benzersiz topluluk (aktif kullanıcı ekosistemi ve bilgi paylaşımı)."
        ]
      },
      {
        id: "rakip-matrisi",
        title: "4. Rakip Konumlandırma Matrisi: 2x2 Stratejik Harita",
        paragraphs: [
          "Konumlandırmanızı görselleştirmenin en etkili yolu, 2x2 matris oluşturmaktır. X ekseni ve Y ekseni olarak rakiplerinizin yarıştığı iki ana boyutu seçin. Örneğin sosyal medya yönetim araçları için X ekseni 'Basitlik ↔ Gelişmişlik', Y ekseni 'Manuel Kontrol ↔ Otonom AI' olabilir.",
          "Bu matrise tüm rakipleri yerleştirdiğinizde, genellikle kalabalık bölgeler (kırmızı okyanus) ve boş bölgeler (mavi okyanus) göreceksiniz. Hedefiniz, boş veya az kalabalık bir bölgeye konumlanmaktır. Buffer 'basit ve manuel' bölgesindedir; Hootsuite 'gelişmiş ve manuel' bölgesindedir. Tentamark ise 'gelişmiş ve otonom AI' bölgesinde benzersiz bir konumdadır.",
          "Bu matrisi çeyrekte bir güncelleyin; çünkü rakipler de konumlarını kaydırır. Sizin boş bulduğunuz bölgeye yeni oyuncular girerse, farklılaşma mesajınızı keskinleştirmeniz gerekir."
        ]
      },
      {
        id: "yeniden-konumlandirma",
        title: "5. Yeniden Konumlandırma: Ne Zaman ve Nasıl?",
        paragraphs: [
          "Bazen mevcut konumlandırmanız artık işe yaramaz hale gelir: Pazar değişmiştir, yeni rakipler girmiştir, müşteri beklentileri evrilmiştir veya ürününüz büyümüştür. Bu durumda yeniden konumlandırma (repositioning) gereklidir. Ancak bu, marka kimliğini sıfırdan yeniden inşa etmek anlamına gelmez; mevcut güçlü yanlarınızı yeni bir bağlama taşımak anlamına gelir.",
          "Başarılı yeniden konumlandırma örnekleri: Nintendo, 'çocuk oyun konsolu'ndan 'aile eğlencesi'ne geçiş yaptı (Wii). Netflix, 'DVD kiralama'dan 'streaming platformu'na, oradan 'içerik stüdyosu'na evrildi. Slack, 'şirket içi sohbet aracı'ndan 'iş birliği platformu'na konumlandı.",
          "Yeniden konumlandırma yaparken en kritik kural: Aşamalı geçiş yapın. Bir gecede tamamen farklı bir marka olmaya çalışmak, mevcut müşterilerinizi yabancılaştırır. Bunun yerine, yeni konumlandırma mesajlarını mevcut kimliğinizle harmanlayarak kademeli olarak kaydırın."
        ]
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════════
  // MAKALE 7-27: Kısa ama derin bölümlerle devam
  // (Strateji, Platform Rehberleri, Founder-Led, AI, Growth)
  // ═══════════════════════════════════════════════════════════════════
