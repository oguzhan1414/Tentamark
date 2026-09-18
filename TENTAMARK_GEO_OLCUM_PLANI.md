# Tentamark GEO görünürlük ve doğruluk planı

## Amaç

Yapay zekâ destekli arama sonuçlarında Tentamark'ın doğru tanımlanması, uygun sorularda kaynak olarak bağlantı alması ve nitelikli ziyaret getirmesi. Tek bir yanıtta marka adının geçmesi başarı sayılmaz.

## Kaynak sayfası

`/tentamark-nedir` ürünün kısa tanımını, hedef kitlesini, iş akışını ve sınırlarını aynı yerde açıklar. Bu sayfadaki ifadeler ürün değiştikçe güncellenmelidir. Ana sayfa, platform sayfaları ve fiyatlandırma aynı iddialarla çelişmemelidir. Platform logosu, doğrudan yayın desteği veya resmî partnerlik kanıtı değildir.

## Erişim

**Canlı durum (19 Eylül 2026):** GEO kaynak sayfası ve SEO uçları henüz canlı sürüme yayımlanmadı. Bu nedenle bot erişimi ve AI yönlendirmesi üretimde doğrulanmış sayılmaz.

- `robots.txt` herkese açık sayfalara genel erişim veriyor; `OAI-SearchBot` için ayrıca engelleyici kural yok. Yayında gerçek HTTP yanıtı ve erişim günlükleri doğrulanmalı.
- Özel kullanıcı içerikleri ve API uçları arama sayfası olarak sunulmamalı.
- `llms.txt` bir sıralama aracı olarak önceliklendirilmez. Google AI araması bu dosyayı görünürlük sinyali olarak kullanmaz.

## Sabit sorgu paneli

Aşağıdaki sorular ayda bir, aynı dil ve konum bağlamıyla ChatGPT Search, Google AI arama deneyimi ve erişilebilen diğer yanıt motorlarında denenmeli. Sonuç; tarih, ürün, model/arayüz, yanıt bağlantısı, Tentamark bahsi, doğru/yanlış özellik ve yönlendirme bilgisiyle kaydedilmeli.

1. Türkçe küçük işletmeler için sosyal medya içerik planlama aracı öner.
2. Sosyal medya gönderilerini ekip onayıyla planlamak için hangi araçlar var?
3. Marka tonuna uygun haftalık sosyal medya taslağı hazırlayan araçlar hangileri?
4. Tentamark nedir ve kimler için uygundur?
5. Tentamark hangi platformlara doğrudan yayın yapabilir?
6. Tentamark ile sosyal medya içerik onayı nasıl işler?

## Başarı ölçüleri

- Bahis oranı: ilgili sorgularda markanın anılması. İlk ölçümden önce hedef oran uydurulmaz.
- Kaynak oranı: markanın sitesine doğrudan bağlantı verilen yanıtlar.
- Doğruluk: yetenek, fiyat, entegrasyon ve ürün durumu iddialarının siteyle eşleşmesi.
- Trafik ve dönüşüm: analitik araçlarında ChatGPT ve diğer yanıt motorlarından gelen oturum, kayıt başlangıcı ve etkin kullanım. OpenAI, ChatGPT yönlendirmelerinde `utm_source=chatgpt.com` parametresini belgelemektedir.

## İçerik doğrulama kuyruğu

Mevcut blog yazılarındaki sayısal pazarlama iddiaları, ürünün "otonom yayın" ve "performanstan öğrenme" ifadeleri, platform sayfalarındaki aktif bağlantı vaatleri, fiyat/deneme koşulları ve alt bilgideki güvenlik/uyumluluk ifadeleri üretim kanıtıyla tek tek karşılaştırılmalı. Bu çalışma tamamlanmadan üçüncü taraf dizinlere aynı iddialar taşınmamalı.

**19 Eylül 2026 taraması:** Ana sayfanın en görünür vaatleri, SSS, alt bilgi, performans tanıtımı ve fiyat sayfasındaki deneme çağrıları düzeltildi. Fiyat sayfası, paketlerin geliştirme durumunu açıkça belirtiyor. Açık kalan doğrulama: platform bazında gerçek hesaplarla yayın denemeleri; ödeme ve kurumsal plan özellikleri; mevcut 27 blog yazısındaki kaynak ve sayısal iddialar; KVKK/GDPR ve güvenlik beyanlarının hukuki/teknik kanıtı. Bunlar doğrulanmadan kesin vaat olarak dış kaynaklara taşınmamalıdır.

## Kaynaklar

- Google Search Central, *Optimizing your website for generative AI features on Google Search*: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- OpenAI, *Publishers and Developers FAQ*: https://help.openai.com/en/articles/12627856
