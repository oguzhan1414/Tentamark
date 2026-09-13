"use client";

import type { BrandIntelligenceSummary } from "@/lib/ai/getBrandIntelligenceSummary";
import {
  HiOutlineChartPie,
  HiOutlineBolt,
  HiOutlineUsers,
  HiOutlineSparkles,
} from "react-icons/hi2";

type Props = {
  summary: BrandIntelligenceSummary;
};

export default function BrandKpiStrip({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {/* KPI 1: Profil Tamamlanma */}
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Profil Tamamlanma
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
      </div>

      {/* KPI 2: Strateji Uyumu */}
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Strateji Uyumu
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

      {/* KPI 3: Takip Edilen Rakip */}
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Takip Edilen Rakip
          </span>
          <HiOutlineUsers className="h-4 w-4 stroke-[1.75] text-slate-400" />
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="font-display text-xl font-bold text-slate-900">
            {summary.competitorCount}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">profil</span>
        </div>
      </div>

      {/* KPI 4: Aktif Strateji */}
      <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Aktif Strateji
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
