"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import TentamarkLogo from "@/components/TentamarkLogo";
import {
  HiOutlineChevronDown,
  HiOutlineSparkles,
  HiOutlineFingerPrint,
  HiOutlinePencilSquare,
  HiOutlineCalendarDays,
  HiOutlineMegaphone,
  HiOutlineChartBar,
  HiOutlineInbox,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineArrowRight,
} from "react-icons/hi2";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";

const PRODUCT_CONFIG = [
  { icon: HiOutlineSparkles, href: "/#demo" },
  { icon: HiOutlineFingerPrint, href: "/#demo" },
  { icon: HiOutlinePencilSquare, href: "/#demo" },
  { icon: HiOutlineCalendarDays, href: "/nasil-calisir" },
  { icon: HiOutlineMegaphone, href: "/nasil-calisir" },
  { icon: HiOutlineChartBar, href: "/nasil-calisir" },
];

const PLATFORMS_MENU: { name: PlatformName; label: string; active: boolean }[] = [
  { name: "instagram", label: "Instagram", active: true },
  { name: "linkedin", label: "LinkedIn", active: true },
  { name: "tiktok", label: "TikTok", active: true },
  { name: "shopify", label: "Shopify", active: true },
  { name: "woocommerce", label: "WooCommerce", active: true },
  { name: "google-business", label: "Google Business", active: true },
  { name: "whatsapp", label: "WhatsApp", active: true },
  { name: "canva", label: "Canva", active: true },
  { name: "youtube", label: "YouTube", active: true },
  { name: "facebook", label: "Facebook", active: true },
  { name: "telegram", label: "Telegram", active: true },
  { name: "discord", label: "Discord", active: true },
  { name: "x", label: "X (Twitter)", active: true },
];

