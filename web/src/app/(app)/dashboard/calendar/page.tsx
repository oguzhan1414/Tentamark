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
import CalendarDayModal from "@/components/dashboard/calendar/CalendarDayModal";
import CalendarFilterDrawer from "@/components/dashboard/calendar/CalendarFilterDrawer";
import CalendarAiTodoDrawer from "@/components/dashboard/calendar/CalendarAiTodoDrawer";
import SmartScheduleModal from "@/components/dashboard/calendar/SmartScheduleModal";
import CalendarMediaPanel from "@/components/dashboard/calendar/CalendarMediaPanel";
import ApprovalDetailModal from "@/components/dashboard/approvals/ApprovalDetailModal";
import type { MediaLibraryItem } from "@/lib/media/useMediaLibrary";
import type { ApprovalComment, ApprovalItem, TeamMemberOption } from "@/components/dashboard/approvals/types";
import { getDashboardBriefing } from "@/lib/ai/getDashboardBriefing";
import { deriveStatus } from "@/lib/contentStatus";
import {
  fetchContentRows,
  rowToApprovalItem,
  rejectContentRow,
  deleteContentRow,
  setContentApproval,
  setContentTags,
  assignContentRow,
  insertContentComment,
  type ContentRow,
} from "@/lib/content/approvalItems";

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
  // Real content, fetched once via the same fetchContentRows() Gönderiler
  // uses — CalendarPost placements AND the ApprovalItem shown in the detail
  // modal both derive from this single source, so a status/reject/delete
  // fix can't land in only one of the two pages again.
  const [contentRows, setContentRows] = useState<ContentRow[]>([]);
  // Kept separate from demo data on purpose — see the same split in
  // approvals/page.tsx. Real posts never get permanently mixed with someone
  // else's brand's sample content; demo only shows while switched on.
  const [demoPosts, setDemoPosts] = useState<CalendarPost[]>(INITIAL_CALENDAR_POSTS);
  const [showDemo, setShowDemo] = useState(false);
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [campaigns, setCampaigns] = useState<CalendarCampaign[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // One CalendarPost per (content, platform) pair — a platform's own
  // scheduled_at/status decides where it lands and how it looks, not the
  // content row as a whole (one content item can be PUBLISHED on Threads
  // and still QUEUED on Instagram).
  const realPosts = useMemo(() => {
    const list: CalendarPost[] = [];
    for (const r of contentRows) {
      for (const p of r.content_platforms) {
        const schedDate = p.scheduled_at ? new Date(p.scheduled_at) : new Date(r.created_at);
        const uiStatus = deriveStatus(r.status, p.status);
        const apprStatus: "PENDING" | "APPROVED" | "FEEDBACK" =
          uiStatus === "scheduled" || uiStatus === "published" ? "APPROVED" : "PENDING";
        const cellPostStatus: "DRAFT" | "SCHEDULED" | "PUBLISHED" =
          uiStatus === "draft" ? "DRAFT" : uiStatus === "published" ? "PUBLISHED" : "SCHEDULED";

        list.push({
          id: `real-${r.id}-${p.platform}`,
          contentPlatformId: p.id,
          scheduledAtIso: schedDate.toISOString(),
          title: r.title,
          accountName: brand.name || "Marka",
          handle: (brand.name || "marka").toLowerCase().replace(/\s+/g, ""),
          timeLabel: schedDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          date: dateKey(schedDate),
          imageUrl: r.imageUrl || "/images/no-image-placeholder.png",
          imageIsVideo: r.imageIsVideo ?? false,
          caption: p.caption || r.title,
          tags: r.campaignName ? [r.campaignName] : ["Post"],
          category: r.metadata?.pillar || null,
          campaignName: r.campaignName ?? null,
          platform: p.platform || "instagram",
          approvalStatus: apprStatus,
          postStatus: cellPostStatus,
          commentCount: r.comments.length,
          isDemo: false,
        });
      }
    }
    return list;
  }, [contentRows, brand.name]);

  const posts = useMemo(
    () => (showDemo ? [...realPosts, ...demoPosts] : realPosts),
    [realPosts, demoPosts, showDemo]
  );
  const meetings: CalendarMeeting[] = showDemo ? CALENDAR_MEETINGS : [];

  const todayKey = dateKey(new Date());
  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);

  // Modals & Drawers state
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  // Month view caps how many posts a day cell shows inline — this opens the
  // full day (CalendarDayModal) for everything past that, or just to browse
  // a day without cramming its whole agenda into a small grid cell.
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);
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

  // Fetch real content — same fetchContentRows() Gönderiler uses (see
  // @/lib/content/approvalItems), so Calendar's placements and its detail
  // modal both read from one real dataset instead of two divergent fetches.
  useEffect(() => {
    let ignore = false;
    (async () => {
      const list = await fetchContentRows(supabase, brand.id);
      if (!ignore) setContentRows(list);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, refreshKey]);

  // Team roster for the detail modal's "Onaya ata" picker — same
  // brand -> organization_id -> organization_members path as Gönderiler.
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data: brandRow } = await supabase.from("brands").select("organization_id").eq("id", brand.id).maybeSingle();
      if (ignore || !brandRow) return;
      const { data: memberRows } = await supabase
        .from("organization_members")
        .select("user_id, profiles(full_name, email)")
        .eq("organization_id", brandRow.organization_id);
      if (ignore) return;
      setTeamMembers(
        (memberRows ?? []).map((m) => {
          const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
          return { userId: m.user_id, name: p?.full_name || p?.email?.split("@")[0] || "Üye" };
        })
      );
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

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

  // Detail modal actions — same shared mutations Gönderiler uses
  // (@/lib/content/approvalItems), so "reject" / "delete" / "approve" mean
  // exactly the same thing in both places.
  function toggleApprove(id: string) {
    const row = contentRows.find((r) => r.id === id);
    if (!row) return;
    const nextStatus = row.status === "APPROVED" ? "NEEDS_REVIEW" : "APPROVED";
    setContentRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)));
    setContentApproval(supabase, id, nextStatus).then(({ error }) => {
      if (error) console.error("Onay durumu kaydedilemedi:", error.message);
    });
  }

  async function rejectContent(id: string) {
    const { error } = await rejectContentRow(supabase, id);
    if (error) {
      console.error("Taslağa gönderilemedi:", error.message);
      return;
    }
    setContentRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "DRAFT" } : r)));
  }

  async function deleteContentItem(id: string) {
    const { error } = await deleteContentRow(supabase, id);
    if (error) {
      console.error("İçerik silinemedi:", error.message);
      return;
    }
    setContentRows((prev) => prev.filter((r) => r.id !== id));
  }

  async function saveTags(id: string, nextTags: string[]) {
    setContentRows((prev) => prev.map((r) => (r.id === id ? { ...r, tags: nextTags } : r)));
    const { error } = await setContentTags(supabase, id, nextTags);
    if (error) console.error("Etiketler kaydedilemedi:", error.message);
  }

  function handleAssign(id: string, userId: string | null) {
    const assignedTo = userId ? { id: userId, name: teamMembers.find((m) => m.userId === userId)?.name ?? "Üye" } : null;
    setContentRows((prev) => prev.map((r) => (r.id === id ? { ...r, assignedTo } : r)));
    assignContentRow(supabase, id, userId).then(({ error }) => {
      if (error) console.error("Atama kaydedilemedi:", error.message);
    });
  }

  function addComment(id: string, text: string) {
    const newComment: ApprovalComment = { id: "c-" + Date.now(), authorName: "Sen", avatarText: "O", timeAgo: "az önce", text, isCurrentUser: true };
    setContentRows((prev) => prev.map((r) => (r.id === id ? { ...r, comments: [newComment, ...r.comments] } : r)));
    supabase
      .auth.getUser()
      .then(({ data: { user } }) => insertContentComment(supabase, id, user?.id ?? null, text))
      .then(({ error }) => {
        if (error) console.error("Yorum kaydedilemedi:", error.message);
      });
  }

  // Drag and drop — move a post card to a different day, OR drag a Medya
  // panel thumbnail onto a day to open Compose pre-filled with that date and
  // photo/video already attached (dnd-kit's `data` on the draggable tells
  // handleDragEnd which of the two this is).
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [activeDragPost, setActiveDragPost] = useState<CalendarPost | null>(null);
  // A whole checkbox-selected group from CalendarMediaPanel drags together
  // (see its DraggableThumb) — always an array, even for a lone thumbnail.
  const [activeDragMedia, setActiveDragMedia] = useState<MediaLibraryItem[] | null>(null);

  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "media") {
      setActiveDragMedia(event.active.data.current.items as MediaLibraryItem[]);
      return;
    }
    const post = posts.find((p) => p.id === String(event.active.id));
    setActiveDragPost(post ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const draggedMedia = activeDragMedia;
    setActiveDragPost(null);
    setActiveDragMedia(null);
    if (!over) return;
    const newDateKey = String(over.id);
    if (newDateKey < todayKey) return; // dropping onto a past day is a no-op, not an error

    if (draggedMedia && draggedMedia.length > 0) {
      composeModal.open({ date: newDateKey, initialMedia: draggedMedia, onSaved: () => setRefreshKey((k) => k + 1) });
      return;
    }

    const postId = String(active.id);
    const post = posts.find((p) => p.id === postId);
    if (!post || post.date === newDateKey) return;
    // Belt-and-suspenders — CalendarPostCard already refuses to start a drag
    // for a published post (draggable=false), this just makes sure nothing
    // can move one even if that ever changes.
    if (post.postStatus === "PUBLISHED") return;

    if (post.isDemo) {
      setDemoPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, date: newDateKey } : p)));
      return;
    }

    if (post.contentPlatformId && post.scheduledAtIso) {
      const original = new Date(post.scheduledAtIso);
      const [y, m, d] = newDateKey.split("-").map(Number);
      const moved = new Date(original);
      moved.setFullYear(y, m - 1, d);
      const movedIso = moved.toISOString();

      setContentRows((prev) =>
        prev.map((r) => ({
          ...r,
          content_platforms: r.content_platforms.map((p) =>
            p.id === post.contentPlatformId ? { ...p, scheduled_at: movedIso } : p
          ),
        }))
      );

      supabase
        .from("content_platforms")
        .update({ scheduled_at: movedIso })
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

  // The clicked chip is one (content, platform) pair; the detail modal
  // shows the whole content item (every platform's caption at once) with
  // the clicked platform as its hero card — same shape rowToApprovalItem
  // already produces for Gönderiler, just with `platform`/`caption`
  // overridden to match what was actually clicked.
  const selectedApprovalItem = useMemo<ApprovalItem | null>(() => {
    if (!selectedPost) return null;
    if (selectedPost.isDemo) {
      return {
        id: selectedPost.id,
        title: selectedPost.title,
        accountName: selectedPost.accountName,
        handle: selectedPost.handle,
        timeLabel: selectedPost.timeLabel,
        fullDateLabel: selectedPost.date,
        imageUrl: selectedPost.imageUrl,
        imageIsVideo: selectedPost.imageIsVideo,
        caption: selectedPost.caption,
        status: "NEEDS_REVIEW",
        campaignName: selectedPost.campaignName,
        tags: selectedPost.tags,
        platform: selectedPost.platform,
        comments: [],
        isDemo: true,
        assignedTo: null,
        realStatus: "review",
        platforms: [{ platform: selectedPost.platform, caption: selectedPost.caption }],
      };
    }
    const row = contentRows.find((r) => r.content_platforms.some((p) => p.id === selectedPost.contentPlatformId));
    if (!row) return null;
    const item = rowToApprovalItem(row, brand.name);
    const match = item.platforms?.find((p) => p.platform === selectedPost.platform);
    return match ? { ...item, platform: selectedPost.platform, caption: match.caption } : item;
  }, [selectedPost, contentRows, brand.name]);

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
          onOpenMedia={() => setMediaLibraryOpen((v) => !v)}
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
              onOpenDay={setDayModalDate}
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

          {/* Docked Medya panel — a real flex sibling (not an overlay), so
              opening it visibly narrows the calendar instead of covering it. */}
          <CalendarMediaPanel
            brandId={brand.id}
            isOpen={mediaLibraryOpen}
            onClose={() => setMediaLibraryOpen(false)}
          />
        </div>

        {/* Post Detail Modal — same ApprovalDetailModal Gönderiler uses, so
            status/reject/delete/comments/share all behave identically no
            matter which page you clicked the post from. */}
        {selectedApprovalItem && (
          <ApprovalDetailModal
            item={selectedApprovalItem}
            index={selectedIndex}
            total={filteredPosts.length}
            onClose={() => setSelectedPost(null)}
            onPrev={() => {
              if (selectedIndex > 0) setSelectedPost(filteredPosts[selectedIndex - 1]);
            }}
            onNext={() => {
              if (selectedIndex + 1 < filteredPosts.length) setSelectedPost(filteredPosts[selectedIndex + 1]);
            }}
            onToggleApprove={toggleApprove}
            onAddComment={addComment}
            teamMembers={teamMembers}
            onAssign={handleAssign}
            onEditTags={saveTags}
            onReject={rejectContent}
            onDelete={deleteContentItem}
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

        {dayModalDate && (
          <CalendarDayModal
            dateKey={dayModalDate}
            posts={posts.filter((p) => p.date === dayModalDate)}
            notes={notes.filter((n) => n.date === dayModalDate)}
            campaign={campaigns.find((c) => dayModalDate >= c.start_date && dayModalDate <= c.end_date)}
            isPast={dayModalDate < todayKey}
            onClose={() => setDayModalDate(null)}
            onSelectPost={(post) => {
              setDayModalDate(null);
              setSelectedPost(post);
            }}
            onAddPostAtDate={(dateStr) => {
              setDayModalDate(null);
              handleOpenComposeAtDate(dateStr);
            }}
            onSmartFillDate={(dateStr) => {
              setDayModalDate(null);
              setSmartFillCategory(undefined);
              setSmartFillDate(dateStr);
            }}
            onAddNote={addNote}
            onSaveNoteText={saveNoteText}
            onNoteColorChange={changeNoteColor}
            onDeleteNote={deleteNote}
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
        ) : activeDragMedia && activeDragMedia.length > 0 ? (
          <div className="relative h-20 w-20 rotate-3">
            <div className="h-20 w-20 overflow-hidden rounded-xl border-2 border-white shadow-xl">
              {activeDragMedia[0].file_type.startsWith("video/") ? (
                <video src={activeDragMedia[0].file_url} muted className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeDragMedia[0].file_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            {activeDragMedia.length > 1 && (
              <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[11px] font-bold text-white shadow-md">
                +{activeDragMedia.length - 1}
              </span>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
