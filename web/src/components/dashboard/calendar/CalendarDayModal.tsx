"use client";

import CalendarPostCard from "./CalendarPostCard";
import NoteCard from "./NoteCard";
import type { CalendarPost, CalendarNote, CalendarCampaign } from "./types";

type Props = {
  dateKey: string;
  posts: CalendarPost[];
  notes: CalendarNote[];
  campaign?: CalendarCampaign;
  isPast: boolean;
  onClose: () => void;
  onSelectPost: (post: CalendarPost) => void;
  onAddPostAtDate: (dateStr: string) => void;
  onSmartFillDate?: (dateStr: string) => void;
  onAddNote: (dateStr: string) => void;
  onSaveNoteText: (id: string, text: string) => void;
  onNoteColorChange: (id: string, color: string) => void;
  onDeleteNote: (id: string) => void;
};

/*
  A day's full agenda — the month grid only ever shows a couple of posts per
  cell (CalendarMonthView caps it) so a cell's height can never depend on how
  much content landed on that day; this is where "the rest" actually lives,
  with real room instead of a cramped internal scrollbar that broke down as
  more content piled up.
*/
export default function CalendarDayModal({
  dateKey,
  posts,
  notes,
  campaign,
  isPast,
  onClose,
  onSelectPost,
  onAddPostAtDate,
  onSmartFillDate,
  onAddNote,
  onSaveNoteText,
  onNoteColorChange,
  onDeleteNote,
}: Props) {
  const dateLabel = new Date(`${dateKey}T00:00:00`).toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <span className="text-sm font-bold text-slate-900 capitalize">{dateLabel}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {!isPast && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3">
            {onSmartFillDate && (
              <button
                type="button"
                onClick={() => onSmartFillDate(dateKey)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
              >
                <span>✨</span>
                <span>AI ile Doldur</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onAddNote(dateKey)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition"
            >
              + Not
            </button>
            <button
              type="button"
              onClick={() => onAddPostAtDate(dateKey)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              + Gönderi Planla
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {campaign && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-100/80 px-3 py-1.5 text-xs font-bold text-emerald-800">
              <span className="text-emerald-600">✦</span>
              <span className="truncate">{campaign.name}</span>
            </div>
          )}

          {notes.length > 0 && (
            <div className="space-y-1.5">
              {notes.map((n) => (
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

          {posts.length === 0 ? (
            <p className="py-10 text-center text-xs text-slate-400">Bu tarihte henüz bir gönderi yok.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {posts.map((p) => (
                <CalendarPostCard key={p.id} post={p} onClick={() => onSelectPost(p)} draggable={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
