"use client";

import { useDroppable } from "@dnd-kit/core";
import { useLanguage } from "@/context/LanguageContext";
import CalendarPostCard from "./CalendarPostCard";
import { groupCalendarPosts } from "./groupCalendarPosts";
import type { CalendarPost, CalendarNote, CalendarCampaign } from "./types";

type Props = {
  currentDate: Date;
  posts: CalendarPost[];
  notes: CalendarNote[];
  campaigns: CalendarCampaign[];
  todayKey: string;
  onSelectPost: (post: CalendarPost) => void;
  onAddPostAtDate: (dateStr: string) => void;
  onSmartFillDate?: (dateStr: string) => void;
  onAddNote: (dateStr: string) => void;
  onOpenDay: (dateKey: string) => void;
};

// A day cell's height is a fixed share of the grid (see numRows below) — it
// can never grow with content, so how many posts it shows inline has to be
// a hard cap, not "however many fit" (an internal scrollbar used to do that
// job and broke down visually once a day actually had a handful of real
// posts on it). Anything past this shows behind "+N daha" instead, opening
// the full day in CalendarDayModal — which the day number itself also opens,
// so there's always a way to see everything regardless of count.
const MAX_INLINE_POSTS = 2;

function formatDateKey(year: number, month: number, day: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function DayCell({
  cell,
  todayKey,
  campaign,
  dayPosts,
  dayNotes,
  onSelectPost,
  onAddPostAtDate,
  onSmartFillDate,
  onAddNote,
  onOpenDay,
}: {
  cell: { day: number; dateKey: string; inCurrentMonth: boolean };
  todayKey: string;
  campaign: CalendarCampaign | undefined;
  dayPosts: CalendarPost[];
  dayNotes: CalendarNote[];
  onSelectPost: (post: CalendarPost) => void;
  onAddPostAtDate: (dateStr: string) => void;
  onSmartFillDate?: (dateStr: string) => void;
  onAddNote: (dateStr: string) => void;
  onOpenDay: (dateKey: string) => void;
}) {
  const { locale } = useLanguage();
  const isTr = locale === "tr";
  const isToday = cell.dateKey === todayKey;
  const isPast = cell.dateKey < todayKey;
  const { setNodeRef, isOver } = useDroppable({ id: cell.dateKey, disabled: isPast });
  const hasCampaignStart = campaign?.start_date === cell.dateKey;
  const hasCampaignEnd = campaign?.end_date === cell.dateKey;
  // Grouped by idea, not by (content, platform) row — a post going to 3
  // platforms is still one card here, same as everywhere else in the app.
  const dayGroups = groupCalendarPosts(dayPosts);
  const visibleGroups = dayGroups.slice(0, MAX_INLINE_POSTS);
  const hiddenPostCount = dayGroups.length - visibleGroups.length;
  const hasOverflow = hiddenPostCount > 0 || dayNotes.length > 0;

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex min-h-0 flex-col overflow-hidden border-b border-r border-slate-200 p-2 transition-colors ${
        isOver ? "bg-rose-50/50" : cell.inCurrentMonth ? (isPast ? "bg-slate-50/70" : "bg-white") : "bg-slate-50/40"
      } ${isToday ? "ring-2 ring-inset ring-rose-400" : ""}`}
    >
      {/* Day Header — the number itself opens the full day (CalendarDayModal),
          the same entry point whether or not anything overflowed inline. */}
      <div className="flex shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={() => onOpenDay(cell.dateKey)}
          title={isTr ? "Günü aç" : "Open day"}
          className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-bold transition hover:bg-slate-100 cursor-pointer ${
            isToday
              ? "bg-[#FA5252] text-white hover:bg-rose-600"
              : cell.inCurrentMonth
                ? isPast
                  ? "text-slate-400"
                  : "text-slate-800"
                : "text-slate-400"
          }`}
        >
          {cell.day}
        </button>

        {/* Quick add + menu on hover — never shown for past dates: nothing
            gets scheduled or freshly noted on a day that's already gone. */}
        {!isPast && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
            {onSmartFillDate && (
              <button
                type="button"
                onClick={() => onSmartFillDate(cell.dateKey)}
                title={isTr ? "Bu günü AI ile doldur" : "Fill this day with AI"}
                className="flex h-5 w-5 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-700 shadow-2xs hover:bg-[#FA5252] hover:text-white transition cursor-pointer"
              >
                <span className="text-[10px] leading-none">✨</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onAddNote(cell.dateKey)}
              title={isTr ? "Bu tarihe not ekle" : "Add note on this date"}
              className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onAddPostAtDate(cell.dateKey)}
              title={isTr ? "Bu tarihe gönderi planla" : "Schedule post on this date"}
              className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Multi-day Campaign Banner — real campaign date range, not a
          hardcoded demo one. */}
      {campaign && (
        <div
          className={`mt-1.5 mb-1 flex shrink-0 items-center gap-1 overflow-hidden text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 ${
            hasCampaignStart ? "rounded-l-md" : ""
          } ${hasCampaignEnd ? "rounded-r-md" : ""}`}
        >
          <span className="text-emerald-600">✦</span>
          <span className="truncate">{campaign.name}</span>
        </div>
      )}

      {/* At most MAX_INLINE_POSTS chips — fixed height, never scrolls, never
          pushes the row taller than its 1fr share of the grid. */}
      <div className="mt-1 flex min-h-0 flex-1 flex-col justify-start gap-1 overflow-hidden">
        {visibleGroups.map((g) => (
          <CalendarPostCard
            key={g.key}
            post={g.hero}
            otherPlatforms={g.members.slice(1).map((m) => m.platform)}
            onClick={() => onSelectPost(g.hero)}
            draggable={!isPast && g.hero.postStatus !== "PUBLISHED" && g.hero.postStatus !== "FAILED"}
            compact
          />
        ))}

        {hasOverflow && (
          <button
            type="button"
            onClick={() => onOpenDay(cell.dateKey)}
            className="mt-auto shrink-0 rounded-md bg-slate-100 px-1.5 py-1 text-left text-[10px] font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            {hiddenPostCount > 0 && dayNotes.length > 0
              ? `+${hiddenPostCount} ${isTr ? "gönderi" : "posts"}, ${dayNotes.length} ${isTr ? "not" : "notes"}`
              : hiddenPostCount > 0
                ? `+${hiddenPostCount} ${isTr ? "gönderi daha" : "more posts"}`
                : `${dayNotes.length} ${isTr ? "not" : "notes"}`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CalendarMonthView({
  currentDate,
  posts,
  notes,
  campaigns,
  todayKey,
  onSelectPost,
  onAddPostAtDate,
  onSmartFillDate,
  onAddNote,
  onOpenDay,
}: Props) {
  const { t } = useLanguage();
  const weekdays = t.dashboard.calendar.dayNames;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Compute month days grid (Monday start, 35 or 42 cells)
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; dateKey: string; inCurrentMonth: boolean }[] = [];
  // Prev month filler
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevDateKey = formatDateKey(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, day);
    cells.push({ day, dateKey: prevDateKey, inCurrentMonth: false });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, dateKey: formatDateKey(year, month, i), inCurrentMonth: true });
  }
  // Next month filler
  const totalCells = cells.length > 35 ? 42 : 35;
  const remaining = totalCells - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const nextDateKey = formatDateKey(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i);
    cells.push({ day: i, dateKey: nextDateKey, inCurrentMonth: false });
  }

  // Fixed row count (5 or 6 depending on the month) sized in CSS below —
  // month view's whole point is seeing every week at once, so it fills the
  // available height instead of scrolling the page to reveal later weeks.
  const numRows = cells.length / 7;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white">
      {/* Weekday Header Row */}
      <div className="grid shrink-0 grid-cols-7 border-b border-slate-200 bg-slate-50/50 text-center text-xs font-semibold text-slate-500">
        {weekdays.map((day, idx) => (
          <div key={idx} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Rows — grid-template-rows set inline since numRows (5 or 6)
          varies by month and Tailwind's auto-rows-fr doesn't respect a
          min-h-0 child's need to shrink, which is what caused the old
          forced-scroll bug. */}
      <div
        className="grid min-h-0 flex-1 grid-cols-7 border-l border-t border-slate-200"
        style={{ gridTemplateRows: `repeat(${numRows}, minmax(0, 1fr))` }}
      >
        {cells.map((cell, idx) => {
          const dayPosts = posts.filter((p) => p.date === cell.dateKey);
          const dayNotes = notes.filter((n) => n.date === cell.dateKey);
          const campaign = campaigns.find((c) => cell.dateKey >= c.start_date && cell.dateKey <= c.end_date);

          return (
            <DayCell
              key={idx}
              cell={cell}
              todayKey={todayKey}
              campaign={campaign}
              dayPosts={dayPosts}
              dayNotes={dayNotes}
              onSelectPost={onSelectPost}
              onAddPostAtDate={onAddPostAtDate}
              onSmartFillDate={onSmartFillDate}
              onAddNote={onAddNote}
              onOpenDay={onOpenDay}
            />
          );
        })}
      </div>
    </div>
  );
}
