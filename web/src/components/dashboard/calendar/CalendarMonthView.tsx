"use client";

import { useDroppable } from "@dnd-kit/core";
import { useLanguage } from "@/context/LanguageContext";
import CalendarPostCard from "./CalendarPostCard";
import { groupCalendarPosts } from "./groupCalendarPosts";
import type { CalendarPost, CalendarNote, CalendarCampaign } from "./types";
import { isHolidayOnDate, type MarketingHoliday } from "@/lib/calendar/marketingHolidays";

type Props = {
  currentDate: Date;
  posts: CalendarPost[];
  notes: CalendarNote[];
  campaigns: CalendarCampaign[];
  holidays?: MarketingHoliday[];
  todayKey: string;
  onSelectPost: (post: CalendarPost) => void;
  onSelectHoliday?: (holiday: MarketingHoliday, dateStr: string, angle?: string) => void;
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
  dayHolidays = [],
  dayPosts,
  dayNotes,
  onSelectPost,
  onSelectHoliday,
  onAddPostAtDate,
  onSmartFillDate,
  onAddNote,
  onOpenDay,
}: {
  cell: { day: number; dateKey: string; inCurrentMonth: boolean };
  todayKey: string;
  campaign: CalendarCampaign | undefined;
  dayHolidays?: MarketingHoliday[];
  dayPosts: CalendarPost[];
  dayNotes: CalendarNote[];
  onSelectPost: (post: CalendarPost) => void;
  onSelectHoliday?: (holiday: MarketingHoliday, dateStr: string, angle?: string) => void;
  onAddPostAtDate: (dateStr: string) => void;
  onSmartFillDate?: (dateStr: string) => void;
  onAddNote: (dateStr: string) => void;
  onOpenDay: (dateKey: string) => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.calendar;
  const dm = t.dashboard.calendar.dayModal;
  const isToday = cell.dateKey === todayKey;
  const isPast = cell.dateKey < todayKey;
  const { setNodeRef, isOver } = useDroppable({ id: cell.dateKey, disabled: isPast });
  const hasCampaignStart = campaign?.start_date === cell.dateKey;
  const hasCampaignEnd = campaign?.end_date === cell.dateKey;

  const primaryHoliday = dayHolidays[0];
  const isNational = primaryHoliday?.category === "national" || primaryHoliday?.tag.includes("Milli");
  const isCommercial = primaryHoliday?.category === "commercial" || primaryHoliday?.tag.includes("İndirim") || primaryHoliday?.tag.includes("E-Ticaret");
  const isReligious = primaryHoliday?.category === "religious" || primaryHoliday?.tag.includes("Dini");
  const isCommemoration = primaryHoliday?.category === "commemoration" || primaryHoliday?.tag.includes("Anma");

  const holidayCellBg = primaryHoliday
    ? isNational
      ? "bg-gradient-to-b from-rose-50/50 via-rose-50/20 to-white ring-1 ring-inset ring-rose-200/90"
      : isCommercial
      ? "bg-gradient-to-b from-amber-50/50 via-orange-50/20 to-white ring-1 ring-inset ring-amber-200/90"
      : isReligious
      ? "bg-gradient-to-b from-emerald-50/50 via-teal-50/20 to-white ring-1 ring-inset ring-emerald-200/90"
      : isCommemoration
      ? "bg-gradient-to-b from-slate-100/60 via-slate-50/20 to-white ring-1 ring-inset ring-slate-300"
      : "bg-gradient-to-b from-indigo-50/50 via-violet-50/20 to-white ring-1 ring-inset ring-indigo-200/90"
    : "";

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
        isOver
          ? "bg-rose-50/50"
          : cell.inCurrentMonth
            ? isPast
              ? "bg-slate-50/70"
              : primaryHoliday
                ? holidayCellBg
                : "bg-white"
            : "bg-slate-50/40"
      } ${isToday ? "ring-2 ring-inset ring-rose-400" : ""}`}
    >
      {/* Top Accent Line for Special Marketing Days */}
      {primaryHoliday && (
        <div
          className={`absolute top-0 left-0 right-0 h-[2.5px] z-10 ${
            isNational
              ? "bg-gradient-to-r from-red-500 via-rose-500 to-red-400"
              : isCommercial
              ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400"
              : isReligious
              ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400"
              : isCommemoration
              ? "bg-gradient-to-r from-slate-700 via-slate-500 to-slate-400"
              : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          }`}
        />
      )}

      {/* Celebratory Diagonal Corner Ribbon */}
      {primaryHoliday && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelectHoliday ? onSelectHoliday(primaryHoliday, cell.dateKey) : onOpenDay(cell.dateKey);
          }}
          title={`${primaryHoliday.name} (${primaryHoliday.tag})\n💡 ${primaryHoliday.advice}`}
          className="absolute -top-1 -right-1 z-20 h-10 w-10 overflow-hidden cursor-pointer group/ribbon"
        >
          <div
            className={`absolute right-[-17px] top-[9px] w-[54px] transform rotate-45 py-0.5 text-center text-[8.5px] font-black text-white shadow-xs transition-transform group-hover/ribbon:scale-105 select-none ${
              isNational
                ? "bg-gradient-to-r from-red-600 to-rose-600"
                : isCommercial
                ? "bg-gradient-to-r from-amber-500 to-orange-600"
                : isReligious
                ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                : isCommemoration
                ? "bg-gradient-to-r from-slate-700 to-slate-900"
                : "bg-gradient-to-r from-indigo-600 to-purple-600"
            }`}
          >
            {primaryHoliday.flag}
          </div>
        </div>
      )}

      {/* Day Header — the number itself opens the full day (CalendarDayModal),
          the same entry point whether or not anything overflowed inline. */}
      <div className="flex shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={() => onOpenDay(cell.dateKey)}
          title={c.openDay}
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
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 mr-5">
            {onSmartFillDate && (
              <button
                type="button"
                onClick={() => onSmartFillDate(cell.dateKey)}
                title={c.smartFillTooltip}
                className="flex h-5 w-5 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-700 shadow-2xs hover:bg-[#FA5252] hover:text-white transition cursor-pointer"
              >
                <span className="text-[10px] leading-none">✨</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onAddNote(cell.dateKey)}
              title={c.addNoteDate}
              className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onAddPostAtDate(cell.dateKey)}
              title={c.schedulePostDate}
              className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Marketing Special Day Visual Mini-Card */}
      {dayHolidays.map((h) => {
        const isNat = h.category === "national" || h.tag.includes("Milli");
        const isCom = h.category === "commercial" || h.tag.includes("İndirim") || h.tag.includes("E-Ticaret");
        const isRel = h.category === "religious" || h.tag.includes("Dini");
        const isComem = h.category === "commemoration" || h.tag.includes("Anma");

        const [y, m, d] = cell.dateKey.split("-").map(Number);
        const [by, bm, bd] = todayKey.split("-").map(Number);
        const targetMs = new Date(y, m - 1, d).getTime();
        const baseMs = new Date(by, bm - 1, bd).getTime();
        const diffDays = Math.round((targetMs - baseMs) / (1000 * 60 * 60 * 24));

        const theme = isNat
          ? {
              card: "border-rose-200/90 bg-gradient-to-r from-rose-50/95 via-red-50/40 to-white hover:border-rose-300",
              tag: "text-rose-700",
              dot: "bg-rose-500",
            }
          : isCom
          ? {
              card: "border-amber-200/90 bg-gradient-to-r from-amber-50/95 via-orange-50/40 to-white hover:border-amber-300",
              tag: "text-amber-800",
              dot: "bg-amber-500",
            }
          : isRel
          ? {
              card: "border-emerald-200/90 bg-gradient-to-r from-emerald-50/95 via-teal-50/40 to-white hover:border-emerald-300",
              tag: "text-emerald-800",
              dot: "bg-emerald-500",
            }
          : isComem
          ? {
              card: "border-slate-300 bg-gradient-to-r from-slate-100/95 via-slate-50 to-white hover:border-slate-400",
              tag: "text-slate-700",
              dot: "bg-slate-600",
            }
          : {
              card: "border-indigo-200/90 bg-gradient-to-r from-indigo-50/95 via-purple-50/40 to-white hover:border-indigo-300",
              tag: "text-indigo-700",
              dot: "bg-indigo-500",
            };

        const anglesTooltip = h.suggestedAngles && h.suggestedAngles.length > 0
          ? `\n🎯 ${c.suggestedHooksPrefix} ${h.suggestedAngles.join(" • ")}`
          : "";

        return (
          <div
            key={h.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectHoliday ? onSelectHoliday(h, cell.dateKey) : onOpenDay(cell.dateKey);
            }}
            title={`${h.name} (${h.tag})\n💡 ${dm.marketingAdvice} ${h.advice}${anglesTooltip}`}
            className={`group/h relative mt-1.5 mb-1 flex shrink-0 items-center justify-between gap-1.5 rounded-lg border p-1.5 shadow-2xs transition-all hover:shadow-xs cursor-pointer ${theme.card}`}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white text-xs shadow-2xs ring-1 ring-black/5">
                {h.flag}
              </span>
              <div className="min-w-0 flex-1 truncate">
                <div className="flex items-center gap-1">
                  <p className="truncate text-[10.5px] font-bold leading-tight text-slate-900">
                    {h.name}
                  </p>
                  {diffDays === 0 ? (
                    <span className="inline-flex items-center rounded-full bg-red-600 text-white px-1 py-0.2 text-[7.5px] font-black uppercase tracking-wider animate-pulse shrink-0">
                      {dm.today}
                    </span>
                  ) : diffDays > 0 && diffDays <= 7 ? (
                    <span className="inline-flex items-center rounded-full bg-amber-500 text-white px-1 py-0.2 text-[7.5px] font-bold tracking-tight shrink-0">
                      {diffDays}g
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex items-center gap-1 min-w-0 truncate">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${theme.dot}`} />
                    <span className={`text-[8.5px] font-extrabold uppercase tracking-wider truncate ${theme.tag}`}>
                      {h.tag}
                    </span>
                  </div>

                  {/* Coverage Status Badge */}
                  {dayPosts.length > 0 ? (
                    <span
                      title={c.postsScheduled.replace("{count}", String(dayPosts.length))}
                      className="inline-flex items-center gap-0.5 rounded bg-emerald-100/90 border border-emerald-200/80 px-1 py-0.2 text-[8px] font-bold text-emerald-800 shrink-0"
                    >
                      ✓ {dayPosts.length}
                    </span>
                  ) : !isPast ? (
                    <span
                      title={c.noPostScheduled}
                      className={`inline-flex items-center gap-0.5 rounded bg-amber-100/90 border border-amber-200/80 px-1 py-0.2 text-[8px] font-bold text-amber-800 shrink-0 ${
                        diffDays >= 0 && diffDays <= 7 ? "animate-pulse" : ""
                      }`}
                    >
                      ⚡ {c.noPostScheduledShort}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            {!isPast && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectHoliday ? onSelectHoliday(h, cell.dateKey) : onOpenDay(cell.dateKey);
                }}
                title={c.generateContentForDay}
                className="shrink-0 flex h-5 w-5 items-center justify-center rounded-md bg-white text-[10px] font-bold text-slate-700 shadow-2xs opacity-0 group-hover/h:opacity-100 hover:bg-[#FA5252] hover:text-white transition"
              >
                ✨
              </button>
            )}
          </div>
        );
      })}

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
              ? `+${c.postsCount.replace("{count}", String(hiddenPostCount))}, ${c.notesCount.replace("{count}", String(dayNotes.length))}`
              : hiddenPostCount > 0
                ? c.morePostsCount.replace("{count}", String(hiddenPostCount))
                : c.notesCount.replace("{count}", String(dayNotes.length))}
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
  holidays = [],
  todayKey,
  onSelectPost,
  onSelectHoliday,
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
          const [cellYear, cellMonth, cellDay] = cell.dateKey.split("-").map(Number);
          const dayHolidays = holidays.filter((h) =>
            isHolidayOnDate(h, { year: cellYear, month: cellMonth - 1, day: cellDay })
          );

          return (
            <DayCell
              key={idx}
              cell={cell}
              todayKey={todayKey}
              campaign={campaign}
              dayHolidays={dayHolidays}
              dayPosts={dayPosts}
              dayNotes={dayNotes}
              onSelectPost={onSelectPost}
              onSelectHoliday={onSelectHoliday}
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
