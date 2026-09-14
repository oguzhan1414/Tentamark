"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";

type TeamMemberAvatar = { id: string; initial: string; name: string };

const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-slate-700", "bg-amber-500", "bg-rose-500"];

type Props = {
  viewMode: "month" | "week";
  onViewModeChange: (mode: "month" | "week") => void;
  dateLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onOpenFilter: () => void;
  onOpenAiTodo: () => void;
  onOpenMedia: () => void;
  aiTodoCount: number;
  onOpenCompose: () => void;
  onOpenSmartFill?: () => void;
  filterCount: number;
};

export default function CalendarHeader({
  viewMode,
  onViewModeChange,
  dateLabel,
  onPrev,
  onNext,
  onToday,
  onOpenFilter,
  onOpenAiTodo,
  onOpenMedia,
  aiTodoCount,
  onOpenCompose,
  onOpenSmartFill,
  filterCount,
}: Props) {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);
  const [teamMembers, setTeamMembers] = useState<TeamMemberAvatar[]>([]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data: brandRow } = await supabase.from("brands").select("organization_id").eq("id", brand.id).maybeSingle();
      if (ignore || !brandRow) return;

      const { data: memberRows } = await supabase
        .from("organization_members")
        .select("id, profiles(full_name, email)")
        .eq("organization_id", brandRow.organization_id)
        .order("created_at", { ascending: true })
        .limit(5);
      if (ignore || !memberRows) return;

      setTeamMembers(
        memberRows.map((m) => {
          const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
          const name = p?.full_name || p?.email?.split("@")[0] || "Üye";
          return { id: m.id, initial: name[0]?.toUpperCase() ?? "?", name };
        })
      );
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  return (
    <header className="shrink-0 border-b border-slate-200 bg-white">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Workspace + view switcher + date nav */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-tr from-rose-500 to-[#FA5252] text-[10px] font-bold text-white">
              {(brand.name || "M").charAt(0).toLowerCase()}
            </span>
            <span className="font-semibold text-slate-900">{brand.name || "Örnek çalışma alanı"}</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">Takvim</span>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden md:block" />

          {/* Month / Week Switcher */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/80 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onViewModeChange("month")}
              className={`rounded-md px-3 py-1 transition cursor-pointer ${
                viewMode === "month"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Ay
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("week")}
              className={`rounded-md px-3 py-1 transition cursor-pointer ${
                viewMode === "week"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Hafta
            </button>
          </div>

          {/* Date Range Navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrev}
              title="Önceki"
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              ‹
            </button>
            <span className="min-w-[110px] sm:min-w-[130px] text-center text-xs font-semibold text-slate-900 font-display">
              {dateLabel}
            </span>
            <button
              type="button"
              onClick={onNext}
              title="Sonraki"
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              ›
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {teamMembers.length > 0 && (
            <div className="hidden xl:flex items-center gap-1 mr-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                {teamMembers.map((m, i) => (
                  <div
                    key={m.id}
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                  >
                    {m.initial}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-mono text-slate-500 ml-1">{teamMembers.length}</span>
            </div>
          )}

          <Link
            href="/dashboard/posts?filter=draft"
            title="Onaya gönderilmemiş taslakları görüntüle"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V4a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V20a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Taslaklar</span>
          </Link>

          <button
            type="button"
            onClick={onOpenMedia}
            title="Medya kütüphanesi — daha önce yüklenmiş fotoğraf/videoları görüntüle, yeni dosya yükle"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Medya</span>
          </button>

          <button
            type="button"
            onClick={onOpenAiTodo}
            className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <svg className="h-3.5 w-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <span className="hidden sm:inline">AI Yapılacaklar</span>
            {aiTodoCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FA5252] text-[10px] font-bold text-white">
                {aiTodoCount}
              </span>
            )}
          </button>

          {onOpenSmartFill && (
            <button
              type="button"
              onClick={onOpenSmartFill}
              title="Bugün veya seçilen boş gün için AI gönderi oluştur"
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
            >
              <span>✨</span>
              <span className="hidden sm:inline">AI ile Doldur</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenFilter}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
              filterCount > 0 ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filtrele</span>
            {filterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FA5252] text-[10px] font-bold text-white">
                {filterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCompose}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#FA5252] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#E03131] transition cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>İçerik Oluştur</span>
          </button>
        </div>
      </div>

      {/* Subheader: only "Bugün" — Request approvals / calendar count / Saved
          were all decorative dead ends (no onClick, or a drawer that could
          never show anything real) copied in from the Planable reference. */}
      <div className="flex h-10 items-center border-t border-slate-100 bg-[#FAFAFA] px-6 text-xs text-slate-600">
        <button
          type="button"
          onClick={onToday}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          Bugün
        </button>
      </div>
    </header>
  );
}
