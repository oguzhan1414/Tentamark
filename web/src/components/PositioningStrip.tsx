const ITEMS = [
  { label: "AI Content Generator", verdict: "cross" },
  { label: "AI Social Media Scheduler", verdict: "cross" },
  { label: "AI Marketing Manager", verdict: "check" },
] as const;

export default function PositioningStrip() {
  return (
    <section className="border-t border-white/10 bg-[#0a0a0b] px-6 pt-10 pb-20 sm:pt-12 sm:pb-28">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
        {ITEMS.map((item, i) => (
          <div key={item.label} className="flex items-center gap-5 sm:gap-8">
            <div className="flex items-center gap-2.5">
              <span
                className={
                  item.verdict === "check"
                    ? "font-mono text-base text-mint"
                    : "font-mono text-base text-white/30"
                }
                aria-hidden="true"
              >
                {item.verdict === "check" ? "✓" : "✕"}
              </span>
              <span
                className={
                  item.verdict === "check"
                    ? "font-display text-lg font-semibold text-white sm:text-xl"
                    : "font-display text-lg text-white/40 line-through decoration-white/30 sm:text-xl"
                }
              >
                {item.label}
              </span>
            </div>
            {i < ITEMS.length - 1 && (
              <span className="hidden font-mono text-white/20 sm:inline">/</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
