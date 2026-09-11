"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { deriveStatus, type UIStatus } from "@/lib/contentStatus";

// English display copy for this page only — @/lib/contentStatus's own
// STATUS_LABEL is shared with Turkish-language pages, so it stays untouched;
// this is a local override just for the English screenshot pass.
const STATUS_LABEL: Record<UIStatus, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-mint/10 text-mint" },
  scheduled: { label: "Scheduled", className: "bg-accent-subtle text-accent-text" },
  review: { label: "Needs Review", className: "bg-coral/10 text-coral-bright" },
  failed: { label: "Failed", className: "bg-coral-bright/10 text-coral-bright" },
};
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
    imageIsVideo: boolean;
    metadata?: {
      hook?: string;
      visualPrompt?: string;
      pillar?: string;
    } | null;
  } | null;
};

type GroupedPlatform = {
  id: string;
  platform: PlatformName;
  caption: string;
  status: string;
  uiStatus: UIStatus;
};

type GroupedPost = {
  id: string;
  contentId: string;
  title: string;
  scheduled_at: string;
  imageUrl: string | null;
  imageIsVideo: boolean;
  metadata?: {
    hook?: string;
    visualPrompt?: string;
    pillar?: string;
  } | null;
  overallStatus: UIStatus;
  platforms: GroupedPlatform[];
  rawRows: Row[];
};

type MediaRow = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
};

function firstMedia(contentMedia: unknown): { url: string; isVideo: boolean } | null {
  const rows = Array.isArray(contentMedia) ? contentMedia : contentMedia ? [contentMedia] : [];
  for (const row of rows as { media?: unknown }[]) {
    const media = Array.isArray(row.media) ? row.media[0] : row.media;
    const typed = media as { file_url?: string; file_type?: string } | undefined;
    if (typed?.file_url) {
      return { url: typed.file_url, isVideo: (typed.file_type ?? "").startsWith("video/") };
    }
  }
  return null;
}

