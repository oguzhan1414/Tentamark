"use client";

import { useState } from "react";
import type { TonePosition } from "@/lib/brand/traits";
import type { BrandIntelligenceSummary } from "@/lib/ai/getBrandIntelligenceSummary";
import type { LearningLogDay } from "@/lib/ai/getLearningLog";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  brandName: string;
  industry: string;
  tonePosition: TonePosition;
  colorList: string[];
  brandTraits: string[];
  intelligenceSummary: BrandIntelligenceSummary | null;
  learningLog: LearningLogDay[];
  saving: boolean;
  savingStep: string | null;
  saved: boolean;
  saveError: string | null;
  strategyWarning: string | null;
  onSave: () => void;
  describeTone: (pos: TonePosition) => string;
};

export default function BrandLiveSidebar({
  brandName,
  industry,
  tonePosition,
  colorList,
  brandTraits,
  intelligenceSummary,
  learningLog,
  saving,
  savingStep,
  saved,
  saveError,
  strategyWarning,
  onSave,
  describeTone,
}: Props) {
  const { t, isEn, locale } = useLanguage();
  const sb = t.dashboard.brand.sidebar;
  const [showLearningLog, setShowLearningLog] = useState(false);
  const [showFindings, setShowFindings] = useState(false);

  return (
    <div className="space-y-4 lg:sticky lg:top-20">
      {/* 1. Primary Save Action Box */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{savingStep || sb.saving}</span>
            </>
          ) : (
            <>
              <span>💾</span>
              <span>{sb.saveChanges}</span>
            </>
          )}
        </button>

        {saved && !strategyWarning && (
          <div className="rounded-lg bg-emerald-50 p-2 text-center text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5">
            <span>✓</span>
            <span>{sb.savedNotice}</span>
          </div>
        )}

        {strategyWarning && (
          <p className="rounded-lg bg-amber-50 p-2 text-[11px] font-medium text-amber-700">
            {strategyWarning}
          </p>
        )}

        {saveError && (
          <p className="rounded-lg bg-red-50 p-2 text-[11px] font-medium text-red-600">
            {saveError}
          </p>
        )}
      </div>

      {/* 2. Live Brand Identity Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {sb.liveIdentity}
          </span>
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-100">
            {sb.livePreview}
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-[#FA5252] font-display text-lg font-bold text-white shadow-sm shadow-rose-500/20">
            {(brandName || "M").trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold text-slate-900">
              {brandName || sb.defaultBrandName}
            </p>
            <p className="truncate text-xs text-slate-500">
              {industry || sb.industryNotSpecified}
            </p>
          </div>
        </div>

        {/* Tone Badge */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs text-slate-700">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
            {sb.toneAndApproach}
          </span>
          <p className="font-semibold text-slate-800">{describeTone(tonePosition)}</p>
        </div>

        {/* Color Palette Swatches */}
        {colorList.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {sb.colorPalette}
            </span>
            <div className="flex flex-wrap gap-2">
              {colorList.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-2xs shrink-0"
                    style={{ backgroundColor: c }}
                  />
                  <span className="font-mono text-[10px] font-medium text-slate-600 uppercase">{c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Traits Pills */}
        {brandTraits.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              {sb.keyTraits}
            </span>
            <div className="flex flex-wrap gap-1">
              {brandTraits.slice(0, 4).map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-100"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. AI Insights & Recommendation */}
      {intelligenceSummary && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white text-xs">
                AI
              </span>
              <h4 className="text-xs font-bold text-slate-900">Brand Intelligence</h4>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              {sb.liveBadge}
            </span>
          </div>

          {/* Recommendation box */}
          {intelligenceSummary.recommendation && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-slate-800">
              <span className="font-bold text-emerald-800 block mb-1">
                {sb.recommendation}
              </span>
              <p className="leading-relaxed text-slate-700 text-[11px]">
                {intelligenceSummary.recommendation}
              </p>
            </div>
          )}

          {/* Collapsible Findings */}
          {intelligenceSummary.findings.length > 0 && (
            <div className="pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowFindings((v) => !v)}
                className="flex items-center justify-between w-full text-[11px] font-bold text-slate-600 hover:text-slate-900 transition"
              >
                <span>
                  {isEn
                    ? `Recent AI Findings (${intelligenceSummary.findings.length})`
                    : `Son AI Bulguları (${intelligenceSummary.findings.length})`}
                </span>
                <span>{showFindings ? "▲" : "▼"}</span>
              </button>

              {showFindings && (
                <ul className="mt-2 space-y-1.5">
                  {intelligenceSummary.findings.map((f, i) => (
                    <li key={i} className="flex gap-2 text-[11px] text-slate-600 leading-snug">
                      <span className="font-mono text-rose-600 font-bold shrink-0">{i + 1}.</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Learning Log Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowLearningLog((v) => !v)}
              className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 transition flex items-center gap-1"
            >
              <span>
                {isEn
                  ? showLearningLog
                    ? "Hide Learning Log ▲"
                    : `Learning Log (${learningLog.length} days) ▼`
                  : showLearningLog
                    ? "Öğrenme Günlüğünü Gizle ▲"
                    : `Öğrenme Günlüğü (${learningLog.length} gün) ▼`}
              </span>
            </button>

            {showLearningLog && (
              <div className="mt-2.5 max-h-48 overflow-y-auto space-y-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                {learningLog.length === 0 ? (
                  <p className="text-[11px] text-slate-400">
                    {sb.noLoggedActivity}
                  </p>
                ) : (
                  learningLog.map((day) => (
                    <div key={day.date} className="space-y-1">
                      <p className="font-mono text-[10px] font-bold text-slate-700">
                        {new Date(day.date).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", { day: "2-digit", month: "short" })}
                      </p>
                      {day.entries.map((entry, i) => (
                        <p key={i} className="text-[10px] text-slate-600 flex items-start gap-1">
                          <span className="text-emerald-500">✓</span> {entry}
                        </p>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
