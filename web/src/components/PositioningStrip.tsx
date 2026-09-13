"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function PositioningStrip() {
  const { t } = useLanguage();

  return (
    <section className="border-t border-line bg-bg px-6 pt-10 pb-20 sm:pt-12 sm:pb-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
        {t.positioning.items.map((item, i) => (
          <div key={item.label} className="flex items-center gap-5 sm:gap-8">
            <div className="flex items-center gap-2.5">
              <span
                className={
                  item.verdict === "check"
                    ? "font-mono text-base text-mint"
                    : "font-mono text-base text-faint"
                }
                aria-hidden="true"
              >
                {item.verdict === "check" ? "✓" : "✕"}
              </span>
              <span
                className={
                  item.verdict === "check"
                    ? "font-display text-lg font-semibold text-ink sm:text-xl"
                    : "font-display text-lg text-faint line-through decoration-faint/50 sm:text-xl"
                }
              >
                {item.label}
              </span>
            </div>
            {i < t.positioning.items.length - 1 && (
              <span className="hidden font-mono text-faint sm:inline">/</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
