"use client";

import { useDroppable } from "@dnd-kit/core";
import { useLanguage } from "@/context/LanguageContext";
import CalendarPostCard from "./CalendarPostCard";
import NoteCard from "./NoteCard";
import { groupCalendarPosts } from "./groupCalendarPosts";
import type { CalendarPost, CalendarMeeting, CalendarNote, CalendarCampaign } from "./types";

type Props = {
  weekStart: Date;
  posts: CalendarPost[];
  meetings: CalendarMeeting[];
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

function dateKey(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function DayColumn({
  day,
  todayKey,
  campaign,
  dayPosts,
  dayMeetings,
  dayNotes,
  onSelectPost,
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
  dayPosts: CalendarPost[];
  dayMeetings: CalendarMeeting[];
  dayNotes: CalendarNote[];
  onSelectPost: (post: CalendarPost) => void;
  onAddPostAtDate: (dateStr: string) => void;
  onSmartFillDate?: (dateStr: string) => void;
  onAddNote: (dateStr: string) => void;
  onSaveNoteText: (id: string, text: string) => void;
  onNoteColorChange: (id: string, color: string) => void;
  onDeleteNote: (id: string) => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.calendar;
  const isPast = day.key < todayKey;
  const { setNodeRef, isOver } = useDroppable({ id: day.key, disabled: isPast });

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex flex-col gap-3 p-3 transition-colors ${
        isOver ? "bg-rose-50/50" : isPast ? "bg-slate-50/60" : "hover:bg-slate-50/40"
      }`}
    >
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
          draggable={!isPast && g.hero.postStatus !== "PUBLISHED"}
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
  todayKey,
  onSelectPost,
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
        {days.map((d) => (
          <div key={d.key} className="flex items-center justify-center gap-1.5 py-3 border-r border-slate-200 last:border-r-0">
            <span>{d.name}</span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs ${
                d.key === todayKey ? "bg-red-500 text-white" : d.key < todayKey ? "text-slate-400" : "text-slate-900"
              }`}
            >
              {d.dateNum}
            </span>
          </div>
        ))}
      </div>

      {/* 7 Vertical Day Columns */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-slate-200 min-h-[500px]">
        {days.map((d) => {
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
              dayPosts={dayPosts}
              dayMeetings={dayMeetings}
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
