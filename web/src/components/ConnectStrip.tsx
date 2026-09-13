"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import PlatformIcon, { type RoadmapPlatformName } from "./PlatformIcon";

type PlatformItem = {
  key: RoadmapPlatformName;
  name: string;
  glowColor: string;
  live: boolean;
};

const ZONES_CONFIG = [
  {
    id: "gorsel-video",
    platforms: [
      { key: "instagram", name: "Instagram", glowColor: "rgba(228,64,95,0.45)", live: true },
      { key: "tiktok", name: "TikTok", glowColor: "rgba(20,20,20,0.35)", live: false },
      { key: "youtube", name: "YouTube", glowColor: "rgba(255,0,0,0.45)", live: false },
      { key: "pinterest", name: "Pinterest", glowColor: "rgba(230,0,35,0.45)", live: false },
    ] as PlatformItem[],
  },
  {
    id: "metin-topluluk",
    platforms: [
      { key: "linkedin", name: "LinkedIn", glowColor: "rgba(10,102,194,0.45)", live: true },
      { key: "facebook", name: "Facebook", glowColor: "rgba(8,102,255,0.45)", live: true },
      { key: "threads", name: "Threads", glowColor: "rgba(20,20,20,0.35)", live: false },
      { key: "x", name: "X", glowColor: "rgba(20,20,20,0.35)", live: false },
    ] as PlatformItem[],
  },
  {
    id: "e-ticaret",
    platforms: [
      { key: "shopify", name: "Shopify", glowColor: "rgba(149,191,71,0.45)", live: false },
      { key: "google-business", name: "Google Business", glowColor: "rgba(66,133,244,0.45)", live: false },
    ] as PlatformItem[],
  },
  {
    id: "mesajlasma",
    platforms: [
      { key: "whatsapp", name: "WhatsApp Business", glowColor: "rgba(37,211,102,0.45)", live: false },
      { key: "telegram", name: "Telegram", glowColor: "rgba(38,165,228,0.45)", live: false },
      { key: "discord", name: "Discord", glowColor: "rgba(88,101,242,0.45)", live: false },
    ] as PlatformItem[],
  },
];

export default function ConnectStrip() {
  const { t } = useLanguage();
  const [activePlatform, setActivePlatform] = useState<PlatformItem | null>(null);

  const getZoneMeta = (id: string) => {
    return t.connect.zones.find((z) => z.id === id) || { title: id, badge: "" };
  };

  return (
    <section className="relative border-t border-line bg-bg py-12 sm:py-16 overflow-hidden">
      {/* Ambient arka plan ışığı */}
      <div
        className="glow pointer-events-none absolute left-1/2 top-10 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full"
        style={{ background: "var(--spectrum)", opacity: 0.12 }}
        aria-hidden="true"
      />

      {/* Üst Başlık ve Açıklama */}
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-subtle px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-text shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {t.connect.badge}
        </div>

        <h2 className="mt-3.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
          {t.connect.titleBefore}
          <span className="spectrum-text">{t.connect.titleHighlight}</span>
        </h2>

        <p className="mx-auto mt-3 max-w-3xl font-body text-sm leading-relaxed text-muted sm:text-base">
          {t.connect.description}
        </p>
      </div>

      {/* Platform bölgeleri */}
      <div className="relative mt-10 w-full">
        <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-8 sm:gap-x-14 lg:gap-x-16">
          {ZONES_CONFIG.map((zone) => {
            const meta = getZoneMeta(zone.id);
            return (
              <div key={zone.id} className="flex flex-col items-center text-center">
                <div className="mb-3 flex items-center justify-center">
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                    {meta.title}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                  {zone.platforms.map((platform) => {
                    const isHovered = activePlatform?.key === platform.key;
                    return (
                      <div
                        key={platform.key}
                        onMouseEnter={() => setActivePlatform(platform)}
                        onMouseLeave={() => setActivePlatform(null)}
                        className="group relative cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95"
                      >
                        <div
                          className={`relative rounded-2xl transition-all duration-300 ${platform.live ? "spectrum-ring" : ""}`}
                          style={{
                            boxShadow: isHovered
                              ? `0 12px 24px -4px ${platform.glowColor}`
                              : `0 4px 12px -4px ${platform.glowColor}`,
                          }}
                        >
                          <PlatformIcon
                            name={platform.key}
                            className="h-13 w-13 sm:h-14 sm:w-14 lg:h-15 lg:w-15 !rounded-2xl shadow-sm"
                          />
                          {platform.live && (
                            <span
                              className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-surface bg-mint"
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        {/* Hover Tooltip */}
                        <div className="pointer-events-none absolute -top-10 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 font-body text-[11px] font-semibold text-white opacity-0 shadow-xl transition-all duration-150 group-hover:opacity-100">
                          {platform.name}
                          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ink" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative mx-auto mt-8 max-w-6xl px-6">
        {/* İnteraktif Adaptasyon Bilgi Şeridi */}
        <div className="flex min-h-[44px] items-center justify-center rounded-xl border border-line/60 bg-surface px-4 py-2.5 text-center text-xs font-body transition-all duration-200">
          {activePlatform ? (
            <div className="flex flex-wrap items-center justify-center gap-2 text-ink animate-in fade-in duration-200">
              <span className="font-semibold text-accent-text">
                {activePlatform.name} {t.connect.adaptationLabel}
              </span>
              <span className="text-muted">
                {t.connect.platformRoles[activePlatform.key]}
              </span>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              {t.connect.hoverDefault}
            </p>
          )}
        </div>

        {/* Alt Güvenlik & Yetkilendirme Şeridi */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-line/60 pt-5 text-xs font-body text-muted sm:gap-6 text-center">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <svg className="h-4 w-4 text-mint" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            {t.connect.security.oauth}
          </span>
          <span className="hidden text-line sm:inline">•</span>
          <span>{t.connect.security.api}</span>
          <span className="hidden text-line sm:inline">•</span>
          <span>{t.connect.security.format}</span>
        </div>
      </div>
    </section>
  );
}
