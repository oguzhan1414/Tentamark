"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { TentamarkIcon } from "@/components/TentamarkLogo";

export default function SiteHeader() {
  const { t } = useLanguage();

  const navLinks = [
    { href: "#dongu", label: t.header.nav.howItWorks },
    { href: "#ozellikler", label: t.header.nav.features },
    { href: "#platformlar", label: t.header.nav.platforms },
    { href: "#fiyatlandirma", label: t.header.nav.pricing },
    { href: "#sss", label: t.header.nav.faq },
  ];

  return (
    <header className="sticky top-0 z-120 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-line bg-surface/90 px-5 py-2.5 text-ink shadow-[0_8px_30px_-14px_rgba(28,20,48,0.25)] backdrop-blur-md sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <TentamarkIcon size={32} variant="coral" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">
            Tenta<span className="text-[#FA5252]">mark</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/giris"
            className="hidden font-body text-sm text-muted transition-colors hover:text-ink sm:inline-block"
          >
            {t.header.login}
          </Link>
          <a
            href="#erken-erisim"
            className="rounded-full bg-accent px-4 py-2 font-body text-sm font-semibold text-surface shadow-[0_8px_20px_-8px_rgb(109_79_235/0.55)] transition-colors hover:bg-accent-hover"
          >
            {t.header.joinEarlyAccess}
          </a>
        </div>
      </div>
    </header>
  );
}
