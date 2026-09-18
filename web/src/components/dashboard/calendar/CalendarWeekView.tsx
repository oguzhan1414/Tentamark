"use client";

import { useDroppable } from "@dnd-kit/core";
import { useLanguage } from "@/context/LanguageContext";
import CalendarPostCard from "./CalendarPostCard";
import NoteCard from "./NoteCard";
import { groupCalendarPosts } from "./groupCalendarPosts";
import type { CalendarPost, CalendarMeeting, CalendarNote, CalendarCampaign } from "./types";
import { isHolidayOnDate, type MarketingHoliday } from "@/lib/calendar/marketingHolidays";

type Props = {
  weekStart: Date;
  posts: CalendarPost[];
  meetings: CalendarMeeting[];
  notes: CalendarNote[];
  campaigns: CalendarCampaign[];
  holidays?: MarketingHoliday[];
  todayKey: string;
  onSelectPost: (post: CalendarPost) => void;
  onSelectHoliday?: (holiday: MarketingHoliday, dateStr: string, angle?: string) => void;
  onAddPostAtDate: (dateStr: string) => void;
  onSmartFillDate?: (dateStr: string) => void;
  onAddNote: (dateStr: string) => void;
  onSaveNoteText: (id: string, text: string) => void;
  onNoteColorChange: (id: string, color: string) => void;
  onDeleteNote: (id: string) => void;
};

function dateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getDaysDiff(targetKey: string, baseKey: string) {
  const [y, m, d] = targetKey.split("-").map(Number);
  const [by, bm, bd] = baseKey.split("-").map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const base = new Date(by, bm - 1, bd).getTime();
  return Math.round((target - base) / (1000 * 60 * 60 * 24));
}

