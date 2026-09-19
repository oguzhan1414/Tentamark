import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kullanım Koşulları | Tentamark",
  description: "Tentamark web sitesi ve sosyal medya yönetim hizmetinin kullanımına ilişkin koşullar.",
  alternates: { canonical: "https://tentamark.com/kullanim-kosullari" },
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <section id={id} className="scroll-mt-24 space-y-3 border-t border-slate-100 pt-7"><h2 className="font-display text-xl font-bold text-slate-950">{title}</h2><div className="space-y-3 text-sm leading-7 text-slate-600">{children}</div></section>;
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-12 text-slate-800 sm:px-6 sm:py-16">
      <article className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
        <header className="border-b border-slate-100 pb-8">
          <Link href="/" className="text-sm font-semibold text-[#C92E35] hover:underline">← Ana sayfaya dön</Link>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#C92E35]">Hizmet koşulları</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Kullanım Koşulları</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">Bu koşullar Tentamark web sitesi ve uygulamasına erişiminizi ve hizmetleri kullanımınızı düzenler. Hesap oluşturarak veya hizmeti kullanarak bu koşulları kabul etmiş olursunuz.</p>
          <p className="mt-4 font-mono text-xs text-slate-500">Yürürlük ve son güncelleme: 19 Eylül 2026</p>
        </header>

        <div className="my-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">Tentamark geliştirilmekte olan bir üründür. Erken erişim özellikleri değişebilir, geçici olarak sınırlandırılabilir veya kaldırılabilir. Canlıya alınmamış ücretli paketler ve deneme teklifleri bağlayıcı satış teklifi oluşturmaz.</div>

        <Section id="hizmet" title="1. Hizmetin kapsamı"><p>Tentamark; marka bilgilerinin düzenlenmesi, içerik fikirleri ve taslakları oluşturulması, medya yönetimi, ekip çalışması, onay akışları, takvimleme, bağlı sosyal hesaplara yayınlama, gelen kutusu ve performans değerlendirmesi gibi sosyal medya yönetimi özellikleri sunar. Kullanılabilir özellikler planınıza, platforma, hesap türüne, ülkeye ve üçüncü taraf izinlerine göre değişebilir.</p></Section>

        <Section id="uygunluk" title="2. Uygunluk ve kurumsal yetki"><ul className="list-disc space-y-2 pl-5"><li>Hizmeti kullanmak için en az 18 yaşında ve bağlayıcı sözleşme yapma ehliyetine sahip olmalısınız.</li><li>Bir şirket veya müşteri adına kullanıyorsanız o kuruluşu bağlama ve ilgili sosyal hesapları yönetme yetkinizin bulunduğunu beyan edersiniz.</li><li>Hesap bilgileriniz doğru ve güncel olmalıdır. Hesap güvenliğinden ve ekip üyelerine verdiğiniz yetkilerden siz sorumlusunuz.</li><li>Yetkisiz erişim şüphesini gecikmeden <a className="font-semibold text-[#C92E35]" href="mailto:support@tentamark.com">support@tentamark.com</a> adresine bildirmelisiniz.</li></ul></Section>

        <Section id="icerik" title="3. Kullanıcı içeriği ve verilen lisans"><p>Tentamark&apos;a yüklediğiniz veya oluşturduğunuz metin, görsel, video, marka materyali ve diğer içerik üzerindeki haklarınız size veya ilgili hak sahibine aittir. İçeriği yüklemek, işlemek ve yayınlamak için gerekli haklara sahip olduğunuzu taahhüt edersiniz.</p><p>Hizmeti sunabilmemiz için Tentamark&apos;a içeriğinizi yalnızca barındırma, çoğaltma, biçimlendirme, AI özelliğine gönderme, önizleme, ekip üyelerinize gösterme ve seçtiğiniz platformda yayınlama amaçlarıyla sınırlı; münhasır olmayan, dünya çapında ve hizmet süresince geçerli bir kullanım izni verirsiniz.</p></Section>

        <Section id="ai" title="4. Yapay zekâ ile üretilen içerik"><ul className="list-disc space-y-2 pl-5"><li>AI çıktıları öneri niteliğindedir; doğru, benzersiz, güncel veya belirli bir amaca uygun oldukları garanti edilmez.</li><li>Yayınlamadan önce doğruluk, marka uyumu, reklam kuralları, fikri mülkiyet, kişilik hakları ve mevzuat açısından çıktıyı incelemelisiniz.</li><li>Benzer girdiler farklı kullanıcılara benzer çıktılar üretebilir; size özgü veya münhasır çıktı garanti edilmez.</li><li>Sağlık, hukuk, finans veya başka yüksek riskli alanlarda AI çıktısını profesyonel tavsiye yerine kullanmamalısınız.</li></ul></Section>

        <Section id="platformlar" title="5. Üçüncü taraf platformlar ve entegrasyonlar"><p>Sosyal ağ, Canva, WooCommerce veya diğer hizmetleri bağladığınızda ilgili sağlayıcının koşulları da uygulanır. Tentamark yalnızca verdiğiniz izinler kapsamında işlem yapar. Platformlar içerikleri reddedebilir, geciktirebilir, biçimini değiştirebilir; API&apos;lerini, kotalarını veya izinlerini değiştirebilir ya da erişimi sonlandırabilir.</p><p>Bağlantıyı kaldırmak gelecekteki erişimi durdurur; sosyal platformda daha önce yayınlanmış içeriği kendiliğinden silmez.</p></Section>

        <Section id="kabul-edilebilir-kullanim" title="6. Kabul edilebilir kullanım"><p>Hizmeti kullanırken aşağıdaki eylemleri gerçekleştiremezsiniz:</p><ul className="list-disc space-y-2 pl-5"><li>Yasa dışı, yanıltıcı, dolandırıcı, tehditkâr, ayrımcı veya üçüncü kişi haklarını ihlal eden içerik üretmek ya da yayınlamak,</li><li>spam, yapay etkileşim, kimliğe bürünme, izinsiz reklam veya platform manipülasyonu yapmak,</li><li>kötü amaçlı kod yüklemek, güvenlik önlemlerini aşmak veya yetkisiz erişmeye çalışmak,</li><li>hizmeti tersine mühendislik yapmak ya da altyapıya zarar veren otomatik istekler göndermek,</li><li>başkasının hesabını, markasını, kişisel verisini veya gizli bilgisini yetkisiz kullanmak,</li><li>platformların geliştirici politikalarını veya topluluk kurallarını ihlal etmek.</li></ul></Section>

        <Section id="ekip" title="7. Çalışma alanları, ekipler ve onaylar"><p>Çalışma alanı sahibi üyeleri davet etmekten, rollerini belirlemekten ve marka erişimlerini yönetmekten sorumludur. Yetkili üyeler çalışma alanındaki içerikleri görebilir, düzenleyebilir veya onaya sunabilir. Onay bağlantılarının doğru kişiyle ve güvenli biçimde paylaşılması kullanıcı sorumluluğundadır.</p></Section>

        <Section id="ucret" title="8. Ücretler, paketler ve iptal"><p>Ücretli hizmetler etkinleştirildiğinde güncel fiyat, para birimi, vergiler, faturalama dönemi, yenileme ve iptal şartları satın alma ekranında gösterilir ve işlemden önce ayrıca onayınıza sunulur. Ücretsiz veya erken erişim özellikleri kullanım limitiyle sunulabilir.</p><p>Zorunlu tüketici hakları, cayma hakkı ve emredici mevzuattan doğan başvuru yolları sınırlandırılmaz. Ücretli sistem devreye alınmadan önce ayrıntılı abonelik ve iade şartları bu bölüme ve ödeme ekranına eklenecektir.</p></Section>

        <Section id="fikri-mulkiyet" title="9. Tentamark hakları ve geri bildirim"><p>Tentamark adı, logosu, yazılımı, arayüzü, dokümantasyonu ve kullanıcı içeriği dışındaki özgün materyaller Tentamark veya lisans sahiplerine aittir. Size hizmeti bu koşullara uygun kullanmak için sınırlı, devredilemez ve geri alınabilir bir hak verilir. Geri bildiriminizi ürünü geliştirmek için kimliğinizi kamuya açıklamadan kullanabiliriz.</p></Section>

        <Section id="askiya-alma" title="10. Askıya alma ve hesabın sona ermesi"><p>Koşulların ihlali, güvenlik riski, hukuki zorunluluk, üçüncü taraf erişiminin sona ermesi veya hizmete zarar veren kullanım halinde erişim sınırlandırılabilir ya da hesap kapatılabilir. Acil durumlar dışında, makul olduğunda önceden bildirim ve ihlali düzeltme fırsatı verilir.</p><p>Hesap kapatma ve veri silme talebinizi <a className="font-semibold text-[#C92E35]" href="mailto:support@tentamark.com">support@tentamark.com</a> adresine iletebilirsiniz. Hesabın kapanması üçüncü taraf platformlarda yayınlanmış içerikleri otomatik kaldırmaz.</p></Section>

        <Section id="sureklilik" title="11. Hizmet sürekliliği ve değişiklikler"><p>Hizmeti özenle sunmayı amaçlarız; ancak kesintisiz, hatasız veya her platformla sürekli uyumlu çalışma garantisi veremeyiz. Bakım, güvenlik, kapasite, üçüncü taraf API değişikliği veya mücbir sebep nedeniyle hizmet geçici olarak durabilir. Kullanıcıyı önemli ölçüde etkileyen değişiklikleri makul bir yöntemle duyurmaya çalışırız.</p></Section>

        <Section id="sorumluluk" title="12. Sorumluluğun kapsamı"><p>Tentamark, uygulanabilir hukukun izin verdiği ölçüde kullanıcı içeriğinden, yayınlama kararlarından, üçüncü taraf platform eylemlerinden ve AI çıktılarının kontrol edilmeden kullanılmasından doğan sonuçlardan sorumlu değildir. Hiçbir hüküm; kast, ağır kusur, kişisel verilerin hukuka aykırı işlenmesi veya emredici tüketici mevzuatı kapsamında sınırlandırılamayan sorumlulukları ortadan kaldırmaz.</p></Section>

        <Section id="gizlilik" title="13. Gizlilik ve kişisel veriler"><p>Kişisel verilerin işlenmesine ilişkin ayrıntılar <Link className="font-semibold text-[#C92E35] hover:underline" href="/gizlilik">Gizlilik Politikası ve KVKK Aydınlatma Metni</Link>&apos;nde açıklanır. Ekip üyeleri çalışma alanındaki müşteri ve marka bilgilerini yalnızca yetkileri kapsamında kullanmalıdır.</p></Section>

        <Section id="hukuk" title="14. Uygulanacak hukuk ve uyuşmazlıklar"><p>Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Tüketicilerin yerleşim yerindeki tüketici hakem heyeti veya tüketici mahkemesi dahil emredici mevzuattan doğan yetkileri saklıdır. Ticari kullanıcılarla uyuşmazlıklarda görevli ve yetkili merci uygulanabilir usul kurallarına göre belirlenir.</p></Section>

        <Section id="degisiklik" title="15. Değişiklikler ve iletişim"><p>Koşullar ürün veya mevzuat değişiklikleri nedeniyle güncellenebilir. Esaslı değişiklikler yürürlüğe girmeden önce uygun bir yöntemle duyurulur.</p><p><strong>Tentamark</strong><br />Destek ve hesap işlemleri: <a className="text-[#C92E35] hover:underline" href="mailto:support@tentamark.com">support@tentamark.com</a><br />Genel ve hukuki iletişim: <a className="text-[#C92E35] hover:underline" href="mailto:info@tentamark.com">info@tentamark.com</a></p></Section>
      </article>
    </main>
  );
}
