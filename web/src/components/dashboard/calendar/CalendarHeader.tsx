"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { getBrandTeam } from "@/lib/brandTeam";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import type { MarketingHoliday } from "@/lib/calendar/marketingHolidays";

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
  monthHolidays?: MarketingHoliday[];
  onSelectHoliday?: (holiday: MarketingHoliday, dateStr?: string, angle?: string) => void;
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
  monthHolidays = [],
  onSelectHoliday,
}: Props) {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);
  const { t } = useLanguage();
  const c = t.dashboard.calendar;
  const dm = t.dashboard.calendar.dayModal;
  const [teamMembers, setTeamMembers] = useState<TeamMemberAvatar[]>([]);

  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();

  const nextHoliday = useMemo(() => {
    if (!monthHolidays || monthHolidays.length === 0) return null;
    const upcomingThisMonth = monthHolidays.find((h) => h.month === currentMonth && h.day >= currentDay);
    if (upcomingThisMonth) return upcomingThisMonth;
    return monthHolidays[0];
  }, [monthHolidays, currentDay, currentMonth]);

  const nextHolidayDiff = useMemo(() => {
    if (!nextHoliday) return null;
    const n = new Date();
    const target = new Date(n.getFullYear(), nextHoliday.month, nextHoliday.day);
    const today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [nextHoliday]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const memberRows = await getBrandTeam(supabase, brand.id);
      if (ignore) return;
      setTeamMembers(memberRows.slice(0, 5).map((member) => ({
        id: member.id, initial: member.name[0]?.toUpperCase() ?? "?", name: member.name,
      })));
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
            <span className="font-semibold text-slate-900">{brand.name || "Workspace"}</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{t.dashboard.nav.calendar}</span>
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
              {c.month}
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
              {c.week}
            </button>
          </div>

          {/* Date Range Navigation */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrev}
              title={c.prev}
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
              title={c.next}
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
            title={t.dashboard.posts.tabs.drafts}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V4a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V20a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">{t.dashboard.posts.tabs.drafts}</span>
          </Link>

          <button
            type="button"
            onClick={onOpenMedia}
            title={c.media}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">{c.media}</span>
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
            <span className="hidden sm:inline">{c.aiTodo}</span>
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
              title={c.aiFill}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/80 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
            >
              <span>✨</span>
              <span className="hidden sm:inline">{c.aiFill}</span>
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
            <span className="hidden sm:inline">{t.dashboard.common.filter}</span>
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
            <span>{c.newPost}</span>
          </button>
        </div>
      </div>

      {/* Subheader */}
      <div className="flex h-11 items-center justify-between border-t border-slate-100 bg-[#FAFAFA] px-4 sm:px-6 text-xs text-slate-600 gap-3 overflow-x-auto">
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToday}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            {c.today}
          </button>

          {/* Next Marketing Opportunity Radar */}
          {nextHoliday && (
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-rose-200/90 bg-gradient-to-r from-rose-50 via-white to-amber-50/70 py-0.5 px-2.5 text-[11px] shadow-2xs">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white text-[10px] shadow-2xs">
                {nextHoliday.flag}
              </span>
              <span className="font-bold text-slate-800 truncate max-w-[150px]">
                {nextHoliday.name}
              </span>
              {nextHolidayDiff === 0 ? (
                <span className="rounded-full bg-red-600 text-white font-black text-[8px] px-1.5 py-0.2 uppercase tracking-wide animate-pulse">
                  {dm.today}
                </span>
              ) : nextHolidayDiff === 1 ? (
                <span className="rounded-full bg-orange-500 text-white font-bold text-[8px] px-1.5 py-0.2 uppercase">
                  {dm.tomorrow}
                </span>
              ) : nextHolidayDiff !== null && nextHolidayDiff > 1 && nextHolidayDiff <= 14 ? (
                <span className="rounded-full bg-amber-500 text-white font-bold text-[8px] px-1.5 py-0.2">
                  {nextHolidayDiff} {dm.daysLeft}
                </span>
              ) : (
                <span className="text-slate-400 font-mono text-[9px]">
                  ({nextHoliday.day} {c.daySuffix})
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelectHoliday?.(nextHoliday)}
                className="ml-0.5 inline-flex items-center gap-1 rounded-full bg-white border border-rose-200 px-2 py-0.5 text-[9.5px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition shadow-2xs cursor-pointer"
              >
                <span>✨</span>
                <span>{dm.generatePost}</span>
              </button>
            </div>
          )}
        </div>

        {/* Month Holidays Pill List */}
        {monthHolidays && monthHolidays.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
              <span>🎉</span>
              <span>{c.thisMonthDays}</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {monthHolidays.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => onSelectHoliday?.(h)}
                  title={`${h.name} (${h.tag})\n💡 ${h.advice}`}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs hover:border-rose-300 hover:bg-rose-50/80 hover:text-rose-800 transition cursor-pointer shrink-0"
                >
                  <span>{h.flag}</span>
                  <span className="truncate max-w-[130px]">{h.name}</span>
                  <span className="text-[9px] font-mono text-slate-400">({h.day})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
