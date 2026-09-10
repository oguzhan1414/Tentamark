"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { STATUS_LABEL, deriveStatus, type UIStatus } from "@/lib/contentStatus";
import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";

type Row = {
  id: string;
  platform: PlatformName;
  caption: string;
  scheduled_at: string;
  status: string;
  content: {
    id: string;
    title: string;
    status: string;
    imageUrl: string | null;
    metadata?: {
      hook?: string;
      visualPrompt?: string;
      pillar?: string;
    } | null;
  } | null;
};

function firstImageUrl(contentMedia: unknown): string | null {
  const rows = Array.isArray(contentMedia) ? contentMedia : contentMedia ? [contentMedia] : [];
  for (const row of rows as { media?: unknown }[]) {
    const media = Array.isArray(row.media) ? row.media[0] : row.media;
    const url = (media as { file_url?: string } | undefined)?.file_url;
    if (url) return url;
  }
  return null;
}

function parseCoreIdea(coreIdea?: string | null): { hook: string | null; visualPrompt: string | null } {
  if (!coreIdea) return { hook: null, visualPrompt: null };
  const hookMatch = coreIdea.match(/Kanca(?:\s*\(Hook\))?:\s*([^\n]+)/i);
  const visualMatch = coreIdea.match(/Görsel\/Video Konsepti:\s*([\s\S]+)/i);
  return {
    hook: hookMatch ? hookMatch[1].trim() : null,
    visualPrompt: visualMatch ? visualMatch[1].trim() : (!hookMatch ? coreIdea : null),
  };
}

