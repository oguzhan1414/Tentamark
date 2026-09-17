"use client";

import { useState } from "react";
import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";
import type { CaptionLabResult, CaptionLabVariant } from "@/lib/ai/generateCaptionLab";

interface CaptionLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: PlatformName;
  onApplyVariant: (caption: string) => void;
  onApplyHook?: (hook: string) => void;
  result: CaptionLabResult | null;
  loading: boolean;
  error: string | null;
  onRegenerate: () => void;
  isEn: boolean;
}

type ViewMode = "grid" | "focused";

export default function CaptionLabModal({
  isOpen,
  onClose,
  platform,
  onApplyVariant,
  onApplyHook,
  result,
  loading,
  error,
  onRegenerate,
  isEn,
}: CaptionLabModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [focusedId, setFocusedId] = useState<"curiosity" | "educational" | "direct_cta">("curiosity");

  if (!isOpen) return null;

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleApplyFull(caption: string) {
    onApplyVariant(caption);
    onClose();
  }

  function handleApplyOnlyHook(hook: string) {
    if (onApplyHook) {
      onApplyHook(hook);
      onClose();
    }
  }

  const activeFocusedVariant = result?.variants.find((v) => v.id === focusedId) || result?.variants[0];

  return (
    <div
      className="fixed inset-0 z-120 flex items-center justify-center p-3 sm:p-5 sm:py-6 overflow-hidden"
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      {/* Light Frosted Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Window Container - Pure Crisp White Theme */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Caption Lab"
        className="relative z-10 flex max-h-[94vh] w-full max-w-[1380px] flex-col overflow-hidden rounded-[32px] border border-slate-200/90 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] animate-in zoom-in-95 duration-200"
      >
        {/* Colorful Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-pink-500 via-amber-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-6 sm:px-8 py-4.5">
          <div className="flex items-center gap-3.5">
            {/* Logo Icon */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/20 ring-2 ring-violet-100">
              <span className="text-xl">🧪</span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  Caption Lab<span className="text-violet-600">™</span>
                </h2>
                <span className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                  {isEn ? "A/B Viral Engine" : "A/B Algoritma Motoru"}
                </span>
                <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-2xs">
                  <PlatformIcon name={platform} className="h-3.5 w-3.5" />
                  <span>{platformLabel(platform)}</span>
                </div>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                {isEn
                  ? "Compare 3 psychological angles (Curiosity, Value, CTA) scored by social algorithms."
                  : "Sosyal medya algoritmalarına göre 3 psikolojik açıyı (Merak, Değer, Satış) simüle edin ve karşılaştırın."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            {result && !loading && !error && (
              <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-1 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-violet-700 shadow-2xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🃏</span>
                  <span>{isEn ? "Compare 3 (Grid)" : "3 Varyantı Karşılaştır"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("focused")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1 transition cursor-pointer ${
                    viewMode === "focused"
                      ? "bg-white text-violet-700 shadow-2xs font-extrabold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🔍</span>
                  <span>{isEn ? "Focused View" : "Detaylı Odak"}</span>
                </button>
              </div>
            )}

            {!loading && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-violet-300 hover:bg-violet-50/80 hover:text-violet-700 transition cursor-pointer"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span>{isEn ? "Re-evaluate" : "Yeniden Simüle Et"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body - Bright, Cheerful, Clean Canvas */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-[#F8F9FD]">
          {/* Loading State */}
          {loading && (
            <div className="flex min-h-[460px] flex-col items-center justify-center gap-5 text-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-violet-400/20" />
                <div className="absolute inset-1 animate-pulse rounded-full bg-fuchsia-300/30" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-500 text-3xl text-white shadow-xl shadow-violet-500/25">
                  🧪
                </div>
              </div>

              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base font-black text-slate-900">
                  {isEn ? "Simulating Algorithmic Scenarios..." : "Algoritma ve Kanca Simülasyonu Çalışıyor..."}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isEn
                    ? "Evaluating scroll-stopping hooks, save potential, and conversion across 3 psychological angles."
                    : "Marka kimliğiniz taranıyor; merak boşluğu, kaydetme potansiyeli ve eyleme geçirme gücü 3 ayrı açıda simüle ediliyor."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                <span className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-600 animate-ping" />
                  <span>{isEn ? "1. Curiosity Gap" : "1. Merak Boşluğu"}</span>
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                  <span>{isEn ? "2. Save Magnet" : "2. Kaydetme Mıknatısı"}</span>
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping" />
                  <span>{isEn ? "3. Conversion CTA" : "3. Eylem ve Satış"}</span>
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-500 border border-red-200 shadow-xs">
                ⚠️
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {isEn ? "Simulation Failed" : "Simülasyon Tamamlanamadı"}
              </h3>
              <p className="max-w-md text-xs text-slate-600">{error}</p>
              <button
                type="button"
                onClick={onRegenerate}
                className="mt-1 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 transition cursor-pointer"
              >
                {isEn ? "Try Again" : "Tekrar Dene"}
              </button>
            </div>
          )}

          {/* Results Display */}
          {result && !loading && !error && (
            <>
              {/* Focused Mode */}
              {viewMode === "focused" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-white p-2 border border-slate-200/90 shadow-2xs">
                    {result.variants.map((variant) => {
                      const active = focusedId === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setFocusedId(variant.id)}
                          className={`flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs font-extrabold transition cursor-pointer ${
                            active
                              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-sm">{variant.badge.split(" ")[0]}</span>
                          <span className="truncate">{variant.title}</span>
                          <span className="ml-1 rounded-md bg-violet-100 text-violet-800 px-2 py-0.5 text-[11px] font-mono font-black">
                            {variant.overallScore}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {activeFocusedVariant && (
                    <div className="w-full">
                      <VariantCard
                        variant={activeFocusedVariant}
                        onApplyFull={() => handleApplyFull(activeFocusedVariant.caption)}
                        onApplyHook={
                          onApplyHook ? () => handleApplyOnlyHook(activeFocusedVariant.hook) : undefined
                        }
                        onCopy={() => handleCopy(activeFocusedVariant.caption, activeFocusedVariant.id)}
                        isCopied={copiedId === activeFocusedVariant.id}
                        isEn={isEn}
                        isFocusedView
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 3-Column Grid Mode */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
                  {result.variants.map((variant) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      onApplyFull={() => handleApplyFull(variant.caption)}
                      onApplyHook={
                        onApplyHook ? () => handleApplyOnlyHook(variant.hook) : undefined
                      }
                      onCopy={() => handleCopy(variant.caption, variant.id)}
                      isCopied={copiedId === variant.id}
                      isEn={isEn}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VariantCard({
  variant,
  onApplyFull,
  onApplyHook,
  onCopy,
  isCopied,
  isEn,
  isFocusedView = false,
}: {
  variant: CaptionLabVariant;
  onApplyFull: () => void;
  onApplyHook?: () => void;
  onCopy: () => void;
  isCopied: boolean;
  isEn: boolean;
  isFocusedView?: boolean;
}) {
  const isCuriosity = variant.id === "curiosity";
  const isEducational = variant.id === "educational";

  const theme = isCuriosity
    ? {
        cardBorder: "border-violet-200 hover:border-violet-300 hover:shadow-[0_12px_36px_rgba(124,58,237,0.12)]",
        headerBg: "bg-gradient-to-br from-violet-50 via-purple-50/60 to-white border-b border-violet-100",
        badge: "bg-violet-100 text-violet-800 border-violet-200",
        taglineColor: "text-violet-700",
        scoreRingStroke: "#7c3aed",
        scoreTextColor: "text-violet-700",
        primaryBtn: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md shadow-violet-500/20",
        hookBox: "bg-violet-50/50 border-violet-200/80 text-slate-900",
        hookLinkColor: "text-violet-700 hover:text-violet-900",
        tagline: "🏆 En Yüksek Scroll-Durdurma",
        icon: "⚡",
      }
    : isEducational
    ? {
        cardBorder: "border-emerald-200 hover:border-emerald-300 hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)]",
        headerBg: "bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white border-b border-emerald-100",
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        taglineColor: "text-emerald-700",
        scoreRingStroke: "#059669",
        scoreTextColor: "text-emerald-700",
        primaryBtn: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20",
        hookBox: "bg-emerald-50/50 border-emerald-200/80 text-slate-900",
        hookLinkColor: "text-emerald-700 hover:text-emerald-900",
        tagline: "💾 En Yüksek Kaydetme Oranı",
        icon: "💎",
      }
    : {
        cardBorder: "border-amber-200 hover:border-amber-300 hover:shadow-[0_12px_36px_rgba(245,158,11,0.12)]",
        headerBg: "bg-gradient-to-br from-amber-50 via-orange-50/50 to-white border-b border-amber-100",
        badge: "bg-amber-100 text-amber-800 border-amber-200",
        taglineColor: "text-amber-700",
        scoreRingStroke: "#d97706",
        scoreTextColor: "text-amber-700",
        primaryBtn: "bg-gradient-to-r from-amber-600 via-rose-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white shadow-md shadow-amber-500/20",
        hookBox: "bg-amber-50/50 border-amber-200/80 text-slate-900",
        hookLinkColor: "text-amber-700 hover:text-amber-900",
        tagline: "🎯 En Yüksek Tıklama & Eylem",
        icon: "🚀",
      };

  return (
    <div
      className={`flex flex-col justify-between rounded-3xl border bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 ${
        theme.cardBorder
      } ${isFocusedView ? "p-6 sm:p-8" : "p-5"}`}
    >
      <div>
        {/* Card Header */}
        <div
          className={`-mx-5 -mt-5 rounded-t-3xl ${theme.headerBg} p-5 ${
            isFocusedView ? "-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-6 sm:p-8" : ""
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{theme.icon}</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${theme.badge}`}>
                {variant.badge}
              </span>
            </div>

            {/* Circular Progress Ring */}
            <CircularScoreRing score={variant.overallScore} strokeColor={theme.scoreRingStroke} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">
              {variant.title}
            </h3>
            <span className={`text-[11px] font-black uppercase tracking-wider ${theme.taglineColor}`}>
              {theme.tagline}
            </span>
          </div>
        </div>

        {/* Algorithm Metrics Progress Bars */}
        <div className="space-y-2.5 py-4 border-b border-slate-100 text-xs">
          <MetricBar
            label={isEn ? "Hook Power" : "🪝 Kanca Durdurma"}
            value={variant.hookScore}
            color="violet"
          />
          <MetricBar
            label={isEn ? "Save Potential" : "💾 Kaydetme Gücü"}
            value={variant.savePotential}
            color="emerald"
          />
          <MetricBar
            label={isEn ? "CTA & Conversion" : "⚡ Eyleme Çağrı (CTA)"}
            value={variant.ctaScore}
            color="amber"
          />
          <MetricBar
            label={isEn ? "Brand Match" : "🎯 Marka Sesi Uyumu"}
            value={variant.brandMatchScore}
            color="blue"
          />
        </div>

        {/* 2-Second Hook Highlight */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isEn ? "2-Second Opening Hook" : "2 Saniyelik Açılış Kancası"}
            </span>
            {onApplyHook && (
              <button
                type="button"
                onClick={onApplyHook}
                className={`text-xs font-bold transition cursor-pointer ${theme.hookLinkColor}`}
              >
                {isEn ? "Apply Hook Only →" : "Sadece Kancayı Aktar →"}
              </button>
            )}
          </div>
          <div
            className={`rounded-2xl border p-3.5 text-xs font-bold leading-relaxed shadow-2xs ${theme.hookBox}`}
          >
            <span className="text-slate-400 mr-1">&ldquo;</span>
            <span className="text-slate-900">{variant.hook}</span>
            <span className="text-slate-400 ml-1">&rdquo;</span>
          </div>
        </div>

        {/* Full Caption Box - Generous Height, Clear Typography, No Cramping */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {isEn ? "Full Post Caption" : "Tam Gönderi Metni"}
            </span>
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <span>{isCopied ? "✓" : "📋"}</span>
              <span>{isCopied ? (isEn ? "Copied!" : "Kopyalandı!") : (isEn ? "Copy" : "Kopyala")}</span>
            </button>
          </div>

          <div
            className={`overflow-y-auto rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4 text-[13px] leading-relaxed text-slate-800 whitespace-pre-wrap font-normal shadow-2xs ${
              isFocusedView ? "min-h-[300px] max-h-[500px]" : "min-h-[220px] max-h-[360px]"
            }`}
          >
            {variant.caption}
          </div>
        </div>

        {/* Why Algorithm Likes This - High Readability Rationale */}
        <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/60 p-3.5 text-xs text-slate-700 shadow-2xs">
          <div className="flex items-start gap-2">
            <span className="text-sm shrink-0">💡</span>
            <p className="text-[11px] leading-relaxed text-slate-800">
              <strong className="font-black text-slate-900">
                {isEn ? "Why It Works:" : "Neden İşe Yarar:"}{" "}
              </strong>
              <span className="italic">{variant.whyItWorks}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-2">
        <button
          type="button"
          onClick={onApplyFull}
          className={`w-full rounded-2xl py-3 text-xs font-black transition cursor-pointer transform active:scale-[0.98] ${theme.primaryBtn}`}
        >
          {isEn ? "Use Full Caption Copy ✓" : "Bu Varyantı Kullan (Tüm Metin) ✓"}
        </button>

        {onApplyHook && (
          <button
            type="button"
            onClick={onApplyHook}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
          >
            {isEn ? "Apply Hook Only 🪝" : "Yalnızca Kancayı Uygula 🪝"}
          </button>
        )}
      </div>
    </div>
  );
}

function CircularScoreRing({ score, strokeColor }: { score: number; strokeColor: string }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-14 w-14 -rotate-90 transform" viewBox="0 0 54 54">
        <circle
          cx="27"
          cy="27"
          r={radius}
          stroke="#E2E8F0"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx="27"
          cy="27"
          r={radius}
          stroke={strokeColor}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-mono text-xs font-black text-slate-900">
          {score}
        </span>
        <span className="text-[8px] font-bold text-slate-400 -mt-1">/100</span>
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "violet" | "amber" | "blue";
}) {
  const colorMap = {
    emerald: "from-emerald-500 to-teal-400",
    violet: "from-violet-500 to-fuchsia-500",
    amber: "from-amber-500 to-orange-400",
    blue: "from-blue-500 to-indigo-500",
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-700 truncate font-semibold text-xs">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/80">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-700`}
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="font-mono text-xs font-black text-slate-900 w-8 text-right">
          %{value}
        </span>
      </div>
    </div>
  );
}
