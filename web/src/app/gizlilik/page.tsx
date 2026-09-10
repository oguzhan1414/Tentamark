import Link from "next/link";

export const metadata = {
  title: "Gizlilik Politikası (Privacy Policy) — Tentamark",
  description: "Tentamark platformu gizlilik politikası ve veri güvenliği ilkeleri.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto rounded-[24px] border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-8">
        <div className="border-b border-slate-100 pb-6">
          <Link href="/" className="text-xs font-bold text-indigo-600 hover:underline">
            ← Ana Sayfaya Dön
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mt-3">
            Gizlilik Politikası (Privacy Policy)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Son Güncelleme: 10 Eylül 2026 · Tentamark AI Marketing
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">1. Genel Bilgilendirme</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Tentamark, kullanıcıların sosyal medya hesaplarını (TikTok, Instagram, Facebook, vb.) tek bir
            merkezden planlamasını, içerik üretmesini ve yönetmesini sağlayan yapay zeka destekli bir pazarlama otomasyon
            platformudur. Bu Gizlilik Politikası, web sitemizi ve hizmetlerimizi kullandığınızda kişisel verilerinizin nasıl
            toplandığını, işlendiğini ve korunduğunu açıklamaktadır.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">2. Toplanan Veriler ve Kullanım Amacı</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Platformumuz aşağıdaki verileri yalnızca hizmetlerin eksiksiz yürütülmesi amacıyla toplar:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 ml-2">
            <li><b>Hesap Bilgileri:</b> Ad, e-posta adresi, marka adı ve profil bilgileri.</li>
            <li>
              <b>Sosyal Medya Entegrasyon Verileri (TikTok, Meta vb.):</b> Kullanıcının açık izniyle OAuth protokolü
              aracılığıyla alınan erişim belirteçleri (access token), kullanıcı adı, profil kimliği ve yayınlama izinleri.
            </li>
            <li>
              <b>İçerik Verileri:</b> Planlanan metinler, oluşturulan görseller, video dosyaları ve yayın zamanlama verileri.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">3. TikTok API ve Veri Güvenliği</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            TikTok for Developers API (Login Kit ve Content Posting API) üzerinden sağlanan veriler:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 ml-2">
            <li>Asla üçüncü taraf reklam ağlarıyla veya veri simsarlarıyla paylaşılmaz veya satılmaz.</li>
            <li>Yalnızca kullanıcının kendi yetkilendirdiği videoları yayınlamak ve temel profil bilgilerini göstermek için kullanılır.</li>
            <li>Tüm erişim belirteçleri ve oturum anahtarları şifrelenmiş (AES-256) veritabanlarında saklanır.</li>
            <li>Kullanıcı dilediği an <i>Bağlantılar</i> sayfasından TikTok bağlantısını kesebilir; bağlantı kesildiğinde tüm token&apos;lar anında silinir.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">4. Veri Saklama ve Silme Hakları</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Kullanıcılar diledikleri zaman hesaplarının ve buna bağlı tüm sosyal medya verilerinin tamamen silinmesini
            talep edebilir. Veri silme talepleri için <code>destek@tentamark.com</code> adresine e-posta gönderebilir veya
            paneldeki hesap ayarlarından silme işlemini başlatabilirsiniz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">5. İletişim</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Gizlilik politikamız veya veri koruma süreçlerimizle ilgili sorularınız için bizimle iletişime geçebilirsiniz:
            <br />
            E-posta: <b>destek@tentamark.com</b> / <b>oguzhansekerci14@gmail.com</b>
          </p>
        </section>
      </div>
    </div>
  );
}
