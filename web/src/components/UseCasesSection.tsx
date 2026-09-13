"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const CASE_STYLES = [
  { key: "solo", image: "/images/usecase-1-solo.jpeg", cardBg: "bg-bg-violet" },
  { key: "local", image: "/images/usecase-2-local.jpeg", cardBg: "bg-bg-amber" },
  { key: "team", image: "/images/usecase-3-team.jpeg", cardBg: "bg-bg-sky" },
  { key: "ecommerce", image: "/images/usecase-4-ecommerce.jpeg", cardBg: "bg-bg-coral" },
  { key: "consultant", image: "/images/usecase-5-consultant.jpeg", cardBg: "bg-bg-mint" },
  { key: "startup", image: "/images/usecase-6-startup.jpeg", cardBg: "bg-bg-violet" },
];

export default function UseCasesSection() {
  const { t } = useLanguage();

  const cases = CASE_STYLES.map((style, i) => {
    const data = t.useCases.cases[i] || {
      title: "",
      desc: "",
      tag: "",
      points: [],
    };
    return {
      ...style,
      ...data,
    };
  });

  return (
    <section
      id="kullanim-senaryolari"
      className="relative z-40 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-text font-semibold mb-2">
            {t.useCases.eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t.useCases.titleBefore}
            <span className="spectrum-text">{t.useCases.titleHighlight}</span>
          </h2>
          <p className="mt-3 font-body text-base leading-relaxed text-muted">
            {t.useCases.copy}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div
              key={c.key}
              style={{ ["--lift-rgb" as string]: "109 79 235" }}
              tabIndex={0}
              className="lift group rounded-2xl [perspective:1400px] focus:outline-none"
            >
              <div className="relative h-[27rem] w-full transition-transform duration-700 ease-out motion-reduce:duration-0 motion-reduce:transition-none [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)]">
                {/* Front */}
                <div
                  className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-line shadow-sm [backface-visibility:hidden] ${c.cardBg}`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <span className="inline-flex items-center rounded-full border border-line bg-surface/70 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                      {c.tag}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold text-ink">{c.title}</h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-muted">{c.desc}</p>
                  </div>
                </div>

                {/* Back */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 flex flex-col justify-center overflow-hidden rounded-2xl border border-line p-7 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] ${c.cardBg}`}
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                    {c.tag}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold text-ink">{c.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {c.points.map((point) => (
                      <li key={point} className="flex gap-2.5 font-body text-sm leading-relaxed text-muted">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
