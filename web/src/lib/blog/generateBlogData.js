const fs = require('fs');
const path = require('path');

const imageMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'blogImagesMap.json'), 'utf8'));

function getImagesForPost(id) {
  const list = imageMap[String(id)] || [];
  return list.map(f => `/blog/${id}/${f}`);
}

const rawArticles = [
  {
    id: 1,
    slug: "7-11-4-kurali-marka-guveni",
    title: "7-11-4 Kuralı: İnsanlar Bir Markaya Ne Zaman Güvenmeye Başlar?",
    subtitle: "Modern pazarlamada çoklu temas psikolojisi ve satın alma kararının arkasındaki gizli matematik.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 6,
    publishedAt: "14 Eylül 2026",
    tags: ["7-11-4 Kuralı", "Marka Güveni", "Müşteri Yolculuğu", "Çoklu Temas", "Pazarlama Psikolojisi"],
    featured: true,
    excerpt: "Bir müşterinin ilk gördüğü anda markanızdan satın alma ihtimali neden %1'in altındadır? 7 saatlik içerik tüketimi, 11 farklı temas noktası ve 4 ayrı kanal mantığıyla sürdürülebilir marka güveni inşa etmenin formülü.",
    sections: [
      {
        id: "nedir-bu-7-11-4",
        title: "1. 7-11-4 Çerçevesi Nedir ve Nereden Gelir?",
        paragraphs: [
          "Google'ın sıfırıncı temas anı (Zero Moment of Truth - ZMOT) araştırmalarına ve modern tüketici psikolojisine dayanan 7-11-4 kuralı; bir tüketicinin yabancı bir markaya güvenip cüzdanını açması için ortalama ne kadarlık bir etkileşime ihtiyaç duyduğunu formülize eder.",
          "Bu kural katı bir matematiksel doğa kanunu değildir; ancak dijital dünyanın gürültüsünde kaybolmadan müşterinin zihninde kalıcı bir yer edinmek için kullanılan en sağlam stratejik pusuladır. Formül 3 temel bileşenden oluşur: 7 Saatlik toplam temas süresi, 11 Bağımsız temas noktası ve 4 Farklı platform veya mecra."
        ],
        callout: {
          type: "takeaway",
          title: "Formülün Özeti",
          text: "7 Saat İçerik Tüketimi + 11 Ayrı Temas Noktası + 4 Farklı Kanal = Kırılmaz Marka Güveni ve Yüksek Dönüşüm Oranı."
        }
      },
      {
        id: "musteri-yolculugu-asamalari",
        title: "2. Müşteri Yolculuğu: Görmekten Satın Almaya",
        paragraphs: [
          "Geleneksel pazarlama anlayışı 'Gör ve Satın Al' yanılgısına düşer. Oysa tüketici zihni şu kronolojik aşamalardan geçer: Görmek → Tekrar Karşılaşmak → Tanımak → Güvenmek → Değerlendirmek → Satın Almak.",
          "İlk temas yalnızca dikkat çeker. Ancak güven, ikinci ve üçüncü temasların getirdiği bilişsel kolaylık (cognitive ease) sayesinde oluşur. İnsan beyni, daha önce karşılaştığı ve tehlikesiz bulduğu uyarıcıları otomatik olarak daha samimi ve güvenilir algılar."
        ],
        keyPoints: [
          "İlk Temas: Bilinçaltı markayı bir reklam olarak kaydeder.",
          "4. Temas: Markanın sektörü ve tarzı netleşir, yabancılık hissi kalkar.",
          "7. Temas: 'Ben bu markayı her yerde görüyorum, demek ki başarılılar' algısı yerleşir.",
          "11. Temas: Satın alma kararı mantıksallaştırılır ve direnç kırılır."
        ]
      },
      {
        id: "11-temas-noktasi",
        title: "3. 11 Temas Noktası Nasıl Tasarlanır?",
        paragraphs: [
          "11 temas noktasını tek bir platformda art arda reklam basarak oluşturamazsınız. Kullanıcıyı aynı kanalda spam'lemek güven değil, antipati doğurur.",
          "Doğru strateji, müşterinin günlük dijital rutininde organik olarak karşısına çıkmaktır: Bir Instagram Reels videosu, arama motorunda denk gelinen bilgilendirici bir blog yazısı, bir podcast bölümü, LinkedIn gönderisi, e-posta bülteni veya arkadaşının hikayesinde paylaşılan bir görsel."
        ],
        callout: {
          type: "tip",
          title: "Uygulanabilir Taktik",
          text: "Müşterinizin tüm bu temas noktalarını Excel tablolarında takip etmesi imkansızdır. İçeriklerinizi tek bir ana mesaj etrafında platformlara özel mikro parçalara bölerek yayınlayın."
        }
      },
      {
        id: "4-farkli-kanal",
        title: "4. Neden En Az 4 Farklı Platform Gereklidir?",
        paragraphs: [
          "Bir markayı sadece Instagram'da görmek ile aynı markayı Google aramasında, YouTube incelemesinde ve LinkedIn'de bir vaka analizinde görmek tüketici psikolojisinde çok farklı yankı bulur.",
          "Farklı kanallar markaya kurumsallık, derinlik ve her mecrada var olma otoritesi kazandırır. Bir kanalda eğlenen kullanıcı, diğer kanalda eğitilir; üçüncü kanalda ise doğrudan teklifle karşılaşır."
        ]
      }
    ]
  },
  {
    id: 2,
    slug: "marka-hafizasinin-psikolojisi",
    title: "Bir Marka Nasıl Akılda Kalır? Marka Hafızasının Psikolojisi",
    subtitle: "İnsan beyni markaları logolarla değil, çoklu duyu kodlarıyla ve tekrar eden görsel sinyallerle hatırlar.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 5,
    publishedAt: "13 Eylül 2026",
    tags: ["Marka Hafızası", "Nöropazarlama", "Distinctive Brand Assets", "Görsel Kimlik", "Tutarlılık"],
    excerpt: "İnsanların markaları yalnızca logodan değil; renk, ambalaj, fotoğraf dili, tipografi, slogan, ses tonu ve tekrar eden görsel unsurlardan hatırladığı anlatılacak. Distinctive brand assets, tutarlılık ve tekrar kavramları işlenecek.",
    sections: [
      {
        id: "beyin-markalari-nasil-kodlar",
        title: "1. İnsan Beyni Markaları Nasıl Kodlar?",
        paragraphs: [
          "Bilişsel psikolojiye göre insan beyni sürekli enerji tasarrufu yapmaya programlanmıştır. Bir markanın adını veya teknik vaatlerini ezberlemek beyin için maliyetlidir; ancak renkleri, formları ve ses tonunu hatırlamak son derece kolaydır.",
          "Tiffany mavisini, Milka morunu veya Coca-Cola kırmızı tonunu gördüğünüzde logoyu okumadan markayı tanırsınız. İşte bu güce pazarlamada Ayırt Edici Marka Varlıkları (Distinctive Brand Assets) denir."
        ]
      },
      {
        id: "tutarlilik-ve-tekrar",
        title: "2. Tutarlılık ve Tekrarın Nörolojik Gücü",
        paragraphs: [
          "Bir gün pembe neon tasarımlar, ertesi gün siyah-beyaz kurumsal postlar paylaşan bir hesap hafızada kalıcı bir iz bırakamaz. Her farklı tarz, beynin önceki temasla kurduğu sinirsel bağı koparır.",
          "Tutarlılık sıkıcı olmak anlamına gelmez; içerik değişebilir ancak görsel gramer, renk hiyerarşisi ve üslup daima tanıdık kalmalıdır."
        ],
        callout: {
          type: "takeaway",
          title: "Altın Kural",
          text: "Marka sahibi olarak siz kendi renklerinizden ve şablonlarınızdan sıkıldığınız an, müşteriniz onları henüz yeni yeni fark etmeye başlamıştır. Asla erkenden değiştirmeyin."
        }
      },
      {
        id: "marka-varliklari-envanteri",
        title: "3. Markanızın Ayırt Edici Varlıklarını Nasıl Belirlersiniz?",
        paragraphs: [
          "Her markanın en az 3 belirgin çıpası olmalıdır: 1. Baskın Renk Kodu, 2. Karakteristik Tipografi/Düzen Dili, 3. İletişim Açılışı veya Kanca Üslubu.",
          "Bu unsurları sosyal medya paylaşımlarınızın her bir karesine bilinçli olarak yerleştirdiğinizde, kullanıcı feed'i hızla kaydırırken bile gönderinin size ait olduğunu anında anlar."
        ]
      }
    ]
  },
  {
    id: 3,
    slug: "insanlar-neden-bazi-markalara-guvenir",
    title: "İnsanlar Neden Bazı Markalara Güvenir?",
    subtitle: "Güven rasyonel bir hesaplaşma değil, duygusal bir emniyet hissidir.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 5,
    publishedAt: "12 Eylül 2026",
    tags: ["Marka Güveni", "Sosyal Kanıt", "Şeffaflık", "Kullanıcı Yorumları", "Müşteri Deneyimi"],
    excerpt: "Marka güvenini oluşturan sosyal kanıt, tutarlılık, uzmanlık, şeffaflık, kaliteli deneyim, yorumlar ve tekrar eden olumlu temaslar anlatılacak.",
    sections: [
      {
        id: "guven-bilesenleri",
        title: "1. Marka Güveninin 4 Temel Taşıyıcı Kolonu",
        paragraphs: [
          "Bir kullanıcı yeni bir markanın web sitesine veya profiline girdiğinde ilk sorduğu soru 'Bu insanlar işini biliyor mu ve beni yarı yolda bırakırlar mı?' sorusudur.",
          "Bu soruya verilen cevap; 1. Yetkinlik (Expertise), 2. Dürüstlük ve Şeffaflık (Integrity), 3. İyiniyet ve Müşteri Odaklılık (Benevolence) ve 4. Tutarlılık (Consistency) sütunları üzerinden test edilir."
        ]
      },
      {
        id: "sosyal-kanitin-gucu",
        title: "2. Sosyal Kanıt ve Kolektif Onay Mekanizması",
        paragraphs: [
          "Kullanıcılar sizin kendi ürününüz hakkında ne söylediğinizle değil, diğer müşterilerin ne yaşadığıyla ilgilenir. Gerçek müşteri yorumları, ekran görüntüleri, video referansları ve vaka analizleri güven bariyerini kaldıran en büyük kaldıraçtır."
        ],
        callout: {
          type: "tip",
          title: "Güven Artırıcı İpucu",
          text: "Sadece 5 yıldızlı kusursuz yorumları değil; küçük bir aksaklığın nasıl çözüldüğünü anlatan gerçek müşteri hikayelerini de paylaşın. Kusursuzluk yapay durur, problem çözme şeffaflığı ise sarsılmaz güven yaratır."
        }
      }
    ]
  },
  {
    id: 4,
    slug: "marka-kimligi-nedir-logo-yapmaktan-fazlasi",
    title: "Marka Kimliği Nedir? Logo Yapmaktan Çok Daha Fazlası",
    subtitle: "Logo sadece bir rozettir; marka kimliği ise müşterinizin kalbinde ve aklında inşa ettiğiniz tüm dünyadır.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 6,
    publishedAt: "11 Eylül 2026",
    tags: ["Marka Kimliği", "Brand DNA", "Görsel Kimlik", "Positioning", "Müşteri Deneyimi"],
    excerpt: "Logo, visual identity, brand voice, positioning, values, customer experience ve Brand DNA arasındaki farklar anlatılacak.",
    sections: [
      {
        id: "logo-vs-kimlik",
        title: "1. Logo ile Marka Kimliği Arasındaki Uçurum",
        paragraphs: [
          "Bir grafik tasarımcıya 50 dolara bir logo çizdirmekle bir marka kimliği sahibi olunmaz. Logo, bir insanın pasaport fotoğrafı gibidir; kimlik ise o insanın karakteri, duruşu, esprileri ve değerleridir.",
          "Marka kimliği; web sitenizin yüklenme hızından müşteri destek ekibinizin attığı emojilere, paketleme bandınızın renginden Instagram kancalarınıza kadar hissedilen bütüncül ruhtur."
        ]
      },
      {
        id: "brand-dna-katmanlari",
        title: "2. Gerçek Bir Brand DNA Hangi Katmanlardan Oluşur?",
        paragraphs: [
          "Tentamark sisteminde de uyguladığımız Brand DNA mimarisi 5 kritik katmandan oluşur: Temel Misyon & Değerler, Görsel Palet ve Tipografi, Marka Sesi ve Tonu, Konumlandırma Matrisi ve Asla Yapılmayacaklar (Anti-Goals)."
        ]
      }
    ]
  },
  {
    id: 5,
    slug: "marka-sesi-nasil-olusturulur",
    title: "Marka Sesi Nasıl Oluşturulur? (Brand Voice & Tone)",
    subtitle: "Kelimeleriniz markanızın yüzüdür. Her kanalda aynı karakteri korumanın formülü.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 5,
    publishedAt: "10 Eylül 2026",
    tags: ["Brand Voice", "Tone of Voice", "İçerik Yazımı", "Marka Dili", "Do and Dont"],
    excerpt: "Brand Voice ve Tone of Voice farkı, marka kişiliğinin yazıya dönüştürülmesi, kelime seçimi, Do/Don't, iletişim tarzı ve farklı platformlarda aynı kişiliğin korunması anlatılacak.",
    sections: [
      {
        id: "voice-vs-tone",
        title: "1. Brand Voice ile Tone of Voice Farkı",
        paragraphs: [
          "Brand Voice (Marka Sesi) değişmez; markanızın temel kişiliğidir (Örn: Eğitici, samimi, esprili). Tone of Voice (Ses Tonu) ise duruma göre uyarlanır.",
          "Müşterinize kutlama e-postası atarken heyecanlı ve neşeli; bir kargo gecikmesini çözerken empati dolu ve sakin olursunuz. Ancak kişilik asla iki yüzlü veya zıt olmaz."
        ]
      },
      {
        id: "dodont-listesi",
        title: "2. Do's & Don'ts Sözlüğü Oluşturmak",
        paragraphs: [
          "Marka ekibinizin veya içerik üreticilerinizin aynı dili konuşması için net sınırlar çizilmelidir: Hangi kelimeler asla kullanılmaz? Hangi emojiler markaya uygundur? Kurumsal jargon mu yoksa sokak dili mi tercih edilir?"
        ],
        callout: {
          type: "checklist",
          title: "Marka Dili Kontrol Listesi",
          items: [
            "Markamız bir insan olsaydı nasıl selam verirdi?",
            "3 sıfatla konuşma tarzımız: Bilgili, Cana Yakın, Net.",
            "Yasaklı kelimeler listemiz hazır mı?",
            "Hata anında nasıl özür dileriz?"
          ]
        }
      }
    ]
  },
  {
    id: 6,
    slug: "positioning-nedir-zihinde-yer-edinmek",
    title: "Positioning Nedir? İnsanların Zihninde Bir Yer Kazanmak",
    subtitle: "Rakiplerle yarışmak yerine kendi kategorinizi yaratmanın stratejik temeli.",
    category: "marka-kimlik",
    categoryLabel: "Marka & Kimlik",
    readingTime: 6,
    publishedAt: "9 Eylül 2026",
    tags: ["Positioning", "Konumlandırma", "Farklılaşma", "Value Proposition", "Strateji"],
    excerpt: "Hedef kitle, kategori, rakipler, farklılaşma ve value proposition üzerinden positioning oluşturma anlatılacak.",
    sections: [
      {
        id: "positioning-ozeti",
        title: "1. Konumlandırma Üründe Değil, Zihinde Yapılır",
        paragraphs: [
          "Al Ries ve Jack Trout'un ölümsüzleştirdiği gibi: Konumlandırma, bir ürüne ne yaptığınız değil; potansiyel müşterinin zihninde ne inşa ettiğinizdir.",
          "Pazardaki rakipleriniz 'daha ucuz' veya 'daha hızlı' diyorsa, siz üçüncü bir eksen açmalısınız: 'En kolay', 'Yalnızca girişimciler için' veya 'Tamamen otonom'."
        ]
      }
    ]
  },
  {
    id: 7,
    slug: "2026-sosyal-medya-stratejisi",
    title: "2026 Sosyal Medya Stratejisi Nasıl Oluşturulur?",
    subtitle: "Algoritmalar değişti, organik reach dönüştü. Yeni dönemin kazanan oyun planı.",
    category: "strateji-planlama",
    categoryLabel: "Strateji & Planlama",
    readingTime: 8,
    publishedAt: "8 Eylül 2026",
    tags: ["Sosyal Medya Stratejisi", "2026 Trendleri", "KPI Analizi", "İçerik Planı", "Algoritmalar"],
    featured: true,
    excerpt: "Hedef → audience → platform → content pillars → üretim → takvim → yayın → KPI → analiz → optimizasyon süreci kapsamlı şekilde anlatılacak.",
    sections: [
      {
        id: "adim-adim-surec",
        title: "1. Sıfırdan 2026 Sosyal Medya Çerçevesi",
        paragraphs: [
          "Sosyal medyada başarılı olmak artık her gün rasgele bir post atmakla mümkün değildir. Başarı, uçtan uca kapalı devre bir sistem kurmayı gerektirir.",
          "Süreç 6 net halkadan oluşur: 1. İş Hedefi Belirleme, 2. Hedef Kitleyi Daraltma (ICP), 3. Platform Eşleştirme, 4. İçerik Sütunları, 5. Haftalık Üretim Rutini ve 6. Metrik Analizi."
        ]
      },
      {
        id: "kpi-ve-optimizasyon",
        title: "2. Gerçek KPI'ları İzlemek",
        paragraphs: [
          "Beğeniler ve takipçi sayısı vanity (gösteriş) metrikleridir. 2026'da bakmanız gereken metrikler: Kaydetme oranı, profil ziyaretinden web sitesine tıklama (CTR), DM üzerinden başlatılan sohbetler ve doğrudan satış dönüşümleridir."
        ]
      }
    ]
  },
  {
    id: 8,
    slug: "content-pillar-nedir-icerik-sutunlari",
    title: "Content Pillar Nedir? Sürdürülebilir İçerik Üretiminin Temeli",
    subtitle: "İçerik krizini sonsuza dek çözen 4 ayaklı içerik mimarisi.",
    category: "strateji-planlama",
    categoryLabel: "Strateji & Planlama",
    readingTime: 5,
    publishedAt: "7 Eylül 2026",
    tags: ["Content Pillar", "İçerik Sütunları", "İçerik Stratejisi", "Takvim Yönetimi"],
    excerpt: "Markanın 3–5 ana içerik alanı belirlemesi, bunları farklı formatlara dönüştürmesi ve içerik takvimine dağıtması anlatılacak.",
    sections: [
      {
        id: "pillar-nedir",
        title: "1. İçerik Sütunu (Content Pillar) Nedir?",
        paragraphs: [
          "İçerik sütunları, markanızın hedef kitlesine sunduğu temel uzmanlık ve değer alanlarıdır. Bir kahve markası için bu sütunlar: 1. Demleme Rehberleri (Eğitim), 2. Çiftlik Hikayeleri (Değer/Hikaye), 3. Kahve Ekipmanları (Ürün) ve 4. Barista Mizahı (Eğlence) olabilir.",
          "Bu sütunlar netleştiğinde haftalık içerik takvimini doldurmak bir bulmacayı çözmek kadar sistematik hale gelir."
        ]
      }
    ]
  },
  {
    id: 9,
    slug: "70-20-10-icerik-kurali",
    title: "70-20-10 İçerik Kuralı: Dengeli ve Güvenli Büyüme",
    subtitle: "Ne sürekli aynı şeyi paylaşın ne de her gün risk alın. İdeal içerik portföy dağılımı.",
    category: "strateji-planlama",
    categoryLabel: "Strateji & Planlama",
    readingTime: 5,
    publishedAt: "6 Eylül 2026",
    tags: ["70-20-10 Kuralı", "İçerik Dağılımı", "Viral Risk", "İstikrar"],
    excerpt: "Kanıtlanmış temel içerik, daha küçük yeni alanlar ve deneysel içeriklerin dengelenmesi anlatılacak. Bunun katı bir yasa olmadığı belirtilecek.",
    sections: [
      {
        id: "kuralin-anatomisi",
        title: "1. 70 - 20 - 10 Oranları Ne Anlama Gelir?",
        paragraphs: [
          "%70 Temel İçerik: Kitlenizin sizden beklediği, her zaman çalışan, kaydetme ve etkileşim getiren kanıtlanmış rehberler ve ürün bilgileri.",
          "%20 Büyüme ve Trendler: Sektördeki yenilikler, podcast klipleri, popüler akımlara kendi tarzınızla katılma.",
          "%10 Çılgın Deneyler: Daha önce hiç denemediğiniz cesur formatlar, mizahi çıkışlar veya ters köşe fikirler. Tutarsa yeni %70'iniz olur, tutmazsa hesabınıza zarar vermez."
        ]
      }
    ]
  },
  {
    id: 10,
    slug: "30-gunluk-sosyal-medya-icerik-plani-nasil-hazirlanir",
    title: "30 Günlük Sosyal Medya İçerik Planı Nasıl Hazırlanır?",
    subtitle: "Günde 1 saat harcamak yerine ayda 1 gün ayırarak tüm sosyal medya operasyonunu oturtun.",
    category: "strateji-planlama",
    categoryLabel: "Strateji & Planlama",
    readingTime: 7,
    publishedAt: "5 Eylül 2026",
    tags: ["İçerik Planı", "Aylık Takvim", "Toplu Üretim", "Batch Production", "Otomasyon"],
    excerpt: "Hedeflerden başlayarak pillar, haftalık tema, format, CTA ve platformların 30 günlük takvime dönüştürülmesi.",
    sections: [
      {
        id: "batch-uretim",
        title: "1. Toplu Üretim (Batch Production) Zihniyeti",
        paragraphs: [
          "Her gün sıfırdan düşünmek yaratıcı enerjiyi tüketir ve tükenmişlik (burnout) yaratır. Profesyonel markalar 30 günlük içeriklerini tek bir günde planlar, tasarlar ve zamanlar.",
          "Haftalık temalar belirleyin: 1. Hafta 'Problem Tanımı', 2. Hafta 'Derin Çözüm ve Rehber', 3. Hafta 'Müşteri Vaka Analizi', 4. Hafta 'Özel Lansman ve Teklif'."
        ]
      }
    ]
  },
  {
    id: 11,
    slug: "ayni-icerigi-her-platformda-paylasmak-neden-calismaz",
    title: "Aynı İçeriği Her Platformda Paylaşmak Neden Çalışmaz?",
    subtitle: "Kültürsüz çapraz paylaşım (cross-posting) markanıza neden sessizce zarar verir?",
    category: "strateji-planlama",
    categoryLabel: "Strateji & Planlama",
    readingTime: 6,
    publishedAt: "4 Eylül 2026",
    tags: ["Cross-posting", "Repurposing", "Platform Kültürü", "İçerik Dönüştürme"],
    excerpt: "Her platformun farklı kullanıcı davranışları, formatları ve kültürü; aynı ana fikrin platforma özel yeniden paketlenmesi anlatılacak.",
    sections: [
      {
        id: "platform-farklari",
        title: "1. Her Platformun Zihinsel Modu Farklıdır",
        paragraphs: [
          "Bir kullanıcı Instagram'da dinlenmek ve estetik görmek ister; LinkedIn'de kariyerini geliştirmek ve profesyonel içgörü kazanmak ister; TikTok'ta ise samimi bir hikaye veya hızlı bir şok arar.",
          "Aynı videoyu aynı metinle her yere kopyalayıp yapıştırdığınızda algoritma ve kullanıcı bunu 'tembel spam' olarak algılar. Yapılması gereken: Çekirdek fikri koruyup platformun yerel diline göre kurgulamaktır."
        ]
      }
    ]
  },
  {
    id: 12,
    slug: "instagram-marketing-rehberi-2026",
    title: "Instagram Marketing Rehberi 2026",
    subtitle: "Profil optimizasyonundan Reels kancalarına, DM otomasyonundan satışa eksiksiz kılavuz.",
    category: "platform-rehberleri",
    categoryLabel: "Platform Rehberleri",
    readingTime: 9,
    publishedAt: "3 Eylül 2026",
    tags: ["Instagram Rehberi", "Instagram SEO", "Carousel", "Reels", "DM Satış"],
    featured: true,
    excerpt: "Profil, Reels, Carousel, Stories, community, CTA, conversion ve analytics dahil uçtan uca Instagram marka stratejisi.",
    sections: [
      {
        id: "instagram-2026-mimarisi",
        title: "1. Instagram 2026 Algoritması Nasıl Çalışıyor?",
        paragraphs: [
          "Instagram artık bir takipçi akışı değil, öneri motorudur. Akıştaki içeriklerin %50'sinden fazlası takip edilmeyen hesaplardan gelir. Bu durum küçük ve yeni markalar için tarihin en büyük organik fırsatıdır.",
          "Algoritmada en yüksek puanı alan aksiyonlar: Gönderinin DM üzerinden arkadaşlara gönderilmesi (Shares) ve daha sonra başvurulmak üzere kaydedilmesidir (Saves)."
        ]
      }
    ]
  },
  {
    id: 13,
    slug: "instagram-reels-stratejisi-kanca-ve-buyume",
    title: "Instagram Reels Stratejisi: Kanca, Tutundurma ve Büyüme",
    subtitle: "İlk 3 saniyede izleyiciyi yakalayıp sonuna kadar izletmenin bilimsel formülü.",
    category: "platform-rehberleri",
    categoryLabel: "Platform Rehberleri",
    readingTime: 6,
    publishedAt: "2 Eylül 2026",
    tags: ["Instagram Reels", "Video Kanca", "Watch Time", "Retention", "Viral Büyüme"],
    excerpt: "Hook, retention, storytelling, CTA, seri içerikler ve viral görüntülenmenin marka büyümesinden farkı.",
    sections: [
      {
        id: "reels-kanca-anatomisi",
        title: "1. 3 Saniye Kuralı (Hook Psychology)",
        paragraphs: [
          "Reels'te başarısız olan videoların %80'i kötü olduğu için değil, girişte izleyiciyi durduramadığı için kaybetmektedir. 'Merhaba arkadaşlar bugün...' ile başlayan bir video doğrudan kaydırılır.",
          "Kanca zihinsel bir açık kapı (curiosity gap) yaratmalıdır: 'Markaların %90'ının yaptığı bu hata...', 'Neden kimse bu yöntemi konuşmuyor?', 'Eğer bir e-ticaret siteniz varsa...' gibi doğrudan hedef kitleye seslenen güçlü açılışlar kullanın."
        ]
      }
    ]
  },
  {
    id: 14,
    slug: "instagram-icerik-fikirleri-markalar-icin-50-fikir",
    title: "Instagram İçerik Fikirleri: Markalar İçin 50 Fikir",
    subtitle: "İlhamınız tükendiğinde başvurabileceğiniz, denenmiş ve çalışan 50 konsept.",
    category: "platform-rehberleri",
    categoryLabel: "Platform Rehberleri",
    readingTime: 8,
    publishedAt: "1 Eylül 2026",
    tags: ["İçerik Fikirleri", "Instagram Fikirleri", "Konsept Şablonları", "Yaratıcılık"],
    excerpt: "Education, storytelling, product, social proof, founder, BTS, community ve entertainment kategorilerinde 50 fikir.",
    sections: [
      {
        id: "50-fikir-kategorileri",
        title: "1. 8 Ana Kategoride 50 İçerik Reçetesi",
        paragraphs: [
          "İçerik üretmek sıfırdan ilham beklemek değil, çalışan çerçeveleri kendi markanıza uyarlamaktır. Eğitimden sahne arkasına, mit çürütmeden müşteri zaferlerine kadar en popüler 50 konsepti derledik."
        ],
        keyPoints: [
          "Eğitim: Sektörünüzdeki en yaygın 5 yanlış inanç.",
          "Sahne Arkası (BTS): Bir siparişin hazırlanma anı ve paketleme titizliği.",
          "Hikaye: Kurucunun bu markayı kurmaya karar verdiği o zor gün.",
          "Sosyal Kanıt: Müşterinin ürünümüzü kullanmadan önceki ve sonraki hali."
        ]
      }
    ]
  },
  {
    id: 15,
    slug: "instagram-begeni-degil-hangi-metrikler-onemli",
    title: "Instagram'da Beğeni Değil Hangi Metrikler Önemli?",
    subtitle: "Vanity metriklerden kurtulun. Ciroya ve gerçek marka değerine dönüşen göstergeler.",
    category: "platform-rehberleri",
    categoryLabel: "Platform Rehberleri",
    readingTime: 5,
    publishedAt: "31 Ağustos 2026",
    tags: ["Metrikler", "Instagram Analitik", "Saves and Shares", "ROI", "Dönüşüm"],
    excerpt: "Reach, retention, saves, shares, profile visits, CTR, leads ve conversion; vanity metric/business metric farkı.",
    sections: [
      {
        id: "vanity-vs-business",
        title: "1. Beğeniler Neden Yanıltıcıdır?",
        paragraphs: [
          "Bir gönderiye beğeni atmak kullanıcının yalnızca 0.2 saniyesini alır ve neredeyse hiçbir zihinsel bağlılık gerektirmez. Oysa bir gönderiyi 'Kaydetmek', 'Ben bu bilgiyi daha sonra hayatımda kullanacağım' demektir.",
          "Bir gönderiyi DM'den arkadaşına göndermek (Share) ise 'Bu tam seninle konuştuğumuz şey, buna mutlaka bakmalısın' anlamına gelir. Algoritma bu iki aksiyonu beğeniden 10 kat daha değerli puanlar."
        ]
      }
    ]
  },
  {
    id: 16,
    slug: "tiktok-marketing-rehberi-2026",
    title: "TikTok Marketing Rehberi 2026",
    subtitle: "Yapay kurumsallığı kırın. Gen-Z ve ana akım kitleyi yakalayan creator-native formül.",
    category: "platform-rehberleri",
    categoryLabel: "Platform Rehberleri",
    readingTime: 7,
    publishedAt: "29 Ağustos 2026",
    tags: ["TikTok Rehberi", "Creator-Native", "UGC", "Trendler", "TikTok SEO"],
    excerpt: "Discovery, hooks, trends, creator-native content, UGC, storytelling, conversion ve analytics.",
    sections: [
      {
        id: "tiktok-mantigi",
        title: "1. TikTok'un Mantığı: Takipçi Değil İlgi Grafiği",
        paragraphs: [
          "TikTok sıfır takipçili bir hesaba ilk videosunda 1 milyon izlenme verebilen tek platformdur. Çünkü kim olduğunuzla değil, videonuzun ilk 3 saniyede ne kadar durdurucu ve ne kadar sürükleyici olduğuyla ilgilenir.",
          "Pahalı stüdyo kameraları yerine iPhone ile çekilmiş, doğal ışık alan, samimi ve filtresiz videolar TikTok'ta daima cilalı reklam ajansı videolarını ezer geçer."
        ]
      }
    ]
  },
  {
    id: 17,
    slug: "tiktok-icin-30-video-fikri",
    title: "TikTok İçin 30 Yüksek Etkileşimli Video Fikri",
    subtitle: "Kameranın karşısına geçip ne anlatacağınızı bilemediğiniz anlar için 30 hazır senaryo.",
    category: "platform-rehberleri",
    categoryLabel: "Platform Rehberleri",
    readingTime: 6,
    publishedAt: "27 Ağustos 2026",
    tags: ["TikTok Fikirleri", "Kısa Video", "Video Senaryoları", "UGC Konseptleri"],
    excerpt: "Founder, tutorial, product demo, reaction, customer story, BTS, challenge, education ve UGC formatları ve 30 fikir.",
    sections: [
      {
        id: "tiktok-senaryo-listesi",
        title: "1. Viral Potansiyeli Yüksek 30 Kurgu",
        paragraphs: [
          "Ürün demosu yaparken sadece özellik sıralamayın; ürünü en zorlu koşullarda test edin. Müşteri yorumlarını okurken yüz ifadelerinizi gizlemeyin. Sahne arkasındaki ufak kazaları ve çözüm anlarını şeffafça paylaşın."
        ]
      }
    ]
  },
  {
    id: 18,
    slug: "linkedin-marketing-rehberi-2026",
    title: "LinkedIn Marketing Rehberi 2026",
    subtitle: "Düşünce liderliği, B2B lead üretimi ve kurumsal otorite inşası.",
    category: "platform-rehberleri",
    categoryLabel: "Platform Rehberleri",
    readingTime: 7,
    publishedAt: "25 Ağustos 2026",
    tags: ["LinkedIn B2B", "Thought Leadership", "Lead Generation", "Kurumsal İletişim"],
    excerpt: "Thought leadership, founder content, company content, networking, case studies, comments ve B2B lead generation.",
    sections: [
      {
        id: "linkedin-b2b-gucu",
        title: "1. LinkedIn Neden B2B'nin Açık Ara Lideridir?",
        paragraphs: [
          "Karar vericilerin (CEO'lar, direktörler, kurucular) günde ortalama 20 dakika geçirdiği tek platform LinkedIn'dir. Burada doğrudan ürün satmaya çalışmak yerine, sektörel vaka analizleri ve stratejik içgörüler paylaşarak otorite inşa edilir.",
          "Otorite inşa edildiğinde, potansiyel müşteriler soğuk arama yapmanıza gerek kalmadan doğrudan DM kutunuza teklif talebiyle gelir."
        ]
      }
    ]
  },
  {
    id: 19,
    slug: "founder-led-marketing-nedir",
    title: "Founder-Led Marketing Nedir? Kurucu İmzalı Büyüme",
    subtitle: "Logolar soğuktur, kurucunun hikayesi ise sıcaktır. Kişisel markayı şirket motoruna dönüştürmek.",
    category: "founder-led",
    categoryLabel: "Founder-Led",
    readingTime: 6,
    publishedAt: "23 Ağustos 2026",
    tags: ["Founder-Led Marketing", "Kurucu İletişimi", "Kişisel Marka", "Topluluk"],
    featured: true,
    excerpt: "Founder'ın şirketin görünür insan yüzü olması, uzmanlığını paylaşması, hikâye anlatması, güven oluşturması ve bunun şirket markasına aktarılması.",
    sections: [
      {
        id: "insan-insana-pazarlama",
        title: "1. İnsanlar Şirketlerle Değil, İnsanlarla Bağ Kurar",
        paragraphs: [
          "Apple denince akla Steve Jobs, Tesla denince Elon Musk gelir. Günümüzde en hızlı büyüyen SaaS ve D2C girişimlerinin ortak noktası; kurucularının aktif olarak sahada, kameranın önünde ve sosyal medyada olmasıdır.",
          "Kurucu olarak sektörel vizyonunuzu, aldığınız riskleri ve ürünün arkasındaki felsefeyi anlattığınızda, şirketiniz rakiplerinden anında ayrışır."
        ]
      }
    ]
  },
  {
    id: 20,
    slug: "build-in-public-nedir",
    title: "Build in Public Nedir? Şeffaf Geliştirme Kültürü",
    subtitle: "Hatalarınızı, metriklerinizi ve büyüme yolculuğunuzu canlı paylaşarak ilk 1.000 fanınızı kazanın.",
    category: "founder-led",
    categoryLabel: "Founder-Led",
    readingTime: 6,
    publishedAt: "21 Ağustos 2026",
    tags: ["Build in Public", "Şeffaflık", "Topluluk İnşası", "Girişimcilik", "Erken Müşteri"],
    excerpt: "Fikirden ürüne kadar gelişimi, hataları, metrikleri ve öğrenilenleri paylaşmak; topluluk ve erken müşteri oluşturmak.",
    sections: [
      {
        id: "seffaf-buyume",
        title: "1. Neden Süreci Paylaşmak Nihai Üründen Daha Çekicidir?",
        paragraphs: [
          "İnsanlar bitmiş ve mükemmel bir ürün lansmanını sadece tüketir; ancak o ürünün sıfırdan adım adım nasıl zorluklarla inşa edildiğini izleyen bir topluluk ürünü kendi çocuğu gibi sahiplenir.",
          "Gelir rakamlarını, yapılan tasarım hatalarını, sunucu çökmelerini ve kazanılan ilk 10 müşteriyi şeffafça anlatmak inanılmaz güçlü bir organik kalkan oluşturur."
        ]
      }
    ]
  },
  {
    id: 21,
    slug: "x-twitter-marka-buyutme",
    title: "X'te (Twitter) Marka Büyütme: Yayın Değil Sohbet",
    subtitle: "Yalnızca link atıp kaçmayı bırakın. Gerçek zamanlı diyaloglarla otorite kurmanın kuralları.",
    category: "platform-rehberleri",
    categoryLabel: "Platform Rehberleri",
    readingTime: 5,
    publishedAt: "19 Ağustos 2026",
    tags: ["X Pazarlama", "Twitter Stratejisi", "Sohbet Stratejisi", "Viral Düşünce Liderliği"],
    excerpt: "Broadcast etmek yerine conversation, reply strategy, short-form thought leadership, community ve gerçek zamanlı iletişim.",
    sections: [
      {
        id: "reply-stratejisi",
        title: "1. Yanıt (Reply) Stratejisi ile Sıfırdan Kitle Çekmek",
        paragraphs: [
          "Sıfır takipçili bir hesapla sadece tweet atarak büyüyemezsiniz. X'te büyümenin en hızlı yolu; sektörünüzdeki büyük hesapların tweet'lerine değerli, düşündürücü ve uzmanlık dolu yanıtlar vermektir.",
          "Her kaliteli yanıt, yüzlerce sektör profesyonelinin profilinizi ziyaret etmesini ve sizi takip etmesini sağlar."
        ]
      }
    ]
  },
  {
    id: 22,
    slug: "ai-marketing-nedir-2026-rehberi",
    title: "AI Marketing Nedir? 2026 Kapsamlı Rehber",
    subtitle: "Yapay zeka metin yazdırmaktan ibaret değildir. Araştırmadan otonom dağıtıma tüm ekosistem.",
    category: "yapay-zeka",
    categoryLabel: "Yapay Zeka (AI)",
    readingTime: 8,
    publishedAt: "17 Ağustos 2026",
    tags: ["AI Marketing", "Yapay Zeka Pazarlama", "Otomasyon", "Kişiselleştirme", "2026 Strateji"],
    featured: true,
    excerpt: "Research, competitor analysis, audience intelligence, strategy, content creation, personalization, automation ve analytics.",
    sections: [
      {
        id: "yapay-zeka-evrimi",
        title: "1. AI Marketing'in 4 Evrimsel Aşaması",
        paragraphs: [
          "1. Aşama: Basit metin üreticileri (ChatGPT prompt kopyalama).",
          "2. Aşama: Görsel ve video üretimi (Midjourney, Runway).",
          "3. Aşama: Veri analitiği ve kitle içgörüsü.",
          "4. Aşama (2026): Otonom AI Marketing Manager — Markayı tanıyan, strateji çizen, takvim yöneten, yayınlayan ve sonuçlardan ders çıkarıp kendini eğiten otonom ajanlar."
        ]
      }
    ]
  },
  {
    id: 23,
    slug: "ai-marketing-manager-nedir",
    title: "AI Marketing Manager Nedir? Otomasyondan Otonom Zekaya",
    subtitle: "Scheduler veya Generator değil; markanız için stratejik kararlar alan yapay zeka yöneticisi.",
    category: "yapay-zeka",
    categoryLabel: "Yapay Zeka (AI)",
    readingTime: 6,
    publishedAt: "15 Ağustos 2026",
    tags: ["AI Marketing Manager", "Tentamark", "Otonom Pazarlama", "Brand DNA", "Geleceğin Pazarlaması"],
    excerpt: "Scheduler → generator → manager farkı ve AI Marketing Manager'ın markayı anlaması, karar vermesi, içerik oluşturması, yayınlaması ve performanstan öğrenmesi.",
    sections: [
      {
        id: "manager-kavrami",
        title: "1. Zamanlayıcılar ve Üreticiler Neden Yetersiz Kaldı?",
        paragraphs: [
          "Bir Buffer veya Hootsuite içeriğinizi planlar ama ne paylaşacağınızı bilmez. Bir ChatGPT metin yazar ama markanızın DNA'sından, rakiplerinizden veya görsel uyumunuzdan bihaberdir.",
          "AI Marketing Manager (Tentamark'ın vizyonu); bir insan pazarlama direktörü gibi markanızın web sitesini tarar, ürünlerinizi anlar, hedef kitlenizi analiz eder, 30 günlük stratejinizi kurgular ve tüm kanallara dağıtır."
        ]
      }
    ]
  },
  {
    id: 24,
    slug: "0dan-marka-olusturmak-ilk-100-musteri",
    title: "0'dan Marka Oluşturmak: İlk 100 Müşteriye Giden Yol",
    subtitle: "Pazarlama bütçeniz sıfırken ilk 100 ödeyen kullanıcıyı bulmanın adım adım taktiği.",
    category: "growth-girisim",
    categoryLabel: "Büyüme & Girişim",
    readingTime: 8,
    publishedAt: "13 Ağustos 2026",
    tags: ["İlk 100 Müşteri", "Sıfırdan Büyüme", "ICP", "Outreach", "Do Things that Dont Scale"],
    excerpt: "ICP, problem, positioning, MVP, landing page, distribution, outreach, first customers, feedback ve iteration.",
    sections: [
      {
        id: "olceksiz-isler",
        title: "1. Paul Graham İlkesi: Ölçeklenmeyen İşler Yapın",
        paragraphs: [
          "İlk 100 müşteriyi otomatik reklamlarla bulamazsınız. İlk müşteriler; manuel mesajlarla, kurucunun birebir yaptığı demolarla, topluluk forumlarında yardım ederek ve insanların sorunlarını bizzat dinleyerek kazanılır.",
          "Bu ilk 100 kişi sadece para ödeyen kullanıcılar değil; ürününüzü geliştirecek en değerli geri bildirim ortaklarınızdır."
        ]
      }
    ]
  },
  {
    id: 25,
    slug: "product-market-fit-nedir",
    title: "Product-Market Fit (PMF) Nedir ve Nasıl Ölçülür?",
    subtitle: "Pazarın ürününüzü elinizden çekip aldığı o sihirli eşiğin göstergeleri.",
    category: "growth-girisim",
    categoryLabel: "Büyüme & Girişim",
    readingTime: 6,
    publishedAt: "11 Ağustos 2026",
    tags: ["PMF", "Product Market Fit", "Retention", "Sean Ellis Testi", "Girişimcilik"],
    excerpt: "Problem-solution fit, retention, repeat usage, referrals, willingness to pay ve gerçek customer pull.",
    sections: [
      {
        id: "pmf-isaretleri",
        title: "1. PMF'e Ulaştığınızı Nasıl Anlarsınız?",
        paragraphs: [
          "Marc Andreessen'in dediği gibi: PMF'e ulaşmadığınızda bunu sürekli sorgularsınız; PMF'e ulaştığınızda ise bunu sorgulamaya vaktiniz olmaz çünkü sunucular çöker, müşteri destek taleplerine yetişemezsiniz.",
          "En net gösterge retention (elde tutma) eğrisinin düzleşmesidir: Kullanıcılar ürünü denedikten aylar sonra bile aktif olarak kullanmaya devam ediyorsa PMF vardır."
        ]
      }
    ]
  },
  {
    id: 26,
    slug: "growth-loop-nedir-funneldan-farki",
    title: "Growth Loop Nedir? Funnel'dan Farkı Ne?",
    subtitle: "Doğrusal huniye sürekli para akıtmak yerine kendi kendini besleyen büyüme döngüleri.",
    category: "growth-girisim",
    categoryLabel: "Büyüme & Girişim",
    readingTime: 6,
    publishedAt: "9 Ağustos 2026",
    tags: ["Growth Loop", "Funnel Karşılaştırması", "Bileşik Büyüme", "Viral Döngü", "Product-Led Growth"],
    excerpt: "Linear funnel ile müşterinin yeni müşteri getirdiği compounding growth loop arasındaki fark; referral, UGC ve product-led loop örnekleri.",
    sections: [
      {
        id: "loop-vs-funnel",
        title: "1. Neden Funnel'lar Ölüyor ve Loop'lar Kazanıyor?",
        paragraphs: [
          "Geleneksel funnel lineerdir: Üste 1.000 kişi girer, alttan 10 müşteri çıkar; ertesi ay 10 müşteri daha almak için tekrar 1.000 kişiye para ödemeniz gerekir.",
          "Growth Loop ise daireseldir: Gelen her kullanıcı ürünü kullandıkça yeni bir kullanıcı davet eder veya dışarıya bir içerik yayar (Örn: TikTok filigranı, Typeform imzası, Notion paylaşım linki). Büyüme bileşik (compounding) faiz gibi katlanarak artar."
        ]
      }
    ]
  },
  {
    id: 27,
    slug: "iyi-urun-neden-tek-basina-yetmez-distribution-problemi",
    title: "İyi Ürün Neden Tek Başına Yetmez? Distribution Problemi",
    subtitle: "'Ürünü iyi yaparsan müşteriler kendiliğinden gelir' efsanesinin sonu.",
    category: "growth-girisim",
    categoryLabel: "Büyüme & Girişim",
    readingTime: 7,
    publishedAt: "7 Ağustos 2026",
    tags: ["Distribution", "Dağıtım Problemi", "Go-to-Market", "Girişimcilik Gerçekleri"],
    excerpt: "İyi ürünün insanların ürünü keşfetmesini garanti etmediği; SEO, social, founder content, community, outbound, partnership, referral ve paid acquisition'ın distribution sistemini oluşturduğu anlatılacak.",
    sections: [
      {
        id: "dagitim-onemi",
        title: "1. Dağıtım Olmadan En İyi Ürün Bile Çöptür",
        paragraphs: [
          "Teknoloji mezarlıkları, pazar liderinden kat be kat daha iyi kodlanmış ve tasarlanmış ama kimsenin keşfedemediği ürünlerle doludur.",
          "İlk kez girişim kuranlar ürüne odaklanır; deneyimli girişimciler ise dağıtım kanallarına (distribution channels) odaklanır. Dağıtım; içerik stratejinizi, SEO altyapınızı, ortaklıklarınızı ve sosyal medya varlığınızı kapsayan hayati damar sistemidir."
        ]
      }
    ]
  }
];

