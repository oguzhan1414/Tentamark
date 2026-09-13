"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import PlatformIcon, { type RoadmapPlatformName } from "./PlatformIcon";

const TIERS_CONFIG = [
  {
    key: "gorsel-video",
    platforms: [
      { key: "instagram", name: "Instagram", status: "active" as const },
      { key: "tiktok", name: "TikTok", status: "soon" as const },
      { key: "youtube", name: "YouTube", status: "soon" as const },
      { key: "pinterest", name: "Pinterest", status: "soon" as const },
    ],
  },
  {
    key: "metin-topluluk",
    platforms: [
      { key: "threads", name: "Threads", status: "soon" as const },
      { key: "linkedin", name: "LinkedIn", status: "active" as const },
      { key: "facebook", name: "Facebook", status: "active" as const },
      { key: "x", name: "X", status: "soon" as const },
    ],
  },
  {
    key: "e-ticaret",
    platforms: [
      { key: "shopify", name: "Shopify", status: "soon" as const },
      { key: "google-business", name: "Google Business Profile", status: "soon" as const },
    ],
  },
  {
    key: "mesajlasma",
    platforms: [
      { key: "telegram", name: "Telegram", status: "soon" as const },
      { key: "discord", name: "Discord", status: "soon" as const },
      { key: "whatsapp", name: "WhatsApp Business", status: "soon" as const },
    ],
  },
];

export default function PlatformsSection() {
  const { t } = useLanguage();

  return (
    <section
      id="platformlar"
      className="relative z-30 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg-coral text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-coral-bright font-semibold mb-2">
            {t.platforms.eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t.platforms.titleBefore}
            <span className="text-coral-bright">{t.platforms.titleHighlight}</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted">
            {t.platforms.copy}
          </p>
        </div>

        <div
          style={{ ["--lift-rgb" as string]: "255 84 112" }}
          className="lift group relative mt-10 overflow-hidden rounded-[1.75rem] border border-line bg-surface/70 p-2 shadow-xl sm:p-4"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface border border-line">
            <Image
              src="/images/ui-devices.png"
              alt={t.platforms.imageAlt}
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
          </div>
          <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full border border-line bg-surface/95 px-3 py-1 shadow-sm backdrop-blur text-xs font-medium text-ink">
            <span className="flex h-2 w-2 rounded-full bg-mint animate-pulse" />
            <span>{t.platforms.deviceBadge}</span>
          </div>
        </div>

        <div className="mt-14 space-y-8">
          {TIERS_CONFIG.map((tierConfig) => {
            const meta = t.platforms.tiers.find((tr) => tr.key === tierConfig.key) || {
              label: tierConfig.key,
              hint: "",
            };

            return (
              <div key={tierConfig.key}>
                <div className="flex items-baseline gap-2.5">
                  <h3 className="font-display text-sm font-bold text-ink">{meta.label}</h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                    {meta.hint}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-3">
                  {tierConfig.platforms.map((p) => (
                    <div
                      key={p.key}
                      className="flex items-center gap-2.5 rounded-full border border-line bg-surface/80 py-1.5 pl-1.5 pr-4 shadow-sm"
                    >
                      <PlatformIcon name={p.key as RoadmapPlatformName} className="h-8 w-8 shrink-0" />
                      <span className="font-body text-sm font-medium text-ink">{p.name}</span>
                      {p.status === "active" ? (
                        <span
                          className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-mint"
                          aria-label={t.platforms.statusActive}
                          title={t.platforms.statusActive}
                        />
                      ) : (
                        <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-faint">
                          {t.platforms.statusSoon}
                        </span>
                      )}
                    </div>
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
