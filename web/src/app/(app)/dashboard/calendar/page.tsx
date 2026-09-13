"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { useComposeModal } from "@/components/dashboard/ComposeModalProvider";
import { createClient } from "@/lib/supabase/client";
import type { PlatformName } from "@/components/PlatformIcon";
import type {
  CalendarPost,
  CalendarMeeting,
  CalendarNote,
  CalendarCampaign,
  CalendarFilterState,
} from "@/components/dashboard/calendar/types";
import { INITIAL_CALENDAR_POSTS, CALENDAR_MEETINGS } from "@/components/dashboard/calendar/initialCalendarData";
import CalendarHeader from "@/components/dashboard/calendar/CalendarHeader";
import CalendarPostCard from "@/components/dashboard/calendar/CalendarPostCard";
import CalendarMonthView from "@/components/dashboard/calendar/CalendarMonthView";
import CalendarWeekView from "@/components/dashboard/calendar/CalendarWeekView";
import CalendarDetailModal from "@/components/dashboard/calendar/CalendarDetailModal";
import CalendarFilterDrawer from "@/components/dashboard/calendar/CalendarFilterDrawer";
import CalendarAiTodoDrawer from "@/components/dashboard/calendar/CalendarAiTodoDrawer";
import SmartScheduleModal from "@/components/dashboard/calendar/SmartScheduleModal";
import { getDashboardBriefing } from "@/lib/ai/getDashboardBriefing";

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

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function getWeekStart(d: Date) {
  const copy = new Date(d);
  const dow = (copy.getDay() + 6) % 7; // Monday = 0
  copy.setDate(copy.getDate() - dow);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

const DEFAULT_FILTER: CalendarFilterState = {
  searchQuery: "",
  sortBy: "last_created",
  approvalStatus: "all",
  postStatus: "all",
  campaign: "all",
  platform: "all",
};

export default function CalendarPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);
  const composeModal = useComposeModal();

  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  // Kept separate from demo data on purpose — see the same split in
  // approvals/page.tsx. Real posts never get permanently mixed with someone
  // else's brand's sample content; demo only shows while switched on.
  const [realPosts, setRealPosts] = useState<CalendarPost[]>([]);
  const [demoPosts, setDemoPosts] = useState<CalendarPost[]>(INITIAL_CALENDAR_POSTS);
  const [showDemo, setShowDemo] = useState(false);
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [campaigns, setCampaigns] = useState<CalendarCampaign[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const posts = useMemo(
    () => (showDemo ? [...realPosts, ...demoPosts] : realPosts),
    [realPosts, demoPosts, showDemo]
  );
  const meetings: CalendarMeeting[] = showDemo ? CALENDAR_MEETINGS : [];

  const todayKey = dateKey(new Date());
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);

  // Modals & Drawers state
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState<CalendarFilterState>(DEFAULT_FILTER);
  const [aiTodoOpen, setAiTodoOpen] = useState(false);
  const [needsReviewCount, setNeedsReviewCount] = useState(0);
  const [briefing, setBriefing] = useState("");
  const [smartFillDate, setSmartFillDate] = useState<string | null>(null);
  // Set alongside smartFillDate only when opened from the İçerik Dengesi
  // Radarı's "eksik günü doldur" button, so that specific pillar reaches
  // SmartScheduleModal instead of being silently dropped.
  const [smartFillCategory, setSmartFillCategory] = useState<string | undefined>(undefined);

  // AI Yapılacaklar + günlük özet — ported from the old Ana Sayfa (see
  // CalendarAiTodoDrawer.tsx for the full reasoning).
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { count } = await supabase
        .from("content")
        .select("id", { count: "exact", head: true })
        .eq("brand_id", brand.id)
        .eq("status", "NEEDS_REVIEW");
      if (!ignore) setNeedsReviewCount(count ?? 0);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const text = await getDashboardBriefing(brand.id);
        if (!ignore) setBriefing(text);
      } catch (err) {
        console.error("Briefing error:", err);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [brand.id]);

  // Fetch real content from Supabase
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("content")
          .select(
            "id, title, status, category, created_at, campaigns(name), content_media(media(file_url, file_type)), content_platforms(id, platform, caption, status, scheduled_at)"
          )
          .eq("brand_id", brand.id)
          .order("created_at", { ascending: false });

        if (ignore) return;
        if (error) {
          console.error("Takvim verileri yüklenirken hata:", error.message);
          return;
        }

        const list = (data ?? []) as unknown as Array<Record<string, unknown>>;
        const nextRealPosts: CalendarPost[] = [];

        for (const r of list) {
          const platforms = (r.content_platforms ?? []) as Array<{
            id: string;
            platform: PlatformName;
            caption: string | null;
            scheduled_at: string | null;
            status: string;
          }>;
          const media = firstMedia(r.content_media);
          const campaign = r.campaigns as { name?: string } | { name?: string }[] | null;
          const campaignName = Array.isArray(campaign) ? campaign[0]?.name : campaign?.name;

          for (const p of platforms) {
            const schedDate = p.scheduled_at ? new Date(p.scheduled_at) : new Date(String(r.created_at));
            const dStr = schedDate.toISOString().slice(0, 10);
            const timeStr = schedDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

            const apprStatus: "PENDING" | "APPROVED" | "FEEDBACK" = r.status === "APPROVED" ? "APPROVED" : "PENDING";

            nextRealPosts.push({
              id: `real-${r.id}-${p.platform}`,
              contentPlatformId: p.id,
              scheduledAtIso: schedDate.toISOString(),
              title: String(r.title || "(Başlıksız)"),
              accountName: brand.name || "Marka",
              handle: (brand.name || "marka").toLowerCase().replace(/\s+/g, ""),
              timeLabel: timeStr,
              date: dStr,
              imageUrl: media?.url || "/images/no-image-placeholder.png",
              imageIsVideo: media?.isVideo ?? false,
              caption: p.caption || String(r.title || ""),
              tags: campaignName ? [campaignName] : ["Post"],
              category: (r.category as string) || null,
              campaignName: campaignName ?? null,
              platform: p.platform || "instagram",
              approvalStatus: apprStatus,
              postStatus: "SCHEDULED",
              commentCount: 0,
              isDemo: false,
            });
          }
        }

        setRealPosts(nextRealPosts);
      } catch (err) {
        console.error("Takvim verisi hatası:", err);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, brand.name, refreshKey]);

  // Fetch real campaigns (for the real multi-day banner)
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase
        .from("campaigns")
        .select("id, name, start_date, end_date")
        .eq("brand_id", brand.id)
        .not("start_date", "is", null)
        .not("end_date", "is", null);
      if (!ignore) {
        setCampaigns(
          ((data ?? []) as Array<{ id: string; name: string; start_date: string; end_date: string }>).map((c) => ({
            id: c.id,
            name: c.name,
            start_date: c.start_date,
            end_date: c.end_date,
          }))
        );
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  // Fetch real calendar notes for the currently visible range (a bit wider
  // than exactly the grid to keep the query simple across month/week/nav).
  useEffect(() => {
    let ignore = false;
    (async () => {
      const rangeStart = new Date(currentDate);
      rangeStart.setDate(1);
      rangeStart.setDate(rangeStart.getDate() - 10);
      const rangeEnd = new Date(currentDate);
      rangeEnd.setMonth(rangeEnd.getMonth() + 1);
      rangeEnd.setDate(rangeEnd.getDate() + 10);

      const { data, error } = await supabase
        .from("calendar_notes")
        .select("id, note_date, text, color")
        .eq("brand_id", brand.id)
        .gte("note_date", dateKey(rangeStart))
        .lte("note_date", dateKey(rangeEnd));

      if (ignore) return;
      if (error) {
        console.error("Notlar yüklenemedi:", error.message);
        return;
      }
      setNotes(
        (data ?? []).map((n) => ({ id: n.id, date: n.note_date, text: n.text, color: n.color }))
      );
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, currentDate, refreshKey]);

  // Filter + sort posts in real-time — every field in CalendarFilterState is
  // actually applied here (sortBy/postStatus/campaign/platform used to sit
  // in the drawer without doing anything; hideTeamOnly/showArchived were
  // dropped from the type entirely since neither concept exists anywhere in
  // the data model yet).
  const filteredPosts = useMemo(() => {
    const filtered = posts.filter((p) => {
      if (filterState.searchQuery) {
        const q = filterState.searchQuery.toLowerCase();
        const matches =
          p.title.toLowerCase().includes(q) ||
          p.caption.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filterState.approvalStatus !== "all" && p.approvalStatus !== filterState.approvalStatus) return false;
      if (filterState.postStatus !== "all" && p.postStatus !== filterState.postStatus) return false;
      if (filterState.campaign !== "all" && p.campaignName !== filterState.campaign) return false;
      if (filterState.platform !== "all" && p.platform !== filterState.platform) return false;
      return true;
    });

    if (filterState.sortBy === "scheduled_date") {
      return [...filtered].sort((a, b) => (a.date === b.date ? a.timeLabel.localeCompare(b.timeLabel) : a.date < b.date ? -1 : 1));
    }
    return filtered;
  }, [posts, filterState]);

  // Date label for header — computed for real from currentDate/weekStart,
  // not a hardcoded "Sep 2026 W37".
  const dateLabel = useMemo(() => {
    if (viewMode === "week") {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
      const startStr = weekStart.toLocaleDateString("tr-TR", { day: "numeric", month: sameMonth ? undefined : "short" });
      const endStr = weekEnd.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
      return `${startStr} – ${endStr}`;
    }
    return currentDate.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  }, [viewMode, currentDate, weekStart]);

  // Navigation handlers — week mode now actually moves ±7 days instead of
  // being a no-op.
  function handlePrev() {
    if (viewMode === "month") {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else {
      setCurrentDate((prev) => {
        const next = new Date(prev);
        next.setDate(next.getDate() - 7);
        return next;
      });
    }
  }

  function handleNext() {
    if (viewMode === "month") {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      setCurrentDate((prev) => {
        const next = new Date(prev);
        next.setDate(next.getDate() + 7);
        return next;
      });
    }
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleOpenComposeAtDate(dateStr: string) {
    if (dateStr < todayKey) return; // belt-and-suspenders — the UI already hides this entry point on past days
    composeModal.open({ date: dateStr, onSaved: () => setRefreshKey((k) => k + 1) });
  }

  // Notes CRUD — mirrors the same brand-scoped calendar_notes table/policies
  // built earlier; this UI was lost when the calendar was rebuilt, so it's
  // being re-wired here rather than reinvented.
  async function addNote(dateStr: string) {
    const { data, error } = await supabase
      .from("calendar_notes")
      .insert({ brand_id: brand.id, note_date: dateStr, text: "", color: "amber" })
      .select("id, note_date, text, color")
      .single();
    if (error || !data) {
      console.error("Not eklenemedi:", error?.message);
      return;
    }
    setNotes((prev) => [...prev, { id: data.id, date: data.note_date, text: data.text, color: data.color }]);
  }

  async function saveNoteText(id: string, text: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
    const { error } = await supabase.from("calendar_notes").update({ text }).eq("id", id);
    if (error) console.error("Not kaydedilemedi:", error.message);
  }

  async function changeNoteColor(id: string, color: string) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color } : n)));
    const { error } = await supabase.from("calendar_notes").update({ color }).eq("id", id);
    if (error) console.error("Not rengi kaydedilemedi:", error.message);
  }

  async function deleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const { error } = await supabase.from("calendar_notes").delete().eq("id", id);
    if (error) console.error("Not silinemedi:", error.message);
  }

  // Drag and drop — move a post card to a different day. Real posts persist
  // the new date (keeping the original time-of-day); demo posts just move
  // locally, same isDemo split used everywhere else on this page.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [activeDragPost, setActiveDragPost] = useState<CalendarPost | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const post = posts.find((p) => p.id === String(event.active.id));
    setActiveDragPost(post ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragPost(null);
    const { active, over } = event;
    if (!over) return;
    const postId = String(active.id);
    const newDateKey = String(over.id);
    if (newDateKey < todayKey) return; // dropping onto a past day is a no-op, not an error

    const post = posts.find((p) => p.id === postId);
    if (!post || post.date === newDateKey) return;

    if (post.isDemo) {
      setDemoPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, date: newDateKey } : p)));
      return;
    }

    setRealPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, date: newDateKey } : p)));
    if (post.contentPlatformId && post.scheduledAtIso) {
      const original = new Date(post.scheduledAtIso);
      const [y, m, d] = newDateKey.split("-").map(Number);
      const moved = new Date(original);
      moved.setFullYear(y, m - 1, d);
      supabase
        .from("content_platforms")
        .update({ scheduled_at: moved.toISOString() })
        .eq("id", post.contentPlatformId)
        .then(({ error }) => {
          if (error) console.error("Tarih güncellenemedi:", error.message);
        });
    }
  }

  // Active filter count
  const activeFilterCount =
    (filterState.searchQuery ? 1 : 0) +
    (filterState.approvalStatus !== "all" ? 1 : 0) +
    (filterState.postStatus !== "all" ? 1 : 0) +
    (filterState.campaign !== "all" ? 1 : 0) +
    (filterState.platform !== "all" ? 1 : 0);

  // Selected post index in list for modal navigation
  const selectedIndex = selectedPost ? filteredPosts.findIndex((p) => p.id === selectedPost.id) : -1;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragPost(null)}
    >
      <div className="flex h-[calc(100dvh-4rem)] flex-col bg-white overflow-hidden">
        {/* Calendar Header */}
        <CalendarHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dateLabel={dateLabel}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onOpenFilter={() => setFilterDrawerOpen((prev) => !prev)}
          onOpenAiTodo={() => setAiTodoOpen((prev) => !prev)}
          aiTodoCount={needsReviewCount}
          onOpenCompose={() => handleOpenComposeAtDate(todayKey)}
          onOpenSmartFill={() => {
            setSmartFillCategory(undefined);
            setSmartFillDate(todayKey);
          }}
          filterCount={activeFilterCount}
        />

        {/* Demo-data preview toggle intentionally hidden for now — showDemo
            still defaults to false and the merge logic below is untouched,
            so it's a one-line JSX re-add away from coming back later. */}

        {/* Main Calendar Content Area */}
        <div className="relative flex flex-1 overflow-hidden">
          {viewMode === "month" ? (
            <CalendarMonthView
              currentDate={currentDate}
              posts={filteredPosts}
              notes={notes}
              campaigns={campaigns}
              todayKey={todayKey}
              onSelectPost={setSelectedPost}
              onAddPostAtDate={handleOpenComposeAtDate}
              onSmartFillDate={(dateStr) => {
                setSmartFillCategory(undefined);
                setSmartFillDate(dateStr);
              }}
              onAddNote={addNote}
              onSaveNoteText={saveNoteText}
              onNoteColorChange={changeNoteColor}
              onDeleteNote={deleteNote}
            />
          ) : (
            <CalendarWeekView
              weekStart={weekStart}
              posts={filteredPosts}
              meetings={meetings}
              notes={notes}
              campaigns={campaigns}
              todayKey={todayKey}
              onSelectPost={setSelectedPost}
              onAddPostAtDate={handleOpenComposeAtDate}
              onSmartFillDate={(dateStr) => {
                setSmartFillCategory(undefined);
                setSmartFillDate(dateStr);
              }}
              onAddNote={addNote}
              onSaveNoteText={saveNoteText}
              onNoteColorChange={changeNoteColor}
              onDeleteNote={deleteNote}
            />
          )}

          {/* Filter Drawer */}
          <CalendarFilterDrawer
            isOpen={filterDrawerOpen}
            filterState={filterState}
            campaigns={campaigns}
            onChange={setFilterState}
            onClose={() => setFilterDrawerOpen(false)}
            onReset={() => setFilterState(DEFAULT_FILTER)}
          />

          <CalendarAiTodoDrawer
            isOpen={aiTodoOpen}
            onClose={() => setAiTodoOpen(false)}
            needsReview={needsReviewCount}
            briefing={briefing}
            posts={filteredPosts}
            onSmartFill={(category) => {
              setSmartFillCategory(category);
              setSmartFillDate(todayKey);
            }}
          />
        </div>

        {/* Post Detail & Analytics Modal */}
        {selectedPost && (
          <CalendarDetailModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onPrev={() => {
              if (selectedIndex > 0) setSelectedPost(filteredPosts[selectedIndex - 1]);
            }}
            onNext={() => {
              if (selectedIndex + 1 < filteredPosts.length) setSelectedPost(filteredPosts[selectedIndex + 1]);
            }}
          />
        )}

        {/* Smart AI Calendar Fill Modal */}
        {smartFillDate && (
          <SmartScheduleModal
            brandId={brand.id}
            targetDateStr={smartFillDate}
            existingTitles={posts.map((p) => p.title)}
            presetCategory={smartFillCategory}
            isOpen={Boolean(smartFillDate)}
            onClose={() => {
              setSmartFillDate(null);
              setSmartFillCategory(undefined);
            }}
            onSaved={() => setRefreshKey((k) => k + 1)}
          />
        )}

      </div>

      {/* Floating drag preview, portalled to the document body by dnd-kit —
          escapes every ancestor's overflow/stacking context, unlike the
          in-place translated card underneath, which stays clipped to its own
          grid cell's stacking order. */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeDragPost ? (
          <div className="w-56 rotate-2 opacity-95">
            <CalendarPostCard post={activeDragPost} onClick={() => {}} draggable={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