const defaultAuthor = {
  name: "Tentamark Strateji Ekibi",
  role: "Pazarlama ve AI Direktörlüğü",
  avatar: "/brand/tentamark-mark.svg",
  bio: "Tentamark büyüme ekibi; yapay zeka, sosyal medya algoritmaları ve marka psikolojisi üzerine derinlemesine içgörüler ve uygulanabilir büyüme taktikleri üretir."
};

const fullPosts = rawArticles.map(art => {
  const images = getImagesForPost(art.id);
  const coverImage = images[0] || "/brand/tentamark-mark.svg";
  
  // Attach images to sections
  const sectionsWithImages = art.sections.map((sec, idx) => {
    const secImage = images[idx + 1] || null;
    return {
      ...sec,
      image: secImage ? {
        url: secImage,
        caption: `${art.title} — İlgili Analiz ve Stratejik İnfografik`,
        alt: `${art.title} infografik ${idx + 1}`
      } : undefined
    };
  });

  const tableOfContents = art.sections.map(s => ({
    id: s.id,
    title: s.title
  }));

  return {
    ...art,
    author: defaultAuthor,
    coverImage,
    images,
    tableOfContents,
    sections: sectionsWithImages
  };
});

const fileHeader = `// GENERATED FILE - TENTAMARK BLOG DATA (27 In-depth Marketing Articles)
import { BlogPost } from "./blogTypes";

export const BLOG_POSTS: BlogPost[] = ${JSON.stringify(fullPosts, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'blogData.ts'), fileHeader, 'utf8');
console.log('Successfully generated blogData.ts with', fullPosts.length, 'articles');
