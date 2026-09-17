"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineChartBar,
  HiOutlineScale,
  HiOutlineSparkles,
  HiOutlineDocumentChartBar,
} from "react-icons/hi2";
import { useLanguage } from "@/context/LanguageContext";

export default function AnalyticsNav() {
  const pathname = usePathname();
  const { locale, t } = useLanguage();
  const an = t.dashboard.analytics;

  const tabs = [
    {
      href: "/dashboard/analytics",
      label: an.overviewTab,
      icon: HiOutlineChartBar,
      description: locale === "en" ? "Channel growth and audience metrics" : "Kanal büyümesi ve kitle metrikleri",
    },
    {
      href: "/dashboard/analytics/competitors",
      label: an.competitorsTab,
      icon: HiOutlineScale,
      description: locale === "en" ? "Competitor performance benchmark" : "Rakip hesapların performans karşılaştırması",
    },
    {
      href: "/dashboard/analytics/score",
      label: an.scoreTab,
      icon: HiOutlineSparkles,
      description: locale === "en" ? "Brand health score & AI insights" : "Marka sağlık puanı ve AI içgörüleri",
    },
    {
      href: "/dashboard/analytics/reports",
      label: an.reportsTab,
      icon: HiOutlineDocumentChartBar,
      description: locale === "en" ? "Client & executive presentation reports" : "Müşteri ve yönetici sunum raporları",
    },
  ];

  return (
    <nav className="sticky top-0 h-[calc(100dvh-4rem)] w-56 shrink-0 space-y-0.5 overflow-y-auto border-r border-slate-200/80 bg-white px-3 py-6 print:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
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
