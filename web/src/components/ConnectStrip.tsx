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
  FaShopify,
  FaGoogle,
  FaWhatsapp,
  FaDiscord,
} from "react-icons/fa6";
import { SiWoocommerce, SiZapier } from "react-icons/si";
import { SiCanva } from "@/components/PlatformIcon";
import {
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

type PlatformTile = {
  id: string;
  name: string;
  href: string;
  bgColor: string;
  icon: React.ReactNode;
  format: string;
  isOfficialApi?: boolean;
};

export default function ConnectStrip() {
  const { t } = useLanguage();
  const [hoveredTile, setHoveredTile] = useState<PlatformTile | null>(null);

  // Row 1: Visual & Social Giants (6 items: Facebook, Instagram, YouTube, TikTok, X, Threads)
  const row1: PlatformTile[] = [
    {
      id: "facebook",
      name: "Facebook",
      href: "/platformlar/facebook",
      bgColor: "#0866FF",
      icon: <FaFacebook className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Sayfa & Grup Paylaşımı",
      isOfficialApi: true,
    },
    {
      id: "instagram",
      name: "Instagram",
      href: "/platformlar/instagram",
      bgColor: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      icon: <FaInstagram className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "9'lu Izgara, Reels & Karusel",
      isOfficialApi: true,
    },
    {
      id: "youtube",
      name: "YouTube",
      href: "/platformlar/youtube",
      bgColor: "#FF0000",
      icon: <FaYoutube className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Shorts & Video API",
      isOfficialApi: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      href: "/platformlar/tiktok",
      bgColor: "#111111",
      icon: <FaTiktok className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "9:16 Dikey Trend Video",
      isOfficialApi: true,
    },
    {
      id: "x",
      name: "X (Twitter)",
      href: "/platformlar/x",
      bgColor: "#111111",
      icon: <FaXTwitter className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Hızlı Tweet & Thread",
      isOfficialApi: true,
    },
    {
      id: "threads",
      name: "Threads",
      href: "/platformlar/threads",
      bgColor: "#111111",
      icon: <FaThreads className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Organik Sohbet Akışı",
      isOfficialApi: true,
    },
  ];

  // Row 2: Creative, Commerce & Professional (5 items: Canva, LinkedIn, Pinterest, Shopify, WooCommerce)
  const row2: PlatformTile[] = [
    {
      id: "canva",
      name: "Canva",
      href: "/platformlar/canva",
      bgColor: "linear-gradient(135deg, #00C4CC 0%, #7D2AE8 100%)",
      icon: <SiCanva className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Tasarım & Şablon Senkronu",
      isOfficialApi: true,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      href: "/platformlar/linkedin",
      bgColor: "#0A66C2",
      icon: <FaLinkedin className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "PDF Karusel & B2B Dağıtım",
      isOfficialApi: true,
    },
    {
      id: "pinterest",
      name: "Pinterest",
      href: "/platformlar/pinterest",
      bgColor: "#E60023",
      icon: <FaPinterest className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Görsel Pano & Organik Trafik",
      isOfficialApi: true,
    },
    {
      id: "shopify",
      name: "Shopify",
      href: "/platformlar/shopify",
      bgColor: "#95BF47",
      icon: <FaShopify className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Otomatik Ürün Kataloğu",
      isOfficialApi: true,
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      href: "/platformlar/woocommerce",
      bgColor: "#96588A",
      icon: <SiWoocommerce className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />,
      format: "Ürün Kataloğu & Vitrin",
      isOfficialApi: true,
    },
  ];

  // Row 3: Search, Community & Direct Messaging (6 items: Google Business, WhatsApp, Telegram, Discord, Bluesky, Zapier)
  const row3: PlatformTile[] = [
    {
      id: "google-business",
      name: "Google Business",
      href: "/platformlar/google-business",
      bgColor: "#4285F4",
      icon: <FaGoogle className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Haritalar & Yerel Arama",
      isOfficialApi: true,
    },
    {
      id: "whatsapp",
      name: "WhatsApp",
      href: "/platformlar/whatsapp",
      bgColor: "#25D366",
      icon: <FaWhatsapp className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "VIP Kanal & Şablon Mesaj",
      isOfficialApi: true,
    },
    {
      id: "telegram",
      name: "Telegram",
      href: "/platformlar/telegram",
      bgColor: "#26A5E4",
      icon: <FaTelegram className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Kanal & Bot Duyuruları",
      isOfficialApi: true,
    },
    {
      id: "discord",
      name: "Discord",
      href: "/platformlar/discord",
      bgColor: "#5865F2",
      icon: <FaDiscord className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Topluluk Sunucusu & Bot",
      isOfficialApi: true,
    },
    {
      id: "bluesky",
      name: "Bluesky",
      href: "/platformlar/bluesky",
      bgColor: "#0285FF",
      icon: <FaBluesky className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Açık Ağ & Topluluk Yayını",
      isOfficialApi: true,
    },
    {
      id: "zapier",
      name: "Zapier & API",
      href: "/platformlar",
      bgColor: "#FF4F00",
      icon: <SiZapier className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />,
      format: "Özel Webhook & CRM",
      isOfficialApi: true,
    },
  ];

  const renderGhostTile = (opacityClass: string) => (
    <div
      className={`hidden sm:flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-25 lg:w-25 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl border border-slate-200/60 bg-gradient-to-b from-white/90 to-slate-50/50 shadow-sm pointer-events-none select-none ${opacityClass}`}
      aria-hidden="true"
    />
  );

  const renderActiveTile = (tile: PlatformTile) => {
    const isHovered = hoveredTile?.id === tile.id;

    return (
      <Link
        key={tile.id}
        href={tile.href}
        onMouseEnter={() => setHoveredTile(tile)}
        onMouseLeave={() => setHoveredTile(null)}
        className="group relative flex h-13 w-13 xs:h-14 xs:w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-25 lg:w-25 shrink-0 items-center justify-center rounded-xl xs:rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-white to-slate-50/90 p-1.5 xs:p-2 sm:p-3 shadow-[0_8px_20px_-4px_rgba(28,20,48,0.06),0_2px_6px_rgba(28,20,48,0.03)] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-[#FA5252]/40 hover:shadow-[0_20px_35px_-8px_rgba(28,20,48,0.14),0_4px_12px_rgba(28,20,48,0.04)] active:translate-y-0.5 active:shadow-inner cursor-pointer"
        aria-label={`${tile.name} entegrasyonu`}
      >
        {/* Floating Tooltip Pill on Hover */}
        {isHovered && (
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-line bg-surface/95 px-3.5 py-1 text-xs shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-50 flex items-center gap-1.5 text-ink">
            <span className="font-bold">{tile.name}</span>
            <span className="text-[10px] text-muted">• {tile.format}</span>
            <HiOutlineArrowRight className="h-3 w-3 text-accent" />
          </div>
        )}

        {/* Live Active Pulse Dot */}
        {tile.isOfficialApi && (
          <span
            className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex h-1.5 w-1.5 sm:h-2 sm:w-2 pointer-events-none"
            title={t.connect.officialApiPill}
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 shadow-xs" />
          </span>
        )}

        {/* Brand Icon Tile */}
        <div
          className="flex h-8 w-8 xs:h-9 xs:w-9 sm:h-12 sm:w-12 md:h-13 md:w-13 items-center justify-center rounded-lg xs:rounded-xl sm:rounded-2xl text-white shadow-xs transition-transform duration-200 group-hover:scale-108"
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
    <section className="relative border-t border-line bg-white py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(109,79,235,0.08) 0%, rgba(250,82,82,0.06) 50%, transparent 75%)",
        }}
        aria-hidden="true"
      />

      {/* Header Content */}
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-subtle px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-text shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {t.connect.badge}
        </div>

        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {t.connect.titleBefore}
          <span className="spectrum-text">{t.connect.titleHighlight}</span>
        </h2>

        <p className="mx-auto mt-4 max-w-3xl font-body text-base leading-relaxed text-muted sm:text-lg">
          {t.connect.description}
        </p>
      </div>

      {/* ================= TACTILE FLOATING KEYPAD MATRIX (6 - 5 - 6 STAGGERED) ================= */}
      <div className="relative mx-auto mt-12 sm:mt-14 max-w-6xl px-4 select-none">
        <div className="flex flex-col items-center gap-2.5 sm:gap-3.5 md:gap-4.5 overflow-x-auto no-scrollbar sm:overflow-visible py-2">
          {/* Row 1: 6 Platforms (Facebook, Instagram, YouTube, TikTok, X, Threads) */}
          <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3.5 md:gap-4.5">
            {renderGhostTile("opacity-15")}
            {renderGhostTile("opacity-35")}
            {row1.map(renderActiveTile)}
            {renderGhostTile("opacity-35")}
            {renderGhostTile("opacity-15")}
          </div>

          {/* Row 2: 5 Platforms (Canva, LinkedIn, Pinterest, Shopify, WooCommerce) - Staggered Center */}
          <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3.5 md:gap-4.5">
            {renderGhostTile("opacity-20")}
            {renderGhostTile("opacity-40")}
            {row2.map(renderActiveTile)}
            {renderGhostTile("opacity-40")}
            {renderGhostTile("opacity-20")}
          </div>

          {/* Row 3: 6 Platforms (Google Business, WhatsApp, Telegram, Discord, Bluesky, Zapier) */}
          <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3.5 md:gap-4.5">
            {renderGhostTile("opacity-25")}
            {renderGhostTile("opacity-45")}
            {row3.map(renderActiveTile)}
            {renderGhostTile("opacity-45")}
            {renderGhostTile("opacity-25")}
          </div>
        </div>

        {/* Dynamic Adaptation Details Banner */}
        <div className="mx-auto mt-8 max-w-3xl">
          <div className="flex min-h-[48px] items-center justify-center rounded-2xl border border-line bg-surface/90 px-5 py-2.5 text-center text-xs font-body shadow-xs backdrop-blur-md transition-all duration-200">
            {hoveredTile ? (
              <div className="flex flex-wrap items-center justify-center gap-2 text-ink animate-in fade-in duration-150">
                <span className="font-bold text-accent">
                  {hoveredTile.name} {t.connect.adaptationLabel}
                </span>
                <span className="text-muted">
                  {t.connect.platformRoles[hoveredTile.id as keyof typeof t.connect.platformRoles] || hoveredTile.format}
                </span>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-faint">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                {t.connect.hoverDefault}
              </p>
            )}
          </div>
        </div>

        {/* Security & Capability Strip */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-line/60 pt-5 text-xs font-body text-muted sm:gap-6 text-center">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <HiOutlineCheckCircle className="h-4 w-4 text-emerald-600" />
            {t.connect.security.oauth}
          </span>
          <span className="hidden text-line sm:inline">•</span>
          <span>{t.connect.security.api}</span>
          <span className="hidden text-line sm:inline">•</span>
          <span>{t.connect.security.format}</span>
        </div>

        {/* Explorer Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/platformlar"
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-2.5 text-xs sm:text-sm font-semibold text-ink shadow-xs transition-all hover:border-accent/40 hover:bg-surface-soft hover:shadow-md cursor-pointer"
          >
            <span>{t.connect.viewAllButton}</span>
            <HiOutlineArrowRight className="h-3.5 w-3.5 text-accent transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
