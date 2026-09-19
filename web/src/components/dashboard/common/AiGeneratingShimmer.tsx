"use client";

import { useEffect, useState } from "react";
import { HiOutlineSparkles } from "react-icons/hi2";

const DEFAULT_STAGES = [
  "Marka sesiniz ve hedef kitle dinamikleri taranıyor...",
  "Seçilen platformlar için kancalar (hooks) tasarlanıyor...",
  "Hashtag ve etkileşim stratejisi optimize ediliyor...",
  "Taslaklar onayınıza hazır hale getiriliyor...",
];

export default function AiGeneratingShimmer({
  title = "AI İçerik Motoru Çalışıyor",
  stages = DEFAULT_STAGES,
  className = "",
}: {
  title?: string;
  stages?: string[];
  className?: string;
}) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIdx((prev) => (prev + 1) % stages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [stages]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/40 p-6 sm:p-8 shadow-sm ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Ambient glowing radial blur */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#FA5252]/10 blur-2xl animate-pulse"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-violet-400/10 blur-2xl"
        aria-hidden="true"
      />

      {/* Header with pulsing icon */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FA5252] to-[#ff7b7b] text-white shadow-md shadow-[#FA5252]/20">
          <HiOutlineSparkles className="h-5 w-5 animate-spin duration-3000" />
        </div>
        <div>
          <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">
            {title}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-[#FA5252] transition-all duration-300 animate-in fade-in">
            {stages[currentStageIdx]}
          </p>
        </div>
      </div>

      {/* Shimmer skeleton lines mimicking post drafts */}
      <div className="mt-6 space-y-3">
        {/* Shimmer Bar 1 */}
        <div className="h-4 w-3/4 rounded-full bg-slate-200/70 relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
        {/* Shimmer Bar 2 */}
        <div className="h-4 w-full rounded-full bg-slate-200/70 relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
        {/* Shimmer Bar 3 */}
        <div className="h-4 w-5/6 rounded-full bg-slate-200/70 relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>

        {/* Media placeholder shimmer card */}
        <div className="mt-4 flex items-center gap-3 pt-2">
          <div className="h-16 w-16 rounded-xl bg-slate-200/70 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded-full bg-slate-200/70 relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            </div>
            <div className="h-3 w-1/3 rounded-full bg-slate-200/50 relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

