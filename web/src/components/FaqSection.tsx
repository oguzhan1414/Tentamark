"use client";

import type { IconType } from "react-icons";
import { HiOutlineMinus, HiOutlinePlus, HiOutlineShieldCheck, HiOutlineSparkles, HiOutlineTag } from "react-icons/hi2";
import { useLanguage } from "@/context/LanguageContext";

// Each FAQ group gets its own accent from the site's existing palette,
// picked for what the group actually is (flagship product -> brand accent,
// trust -> mint, pricing -> amber) rather than decoration. Every class below
// is a complete literal string on purpose, including the group-open:
// compounds — Tailwind's scanner only picks up classes it can find verbatim
// in the source, so building "group-open:" + a variable at render time
// would silently drop the style.
const GROUP_STYLES: {
  icon: IconType;
  chip: string;
  toggleOpen: string;
  rule: string;
  openShadow: string;
}[] = [
  {
    icon: HiOutlineSparkles,
    chip: "bg-accent-subtle text-accent-text",
    toggleOpen: "group-open:border-transparent group-open:bg-accent-subtle group-open:text-accent-text",
    rule: "bg-accent",
    openShadow: "open:shadow-[0_20px_44px_-24px_rgba(250,82,82,0.35)]",
  },
  {
    icon: HiOutlineShieldCheck,
    chip: "bg-bg-mint text-mint",
    toggleOpen: "group-open:border-transparent group-open:bg-bg-mint group-open:text-mint",
    rule: "bg-mint",
    openShadow: "open:shadow-[0_20px_44px_-24px_rgba(16,185,129,0.35)]",
  },
  {
    icon: HiOutlineTag,
    chip: "bg-bg-amber text-amber",
    toggleOpen: "group-open:border-transparent group-open:bg-bg-amber group-open:text-amber",
    rule: "bg-amber",
    openShadow: "open:shadow-[0_20px_44px_-24px_rgba(217,119,6,0.35)]",
  },
];

export default function FaqSection() {
  const { t } = useLanguage();

  return (
    <section
      id="sss"
      className="relative z-90 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg-sky text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-text shadow-xs">
            {t.faq.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t.faq.titleBefore}
            <span className="spectrum-text">{t.faq.titleHighlight}</span>
          </h2>
        </div>

        <div className="mt-10 space-y-9">
          {t.faq.groups.map((group, groupIndex) => {
            const style = GROUP_STYLES[groupIndex % GROUP_STYLES.length];
            const Icon = style.icon;

            return (
              <div key={group.label}>
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.chip}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                    {group.label}
                  </p>
                </div>

                <div className="mt-3 space-y-2.5">
                  {group.items.map((item) => (
                    <details
                      key={item.q}
                      name="faq"
                      className={`lift group rounded-2xl border border-line bg-surface px-5 py-4 transition-shadow open:border-transparent ${style.openShadow}`}
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body text-sm font-semibold text-ink marker:content-none">
                        {item.q}
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-faint transition-colors ${style.toggleOpen}`}
                        >
                          <HiOutlinePlus className="h-3.5 w-3.5 group-open:hidden" aria-hidden="true" />
                          <HiOutlineMinus className="hidden h-3.5 w-3.5 group-open:block" aria-hidden="true" />
                        </span>
                      </summary>
                      <div className="mt-3 flex gap-3.5">
                        <span className={`w-0.5 shrink-0 rounded-full ${style.rule}`} aria-hidden="true" />
                        <p className="font-body text-sm leading-relaxed text-muted">{item.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
