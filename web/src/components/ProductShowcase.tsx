"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useLanguage } from "@/context/LanguageContext";

export default function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".ps-reveal", {
          opacity: 0,
          y: 26,
          duration: 0.65,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".ps-reveal", { opacity: 1, clearProps: "transform" });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      id="urun-vitrini"
      ref={sectionRef}
      className="relative z-10 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg-sky text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="ps-reveal">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky font-semibold mb-2">
              {t.productShowcase.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {t.productShowcase.titleBefore}
              <span className="text-sky">{t.productShowcase.titleHighlight}</span>
            </h2>
            <p className="mt-3 font-body text-base leading-relaxed text-muted">
              {t.productShowcase.copy}
            </p>
          </div>
        </div>

        <div className="ps-reveal relative mt-8">
          <div className="overflow-hidden rounded-[1.75rem] border border-line bg-surface/70 p-2 shadow-xl sm:p-4">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface border border-line">
              <Image
                src="/images/ui-calendar.png"
                alt={t.productShowcase.imageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 70vw, 100vw"
                className="object-contain object-center transition-transform duration-700 ease-out hover:scale-[1.01]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
