"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const COLORS: Record<string, string> = {
  amber: "#FDE68A",
  blue: "#BFDBFE",
  rose: "#FECDD3",
  emerald: "#A7F3D0",
  slate: "#E2E8F0",
};

/*
  Two visual states, one text source of truth: a truncated read view (click
  to open) and an editing view (auto-focused textarea, scrolls internally
  instead of growing the day cell forever). Deliberately still only ONE
  transition in (click) and ONE transition out (blur-to-save) — the earlier
  open/close version had a race between blur-to-save and its add/edit state
  machine, and adding more transition points here would risk the same bug.
*/
export default function NoteCard({
  id,
  initialText,
  color,
  onSaveText,
  onColorChange,
  onDelete,
}: {
  id: string;
  initialText: string;
  color: string;
  onSaveText: (id: string, text: string) => void;
  onColorChange: (id: string, color: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.calendar;
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  return (
    <div
      className="group relative rounded-lg border border-black/5 p-2 text-[11px] shadow-2xs"
      style={{ backgroundColor: COLORS[color] ?? COLORS.amber }}
      onClick={(e) => e.stopPropagation()}
    >
      {isEditing ? (
        <textarea
          ref={(node) => {
            textareaRef.current = node;
            node?.focus();
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            if (text !== initialText) onSaveText(id, text);
          }}
          rows={3}
          placeholder={c.addNotePlaceholder}
          className="max-h-32 w-full resize-none overflow-y-auto bg-transparent text-[11px] leading-snug text-slate-800 placeholder-slate-500/70 outline-none! focus:outline-none!"
        />
      ) : (
        <p
          onClick={() => setIsEditing(true)}
          className="line-clamp-3 min-h-[2.6em] cursor-text whitespace-pre-wrap text-[11px] leading-snug text-slate-800"
        >
          {text || <span className="text-slate-500/70">{c.addNotePlaceholder}</span>}
        </p>
      )}
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Object.entries(COLORS).map(([key, hex]) => (
            <button
              key={key}
              type="button"
              onClick={() => onColorChange(id, key)}
              aria-label={key}
              className={`h-3 w-3 shrink-0 cursor-pointer rounded-full border transition ${
                color === key ? "border-slate-900" : "border-white/70 hover:border-slate-400"
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => onDelete(id)}
          title={c.deleteNote}
          className="cursor-pointer text-slate-500 opacity-0 transition hover:text-red-600 group-hover:opacity-100"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