function startOfWeek(offset: number) {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Hours to display in the grid (from 08:00 to 23:00)
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // [8, 9, ..., 23]

// Best times heatmap activity weight (0 to 1) based on social media audience benchmarks
// Peak hours are usually 18:00 - 22:00, with secondary peaks around 12:00 - 14:00
function getHeatmapIntensity(hour: number, dayIdx: number): number {
  if (hour >= 18 && hour <= 21) {
    return dayIdx === 1 || dayIdx === 3 || dayIdx === 6 ? 0.48 : 0.38; // Salı, Perşembe, Pazar akşamları pik
  }
  if (hour >= 12 && hour <= 14) {
    return 0.22; // Öğle molası
  }
  if (hour >= 15 && hour <= 17) {
    return 0.16; // İkindi
  }
  if (hour >= 22 && hour <= 23) {
    return 0.26; // Gece akışı
  }
  return 0.04; // Düşük saatler
}

export default function CalendarPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState<"calendar" | "list" | "library" | "autolists" | "deleted" | "flows">("calendar");
  const [weekIndex, setWeekIndex] = useState(0);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<Row | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBestTimes, setShowBestTimes] = useState(true);

  // Time & timezone
  const [currentTimeStr, setCurrentTimeStr] = useState("19:15");
  const [currentHourMinute, setCurrentHourMinute] = useState({ hour: 19, minute: 15 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      );
      setCurrentHourMinute({ hour: now.getHours(), minute: now.getMinutes() });
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const weekStart = useMemo(() => startOfWeek(weekIndex), [weekIndex]);

  const days = useMemo(() => {
    const dayNamesTR = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return {
        label: dayNamesTR[i],
        dayNum: date.getDate(),
        date,
      };
    });
  }, [weekStart]);

  // Load calendar posts from Supabase
  useEffect(() => {
    let ignore = false;

    (async () => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const { data, error } = await supabase
        .from("content_platforms")
        .select(
          "id, platform, caption, scheduled_at, status, content!inner(id, title, status, category, core_idea, brand_id, content_media(media(file_url)))"
        )
        .eq("content.brand_id", brand.id)
        .gte("scheduled_at", weekStart.toISOString())
        .lt("scheduled_at", weekEnd.toISOString())
        .order("scheduled_at", { ascending: true });

      if (ignore) return;

      if (error) {
        console.error("İçerik takvimi yüklenemedi:", error.message);
        setRows([]);
        return;
      }

      setRows(
        (data ?? []).map((r) => {
          const c = Array.isArray(r.content) ? r.content[0] : r.content;
          const { hook, visualPrompt } = parseCoreIdea(c?.core_idea);
          return {
            ...r,
            content: c
              ? {
                  id: c.id,
                  title: c.title,
                  status: c.status,
                  imageUrl: firstImageUrl(c.content_media),
                  metadata: {
                    hook: hook ?? undefined,
                    visualPrompt: visualPrompt ?? undefined,
                    pillar: c.category ?? undefined,
                  },
                }
              : null,
          };
        }) as Row[]
      );
    })();

    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, weekStart, refreshKey]);

  const loading = rows === null;
  const loadedRows = useMemo(() => rows ?? [], [rows]);

  // Filtered rows based on search
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return loadedRows;
    const q = searchQuery.toLowerCase();
    return loadedRows.filter(
      (r) =>
        r.content?.title.toLowerCase().includes(q) ||
        r.caption.toLowerCase().includes(q) ||
        r.platform.toLowerCase().includes(q)
    );
  }, [loadedRows, searchQuery]);

  // Map posts into day and hour buckets
  const gridMap = useMemo(() => {
    // key: `${dayIdx}_${hour}` -> array of Rows
    const map = new Map<string, Row[]>();
    for (const row of filteredRows) {
      const d = new Date(row.scheduled_at);
      const dayDiff = Math.floor((d.getTime() - weekStart.getTime()) / 86400000);
      if (dayDiff >= 0 && dayDiff < 7) {
        const hour = d.getHours();
        const key = `${dayDiff}_${hour}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(row);
      }
    }
    return map;
  }, [filteredRows, weekStart]);

  // Post counts
  const counts = useMemo(() => {
    let published = 0,
      scheduled = 0,
      review = 0;
    for (const row of loadedRows) {
      const s = deriveStatus(row.content?.status ?? "DRAFT", row.status);
      if (s === "published") published++;
      else if (s === "scheduled") scheduled++;
      else if (s === "review") review++;
    }
    return { published, scheduled, review };
  }, [loadedRows]);

  const today = new Date();
  const rangeLabel = `${days[0].date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} - ${days[6].date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}`;

  async function approve(contentId: string) {
    const { error } = await supabase.from("content").update({ status: "APPROVED" }).eq("id", contentId);
    if (error) {
      console.error("Onaylanamadı:", error.message);
      return;
    }
    setSelectedPost(null);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-full space-y-5 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* 1. Top Subnav Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 pb-3 gap-4">
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("calendar")}
            className={`relative px-3 py-1.5 transition ${
              activeTab === "calendar"
                ? "text-slate-900 font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Takvim
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`relative px-3 py-1.5 transition ${
              activeTab === "list"
                ? "text-slate-900 font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Liste
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-slate-800 transition"
          >
            <span>İçerik Kütüphanesi</span>
            <span className="text-amber-500 text-xs">💛</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("autolists")}
            className="px-3 py-1.5 text-slate-500 hover:text-slate-800 transition"
          >
            Otomasyon Listeleri
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("deleted")}
            className="px-3 py-1.5 text-slate-500 hover:text-slate-800 transition"
          >
            Silinen Gönderiler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("flows")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-800 transition"
          >
            <span>Akışlar</span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
              Yeni
            </span>
            <span className="text-amber-500 text-xs">💛</span>
          </button>
        </nav>

        {/* Timezone & Clock */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>
            {currentTimeStr} · Europe/Istanbul
          </span>
          <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 2. Top Banner Card ("Daha yüksek bir plana mı ihtiyacınız var?") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:px-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-4">
          {/* Neon lime diamond circle icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E4FF39] text-slate-900 shadow-sm shadow-[#E4FF39]/30">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 3h12l4 6-10 12L2 9l4-6z M2 9h20 M12 21L8 9 M12 21l4-12 M6 3l2 6 M18 3l-2 6"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 sm:text-base">
              Daha yüksek bir plana mı ihtiyacınız var?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bu ay planınızdaki 20 kullanılabilir gönderiden <b className="text-slate-800">{counts.published}</b> tanesini paylaştınız. Limiti artırmak için planınızı yükseltin.
            </p>
          </div>
        </div>

        <Link
          href="/pricing"
          className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 shrink-0"
        >
          Planı yükselt
        </Link>
      </div>

      {/* 3. Toolbar Row (Search, Navigation, Heatmap Toggle, Create Post) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Search Bar */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3.5 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Center & Right Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Week navigator cluster */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setWeekIndex(0)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Bu hafta
            </button>
            <button
              type="button"
              onClick={() => setWeekIndex((w) => w - 1)}
              aria-label="Önceki hafta"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-800">
              <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
                <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
                <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
              </svg>
              <span>{rangeLabel}</span>
            </div>
            <button
              type="button"
              onClick={() => setWeekIndex((w) => w + 1)}
              aria-label="Sonraki hafta"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Filter button */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 transition"
            title="Filtrele"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>

          {/* Best times toggle button */}
          <button
            type="button"
            onClick={() => setShowBestTimes(!showBestTimes)}
            title="Sektör geneli platform davranış kalıplarına dayanır — markanıza özel veri değildir"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xs transition ${
              showBestTimes
                ? "border-pink-300 bg-pink-50 text-pink-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <PlatformIcon name="instagram" className="h-3.5 w-3.5" />
            <span>En iyi zamanlar (genel)</span>
            <span className="text-[10px]">▼</span>
          </button>

          {/* Media gallery button */}
          <Link
            href="/dashboard/posts"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 transition"
            title="Medya Galerisi"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
              <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2} />
              <polyline points="21 15 16 10 5 21" strokeWidth={2} />
            </svg>
          </Link>

          {/* Create View */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <span>🪄 Görünüm oluştur</span>
            <span className="text-amber-500 text-xs">💛</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>

          {/* Primary Create Post Button */}
          <Link
            href="/dashboard/compose"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Gönderi oluştur</span>
          </Link>
        </div>
      </div>

      {/* 4. Weekly Hour-by-Hour Timeline Grid with Best Times Heatmap */}
      {loading ? (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400">
          Takvim yükleniyor...
        </div>
      ) : activeTab === "list" ? (
        /* LIST VIEW */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="font-display text-base font-bold text-slate-900 mb-4">Bu Haftanın Gönderi Listesi</h3>
          {filteredRows.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Bu hafta için planlanmış gönderi bulunamadı.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRows.map((row) => {
                const status = deriveStatus(row.content?.status ?? "DRAFT", row.status);
                return (
                  <div
                    key={row.id}
                    onClick={() => setSelectedPost(row)}
                    className="flex items-center justify-between py-3.5 hover:bg-slate-50/80 px-3 rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <PlatformIcon name={row.platform} className="h-8 w-8 rounded-lg" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{row.content?.title || "(Başlıksız)"}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{row.caption}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(row.scheduled_at).toLocaleString("tr-TR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase font-semibold ${STATUS_LABEL[status].className}`}>
                        {STATUS_LABEL[status].label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* CALENDAR GRID VIEW */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
              {/* Header Days Row */}
              <div className="grid grid-cols-[70px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/60 sticky top-0 z-20">
                {/* Empty corner cell */}
                <div className="border-r border-slate-200 p-2.5 text-center font-mono text-[10px] text-slate-400 uppercase font-semibold">
                  Saat
                </div>

                {/* 7 Days Columns */}
                {days.map((day, dayIdx) => {
                  const isToday = day.date.toDateString() === today.toDateString();
                  return (
                    <div
                      key={dayIdx}
                      className={`border-r border-slate-200 p-2.5 text-center transition ${
                        isToday
                          ? "bg-slate-950 text-white font-bold"
                          : "text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                        <span className={`font-display text-sm ${isToday ? "text-white font-extrabold" : "text-slate-900"}`}>
                          {day.dayNum}
                        </span>
                        <span className={`capitalize ${isToday ? "text-slate-200" : "text-slate-600"}`}>
                          {day.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid Body: Rows for each Hour */}
              <div className="relative divide-y divide-slate-100">
                {HOURS.map((hour) => {
                  const hourLabel = `${String(hour).padStart(2, "0")}:00`;

                  return (
                    <div
                      key={hour}
                      className="grid grid-cols-[70px_repeat(7,1fr)] min-h-[64px] group"
                    >
                      {/* Hour Axis Label */}
                      <div className="border-r border-slate-200 bg-slate-50/40 p-2 text-right font-mono text-[11px] text-slate-400 select-none">
                        {hourLabel}
                      </div>

                      {/* 7 Day Slots for this Hour */}
                      {days.map((day, dayIdx) => {
                        const isToday = day.date.toDateString() === today.toDateString();
                        const key = `${dayIdx}_${hour}`;
                        const postsInSlot = gridMap.get(key) || [];
                        const intensity = showBestTimes ? getHeatmapIntensity(hour, dayIdx) : 0;

                        // Heatmap pink background style
                        const heatmapBg =
                          intensity > 0
                            ? `rgba(244, 114, 182, ${intensity})`
                            : undefined;

                        return (
                          <div
                            key={dayIdx}
                            style={{ backgroundColor: heatmapBg }}
                            className={`relative border-r border-slate-100 p-1.5 transition-colors hover:bg-slate-100/40 ${
                              isToday ? "ring-1 ring-inset ring-indigo-500/20" : ""
                            }`}
                          >
                            {/* Current Time Indicator Bar if today and current hour */}
                            {isToday && currentHourMinute.hour === hour && (
                              <div
                                style={{ top: `${(currentHourMinute.minute / 60) * 100}%` }}
                                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                              >
                                <span className="h-2 w-2 -ml-1 rounded-full bg-pink-500 ring-2 ring-white"></span>
                                <span className="h-0.5 w-full bg-pink-500"></span>
                              </div>
                            )}

                            {/* Scheduled Posts in this Slot */}
                            <div className="flex flex-col gap-1.5">
                              {postsInSlot.map((post) => {
                                const status = deriveStatus(post.content?.status ?? "DRAFT", post.status);
                                return (
                                  <button
                                    key={post.id}
                                    type="button"
                                    onClick={() => setSelectedPost(post)}
                                    className="group/card relative flex items-start gap-2 rounded-xl border border-slate-200/90 bg-white/95 p-2 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-400"
                                  >
                                    {/* Thumbnail or Platform Tile */}
                                    {post.content?.imageUrl ? (
                                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-100 shadow-2xs">
                                        <Image
                                          src={post.content.imageUrl}
                                          alt=""
                                          fill
                                          sizes="36px"
                                          className="object-cover"
                                        />
                                        <div className="absolute bottom-0 right-0 bg-white/90 p-0.5 rounded-tl">
                                          <PlatformIcon name={post.platform} className="h-2.5 w-2.5" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                        <PlatformIcon name={post.platform} className="h-4 w-4" />
                                      </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-mono text-[10px] font-bold text-slate-700">
                                          {new Date(post.scheduled_at).toLocaleTimeString("tr-TR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                        <span
                                          className={`rounded-full px-1.5 py-0.2 text-[8px] font-bold uppercase ${STATUS_LABEL[status].className}`}
                                        >
                                          {STATUS_LABEL[status].label}
                                        </span>
                                      </div>
                                      <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-800 group-hover/card:text-indigo-600">
                                        {post.content?.metadata?.hook || post.content?.title || "(Başlıksız)"}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Empty Slot Quick Add Link on Hover */}
                            {postsInSlot.length === 0 && (
                              <Link
                                href={`/dashboard/compose?date=${day.date.toISOString()}&hour=${hour}`}
                                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-indigo-50/60 backdrop-blur-2xs transition rounded-lg m-0.5 text-xs font-bold text-indigo-600"
                              >
                                + Ekle
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Slide-out Detailed Drawer / Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => setSelectedPost(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <PlatformIcon name={selectedPost.platform} className="h-9 w-9 rounded-xl shadow-xs" />
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {platformLabel(selectedPost.platform)}
                  </h3>
                  <p className="font-mono text-xs text-slate-500">
                    {new Date(selectedPost.scheduled_at).toLocaleString("tr-TR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                aria-label="Kapat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Status & Pillar Tag */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(() => {
                const status = deriveStatus(selectedPost.content?.status ?? "DRAFT", selectedPost.status);
                return (
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-xs uppercase font-bold ${STATUS_LABEL[status].className}`}
                  >
                    {STATUS_LABEL[status].label}
                  </span>
                );
              })()}

              {selectedPost.content?.metadata?.pillar && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {selectedPost.content.metadata.pillar}
                </span>
              )}
            </div>

            {/* Image Preview */}
            {selectedPost.content?.imageUrl ? (
              <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                <Image
                  src={selectedPost.content.imageUrl}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
            ) : selectedPost.content?.metadata?.visualPrompt ? (
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">
                  🎨 Görsel / Video Konsepti
                </span>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                  {selectedPost.content.metadata.visualPrompt}
                </p>
              </div>
            ) : null}

            {/* 2-second Hook */}
            {selectedPost.content?.metadata?.hook && (
              <div className="mt-4 rounded-2xl border border-amber-200/60 bg-amber-50/60 p-3.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                  🪝 2 Saniyelik Kanca (Hook)
                </span>
                <p className="mt-1 text-xs font-semibold text-slate-900 leading-snug">
                  &ldquo;{selectedPost.content.metadata.hook}&rdquo;
                </p>
              </div>
            )}

            {/* Post Title & Caption */}
            <div className="mt-4 space-y-2">
              <h4 className="font-display text-base font-bold text-slate-900">
                {selectedPost.content?.title || "(Başlıksız)"}
              </h4>
              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {selectedPost.caption}
              </p>
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-auto flex items-center gap-2.5 pt-6 border-t border-slate-100">
              {deriveStatus(selectedPost.content?.status ?? "DRAFT", selectedPost.status) === "review" &&
                selectedPost.content && (
                  <button
                    type="button"
                    onClick={() => approve(selectedPost.content!.id)}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    ✓ Onayla
                  </button>
                )}
              <Link
                href="/dashboard/compose"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                Düzenle
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
