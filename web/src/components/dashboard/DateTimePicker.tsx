"use client";

import { useState } from "react";

function startOfMonthGrid(year: number, month: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDayOfWeek);
  gridStart.setHours(0, 0, 0, 0);
  return gridStart;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseValue(value: string): { date: Date; hh: string; mm: string } {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) {
    const now = new Date();
    return { date: now, hh: pad(now.getHours()), mm: pad(now.getMinutes()) };
  }
  return { date: d, hh: pad(d.getHours()), mm: pad(d.getMinutes()) };
}

function toDatetimeLocal(d: Date, hh: string, mm: string): string {
  return `${toDateKey(d)}T${hh}:${mm}`;
}

const QUICK_TIMES = ["09:00", "10:00", "12:00", "15:00", "18:00", "20:00"];

/*
  Replaces the bare `<input type="datetime-local">` (a clunky, inconsistently
  rendered native widget across browsers) with a single popover that reuses
  the same calendar-grid language as DateRangePicker, plus a typable time
  field and quick-pick chips for common posting hours.
*/
export default function DateTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const parsed = parseValue(value);
  const [viewYear, setViewYear] = useState(parsed.date.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.date.getMonth());

  const selectedKey = toDateKey(parsed.date);
  const timeValue = `${parsed.hh}:${parsed.mm}`;

  function pickDay(d: Date) {
    onChange(toDatetimeLocal(d, parsed.hh, parsed.mm));
  }

  function setTime(hh: string, mm: string) {
    onChange(toDatetimeLocal(parsed.date, hh, mm));
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const gridStart = startOfMonthGrid(viewYear, viewMonth);
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
  const label = `${parsed.date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })} · ${timeValue}`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-bg px-3 py-1.5 font-mono text-xs font-medium text-ink transition hover:border-accent/40"
      >
        <svg className="h-3.5 w-3.5 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
          <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
          <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
          <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
        </svg>
        <span>{label}</span>
      </button>

      {open && (
        <>
          <button type="button" aria-label="Kapat" onClick={() => setOpen(false)} className="fixed inset-0 z-20" />
          <div className="absolute right-0 top-full z-30 mt-2 w-max rounded-2xl border border-line bg-surface p-4 shadow-2xl">
            <div className="flex items-start gap-4">
              {/* Calendar column */}
              <div className="w-56">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="Önceki ay"
                    className="cursor-pointer rounded-lg p-1 text-faint transition hover:bg-bg hover:text-ink"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-display text-sm font-bold capitalize text-ink">{monthLabel}</span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="Sonraki ay"
                    className="cursor-pointer rounded-lg p-1 text-faint transition hover:bg-bg hover:text-ink"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-7 gap-y-1 text-center">
                  {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"].map((d, i) => (
                    <span key={`${d}-${i}`} className="font-mono text-[10px] font-semibold uppercase text-faint">
                      {d}
                    </span>
                  ))}
                  {days.map((d, idx) => {
                    const key = toDateKey(d);
                    const inMonth = d.getMonth() === viewMonth;
                    const isSelected = key === selectedKey;
                    return (
                      <button
                        key={idx}
                        type="button"
                        tabIndex={inMonth ? 0 : -1}
                        onClick={() => inMonth && pickDay(d)}
                        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition ${
                          !inMonth
                            ? "invisible"
                            : isSelected
                              ? "cursor-pointer bg-accent font-bold text-bg"
                              : "cursor-pointer text-ink hover:bg-bg"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time column */}
              <div className="w-28 shrink-0 border-l border-line pl-4">
                <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-faint">
                  Saat
                </label>
                <input
                  type="time"
                  value={timeValue}
                  onChange={(e) => {
                    const [hh, mm] = e.target.value.split(":");
                    if (hh && mm) setTime(hh, mm);
                  }}
                  className="mt-1.5 w-full rounded-lg border border-line bg-bg px-2.5 py-1.5 font-mono text-xs text-ink focus:border-accent focus:outline-none"
                />
                <div className="mt-2 flex flex-col gap-1">
                  {QUICK_TIMES.map((t) => {
                    const active = timeValue === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          const [hh, mm] = t.split(":");
                          setTime(hh, mm);
                        }}
                        className={`w-full cursor-pointer rounded-lg border px-2 py-1 font-mono text-[10px] font-semibold transition ${
                          active
                            ? "border-accent bg-accent-subtle text-accent-text"
                            : "border-line text-muted hover:border-accent/40"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full cursor-pointer rounded-full bg-ink py-2 font-body text-xs font-semibold text-bg transition hover:bg-accent"
            >
              Tamam
            </button>
          </div>
        </>
      )}
    </div>
  );
}
