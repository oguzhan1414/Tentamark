import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { LanguageProvider } from "@/context/LanguageContext";

const url = "https://tentamark.com/tentamark-nedir";

export const metadata: Metadata = {
  title: "Tentamark Nedir? Kimler İçin ve Nasıl Çalışır?",
  description:
    "Tentamark'ın sosyal medya içerik planlama, AI destekli taslak hazırlama ve insan onayı akışını; kimler için uygun olduğunu ve ürünün sınırlarını öğrenin.",
  alternates: { canonical: url },
  openGraph: {
    title: "Tentamark Nedir?",
    description: "Tentamark'ın ne yaptığını, kimler için uygun olduğunu ve çalışma akışını keşfedin.",
    url,
    type: "website",
    locale: "tr_TR",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tentamark.com/#organization",
      name: "Tentamark",
      url: "https://tentamark.com/",
      logo: "https://tentamark.com/brand/tentamark-mark.svg",
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "Tentamark Nedir?",
      inLanguage: "tr-TR",
      about: { "@id": "https://tentamark.com/#organization" },
      dateModified: "2026-09-19",
    },
  ],
};

export default function AboutTentamarkPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#FAF9F6] text-[#172B46]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        <SiteHeader />
        <main className="mx-auto max-w-4xl px-6 pb-20 pt-32">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#C92E35]">Ürün rehberi</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Tentamark nedir?</h1>
          <p className="mt-6 text-lg leading-8 text-[#536276]">
            Tentamark, küçük işletmelerin ve küçük pazarlama ekiplerinin sosyal medya içeriklerini
            planlamasına yardımcı olan AI destekli bir uygulamadır. Marka bilgisiyle içerik taslakları
            hazırlanır; kullanıcı taslakları gözden geçirir, düzenler ve yayın akışını yönetir.
          </p>

          <section className="mt-12 rounded-2xl border border-[#E3E6E9] bg-white p-7">
            <h2 className="text-2xl font-bold">Kimler için uygun?</h2>
            <p className="mt-4 leading-7 text-[#536276]">
              Düzenli içerik üretmek isteyen küçük işletmeler, kendi markasını yöneten girişimciler
              ve birden fazla taslağı ekip içinde inceleyen küçük pazarlama ekipleri için tasarlanmıştır.
              Tek bir gönderi yazma aracından çok, fikirden onaya uzanan iş akışını düzenlemeye odaklanır.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold">Nasıl çalışır?</h2>
            <ol className="mt-5 list-decimal space-y-3 pl-6 leading-7 text-[#536276]">
              <li>Marka, hedef kitle ve iletişim tonu hakkında bilgi girilir.</li>
              <li>Bir konu veya haftalık plan için içerik taslakları hazırlanır.</li>
              <li>Metin ve görseller insan tarafından kontrol edilir, gerekirse düzenlenir.</li>
              <li>Onaylanan içerik takvimde izlenir; kullanılabilir yayın bağlantıları hesaba göre değerlendirilir.</li>
            </ol>
            <Link href="/nasil-calisir" className="mt-5 inline-block font-semibold text-[#C92E35] underline-offset-4 hover:underline">
              Ayrıntılı çalışma akışını görün
            </Link>
          </section>

          <section className="mt-12 rounded-2xl border border-[#E3E6E9] bg-white p-7">
            <h2 className="text-2xl font-bold">Platform desteği ve ürün sınırları</h2>
            <p className="mt-4 leading-7 text-[#536276]">
              Bir platform için içerik hazırlamak ile o platformda doğrudan yayın yapmak farklı
              yeteneklerdir. Bağlantı ve yayın seçenekleri platformun API izinlerine, hesap türüne
              ve ürünün geliştirme durumuna bağlıdır. Güncel seçenekleri platform sayfalarında ve
              hesabınızdaki bağlantı ekranında kontrol edin. Her platformda her format için otomatik
              yayın veya gerçek performans analitiği vaat etmiyoruz.
            </p>
            <Link href="/platformlar" className="mt-5 inline-block font-semibold text-[#C92E35] underline-offset-4 hover:underline">
              Platformları inceleyin
            </Link>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold">Sık sorulan kısa sorular</h2>
            <dl className="mt-5 space-y-6">
              <div>
                <dt className="font-bold">Tentamark gönderileri onay olmadan yayınlar mı?</dt>
                <dd className="mt-2 leading-7 text-[#536276]">İçerik akışı insan incelemesi ve onayı üzerine kuruludur. Yayın öncesi taslağı kontrol edin.</dd>
              </div>
              <div>
                <dt className="font-bold">Tentamark her sosyal medya platformuna otomatik yayın yapar mı?</dt>
                <dd className="mt-2 leading-7 text-[#536276]">Hayır. Yayın imkanları platforma, hesap türüne ve gerekli izinlere göre değişir. Güncel kapsamı platform sayfalarında doğrulayın.</dd>
              </div>
              <div>
                <dt className="font-bold">Fiyatı nereden öğrenebilirim?</dt>
                <dd className="mt-2 leading-7 text-[#536276]"><Link href="/fiyatlandirma" className="text-[#C92E35] underline">Fiyatlandırma sayfasındaki</Link> güncel plan ve sınırları inceleyin.</dd>
              </div>
            </dl>
          </section>

          <p className="mt-12 border-t border-[#E3E6E9] pt-6 text-sm text-[#6B7888]">Son güncelleme: 19 Eylül 2026</p>
        </main>
        <SiteFooter />
      </div>
    </LanguageProvider>
  );
}