export default function SiteHeader() {
  const { locale, setLocale, t } = useLanguage();
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [platformsMenuOpen, setPlatformsMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const productRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setProductMenuOpen(false);
      }
      if (platformRef.current && !platformRef.current.contains(e.target as Node)) {
        setPlatformsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-120 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-slate-200/90 bg-white/95 px-5 py-2.5 text-slate-900 shadow-[0_8px_30px_-14px_rgba(15,23,42,0.12)] backdrop-blur-md sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <TentamarkLogo size={32} withWordmark />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {/* Ürün Dropdown */}
          <div className="relative" ref={productRef}>
            <button
              type="button"
              onClick={() => {
                setProductMenuOpen((prev) => !prev);
                setPlatformsMenuOpen(false);
              }}
              onMouseEnter={() => setProductMenuOpen(true)}
              className={`flex items-center gap-1.5 font-body text-sm font-medium transition-colors cursor-pointer ${
                productMenuOpen ? "text-[#FA5252]" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{t.header.product}</span>
              <HiOutlineChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  productMenuOpen ? "rotate-180 text-[#FA5252]" : "text-slate-400"
                }`}
              />
            </button>

            {/* Product Megamenu Popover */}
            {productMenuOpen && (
              <div
                onMouseLeave={() => setProductMenuOpen(false)}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[560px] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl shadow-slate-950/15 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-50"
              >
                <div className="grid grid-cols-2 gap-2">
                  {t.header.productItems.map((item, idx) => {
                    const cfg = PRODUCT_CONFIG[idx] || PRODUCT_CONFIG[0];
                    const Icon = cfg.icon;
                    return (
                      <Link
                        key={idx}
                        href={cfg.href}
                        onClick={() => setProductMenuOpen(false)}
                        className="group flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-slate-50 hover:border-slate-200"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition group-hover:bg-rose-50 group-hover:text-[#FA5252]">
                          <Icon className="h-4.5 w-4.5 stroke-[1.75]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-[#FA5252] transition-colors">
                              {item.title}
                            </span>
                            {item.tag && (
                              <span className="rounded bg-rose-50 border border-rose-200/60 px-1.5 py-0.2 text-[9px] font-bold text-rose-700">
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-slate-500 leading-snug line-clamp-2">
                            {item.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Bottom explorer strip */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between px-2 text-xs">
                  <span className="text-slate-500 text-[11px]">{t.header.productBottom.text}</span>
                  <Link
                    href="/nasil-calisir"
                    onClick={() => setProductMenuOpen(false)}
                    className="flex items-center gap-1 font-bold text-[#FA5252] hover:text-[#E03131]"
                  >
                    <span>{t.header.productBottom.cta}</span>
                    <HiOutlineArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Nasıl Çalışır Link */}
          <Link
            href="/nasil-calisir"
            className="font-body text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            {t.header.howItWorks}
          </Link>

          {/* Platformlar Dropdown */}
          <div className="relative" ref={platformRef}>
            <button
              type="button"
              onClick={() => {
                setPlatformsMenuOpen((prev) => !prev);
                setProductMenuOpen(false);
              }}
              onMouseEnter={() => setPlatformsMenuOpen(true)}
              className={`flex items-center gap-1.5 font-body text-sm font-medium transition-colors cursor-pointer ${
                platformsMenuOpen ? "text-[#FA5252]" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{t.header.platforms}</span>
              <HiOutlineChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  platformsMenuOpen ? "rotate-180 text-[#FA5252]" : "text-slate-400"
                }`}
              />
            </button>

            {/* Platforms Menu Popover */}
            {platformsMenuOpen && (
              <div
                onMouseLeave={() => setPlatformsMenuOpen(false)}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xl shadow-slate-950/15 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 z-50"
              >
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t.header.platformsMenu.channelSupport}
                  </div>
                  {PLATFORMS_MENU.map((plt) => (
                    <Link
                      key={plt.name}
                      href={`/platformlar/${plt.name}`}
                      onClick={() => setPlatformsMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <PlatformIcon name={plt.name} className="h-4 w-4" />
                        <span className="text-xs font-semibold text-slate-800">{plt.label}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          plt.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : "bg-amber-50 text-amber-700 border border-amber-200/60"
                        }`}
                      >
                        {plt.active ? t.header.platformsMenu.activeBadge : t.header.platformsMenu.soonBadge}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100">
                  <Link
                    href="/platformlar"
                    onClick={() => setPlatformsMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition text-center w-full"
                  >
                    <span>{t.header.platformsMenu.compareAll}</span>
                    <HiOutlineArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Neden Biz Link */}
          <Link
            href="/neden-tentamark"
            className="font-body text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            {t.header.whyUs}
          </Link>

          {/* Blog Link */}
          <Link
            href="/blog"
            className="font-body text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            {t.header.blog}
          </Link>

          {/* Fiyatlandırma Link */}
          <Link
            href="/fiyatlandirma"
            className="font-body text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            {t.header.pricing}
          </Link>
        </nav>

        {/* CTA, Language Toggle & Auth Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Header Compact Language Switcher */}
          <div
            role="group"
            aria-label={t.footer.languageToggleLabel}
            className="flex items-center rounded-full border border-slate-200/90 bg-slate-50/90 p-0.5 text-[11px] font-semibold font-mono shadow-2xs"
          >
            <button
              type="button"
              id="header-lang-tr"
              onClick={() => setLocale("tr")}
              className={`rounded-full px-2 py-0.5 transition-all cursor-pointer ${
                locale === "tr"
                  ? "bg-[#FA5252] text-white shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              aria-pressed={locale === "tr"}
              title="Türkçe"
            >
              TR
            </button>
            <span className="text-slate-300 text-[10px] px-0.5 select-none">/</span>
            <button
              type="button"
              id="header-lang-en"
              onClick={() => setLocale("en")}
              className={`rounded-full px-2 py-0.5 transition-all cursor-pointer ${
                locale === "en"
                  ? "bg-[#FA5252] text-white shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              aria-pressed={locale === "en"}
              title="English"
            >
              EN
            </button>
          </div>

          <Link
            href="/giris"
            className="hidden font-body text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900 sm:inline-block"
          >
            {t.header.login}
          </Link>
          <Link
            href="/kayit"
            className="rounded-full bg-[#FA5252] px-3.5 py-1.5 sm:px-4 sm:py-2 font-body text-xs sm:text-sm font-bold text-white shadow-sm shadow-[#FA5252]/30 transition hover:bg-[#E03131]"
          >
            {t.header.startFree}
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={t.header.mobileMenu}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden cursor-pointer"
          >
            {mobileMenuOpen ? <HiOutlineXMark className="h-5 w-5" /> : <HiOutlineBars3 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mt-2 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xl md:hidden space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <Link
              href="/nasil-calisir"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <span>{t.header.mobileDrawer.tour}</span>
              <span>→</span>
            </Link>
            <Link
              href="/platformlar"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <span>{t.header.mobileDrawer.platforms}</span>
              <span>→</span>
            </Link>
            <Link
              href="/neden-tentamark"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <span>{t.header.mobileDrawer.whyUs}</span>
              <span>→</span>
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <span>{t.header.mobileDrawer.blog}</span>
              <span>→</span>
            </Link>
            <Link
              href="/fiyatlandirma"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl p-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
            >
              <span>{t.header.mobileDrawer.pricing}</span>
              <span>→</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 flex gap-2">
            <Link
              href="/giris"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t.header.login}
            </Link>
            <Link
              href="/kayit"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 rounded-xl bg-[#FA5252] py-2.5 text-center text-xs font-bold text-white hover:bg-[#E03131]"
            >
              {t.header.startFree}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
