"use client";

import type { IconType } from "react-icons";

export default function AnalyticsPageHeader({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: IconType;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/80 pb-5 md:flex-row md:items-center md:justify-between print:hidden">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
            <Icon className="h-4 w-4 stroke-[2]" />
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        </div>
        {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>}
      </div>

      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
