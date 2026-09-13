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

function toISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function MonthGrid({
  year,
  month,
  startISO,
  endISO,
  hoverISO,
  onPick,
  onHover,
}: {
  year: number;
  month: number;
  startISO: string | null;
  endISO: string | null;
  hoverISO: string | null;
  onPick: (iso: string) => void;
  onHover: (iso: string | null) => void;
}) {
  const gridStart = startOfMonthGrid(year, month);
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
  const label = new Date(year, month, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  // While only a start is picked, hovering a later date previews the range
  // it would become — same "live range preview" feel the reference had.
  const rangeEnd = endISO ?? hoverISO;
  const lo = startISO && rangeEnd ? (startISO < rangeEnd ? startISO : rangeEnd) : null;
  const hi = startISO && rangeEnd ? (startISO < rangeEnd ? rangeEnd : startISO) : null;

  return (
    <div>
      <p className="mb-2 text-center font-display text-sm font-bold capitalize text-slate-900">{label}</p>
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"].map((d, i) => (
          <span key={`${d}-${i}`} className="pb-1 font-mono text-[10px] font-semibold uppercase text-slate-400">
            {d}
          </span>
        ))}
        {days.map((d, idx) => {
          const iso = toISODate(d);
          const inMonth = d.getMonth() === month;
          const isEdge = iso === startISO || iso === endISO;
          const inRange = lo !== null && hi !== null && iso > lo && iso < hi;
          return (
            <button
              key={idx}
              type="button"
              tabIndex={inMonth ? 0 : -1}
              onClick={() => inMonth && onPick(iso)}
              onMouseEnter={() => inMonth && onHover(iso)}
              onMouseLeave={() => onHover(null)}
              className={`h-7 w-7 rounded-full text-xs font-medium transition ${
                !inMonth
                  ? "invisible"
                  : `cursor-pointer ${
                      isEdge
                        ? "bg-[#FA5252] font-bold text-white"
                        : inRange
                          ? "bg-rose-50 text-rose-700"
                          : "text-slate-700 hover:bg-slate-100"
                    }`
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/*
  Dual-month range picker for the campaign create/edit form. Click flow:
  first click sets the start (clears any previous end), second click on or
  after the start sets the end and the range is complete; a click before the
  current start restarts the range from there instead of erroring.
*/
export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  onClose,
}: {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  onClose: () => void;
}) {
  const base = startDate ? new Date(startDate) : new Date();
  const [viewYear, setViewYear] = useState(base.getFullYear());
  const [viewMonth, setViewMonth] = useState(base.getMonth());
  const [hoverISO, setHoverISO] = useState<string | null>(null);

  const secondMonth = viewMonth === 11 ? 0 : viewMonth + 1;
  const secondYear = viewMonth === 11 ? viewYear + 1 : viewYear;

  function pick(iso: string) {
    if (!startDate || (startDate && endDate)) {
      onChange(iso, "");
    } else if (iso < startDate) {
      onChange(iso, "");
    } else {
      onChange(startDate, iso);
    }
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

  return (
    <div className="absolute left-0 top-full z-30 mt-2 w-max rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-5">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Önceki ay"
          className="mt-1 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <MonthGrid
          year={viewYear}
          month={viewMonth}
          startISO={startDate || null}
          endISO={endDate || null}
          hoverISO={hoverISO}
          onPick={pick}
          onHover={setHoverISO}
        />
        <MonthGrid
          year={secondYear}
          month={secondMonth}
          startISO={startDate || null}
          endISO={endDate || null}
          hoverISO={hoverISO}
          onPick={pick}
          onHover={setHoverISO}
        />
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Sonraki ay"
          className="mt-1 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="font-mono text-xs text-slate-500">
          {startDate ? new Date(startDate).toLocaleDateString("tr-TR") : "Başlangıç"} →{" "}
          {endDate ? new Date(endDate).toLocaleDateString("tr-TR") : "Bitiş"}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg bg-[#FA5252] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#E03131]"
        >
          Tamam
        </button>
      </div>
    </div>
  );
}
