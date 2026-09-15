"use client";

import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineSparkles,
  HiOutlineXMark,
} from "react-icons/hi2";

type FitPersona = {
  image: string;
  role: string;
  badge: string;
  desc: string;
};

type MisfitPersona = {
  image: string;
  title: string;
  desc: string;
  recommendation: string;
};

const FIT_PERSONAS: FitPersona[] = [
  {
    image: "/images/who-uses/founder.jpeg",
    role: "Tek Başına Kurucu",
    badge: "Haftada +8 Saat",
    desc: "Ürün ve operasyon arasında sosyal medyaya her gün saatlerce vakit ayıramayanlar.",
  },
  {
    image: "/images/who-uses/ecommerce.jpeg",
    role: "E-Ticaret Markası",
    badge: "%100 Marka DNA'sı",
    desc: "Sıradan ChatGPT çıktıları yerine sitenizi tarayıp ürünlerinizi özgün tonla anlatan motor.",
  },
  {
    image: "/images/who-uses/shop-owner.jpeg",
    role: "Yerel İşletme & Hizmet",
    badge: "Düzenli Akış",
    desc: "'Bugün ne paylaşsak?' stresi olmadan her hafta profesyonel ve aktif kalanlar.",
  },
  {
    image: "/images/who-uses/agency.jpeg",
    role: "Butik Ajans & Danışman",
    badge: "10x Yönetim Hızı",
    desc: "Onlarca farklı markayı tek ekrandan ayrı kimliklerle saniyeler içinde yönetenler.",
  },
];

const MISFIT_PERSONAS: MisfitPersona[] = [
  {
    image: "/images/who-uses/misfit-agency.jpg",
    title: "Geleneksel 'Tam Hizmet' Ajansı Arayanlar",
    desc: "Haftalık slayt toplantıları, kreatif direktörle saatlerce beyin fırtınası ve prodüksiyon bekleyenler için Tentamark bir insan ajansı değil, otonom bir AI yazılımıdır.",
    recommendation: "Doğru Tercih: Klasik Tam Hizmet Reklam Ajansı",
  },
  {
    image: "/images/who-uses/misfit-no-product.jpg",
    title: "Henüz Satacak Bir Ürünü / Sitesi Olmayanlar",
    desc: "AI motorumuz web sitenizden ve gerçek ürünlerinizden beslenir. Henüz satacak veya anlatacak net bir değeriniz yoksa pazarlamaya bütçe harcamamalısınız.",
    recommendation: "Doğru Tercih: Önce Ürün-Pazar Uyumu (PMF) ve Prototip",
  },
  {
    image: "/images/who-uses/misfit-spam-bot.jpg",
    title: "30 Sn Bile Bakmayacak Kör Bot Arayanlar",
    desc: "'Hesabıma hiç bakmayayım, ne üretirse üretsin benden habersiz yayınlasın' diyorsanız uygun değiliz. Marka güvenliğinizi korumak için tek tıkla insan onayına inanırız.",
    recommendation: "Doğru Tercih: Kör Paylaşım Yapan Düşük Kaliteli Botlar",
  },
];

