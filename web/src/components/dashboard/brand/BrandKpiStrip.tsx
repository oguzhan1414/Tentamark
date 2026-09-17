"use client";

import type { BrandIntelligenceSummary } from "@/lib/ai/getBrandIntelligenceSummary";
import {
  HiOutlineChartPie,
  HiOutlineBolt,
  HiOutlineUsers,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  summary: BrandIntelligenceSummary;
};

export default function BrandKpiStrip({ summary }: Props) {
  const { t } = useLanguage();
  const kpi = t.dashboard.brand.kpi;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {/* KPI 1: Profile Completeness */}
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {kpi.profileCompleteness}
          </span>
          <HiOutlineChartPie className="h-4 w-4 stroke-[1.75] text-slate-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-xl font-bold text-slate-900">
            %{summary.profileCompletenessPct}
          </span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#FA5252] transition-all duration-500"
            style={{ width: `${Math.min(100, summary.profileCompletenessPct)}%` }}
          />
        </div>
        {summary.profileCompletenessMissing.length > 0 && (
          <p className="mt-1.5 truncate text-[10px] font-medium text-slate-400" title={summary.profileCompletenessMissing.join(", ")}>
            {kpi.missingPrefix} {summary.profileCompletenessMissing.join(", ")}
          </p>
        )}
      </div>

      {/* KPI 2: Strategy Adherence */}
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {kpi.strategyAdherence}
          </span>
          <HiOutlineBolt className="h-4 w-4 stroke-[1.75] text-slate-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-xl font-bold text-slate-900">
            {summary.strategyAdherencePct !== null ? `%${summary.strategyAdherencePct}` : "—"}
          </span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          {summary.strategyAdherencePct !== null && (
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, summary.strategyAdherencePct)}%` }}
            />
          )}
        </div>
      </div>

      {/* KPI 3: Competitors Tracked */}
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {kpi.competitorsTracked}
          </span>
          <HiOutlineUsers className="h-4 w-4 stroke-[1.75] text-slate-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-xl font-bold text-slate-900">
            {summary.competitorCount}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">{kpi.profileUnit}</span>
        </div>
      </div>

      {/* KPI 4: Active Strategy */}
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {kpi.activeStrategy}
          </span>
          <HiOutlineSparkles className="h-4 w-4 stroke-[1.75] text-slate-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-xl font-bold text-slate-900">
            {summary.strategyVersion ? `v${summary.strategyVersion}.0` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
