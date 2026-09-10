import Link from "next/link";

export const metadata = {
  title: "Kullanım Koşulları (Terms of Service) — Tentamark",
  description: "Tentamark platformu kullanım koşulları ve hizmet şartları.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-4xl mx-auto rounded-[24px] border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-8">
        <div className="border-b border-slate-100 pb-6">
          <Link href="/" className="text-xs font-bold text-indigo-600 hover:underline">
            ← Ana Sayfaya Dön
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 mt-3">
            Kullanım Koşulları (Terms of Service)
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Son Güncelleme: 10 Eylül 2026 · Tentamark AI Marketing
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">1. Hizmetlerin Tanımı</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Tentamark, kullanıcıların sosyal medya hesapları (TikTok, Instagram, LinkedIn vb.) için içerik oluşturmalarına,
            zamanlamalarına ve yapay zeka destekli pazarlama stratejileri yürütmelerine imkan tanıyan bir SaaS yazılımıdır.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">2. Kullanıcı Yükümlülükleri ve Hesap Güvenliği</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Kullanıcılar, platform üzerinden yayınladıkları tüm görsel, video ve metin içeriklerinin yasalara, fikri mülkiyet
            haklarına ve ilgili sosyal medya ağlarının (özellikle TikTok Topluluk Kuralları) şartlarına uygun olduğunu kabul
            ve taahhüt eder. Zararlı, yasadışı, nefret söylemi içeren veya spam niteliğindeki içeriklerin yayınlanması kesinlikle yasaktır.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">3. Üçüncü Taraf Entegrasyonları (TikTok API)</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Hizmetimiz, TikTok for Developers API&apos;leri ile entegre çalışır. Kullanıcılar hesaplarını bağladıklarında,
            TikTok&apos;un kendi Kullanım Şartları ve Geliştirici Politikalarına da tabi olduklarını onaylamış olurlar.
            Tentamark, üçüncü taraf platformların kesintilerinden veya API politika değişikliklerinden doğrudan sorumlu tutulamaz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">4. Fikri Mülkiyet</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Kullanıcı tarafından sisteme yüklenen tüm içeriklerin mülkiyeti kullanıcıya aittir. Tentamark markası, arayüz
            tasarımları ve yapay zeka entegrasyon algoritmaları Tentamark&apos;a aittir ve izinsiz kopyalanamaz.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">5. Değişiklikler ve İletişim</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Tentamark, bu kullanım koşullarını dilediği zaman güncelleme hakkını saklı tutar. Güncellemeler bu sayfada
            yayınlandığı andan itibaren geçerlilik kazanır.
            <br />
            Sorularınız için: <b>destek@tentamark.com</b> / <b>oguzhansekerci14@gmail.com</b>
          </p>
        </section>
      </div>
    </div>
  );
}
