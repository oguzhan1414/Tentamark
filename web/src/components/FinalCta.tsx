"use client";

import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi2";
import { useLanguage } from "@/context/LanguageContext";

export default function FinalCta() {
  const { t } = useLanguage();
  return (
    <section id="erken-erisim" className="relative z-30 bg-[linear-gradient(180deg,#eef8ff_0%,#f7fbff_18%,#ffffff_48%,#ffffff_100%)] px-4 pt-16 text-ink sm:px-6 sm:pt-20">
      <div className="relative mx-auto grid max-w-7xl items-center gap-6 overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(110deg,#f7f5ff_0%,#fff_48%,#fff2f0_100%)] px-6 py-7 shadow-[0_18px_50px_rgba(44,34,75,0.08)] sm:px-9 md:grid-cols-[1fr_auto] lg:px-12">
        <div className="pointer-events-none absolute -left-16 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-violet/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-coral/15 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-text">{t.finalCta.eyebrow}</p>
          <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold tracking-tight sm:text-3xl">{t.finalCta.titleBefore}<span className="spectrum-text">{t.finalCta.titleHighlight}</span></h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{t.finalCta.copy}</p>
        </div>
        <div className="relative flex flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row">
          <Link href="/kayit" className="group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white shadow-lg shadow-ink/15 transition hover:-translate-y-0.5 hover:bg-violet">{t.finalCta.buttonText}<HiOutlineArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
          <Link href="/nasil-calisir" className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3 text-sm font-bold text-ink transition hover:border-violet/30 hover:bg-bg-violet">{t.finalCta.secondaryButtonText}</Link>
        </div>
      </div>
    </section>
  );
}
