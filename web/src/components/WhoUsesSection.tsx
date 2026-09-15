"use client";

import Image from "next/image";
import Link from "next/link";
import { HiOutlineArrowRight, HiOutlineCpuChip, HiOutlineLightBulb } from "react-icons/hi2";

type Persona = { image: string; label: string };

const FIT_PERSONAS: Persona[] = [
  { image: "/images/who-uses/founder.jpeg", label: "Tek Başına Kurucu" },
  { image: "/images/who-uses/shop-owner.jpeg", label: "Yerel İşletme Sahibi" },
  { image: "/images/who-uses/ecommerce.jpeg", label: "E-Ticaret Markası" },
  { image: "/images/who-uses/agency.jpeg", label: "Küçük Ajans" },
];

const FIT_LINES = [
  "Stratejiniz var, yazacak vaktiniz yok",
  "Yayın öncesi son söz sizde kalsın istiyorsunuz",
  "Tek başınıza çok kanallı büyümek istiyorsunuz",
];

// Kurumsal dev markalar veya stüdyo/ajans arayanlar burada değil — Tentamark
// bir sosyal medya pazarlama aracı, onları da rahatça kullanabilir; gerçek
// ayrım çizgisi sadece ürün henüz yoksa veya AI'a tamamen kapalıysa.
const MISFIT_LINES = [
  { icon: HiOutlineLightBulb, text: "Henüz satacak bir ürününüz yok" },
  { icon: HiOutlineCpuChip, text: "Otomasyona tamamen kapalısınız" },
];

/*
  "Herkes için değil" iddiasını iki eşit/simetrik kutuyla değil, arka plandaki
  konfeti dokusunun kendi ağırlığına uyan asimetrik bir düzenle anlatıyor:
  sol taraf (görselin dolu/renkli kısmı) geniş ve kalabalık — gerçek profil
  illüstrasyonları burada; sağ taraf (görselin boşalıp koyulaştığı kısım) dar
  ve sessiz — sadece iki kısa satır. Ayrı bir damga/filigran katmanı yok,
  görselin kendisi zaten imza öğesi.

  Kurgusal bir müşteri alıntısı yok: bu bölümün önceki hali ("Melis Yılmaz,
  Nordic Home") gerçekte var olmayan bir kişiye uydurma bir alıntı
  yakıştırıyordu — projenin geri kalanında hiç yapmadığımız bir şey.
*/
export default function WhoUsesSection() {
  return (
    <section
      id="kimler-icin"
      className="relative z-50 -mt-8 sm:-mt-12 overflow-hidden rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-[#0B0812] px-4 pt-20 pb-24 text-white shadow-[0_-10px_30px_rgba(28,20,48,0.25)] sm:px-6 sm:pt-28 sm:pb-32"
    >
      {/* Konfeti dokusu — tüm bölümün arka planı, sol kenardan içeri dolup
          bölümün kendi koyu rengine sönümleniyor */}
      <Image
        src="/images/who-uses/arka-plan.jpeg"
        alt=""
        fill
        aria-hidden="true"
        className="pointer-events-none -z-20 object-cover opacity-70"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#0B0812]/15 via-[#0B0812]/70 to-[#0B0812]" />

      <div className="relative mx-auto max-w-5xl">
        {/* ================= BAŞLIK ================= */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
            Dürüst Filtre
          </div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[46px] leading-tight">
            Tentamark <span className="text-[#FA5252]">herkes için değil.</span>
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-white/50 sm:text-base">
            Kimin için doğru olduğumuzu açıkça söylemek vaktinizi korur — yanlış bir beklenti oluşmasını engeller.
          </p>
        </div>

        {/* ================= ASİMETRİK İKİLİ: DOLU SOL, SESSİZ SAĞ ================= */}
        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* ---------------- SOL: UYGUN PROFİLLER (geniş, kalabalık) ---------------- */}
          <div className="lg:col-span-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              ✓ Uygun
            </span>

            <div className="mt-6 flex flex-wrap items-end gap-5 sm:gap-6">
              {FIT_PERSONAS.map((persona, i) => (
                <div
                  key={persona.label}
                  className={`flex flex-col items-center gap-2 transition-transform hover:-translate-y-1 hover:scale-105 ${
                    i % 2 === 0 ? "rotate-[-3deg]" : "rotate-[3deg]"
                  }`}
                >
                  <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-emerald-400/60 sm:h-24 sm:w-24">
                    <Image src={persona.image} alt={persona.label} width={96} height={96} className="h-full w-full object-cover" />
                  </div>
                  <span className="max-w-[92px] text-[11px] font-bold leading-tight text-emerald-300">{persona.label}</span>
                </div>
              ))}
            </div>

            <ul className="mt-8 space-y-2.5">
              {FIT_LINES.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm font-medium text-white/85">
                  <span className="mt-0.5 text-emerald-400">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------- SAĞ: UYGUN OLMAYAN (dar, sessiz) ---------------- */}
          <div className="lg:col-span-4 lg:border-l lg:border-white/10 lg:pl-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/40">
              ✕ Değil
            </span>

            <ul className="mt-6 space-y-3">
              {MISFIT_LINES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm font-medium text-white/40">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/25" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-[11px] font-semibold text-white/25">
              Bunlar için şu an doğru zaman Tentamark değil.
            </p>
          </div>
        </div>

        {/* ================= TEK ORTAK CTA ================= */}
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Link
            href="/kayit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FA5252] px-8 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-8px_rgba(250,82,82,0.6)] transition-all hover:scale-[1.03] hover:bg-[#e04545] sm:text-base"
          >
            <span>Kendinizi Solda Buldunuz mu? 14 Gün Ücretsiz Deneyin</span>
            <HiOutlineArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-[11px] text-white/30">Kredi kartı gerekmez.</p>
        </div>
      </div>
    </section>
  );
}