function DayColumn({
  day,
  todayKey,
  campaign,
  dayHolidays = [],
  dayPosts,
  dayMeetings,
  dayNotes,
  onSelectPost,
  onSelectHoliday,
  onAddPostAtDate,
  onSmartFillDate,
  onAddNote,
  onSaveNoteText,
  onNoteColorChange,
  onDeleteNote,
}: {
  day: { name: string; dateNum: number; key: string };
  todayKey: string;
  campaign: CalendarCampaign | undefined;
  dayHolidays?: MarketingHoliday[];
  dayPosts: CalendarPost[];
  dayMeetings: CalendarMeeting[];
  dayNotes: CalendarNote[];
  onSelectPost: (post: CalendarPost) => void;
  onSelectHoliday?: (holiday: MarketingHoliday, dateStr: string, angle?: string) => void;
  onAddPostAtDate: (dateStr: string) => void;
  onSmartFillDate?: (dateStr: string) => void;
  onAddNote: (dateStr: string) => void;
  onSaveNoteText: (id: string, text: string) => void;
  onNoteColorChange: (id: string, color: string) => void;
  onDeleteNote: (id: string) => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.calendar;
  const dm = t.dashboard.calendar.dayModal;
  const isPast = day.key < todayKey;
  const { setNodeRef, isOver } = useDroppable({ id: day.key, disabled: isPast });

  const primaryHoliday = dayHolidays[0];
  const isNational = primaryHoliday?.category === "national" || primaryHoliday?.tag.includes("Milli");
  const isCommercial = primaryHoliday?.category === "commercial" || primaryHoliday?.tag.includes("İndirim") || primaryHoliday?.tag.includes("E-Ticaret");
  const isReligious = primaryHoliday?.category === "religious" || primaryHoliday?.tag.includes("Dini");
  const isCommemoration = primaryHoliday?.category === "commemoration" || primaryHoliday?.tag.includes("Anma");

  const holidayColBg = primaryHoliday
    ? isNational
      ? "bg-gradient-to-b from-rose-50/50 via-red-50/20 to-transparent ring-1 ring-inset ring-rose-200/90"
      : isCommercial
      ? "bg-gradient-to-b from-amber-50/50 via-orange-50/20 to-transparent ring-1 ring-inset ring-amber-200/90"
      : isReligious
      ? "bg-gradient-to-b from-emerald-50/50 via-teal-50/20 to-transparent ring-1 ring-inset ring-emerald-200/90"
      : isCommemoration
      ? "bg-gradient-to-b from-slate-100/60 via-slate-50/20 to-transparent ring-1 ring-inset ring-slate-300"
      : "bg-gradient-to-b from-indigo-50/50 via-violet-50/20 to-transparent ring-1 ring-inset ring-indigo-200/90"
    : "";

  const diffDays = getDaysDiff(day.key, todayKey);

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex flex-col gap-3 p-3 transition-colors ${
        isOver
          ? "bg-rose-50/50"
          : isPast
            ? "bg-slate-50/60"
            : primaryHoliday
              ? `${holidayColBg} hover:bg-slate-50/40`
              : "hover:bg-slate-50/40"
      }`}
    >
      {/* Top Accent Line for Holiday Day Columns */}
      {primaryHoliday && (
        <div
          className={`absolute top-0 left-0 right-0 h-[3.5px] z-10 ${
            isNational
              ? "bg-gradient-to-r from-red-600 via-rose-500 to-red-400"
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

      {/* Marketing Special Day / Holiday Banner Card */}
      {dayHolidays.map((h) => {
        const isNat = h.category === "national" || h.tag.includes("Milli");
        const isCom = h.category === "commercial" || h.tag.includes("İndirim") || h.tag.includes("E-Ticaret");
        const isRel = h.category === "religious" || h.tag.includes("Dini");
        const isComem = h.category === "commemoration" || h.tag.includes("Anma");

        const cardStyle = isNat
          ? "border-rose-200/90 bg-gradient-to-br from-rose-50/95 via-white to-red-50/30 text-rose-950 shadow-rose-100/50"
          : isCom
          ? "border-amber-200/90 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/30 text-amber-950 shadow-amber-100/50"
          : isRel
          ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/30 text-emerald-950 shadow-emerald-100/50"
          : isComem
          ? "border-slate-300 bg-gradient-to-br from-slate-100/95 via-white to-slate-50 text-slate-900 shadow-slate-100/50"
          : "border-indigo-200/90 bg-gradient-to-br from-indigo-50/95 via-white to-purple-50/30 text-indigo-950 shadow-indigo-100/50";

        const ribbonGradient = isNat
          ? "bg-gradient-to-r from-red-600 to-rose-600"
          : isCom
          ? "bg-gradient-to-r from-amber-500 to-orange-600"
          : isRel
          ? "bg-gradient-to-r from-emerald-600 to-teal-600"
          : isComem
          ? "bg-gradient-to-r from-slate-700 to-slate-900"
          : "bg-gradient-to-r from-indigo-600 to-purple-600";

        const tagBadge = isNat
          ? "bg-rose-100 text-rose-800 border-rose-200"
          : isCom
          ? "bg-amber-100 text-amber-800 border-amber-200"
          : isRel
          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
          : isComem
          ? "bg-slate-200 text-slate-800 border-slate-300"
          : "bg-indigo-100 text-indigo-800 border-indigo-200";

        const btnStyle = isNat
          ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-rose-200"
          : isCom
          ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-amber-200"
          : isRel
          ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200"
          : isComem
          ? "bg-gradient-to-r from-slate-800 to-slate-900 hover:bg-black text-white shadow-slate-200"
          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-200";

        return (
          <div
            key={h.id}
            className={`relative overflow-hidden flex flex-col gap-2.5 rounded-2xl border p-3 shadow-xs transition hover:shadow-md ${cardStyle}`}
          >
            {/* Celebratory Diagonal Corner Ribbon wrapping the Card */}
            <div className="absolute -top-1 -right-1 z-10 h-10 w-10 overflow-hidden pointer-events-none">
              <div
                className={`absolute right-[-17px] top-[9px] w-[54px] transform rotate-45 py-0.5 text-center text-[7.5px] font-black uppercase tracking-wider text-white shadow-xs select-none ${ribbonGradient}`}
              >
                {isNat ? c.ribbons.national : isCom ? c.ribbons.commercial : isRel ? c.ribbons.religious : isComem ? c.ribbons.commemoration : c.ribbons.special}
              </div>
            </div>

            {/* Header with avatar, titles & countdown */}
            <div className="flex items-start gap-2.5 min-w-0 pr-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-2xs ring-1 ring-black/5 text-lg">
                {h.flag}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight text-slate-900 truncate">
                  {h.name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className={`inline-block rounded-md border px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wide ${tagBadge}`}>
                    {h.tag}
                  </span>
                  {diffDays === 0 ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-red-600 text-white px-1.5 py-0.2 text-[8.5px] font-black uppercase tracking-wide animate-pulse shadow-xs">
                      🎉 {dm.today}
                    </span>
                  ) : diffDays === 1 ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500 text-white px-1.5 py-0.2 text-[8.5px] font-black uppercase tracking-wide shadow-xs">
                      ⚡ {dm.tomorrow}
                    </span>
                  ) : diffDays > 1 && diffDays <= 7 ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[8.5px] font-bold uppercase tracking-wide shadow-xs">
                      🔥 {c.daysAway.replace("{count}", String(diffDays))}
                    </span>
                  ) : diffDays > 7 ? (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-white/90 text-slate-600 border border-slate-200/90 px-1.5 py-0.2 text-[8.5px] font-semibold">
                      ⏳ {c.daysAway.replace("{count}", String(diffDays))}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Content Coverage Status Alert */}
            {dayPosts.length === 0 ? (
              <div className="flex items-center justify-between gap-1.5 rounded-xl border border-amber-300/80 bg-amber-50/90 px-2.5 py-1.5 text-[10.5px] font-medium text-amber-900 shadow-2xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-amber-600 text-xs shrink-0">⚠️</span>
                  <span className="truncate">{c.noPostScheduledLong}</span>
                </div>
                {!isPast && (
                  <button
                    type="button"
                    onClick={() => onSelectHoliday ? onSelectHoliday(h, day.key) : onAddPostAtDate(day.key)}
                    className="text-[10px] font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900 shrink-0 cursor-pointer"
                  >
                    {c.planAction}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50/90 px-2.5 py-1.5 text-[10.5px] font-semibold text-emerald-900 shadow-2xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-emerald-600 text-xs shrink-0">✅</span>
                  <span className="truncate">{c.postsPlannedLong.replace("{count}", String(dayPosts.length))}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 shrink-0">
                  {dm.ready}
                </span>
              </div>
            )}

            {/* Strategic Advice Box */}
            <div className="rounded-xl bg-white/90 border border-black/5 p-2 text-[11px] leading-snug text-slate-700 shadow-2xs">
              <div className="flex items-start gap-1.5">
                <span className="text-amber-500 shrink-0 text-xs">💡</span>
                <p className="italic text-slate-600">
                  {h.advice}
                </p>
              </div>
            </div>

            {/* Clickable Suggested Angles Chips */}
            {h.suggestedAngles && h.suggestedAngles.length > 0 && !isPast && (
              <div className="space-y-1 pt-0.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span>🎯</span>
                  <span>{c.suggestedAngles}</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {h.suggestedAngles.map((angle) => (
                    <button
                      key={angle}
                      type="button"
                      onClick={() => onSelectHoliday ? onSelectHoliday(h, day.key, angle) : onAddPostAtDate(day.key)}
                      title={`${c.writeWithAngle} "${angle}"`}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/5 bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 cursor-pointer text-left"
                    >
                      <span className="text-rose-500 text-[9px]">✦</span>
                      <span className="truncate max-w-[135px]">{angle}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Button */}
            {!isPast && (
              <button
                type="button"
                onClick={() => onSelectHoliday ? onSelectHoliday(h, day.key) : onAddPostAtDate(day.key)}
                className={`inline-flex items-center justify-center gap-1.5 w-full rounded-xl py-2 px-2 text-xs font-bold shadow-xs transition cursor-pointer ${btnStyle}`}
              >
                <span>✨</span>
                <span>{c.preparePostForDay}</span>
              </button>
            )}
          </div>
        );
      })}

      {campaign && (
        <div className="flex items-center gap-1 rounded-md bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
          <span className="text-emerald-600">✦</span>
          <span className="truncate">{campaign.name}</span>
        </div>
      )}

      {dayMeetings.map((m) => (
        <div key={m.id} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/90 p-2 text-xs text-blue-900 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{m.title}</p>
            <p className="text-[10px] text-blue-700 font-mono">{m.time}</p>
          </div>
        </div>
      ))}

      {dayNotes.map((n) => (
        <NoteCard
          key={n.id}
          id={n.id}
          initialText={n.text}
          color={n.color}
          onSaveText={onSaveNoteText}
          onColorChange={onNoteColorChange}
          onDelete={onDeleteNote}
        />
      ))}

      {groupCalendarPosts(dayPosts).map((g) => (
        <CalendarPostCard
          key={g.key}
          post={g.hero}
          otherPlatforms={g.members.slice(1).map((m) => m.platform)}
          onClick={() => onSelectPost(g.hero)}
          draggable={!isPast && g.hero.postStatus !== "PUBLISHED" && g.hero.postStatus !== "FAILED"}
        />
      ))}

      {!isPast && (
        <div className="mt-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
          {onSmartFillDate && (
            <button
              type="button"
              onClick={() => onSmartFillDate(day.key)}
              title={c.smartFillTooltip}
              className="flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-[#FA5252] hover:text-white transition cursor-pointer"
            >
              <span>✨</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onAddNote(day.key)}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-1.5 text-[11px] font-semibold text-slate-500 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50 transition cursor-pointer"
          >
            <span>+ {c.addNote}</span>
          </button>
          <button
            type="button"
            onClick={() => onAddPostAtDate(day.key)}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-1.5 text-[11px] font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition cursor-pointer"
          >
            <span>+ {c.addPost}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function CalendarWeekView({
  weekStart,
  posts,
  meetings,
  notes,
  campaigns,
  holidays = [],
  todayKey,
  onSelectPost,
  onSelectHoliday,
  onAddPostAtDate,
  onSmartFillDate,
  onAddNote,
  onSaveNoteText,
  onNoteColorChange,
  onDeleteNote,
}: Props) {
  const { t } = useLanguage();
  const dayNames = t.dashboard.calendar.dayNames;
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return { name: dayNames[i] ?? "", dateNum: d.getDate(), key: dateKey(d) };
  });

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-white">
      {/* Week Header Row */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-700">
        {days.map((d) => {
          const [y, m, dayNum] = d.key.split("-").map(Number);
          const colHolidays = holidays.filter((h) => isHolidayOnDate(h, { year: y, month: m - 1, day: dayNum }));
          const hasHoliday = colHolidays.length > 0;
          const primaryH = colHolidays[0];

          const isNat = primaryH?.category === "national" || primaryH?.tag.includes("Milli");
          const isCom = primaryH?.category === "commercial" || primaryH?.tag.includes("İndirim") || primaryH?.tag.includes("E-Ticaret");
          const isRel = primaryH?.category === "religious" || primaryH?.tag.includes("Dini");
          const isComem = primaryH?.category === "commemoration" || primaryH?.tag.includes("Anma");

          const headerBg = hasHoliday
            ? isNat
              ? "bg-gradient-to-b from-rose-100/70 via-rose-50/40 to-slate-50/70"
              : isCom
              ? "bg-gradient-to-b from-amber-100/70 via-amber-50/40 to-slate-50/70"
              : isRel
              ? "bg-gradient-to-b from-emerald-100/70 via-emerald-50/40 to-slate-50/70"
              : isComem
              ? "bg-gradient-to-b from-slate-200/70 via-slate-100/40 to-slate-50/70"
              : "bg-gradient-to-b from-indigo-100/70 via-indigo-50/40 to-slate-50/70"
            : "";

          return (
            <div
              key={d.key}
              className={`relative flex items-center justify-center gap-2 py-3 border-r border-slate-200 last:border-r-0 overflow-hidden ${headerBg}`}
            >
              {/* Top Accent Line on holiday header */}
              {hasHoliday && (
                <div
                  className={`absolute top-0 left-0 right-0 h-[3px] z-10 ${
                    isNat
                      ? "bg-gradient-to-r from-red-600 via-rose-500 to-red-400"
                      : isCom
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400"
                      : isRel
                      ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400"
                      : isComem
                      ? "bg-gradient-to-r from-slate-700 via-slate-500 to-slate-400"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  }`}
                />
              )}

              {/* Celebratory Diagonal Corner Ribbon wrapping the header cell */}
              {hasHoliday && (
                <div
                  onClick={() => onSelectHoliday ? onSelectHoliday(primaryH, d.key) : onAddPostAtDate(d.key)}
                  title={`${primaryH.name} (${primaryH.tag})`}
                  className="absolute -top-1 -right-1 z-20 h-10 w-10 overflow-hidden cursor-pointer group/ribbon"
                >
                  <div
                    className={`absolute right-[-17px] top-[9px] w-[54px] transform rotate-45 py-0.5 text-center text-[8px] font-black text-white shadow-xs transition-transform group-hover/ribbon:scale-105 select-none ${
                      isNat
                        ? "bg-gradient-to-r from-red-600 to-rose-600"
                        : isCom
                        ? "bg-gradient-to-r from-amber-500 to-orange-600"
                        : isRel
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600"
                        : isComem
                        ? "bg-gradient-to-r from-slate-700 to-slate-900"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600"
                    }`}
                  >
                    {primaryH.flag}
                  </div>
                </div>
              )}

              <span>{d.name}</span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${
                  d.key === todayKey ? "bg-red-500 text-white" : d.key < todayKey ? "text-slate-400" : "text-slate-900"
                }`}
              >
                {d.dateNum}
              </span>
              {hasHoliday && (
                <span
                  title={`${primaryH.name} (${primaryH.tag})`}
                  className="inline-flex items-center gap-1 rounded-full bg-white/90 border border-black/10 px-1.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-2xs cursor-help mr-3"
                >
                  <span>{primaryH.flag}</span>
                  <span className="hidden xl:inline truncate max-w-[65px]">{primaryH.name.split(" ")[0]}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 7 Vertical Day Columns */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-slate-200 min-h-[500px]">
        {days.map((d) => {
          const [y, m, dayNum] = d.key.split("-").map(Number);
          const dayHolidays = holidays.filter((h) => isHolidayOnDate(h, { year: y, month: m - 1, day: dayNum }));
          const dayPosts = posts.filter((p) => p.date === d.key);
          const dayMeetings = meetings.filter((m) => m.date === d.key);
          const dayNotes = notes.filter((n) => n.date === d.key);
          const campaign = campaigns.find((c) => d.key >= c.start_date && d.key <= c.end_date);

          return (
            <DayColumn
              key={d.key}
              day={d}
              todayKey={todayKey}
              campaign={campaign}
              dayHolidays={dayHolidays}
              dayPosts={dayPosts}
              dayMeetings={dayMeetings}
              dayNotes={dayNotes}
              onSelectPost={onSelectPost}
              onSelectHoliday={onSelectHoliday}
              onAddPostAtDate={onAddPostAtDate}
              onSmartFillDate={onSmartFillDate}
              onAddNote={onAddNote}
              onSaveNoteText={onSaveNoteText}
              onNoteColorChange={onNoteColorChange}
              onDeleteNote={onDeleteNote}
            />
          );
        })}
      </div>
    </div>
  );
}
