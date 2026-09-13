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
    badge: "Hızlı Kıyas",
    description: "Rakip hesapların performans karşılaştırması",
  },
  {
    href: "/dashboard/analytics/score",
    label: "Sosyal Skor & Teşhis",
    icon: HiOutlineSparkles,
    badge: "784/1000",
    description: "Marka sağlık puanı ve AI içgörüleri",
  },
  {
    href: "/dashboard/analytics/reports",
    label: "Raporlama",
    icon: HiOutlineDocumentChartBar,
    badge: "PDF / PPT",
    description: "Müşteri ve yönetici sunum raporları",
  },
] as const;

export default function AnalyticsNav({
  title,
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-4 border-b border-slate-200/80 pb-5">
      {/* Top Title & Action Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <HiOutlineChartBar className="h-4 w-4 stroke-[2]" />
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {title || "Sosyal Medya Performans & Analitik"}
            </h1>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional Right Action Area (e.g. Date Range, Export, New Competitor) */}
        {children && (
          <div className="flex flex-wrap items-center gap-2">
            {children}
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs (Flat White SaaS Style) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ANALYTICS_TABS.map((tab) => {
          const isActive =
            tab.href === "/dashboard/analytics"
              ? pathname === "/dashboard/analytics"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`group inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className={`h-4 w-4 stroke-[1.75] ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"}`} />
              <span>{tab.label}</span>
              {"badge" in tab && tab.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono font-bold leading-none ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
