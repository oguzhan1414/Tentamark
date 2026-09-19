import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni | Tentamark",
  description: "Tentamark'ın kişisel verileri nasıl topladığı, kullandığı, aktardığı ve sakladığı hakkında ayrıntılı bilgi.",
  alternates: { canonical: "https://tentamark.com/gizlilik" },
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-24 space-y-3 border-t border-slate-100 pt-7"><h2 className="font-display text-xl font-bold text-slate-950">{title}</h2><div className="space-y-3 text-sm leading-7 text-slate-600">{children}</div></section>;
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-12 text-slate-800 sm:px-6 sm:py-16">
      <article className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
        <header className="border-b border-slate-100 pb-8">
          <Link href="/" className="text-sm font-semibold text-[#C92E35] hover:underline">← Ana sayfaya dön</Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#C92E35]">Yasal ve gizlilik</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">Bu metin, Tentamark web sitesi ve uygulamasını kullanırken kişisel verilerinizin nasıl işlendiğini açıklar. Tentamark kullanıcı verilerini satmaz ve bağlantılı sosyal hesapları kullanıcının talimatı dışında paylaşım yapmak için kullanmaz.</p>
          <p className="mt-4 font-mono text-xs text-slate-500">Yürürlük ve son güncelleme: 19 Eylül 2026</p>
        </header>

        <nav aria-label="Gizlilik metni içindekiler" className="my-8 rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-bold text-slate-900">İçindekiler</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <a href="#veri-sorumlusu">1. Veri sorumlusu ve kapsam</a><a href="#veriler">2. İşlenen veriler</a>
            <a href="#amaclar">3. Amaçlar ve hukuki sebepler</a><a href="#ai">4. Yapay zekâ özellikleri</a>
            <a href="#aktarim">5. Aktarım ve sağlayıcılar</a><a href="#saklama">6. Saklama ve silme</a>
            <a href="#guvenlik">7. Güvenlik</a><a href="#haklar">8. Haklarınız</a>
          </div>
        </nav>

        <Section id="veri-sorumlusu" title="1. Veri sorumlusu ve kapsam">
          <p>Bu metin bakımından veri sorumlusu, Tentamark markası altında hizmeti sunan işletmecidir. Gizlilik ve kişisel veri başvuruları için iletişim adresi <a className="font-semibold text-[#C92E35] hover:underline" href="mailto:support@tentamark.com">support@tentamark.com</a>&apos;dur.</p>
          <p>Politika; herkese açık web sitesi, kullanıcı hesabı, çalışma alanları, içerik üretimi, takvim, onay, yayınlama, sosyal gelen kutusu, analiz, iletişim formu ve destek süreçlerini kapsar. Bağlantı kurduğunuz sosyal ağlar kendi hizmetlerindeki işlemler bakımından ayrıca kendi gizlilik politikalarına tabidir.</p>
        </Section>

        <Section id="veriler" title="2. İşlenen kişisel veri kategorileri">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-slate-900"><tr><th className="p-4">Kategori</th><th className="p-4">Örnekler</th><th className="p-4">Kaynak</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="p-4 font-semibold">Hesap ve kimlik</td><td className="p-4">Ad, e-posta, profil ve hesap kimliği</td><td className="p-4">Siz ve kimlik doğrulama hizmeti</td></tr>
                <tr><td className="p-4 font-semibold">Marka ve çalışma alanı</td><td className="p-4">Marka adı, sektör, hedef pazar, ekip üyeleri, roller ve davetler</td><td className="p-4">Siz veya çalışma alanı yöneticiniz</td></tr>
                <tr><td className="p-4 font-semibold">İçerik</td><td className="p-4">Taslaklar, komutlar, yorumlar, medya, kampanyalar ve yayın takvimi</td><td className="p-4">Siz, ekip üyeleri ve bağlı araçlar</td></tr>
                <tr><td className="p-4 font-semibold">Sosyal platform</td><td className="p-4">Hesap kimliği, kullanıcı adı, OAuth izinleri, şifreli erişim belirteçleri, gönderi kimlikleri, yorumlar ve izin verilen ölçümler</td><td className="p-4">Yetkilendirdiğiniz platform</td></tr>
                <tr><td className="p-4 font-semibold">İletişim</td><td className="p-4">Ad, soyad, e-posta, isteğe bağlı telefon, konu ve mesaj</td><td className="p-4">Form veya e-posta</td></tr>
                <tr><td className="p-4 font-semibold">Teknik ve güvenlik</td><td className="p-4">IP adresi, tarayıcı bilgisi, oturum çerezleri, hata ve işlem kayıtları</td><td className="p-4">Cihazınız ve altyapı</td></tr>
              </tbody>
            </table>
          </div>
          <p>Tentamark sizden özel nitelikli kişisel veri istemez. Bu tür verileri serbest metin veya içerik alanlarına yüklememenizi öneririz.</p>
        </Section>

        <Section id="amaclar" title="3. İşleme amaçları, yöntemleri ve hukuki sebepler">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Sözleşmenin kurulması ve ifası:</strong> hesap ve oturum sağlamak, çalışma alanını yönetmek, içerik oluşturmak, kaydetmek, onaya sunmak ve kullanıcının seçtiği zamanda yayınlamak.</li>
            <li><strong>Talebinizi yerine getirmek:</strong> sosyal hesap bağlantısını kurmak, belirteçleri yenilemek ve kullanıcı tarafından başlatılan entegrasyonları çalıştırmak.</li>
            <li><strong>Meşru menfaat:</strong> güvenliği sağlamak, kötüye kullanımı önlemek, hataları incelemek ve ürünü iyileştirmek; bu işlemler haklarınıza orantısız müdahale etmeyecek şekilde yürütülür.</li>
            <li><strong>Hukuki yükümlülük:</strong> yetkili kurum taleplerini karşılamak ve mevzuatın gerektirdiği kayıtları tutmak.</li>
            <li><strong>Açık rıza:</strong> mevzuatın açık rıza gerektirdiği isteğe bağlı pazarlama veya zorunlu olmayan çerezler devreye alınırsa ayrıca alınır. Zorunlu hizmet işlemleri için açık rıza varsayılmaz.</li>
          </ul>
          <p>Veriler; üyelik ve iletişim formları, uygulama kullanımı, OAuth akışları, API&apos;ler ve bağlı hesapların web kancaları üzerinden tamamen veya kısmen otomatik yollarla elde edilir.</p>
        </Section>

        <Section id="ai" title="4. Yapay zekâ özellikleri ve otomatik işleme">
          <p>İçerik üretme, yeniden yazma, marka tonu değerlendirme, öneri ve görsel üretme özelliklerini kullandığınızda ilgili komut, marka bağlamı ve seçtiğiniz içerik parçaları çıktıyı üretmek üzere yapay zekâ sağlayıcılarına iletilebilir. Tentamark şu anda bu amaçlarla Groq, OpenAI ve seçili görsel üretim hizmetlerinden yararlanabilir.</p>
          <p>AI çıktıları olasılıksaldır ve hatalı veya üçüncü kişi haklarıyla uyuşmayan sonuçlar üretebilir. Tentamark yalnızca AI önerisine dayanarak kullanıcı hakkında hukuki veya benzer ölçüde önemli sonuç doğuran otomatik karar vermez. Yayından önce içeriği kontrol etmek kullanıcıya aittir.</p>
        </Section>

        <Section id="aktarim" title="5. Alıcı grupları, hizmet sağlayıcılar ve yurt dışı aktarım">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Altyapı:</strong> kimlik doğrulama, veritabanı ve dosya saklama için Supabase; uygulama barındırma ve dağıtım için Vercel.</li>
            <li><strong>Yapay zekâ:</strong> kullanılan özelliğe göre Groq, OpenAI ve görsel üretim sağlayıcıları.</li>
            <li><strong>Bağlı hizmetler:</strong> Meta/Instagram/Facebook, Threads, TikTok, YouTube/Google, Pinterest, Canva, Telegram, Bluesky ve WooCommerce.</li>
            <li><strong>Çalışma alanı kullanıcıları:</strong> rol ve yetkileri ölçüsünde ekip üyeleri ve onay bağlantısı verilen kişiler.</li>
            <li><strong>Yetkili merciler:</strong> geçerli hukuki talep halinde kamu kurumları ve adli makamlar.</li>
          </ul>
          <p>Bu sağlayıcıların bir bölümü Türkiye dışında hizmet verir; veri hizmetin yürütülmesi için yurt dışındaki sistemlerde işlenebilir. Tentamark, uygulanabilir olduğu ölçüde 6698 sayılı Kanun&apos;un 9. maddesindeki uygun güvenceler ile GDPR aktarım mekanizmalarını gözetir. Sosyal platforma veri gönderimi sizin bağlantı veya yayınlama talimatınız üzerine gerçekleşir.</p>
        </Section>

        <Section id="cerezler" title="6. Çerezler ve yerel depolama">
          <p>Tentamark oturumu sürdürmek, güvenliği sağlamak ve dil tercihini hatırlamak için zorunlu çerezler veya tarayıcı depolaması kullanabilir. Bu metnin yürürlük tarihinde reklam hedefleme veya üçüncü taraf pazarlama çerezi kullanılmamaktadır. Böyle bir teknoloji devreye alınırsa zorunlu olmayan çerezlerden önce ayrı tercih mekanizması sunulur.</p>
        </Section>

        <Section id="saklama" title="7. Saklama süreleri ve silme">
          <ul className="list-disc space-y-2 pl-5">
            <li>Hesap ve çalışma alanı verileri hesap aktif olduğu sürece; sonrasında hukuki yükümlülük ve uyuşmazlık süreleriyle sınırlı olarak saklanır.</li>
            <li>İçerik, medya ve takvim verileri siz silene, yönetici kaldırana veya hesap silme talebi tamamlanana kadar tutulur.</li>
            <li>Sosyal platform belirteçleri bağlantı sürdüğü müddetçe tutulur; bağlantı kaldırıldığında aktif kullanım sona erdirilir ve ilgili kayıt silinir.</li>
            <li>İletişim talepleri talebin sonuçlandırılması ve makul takip süresi; güvenlik kayıtları olay inceleme ve kötüye kullanım önleme için gerekli süre boyunca tutulur.</li>
          </ul>
          <p>Hesap ve kişisel veri silme talebinizi kayıtlı e-posta adresinizden <a className="font-semibold text-[#C92E35] hover:underline" href="mailto:support@tentamark.com">support@tentamark.com</a> adresine iletebilirsiniz. Kimliğinizi doğrulamak için ek bilgi istenebilir. Yasal saklama veya hukuki talepler için gerekli sınırlı kayıtlar korunabilir.</p>
        </Section>

        <Section id="guvenlik" title="8. Veri güvenliği">
          <p>Tentamark; rol tabanlı erişim, satır düzeyinde erişim kuralları, aktarım sırasında TLS, sosyal platform belirteçlerinin uygulama katmanında şifrelenmesi, gizli anahtarların sunucu tarafında tutulması ve erişim kontrolleri uygular. Hiçbir çevrim içi sistem mutlak güvenlik garantisi vermez. Bir olay tespit edildiğinde uygulanabilir mevzuatın gerektirdiği bildirimler yapılır.</p>
        </Section>

        <Section id="haklar" title="9. KVKK ve GDPR kapsamındaki haklarınız">
          <p>Uygulanabilir mevzuata göre verilerinizin işlenip işlenmediğini öğrenme; bilgi ve erişim isteme; yanlış verileri düzelttirme; şartları oluştuğunda silme, yok etme veya işlemeyi kısıtlama; aktarılan kişilere düzeltme veya silmenin bildirilmesini isteme; otomatik analiz sonucuna itiraz etme ve kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme haklarına sahipsiniz. GDPR uygulanıyorsa veri taşınabilirliği, işlemeye itiraz ve yetkili denetim makamına şikâyet hakları da geçerlidir.</p>
          <p>Başvurunuzu hesabınızı belirlemeye yetecek bilgilerle <a className="font-semibold text-[#C92E35] hover:underline" href="mailto:support@tentamark.com">support@tentamark.com</a> adresine iletebilirsiniz. Başvurular uygulanabilir yasal süre içinde ve kural olarak ücretsiz yanıtlanır.</p>
        </Section>

        <Section id="cocuklar" title="10. Çocukların gizliliği"><p>Tentamark ticari ve mesleki kullanım için tasarlanmıştır ve 18 yaşın altındaki kişilere yönelik değildir. Bir çocuğa ait verinin yetkisiz işlendiğini düşünüyorsanız silinmesi için bizimle iletişime geçin.</p></Section>
        <Section id="degisiklikler" title="11. Değişiklikler ve iletişim"><p>Ürün, sağlayıcılar veya mevzuat değiştiğinde bu metin güncellenebilir. Önemli değişiklikler uygun bir yöntemle duyurulur ve üstteki tarih yenilenir.</p><p><strong>Tentamark</strong><br />Gizlilik ve hesap talepleri: <a className="text-[#C92E35] hover:underline" href="mailto:support@tentamark.com">support@tentamark.com</a><br />Genel ve hukuki iletişim: <a className="text-[#C92E35] hover:underline" href="mailto:info@tentamark.com">info@tentamark.com</a></p></Section>
      </article>
    </main>
  );
}