export default function WhoUsesSection() {
  return (
    <section
      id="kimler-icin"
      className="relative z-40 -mt-8 sm:-mt-12 overflow-hidden rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-[#FAF9F7] text-ink shadow-[0_-12px_35px_rgba(28,20,48,0.06)] border-t border-[#E8E3F0] px-4 sm:px-6 pt-14 pb-18 sm:pt-20 sm:pb-24"
    >
      {/* ================= ARKA PLAN ÖZEL TASARIMI ================= */}
      {/* Geometrik mikro-nokta ızgara dokusu */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D5CDE3_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
        aria-hidden="true"
      />

      {/* Sol taraf pastel zümrüt ışık aurası */}
      <div
        className="pointer-events-none absolute -top-10 left-10 h-[450px] w-[450px] rounded-full bg-emerald-200/35 blur-[120px]"
        aria-hidden="true"
      />
      {/* Sağ taraf pastel mercan ışık aurası */}
      <div
        className="pointer-events-none absolute -top-10 right-10 h-[450px] w-[450px] rounded-full bg-rose-200/35 blur-[120px]"
        aria-hidden="true"
      />
      {/* Merkez yumuşak lila aurası */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] bg-indigo-100/30 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* ================= BAŞLIK ALANI ================= */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#DFD8EB] bg-white px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-[#554A6E] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#FA5252] animate-pulse" />
            Dürüst Filtre · Radikal Şeffaflık
          </div>

          <h2 className="mt-3.5 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Tentamark <span className="text-[#FA5252]">herkes için değil.</span>
          </h2>

          <p className="mt-2.5 font-body text-sm font-medium leading-relaxed text-[#4A4260] sm:text-base">
            Kimin için mükemmel bir büyüme motoru olduğumuzu ve kimlerin zaman kaybetmemesi gerektiğini tüm açıklığıyla paylaşıyoruz.
          </p>
        </div>

        {/* ================= İKİ FARKLI ARKA PLAN TASARIMINA SAHİP KARTLAR ================= */}
        <div className="mt-12 grid gap-7 lg:grid-cols-2">
          {/* ================= 1. KART: TENTAMARK TAM SİZE GÖRE (ÖZEL ZÜMRÜT / FRESH MESH DİZAYN) ================= */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-emerald-300/80 bg-gradient-to-br from-[#F2FBF6] via-[#FFFFFF] to-[#E9F7EF] p-5 sm:p-7 shadow-[0_12px_35px_-8px_rgba(16,185,129,0.15)] transition-all duration-300 hover:shadow-[0_16px_40px_-8px_rgba(16,185,129,0.22)]">
            {/* Kart içi yumuşak zümrüt ışık lekesi */}
            <div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />

            <div className="relative">
              {/* Kart Başlığı */}
              <div className="flex items-center justify-between border-b border-emerald-200/70 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                    <HiOutlineCheck className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                      İdeal Eşleşme
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-ink">
                      Tentamark <span className="text-emerald-600">Tam Size Göre</span>
                    </h3>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 font-mono text-[11px] font-bold text-emerald-900 shadow-xs">
                  ✓ 4 Senaryo
                </span>
              </div>

              <p className="mt-3.5 text-xs sm:text-[13px] font-semibold text-[#304B3E]">
                Sosyal medyada görünür ve aktif kalmak istiyor; fakat her gün içerik yazmaya saatler ayıramıyorsanız:
              </p>

              {/* 4 Kompakt Görsel Persona Satırı */}
              <div className="mt-4 space-y-2.5">
                {FIT_PERSONAS.map((p) => (
                  <div
                    key={p.role}
                    className="group flex items-center gap-3.5 rounded-2xl border border-emerald-200/60 bg-white/90 p-3 shadow-xs transition-all duration-200 hover:border-emerald-400 hover:bg-white hover:shadow-md hover:translate-x-1"
                  >
                    <div className="relative h-12 w-12 sm:h-13 sm:w-13 shrink-0 overflow-hidden rounded-full ring-2 ring-emerald-500 shadow-sm transition-transform duration-200 group-hover:scale-105">
                      <Image
                        src={p.image}
                        alt={p.role}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display text-sm font-extrabold text-ink group-hover:text-emerald-700 transition-colors truncate">
                          {p.role}
                        </h4>
                        <span className="shrink-0 rounded-md bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-900">
                          {p.badge}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium leading-snug text-[#343042]">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sol Kart Alt Çizgisi */}
            <div className="relative mt-5 rounded-xl border border-emerald-200 bg-emerald-100/70 p-3 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-emerald-900">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                ✓
              </span>
              <span>
                Haftalık 10 saatlik mesaiyi 60 saniyelik tek tık onaya indiriyoruz.
              </span>
            </div>
          </div>

          {/* ================= 2. KART: TENTAMARK SİZE GÖRE DEĞİL (ÖZEL MERCAN / UYARI DİZAYN) ================= */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-rose-300/80 bg-gradient-to-br from-[#FFF5F6] via-[#FFFFFF] to-[#FDF0F3] p-5 sm:p-7 shadow-[0_12px_35px_-8px_rgba(244,63,94,0.15)] transition-all duration-300 hover:shadow-[0_16px_40px_-8px_rgba(244,63,94,0.22)]">
            {/* Kart içi yumuşak mercan ışık lekesi */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-rose-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-300/15 blur-3xl" />

            <div className="relative">
              {/* Kart Başlığı */}
              <div className="flex items-center justify-between border-b border-rose-200/70 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FA5252] text-white shadow-md shadow-rose-500/30">
                    <HiOutlineXMark className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                      Dürüst Ayrışma
                    </span>
                    <h3 className="font-display text-lg sm:text-xl font-extrabold text-ink">
                      Tentamark <span className="text-[#FA5252]">Size Göre Değil</span>
                    </h3>
                  </div>
                </div>

                <span className="rounded-full bg-rose-100 border border-rose-300 px-3 py-1 font-mono text-[11px] font-bold text-rose-900 shadow-xs">
                  ✕ 3 Durum
                </span>
              </div>

              <p className="mt-3.5 text-xs sm:text-[13px] font-semibold text-[#5B3037]">
                Beklentilerinizin uyuşmadığı bir yerde zaman kaybetmenizi istemeyiz; şu durumlardaysanız lütfen kayıt olmayın:
              </p>

              {/* 3 Kompakt Görsel Misfit Satırı */}
              <div className="mt-4 space-y-3">
                {MISFIT_PERSONAS.map((m) => (
                  <div
                    key={m.title}
                    className="group flex flex-col rounded-2xl border border-rose-200/60 bg-white/90 p-3 shadow-xs transition-all duration-200 hover:border-rose-400 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative h-12 w-12 sm:h-13 sm:w-13 shrink-0 overflow-hidden rounded-full ring-2 ring-rose-400 shadow-sm transition-transform duration-200 group-hover:scale-105">
                        <Image
                          src={m.image}
                          alt={m.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm font-extrabold text-ink group-hover:text-rose-700 transition-colors truncate">
                          {m.title}
                        </h4>
                        <p className="mt-0.5 text-xs font-medium leading-snug text-[#343042]">
                          {m.desc}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5 ml-15 flex items-center gap-1.5 text-xs font-bold text-rose-800">
                      <span className="text-[#FA5252] font-black">↳</span>
                      <span className="bg-rose-100 border border-rose-200/80 rounded-md px-2 py-0.5">
                        {m.recommendation}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ Kart Alt Çizgisi */}
            <div className="relative mt-5 rounded-xl border border-rose-200 bg-rose-100/70 p-3 text-center text-xs sm:text-sm font-bold text-rose-900">
              Vaktinizi korumak ve doğru zamanda karşılaşmak bizim için daha değerlidir.
            </div>
          </div>
        </div>

        {/* ================= PROFESYONEL ALT CTA ŞERİDİ ================= */}
        <div className="mt-12 rounded-3xl border border-[#DFD8EB] bg-gradient-to-r from-white via-[#FCFAFF] to-white p-6 sm:p-8 text-center shadow-sm">
          <div className="mx-auto max-w-xl">
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-ink">
              Kendinizi Sol Tarafta Gördünüz mü?
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#554A6E]">
              Haftalık sosyal medya operasyonunuzu tek tıkla otonom kılın, ilk haftalık planınızı hemen oluşturun.
            </p>

            <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/kayit"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#FA5252] px-7 py-2.5 text-sm font-bold text-white shadow-md shadow-[#FA5252]/25 transition-all hover:bg-[#e04545] hover:scale-[1.03]"
              >
                <span>14 Gün Ücretsiz Deneyin</span>
                <HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs font-semibold text-[#6E6485]">
              <span className="flex items-center gap-1">
                <HiOutlineCheck className="text-emerald-600 font-bold" /> Kredi kartı gerekmez
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineCheck className="text-emerald-600 font-bold" /> 60 saniyede kurulum
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineCheck className="text-emerald-600 font-bold" /> İstediğiniz zaman iptal
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
