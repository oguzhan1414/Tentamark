"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineChartBar,
  HiOutlineScale,
  HiOutlineSparkles,
  HiOutlineDocumentChartBar,
} from "react-icons/hi2";

export const ANALYTICS_TABS = [
  {
    href: "/dashboard/analytics",
    label: "Genel Bakış",
    icon: HiOutlineChartBar,
    description: "Kanal büyümesi ve kitle metrikleri",
  },
  {
    href: "/dashboard/analytics/competitors",
    label: "Rakipler",
    icon: HiOutlineScale,
    description: "Rakip hesapların performans karşılaştırması",
  },
  {
    href: "/dashboard/analytics/score",
    label: "Sosyal Skor & Teşhis",
    icon: HiOutlineSparkles,
    description: "Marka sağlık puanı ve AI içgörüleri",
  },
  {
    href: "/dashboard/analytics/reports",
    label: "Raporlama",
    icon: HiOutlineDocumentChartBar,
    description: "Müşteri ve yönetici sunum raporları",
  },
] as const;

// Branches directly off the main sidebar's "Analiz" icon — same white,
// same border-r, no gap and no repeated "Analitik" title (the icon rail
// already labels and highlights it), so this reads as a continuation of
// that one nav item rather than a second, disconnected panel.
export default function AnalyticsNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 h-[calc(100dvh-4rem)] w-56 shrink-0 space-y-0.5 overflow-y-auto border-r border-slate-200/80 bg-white px-3 py-6 print:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ANALYTICS_TABS.map((tab) => {
        const isActive =
          tab.href === "/dashboard/analytics" ? pathname === "/dashboard/analytics" : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col gap-0.5 rounded-xl px-3 py-2.5 transition-colors ${
              isActive ? "bg-slate-100" : "hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Icon className={`h-[18px] w-[18px] stroke-[1.75] ${isActive ? "text-slate-900" : "text-slate-400"}`} />
              <span className={`text-xs ${isActive ? "font-bold text-slate-900" : "font-semibold text-slate-600"}`}>
                {tab.label}
              </span>
            </span>
            <span className="pl-[26px] text-[10.5px] leading-snug text-slate-400">{tab.description}</span>
          </Link>
        );
      })}
    </nav>
  );
}