function parseCoreIdea(coreIdea?: string | null): { hook: string | null; visualPrompt: string | null } {
  if (!coreIdea) return { hook: null, visualPrompt: null };
  const hookMatch = coreIdea.match(/(?:Kanca\s*\(Hook\)|Hook):\s*([^\n]+)/i);
  const visualMatch = coreIdea.match(/(?:Görsel\/Video Konsepti|Visual\s*\/\s*Video Concept):\s*([\s\S]+)/i);
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

// Best times peak slots (19:00 - 21:00 prime time, 13:00 lunch peak)
function isPeakHour(hour: number, dayIdx: number): boolean {
  if (hour >= 19 && hour <= 21) {
    return true; // Akşam prime time
  }
  if (hour === 13 && (dayIdx === 1 || dayIdx === 3 || dayIdx === 4)) {
    return true; // Hafta içi öğle molası
  }
  return false;
}

// Already-published or failed posts don't move by drag — a schedule edit on
// those is meaningless (published) or masks a real error that needs fixing
// first (failed), not a silent time change.
function isDraggableStatus(status: UIStatus): boolean {
  return status === "review" || status === "scheduled";
}

const CARD_COLORS: Record<UIStatus, string> = {
  published: "border-emerald-200 bg-emerald-50/30",
  review: "border-amber-200 bg-amber-50/30",
  failed: "border-rose-200 bg-rose-50/30",
  scheduled: "border-slate-200 bg-white",
};

const CARD_HOVER_COLORS: Record<UIStatus, string> = {
  published: "hover:border-emerald-400 hover:bg-emerald-50/60",
  review: "hover:border-amber-400 hover:bg-amber-50/60",
  failed: "hover:border-rose-400 hover:bg-rose-50/60",
  scheduled: "hover:border-indigo-400 hover:bg-white",
};

// Same three rows for both the live card and its DragOverlay clone, so the
// clone doesn't visually drift from what's actually being moved.
function PostCardBody({ post }: { post: GroupedPost }) {
  return (
    <>
      {/* Üst Satır: Saat ve Durum */}
      <div className="flex items-center justify-between gap-1">
        <span className="font-mono text-[10px] font-bold text-slate-700">
          {new Date(post.scheduled_at).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span
          className={`rounded-full px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-tight ${STATUS_LABEL[post.overallStatus].className}`}
        >
          {STATUS_LABEL[post.overallStatus].label}
        </span>
      </div>

      {/* Orta Kısım: Küçük Görsel (varsa) ve Başlık — min-h-6, görseli olan
          ve olmayan kartlar aynı yükseklikte kalsın diye. */}
      <div className="flex min-h-6 items-center gap-1.5 min-w-0">
        {post.imageUrl && (
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded border border-slate-200/60">
            {post.imageIsVideo ? (
              <video src={post.imageUrl} muted playsInline className="h-full w-full object-cover" />
            ) : (
              <Image src={post.imageUrl} alt="" fill sizes="24px" className="object-cover" />
            )}
          </div>
        )}
        <p className="truncate text-[11px] font-semibold text-slate-800 group-hover/card:text-indigo-600 min-w-0 flex-1">
          {post.metadata?.hook || post.title}
        </p>
      </div>

      {/* Alt Satır: Birleştirilmiş Platform İkonları */}
      <div className="flex items-center justify-between border-t border-slate-100/80 pt-1">
        <div className="flex items-center -space-x-1.5">
          {post.platforms.map((pl) => (
            <div
              key={pl.id}
              className="rounded-full ring-2 ring-white"
              title={`${platformLabel(pl.platform)} (${STATUS_LABEL[pl.uiStatus].label})`}
            >
              <PlatformIcon name={pl.platform} className="h-6 w-6" />
            </div>
          ))}
        </div>
        {post.platforms.length > 1 && (
          <span className="text-[9px] font-mono text-slate-400">{post.platforms.length} channels</span>
        )}
      </div>
    </>
  );
}

function PostCard({ post, onSelect }: { post: GroupedPost; onSelect: () => void }) {
  const draggable = isDraggableStatus(post.overallStatus);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: post.id,
    disabled: !draggable,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onSelect}
      {...(draggable ? { ...listeners, ...attributes } : {})}
      className={`group/card relative flex flex-col gap-1 rounded-xl border p-2 text-left shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        CARD_COLORS[post.overallStatus]
      } ${CARD_HOVER_COLORS[post.overallStatus]} ${isDragging ? "opacity-30" : ""} ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <PostCardBody post={post} />
    </button>
  );
}

function CalendarCell({
  dayIdx,
  hour,
  posts,
  peak,
  isToday,
  isCurrentHour,
  currentMinute,
  composeHref,
  onSelect,
}: {
  dayIdx: number;
  hour: number;
  posts: GroupedPost[];
  peak: boolean;
  isToday: boolean;
  isCurrentHour: boolean;
  currentMinute: number;
  composeHref: string;
  onSelect: (post: GroupedPost) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `${dayIdx}_${hour}` });

  return (
    <div
      ref={setNodeRef}
      className={`relative min-h-[88px] min-w-0 border-r border-b border-slate-100 p-1.5 transition-colors ${
        isOver
          ? "bg-indigo-50 ring-2 ring-inset ring-indigo-300"
          : peak
          ? "bg-pink-50/30"
          : "hover:bg-slate-50/70"
      } ${isToday ? "ring-1 ring-inset ring-indigo-500/15" : ""}`}
    >
      {/* Peak hour signal: background tint only (see bg-pink-50/30 above) —
          a floating label per cell got crowded once a card also sat there,
          and repeated seven times a row read as noise, not signal. */}
      {peak && !isOver && (
        <span className="pointer-events-none absolute left-0 top-0 h-full w-0.5 bg-pink-300" aria-hidden="true" />
      )}

      {/* Current Time Line if Today */}
      {isCurrentHour && (
        <div
          style={{ top: `${(currentMinute / 60) * 100}%` }}
          className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
        >
          <span className="h-2 w-2 -ml-1 rounded-full bg-pink-500 ring-2 ring-white"></span>
          <span className="h-0.5 w-full bg-pink-500 shadow-xs"></span>
        </div>
      )}

      {/* Grouped Posts (Tek bir derli toplu kart, çoklu platformlar rozetle gösterilir) */}
      <div className="flex flex-col gap-1.5">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onSelect={() => onSelect(post)} />
        ))}
      </div>

      {/* Boş slot hover hızlı ekleme */}
      {posts.length === 0 && (
        <Link
          href={composeHref}
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-indigo-50/60 backdrop-blur-2xs transition rounded-lg m-0.5 text-xs font-bold text-indigo-600"
        >
          + Add
        </Link>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState<"calendar" | "list" | "library">("calendar");
  const [weekIndex, setWeekIndex] = useState(0);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [selectedPost, setSelectedPost] = useState<GroupedPost | null>(null);
  const [selectedPlatformIdx, setSelectedPlatformIdx] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UIStatus>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [showBestTimes, setShowBestTimes] = useState(false);

  // Current-time indicator line inside the grid
  const [currentHourMinute, setCurrentHourMinute] = useState({ hour: 19, minute: 15 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentHourMinute({ hour: now.getHours(), minute: now.getMinutes() });
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const weekStart = useMemo(() => startOfWeek(weekIndex), [weekIndex]);

  const days = useMemo(() => {
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return {
        label: dayNames[i],
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
          "id, platform, caption, scheduled_at, status, content!inner(id, title, status, category, core_idea, brand_id, content_media(media(file_url, file_type)))"
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
          const media = firstMedia(c?.content_media);
          return {
            ...r,
            content: c
              ? {
                  id: c.id,
                  title: c.title,
                  status: c.status,
                  imageUrl: media?.url ?? null,
                  imageIsVideo: media?.isVideo ?? false,
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

  // Media library
  const [libraryMedia, setLibraryMedia] = useState<MediaRow[] | null>(null);

  useEffect(() => {
    let ignore = false;

    (async () => {
      const { data, error } = await supabase
        .from("media")
        .select("id, file_name, file_url, file_type, created_at")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false });

      if (ignore) return;

      if (error) {
        console.error("İçerik kütüphanesi yüklenemedi:", error.message);
        setLibraryMedia([]);
        return;
      }

      setLibraryMedia(data ?? []);
    })();

    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, refreshKey]);

  // Group multiple platform rows for the same content into a single GroupedPost
  const groupedPosts = useMemo(() => {
    const map = new Map<string, GroupedPost>();

    for (const row of loadedRows) {
      const c = row.content;
      const contentId = c?.id || row.id;
      const date = new Date(row.scheduled_at);
      // Group by contentId and same hour slot
      const dateHourKey = `${contentId}_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}_${date.getHours()}`;

      const uiStatus = deriveStatus(c?.status ?? "DRAFT", row.status);

      if (!map.has(dateHourKey)) {
        map.set(dateHourKey, {
          id: dateHourKey,
          contentId,
          title: c?.title || "(Untitled)",
          scheduled_at: row.scheduled_at,
          imageUrl: c?.imageUrl ?? null,
          imageIsVideo: c?.imageIsVideo ?? false,
          metadata: c?.metadata,
          overallStatus: uiStatus,
          platforms: [
            {
              id: row.id,
              platform: row.platform,
              caption: row.caption,
              status: row.status,
              uiStatus,
            },
          ],
          rawRows: [row],
        });
      } else {
        const existing = map.get(dateHourKey)!;
        // Avoid duplicate platform entry for the same content
        if (!existing.platforms.some((p) => p.id === row.id)) {
          existing.platforms.push({
            id: row.id,
            platform: row.platform,
            caption: row.caption,
            status: row.status,
            uiStatus,
          });
          existing.rawRows.push(row);
        }

        // Overall status derivation
        const allStatuses = existing.platforms.map((p) => p.uiStatus);
        if (allStatuses.includes("failed")) {
          existing.overallStatus = "failed";
        } else if (allStatuses.includes("review")) {
          existing.overallStatus = "review";
        } else if (allStatuses.some((s) => s === "scheduled")) {
          existing.overallStatus = "scheduled";
        } else if (allStatuses.every((s) => s === "published")) {
          existing.overallStatus = "published";
        }
      }
    }

    return Array.from(map.values());
  }, [loadedRows]);

  // Filter grouped posts by search query, status, and platform
  const filteredGroupedPosts = useMemo(() => {
    let list = groupedPosts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.platforms.some((pl) => pl.caption.toLowerCase().includes(q) || pl.platform.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((p) => p.overallStatus === statusFilter);
    }

    if (platformFilter !== "all") {
      list = list.filter((p) => p.platforms.some((pl) => pl.platform === platformFilter));
    }

    return list;
  }, [groupedPosts, searchQuery, statusFilter, platformFilter]);

  // Map posts into day and hour buckets
  const gridMap = useMemo(() => {
    // key: `${dayIdx}_${hour}` -> array of GroupedPost
    const map = new Map<string, GroupedPost[]>();
    for (const post of filteredGroupedPosts) {
      const d = new Date(post.scheduled_at);
      const dayDiff = Math.floor((d.getTime() - weekStart.getTime()) / 86400000);
      if (dayDiff >= 0 && dayDiff < 7) {
        const hour = d.getHours();
        const key = `${dayDiff}_${hour}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(post);
      }
    }
    return map;
  }, [filteredGroupedPosts, weekStart]);

  const today = new Date();
  const rangeLabel = `${days[0].date.toLocaleDateString("en-US", { day: "numeric", month: "short" })} - ${days[6].date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`;

  async function approve(contentId: string) {
    const { error } = await supabase.from("content").update({ status: "APPROVED" }).eq("id", contentId);
    if (error) {
      console.error("Onaylanamadı:", error.message);
      return;
    }
    setSelectedPost(null);
    setRefreshKey((k) => k + 1);
  }

  // Drag-to-reschedule: hour + day only, no minute precision (matches the
  // grid's own hour-slot resolution — dragging doesn't invent precision the
  // UI can't show).
  const [activeDragPost, setActiveDragPost] = useState<GroupedPost | null>(null);
  const [dragWarning, setDragWarning] = useState<string | null>(null);
  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function warnAboutDrag(message: string) {
    setDragWarning(message);
    setTimeout(() => setDragWarning((current) => (current === message ? null : current)), 3200);
  }

  function handleDragStart(event: DragStartEvent) {
    const post = groupedPosts.find((p) => p.id === event.active.id) ?? null;
    setActiveDragPost(post);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const post = groupedPosts.find((p) => p.id === active.id);
    setActiveDragPost(null);
    if (!over || !post) return;

    const [dayIdxStr, hourStr] = String(over.id).split("_");
    const targetDay = days[Number(dayIdxStr)]?.date;
    const targetHour = Number(hourStr);
    if (!targetDay || Number.isNaN(targetHour)) return;

    const original = new Date(post.scheduled_at);
    const next = new Date(targetDay);
    next.setHours(targetHour, original.getMinutes(), 0, 0);

    if (next.getTime() === original.getTime()) return; // aynı hücreye bırakıldı

    // Geçmişe planlama yok — geçmiş bir güne ya da bugünün geçmiş bir
    // saatine bırakmak, henüz yayınlanmamış bir gönderiyi asla
    // gerçekleşmeyecek bir zamana kilitler.
    const currentHourFloor = new Date();
    currentHourFloor.setMinutes(0, 0, 0);
    if (next.getTime() < currentHourFloor.getTime()) {
      warnAboutDrag("You can't move a post to a past date or time.");
      return;
    }

    const ids = post.rawRows.map((r) => r.id);
    const { error } = await supabase
      .from("content_platforms")
      .update({ scheduled_at: next.toISOString() })
      .in("id", ids);

    if (error) {
      console.error("Gönderi taşınamadı:", error.message);
      return;
    }
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
            Calendar
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
            List
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("library")}
            className={`relative px-3 py-1.5 transition ${
              activeTab === "library"
                ? "text-slate-900 font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Content Library
          </button>
        </nav>
      </div>

      {/* 2. Controls & Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] max-w-xs">
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
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                statusFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("review")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                statusFilter === "review" ? "bg-amber-500 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Needs Review
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("scheduled")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                statusFilter === "scheduled" ? "bg-indigo-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Scheduled
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("published")}
              className={`rounded-lg px-2.5 py-1 font-medium transition ${
                statusFilter === "published" ? "bg-emerald-600 text-white font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Published
            </button>
          </div>

          {/* Platform filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="x">X</option>
            <option value="pinterest">Pinterest</option>
            <option value="threads">Threads</option>
          </select>
        </div>

        {/* Right Controls: Navigation, Heatmap Toggle, Create Post */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Week navigator cluster */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs">
            <button
              type="button"
              onClick={() => setWeekIndex(0)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              This week
            </button>
            <button
              type="button"
              onClick={() => setWeekIndex((w) => w - 1)}
              aria-label="Previous week"
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
              aria-label="Next week"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Best times toggle button — clean, subtle highlight */}
          <button
            type="button"
            onClick={() => setShowBestTimes(!showBestTimes)}
            title="Shows industry-general high-engagement hours"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-xs transition ${
              showBestTimes
                ? "border-pink-300 bg-pink-50 text-pink-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>⚡ Best times</span>
            <span className={`h-1.5 w-1.5 rounded-full ${showBestTimes ? "bg-pink-500 animate-pulse" : "bg-slate-300"}`} />
          </button>

          {/* Primary Create Post Button */}
          <Link
            href="/dashboard/compose"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Create post</span>
          </Link>
        </div>
      </div>

      {/* 3. Main Views */}
      {loading ? (
        <div className="flex h-96 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400">
          Loading calendar...
        </div>
      ) : activeTab === "list" ? (
        /* LIST VIEW (Derli toplu tekil gönderiler) */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-slate-900">This Week&apos;s Posts</h3>
            <span className="text-xs font-mono text-slate-400">{filteredGroupedPosts.length} posts</span>
          </div>

          {filteredGroupedPosts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No posts scheduled for this week.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredGroupedPosts.map((post) => {
                return (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post);
                      setSelectedPlatformIdx(0);
                    }}
                    className="flex items-center justify-between py-3 hover:bg-slate-50/80 px-3 rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {post.imageUrl ? (
                        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200">
                          {post.imageIsVideo ? (
                            <video src={post.imageUrl} muted playsInline className="h-full w-full object-cover" />
                          ) : (
                            <Image src={post.imageUrl} alt="" fill sizes="44px" className="object-cover" />
                          )}
                        </div>
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 font-bold text-xs">
                          {post.title.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{post.title}</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="flex items-center -space-x-1">
                            {post.platforms.map((pl) => (
                              <PlatformIcon
                                key={pl.id}
                                name={pl.platform}
                                className="h-4 w-4 rounded-full ring-1 ring-white"
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-400">· {post.platforms.length} platforms</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-mono text-slate-500">
                        {new Date(post.scheduled_at).toLocaleString("en-US", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase font-bold ${STATUS_LABEL[post.overallStatus].className}`}
                      >
                        {STATUS_LABEL[post.overallStatus].label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === "library" ? (
        /* CONTENT LIBRARY VIEW */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="font-display text-base font-bold text-slate-900 mb-4">Content Library</h3>
          {libraryMedia === null ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading...</div>
          ) : libraryMedia.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No saved images or videos yet. Media you add while creating content shows up here.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {libraryMedia.map((m) => (
                <div
                  key={m.id}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  {m.file_type.startsWith("video/") ? (
                    <video src={m.file_url} muted playsInline className="h-full w-full object-cover" />
                  ) : (
                    <Image src={m.file_url} alt={m.file_name} fill sizes="200px" className="object-cover" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 font-mono text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                    {m.file_name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CALENDAR GRID VIEW (Tek satırlık düzenli kartlar, temiz heatmap) */
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              {/* Tek, paylaşılan grid: başlık satırı ve 16 saat satırının
                  hepsi AYNI grid'in doğrudan çocukları. Önceki sürümde her
                  saat satırı kendi grid-cols-[70px_repeat(7,1fr)]'ini kendi
                  başına hesaplıyordu — 17 bağımsız grid, her biri o satırdaki
                  içeriğe göre kendi sütun genişliklerini seçiyordu, o yüzden
                  sütun kenarları satırlar arasında hizalanmıyordu (bir satırda
                  geniş, bir satırda dar). Tek grid'de sütun genişliği bir kere
                  hesaplanır, her satırda aynı kalır. */}
              <DndContext sensors={dragSensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-[70px_repeat(7,1fr)]">
                  {/* Köşe */}
                  <div className="sticky top-0 z-20 border-r border-b border-slate-200 bg-slate-50/80 p-3 text-center font-mono text-[10px] text-slate-400 uppercase font-semibold">
                    Saat
                  </div>

                  {/* 7 Gün Başlığı */}
                  {days.map((day, dayIdx) => {
                    const isToday = day.date.toDateString() === today.toDateString();
                    const isPast = day.date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                    return (
                      <div
                        key={dayIdx}
                        className={`sticky top-0 z-20 border-r border-b border-slate-200 p-2.5 text-center transition ${
                          isToday
                            ? "bg-indigo-600 text-white font-bold"
                            : isPast
                            ? "bg-slate-50/50 text-slate-500"
                            : "bg-slate-50/80 text-slate-700 hover:bg-slate-100/70"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold">
                          <span className={`font-display text-sm ${isToday ? "text-white font-extrabold" : "text-slate-900"}`}>
                            {day.dayNum}
                          </span>
                          <span className={`capitalize ${isToday ? "text-slate-200" : "text-slate-600"}`}>
                            {day.label}
                          </span>
                          {isToday && (
                            <span className="rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-mono uppercase text-white font-bold ml-1">
                              Today
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* 16 saat satırı, her biri saat etiketi + 7 gün hücresi —
                      hepsi aynı grid'in düz çocukları olarak. */}
                  {HOURS.map((hour) => {
                    const hourLabel = `${String(hour).padStart(2, "0")}:00`;

                    return (
                      <Fragment key={hour}>
                        <div className="min-h-[88px] border-r border-b border-slate-200 bg-slate-50/30 p-2 text-right font-mono text-[11px] text-slate-400 select-none">
                          {hourLabel}
                        </div>

                        {days.map((day, dayIdx) => {
                          const isToday = day.date.toDateString() === today.toDateString();
                          const key = `${dayIdx}_${hour}`;

                          return (
                            <CalendarCell
                              key={dayIdx}
                              dayIdx={dayIdx}
                              hour={hour}
                              posts={gridMap.get(key) || []}
                              peak={showBestTimes && isPeakHour(hour, dayIdx)}
                              isToday={isToday}
                              isCurrentHour={isToday && currentHourMinute.hour === hour}
                              currentMinute={currentHourMinute.minute}
                              composeHref={`/dashboard/compose?date=${day.date.toISOString()}&hour=${hour}`}
                              onSelect={(post) => {
                                setSelectedPost(post);
                                setSelectedPlatformIdx(0);
                              }}
                            />
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </div>

                <DragOverlay>
                  {activeDragPost && (
                    <div
                      className={`flex w-[180px] flex-col gap-1 rounded-xl border p-2 shadow-lg ${CARD_COLORS[activeDragPost.overallStatus]}`}
                    >
                      <PostCardBody post={activeDragPost} />
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </div>
      )}

      {/* Sürükle-bırak uyarısı */}
      {dragWarning && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-100 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 shadow-lg">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {dragWarning}
          </div>
        </div>
      )}

      {/* 4. Slide-out Detailed Drawer */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelectedPost(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
          <aside className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  {selectedPost.title}
                </h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">
                  {new Date(selectedPost.scheduled_at).toLocaleString("en-US", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            {/* Overall Status Pill */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 font-mono text-xs uppercase font-bold ${STATUS_LABEL[selectedPost.overallStatus].className}`}
              >
                {STATUS_LABEL[selectedPost.overallStatus].label}
              </span>

              {selectedPost.metadata?.pillar && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {selectedPost.metadata.pillar}
                </span>
              )}

              <span className="text-xs font-mono text-slate-400 ml-auto">
                Live/scheduled on {selectedPost.platforms.length} platforms
              </span>
            </div>

            {/* Media Preview */}
            {selectedPost.imageUrl ? (
              <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-slate-100 shadow-sm bg-slate-50">
                {selectedPost.imageIsVideo ? (
                  <video src={selectedPost.imageUrl} controls className="h-full w-full object-cover" />
                ) : (
                  <Image src={selectedPost.imageUrl} alt="" fill className="object-cover" />
                )}
              </div>
            ) : selectedPost.metadata?.visualPrompt ? (
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">
                  🎨 Visual / Video Concept
                </span>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {selectedPost.metadata.visualPrompt}
                </p>
              </div>
            ) : null}

            {/* 2-second Hook */}
            {selectedPost.metadata?.hook && (
              <div className="mt-3 rounded-2xl border border-amber-200/60 bg-amber-50/60 p-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                  🪝 Hook
                </span>
                <p className="mt-1 text-xs font-semibold text-slate-900 leading-snug">
                  &ldquo;{selectedPost.metadata.hook}&rdquo;
                </p>
              </div>
            )}

            {/* Platform Tabs & Custom Captions */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
                  Platform Captions
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {selectedPost.platforms.length} channels linked
                </span>
              </div>

              {/* Platform Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                {selectedPost.platforms.map((pl, idx) => {
                  const isSelected = selectedPlatformIdx === idx;
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => setSelectedPlatformIdx(idx)}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <PlatformIcon name={pl.platform} className="h-4 w-4" />
                      <span>{platformLabel(pl.platform)}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[8px] font-mono uppercase ${
                          isSelected ? "bg-white/20 text-white" : STATUS_LABEL[pl.uiStatus].className
                        }`}
                      >
                        {STATUS_LABEL[pl.uiStatus].label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Platform Caption Box */}
              {selectedPost.platforms[selectedPlatformIdx] && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      {platformLabel(selectedPost.platforms[selectedPlatformIdx].platform)} Caption
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-mono uppercase font-bold ${
                        STATUS_LABEL[selectedPost.platforms[selectedPlatformIdx].uiStatus].className
                      }`}
                    >
                      {STATUS_LABEL[selectedPost.platforms[selectedPlatformIdx].uiStatus].label}
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700 font-body">
                    {selectedPost.platforms[selectedPlatformIdx].caption || "(No caption entered for this platform)"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="mt-auto flex items-center gap-2.5 pt-6 border-t border-slate-100">
              {selectedPost.overallStatus === "review" && (
                <button
                  type="button"
                  onClick={() => approve(selectedPost.contentId)}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  ✓ Approve All
                </button>
              )}
              <Link
                href={`/dashboard/compose`}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-center text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
              >
                Edit Content
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
