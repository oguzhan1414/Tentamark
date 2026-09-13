"use client";

import { useDroppable } from "@dnd-kit/core";
import CalendarPostCard from "./CalendarPostCard";
import NoteCard from "./NoteCard";
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
  onSaveNoteText: (id: string, text: string) => void;
  onNoteColorChange: (id: string, color: string) => void;
  onDeleteNote: (id: string) => void;
};

const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

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
  onSaveNoteText,
  onNoteColorChange,
  onDeleteNote,
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
  onSaveNoteText: (id: string, text: string) => void;
  onNoteColorChange: (id: string, color: string) => void;
  onDeleteNote: (id: string) => void;
}) {
  const isToday = cell.dateKey === todayKey;
  const isPast = cell.dateKey < todayKey;
  const { setNodeRef, isOver } = useDroppable({ id: cell.dateKey, disabled: isPast });
  const hasCampaignStart = campaign?.start_date === cell.dateKey;
  const hasCampaignEnd = campaign?.end_date === cell.dateKey;

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex min-h-[140px] flex-col border-b border-r border-slate-200 p-2 transition-colors ${
        isOver ? "bg-rose-50/50" : cell.inCurrentMonth ? (isPast ? "bg-slate-50/70" : "bg-white") : "bg-slate-50/40"
      } ${isToday ? "ring-2 ring-inset ring-rose-400" : ""}`}
    >
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
            isToday
              ? "bg-[#FA5252] text-white font-bold"
              : cell.inCurrentMonth
                ? isPast
                  ? "text-slate-400"
                  : "text-slate-800"
                : "text-slate-400"
          }`}
        >
          {cell.day}
        </span>

        {/* Quick add + menu on hover — never shown for past dates: nothing
            gets scheduled or freshly noted on a day that's already gone. */}
        {!isPast && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
            {onSmartFillDate && (
              <button
                type="button"
                onClick={() => onSmartFillDate(cell.dateKey)}
                title="Bu günü AI ile doldur"
                className="flex h-5 w-5 items-center justify-center rounded-md border border-rose-200 bg-rose-50 text-rose-700 shadow-2xs hover:bg-[#FA5252] hover:text-white transition cursor-pointer"
              >
                <span className="text-[10px] leading-none">✨</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onAddNote(cell.dateKey)}
              title="Bu tarihe not ekle"
              className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-2xs hover:bg-amber-50 hover:text-amber-600 transition cursor-pointer"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onAddPostAtDate(cell.dateKey)}
              title="Bu tarihe gönderi planla"
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
          className={`mt-1.5 mb-1 flex items-center gap-1 overflow-hidden text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 ${
            hasCampaignStart ? "rounded-l-md" : ""
          } ${hasCampaignEnd ? "rounded-r-md" : ""}`}
        >
          <span className="text-emerald-600">✦</span>
          <span className="truncate">{campaign.name}</span>
        </div>
      )}

      {/* Notes */}
      {dayNotes.length > 0 && (
        <div className="mt-1 flex flex-col gap-1.5">
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
        </div>
      )}

      {/* Scheduled Posts in Cell */}
      <div className="mt-1 flex flex-col gap-2">
        {dayPosts.map((p) => (
          <CalendarPostCard key={p.id} post={p} onClick={() => onSelectPost(p)} draggable={!isPast} />
        ))}
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
  onSaveNoteText,
  onNoteColorChange,
  onDeleteNote,
}: Props) {
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

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-white">
      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50 text-center text-xs font-semibold text-slate-500">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Rows */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr border-l border-t border-slate-200">
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
