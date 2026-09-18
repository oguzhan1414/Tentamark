"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { useLanguage } from "@/context/LanguageContext";
import { analyzeContentBalance } from "@/lib/ai/analyzeContentBalance";
import type { CalendarPost } from "./types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  needsReview: number;
  briefing: string;
  posts?: CalendarPost[];
  onSmartFill?: (category?: string) => void;
};

export default function CalendarAiTodoDrawer({
  isOpen,
  onClose,
  needsReview,
  briefing,
  posts = [],
  onSmartFill,
}: Props) {
  const brand = useBrand();
  const { t } = useLanguage();
  const d = t.dashboard.calendar.aiAdvisorDrawer;

  const balance = useMemo(() => {
    return analyzeContentBalance(posts);
  }, [posts]);

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-slate-200 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">✨</span>
          <h3 className="font-semibold text-sm text-slate-900">{d.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={d.close}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-700">
        {/* 1. Content Pillar Balance Radar Card */}
        <div className="rounded-2xl border border-rose-100/80 bg-rose-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>🎯</span>
              <span>{d.contentBalanceRadar}</span>
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                balance.status === "warning"
                  ? "bg-amber-100 text-amber-800"
                  : balance.status === "balanced"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {balance.status === "warning"
                ? d.balanceWarning
                : balance.status === "balanced"
                ? d.balanced
                : d.planAwaited}
            </span>
          </div>

          {/* Multi-segment distribution bar */}
          {balance.totalPosts > 0 && (
            <div className="space-y-1.5">
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                {balance.pillars.map(
                  (p, i) =>
                    p.percentage > 0 && (
                      <div
                        key={i}
                        style={{ width: `${p.percentage}%` }}
                        className={`${p.color} transition-all`}
                        title={`${p.pillar}: %${p.percentage}`}
                      />
                    )
                )}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-slate-600">
                {balance.pillars.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${p.color} shrink-0`} />
                    <span className="truncate">
                      {p.pillar} (%{p.percentage})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Advice */}
          <div className="rounded-xl bg-white p-3 border border-slate-200/80 space-y-1 text-[11px]">
            <p className="font-semibold text-slate-900">{balance.message}</p>
            {balance.suggestion && (
              <p className="text-slate-600 leading-relaxed italic">{balance.suggestion}</p>
            )}
          </div>

          {onSmartFill && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSmartFill(balance.suggestedPillar ?? undefined);
              }}
              className="w-full rounded-xl bg-[#FA5252] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#E03131] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>✨</span>
              <span>{d.fillMissingDay}</span>
            </button>
          )}
        </div>

        {/* 2. Action Checklist */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            {d.quickActions}
          </span>

          <Link
            href="/dashboard/posts"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-rose-50/40 hover:border-rose-100 transition group"
          >
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
              {needsReview} {d.reviewPendingPosts}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-rose-600">→</span>
          </Link>

          <Link
            href="/dashboard/compose/weekly"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-rose-50/40 hover:border-rose-100 transition group"
          >
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
              {d.completeWeeklyCalendar}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-rose-600">→</span>
          </Link>

          <Link
            href="/dashboard/campaigns"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-rose-50/40 hover:border-rose-100 transition group"
          >
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
              {brand.name} {d.updateCampaignObjectives}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-rose-600">→</span>
          </Link>

          <Link
            href="/settings?tab=baglantilar"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-rose-50/40 hover:border-rose-100 transition group"
          >
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
              {d.verifySocialConnections}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-rose-600">→</span>
          </Link>
        </div>

        {/* 3. Daily Briefing */}
        {briefing && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-[11px] text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">
              {d.dailyBriefingTitle}
            </span>
            <p className="whitespace-pre-line text-slate-700">{briefing}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
