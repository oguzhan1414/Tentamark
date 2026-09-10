import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="relative z-80 -mt-8 sm:-mt-10 rounded-t-[2rem] sm:rounded-t-[2.5rem] bg-[#0a0a0b] text-white/70 shadow-[0_-12px_32px_rgba(0,0,0,0.15)] border-t border-white/[0.08] px-6 py-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 rounded-t-[inherit] bg-gradient-to-b from-white/[0.02] to-transparent" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-base font-semibold text-white">Tentamark</p>
          <p className="font-body text-xs text-white/60">
            Markanız için çalışan AI Marketing Manager.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-white/60 sm:justify-end">
          <Link href="/gizlilik" className="hover:text-white transition">
            Gizlilik Politikası
          </Link>
          <Link href="/kullanim-kosullari" className="hover:text-white transition">
            Kullanım Koşulları
          </Link>
          <a href="mailto:destek@tentamark.com" className="hover:text-white transition">
            destek@tentamark.com
          </a>
        </nav>

        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
          Ürün geliştirme aşamasında · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
