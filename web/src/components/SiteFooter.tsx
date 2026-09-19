"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { TentamarkIcon } from "@/components/TentamarkLogo";
import { FaBluesky, FaThreads, FaXTwitter } from "react-icons/fa6";

export default function SiteFooter() {
  const { locale, setLocale, t } = useLanguage();
  const footerData = t.footer;

  return (
    <footer
      id="site-footer"
      className="relative z-20 overflow-hidden bg-white pb-10 pt-8 text-slate-800 transition-colors duration-300 sm:pt-10"
    >
      {/* =========================================================================
          HIGH-RESOLUTION 3D BRAND SCULPTURE BACKGROUND (Custom footer.png)
          Features Tentamark Coral & Navy Biomorphic 3D Ribbons in White Daylight
          ========================================================================= */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        {/* Render the user's bespoke 16:9 8K 3D visual */}
        <img
          src="/images/footer.png"
          alt="Tentamark Footer Backdrop"
          className="h-full w-full object-cover object-bottom opacity-95 [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.18)_10%,black_34%)] transition-opacity duration-700"
        />

        {/* Delicate white atmospheric overlay so text is 100% crisp while keeping 3D waves luminous */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white/20" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        {/* =========================================================================
            TIER 1: PUBLER-INSPIRED TOP BRAND & COLORFUL SOCIAL BAR
            ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-slate-200/80">
          {/* Left: Brand Identity + Tagline */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-2 shadow-sm backdrop-blur-md transition-all duration-200 group-hover:border-[#FA5252]/40 group-hover:shadow-md group-hover:scale-105">
                <TentamarkIcon size={30} variant="coral" />
              </div>
              <div>
                <span className="font-display text-2xl font-bold tracking-tight text-slate-900 group-hover:text-[#FA5252] transition-colors">
                  Tentamark
                </span>
              </div>
            </Link>

            <div className="hidden sm:block h-6 w-px bg-slate-300/80" aria-hidden="true" />

            <p className="font-body text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed font-medium">
              {footerData.tagline}
            </p>
          </div>

          {/* Right: Authentic Colorful Social Media Icons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Instagram (Vibrant Gradient) */}
            <a
              href="https://www.instagram.com/tentamark.ai/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (@tentamark.ai)"
              title="Instagram (@tentamark.ai)"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(220,39,67,0.4)]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* TikTok (Cyan & Red Neon) */}
            <a
              href="https://www.tiktok.com/@tentamark"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok (@tentamark)"
              title="TikTok (@tentamark)"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-[#010101] border border-slate-300/50 text-white shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:border-[#00f2fe] hover:shadow-[0_4px_16px_rgba(0,242,254,0.35)]"
            >
              <svg className="h-4 w-4 fill-white group-hover:fill-[#00f2fe] transition-colors" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01v8.42c0 1.94-.48 3.93-1.64 5.48-1.47 1.98-3.94 3.04-6.4 2.87-2.47-.17-4.73-1.64-5.88-3.83-1.15-2.19-1.07-4.94.22-7.05 1.28-2.11 3.65-3.37 6.11-3.23.23.01.46.04.68.08v4.18c-.28-.06-.57-.1-.86-.1-1.34-.01-2.65.68-3.32 1.84-.67 1.16-.54 2.65.34 3.68.88 1.03 2.37 1.43 3.65 1 .95-.32 1.65-1.14 1.83-2.13.06-.32.09-.64.09-.97V.02z" />
              </svg>
            </a>

            {/* Threads (Official FaThreads) */}
            <a
              href="https://www.threads.net/@tentamark.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Threads (@tentamark.ai)"
              title="Threads (@tentamark.ai)"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-900 shadow-xs transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:bg-slate-100 hover:border-slate-500 hover:text-black hover:shadow-md"
            >
              <FaThreads className="h-4 w-4 transition-transform group-hover:scale-110" />
            </a>

            {/* Bluesky (Official Bluesky Blue) */}
            <a
              href="https://bsky.app/profile/tentamark.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bluesky (@tentamark.bsky.social)"
              title="Bluesky (@tentamark.bsky.social)"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-[#0285FF] text-white shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:bg-[#0070d8] hover:shadow-[0_4px_16px_rgba(2,133,255,0.4)]"
            >
              <FaBluesky className="h-4 w-4 transition-transform group-hover:scale-110" />
            </a>

            {/* Facebook (Official Blue) */}
            <a
              href="https://www.facebook.com/tentamark/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook (Tentamark)"
              title="Facebook (Tentamark)"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:bg-[#0d65d9] hover:shadow-[0_4px_16px_rgba(24,119,242,0.4)]"
            >
              <svg className="h-4 w-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* X / Twitter (Official FaXTwitter) */}
            <a
              href="https://x.com/Tentamark"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (@Tentamark)"
              title="X (@Tentamark)"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-900 shadow-xs transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:bg-slate-100 hover:border-slate-500 hover:text-black hover:shadow-md"
            >
              <FaXTwitter className="h-4 w-4 transition-transform group-hover:scale-110" />
            </a>

            {/* Pinterest (Official Crimson) */}
            <a
              href="https://www.pinterest.com/tentamark/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest (@tentamark)"
              title="Pinterest (@tentamark)"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-[#E60023] text-white shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:bg-[#b8001c] hover:shadow-[0_4px_16px_rgba(230,0,35,0.4)]"
            >
              <svg className="h-4 w-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.62-5.373-11.987-12-11.987z" />
              </svg>
            </a>

            {/* YouTube (Official Red) */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              title="YouTube"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF0000] text-white shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:bg-[#cc0000] hover:shadow-[0_4px_16px_rgba(255,0,0,0.4)]"
            >
              <svg className="h-4 w-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* LinkedIn (Official Blue) */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A66C2] text-white shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:bg-[#004182] hover:shadow-[0_4px_16px_rgba(10,102,194,0.4)]"
            >
              <svg className="h-4 w-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.88 0-1.6.72-1.6 1.6s.72 1.6 1.6 1.6 1.6-.72 1.6-1.6-.72-1.6-1.6-1.6z" />
              </svg>
            </a>

            {/* Telegram (Official Sky Blue) */}
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              title="Telegram"
              className="group flex h-9 w-9 items-center justify-center rounded-xl bg-[#24A1DE] text-white shadow-sm transition-all duration-200 hover:scale-110 hover:-translate-y-0.5 hover:bg-[#1d82b3] hover:shadow-[0_4px_16px_rgba(36,161,222,0.4)]"
            >
              <svg className="h-4 w-4 fill-currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </a>
          </div>
        </div>

        {/* =========================================================================
            MAIN NAVIGATION (4 COLUMNS) & BRAND STATUS
            Encased in a subtle frosted glass card for crystal-clear readability
            while letting the 3D ribbon flow gracefully around and behind it
            ========================================================================= */}
        <div className="rounded-3xl border border-white/80 bg-white/70 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Brand Info & Live System Status (4 Cols on LG) */}
            <div className="lg:col-span-4">
              <p className="text-sm leading-relaxed text-slate-600 max-w-sm font-normal">
                {footerData.description}
              </p>
            </div>

          {/* 4 Column Grid (8 Cols on LG: 2 cols on mobile, 4 on sm/lg) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: Ürün & Motor */}
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                {footerData.columns.product.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {footerData.columns.product.items.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className={`group inline-flex items-center gap-1.5 text-xs sm:text-[13px] transition ${
                        item.isCta
                          ? "font-semibold text-[#FA5252] hover:text-[#e03131]"
                          : "text-slate-600 hover:text-slate-950 font-medium"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded bg-slate-100 border border-slate-200/90 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-700">
                          {item.badge}
                        </span>
                      )}
                      {item.isCta && (
                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Platformlar */}
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                {footerData.columns.platforms.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {footerData.columns.platforms.items.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      href={item.href}
                      className={`group inline-flex items-center gap-1.5 text-xs sm:text-[13px] transition ${
                        item.isCta
                          ? "font-semibold text-[#FA5252] hover:text-[#e03131]"
                          : "text-slate-600 hover:text-slate-950 font-medium"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.isCta && (
                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Kaynaklar & Rehber */}
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                {footerData.columns.resources.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {footerData.columns.resources.items.map((item, idx) => (
                  <li key={idx}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-xs sm:text-[13px] text-slate-600 hover:text-slate-950 font-medium transition block"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] text-slate-500 font-medium">
                        {item.label}
                        {item.badge && (
                          <span className="rounded bg-slate-100 border border-slate-200/90 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-600">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Kurumsal & Güvenlik */}
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                {footerData.columns.company.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {footerData.columns.company.items.map((item, idx) => (
                  <li key={idx}>
                    {item.href.startsWith("mailto:") ? (
                      <a
                        href={item.href}
                        className="text-xs sm:text-[13px] text-slate-600 hover:text-slate-950 font-medium transition block"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-xs sm:text-[13px] text-slate-600 hover:text-slate-950 font-medium transition block"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

        {/* =========================================================================
            TIER 5: BOTTOM METADATA & DUAL LANGUAGE SWITCHER
            ========================================================================= */}
        <div className="border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="font-medium">{footerData.copyright}</p>

          <div className="flex items-center gap-5">
            <Link href="/gizlilik" className="hover:text-slate-900 transition">
              {footerData.privacy}
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/kullanim-kosullari" className="hover:text-slate-900 transition">
              {footerData.terms}
            </Link>
            <span className="text-slate-300">·</span>

            {/* Language Switcher Pill */}
            <div
              role="group"
              aria-label={footerData.languageToggleLabel}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-xs backdrop-blur-md"
            >
              <span className="flex h-5 w-5 items-center justify-center pl-1 text-slate-400" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </span>

              <button
                type="button"
                id="footer-lang-btn-tr"
                onClick={() => setLocale("tr")}
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold transition-all ${
                  locale === "tr"
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-pressed={locale === "tr"}
                title="Türkçe"
              >
                TR
              </button>

              <span className="text-slate-300 text-[9px]" aria-hidden="true">/</span>

              <button
                type="button"
                id="footer-lang-btn-en"
                onClick={() => setLocale("en")}
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold transition-all ${
                  locale === "en"
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                aria-pressed={locale === "en"}
                title="English"
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
