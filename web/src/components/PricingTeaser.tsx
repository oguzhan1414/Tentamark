"use client";

import { useLanguage } from "@/context/LanguageContext";

const TIER_META = [
  { tinted: true },
  { tinted: false },
  { tinted: true },
  { tinted: false },
];

function Cell({ value, tinted }: { value: string; tinted: boolean }) {
  if (value === "✓") {
    return <span className={`font-bold ${tinted ? "text-accent-text" : "text-mint"}`}>✓</span>;
  }
  if (value === "—") {
    return <span className="text-faint">—</span>;
  }
  return <span className={tinted ? "font-semibold text-ink" : "text-muted"}>{value}</span>;
}

export default function PricingTeaser() {
  const { t } = useLanguage();

  const tiers = t.pricing.tiers.map((tier, idx) => ({
    ...tier,
    tinted: TIER_META[idx]?.tinted ?? false,
  }));

  return (
    <section
      id="fiyatlandirma"
      className="relative z-80 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-text">
            {t.pricing.eyebrow}
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t.pricing.titleBefore}
            <span className="spectrum-text">{t.pricing.titleHighlight}</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted">
            {t.pricing.copy}
          </p>
          <p className="mt-2 font-body text-sm leading-relaxed text-faint">
            {t.pricing.creditExplainer}
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-48 border-b border-line bg-surface p-4 align-bottom" />
                {tiers.map((tier) => (
                  <th
                    key={tier.name}
                    className={
                      "border-b border-line p-4 align-bottom " +
                      (tier.tinted ? "bg-accent-subtle" : "")
                    }
                  >
                    <p className="font-display text-base font-bold text-ink">{tier.name}</p>
                    <p className="mt-0.5 font-mono text-xl font-bold text-accent-text">
                      {tier.price}
                      <span className="ml-1 font-body text-xs font-normal text-faint">
                        {t.pricing.perMonth}
                      </span>
                    </p>
                    <p className="mt-0.5 font-body text-[11px] font-normal text-muted">{tier.for}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {t.pricing.features.map((feature, i) => (
                <tr key={feature.label} className={i % 2 === 1 ? "bg-surface-soft/50" : undefined}>
                  <td className="sticky left-0 z-10 border-b border-line bg-[inherit] p-4 font-body text-sm font-medium text-ink">
                    {feature.label}
                  </td>
                  {feature.values.map((val, ti) => (
                    <td
                      key={`${tiers[ti]?.name}-${feature.label}`}
                      className={
                        "border-b border-line p-4 text-center font-body text-sm " +
                        (tiers[ti]?.tinted ? "bg-accent-subtle/40" : "")
                      }
                    >
                      <Cell value={val} tinted={tiers[ti]?.tinted ?? false} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
