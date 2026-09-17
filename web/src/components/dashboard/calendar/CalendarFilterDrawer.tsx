"use client";

import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";
import { ALL_PLATFORMS } from "@/lib/ai/platforms";
import type { CalendarCampaign, CalendarFilterState } from "./types";

type Props = {
  isOpen: boolean;
  filterState: CalendarFilterState;
  campaigns: CalendarCampaign[];
  onChange: (next: CalendarFilterState) => void;
  onClose: () => void;
  onReset: () => void;
};

import { useLanguage } from "@/context/LanguageContext";

export default function CalendarFilterDrawer({
  isOpen,
  filterState,
  campaigns,
  onChange,
  onClose,
  onReset,
}: Props) {
  const { locale } = useLanguage();
  const isEn = locale === "en";

  const postStatusLabels: Record<string, string> = {
    DRAFT: isEn ? "Draft" : "Taslak",
    SCHEDULED: isEn ? "Scheduled" : "Zamanlandı",
    PUBLISHED: isEn ? "Published" : "Yayınlandı",
  };

  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xs border-l border-slate-200 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5">
        <h3 className="font-semibold text-sm text-slate-900">{isEn ? "Filter & Sort" : "Filtrele ve sırala"}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label={isEn ? "Close" : "Kapat"}
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
        {/* Sort By */}
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isEn ? "SORT BY" : "SIRALA"}
          </span>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...filterState, sortBy: "last_created" })}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium transition cursor-pointer ${
                filterState.sortBy === "last_created"
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>⇅</span> {isEn ? "Default order" : "Varsayılan sıra"}
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filterState, sortBy: "scheduled_date" })}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium transition cursor-pointer ${
                filterState.sortBy === "scheduled_date"
                  ? "bg-slate-100 text-slate-900 font-bold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>📅</span> {isEn ? "By date" : "Tarihe göre"}
            </button>
          </div>
        </div>

        {/* Approval Status */}
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isEn ? "APPROVAL STATUS" : "ONAY DURUMU"}
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(
              [
                { key: "all", label: isEn ? "All" : "Tümü", cls: "bg-blue-600 text-white" },
                { key: "PENDING", label: isEn ? "Pending" : "Bekliyor", cls: "bg-amber-600 text-white" },
                { key: "APPROVED", label: isEn ? "Approved" : "Onaylandı", cls: "bg-emerald-600 text-white" },
                { key: "FEEDBACK", label: isEn ? "Feedback" : "Geri Bildirim", cls: "bg-rose-600 text-white" },
              ] as const
            ).map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => onChange({ ...filterState, approvalStatus: s.key })}
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                  filterState.approvalStatus === s.key ? s.cls : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Post Status */}
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isEn ? "POST STATUS" : "GÖNDERİ DURUMU"}
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ ...filterState, postStatus: "all" })}
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                filterState.postStatus === "all" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isEn ? "All" : "Tümü"}
            </button>
            {Object.entries(postStatusLabels).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ ...filterState, postStatus: key as CalendarFilterState["postStatus"] })}
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                  filterState.postStatus === key ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            PLATFORM
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ ...filterState, platform: "all" })}
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                filterState.platform === "all" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {isEn ? "All" : "Tümü"}
            </button>
            {ALL_PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange({ ...filterState, platform: p })}
                className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                  filterState.platform === p ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <PlatformIcon name={p as PlatformName} variant="bare" className="h-2.5 w-2.5" />
                {platformLabel(p as PlatformName)}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign */}
        {campaigns.length > 0 && (
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isEn ? "CAMPAIGN" : "KAMPANYA"}
            </span>
            <select
              value={filterState.campaign}
              onChange={(e) => onChange({ ...filterState, campaign: e.target.value })}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">{isEn ? "All campaigns" : "Tüm kampanyalar"}</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search input */}
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isEn ? "SEARCH" : "ARA"}
          </span>
          <div className="relative mt-2">
            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">🔍</span>
            <input
              type="text"
              value={filterState.searchQuery}
              onChange={(e) => onChange({ ...filterState, searchQuery: e.target.value })}
              placeholder={isEn ? "Search in posts..." : "Gönderilerde ara..."}
              className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Footer Reset */}
      <div className="border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          {isEn ? "Reset filters" : "Filtreleri sıfırla"}
        </button>
      </div>
    </aside>
  );
}
