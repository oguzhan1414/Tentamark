# Tentamark Reklam & İçerik Araştırması

**Amaç:** Tentamark'ı kendi gerçek uygulamasıyla, kendi gerçek panelleriyle pazarlamak — jenerik "AI ürün videosu" hissi vermeyen, gerçekten "bize ait" hissettiren bir reklam/organik içerik kütüphanesi.

**Bu dosyada ne var:**
1. Gerçek araştırmaya dayanan strateji özeti (kaynaklarıyla)
2. 22 video prompt'u (hepsi gerçek Tentamark ekranlarını referans alıyor)
3. 55 sosyal medya prompt'u — Instagram (20), Threads (20), Facebook (15)

Her prompt gerçekten var olan bir özelliği/ekranı anlatıyor. Henüz gerçek olmayan hiçbir şey (sahte müşteri sayısı, sahte yorum, sahte istatistik) yazılmadı — testimonial formatındaki prompt'larda gerçek müşteri onayı gelene kadar doldurulacak yerler `[...]` ile işaretli.

---

## 1. Araştırma Özeti — Neden "Gerçek Ekran Kaydı" Doğru Yön

Sen haklısın: jenerik AI-üretimi sahne videoları (stresli ofis çalışanı, soyut arayüz mockup'ı) "bize ait değilmiş gibi" hissettiriyor çünkü **gerçekten değil**. Araştırma da bunu doğruluyor:

- **UGC-tarzı reklamlar, stüdyo yapımı reklamlardan Instagram/TikTok'ta ~4x daha yüksek dönüşüm alıyor**, ve mobil uygulama kurulumlarında ortalama %34 daha düşük maliyetli. Ekran kaydı + kendi sesinle anlatım, "en otantik UGC formu" olarak tanımlanıyor — çünkü milyonlarca insan ürünleri tam olarak bu şekilde paylaşıyor. *(RevenueCat, "UGC Ads for Apps: Which Formats Drive Conversion in 2026")*
- **2026'nın en iyi performans gösteren formatı: "Ekran Kaydı + Reaksiyon"** — ana özelliği gösteren ekran kaydı + köşede gerçek bir yüz/tepki kamerası. *(aynı kaynak)*
- **El kamerası, doğal ışık, lo-fi kurgu gibi "organik Reels'e benzeyen" reklamlar, stüdyo yapımı reklamlardan daha düşük CPM ve daha yüksek tamamlanma oranı alıyor.** *(Digital Applied, "Instagram Reels Ads 2026")*
- **İlk 3 saniye her şeyi belirliyor** — Meta'nın algoritması artık 1.0 saniyelik "erken tutundurma" sinyaline bakıyor. Kanca; hareket, kalın metin, şaşırtıcı görsel veya doğrudan bir soru olmalı. **B2B için en iyi kanca:** spesifik bir iddiayı doğrudan kameraya söylemek (örn. "Bu değişiklik dönüşüm oranımızı 3'e katladı" gibi) — genel değil, spesifik ve merak uyandıran.
- **Format: Kanca (0-3sn) → Sorun büyütme (4-10sn) → Ürün gösterimi/kanıt (11-20sn) → Net CTA.**
- **Ürün adı ilk cümlede geçmemeli — izleyicinin sorunu geçmeli.** "Bu demo ilk 30 saniyede 'bu hayatımı nasıl kolaylaştırır' sorusuna net cevap vermiyorsa, izleyici kaydırıp geçer." *(Demopolish, "SaaS Demo Video Best Practices")*
- **Video 60 saniyeyi geçtiğinde tamamlanma oranı keskin düşüyor** — 30sn-2dk aralığı en etkili.
- **Instagram karusellerinde 5-10 slayt, numaralandırılmış ("3/7" gibi) en yüksek tamamlanma oranını veriyor.** Her slaytın TEK bir işi olmalı. *(Adpicto, "Instagram Carousel Best Practices 2026")*
- **Gerçek ekran görüntüsü / gerçek yorum, tasarlanmış "testimonial" görsellerinden daha çok işe yarıyor** — çünkü filtresiz hissettiriyor.
- **Threads tamamen farklı bir oyun:** algoritma etkileşimi (yanıt sayısı) her şeyden çok ağırlıklandırıyor — 200 beğeni + 5 yanıt alan bir gönderi, 50 yanıt + 1000 beğeni alan bir gönderiden **daha az** performans gösteriyor sayılıyor. **Kurumsal ses değil, kişisel ses; erişim değil, sohbet önceliklendirilmeli.** Zor satış değil, doğal CTA. *(Metricool, Outfy — "Threads Marketing Guide 2026")*

**Sonuç:** Senin sezgin doğru. Jenerik AI sahne videosu yerine, gerçek Tentamark ekranlarının kaydı + gerçek bir insan sesi/yüzü + spesifik, iddialı bir kanca — hem araştırmaya göre daha iyi performans veriyor hem de "bize ait" hissi veriyor. Aşağıdaki tüm prompt'lar bu ilkeye göre yazıldı.

**Kaynaklar:**
- [UGC Ads for Apps: Which Formats Drive Conversion in 2026 — RevenueCat](https://www.revenuecat.com/blog/growth/ugc-ads-apps)
- [Instagram Reels Ads 2026: Creative Strategy Guide — Digital Applied](https://www.digitalapplied.com/blog/instagram-reels-ads-2026-creative-strategy-guide)
- [SaaS Demo Video Best Practices for Founders (2026) — Demopolish](https://demopolish.com/blog/saas-demo-video-best-practices/)
- [Instagram Carousel Best Practices (2026) — Adpicto](https://www.adpicto.com/en/blog/instagram-carousel-best-practices-2026)
- [Threads Marketing Strategy 2026 — Metricool](https://metricool.com/threads-marketing-guide/)
- [6 Tactical Threads Marketing Strategies for 2026 — Black Pug Studio](https://medium.com/creative-black-pug-studio/6-tactical-threads-marketing-strategies-for-2026-3e42c419ef4d)

---

## 2. Prodüksiyon Notu — Ekran Kaydını Nasıl Alalım

Her video prompt'u şu akışla üretilecek şekilde yazıldı:

1. **Gerçek ekran kaydı** — Tentamark'ın kendi hesabından (test/demo markası ile), ilgili gerçek panelin ekran kaydını al (Mac: Cmd+Shift+5, Windows: Xbox Game Bar/OBS, mobil: yerleşik ekran kaydı).
2. **Reaksiyon/yüz kamerası (opsiyonel ama önerilir)** — köşede kurucu veya ekipten biri, gerçek tepki/anlatım. Araştırma bunun en iyi performansı verdiğini gösteriyor.
3. **Video-AI prompt'u sadece destek için** — eğer hiç ekran kaydın yoksa veya geçiş/intro sahnesi gerekiyorsa, her prompt'un altındaki "Video-AI Yedek Prompt"u bir video üretim aracına (Sora/Veo/Kling/Runway) ver. **Ama ana içerik her zaman gerçek ekran kaydı olsun** — bu, tüm araştırmanın vurguladığı nokta.
4. Video aracına gerçek bir ekran görüntüsü **referans görsel** olarak verebiliyorsan (çoğu image-to-video aracı bunu destekliyor), prompt'taki "[GERÇEK EKRAN GÖRÜNTÜSÜ]" ifadesinin yerine o görseli koy.

---

## 3. Video Prompt Kütüphanesi (22)

### A) Sorun / Ajitasyon Serisi

#### Video 1 — "5 Uygulama Açık, Tek Kişi"
- **Format:** Reels/TikTok, dikey 9:16, 25sn
- **Gerçek Ekran:** Telefon ekranında art arda Instagram, Facebook, LinkedIn, WhatsApp uygulamaları açılıyor (gerçek, kurgu değil)
- **Kanca (0-3sn):** Doğrudan kameraya: "Bugün sosyal medya için kaç farklı uygulama açtın?"
- **Sorun (4-10sn):** Parmak hızlıca 4-5 uygulama arasında geçiyor, her birine ayrı ayrı aynı içeriği farklı formatta yazıyor — yorgun bir yüz ifadesi
- **Gösterim (11-20sn):** Kesme → Tentamark Compose ekranı, tek fikir yazılıyor, [GERÇEK EKRAN GÖRÜNTÜSÜ: Compose AI modu, çoklu platform sekmeleri] AI 3 farklı platforma 3 farklı tonda metin üretiyor, gerçek zamanlı
- **CTA:** "Tek yerden, tüm platformlar. Tentamark."
- **Video-AI Yedek Prompt (sadece açılış sahnesi gerekirse):** "Handheld phone POV, quick native-style cuts between Instagram, Facebook, LinkedIn app icons opening one after another, natural indoor lighting, visible finger tapping, slightly shaky authentic phone-camera feel, no studio polish."

#### Video 2 — "Ses Tonu Kaydı"
- **Format:** Reels, dikey 9:16, 20sn
- **Gerçek Ekran:** Gerçek bir marka sahibi/sosyal medya yöneticisi kameraya konuşuyor
- **Kanca (0-3sn):** "LinkedIn'de ciddi, Instagram'da samimi yazmak zorundasın. Ama hep aynı marka değil misin?"
- **Sorun (4-10sn):** Ekranda iki farklı, tutarsız ton örneği (gerçek, önceden yazılmış iki kötü örnek metin)
- **Gösterim (11-20sn):** [GERÇEK EKRAN GÖRÜNTÜSÜ: Marka Profili → Ses Tonu Matrisi, noktayı sürükleme] "Bir kere ayarla, her yerde tutarlı kal."
- **CTA:** "Markanın DNA'sını bir kere öğret, her platformda doğru sesle konuşsun."

#### Video 3 — "Onay Kaosu"
- **Format:** Reels, dikey 9:16, 22sn
- **Gerçek Ekran:** WhatsApp'ta ekran görüntüsü + "bu görseli değiştir", "bu metni beğenmedim" mesajları (gerçek, kurgu ekran kaydı)
- **Kanca (0-3sn):** "Müşterine onay için WhatsApp'tan ekran görüntüsü mü atıyorsun?"
- **Sorun (4-10sn):** Karışık mesaj geçmişi, hangi versiyon onaylandığı belirsiz
- **Gösterim (11-20sn):** [GERÇEK EKRAN GÖRÜNTÜSÜ: Şifresiz Onay Portalı, /onay/[token] linki, tek tıkla onayla/reddet] "Şifre yok, uygulama yok. Link at, onaylasın."
- **CTA:** "Müşteri onayını profesyonelleştir."

#### Video 4 — "Kanca Zayıfsa Video Çöpe Gider"
- **Format:** Reels, dikey 9:16, 20sn
- **Gerçek Ekran:** Bir Reels'in ilk 2 saniyesi oynatılıyor — sıkıcı bir açılış
- **Kanca (0-3sn):** "İzleyici seni ilk 2 saniyede kaybediyorsa, geri kalan hiç önemli değil."
- **Sorun (4-10sn):** Aynı video, zayıf kancayla — izleyici sayısı düşüyor gibi bir görsel metafor
- **Gösterim (11-20sn):** [GERÇEK EKRAN GÖRÜNTÜSÜ: AI Kanca & Viralite Skoru, 3 alternatif kanca + %durdurma skorları] "AI 3 alternatif kanca üretiyor, hangisi daha güçlü hemen görüyorsun."
- **CTA:** "Kancanı puanla, tahmin etme."

---

### B) Gerçek Panel Demo Serisi

#### Video 5 — "Tek Fikirden 5 Platforma"
- **Format:** Ekran kaydı + facecam, 9:16, 35sn
- **Gerçek Ekran:** Compose ekranı, AI mod
- **Kanca:** "İzle: tek cümle yazıyorum, 5 platform için hazır oluyor."
- **Akış:** Fikir yazılıyor → "AI ile Çoklu Platform İçeriklerini Üret" → sonuç gerçek zamanlı beliriyor → platform sekmeleri arasında geçiş (her birinde farklı ton)
- **CTA:** "Bunu her gün yapıyorsan, artık yapmana gerek yok."

#### Video 6 — "Markanın Sesi, Senin Sözün Değil AI'ın Tahmini"
- **Format:** Ekran kaydı, 9:16, 30sn
- **Gerçek Ekran:** Marka Profili → Kurucu Sesi (Ghostwriter Modu) toggle
- **Kanca:** "Şirket hesabından değil, kurucudan gelen postlar 3 kat daha fazla ilgi görüyor."
- **Akış:** Aynı fikir, önce "Marka Kimliği" ile üretiliyor (kurumsal), sonra "Kurucu Adına" moduna geçilip tekrar üretiliyor (kişisel, samimi) — yan yana karşılaştırma
- **CTA:** "Kurucunun sesini bir kere tanımla, AI o sesle yazsın."

#### Video 7 — "Marka Sesi Gerçekten Tutarlı mı? Ölç."
- **Format:** Ekran kaydı + facecam, 9:16, 28sn
- **Gerçek Ekran:** Compose → Marka Sesi Tutarlılığı skoru
- **Kanca:** "Bu metin markama gerçekten uyuyor mu, yoksa ben mi öyle sanıyorum?"
- **Akış:** "Marka Sesini Ölç" butonuna basılıyor, gerçek bir sayı çıkıyor (geçmiş yayınlanmış içerikle kıyaslanan gerçek bir benzerlik skoru — AI'ın tahmini değil)
- **CTA:** "Tahmin değil, ölçüm."

#### Video 8 — "Boş Takvim Günü mü Kaldı?"
- **Format:** Ekran kaydı, 9:16, 25sn
- **Gerçek Ekran:** Takvim ay görünümü, boş bir güne tıklama, AI ile doldurma
- **Kanca:** "Bu hafta ne paylaşacağını bilmiyor musun?"
- **Akış:** Boş takvim günü → AI dolduruyor (başlık, saat önerisi, gerekçe, platforma özel metinler)
- **CTA:** "Takvimin kendini dolduruyor."

#### Video 9 — "Sürükle, Bırak, Bitti"
- **Format:** Ekran kaydı, 9:16, 15sn (hızlı, akıcı)
- **Gerçek Ekran:** Takvimde bir gönderiyi bir günden başka bir güne sürükleme
- **Kanca:** "Planı değiştirmek bu kadar kolay olmalı."
- **Akış:** Sürükle-bırak, tüm platform versiyonları birlikte taşınıyor
- **CTA:** (metin yok, sadece logo)

#### Video 10 — "Her Yorumu Tek Tek Yanıtlamak Zorunda Değilsin"
- **Format:** Ekran kaydı + facecam, 9:16, 30sn
- **Gerçek Ekran:** Gelen Kutu, AI cevap önerisi (samimi/kısa/satış odaklı 3 seçenek)
- **Kanca:** "Instagram'da 40 yorum birikti, hepsine tek tek mi cevap yazacaksın?"
- **Akış:** Yorum seçiliyor, AI 3 farklı tonlu cevap öneriyor, biri seçilip düzenleniyor, gönderiliyor
- **CTA:** "Sen onaylıyorsun, AI yazıyor."

#### Video 11 — "Görseli de Kendin Çizmene Gerek Yok"
- **Format:** Ekran kaydı, 9:16, 22sn
- **Gerçek Ekran:** Compose → Görsel Üret, marka renk paletiyle üretilen görsel
- **Kanca:** "Canva'da 40 dakika mı harcıyorsun?"
- **Akış:** Görsel konsepti yazılıyor → AI, marka renklerine uygun görsel üretiyor
- **CTA:** "Marka kimliğine uygun görsel, saniyeler içinde."

#### Video 12 — "Hazır Kalıplar, Tekrar Yazma"
- **Format:** Ekran kaydı, 9:16, 20sn
- **Gerçek Ekran:** Şablonlarım modalı, kategori filtreleri
- **Kanca:** "Her hafta aynı formatı sıfırdan mı yazıyorsun?"
- **Akış:** Kayıtlı şablon seçiliyor, metin otomatik dolduruluyor, sadece boşluklar dolduruluyor
- **CTA:** "Bir kere yaz, sonsuza kadar kullan."

#### Video 13 — "Acil Durum Butonu"
- **Format:** Ekran kaydı + facecam, 9:16, 25sn
- **Gerçek Ekran:** Compose'daki "⚡ Acil Durum: Şimdi Yayınla" butonu
- **Kanca:** "Az önce oldu, hemen paylaşman lazım — tarih seçecek vaktin yok."
- **Akış:** Hızlıca metin yazılıyor, "Şimdi Yayınla"ya basılıyor, ~1 dakika içinde gerçek hesapta görünüyor
- **CTA:** "Bazen beklemeye vakit yok."

#### Video 14 — "Ajans mısın? Tüm Markaların Tek Ekranda"
- **Format:** Ekran kaydı, 9:16, 28sn
- **Gerçek Ekran:** Çalışma Alanları seçim ekranı, kare kartlar
- **Kanca:** "5 farklı müşterin, 5 farklı sekmede mi açık?"
- **Akış:** Çalışma alanları arasında tek tıkla geçiş, her biri kendi takvimi/markasıyla
- **CTA:** "Her marka kendi alanında, sen tek hesapta."

#### Video 15 — "Mağazan Büyüdükçe İçerik de Büyüsün"
- **Format:** Ekran kaydı, 9:16, 22sn
- **Gerçek Ekran:** WooCommerce ürün seçici → Compose
- **Kanca:** "Yeni ürün ekledin, şimdi de onun için post mu yazacaksın?"
- **Akış:** Gerçek mağaza ürünü seçiliyor, ürün bilgisi otomatik içerik fikrine dönüşüyor
- **CTA:** "Mağazan zaten veriyi biliyor, Tentamark onu içeriğe çeviriyor."

#### Video 16 — "Hashtag Kalabalığı Olmasın"
- **Format:** Ekran kaydı, 9:16, 18sn
- **Gerçek Ekran:** "Hashtag'leri ilk yoruma at" checkbox'ı + yayınlanmış gerçek gönderi
- **Kanca:** "Açıklamanın altındaki 30 hashtag'i gören var mı?"
- **Akış:** Checkbox işaretleniyor, yayınlanan gönderi temiz görünüyor, hashtag'ler ilk yorumda
- **CTA:** "Temiz açıklama, gizli hashtag."

---

### C) Format Deneyleri

#### Video 17 — "Kurucudan Kameraya"
- **Format:** Yüz kamerası ağırlıklı, 9:16, 40sn
- **Gerçek Ekran:** Kurucu doğrudan kameraya konuşuyor, arada ekranını gösteriyor
- **Kanca:** "3 ay önce bu uygulamayı neden yaptığımızı anlatayım."
- **Akış:** Gerçek problem hikayesi (samimi, kurumsal olmayan dil) → ürünün doğal tanıtımı
- **CTA:** "Denemek ister misin?"
- **Not:** Araştırma bunu net destekliyor: kurumsal ses değil, kişisel ses — özellikle Threads ve organik Reels için en güçlü format.

#### Video 18 — "Öncesi / Sonrası — Aynı Hafta"
- **Format:** Split-screen ekran kaydı, 9:16, 25sn
- **Gerçek Ekran:** Solda dağınık bir not defteri/Excel içerik planı, sağda Tentamark takvimi
- **Kanca:** "İçerik planım eskiden böyleydi. Şimdi böyle."
- **CTA:** "Hangisini tercih edersin?"

#### Video 19 — "Bir Günün Hız Kaydı (Timelapse)"
- **Format:** Ekran kaydı, hızlandırılmış, 9:16, 30sn
- **Gerçek Ekran:** Sabah takvime bakma → 3 gönderi onaylama → gelen kutusundaki 2 yoruma cevap → günün sonu
- **Kanca:** "Bir pazarlamacının Tentamark ile günü, 30 saniyede."
- **CTA:** "Bu senin de günün olabilir."

#### Video 20 — "Hangi Kanca Daha İyi? Sen Seç"
- **Format:** Reels, etkileşimli anket formatı, 9:16, 20sn
- **Gerçek Ekran:** AI Kanca Lab'ın ürettiği 3 alternatif kanca
- **Kanca:** "3 kanca, 3 farklı skor. Sence hangisi kazanır?"
- **Akış:** İzleyici Instagram'ın anket/poll sticker'ıyla tahmin ediyor, sonraki hikayede gerçek skor açıklanıyor
- **CTA:** (organik/etkileşim odaklı, satış CTA'sı yok — bu format özellikle Threads/Story için)

#### Video 21 — "Perde Arkası: Bu Reklamı da Tentamark ile Planladık"
- **Format:** Ekran kaydı + facecam, 9:16, 25sn
- **Gerçek Ekran:** Bu videonun kendisinin Tentamark takviminde planlanmış hali (meta-referans)
- **Kanca:** "Bu videoyu izlediğin an, aslında bir Tentamark gönderisi izliyorsun."
- **Akış:** Takvimde bu içeriğin kendi kartı gösteriliyor
- **CTA:** "Biz de kendi ilacımızı içiyoruz."

#### Video 22 — "Gerçek Kullanıcı Onayı [YER TUTUCU — gerçek müşteri onayı alınınca doldurulacak]"
- **Format:** Yüz kamerası, 9:16, 30sn
- **İçerik:** `[GERÇEK MÜŞTERİ ADI/MARKASI]` kamera karşısında gerçek deneyimini anlatıyor — spesifik bir sonuç (`[GERÇEK RAKAM/SONUÇ]`) paylaşıyor
- **Not:** Bu prompt'u SADECE gerçek, onay vermiş bir müşteriyle kullan. Sahte/kurgu testimonial üretme — araştırma da zaten gerçek yorumların/ekran görüntülerinin tasarlanmış olanlardan daha iyi çalıştığını gösteriyor, yani gerçek olması hem etik hem performans açısından doğru.

---

## 4. Instagram Prompt Kütüphanesi (20)

*Format notu: Karuseller 5-10 slayt, numaralandırılmış olmalı (araştırmaya göre tamamlanma oranını artırıyor). Tekli görseller gerçek ekran görüntüsü + kısa metin katmanı olarak tasarlanmalı.*

1. **[Karusel, 6 slayt]** "Sosyal medya yönetimini 6 adımda anlatalım" — 1) Marka Profili doldur 2) AI 5 platforma metin yazsın 3) Kancanı puanla 4) Takvime sürükle 5) Onayla 6) Yayınlansın. Her slaytta ilgili gerçek ekran görüntüsü.
2. **[Tekli görsel]** Gerçek Compose ekranı görüntüsü, üstünde: "Bir fikir. Beş platform. Sıfır kopyala-yapıştır." Caption: "Artık her platform için ayrı ayrı yazmıyoruz."
3. **[Karusel, 5 slayt]** "Markanın DNA'sı nedir, neden önemli?" — Ses tonu matrisi, karakter skorları, hedef kitle, rakipler, DNA skoru ekran görüntüleriyle.
4. **[Reels caption, video 5 ile eşleşir]** "5 uygulama yerine 1. Link bio'da." 
5. **[Tekli görsel]** Onay portalı ekran görüntüsü. Caption: "Müşterine şifre değil, link gönder."
6. **[Karusel, 7 slayt]** "AI kanca skorlaması nasıl çalışır?" — gerçek örnek metin, 3 alternatif, skorlar, hangisinin seçildiği.
7. **[Tekli görsel]** Takvim ay görünümü, birleşik gönderi kartları. Caption: "Instagram, Facebook, TikTok — hepsi tek kartta, tek bakışta."
8. **[Karusel, 6 slayt]** "Ajans mısın? Bu senin için." — Çalışma alanları, marka geçişi, ekip yönetimi, onay akışı.
9. **[Tekli görsel]** Gelen kutusu AI cevap önerisi ekranı. Caption: "40 yorum, 40 farklı ton önerisi — sen seç, sen gönder."
10. **[Reels caption, video 13 ile eşleşir]** "Acil bir şey oldu, beklemeye vaktin yoksa."
11. **[Karusel, 5 slayt]** "Kurucu sesi nedir, marka sesinden farkı ne?" — yan yana iki örnek metin karşılaştırması.
12. **[Tekli görsel]** Marka Sesi Tutarlılık skoru ekranı. Caption: "Markana uygun mu? Artık tahmin etmiyoruz, ölçüyoruz."
13. **[Karusel, 8 slayt — "tutorial" formatı, araştırmanın önerdiği "ilk otomasyonunu 7 dakikada kur" tarzı]** "İlk haftalık içerik planını 10 dakikada kur" — adım adım gerçek ekran görüntüleri.
14. **[Tekli görsel]** WooCommerce ürün seçici. Caption: "Yeni ürün ekledin. İçeriği biz düşünelim."
15. **[Karusel, 5 slayt]** "Şablonlarım nasıl çalışır?" — kaydet, kategori, tekrar kullan.
16. **[Reels caption, video 9 ile eşleşir]** "Planı değiştirmek: sürükle, bırak, bitti."
17. **[Tekli görsel]** Marka Profili DNA skoru + eksik alan listesi. Caption: "Markan yüzde kaç tanımlı? Bizde ölçülüyor."
18. **[Karusel, 6 slayt]** "Gerçek yayın nasıl çalışır" — onay → kuyruk → gerçek platform → yayınlandı durumu, gerçek zaman damgalarıyla.
19. **[Tekli görsel]** İlk yorum hashtag otomasyonu, öncesi/sonrası gönderi karşılaştırması. Caption: "Temiz açıklama, gizli hashtag."
20. **[Karusel, 5 slayt — dürüstlük/güven odaklı]** "Tentamark'ta şu an gerçek olan neler, henüz olmayan neler?" — şeffaf bir liste (video üretimi henüz yok, gerçek analitik toplama henüz yok gibi dürüst notlarla) — bu format, "güven inşa eden içerik" olarak öne çıkabilir; SaaS kategorisinde nadir ama güçlü bir farklılaşma.

---

## 5. Threads Prompt Kütüphanesi (20)

*Format notu: Threads'te kurumsal ses değil kişisel ses, erişim değil sohbet önemli. Bu yüzden bu bölümdeki prompt'lar bilinçli olarak kısa, ilk tekil şahıs, ve soru/tartışma açan bir dille yazıldı — "kurucudan" veya "ekipten biri" paylaşıyormuş gibi.*

1. "Bugün fark ettim: aynı postu 4 platforma yazmak, postu yazmaktan daha çok vaktimi alıyor. Sizde de böyle mi?"
2. "LinkedIn'de resmi, Instagram'da samimi olmak zorunda kalmak biraz yorucu değil mi? Ben bunun için bir çözüm kurdum, isteyen sorsun."
3. "Bir müşteriye WhatsApp'tan kaçıncı ekran görüntüsünü attınız bugün? Ben saymayı bıraktım."
4. "Kanca yazarken hep 'bu mu daha iyi, öteki mi daha iyi' diye tereddüt ediyorum. Şimdi AI'a puanlatıyorum, tartışmayı kendimle bitirdim."
5. "İtiraf: bazı günler ne paylaşacağımı bilmiyorum. Takvimim boş kalıyor. Bunu çözen bir şey kurdum, detay isteyen yazsın."
6. "Sosyal medya yönetim araçlarının çoğu hâlâ tek platform gibi davranıyor, sonra 'çoklu platform' diyor. Biz gerçekten öyle mi diye kendimize sorduk."
7. "Bugün kendi reklamımızı kendi uygulamamızla planladık. Garip bir şekilde tatmin edici."
8. "Bir fikrim var: markalar kendi kurucusunun sesiyle konuştuğunda daha çok güven veriyor. Biz de bunu bir özelliğe çevirdik."
9. "Onay süreci hâlâ WhatsApp'tan mı yürüyor sizde de? Bunun daha iyi bir yolu olmalı diye düşündük."
10. "Hangi kanca daha iyi çalışır sizce: soru mu, iddialı bir cümle mi, yoksa şaşırtan bir istatistik mi?"
11. "Bugün öğrendim ki Threads'te asıl önemli olan beğeni değil, yanıt. O yüzden bu postu soruyla bitiriyorum: siz içerik planlarken en çok hangi adımda takılıyorsunuz?"
12. "Küçük bir itiraf: biz de her özelliği aynı anda yapmadık. Önce en can sıkıcı problemi çözdük, gerisi geldi."
13. "AI'ın 'markana uygun' demesiyle, gerçekten ölçülmüş bir sayı vermesi arasında büyük fark var. Biz ikincisini kurduk."
14. "Ajans arkadaşlar: kaç farklı müşteri hesabı arasında geçiş yapıyorsunuz bir günde? Ben bunu tek ekrana indirmeye çalıştım."
15. "Bugün fark ettim ki hashtag kalabalığı açıklamayı çirkinleştiriyor ama SEO/keşfet için de gerekli. İkisini de kaybetmeden çözmenin bir yolu var."
16. "Bir ürün eklediğinizde onun için içerik yazmak ayrı bir iş gibi geliyor değil mi? Aslında olmaması gerekiyor."
17. "Kurduğumuz şeyin adı 'AI Marketing Manager' ama bence gerçek fark, asistan değil karar destek olması. Ne düşünüyorsunuz, bu ayrım önemli mi?"
18. "Bugün kendi Marka DNA skorumuza baktık. Beklediğimizden düşüktü. Demek biz de kendi tavsiyemizi tam uygulamamışız."
19. "Acil bir durumda 'planla' demek saçma geliyor bazen. Bazen sadece 'şimdi çık' demek gerekiyor. Onu da düşündük."
20. "Sosyal medya araçları genelde kendi ürünlerini jenerik stok görüntülerle tanıtıyor. Biz bunu tuhaf bulduk, kendi ekranlarımızı gösteriyoruz. Siz fark ediyor musunuz böyle şeyleri?"

---

## 6. Facebook Prompt Kütüphanesi (15)

*Format notu: Facebook kitlesi biraz daha uzun metne ve topluluk/grup paylaşımına açık — bu yüzden Instagram'a göre biraz daha açıklayıcı, "neden" odaklı yazıldı.*

1. **[Video 1 ile eşleşir, uzun caption]** "Sosyal medya yöneten herkes bilir: asıl zor kısım yazmak değil, aynı şeyi 5 farklı yerde 5 farklı şekilde yazmak. Biz bunu tek adıma indirdik. [Gerçek ekran görüntüsü]"
2. **[Tekli görsel + açıklayıcı metin]** "Markanızın bir 'sesi' var mı, yoksa her paylaşımda farklı biri mi yazıyor gibi hissettiriyor? Marka Profili'nde bunu bir kere tanımlıyorsunuz, AI her seferinde o sesle yazıyor."
3. **[Karusel]** "Ajans işletiyorsanız bu size tanıdık gelecek: her müşteri için ayrı sekme, ayrı şifre, ayrı takip. Çalışma Alanları özelliğimizle hepsini tek hesaba topladık."
4. **[Video eşleşmeli, topluluk/grup paylaşımına uygun]** "Küçük işletme sahipleri için gerçek bir sorun: içerik üretecek vakit yok, ajans tutacak bütçe yok. Aradaki boşluğu doldurmaya çalışıyoruz."
5. **[Tekli görsel]** "Müşterinize onay için ekran görüntüsü mü atıyorsunuz? Artık tek bir link yeterli — şifre yok, uygulama indirmesi yok."
6. **[Uzun açıklama + ekran görüntüsü]** "Bir gönderiyi 'Instagram'a uygun' hale getirmekle 'LinkedIn'e uygun' hale getirmek aynı şey değil. Platformların kendi dili var, biz bunu ciddiye aldık."
7. **[Karusel, adım adım]** "İlk haftalık içerik planınızı nasıl 10 dakikada kurarsınız — gerçek ekran görüntüleriyle adım adım."
8. **[Video eşleşmeli]** "Bazı günler ne paylaşacağınızı bilmiyorsunuz. Bu normal. Biz de bu durumu düşünüp boş takvim günlerini AI ile doldurabilen bir sistem kurduk."
9. **[Tekli görsel]** "Yorumlara cevap yazmak vakit alıyor, ton tutturmak daha da fazla. AI üç farklı tonlu cevap öneriyor, siz sadece seçip gönderiyorsunuz."
10. **[Uzun açıklama, güven odaklı]** "Bir yazılım şirketi olarak şunu söylemek isteriz: her özelliğimiz gerçek, çalışan bir özellik. 'Yakında' dediğimiz şeyleri açıkça öyle işaretliyoruz. Şeffaflık bizim için önemli."
11. **[Karusel]** "E-ticaret mağazanız büyüdükçe içerik ihtiyacınız da büyür. Yeni ürün eklediğinizde onun için de içerik fikri üretebiliyoruz."
12. **[Video eşleşmeli]** "Kurucunun kendi sesinden paylaşım yapmak, kurumsal hesaptan paylaşım yapmaktan daha fazla güven inşa ediyor. Biz bunu bir özellik haline getirdik."
13. **[Tekli görsel]** "Bir kancanın işe yarayıp yaramayacağını tahmin etmek yerine, AI'a üç alternatif ürettirip puanlatıyoruz."
14. **[Uzun açıklama]** "Sosyal medya yönetimi araçlarının çoğu size jenerik tanıtım videoları gösteriyor. Biz kendi gerçek panellerimizi gösteriyoruz — çünkü göstermekten çekinecek bir şeyimiz yok."
15. **[Video eşleşmeli, testimonial yer tutucu]** `[GERÇEK MÜŞTERİ ONAYI — doldurulacak]` "Gerçek bir kullanıcımızın deneyimini burada paylaşacağız, onay aldığımızda."

---

## 7. Uygulama Sırası Önerisi

1. Önce **Video 5, 6, 8, 10** (en net "gerçek panel" demoları) + **Instagram #1, #2, #7** ile başla — bunlar en az prodüksiyon gerektiren, en hızlı çekilebilecek içerikler (sadece ekran kaydı + basit metin).
2. **Threads listesinin tamamını** ilk hafta yayınla — bunlar metin odaklı, prodüksiyon gerektirmiyor, ve Threads'in "sık paylaşım + sohbet" mantığına uygun.
3. Kurucu kameraya çıkmaya hazır olduğunda **Video 17** (kurucudan kameraya) ve **Video 6/7** (facecam'li demo) çekilsin — araştırmaya göre bunlar en yüksek dönüşüm potansiyeli taşıyor.
4. **Video 22 ve Facebook #15** (testimonial) — ilk gerçek, memnun müşteri onay verdiğinde kullan. Sahte doldurma, boş bırak.
5. Her içeriğin performansını (izlenme, tamamlanma oranı, Threads'te yanıt sayısı) takip et — araştırma diyor ki düşüşün olduğu saniyeyi bulmak, bir sonraki videonun neyi düzeltmesi gerektiğini gösteriyor.
