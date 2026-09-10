import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#dongu", label: "Nasıl çalışır" },
  { href: "#ozellikler", label: "Özellikler" },
  { href: "#platformlar", label: "Platformlar" },
  { href: "#fiyatlandirma", label: "Fiyatlandırma" },
];

// z-100: must outrank every section's stacking z-index (up to z-80 for the
// overlapping card-stack effect), or a section painted after the header in
// the DOM covers it once scrolled into place and eats every click.
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-100 border-b border-white/10 bg-[#0a0a0b]/85 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative block h-10 w-10 shrink-0 transition-transform duration-200 group-hover:scale-110">
            <Image
              src="/images/tenta-mark.png"
              alt="Tentamark maskotu Tenta"
              fill
              sizes="40px"
              priority
              className="object-contain"
            />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-white">
            Tentamark
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/giris"
            className="font-body text-sm text-white/70 transition-colors hover:text-white"
          >
            Giriş yap
          </Link>
          <Link
            href="/kayit"
            className="rounded-full border border-white/20 px-4 py-2 font-body text-sm font-semibold text-white transition-colors hover:border-white/40"
          >
            Kayıt ol
          </Link>
          <a
            href="#erken-erisim"
            className="hidden rounded-full bg-white px-4 py-2 font-body text-sm font-semibold text-[#0a0a0b] transition-colors hover:bg-white/90 sm:inline-block"
          >
            Erken erişime katıl
          </a>
        </div>
      </div>
    </header>
  );
}
