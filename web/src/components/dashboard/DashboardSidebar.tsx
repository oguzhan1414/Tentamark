"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";

export const NAV = [
  { href: "/dashboard", label: "Ana Sayfa", icon: IconHome },
  { href: "/dashboard/compose", label: "İçerik Oluştur", icon: IconCompose },
  { href: "/dashboard/calendar", label: "Takvim", icon: IconCalendar },
  { href: "/dashboard/posts", label: "Gönderiler", icon: IconList },
  { href: "/dashboard/campaigns", label: "Kampanyalar", icon: IconFlag },
  { href: "/dashboard/brand", label: "Marka Profili", icon: IconBrand },
  { href: "/dashboard/assistant", label: "AI Önerileri", icon: IconSparkle },
  { href: "/dashboard/analytics", label: "Analiz", icon: IconChart },
  { href: "/dashboard/connections", label: "Bağlantılar", icon: IconLink },
  { href: "/settings", label: "Ayarlar", icon: IconSettings },
];

function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6 10v9.5a1 1 0 0 0 1 1h3.5v-6h3v6H17a1 1 0 0 0 1-1V10"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBrand({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.3" strokeWidth="1.6" />
      <path d="M7.2 18c1-2.4 2.9-3.4 4.8-3.4s3.8 1 4.8 3.4" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 14a4 4 0 0 1 0-5.5l2-2a4 4 0 0 1 5.5 5.5l-1 1"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 10a4 4 0 0 1 0 5.5l-2 2a4 4 0 0 1-5.5-5.5l1-1"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 3v18" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M6 4.5c2-1.2 4-1.2 6 0s4 1.2 6 0v8c-2 1.2-4 1.2-6 0s-4-1.2-6 0V4.5Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconCompose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconList({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 6h12M8 12h12M8 18h12" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 19V13M10.5 19V9M17 19V6" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" strokeWidth="1.6" />
      <path
        d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M17.7 17.7l-1.4-1.4M7.7 7.7 6.3 6.3"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardSidebar({ connectedPlatforms }: { connectedPlatforms: PlatformName[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-white px-4 py-5 shadow-[1px_0_10px_rgba(0,0,0,0.02)] lg:flex">
      {/* Brand Logo Header */}
      <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1.5 group">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
          <Image
            src="/tenta-avatar-open.png"
            alt="Tentamark"
            width={26}
            height={26}
            className="object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
            Tentamark
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-indigo-600 font-bold -mt-0.5">
            AI Marketing
          </span>
        </div>
      </Link>

      {/* Navigation List */}
      <nav className="mt-7 flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm font-medium transition-all ${
                active
                  ? "bg-[#6366F1] text-white shadow-sm shadow-indigo-500/25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${active ? "stroke-white text-white" : "stroke-current"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Connected Accounts Card */}
      <div className="mt-auto rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
            Sosyal Hesaplar
          </p>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        {connectedPlatforms.length === 0 ? (
          <Link
            href="/dashboard/connections"
            className="mt-2 block font-body text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            + Hesap Bağla
          </Link>
        ) : (
          <div className="mt-2.5 flex items-center gap-1.5">
            {connectedPlatforms.map((name) => (
              <PlatformIcon key={name} name={name} className="h-6 w-6 rounded-md shadow-xs" />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
