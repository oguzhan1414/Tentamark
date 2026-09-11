import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="relative z-110 -mt-8 sm:-mt-10 rounded-t-[2rem] sm:rounded-t-[2.5rem] bg-surface-strong text-muted shadow-[0_-8px_24px_rgba(28,20,48,0.04)] border-t border-line px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-base font-semibold text-ink">Tentamark</p>
          <p className="font-body text-xs text-muted">
            Markanız için çalışan AI Marketing Manager.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted sm:justify-end">
          <Link href="/gizlilik" className="hover:text-ink transition">
            Gizlilik Politikası
          </Link>
          <Link href="/kullanim-kosullari" className="hover:text-ink transition">
            Kullanım Koşulları
          </Link>
          <a href="mailto:destek@tentamark.com" className="hover:text-ink transition">
            destek@tentamark.com
          </a>
        </nav>

        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-faint">
          Ürün geliştirme aşamasında · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
