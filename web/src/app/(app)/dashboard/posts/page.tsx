"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { useComposeModal } from "@/components/dashboard/ComposeModalProvider";
import { createClient } from "@/lib/supabase/client";
import { STATUS_LABEL, type UIStatus } from "@/lib/contentStatus";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import type { ApprovalItem, ApprovalComment, TeamMemberOption } from "@/components/dashboard/approvals/types";
import { INITIAL_APPROVALS } from "@/components/dashboard/approvals/initialApprovalsData";
import ApprovalCard from "@/components/dashboard/approvals/ApprovalCard";
import ApprovalDetailModal from "@/components/dashboard/approvals/ApprovalDetailModal";
import BatchReviewModal from "@/components/dashboard/approvals/BatchReviewModal";

type PlatformRow = {
  id?: string;
  platform: PlatformName;
  status: string;
  scheduled_at: string | null;
  caption?: string | null;
  hashtags?: string[] | null;
};

type ContentRow = {
  id: string;
  title: string;
  body?: string | null;
  status: string;
  created_at: string;
  imageUrl?: string | null;
  imageIsVideo?: boolean;
  metadata?: {
    hook?: string;
    visualPrompt?: string;
    pillar?: string;
  } | null;
  tags: string[];
  format: string;
  content_platforms: PlatformRow[];
  campaignName?: string | null;
  assignedTo?: { id: string; name: string } | null;
  comments: ApprovalComment[];
};

const FORMAT_BADGE: Record<string, string> = { post: "📄 Gönderi", story: "⚡ Hikaye", reel: "🎬 Makara" };

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
  const hookMatch = coreIdea.match(/Kanca(?:\s*\(Hook\))?:\s*([^\n]+)/i);
  const visualMatch = coreIdea.match(/Görsel\/Video Konsepti:\s*([\s\S]+)/i);
  return {
    hook: hookMatch ? hookMatch[1].trim() : null,
    visualPrompt: visualMatch ? visualMatch[1].trim() : (!hookMatch ? coreIdea : null),
  };
}

const FILTERS: { key: "all" | UIStatus; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "draft", label: "Taslaklar" },
  { key: "review", label: "Onay Bekleyen" },
  { key: "scheduled", label: "Zamanlandı" },
  { key: "published", label: "Yayınlandı" },
  { key: "failed", label: "Hata" },
];

function overallStatus(row: ContentRow): UIStatus {
  const platforms = row.content_platforms ?? [];
  if (platforms.some((p) => p.status === "NEEDS_USER_ACTION" || p.status === "FAILED")) return "failed";
  if (row.status === "PUBLISHED" || row.status === "PARTIALLY_PUBLISHED") return "published";
  if (row.status === "APPROVED" || row.status === "SCHEDULED") return "scheduled";
  if (row.status === "DRAFT" || row.status === "IDEA" || row.status === "GENERATING") return "draft";
  return "review";
}

/*
  Single mapper from the raw fetched row into the shape both the Kanban
  board (ApprovalCard/ApprovalDetailModal, ported from the old standalone
  Onaylarım page) and the shared detail modal need. `status` is the
  3-way NEEDS_REVIEW/FEEDBACK_GIVEN/APPROVED kanban classification (only
  meaningful for kanban-eligible rows — see kanbanReal below); `realStatus`
  is the full 5-way UI status every row gets, which is what
  ApprovalDetailModal actually uses to decide whether an approve/reject
  decision even makes sense to offer.
*/
function rowToApprovalItem(row: ContentRow, brandName: string): ApprovalItem {
  const firstPlatform = row.content_platforms[0];
  const hasComments = row.comments.length > 0;
  const kanbanStatus: "NEEDS_REVIEW" | "FEEDBACK_GIVEN" | "APPROVED" =
    row.status === "APPROVED" ? "APPROVED" : hasComments ? "FEEDBACK_GIVEN" : "NEEDS_REVIEW";
  const createdDate = new Date(row.created_at);

  return {
    id: row.id,
    title: row.title,
    accountName: brandName || "Marka",
    handle: (brandName || "marka").toLowerCase().replace(/\s+/g, ""),
    timeLabel: createdDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    fullDateLabel: createdDate.toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    imageUrl: row.imageUrl || "",
    imageIsVideo: row.imageIsVideo ?? false,
    caption: firstPlatform?.caption || row.title,
    status: kanbanStatus,
    statusLabel: kanbanStatus === "APPROVED" ? "Onaylı" : "Askıda olması",
    campaignName: row.campaignName ?? null,
    tags: row.tags,
    platform: firstPlatform?.platform || "instagram",
    comments: row.comments,
    isDemo: false,
    assignedTo: row.assignedTo ?? null,
    realStatus: overallStatus(row),
    platforms: row.content_platforms.map((p) => ({
      platform: p.platform,
      caption: p.caption || "",
      hashtags: p.hashtags ?? undefined,
      scheduledAt: p.scheduled_at,
    })),
    hook: row.metadata?.hook,
    visualPrompt: row.metadata?.visualPrompt,
    format: row.format,
  };
}

