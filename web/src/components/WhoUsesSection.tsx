"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function WhoUsesSection() {
  const { t } = useLanguage();

  return (
    <section
      id="kimler-icin"
      className="relative z-50 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky font-semibold mb-2">
            {t.whoUses.eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t.whoUses.titleBefore}
            <span className="text-sky">{t.whoUses.titleHighlight}</span>
          </h2>
          <p className="mt-3 font-body text-base leading-relaxed text-muted">
            {t.whoUses.copy}
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[3fr_2fr]">
          <div
            style={{ ["--lift-rgb" as string]: "16 185 129" }}
            className="lift spectrum-ring relative overflow-hidden rounded-2xl border border-line bg-bg-mint p-7 shadow-sm sm:p-8"
          >
            <div
              className="glow pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-mint"
              aria-hidden="true"
            />
            <span className="relative inline-flex items-center gap-1.5 rounded-full border border-mint/30 bg-surface/80 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-mint">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden="true" />
              {t.whoUses.fitBadge}
            </span>
            <p className="relative mt-4 font-display text-lg font-bold text-ink">
              {t.whoUses.fitTitle}
            </p>
            <ul className="relative mt-4 space-y-3">
              {t.whoUses.fitItems.map((item) => (
                <li key={item} className="flex items-start gap-3 font-body text-sm leading-relaxed text-ink/90">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-[11px] font-bold text-surface"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="relative mt-6 border-t border-line/70 pt-4 font-body text-sm font-semibold text-ink">
              {t.whoUses.fitConclusion}
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-dashed border-line p-6 sm:p-7">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">
              {t.whoUses.notFitTitle}
            </p>
            <ul className="mt-4 space-y-3">
              {t.whoUses.notFitItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-body text-sm leading-relaxed text-faint">
                  <span className="mt-0.5" aria-hidden="true">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
