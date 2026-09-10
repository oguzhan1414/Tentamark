"use client";

import { useState } from "react";
import Image from "next/image";

type Step = {
  n: string;
  key: string;
  label: string;
  title: string;
  desc: string;
  image: string;
  badge: string;
  badgeColor: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    key: "brand-dna",
    label: "Brand DNA",
    title: "Markanızı tanır, dijital kimliğini çıkarır.",
    desc: "Sektörünüz, konuşma tonunuz (Samimi, Profesyonel), renk paletiniz ve yasaklı konular. Beş dakikada yapılandırılmış bir Brand DNA oluşturur.",
    image: "/images/step-brand-dna.jpg",
    badge: "Kimlik Stüdyosu",
    badgeColor: "text-accent bg-accent/10 border-accent/20",
  },
  {
    n: "02",
    key: "content-ai",
    label: "TentaCast",
    title: "Tek bir fikri tüm platformlara uyarlar.",
    desc: "Kopyala-yapıştır yok. Aynı brief'i Instagram'da enerjik caption'a, Facebook'ta topluluk postuna, LinkedIn'de profesyonel makaleye dönüştürür.",
    image: "/images/ui-composer.jpg",
    badge: "Çoklu Yayın",
    badgeColor: "text-sky bg-sky/10 border-sky/20",
  },
  {
    n: "03",
    key: "approval",
    label: "1-Tıkla Onay",
    title: "Son söz her zaman sizdedir.",
    desc: "AI tüm taslakları hazırlar; siz telefonunuzdan veya bilgisayarınızdan tek dokunuşla inceler ve onaylarsınız. Onayınız olmadan hiçbir şey yayınlanmaz.",
    image: "/images/ui-approval.jpg",
    badge: "İnsan Onaylı",
    badgeColor: "text-mint bg-mint/10 border-mint/20",
  },
  {
    n: "04",
    key: "publish",
    label: "Otomatik Yayın",
    title: "Doğru saatte, doğru kanalda yayında.",
    desc: "Onayladığınız içerikler en yüksek etkileşim saatinde Instagram, Facebook ve LinkedIn hesaplarınıza otomatik olarak servis edilir.",
    image: "/images/step-publish.jpg",
    badge: "Akıllı Zamanlama",
    badgeColor: "text-mint bg-mint/10 border-mint/20",
  },
  {
    n: "05",
    key: "learning",
    label: "Öğrenme Döngüsü",
    title: "Rakamlar bir sonraki haftanın planını yazar.",
    desc: "Hangi içerik neden tuttu? Tenta performansı ölçer (+%37 etkileşim), ders çıkarır ve gelecek haftanın içerik takvimini otomatik olarak günceller.",
    image: "/images/ui-analytics-dark.jpg",
    badge: "Sürekli Gelişim",
    badgeColor: "text-coral-bright bg-coral/10 border-coral/20",
  },
];

export default function LoopSection() {
  const [active, setActive] = useState(0);
  const currentStep = STEPS[active];

  return (
    <section
      id="dongu"
      className="relative z-20 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-[#0a0a0b] text-white shadow-[0_-16px_40px_rgba(0,0,0,0.18),0_-3px_10px_rgba(0,0,0,0.08)] border-t border-white/[0.08] px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[inherit] bg-gradient-to-b from-white/[0.03] to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            <span>Sonsuz Döngü</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Bir kere kurulmuyor, <span className="text-sky-400">her yayında daha akıllı hale geliyor.</span>
          </h2>
          <p className="mt-3 font-body text-base text-white/70 leading-relaxed">
            Çoğu araç içerik üretip bırakır. Tentamark&apos;ta döngü hiç kapanmaz: Her yayından öğrenilen sonuç, bir sonraki haftanın stratejisine geri beslenir.
          </p>
        </div>

        {/* Step Selector Pills */}
        <div className="mt-10 flex flex-wrap gap-2.5">
          {STEPS.map((step, i) => {
            const isActive = active === i;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setActive(i)}
                className={`group flex items-center gap-2.5 rounded-full border px-4 py-2.5 font-body text-sm font-medium transition duration-200 ${
                  isActive
                    ? "border-white bg-white text-[#0a0a0b] shadow-md"
                    : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                    isActive
                      ? "bg-[#0a0a0b] text-white"
                      : "bg-white/10 text-white/60 group-hover:bg-accent/20 group-hover:text-accent"
                  }`}
                >
                  {step.n}
                </span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Step Display Container */}
        <div className="mt-8 grid items-center gap-8 rounded-2xl border border-white/10 bg-[#141416]/80 p-6 sm:p-10 lg:grid-cols-[1fr_1.3fr] shadow-2xl">
          {/* Left: Step Info */}
          <div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] ${currentStep.badgeColor}`}>
              {currentStep.badge}
            </span>

            <h3 className="mt-4 font-display text-2xl sm:text-3xl font-bold leading-snug text-white">
              {currentStep.title}
            </h3>

            <p className="mt-3 font-body text-base leading-relaxed text-white/70">
              {currentStep.desc}
            </p>

            <div className="mt-8 flex items-center gap-3 font-mono text-xs text-white/50">
              <span className="flex h-2 w-2 rounded-full bg-mint animate-pulse" />
              <span>Adım {active + 1} / {STEPS.length}: {currentStep.label}</span>
            </div>

            {/* Quick Step Switch Buttons */}
            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActive((prev) => (prev > 0 ? prev - 1 : STEPS.length - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10 hover:border-white/30"
                aria-label="Önceki Adım"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setActive((prev) => (prev < STEPS.length - 1 ? prev + 1 : 0))}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10 hover:border-white/30"
                aria-label="Sonraki Adım"
              >
                →
              </button>
              <span className="ml-2 font-mono text-xs uppercase tracking-[0.1em] text-white/50">
                Döngüyü İnceleyin
              </span>
            </div>
          </div>

          {/* Right: Crisp, Unclipped Mockup Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c1013] p-2 sm:p-3 shadow-lg">
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#050505]">
              <Image
                key={currentStep.key}
                src={currentStep.image}
                alt={currentStep.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain object-center transition-opacity duration-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Loop Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-[0.15em] text-white/50">
          <span className="text-accent">↺</span>
          <span>Öğrenme, bir sonraki haftanın stratejisini besler</span>
        </div>
      </div>
    </section>
  );
}
