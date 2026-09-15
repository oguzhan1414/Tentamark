"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
  FaTiktok,
  FaLinkedin,
  FaPinterest,
  FaThreads,
  FaTelegram,
  FaBluesky,
} from "react-icons/fa6";
import { SiWoocommerce, SiZapier, SiDiscord } from "react-icons/si";
import {
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineBolt,
} from "react-icons/hi2";

type PlatformTile = {
  id: string;
  name: string;
  href: string;
  bgColor: string;
  icon: React.ReactNode;
  format: string;
  badge: string;
  isOfficialApi?: boolean;
};

export default function PlatformsSection() {
  const { t } = useLanguage();
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);

  // Row 1: Facebook, Instagram, YouTube, X, TikTok (5 items)
  const row1: PlatformTile[] = [
    {
      id: "facebook",
      name: "Facebook",
      href: "/platformlar/facebook",
      bgColor: "#0866FF",
      icon: <FaFacebook className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Sayfa & Grup Paylaşımı",
      badge: "Meta Graph API",
      isOfficialApi: true,
    },
    {
      id: "instagram",
      name: "Instagram",
      href: "/platformlar/instagram",
      bgColor: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      icon: <FaInstagram className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "9'lu Izgara, Reels & Karusel",
      badge: "Resmi Graph API",
      isOfficialApi: true,
    },
    {
      id: "youtube",
      name: "YouTube",
      href: "/platformlar/youtube",
      bgColor: "#FF0000",
      icon: <FaYoutube className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Shorts & Video API",
      badge: "Data API v3",
      isOfficialApi: true,
    },
    {
      id: "x",
      name: "X (Twitter)",
      href: "/platformlar/x",
      bgColor: "#111111",
      icon: <FaXTwitter className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Hızlı Tweet & Thread",
      badge: "Official X API",
      isOfficialApi: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      href: "/platformlar/tiktok",
      bgColor: "#111111",
      icon: <FaTiktok className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "9:16 Dikey Trend Video",
      badge: "Direct Post API",
      isOfficialApi: true,
    },
  ];

  // Row 2: LinkedIn, Pinterest, WooCommerce, Threads (4 items)
  const row2: PlatformTile[] = [
    {
      id: "linkedin",
      name: "LinkedIn",
      href: "/platformlar/linkedin",
      bgColor: "#0A66C2",
      icon: <FaLinkedin className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "PDF Karusel & B2B Dağıtım",
      badge: "Community API",
      isOfficialApi: true,
    },
    {
      id: "pinterest",
      name: "Pinterest",
      href: "/platformlar/pinterest",
      bgColor: "#E60023",
      icon: <FaPinterest className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Görsel Pano & Organik Trafik",
      badge: "Board Sync",
      isOfficialApi: true,
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      href: "/platformlar/woocommerce",
      bgColor: "#96588A",
      icon: <SiWoocommerce className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />,
      format: "Ürün Kataloğu & Otomatik Vitrin",
      badge: "REST API v3",
      isOfficialApi: true,
    },
    {
      id: "threads",
      name: "Threads",
      href: "/platformlar/threads",
      bgColor: "#111111",
      icon: <FaThreads className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Organik Sohbet Akışı",
      badge: "Meta Threads API",
      isOfficialApi: true,
    },
  ];

  // Row 3: Telegram, Bluesky, Zapier & API (3 items)
  const row3: PlatformTile[] = [
    {
      id: "telegram",
      name: "Telegram",
      href: "/platformlar/telegram",
      bgColor: "#26A5E4",
      icon: <FaTelegram className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Kanal & Bot Duyuruları",
      badge: "Bot API",
      isOfficialApi: true,
    },
    {
      id: "bluesky",
      name: "Bluesky",
      href: "/platformlar/bluesky",
      bgColor: "#0285FF",
      icon: <FaBluesky className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Açık Ağ & Topluluk Yayını",
      badge: "AT Protocol",
      isOfficialApi: true,
    },
    {
      id: "zapier",
      name: "Zapier & API",
      href: "/platformlar",
      bgColor: "#FF4F00",
      icon: <SiZapier className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Özel Webhook & CRM Entegrasyonu",
      badge: "REST Webhook",
      isOfficialApi: true,
    },
  ];

  const renderGhostTile = (opacityClass: string) => (
    <div
      className={`hidden sm:flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-26 lg:w-26 items-center justify-center rounded-2xl sm:rounded-3xl border border-slate-200/60 bg-gradient-to-b from-white/90 to-slate-50/50 shadow-sm pointer-events-none select-none ${opacityClass}`}
      aria-hidden="true"
    />
  );

  const renderActiveTile = (tile: PlatformTile) => {
    const isHovered = hoveredTile === tile.id;

    return (
      <Link
        key={tile.id}
        href={tile.href}
        onMouseEnter={() => setHoveredTile(tile.id)}
        onMouseLeave={() => setHoveredTile(null)}
        className="group relative flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-26 lg:w-26 items-center justify-center rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-white to-slate-50/90 p-2 sm:p-3 shadow-[0_10px_25px_-5px_rgba(28,20,48,0.06),0_2px_6px_rgba(28,20,48,0.03)] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-accent/40 hover:shadow-[0_20px_35px_-8px_rgba(28,20,48,0.14),0_4px_12px_rgba(28,20,48,0.04)] active:translate-y-0.5 active:shadow-inner cursor-pointer"
        aria-label={`${tile.name} entegrasyonu`}
      >
        {/* Floating Tooltip Pill on Hover */}
        {isHovered && (
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-surface/95 px-3 py-1 text-xs shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-30 flex items-center gap-1.5 text-ink">
            <span className="font-bold">{tile.name}</span>
            <span className="text-[10px] text-muted">• {tile.format}</span>
            <HiOutlineArrowRight className="h-3 w-3 text-accent" />
          </div>
        )}

        {/* Live Active Pulse Dot */}
        {tile.isOfficialApi && (
          <span
            className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex h-2 w-2 pointer-events-none"
            title="Resmi API Yayında"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-xs" />
          </span>
        )}

        {/* Brand Icon Tile */}
        <div
          className="flex h-10 w-10 sm:h-12 sm:w-12 md:h-13 md:w-13 items-center justify-center rounded-xl sm:rounded-2xl text-white shadow-xs transition-transform duration-200 group-hover:scale-108"
          style={{
            background: tile.bgColor,
          }}
        >
          {tile.icon}
        </div>
      </Link>
    );
  };

  return (
    <section
      id="platformlar"
      className="relative z-30 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-surface text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.04)] border-t border-line px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-hidden"
    >
      {/* Top subtle surface highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent"
        aria-hidden="true"
      />

      {/* Subtle colorful ambient radial light */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_50%_at_50%_45%,rgba(109,79,235,0.07),rgba(250,82,82,0.05),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl">
        {/* Header Content */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-soft px-3.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent-text shadow-xs">
            <HiOutlineSparkles className="h-3.5 w-3.5 text-accent" />
            {t.platforms.eyebrow}
          </span>

          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {t.platforms.titleBefore}
            <span className="spectrum-text">{t.platforms.titleHighlight}</span>
          </h2>

          <p className="mt-4 font-body text-base leading-relaxed text-muted sm:text-lg">
            {t.platforms.copy}
          </p>
        </div>

        {/* ================= TACTILE FLOATING KEYPAD MATRIX ================= */}
        <div className="mt-14 sm:mt-16 flex flex-col items-center gap-3 sm:gap-4 md:gap-5 select-none">
          {/* Row 1: (ghosts) + Facebook, Instagram, YouTube, X, TikTok + (ghosts) */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 md:gap-4.5">
            {renderGhostTile("opacity-15")}
            {renderGhostTile("opacity-35")}
            {row1.map(renderActiveTile)}
            {renderGhostTile("opacity-35")}
            {renderGhostTile("opacity-15")}
          </div>

          {/* Row 2: (ghosts) + LinkedIn, Pinterest, WooCommerce, Threads + (ghosts) */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 md:gap-4.5">
            {renderGhostTile("opacity-20")}
            {renderGhostTile("opacity-40")}
            {row2.map(renderActiveTile)}
            {renderGhostTile("opacity-40")}
            {renderGhostTile("opacity-20")}
          </div>

          {/* Row 3: (ghosts) + Telegram, Bluesky, Zapier & API + (ghosts) */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 md:gap-4.5">
            {renderGhostTile("opacity-25")}
            {renderGhostTile("opacity-45")}
            {row3.map(renderActiveTile)}
            {renderGhostTile("opacity-45")}
            {renderGhostTile("opacity-25")}
          </div>
        </div>

        {/* Interactive Click Hint */}
        <p className="mt-8 text-center text-xs font-medium text-muted flex items-center justify-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.platforms.clickHint}</span>
        </p>

        {/* Feature Pills Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 shadow-xs">
            <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-ink">Resmi Meta Graph, Cloud & Data API</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 shadow-xs">
            <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-ink">Telefonsuz Doğrudan Otonom Yayın</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 shadow-xs">
            <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="font-medium text-ink">11+ Platforma Özel Format Dönüşümü</span>
          </div>
        </div>

        {/* Bottom CTA to /platformlar */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/platformlar"
            className="group inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-3.5 font-body text-sm sm:text-base font-bold text-white shadow-[0_10px_24px_-10px_rgb(109_79_235/0.6)] transition-all hover:bg-accent-hover hover:shadow-xl hover:scale-102 cursor-pointer"
          >
            <span>{t.platforms.ctaExplore}</span>
            <HiOutlineArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
