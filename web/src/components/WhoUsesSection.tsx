"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { HiOutlineArrowRight, HiOutlineCheck, HiOutlineXMark } from "react-icons/hi2";

const FIT_ICONS = ["01", "02", "03", "04"];
const EDGE_ICONS = ["A", "B", "C"];

export default function WhoUsesSection() {
  const { t, isEn } = useLanguage();
  return (
    <section id="kimler-icin" className="relative z-40 -mt-8 overflow-hidden rounded-t-[2.25rem] border-t border-line bg-[#F8F6F2] px-4 pb-16 pt-14 text-ink shadow-[0_-12px_35px_rgba(28,20,48,0.06)] sm:-mt-12 sm:rounded-t-[3rem] sm:px-6 sm:pb-20 sm:pt-20 lg:rounded-t-[3.5rem]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#D8D1E2_1px,transparent_1px)] [background-size:28px_28px] opacity-20" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[70rem] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(109,74,255,0.10),transparent_65%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/85 px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted shadow-sm backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-coral" />{t.whoUses.badge}</div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t.whoUses.titleBefore}<span className="text-coral">{t.whoUses.titleHighlight}</span></h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{t.whoUses.description}</p>
        </header>

        <div className="relative mt-9 overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/72 p-4 shadow-[0_30px_90px_rgba(40,31,67,0.12)] backdrop-blur-xl sm:p-6 lg:p-8">
          <div className="pointer-events-none absolute inset-y-0 left-[38%] hidden w-px bg-gradient-to-b from-transparent via-violet/20 to-transparent lg:block" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-[31%] hidden w-px bg-gradient-to-b from-transparent via-coral/20 to-transparent lg:block" aria-hidden="true" />

          <div className="grid items-center gap-5 lg:grid-cols-[1.15fr_0.8fr_0.95fr]">
            <div>
              <div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2 text-emerald-700"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white"><HiOutlineCheck className="h-4 w-4" /></span><span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em]">{t.whoUses.fitCard.badge}</span></div><span className="font-mono text-[9px] font-bold text-emerald-700/70">{t.whoUses.fitCard.scenariosCount}</span></div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {t.whoUses.fitCard.personas.map((persona, index) => (
                  <article key={persona.role} className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/55 p-3.5 transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
                    <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full border border-emerald-100 transition-transform group-hover:scale-125" />
                    <div className="relative flex items-center justify-between"><span className="font-mono text-[10px] font-black text-emerald-600">{FIT_ICONS[index]}</span><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold text-emerald-800">{persona.badge}</span></div>
                    <h3 className="relative mt-2 font-display text-[13px] font-extrabold">{persona.role}</h3>
                    <p className="relative mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-600">{persona.desc}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-[270px] flex-col items-center justify-center py-3 text-center">
              <div className="absolute h-64 w-64 rounded-full border border-violet/10" aria-hidden="true" />
              <div className="absolute h-48 w-48 rounded-full border border-dashed border-violet/20 [animation:spin_24s_linear_infinite]" aria-hidden="true" />
              <div className="absolute h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(109,74,255,0.18),transparent_68%)] blur-sm" aria-hidden="true" />
              <div className="relative grid h-24 w-24 place-items-center rounded-[1.8rem] border border-white bg-white shadow-[0_20px_55px_rgba(72,55,128,0.20)]">
                <Image src="/brand/tentamark-mark-512.png" alt="Tentamark" width={66} height={66} className="h-16 w-16 object-contain" />
                <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-emerald-500 text-white shadow-md"><HiOutlineCheck className="h-4 w-4 stroke-[2.5]" /></span>
              </div>
              <p className="relative mt-5 font-display text-base font-extrabold">{isEn ? "A clear offer. A consistent workflow." : "Net bir teklif. Düzenli bir iş akışı."}</p>
              <p className="relative mt-1.5 max-w-[220px] text-[11px] leading-relaxed text-muted">{t.whoUses.fitCard.summary}</p>
              <Link href="/kayit" className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-ink/15 transition hover:-translate-y-0.5 hover:bg-violet">{t.whoUses.bottomBanner.ctaText}<HiOutlineArrowRight className="h-3.5 w-3.5" /></Link>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2 text-coral"><span className="grid h-6 w-6 place-items-center rounded-full bg-coral text-white"><HiOutlineXMark className="h-4 w-4" /></span><span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em]">{t.whoUses.misfitCard.badge}</span></div><span className="font-mono text-[9px] font-bold text-coral/70">{t.whoUses.misfitCard.scenariosCount}</span></div>
              <div className="space-y-2.5">
                {t.whoUses.misfitCard.personas.map((persona, index) => (
                  <article key={persona.title} className="group flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 transition duration-300 hover:border-coral/30 hover:shadow-md">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-coral/10 font-mono text-[9px] font-black text-coral">{EDGE_ICONS[index]}</span>
                    <div><h3 className="font-display text-[12px] font-extrabold leading-snug">{persona.title}</h3><p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-600">{persona.desc}</p></div>
                  </article>
                ))}
              </div>
              <p className="mt-3 px-2 text-center text-[10px] font-semibold leading-relaxed text-[#8D5260]">{t.whoUses.misfitCard.footerNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