function PostsPageContent() {
  const brand = useBrand();
  const composeModal = useComposeModal();
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<ContentRow[] | null>(null);
  // "Onaylarım" used to be its own page and deep-linked here with
  // ?filter=review; the merged page keeps both entry points working —
  // ?filter= picks the List tab's status filter, ?view=kanban jumps
  // straight to the board (matches the old Onaylarım sidebar badge link).
  const [filter, setFilter] = useState<"all" | UIStatus>(() => {
    const param = searchParams.get("filter");
    return FILTERS.some((f) => f.key === param) ? (param as "all" | UIStatus) : "all";
  });
  const [boardMode, setBoardMode] = useState<"list" | "kanban">(() =>
    searchParams.get("view") === "kanban" ? "kanban" : "list"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  // Demo board only ever applies to Kanban — Gönderiler's List view never
  // had sample data and doesn't need it; a real customer's list should
  // never show someone else's brand's sample posts.
  const [showDemo, setShowDemo] = useState(false);
  const [demoItems, setDemoItems] = useState<ApprovalItem[]>(INITIAL_APPROVALS);

  // Team roster for the "Onaya ata" picker — same brand -> organization_id
  // -> organization_members path used in CalendarHeader/Settings.
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

  // Load content — every status now (List used to fetch everything;
  // Onaylarım used to fetch only NEEDS_REVIEW/APPROVED separately). One
  // fetch, both views derive from it.
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from("content")
        .select(
          "id, title, core_idea, category, status, created_at, tags, format, assigned_to, assignee:profiles!assigned_to(full_name, email), campaigns(name), content_media(media(file_url, file_type)), content_platforms(id, platform, caption, hashtags, status, scheduled_at)"
        )
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false })
        .limit(200);

      if (ignore) return;
      if (error) {
        console.error("Gönderiler yüklenemedi:", error.message);
        setRows([]);
        return;
      }

      const list = data as unknown as Array<Record<string, unknown>>;
      const ids = list.map((r) => String(r.id));
      const commentsByContent = new Map<string, ApprovalComment[]>();

      if (ids.length > 0) {
        const { data: comments } = await supabase
          .from("content_comments")
          .select("id, content_id, body, created_at, is_external, author:profiles(full_name, email)")
          .in("content_id", ids)
          .order("created_at", { ascending: true });

        for (const c of (comments ?? []) as unknown as Array<{
          id: string;
          content_id: string;
          body: string;
          created_at: string;
          is_external?: boolean;
          author?: { full_name?: string | null; email?: string | null } | { full_name?: string | null; email?: string | null }[];
        }>) {
          const authorRow = Array.isArray(c.author) ? c.author[0] : c.author;
          const authorName = c.is_external ? "Dış Paylaşım" : authorRow?.full_name || authorRow?.email?.split("@")[0] || "Ekip Üyesi";
          const commList = commentsByContent.get(c.content_id) ?? [];
          commList.push({
            id: c.id,
            authorName,
            avatarText: c.is_external ? "🔗" : authorName.charAt(0).toUpperCase(),
            timeAgo: new Date(c.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
            text: c.body,
            isExternal: c.is_external,
          });
          commentsByContent.set(c.content_id, commList);
        }
      }

      if (ignore) return;
      setRows(
        list.map((r) => {
          const { hook, visualPrompt } = parseCoreIdea(r.core_idea as string | null);
          const media = firstMedia(r.content_media);
          const campaign = r.campaigns as { name?: string } | { name?: string }[] | null;
          const campaignName = Array.isArray(campaign) ? campaign[0]?.name : campaign?.name;
          const assigneeRow = r.assignee as { full_name?: string | null; email?: string | null } | { full_name?: string | null; email?: string | null }[] | null;
          const assignee = Array.isArray(assigneeRow) ? assigneeRow[0] : assigneeRow;
          const assignedTo =
            r.assigned_to && assignee
              ? { id: String(r.assigned_to), name: assignee.full_name || assignee.email?.split("@")[0] || "Üye" }
              : null;

          return {
            id: String(r.id),
            title: String(r.title || "(Başlıksız)"),
            body: (r.core_idea as string) ?? null,
            status: String(r.status),
            created_at: String(r.created_at),
            imageUrl: media?.url ?? null,
            imageIsVideo: media?.isVideo ?? false,
            metadata: {
              hook: hook ?? undefined,
              visualPrompt: visualPrompt ?? undefined,
              pillar: (r.category as string) ?? undefined,
            },
            tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
            format: String(r.format || "post"),
            content_platforms: (r.content_platforms ?? []) as PlatformRow[],
            campaignName: campaignName ?? null,
            assignedTo,
            comments: commentsByContent.get(String(r.id)) ?? [],
          };
        })
      );
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, refreshKey]);

  const loading = rows === null;
  const allRows = useMemo(() => rows ?? [], [rows]);
  const allItems = useMemo(() => allRows.map((r) => rowToApprovalItem(r, brand.name)), [allRows, brand.name]);

  // ============= LIST MODE: filter + search over every status =============
  const filtered = useMemo(() => {
    let result = filter === "all" ? allItems : allItems.filter((i) => i.realStatus === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.hook?.toLowerCase().includes(q) ||
          i.caption.toLowerCase().includes(q) ||
          i.platforms?.some((p) => p.caption.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allItems, filter, searchQuery]);

  const reviewIds = useMemo(() => allRows.filter((r) => r.status === "NEEDS_REVIEW").map((r) => r.id), [allRows]);

  // ============= KANBAN MODE: only NEEDS_REVIEW/APPROVED-eligible rows =============
  const kanbanReal = useMemo(
    () => allItems.filter((i) => i.realStatus === "review" || i.realStatus === "scheduled"),
    [allItems]
  );
  const kanbanAll = useMemo(() => (showDemo ? [...kanbanReal, ...demoItems] : kanbanReal), [kanbanReal, demoItems, showDemo]);
  const { pendingReview, feedbackGiven, approved } = useMemo(
    () => ({
      pendingReview: kanbanAll.filter((i) => i.status === "NEEDS_REVIEW"),
      feedbackGiven: kanbanAll.filter((i) => i.status === "FEEDBACK_GIVEN"),
      approved: kanbanAll.filter((i) => i.status === "APPROVED"),
    }),
    [kanbanAll]
  );
  const kanbanQueue = useMemo(() => [...pendingReview, ...feedbackGiven, ...approved], [pendingReview, feedbackGiven, approved]);

  const navigationQueue = boardMode === "kanban" ? kanbanQueue : filtered;
  const selectedItem = navigationQueue.find((i) => i.id === selectedId) ?? null;
  const selectedIndex = selectedItem ? navigationQueue.findIndex((i) => i.id === selectedItem.id) : -1;

  async function approve(id: string) {
    setBusyId(id);
    const { error } = await supabase.from("content").update({ status: "APPROVED" }).eq("id", id);
    setBusyId(null);
    if (error) {
      console.error("Onaylanamadı:", error.message);
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)) : prev));
    setRefreshKey((k) => k + 1);
  }

  async function reject(id: string) {
    setBusyId(id);
    const { error } = await supabase.from("content").update({ status: "DRAFT" }).eq("id", id);
    setBusyId(null);
    if (error) {
      console.error("Taslağa gönderilemedi:", error.message);
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, status: "DRAFT" } : r)) : prev));
    setRefreshKey((k) => k + 1);
  }

  // Kanban's binary approve/unapprove toggle — distinct from reject() above
  // (which sends a review item all the way back to Taslak); this just flips
  // between NEEDS_REVIEW and APPROVED, matching the old Onaylarım behavior
  // exactly, including its demo-item handling.
  function toggleApprove(id: string) {
    const demoTarget = demoItems.find((i) => i.id === id);
    if (demoTarget) {
      const nextStatus: "NEEDS_REVIEW" | "APPROVED" = demoTarget.status === "APPROVED" ? "NEEDS_REVIEW" : "APPROVED";
      setDemoItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: nextStatus, statusLabel: nextStatus === "APPROVED" ? "Onaylı" : "Askıda olması" } : i))
      );
      return;
    }
    const row = allRows.find((r) => r.id === id);
    if (!row) return;
    const nextStatus = row.status === "APPROVED" ? "NEEDS_REVIEW" : "APPROVED";
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)) : prev));
    supabase.from("content").update({ status: nextStatus }).eq("id", id).then(({ error }) => {
      if (error) console.error("Onay durumu kaydedilemedi:", error.message);
    });
  }

  async function saveTags(id: string, nextTags: string[]) {
    const demoTarget = demoItems.find((i) => i.id === id);
    if (demoTarget) {
      setDemoItems((prev) => prev.map((i) => (i.id === id ? { ...i, tags: nextTags } : i)));
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, tags: nextTags } : r)) : prev));
    const { error } = await supabase.from("content").update({ tags: nextTags }).eq("id", id);
    if (error) console.error("Etiketler kaydedilemedi:", error.message);
  }

  function addComment(itemId: string, text: string) {
    const demoTarget = demoItems.find((i) => i.id === itemId);
    const newComment: ApprovalComment = { id: "c-" + Date.now(), authorName: "Sen", avatarText: "O", timeAgo: "az önce", text, isCurrentUser: true };
    if (demoTarget) {
      setDemoItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, comments: [newComment, ...i.comments] } : i)));
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === itemId ? { ...r, comments: [newComment, ...r.comments] } : r)) : prev));
    supabase
      .auth.getUser()
      .then(({ data: { user } }) => supabase.from("content_comments").insert({ content_id: itemId, author_id: user?.id ?? null, body: text }))
      .then(({ error }) => {
        if (error) console.error("Yorum kaydedilemedi:", error.message);
      });
  }

  function handleAssign(itemId: string, userId: string | null) {
    const demoTarget = demoItems.find((i) => i.id === itemId);
    const assignedTo = userId ? { id: userId, name: teamMembers.find((m) => m.userId === userId)?.name ?? "Üye" } : null;
    if (demoTarget) {
      setDemoItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, assignedTo } : i)));
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === itemId ? { ...r, assignedTo } : r)) : prev));
    supabase.from("content").update({ assigned_to: userId }).eq("id", itemId).then(({ error }) => {
      if (error) console.error("Atama kaydedilemedi:", error.message);
    });
  }

  async function approveAll() {
    if (reviewIds.length === 0) return;
    const { error } = await supabase.from("content").update({ status: "APPROVED" }).in("id", reviewIds);
    if (error) {
      console.error("Toplu onaylanamadı:", error.message);
      return;
    }
    if (showDemo) {
      setDemoItems((prev) => prev.map((i) => (i.status === "APPROVED" ? i : { ...i, status: "APPROVED", statusLabel: "Onaylı" })));
    }
    setToastMessage("Tüm gönderiler başarıyla onaylandı!");
    setTimeout(() => setToastMessage(null), 3000);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden">
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-3">
          ✓ {toastMessage}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* 1. Header & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Gönderiler & Onay Masası
              </h1>
              <p className="mt-1 text-sm text-slate-500 font-medium">
                AI tarafından üretilen içerikleri inceleyin, onaylayın veya tek tıkla düzenleyin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {boardMode === "kanban" && (
                <button
                  type="button"
                  onClick={() => setShowDemo((v) => !v)}
                  title="Panonun tasarımını örnek gönderilerle önizle — gerçek verini etkilemez"
                  className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    showDemo ? "bg-rose-100 text-rose-700" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  🧪 Örnek verileri {showDemo ? "gizle" : "göster"}
                </button>
              )}

              {reviewIds.length > 0 && (
                <button
                  type="button"
                  onClick={approveAll}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Hepsini Onayla ({reviewIds.length})</span>
                </button>
              )}

              <Link
                href="/dashboard/compose/weekly"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FA5252] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-500/25 hover:bg-rose-600 transition"
              >
                <span>⚡ 7 Günlük Paket</span>
              </Link>

              <button
                type="button"
                onClick={() => composeModal.open()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Yeni Gönderi</span>
              </button>
            </div>
          </div>

          {/* Liste / Kanban geçişi */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-1 text-xs font-semibold w-fit">
            <button
              type="button"
              onClick={() => setBoardMode("list")}
              className={`rounded-lg px-4 py-1.5 transition cursor-pointer ${
                boardMode === "list" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => setBoardMode("kanban")}
              className={`rounded-lg px-4 py-1.5 transition cursor-pointer ${
                boardMode === "kanban" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Kanban
            </button>
          </div>

          {boardMode === "list" ? (
            <>
              {/* 2. Filters Bar & View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {FILTERS.map((f) => {
                    const count = f.key === "all" ? allItems.length : allItems.filter((i) => i.realStatus === f.key).length;
                    const active = filter === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setFilter(f.key)}
                        className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                          active
                            ? "bg-slate-900 text-white shadow-xs"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{f.label}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                            active ? "bg-white/20 text-white" : f.key === "review" && count > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Gönderilerde ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 sm:w-60 rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>

                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                        viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                      }`}
                      title="Kart Izgarası Görünümü"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" strokeWidth={2} />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" strokeWidth={2} />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" strokeWidth={2} />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" strokeWidth={2} />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                        viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                      }`}
                      title="Liste Görünümü"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <line x1="4" y1="6" x2="20" y2="6" strokeWidth={2} strokeLinecap="round" />
                        <line x1="4" y1="12" x2="20" y2="12" strokeWidth={2} strokeLinecap="round" />
                        <line x1="4" y1="18" x2="20" y2="18" strokeWidth={2} strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Main Content: Grid or List View */}
              {loading ? (
                <div className="flex h-72 items-center justify-center rounded-[22px] border border-slate-100 bg-white text-sm text-slate-400">
                  Gönderiler yükleniyor...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-200 bg-white py-16 text-center shadow-xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-800">Henüz gönderi bulunamadı</h3>
                  <p className="max-w-md text-xs text-slate-500">
                    Filtreye uygun içerik yok veya henüz içerik oluşturulmadı. AI ile 1 dakikada 5&apos;li veya 7&apos;li paket oluşturabilirsiniz.
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Link
                      href="/dashboard/compose/weekly"
                      className="rounded-xl bg-[#FA5252] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-500/20 hover:bg-rose-600 transition"
                    >
                      Haftalık Paket Üret 🚀
                    </Link>
                    <button
                      type="button"
                      onClick={() => composeModal.open()}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Tekli Gönderi Yaz
                    </button>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((item) => {
                    const status = item.realStatus ?? "review";
                    const platforms = item.platforms ?? [];
                    const scheduledAt = platforms[0]?.scheduledAt;

                    return (
                      <div
                        key={item.id}
                        className="group flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="space-y-3.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {platforms.length > 0 ? (
                                platforms.map((p, idx) => (
                                  <PlatformIcon key={idx} name={p.platform} className="h-6 w-6 rounded-md shadow-2xs" />
                                ))
                              ) : (
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">GENEL</span>
                              )}
                              {scheduledAt && (
                                <span className="font-mono text-[10px] text-slate-400 ml-1">
                                  {new Date(scheduledAt).toLocaleDateString("tr-TR", { weekday: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.format && item.format !== "post" && (
                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                  {FORMAT_BADGE[item.format] ?? item.format}
                                </span>
                              )}
                              <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold tracking-tight ${STATUS_LABEL[status].className}`}>
                                {STATUS_LABEL[status].label}
                              </span>
                            </div>
                          </div>

                          <div
                            onClick={() => setSelectedId(item.id)}
                            className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-slate-50 group-hover:border-slate-200 transition"
                          >
                            {item.imageUrl ? (
                              item.imageIsVideo ? (
                                <video src={item.imageUrl} controls className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              ) : (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              )
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-slate-50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-500 shadow-xs mb-2">
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <span className="text-[10px] font-bold text-slate-700">
                                  {item.visualPrompt ? "Görsel Konsepti Hazır" : "Görsel Bekleniyor"}
                                </span>
                                <p className="mt-1 line-clamp-2 text-[10px] text-slate-400">
                                  {item.visualPrompt || "AI tarafından metne uygun görsel henüz üretilmedi."}
                                </p>
                              </div>
                            )}

                            {item.hook && (
                              <div className="absolute left-2.5 top-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-2xs backdrop-blur-xs line-clamp-1 max-w-[85%]">
                                🪝 {item.hook}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <h3
                              onClick={() => setSelectedId(item.id)}
                              className="cursor-pointer font-display text-sm font-bold text-slate-900 transition group-hover:text-rose-600 line-clamp-1"
                            >
                              {item.title}
                            </h3>

                            <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed">{item.caption}</p>

                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((t) => (
                                  <span key={t} className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            İncele
                          </button>

                          <div className="flex items-center gap-1.5">
                            {status === "review" && (
                              <>
                                <button
                                  type="button"
                                  disabled={busyId === item.id}
                                  onClick={() => reject(item.id)}
                                  className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:border-red-200 hover:text-red-600 transition disabled:opacity-40"
                                  title="Taslağa Geri Al"
                                >
                                  Reddet
                                </button>
                                <button
                                  type="button"
                                  disabled={busyId === item.id}
                                  onClick={() => approve(item.id)}
                                  className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-40"
                                >
                                  ✓ Onayla
                                </button>
                              </>
                            )}
                            {status === "scheduled" && (
                              <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <span>⏳</span> Yayına Hazır
                              </span>
                            )}
                            {status === "published" && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <span>✓</span> Yayında
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="border-b border-slate-100 bg-slate-50/70 font-mono text-[10px] uppercase font-bold text-slate-400">
                        <tr>
                          <th className="px-5 py-3.5">İçerik / Kanca</th>
                          <th className="px-4 py-3.5">Platformlar</th>
                          <th className="px-4 py-3.5">Tarih</th>
                          <th className="px-4 py-3.5">Durum</th>
                          <th className="px-5 py-3.5 text-right">Eylemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.map((item) => {
                          const status = item.realStatus ?? "review";
                          const platforms = item.platforms ?? [];

                          return (
                            <tr key={item.id} onClick={() => setSelectedId(item.id)} className="cursor-pointer hover:bg-slate-50/70 transition">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  {item.imageUrl ? (
                                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 shadow-xs">
                                      {item.imageIsVideo ? (
                                        <video src={item.imageUrl} muted playsInline className="h-full w-full object-cover" />
                                      ) : (
                                        <Image src={item.imageUrl} alt="" fill className="object-cover" />
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="font-display font-bold text-slate-900 truncate">{item.title}</p>
                                    {item.hook && <p className="text-[11px] text-slate-500 truncate mt-0.5">&ldquo;{item.hook}&rdquo;</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1">
                                  {platforms.map((p, idx) => (
                                    <PlatformIcon key={idx} name={p.platform} className="h-5 w-5 rounded-md" />
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-4 font-mono text-[11px] text-slate-500">{item.fullDateLabel}</td>
                              <td className="px-4 py-4">
                                <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold ${STATUS_LABEL[status].className}`}>
                                  {STATUS_LABEL[status].label}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                {status === "review" ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button type="button" onClick={() => reject(item.id)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-red-600">
                                      Reddet
                                    </button>
                                    <button type="button" onClick={() => approve(item.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700">
                                      Onayla
                                    </button>
                                  </div>
                                ) : (
                                  <button type="button" onClick={() => setSelectedId(item.id)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                    İncele
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ================= KANBAN BOARD (ported from Onaylarım) ================= */
            <div className="flex h-full gap-6 min-w-[900px]">
              {loading && <p className="mb-3 text-center text-xs text-slate-400">Onay kuyruğu yükleniyor...</p>}
              <section className="flex flex-1 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/40 p-4">
                <div className="mb-3.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-sm">🟡</span>
                    <h2 className="text-xs font-bold text-slate-800">Onay bekleniyor</h2>
                  </div>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[11px] font-bold text-white shadow-xs">
                    {pendingReview.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
                  <button
                    type="button"
                    onClick={() => setBatchModalOpen(true)}
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3.5 text-center text-xs font-bold text-slate-700 shadow-2xs hover:border-blue-400 hover:text-blue-600 transition cursor-pointer"
                  >
                    İnceleme gönderileri
                  </button>
                  {pendingReview.map((item) => (
                    <ApprovalCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
                  ))}
                  {pendingReview.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs text-slate-400">Onay bekleyen gönderi kalmadı.</p>
                  )}
                </div>
              </section>

              <section className="flex flex-1 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/40 p-4">
                <div className="mb-3.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">💬</span>
                    <h2 className="text-xs font-bold text-slate-800">Geri bildirim bırakıldı</h2>
                  </div>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[11px] font-bold text-slate-600">
                    {feedbackGiven.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
                  {feedbackGiven.map((item) => (
                    <ApprovalCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
                  ))}
                  {feedbackGiven.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs text-slate-400">Geri bildirim bırakılmış gönderi yok.</p>
                  )}
                </div>
              </section>

              <section className="flex flex-1 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/40 p-4">
                <div className="mb-3.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 text-sm">🟢</span>
                    <h2 className="text-xs font-bold text-slate-800">Onaylı</h2>
                  </div>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-[11px] font-bold text-slate-600">
                    {approved.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
                  {approved.map((item) => (
                    <ApprovalCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
                  ))}
                  {approved.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs text-slate-400">Henüz onaylanmış gönderi yok.</p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Shared detail modal — used by both List and Kanban clicks. */}
      {selectedItem && (
        <ApprovalDetailModal
          item={selectedItem}
          index={selectedIndex}
          total={navigationQueue.length}
          onClose={() => setSelectedId(null)}
          onPrev={() => {
            if (selectedIndex > 0) setSelectedId(navigationQueue[selectedIndex - 1].id);
          }}
          onNext={() => {
            if (selectedIndex + 1 < navigationQueue.length) setSelectedId(navigationQueue[selectedIndex + 1].id);
          }}
          onToggleApprove={toggleApprove}
          onAddComment={addComment}
          teamMembers={teamMembers}
          onAssign={handleAssign}
          onEditTags={saveTags}
        />
      )}

      {batchModalOpen && (
        <BatchReviewModal
          items={pendingReview.length > 0 ? pendingReview : kanbanQueue}
          onClose={() => setBatchModalOpen(false)}
          onApprove={toggleApprove}
          onAddComment={addComment}
        />
      )}
    </div>
  );
}

export default function PostsPage() {
  // PostsPageContent reads ?filter=/?view= via useSearchParams, which
  // Next.js requires a Suspense boundary for in production builds.
  return (
    <Suspense fallback={null}>
      <PostsPageContent />
    </Suspense>
  );
}
