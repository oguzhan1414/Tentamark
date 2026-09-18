"use client";

import CalendarPostCard from "./CalendarPostCard";
import NoteCard from "./NoteCard";
import { groupCalendarPosts } from "./groupCalendarPosts";
import type { CalendarPost, CalendarNote, CalendarCampaign } from "./types";
import type { MarketingHoliday } from "@/lib/calendar/marketingHolidays";

type Props = {
  dateKey: string;
  posts: CalendarPost[];
  notes: CalendarNote[];
  campaign?: CalendarCampaign;
  holidays?: MarketingHoliday[];
  isPast: boolean;
  onClose: () => void;
  onSelectPost: (post: CalendarPost) => void;
  onSelectHoliday?: (holiday: MarketingHoliday, dateStr: string, angle?: string) => void;
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
import { useLanguage } from "@/context/LanguageContext";

export default function CalendarDayModal({
  dateKey,
  posts,
  notes,
  campaign,
  holidays = [],
  isPast,
  onClose,
  onSelectPost,
  onSelectHoliday,
  onAddPostAtDate,
  onSmartFillDate,
  onAddNote,
  onSaveNoteText,
  onNoteColorChange,
  onDeleteNote,
}: Props) {
  const { t, isEn } = useLanguage();
  const dm = t.dashboard.calendar.dayModal;
  const dateLabel = new Date(`${dateKey}T00:00:00`).toLocaleDateString(isEn ? "en-US" : "tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [y, m, d] = dateKey.split("-").map(Number);
  const now = new Date();
  const targetMs = new Date(y, m - 1, d).getTime();
  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((targetMs - todayMs) / (1000 * 60 * 60 * 24));

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
                <span>{dm.smartFill}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onAddNote(dateKey)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition"
            >
              {dm.addNote}
            </button>
            <button
              type="button"
              onClick={() => onAddPostAtDate(dateKey)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              {dm.schedulePost}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {holidays && holidays.length > 0 && (
            <div className="space-y-3">
              {holidays.map((h) => {
                const isNational = h.category === "national" || h.tag.includes("Milli");
                const isCommercial = h.category === "commercial" || h.tag.includes("İndirim") || h.tag.includes("E-Ticaret");
                const isReligious = h.category === "religious" || h.tag.includes("Dini");
                const isCommemoration = h.category === "commemoration" || h.tag.includes("Anma");

                const cardBg = isNational
                  ? "border-rose-200/90 bg-gradient-to-br from-rose-50/95 via-white to-red-50/30 text-rose-950"
                  : isCommercial
                  ? "border-amber-200/90 bg-gradient-to-br from-amber-50/95 via-white to-orange-50/30 text-amber-950"
                  : isReligious
                  ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/30 text-emerald-950"
                  : isCommemoration
                  ? "border-slate-300 bg-gradient-to-br from-slate-100 via-white to-slate-50 text-slate-900"
                  : "border-indigo-200/90 bg-gradient-to-br from-indigo-50/95 via-white to-purple-50/30 text-indigo-950";

                const badgeBg = isNational
                  ? "bg-rose-100 text-rose-800 border-rose-200"
                  : isCommercial
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : isReligious
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : isCommemoration
                  ? "bg-slate-200 text-slate-800 border-slate-300"
                  : "bg-indigo-100 text-indigo-800 border-indigo-200";

                const btnBg = isNational
                  ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                  : isCommercial
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  : isReligious
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  : isCommemoration
                  ? "bg-gradient-to-r from-slate-800 to-slate-900 hover:bg-black"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700";

                return (
                  <div
                    key={h.id}
                    className={`rounded-2xl border p-4 shadow-xs space-y-3 ${cardBg}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs text-2xl ring-1 ring-black/5">
                          {h.flag}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">{h.name}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`inline-block rounded-md border px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide ${badgeBg}`}>
                              {h.tag}
                            </span>
                            {diffDays === 0 ? (
                              <span className="rounded-full bg-red-600 text-white font-black text-[8.5px] px-2 py-0.5 uppercase tracking-wide animate-pulse">
                                🎉 {dm.today}
                              </span>
                            ) : diffDays === 1 ? (
                              <span className="rounded-full bg-orange-500 text-white font-bold text-[8.5px] px-2 py-0.5 uppercase">
                                ⚡ {dm.tomorrow}
                              </span>
                            ) : diffDays > 1 && diffDays <= 7 ? (
                              <span className="rounded-full bg-amber-500 text-white font-bold text-[8.5px] px-2 py-0.5">
                                🔥 {diffDays} {dm.daysLeft}
                              </span>
                            ) : diffDays > 7 ? (
                              <span className="text-slate-500 font-medium text-[10px]">
                                ⏳ {diffDays} {dm.daysLeft}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {!isPast && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectHoliday ? onSelectHoliday(h, dateKey) : onAddPostAtDate(dateKey);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer shrink-0 ${btnBg}`}
                        >
                          <span>✨</span>
                          <span>{dm.generatePost}</span>
                        </button>
                      )}
                    </div>

                    {/* Content Coverage Status */}
                    {posts.length === 0 ? (
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-300/80 bg-amber-50/90 px-3 py-2 text-xs font-medium text-amber-900 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-600 text-sm">⚠️</span>
                          <span>{dm.noPostsForOccasion}</span>
                        </div>
                        {!isPast && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onSelectHoliday ? onSelectHoliday(h, dateKey) : onAddPostAtDate(dateKey);
                            }}
                            className="font-bold text-amber-700 underline hover:text-amber-900 shrink-0 cursor-pointer text-[11px]"
                          >
                            {dm.planNow}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-300/80 bg-emerald-50/90 px-3 py-2 text-xs font-semibold text-emerald-900 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-600 text-sm">✅</span>
                          <span>{dm.postsReadyForOccasion.replace("{count}", String(posts.length))}</span>
                        </div>
                        <span className="font-bold text-emerald-700 text-[11px]">
                          {dm.ready}
                        </span>
                      </div>
                    )}

                    {/* Marketing Advice */}
                    <div className="rounded-xl bg-white/90 border border-black/5 p-3 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
                      <span className="text-amber-500 shrink-0 text-sm">💡</span>
                      <div className="leading-relaxed">
                        <strong className="text-slate-900 font-bold">{dm.marketingAdvice} </strong>
                        <span className="text-slate-600 italic">{h.advice}</span>
                      </div>
                    </div>

                    {/* Suggested Creative Angles */}
                    {h.suggestedAngles && h.suggestedAngles.length > 0 && !isPast && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <span>🎯</span>
                          <span>{t.dashboard.calendar.suggestedAngles}</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {h.suggestedAngles.map((angle) => (
                            <button
                              key={angle}
                              type="button"
                              onClick={() => {
                                onClose();
                                onSelectHoliday ? onSelectHoliday(h, dateKey, angle) : onAddPostAtDate(dateKey);
                              }}
                              title={`${t.dashboard.calendar.writeWithAngle} "${angle}"`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-black/5 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 cursor-pointer"
                            >
                              <span className="text-rose-500">✦</span>
                              <span>{angle}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

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
            <p className="py-10 text-center text-xs text-slate-400">
              {isEn ? "No posts scheduled for this date yet." : "Bu tarihte henüz bir gönderi yok."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {groupCalendarPosts(posts).map((g) => (
                <CalendarPostCard
                  key={g.key}
                  post={g.hero}
                  otherPlatforms={g.members.slice(1).map((m) => m.platform)}
                  onClick={() => onSelectPost(g.hero)}
                  draggable={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
