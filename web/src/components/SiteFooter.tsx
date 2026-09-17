"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { TentamarkIcon } from "@/components/TentamarkLogo";

export default function SiteFooter() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <footer className="relative z-110 -mt-8 sm:-mt-10 rounded-t-[2rem] sm:rounded-t-[2.5rem] bg-surface-strong text-muted shadow-[0_-8px_24px_rgba(28,20,48,0.04)] border-t border-line px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <TentamarkIcon size={28} variant="coral" />
          <div>
            <p className="font-display text-base font-semibold text-ink">
              Tenta<span className="text-[#FA5252]">mark</span>
            </p>
            <p className="font-body text-xs text-muted">
              {t.footer.tagline}
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted sm:justify-end">
          <Link href="/nasil-calisir" className="hover:text-ink transition">
            Nasıl Çalışır?
          </Link>
          <Link href="/platformlar" className="hover:text-ink transition">
            Platformlar
          </Link>
          <Link href="/fiyatlandirma" className="hover:text-ink transition">
            Fiyatlandırma
          </Link>
          <Link href="/gizlilik" className="hover:text-ink transition">
            {t.footer.privacy}
          </Link>
          <Link href="/kullanim-kosullari" className="hover:text-ink transition">
            {t.footer.terms}
          </Link>
          <a href="mailto:destek@tentamark.com" className="hover:text-ink transition">
            destek@tentamark.com
          </a>
        </nav>

        {/* Dil Değiştirici Buton (TR / EN) */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5">
          <div
            role="group"
            aria-label={t.footer.languageToggleLabel}
            className="inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-xs backdrop-blur"
          >
            <span className="flex h-6 w-6 items-center justify-center pl-1 text-muted" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
            </span>

            <button
              type="button"
              id="lang-btn-tr"
              onClick={() => setLocale("tr")}
              className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
                locale === "tr"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              aria-pressed={locale === "tr"}
              title="Türkçe"
            >
              TR
            </button>

            <span className="text-line text-[10px]" aria-hidden="true">/</span>

            <button
              type="button"
              id="lang-btn-en"
              onClick={() => setLocale("en")}
              className={`rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold transition-all ${
                locale === "en"
                  ? "bg-accent text-white shadow-xs"
                  : "text-muted hover:text-ink"
              }`}
              aria-pressed={locale === "en"}
              title="English"
            >
              EN
            </button>
          </div>

          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
            {t.footer.status} · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
