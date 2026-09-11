import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#dongu", label: "Nasıl çalışır" },
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#platformlar", label: "Platformlar" },
  { href: "#fiyatlandirma", label: "Fiyatlandırma" },
  { href: "#sss", label: "SSS" },
];

// z-120: must outrank every section's stacking z-index (up to z-110 for the
// overlapping card-stack effect), or a section painted after the header in
// the DOM covers it once scrolled into place and eats every click.
//
// The bar itself is a floating rounded capsule, not an edge-to-edge strip —
// every other surface on the page is a rounded-2xl/rounded-full card, so a
// hard-edged full-width rectangle was the one shape on the site that didn't
// belong. The outer <header> only reserves the sticky top gap; all visible
// chrome (border, blur, shadow) lives on the inner capsule.
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-120 px-4 pt-4 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-line bg-surface/90 px-5 py-2.5 text-ink shadow-[0_8px_30px_-14px_rgba(28,20,48,0.25)] backdrop-blur-md sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative block h-9 w-9 shrink-0 transition-transform duration-200 group-hover:scale-110">
            <Image
              src="/images/tenta-mark.png"
              alt="Tentamark maskotu Tenta"
              fill
              sizes="36px"
              priority
              className="object-contain"
            />
          </span>
          <span className="font-display text-xl font-bold tracking-tight spectrum-text">
            Tentamark
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* One primary action, not four competing pills. "Kayıt ol" and
            "Demo izle" already live on the page itself (hero CTA, product
            showcase) — the header only needs the return-visitor path and
            the single conversion goal the whole page is building toward. */}
        <div className="flex items-center gap-4">
          <Link
            href="/giris"
            className="hidden font-body text-sm text-muted transition-colors hover:text-ink sm:inline-block"
          >
            Giriş yap
          </Link>
          <a
            href="#erken-erisim"
            className="rounded-full bg-accent px-4 py-2 font-body text-sm font-semibold text-surface shadow-[0_8px_20px_-8px_rgb(109_79_235/0.55)] transition-colors hover:bg-accent-hover"
          >
            Erken erişime katıl
          </a>
        </div>
      </div>
    </header>
  );
}
