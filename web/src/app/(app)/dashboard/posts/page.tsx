"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { getBrandTeam } from "@/lib/brandTeam";
import { useComposeModal } from "@/components/dashboard/ComposeModalProvider";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { STATUS_LABEL, type UIStatus } from "@/lib/contentStatus";
import PlatformIcon, { platformLabel } from "@/components/PlatformIcon";
import { INITIAL_APPROVALS } from "@/components/dashboard/approvals/initialApprovalsData";
import ApprovalCard from "@/components/dashboard/approvals/ApprovalCard";
import ApprovalDetailModal from "@/components/dashboard/approvals/ApprovalDetailModal";
import BatchReviewModal from "@/components/dashboard/approvals/BatchReviewModal";
import type { ApprovalComment, ApprovalItem, TeamMemberOption } from "@/components/dashboard/approvals/types";
import InstagramGridFeed from "@/components/dashboard/instagram/InstagramGridFeed";
import TikTokGridFeed from "@/components/dashboard/instagram/TikTokGridFeed";
import PinterestBoardFeed from "@/components/dashboard/instagram/PinterestBoardFeed";
import ThreadsTimelineFeed from "@/components/dashboard/instagram/ThreadsTimelineFeed";
import FacebookPageFeed from "@/components/dashboard/instagram/FacebookPageFeed";
import {
  fetchContentRows,
  rowToApprovalItem,
  approveContentRow,
  rejectContentRow,
  deleteContentRow,
  setContentApproval,
  setContentTags,
  assignContentRow,
  assignDraftRow,
  insertContentComment,
  type ContentRow,
} from "@/lib/content/approvalItems";

const FILTER_KEYS: ("all" | UIStatus)[] = ["all", "draft", "review", "scheduled", "published", "failed"];
const PAGE_SIZE = 18;
function PlatformStatusSummary({ item }: { item: ApprovalItem }) {
  if (!item.platforms?.length) return null;
  return <div className="flex flex-wrap gap-1.5" aria-label="Platform durumları">
    {item.platforms.map((platform) => {
      const status = platform.status ?? item.realStatus ?? "draft";
      return <span key={platform.id ?? platform.platform} title={platform.lastError ?? `${platformLabel(platform.platform)}: ${STATUS_LABEL[status].label}`}
        className={`inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold ${STATUS_LABEL[status].className}`}>
        <PlatformIcon name={platform.platform} className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{platformLabel(platform.platform)}</span>
        <span>{platform.rawStatus === "QUEUED" && platform.lastError ? "Tekrar deneniyor" : STATUS_LABEL[status].label}</span>
      </span>;
    })}
  </div>;
}
type PostsView = {
  name: string;
  status: "all" | UIStatus;
  platform: string;
  campaign: string;
  tag: string;
  assignee: string;
  period: string;
  sort: string;
  dateFrom?: string;
  dateTo?: string;
};

function PostsPageContent() {
  const brand = useBrand();
  const composeModal = useComposeModal();
  const { t, locale } = useLanguage();
  const isEn = locale === "en";
  const p = t.dashboard.posts;
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<ContentRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // "Onaylarım" used to be its own page and deep-linked here with
  // ?filter=review; the merged page keeps both entry points working —
  // ?filter= picks the List tab's status filter, ?view=kanban jumps
  // straight to the board (matches the old Onaylarım sidebar badge link).
  const [filter, setFilter] = useState<"all" | UIStatus>(() => {
    const param = searchParams.get("filter");
    return FILTER_KEYS.includes(param as "all" | UIStatus) ? (param as "all" | UIStatus) : "all";
  });

  const filters = useMemo<{ key: "all" | UIStatus; label: string }[]>(
    () => [
      { key: "all", label: p.tabs.all },
      { key: "draft", label: p.tabs.drafts },
      { key: "review", label: p.tabs.needsReview },
      { key: "scheduled", label: p.tabs.scheduled },
      { key: "published", label: p.tabs.published },
      { key: "failed", label: p.tabs.failed },
    ],
    [p.tabs]
  );
  const [boardMode, setBoardMode] = useState<"list" | "kanban">(() =>
    searchParams.get("view") === "kanban" ? "kanban" : "list"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list" | "instagram">("grid");
  const [feedPlatform, setFeedPlatform] = useState<"instagram" | "tiktok" | "pinterest" | "threads" | "facebook">("instagram");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(() => searchParams.get("post"));
  useEffect(() => {
    const linkedPost = searchParams.get("post");
    if (!linkedPost) return;
    const timer = window.setTimeout(() => setSelectedId(linkedPost), 0);
    return () => window.clearTimeout(timer);
  }, [searchParams]);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [savedViews, setSavedViews] = useState<PostsView[]>([]);
  const [viewName, setViewName] = useState("");
  const [viewNameOpen, setViewNameOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  // Demo board only ever applies to Kanban — Gönderiler's List view never
  // had sample data and doesn't need it; a real customer's list should
  // never show someone else's brand's sample posts.
  const [showDemo] = useState(false);
  const [demoItems, setDemoItems] = useState<ApprovalItem[]>(INITIAL_APPROVALS);

  // Team roster for the "Onaya ata" picker — same brand -> organization_id
  // -> organization_members path used in CalendarHeader/Settings.
  useEffect(() => {
    let ignore = false;
    (async () => {
      const [memberRows, { data: auth }] = await Promise.all([getBrandTeam(supabase, brand.id), supabase.auth.getUser()]);
      if (ignore) return;
      setCurrentUserId(auth.user?.id ?? null);
      setCanReview(Boolean(memberRows.some((member) => member.userId === auth.user?.id && ["owner", "admin"].includes(member.role))));
      setTeamMembers(memberRows.map((member) => ({ userId: member.userId, name: member.name, role: member.role })));
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  // Load content — every status now (List used to fetch everything;
  // Onaylarım used to fetch only NEEDS_REVIEW/APPROVED separately). One
  // fetch, both views derive from it. Shared with Calendar (@/lib/content/
  // approvalItems) so the two pages can't drift into showing a different
  // status for the same content again.
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const list = await fetchContentRows(supabase, brand.id, { throwOnError: true });
        if (!ignore) { setRows(list); setLoadError(null); }
      } catch (error) {
        if (!ignore) { setRows([]); setLoadError(error instanceof Error ? error.message : "Gönderiler yüklenemedi."); }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, refreshKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(`posts-views-${brand.id}`);
        setSavedViews(raw ? JSON.parse(raw) as PostsView[] : []);
      } catch { setSavedViews([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [brand.id]);

  const loading = rows === null;
  const allRows = useMemo(() => rows ?? [], [rows]);
  const allItems = useMemo(() => allRows.map((r) => rowToApprovalItem(r, brand.name)), [allRows, brand.name]);
  const platformsAvailable = useMemo(() => Array.from(new Set(allItems.flatMap((i) => i.platforms?.map((p) => p.platform) ?? []))).sort(), [allItems]);
  const campaignsAvailable = useMemo(() => Array.from(new Set(allItems.map((i) => i.campaignName).filter((name): name is string => Boolean(name)))).sort(), [allItems]);
  const tagsAvailable = useMemo(() => Array.from(new Set(allItems.flatMap((i) => i.tags))).sort(), [allItems]);

  // ============= LIST MODE: filter + search over every status =============
  const filtered = useMemo(() => {
    let result = filter === "all" ? allItems : allItems.filter((i) => i.realStatus === filter);
    if (platformFilter !== "all") result = result.filter((i) => i.platforms?.some((p) => p.platform === platformFilter));
    if (campaignFilter !== "all") result = result.filter((i) => i.campaignName === campaignFilter);
    if (tagFilter !== "all") result = result.filter((i) => i.tags.includes(tagFilter));
    if (assigneeFilter === "unassigned") result = result.filter((i) => !i.assignedTo && !i.draftAssignedTo);
    else if (assigneeFilter !== "all") result = result.filter((i) => i.assignedTo?.id === assigneeFilter || i.draftAssignedTo?.id === assigneeFilter);
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfWeek = startOfDay + 7 * 86400000;
    if (periodFilter === "today") result = result.filter((i) => i.platforms?.some((p) => p.scheduledAt && new Date(p.scheduledAt).getTime() >= startOfDay && new Date(p.scheduledAt).getTime() < startOfDay + 86400000));
    if (periodFilter === "week") result = result.filter((i) => i.platforms?.some((p) => p.scheduledAt && new Date(p.scheduledAt).getTime() >= startOfDay && new Date(p.scheduledAt).getTime() < endOfWeek));
    if (periodFilter === "custom") result = result.filter((i) => i.platforms?.some((p) => {
      if (!p.scheduledAt) return false;
      const key = new Date(p.scheduledAt).toLocaleDateString("sv-SE");
      return (!dateFrom || key >= dateFrom) && (!dateTo || key <= dateTo);
    }));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLocaleLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.hook?.toLowerCase().includes(q) ||
          i.caption.toLowerCase().includes(q) ||
          i.platforms?.some((p) => p.caption.toLowerCase().includes(q))
      );
    }
    return [...result].sort((a, b) => {
      const aDate = sortBy === "schedule" ? a.platforms?.map((p) => p.scheduledAt).filter(Boolean).sort()[0] : a.createdAt;
      const bDate = sortBy === "schedule" ? b.platforms?.map((p) => p.scheduledAt).filter(Boolean).sort()[0] : b.createdAt;
      if (sortBy === "schedule" && !aDate) return bDate ? 1 : 0;
      if (sortBy === "schedule" && !bDate) return -1;
      return sortBy === "oldest" || sortBy === "schedule" ? String(aDate ?? "").localeCompare(String(bDate ?? "")) : String(bDate ?? "").localeCompare(String(aDate ?? ""));
    });
  }, [allItems, filter, searchQuery, platformFilter, campaignFilter, tagFilter, assigneeFilter, periodFilter, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedReviewIds = useMemo(() => allRows.filter((r) => r.status === "NEEDS_REVIEW" && selectedIds.includes(r.id) && filtered.some((item) => item.id === r.id)).map((r) => r.id), [allRows, selectedIds, filtered]);

  function applyView(view: PostsView) {
    setFilter(view.status); setPlatformFilter(view.platform); setCampaignFilter(view.campaign);
    setTagFilter(view.tag); setAssigneeFilter(view.assignee); setPeriodFilter(view.period);
    setDateFrom(view.dateFrom ?? ""); setDateTo(view.dateTo ?? "");
    setSortBy(view.sort); setPage(1); setSelectedIds([]);
  }

  function saveCurrentView() {
    const name = viewName.trim();
    if (!name) return;
    const view: PostsView = { name, status: filter, platform: platformFilter, campaign: campaignFilter,
      tag: tagFilter, assignee: assigneeFilter, period: periodFilter, sort: sortBy, dateFrom, dateTo };
    const next = [...savedViews.filter((item) => item.name !== name), view];
    setSavedViews(next);
    localStorage.setItem(`posts-views-${brand.id}`, JSON.stringify(next));
    setViewName(""); setViewNameOpen(false);
  }

  function deleteSavedView(name: string) {
    const next = savedViews.filter((item) => item.name !== name);
    setSavedViews(next);
    localStorage.setItem(`posts-views-${brand.id}`, JSON.stringify(next));
  }

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
    setActionError(null);
    setBusyId(id);
    const { data, error } = await approveContentRow(supabase, id);
    setBusyId(null);
    if (error || !data?.length) {
      setActionError(`Onaylanamadı: ${error?.message ?? "Kayıt güncellenmedi."} Yayın tarihi eksikse gönderi ayrıntısından tamamlayın.`);
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)) : prev));
    setRefreshKey((k) => k + 1);
  }

  async function reject(id: string) {
    setActionError(null);
    setBusyId(id);
    const { data, error } = await rejectContentRow(supabase, id);
    setBusyId(null);
    if (error || !data?.length) {
      setActionError(`Taslağa gönderilemedi: ${error?.message ?? "Kayıt güncellenmedi."}`);
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
    setContentApproval(supabase, id, nextStatus).then(({ data, error }) => {
      if (error || !data?.length) { setActionError(`Onay durumu kaydedilemedi: ${error?.message ?? "Kayıt güncellenmedi."}`); setRefreshKey((key) => key + 1); }
    });
  }

  async function deleteContent(id: string) {
    const demoTarget = demoItems.find((i) => i.id === id);
    if (demoTarget) {
      setDemoItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    const { data, error } = await deleteContentRow(supabase, id);
    if (error || !data?.length) {
      setActionError(`İçerik silinemedi: ${error?.message ?? "Kayıt silinmedi."}`);
      return;
    }
    setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
  }

  async function saveTags(id: string, nextTags: string[]) {
    const demoTarget = demoItems.find((i) => i.id === id);
    if (demoTarget) {
      setDemoItems((prev) => prev.map((i) => (i.id === id ? { ...i, tags: nextTags } : i)));
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, tags: nextTags } : r)) : prev));
    const { data, error } = await setContentTags(supabase, id, nextTags);
    if (error || !data?.length) { setActionError(`Etiketler kaydedilemedi: ${error?.message ?? "Kayıt güncellenmedi."}`); setRefreshKey((key) => key + 1); }
  }

  async function savePlatform(contentId: string, platformId: string, caption: string, scheduledAt: string | null): Promise<string | null> {
    const row = allRows.find((item) => item.id === contentId);
    const platform = row?.content_platforms.find((item) => item.id === platformId);
    if (!platform || !["DRAFT", "NEEDS_REVIEW", "PENDING", "NEEDS_USER_ACTION", "FAILED"].includes(platform.status)) return "Bu platform sürümü artık düzenlenemiyor.";
    if (!caption.trim()) return "Gönderi metni boş olamaz.";
    if (row?.status === "APPROVED" && (!scheduledAt || new Date(scheduledAt).getTime() <= Date.now())) return "Onaylı gönderi için gelecek bir yayın zamanı seçin.";
    const { data, error } = await supabase.from("content_platforms")
      .update({ caption, hashtags: Array.from(new Set(caption.match(/#[\p{L}0-9_]+/gu) ?? [])), scheduled_at: scheduledAt })
      .eq("id", platformId).eq("content_id", contentId).in("status", ["DRAFT", "NEEDS_REVIEW", "PENDING", "NEEDS_USER_ACTION", "FAILED"]).select("id");
    if (error || !data?.length) return error?.message ?? "Gönderi değişti. Sayfayı yenileyip tekrar deneyin.";
    setRefreshKey((key) => key + 1);
    return null;
  }

  async function retryPlatform(contentId: string, platformId: string): Promise<string | null> {
    const row = allRows.find((item) => item.id === contentId);
    const platform = row?.content_platforms.find((item) => item.id === platformId);
    if (!platform || !["NEEDS_USER_ACTION", "FAILED"].includes(platform.status)) return "Bu sürüm yeniden denemeye uygun değil.";
    const { error: contentError } = await supabase.from("content").update({ status: "APPROVED" }).eq("id", contentId).eq("brand_id", brand.id);
    if (contentError) return contentError.message;
    const { data, error } = await supabase.from("content_platforms")
      .update({ status: "PENDING", attempt_count: 0, next_retry_at: null, last_error: null, failure_code: null,
        scheduled_at: new Date(Date.now() + 2 * 60000).toISOString() })
      .eq("id", platformId).eq("content_id", contentId)
      .in("status", ["NEEDS_USER_ACTION", "FAILED"]).is("platform_post_id", null).select("id");
    if (error || !data?.length) { setRefreshKey((key) => key + 1); return error?.message ?? "Gönderi yeniden sıraya alınamadı. Yayınlanmış olabileceğini kontrol edin."; }
    setRefreshKey((key) => key + 1);
    return null;
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
      .then(({ data: { user } }) => insertContentComment(supabase, itemId, user?.id ?? null, text))
      .then(({ error }) => {
        if (error) { setActionError(`Yorum kaydedilemedi: ${error.message}`); setRefreshKey((key) => key + 1); }
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
    assignContentRow(supabase, itemId, userId).then(({ data, error }) => {
      if (error || !data?.length) { setActionError(`Atama kaydedilemedi: ${error?.message ?? "Kayıt güncellenmedi."}`); setRefreshKey((key) => key + 1); }
    });
  }

  async function handleAssignDraft(itemId: string, userId: string | null) {
    const { data, error } = await assignDraftRow(supabase, itemId, userId);
    if (error || !data?.length) {
      setActionError(`Taslak görevi atanamadı: ${error?.message ?? "Kayıt güncellenmedi."}`);
      return;
    }
    setRefreshKey((key) => key + 1);
  }

  async function sendForReview(itemId: string) {
    const { data, error } = await supabase.from("content")
      .update({ status: "NEEDS_REVIEW" }).eq("id", itemId).eq("status", "DRAFT").select("id");
    if (error || !data?.length) {
      setActionError(`Onaya gönderilemedi: ${error?.message ?? "Kayıt güncellenmedi."}`);
      return;
    }
    setRefreshKey((key) => key + 1);
  }

  async function approveAll() {
    if (selectedReviewIds.length === 0) return;
    const { data, error } = await supabase.from("content").update({ status: "APPROVED" }).in("id", selectedReviewIds).eq("brand_id", brand.id).eq("status", "NEEDS_REVIEW").select("id");
    if (error || data?.length !== selectedReviewIds.length) {
      setActionError(error?.message ?? "Bazı gönderiler onaylanamadı. Liste yenileniyor.");
      setRefreshKey((k) => k + 1);
      return;
    }
    if (showDemo) {
      setDemoItems((prev) => prev.map((i) => (i.status === "APPROVED" ? i : { ...i, status: "APPROVED", statusLabel: "Onaylı" })));
    }
    setToastMessage("Tüm gönderiler başarıyla onaylandı!");
    setSelectedIds([]);
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
          {actionError && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800"><span>{actionError}</span><button type="button" onClick={() => setActionError(null)} aria-label="Hata mesajını kapat" className="font-bold">✕</button></div>}
          {/* 1. Header & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {p.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500 font-medium">
                {p.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/dashboard/compose/weekly"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FA5252] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-rose-500/25 hover:bg-rose-600 transition"
              >
                <span>⚡ {p.weeklyPackage}</span>
              </Link>

              <button
                type="button"
                onClick={() => composeModal.open()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>{p.newPostBtn}</span>
              </button>
            </div>
          </div>

          {/* Liste / Kanban switch */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-1 text-xs font-semibold w-fit">
            <button
              type="button"
              onClick={() => setBoardMode("list")}
              className={`rounded-lg px-4 py-1.5 transition cursor-pointer ${
                boardMode === "list" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {p.list}
            </button>
            <button
              type="button"
              onClick={() => setBoardMode("kanban")}
              className={`rounded-lg px-4 py-1.5 transition cursor-pointer ${
                boardMode === "kanban" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {p.kanban}
            </button>
          </div>

          {boardMode === "list" ? (
            <>
              {/* 2. Filters Bar & View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {filters.map((f) => {
                    const count = f.key === "all" ? allItems.length : allItems.filter((i) => i.realStatus === f.key).length;
                    const active = filter === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => { setFilter(f.key); setPage(1); setSelectedIds([]); }}
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
                      placeholder={p.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
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
                      title="Grid"
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
                      title="List"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <line x1="4" y1="6" x2="20" y2="6" strokeWidth={2} strokeLinecap="round" />
                        <line x1="4" y1="12" x2="20" y2="12" strokeWidth={2} strokeLinecap="round" />
                        <line x1="4" y1="18" x2="20" y2="18" strokeWidth={2} strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("instagram")}
                      className={`flex h-7 items-center gap-1.5 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        viewMode === "instagram" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                      }`}
                      title={isEn ? "Profile & Feed Planner" : "Profil & Akış Planlayıcı"}
                    >
                      <span>📸</span>
                      <span className="hidden sm:inline">{isEn ? "Feed Planner" : "Akış Planlayıcı"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Hızlı görünümler</span>
                  <button type="button" onClick={() => applyView({ name: "Bugün işlem gerekenler", status: "review", platform: "all", campaign: "all", tag: "all", assignee: "all", period: "today", sort: "schedule" })} className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 hover:bg-amber-100">Bugün onay bekleyenler</button>
                  <button type="button" onClick={() => applyView({ name: "Bu hafta yayınlanacaklar", status: "scheduled", platform: "all", campaign: "all", tag: "all", assignee: "all", period: "week", sort: "schedule" })} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-800 hover:bg-blue-100">Bu hafta yayınlanacaklar</button>
                  <button type="button" onClick={() => applyView({ name: "Hatalılar", status: "failed", platform: "all", campaign: "all", tag: "all", assignee: "all", period: "all", sort: "newest" })} className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100">Hatalılar</button>
                  {savedViews.map((view) => <span key={view.name} className="inline-flex items-center rounded-full border border-slate-200 text-[11px] font-semibold text-slate-600"><button type="button" onClick={() => applyView(view)} className="px-2.5 py-1 hover:text-blue-700">{view.name}</button><button type="button" onClick={() => deleteSavedView(view.name)} aria-label={`${view.name} görünümünü sil`} className="border-l border-slate-200 px-2 py-1 hover:text-red-600">×</button></span>)}
                  {viewNameOpen ? <form onSubmit={(event) => { event.preventDefault(); saveCurrentView(); }} className="flex items-center gap-1"><input autoFocus value={viewName} onChange={(event) => setViewName(event.target.value)} maxLength={40} placeholder="Görünüm adı" aria-label="Görünüm adı" className="w-36 rounded-lg border border-blue-300 px-2 py-1 text-[11px]" /><button type="submit" disabled={!viewName.trim()} className="rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-bold text-white disabled:opacity-40">Kaydet</button><button type="button" onClick={() => setViewNameOpen(false)} className="px-1 text-xs text-slate-500">Vazgeç</button></form> : <button type="button" onClick={() => setViewNameOpen(true)} className="rounded-full border border-dashed border-blue-300 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50">+ Görünümü kaydet</button>}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  <select aria-label="Platform filtresi" value={platformFilter} onChange={(e) => { setPlatformFilter(e.target.value); setPage(1); }} className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"><option value="all">Tüm platformlar</option>{platformsAvailable.map((value) => <option key={value} value={value}>{platformLabel(value)}</option>)}</select>
                  <select aria-label="Kampanya filtresi" value={campaignFilter} onChange={(e) => { setCampaignFilter(e.target.value); setPage(1); }} className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"><option value="all">Tüm kampanyalar</option>{campaignsAvailable.map((value) => <option key={value} value={value}>{value}</option>)}</select>
                  <select aria-label="Etiket filtresi" value={tagFilter} onChange={(e) => { setTagFilter(e.target.value); setPage(1); }} className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"><option value="all">Tüm etiketler</option>{tagsAvailable.map((value) => <option key={value} value={value}>{value}</option>)}</select>
                  <select aria-label="Sorumlu filtresi" value={assigneeFilter} onChange={(e) => { setAssigneeFilter(e.target.value); setPage(1); }} className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"><option value="all">Tüm sorumlular</option><option value="unassigned">Atanmamış</option>{teamMembers.map((member) => <option key={member.userId} value={member.userId}>{member.name}</option>)}</select>
                  <select aria-label="Tarih filtresi" value={periodFilter} onChange={(e) => { setPeriodFilter(e.target.value); setPage(1); }} className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"><option value="all">Tüm tarihler</option><option value="today">Bugün</option><option value="week">Gelecek 7 gün</option><option value="custom">Özel yayın aralığı</option></select>
                  <select aria-label="Sıralama" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"><option value="newest">En yeni oluşturulan</option><option value="oldest">En eski oluşturulan</option><option value="schedule">Yayın zamanı</option></select>
                </div>
                {periodFilter === "custom" && <div className="flex flex-wrap gap-2 text-xs"><label className="flex items-center gap-1 text-slate-600">Başlangıç<input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 px-2 py-1" /></label><label className="flex items-center gap-1 text-slate-600">Bitiş<input type="date" min={dateFrom || undefined} value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="rounded-lg border border-slate-200 px-2 py-1" /></label></div>}
              </div>

              {selectedIds.length > 0 && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs">
                <span className="font-semibold text-emerald-900">{selectedIds.length} gönderi seçildi</span>
                {canReview && <button type="button" onClick={approveAll} disabled={selectedReviewIds.length === 0} className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white disabled:opacity-40">Seçilenleri onayla ({selectedReviewIds.length})</button>}
                <button type="button" onClick={() => setSelectedIds([])} className="font-semibold text-slate-600">Seçimi temizle</button>
              </div>}

              {/* 3. Main Content: Grid or List View */}
              {loading ? (
                <div className="flex h-72 items-center justify-center rounded-[22px] border border-slate-100 bg-white text-sm text-slate-400">
                  {t.dashboard.common.loading}
                </div>
              ) : loadError ? (
                <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                  <h3 className="font-bold text-red-900">Gönderiler yüklenemedi</h3>
                  <p className="mt-1 text-xs text-red-700">{loadError}</p>
                  <button type="button" onClick={() => { setRows(null); setLoadError(null); setRefreshKey((key) => key + 1); }} className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white">Yeniden dene</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-200 bg-white py-16 text-center shadow-xs">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-800">{p.emptyTitle}</h3>
                  <p className="max-w-md text-xs text-slate-500">
                    {p.emptyDesc}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Link
                      href="/dashboard/compose/weekly"
                      className="rounded-xl bg-[#FA5252] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-500/20 hover:bg-rose-600 transition"
                    >
                      {p.weeklyPackage} 🚀
                    </Link>
                    <button
                      type="button"
                      onClick={() => composeModal.open()}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      {p.newPostBtn}
                    </button>
                  </div>
                </div>
              ) : viewMode === "instagram" ? (
                <div className="mx-auto max-w-2xl py-4 space-y-3.5 animate-fadeIn">
                  {/* Multi-Platform Feed Selector Bar */}
                  <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    {[
                      { key: "instagram", icon: "📸", label: "Instagram" },
                      { key: "tiktok", icon: "🎵", label: "TikTok" },
                      { key: "pinterest", icon: "📌", label: "Pinterest" },
                      { key: "threads", icon: "🧵", label: "Threads" },
                      { key: "facebook", icon: "👥", label: "Facebook" },
                    ].map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setFeedPlatform(p.key as typeof feedPlatform)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          feedPlatform === p.key
                            ? "bg-slate-900 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Render Selected Platform Feed Planner */}
                  {feedPlatform === "instagram" && (
                    <InstagramGridFeed
                      brandId={brand.id}
                      brandName={brand.name}
                      maxItems={24}
                      isEn={isEn}
                    />
                  )}
                  {feedPlatform === "tiktok" && (
                    <TikTokGridFeed
                      brandId={brand.id}
                      brandName={brand.name}
                      isEn={isEn}
                      platform="tiktok"
                    />
                  )}
                  {feedPlatform === "pinterest" && (
                    <PinterestBoardFeed
                      brandId={brand.id}
                      brandName={brand.name}
                      isEn={isEn}
                    />
                  )}
                  {feedPlatform === "threads" && (
                    <ThreadsTimelineFeed
                      brandId={brand.id}
                      brandName={brand.name}
                      isEn={isEn}
                      platform="threads"
                    />
                  )}
                  {feedPlatform === "facebook" && (
                    <FacebookPageFeed
                      brandId={brand.id}
                      brandName={brand.name}
                      isEn={isEn}
                    />
                  )}
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedItems.map((item) => {
                    const status = item.realStatus ?? "review";
                    const platforms = item.platforms ?? [];
                    const scheduledAt = platforms.map((platform) => platform.scheduledAt).filter((value): value is string => Boolean(value)).sort()[0];

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
                                  {new Date(scheduledAt).toLocaleString(isEn ? "en-US" : "tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {item.format && item.format !== "post" && (
                                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                  {p.formats[item.format as keyof typeof p.formats] ?? item.format}
                                </span>
                              )}
                              <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold tracking-tight ${STATUS_LABEL[status].className}`}>
                                {p.statusLabels[status] || STATUS_LABEL[status].label}
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
                            <PlatformStatusSummary item={item} />

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
                          {status === "review" && <label className="flex items-center gap-1 text-[11px] text-slate-600" onClick={(event) => event.stopPropagation()}>
                            <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds((prev) => event.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id))} /> Seç
                          </label>}
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            {p.actions.inspect}
                          </button>

                          <div className="flex items-center gap-1.5">
                            {status === "review" && canReview && (
                              <>
                                <button
                                  type="button"
                                  disabled={busyId === item.id}
                                  onClick={() => reject(item.id)}
                                  className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:border-red-200 hover:text-red-600 transition disabled:opacity-40"
                                  title={p.actions.sendToDraft}
                                >
                                  {p.actions.reject}
                                </button>
                                <button
                                  type="button"
                                  disabled={busyId === item.id}
                                  onClick={() => approve(item.id)}
                                  className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-40"
                                >
                                  ✓ {p.actions.approve}
                                </button>
                              </>
                            )}
                            {status === "scheduled" && (
                              <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                                <span>⏳</span> {p.actions.readyToPublish}
                              </span>
                            )}
                            {status === "published" && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <span>✓</span> {p.actions.published}
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
                          <th className="px-3 py-3.5"><input type="checkbox" aria-label="Bu sayfadaki onay bekleyenleri seç" checked={pagedItems.filter((item) => item.realStatus === "review").length > 0 && pagedItems.filter((item) => item.realStatus === "review").every((item) => selectedIds.includes(item.id))} onChange={(event) => setSelectedIds((prev) => event.target.checked ? Array.from(new Set([...prev, ...pagedItems.filter((item) => item.realStatus === "review").map((item) => item.id)])) : prev.filter((id) => !pagedItems.some((item) => item.id === id)))} /></th>
                          <th className="px-5 py-3.5">{p.table.contentHook}</th>
                          <th className="px-4 py-3.5">{p.table.platforms}</th>
                          <th className="px-4 py-3.5">{p.table.date}</th>
                          <th className="px-4 py-3.5">{p.table.status}</th>
                          <th className="px-5 py-3.5 text-right">{p.table.actions}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedItems.map((item) => {
                          const status = item.realStatus ?? "review";

                          return (
                            <tr key={item.id} onClick={() => setSelectedId(item.id)} className="cursor-pointer hover:bg-slate-50/70 transition">
                              <td className="px-3 py-4" onClick={(event) => event.stopPropagation()}>{status === "review" && <input type="checkbox" aria-label={`${item.title} seç`} checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds((prev) => event.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id))} />}</td>
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
                                <PlatformStatusSummary item={item} />
                              </td>
                              <td className="px-4 py-4 font-mono text-[11px] text-slate-500"><span className="block text-[10px] font-semibold uppercase text-slate-400">{item.dateKind === "scheduled" ? "Planlanan" : "Oluşturulma"}</span>{item.fullDateLabel}</td>
                              <td className="px-4 py-4">
                                <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold ${STATUS_LABEL[status].className}`}>
                                  {p.statusLabels[status] || STATUS_LABEL[status].label}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                {status === "review" && canReview ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button type="button" onClick={() => reject(item.id)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-red-600">
                                      {p.actions.reject}
                                    </button>
                                    <button type="button" onClick={() => approve(item.id)} className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700">
                                      {p.actions.approve}
                                    </button>
                                  </div>
                                ) : (
                                  <button type="button" onClick={() => setSelectedId(item.id)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                    {p.actions.inspect}
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
              {!loading && !loadError && totalPages > 1 && <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-xs text-slate-600">
                <span>{filtered.length} gönderi · Sayfa {currentPage}/{totalPages}</span>
                <div className="flex gap-2">
                  <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40">Önceki</button>
                  <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold disabled:opacity-40">Sonraki</button>
                </div>
              </div>}
            </>
          ) : loadError ? (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-800">Gönderiler yüklenemedi: {loadError} <button type="button" onClick={() => { setRows(null); setLoadError(null); setRefreshKey((key) => key + 1); }} className="ml-2 font-bold underline">Yeniden dene</button></div>
          ) : (
            /* ================= KANBAN BOARD ================= */
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
              {loading && <p className="mb-3 text-center text-xs text-slate-400">{t.dashboard.common.loading}</p>}
              <section className="flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/40 p-4">
                <div className="mb-3.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-sm">🟡</span>
                    <h2 className="text-xs font-bold text-slate-800">{p.kanbanColumns.pendingReview}</h2>
                  </div>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[11px] font-bold text-white shadow-xs">
                    {pendingReview.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin]">
                  {canReview && <button
                    type="button"
                    onClick={() => setBatchModalOpen(true)}
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3.5 text-center text-xs font-bold text-slate-700 shadow-2xs hover:border-blue-400 hover:text-blue-600 transition cursor-pointer"
                  >
                    {p.kanbanColumns.batchButton}
                  </button>}
                  {pendingReview.map((item) => (
                    <ApprovalCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
                  ))}
                  {pendingReview.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs text-slate-400">{p.kanbanColumns.emptyPending}</p>
                  )}
                </div>
              </section>

              <section className="flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/40 p-4">
                <div className="mb-3.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-sm">💬</span>
                    <h2 className="text-xs font-bold text-slate-800">{p.kanbanColumns.feedbackGiven}</h2>
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
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs text-slate-400">{p.kanbanColumns.emptyFeedback}</p>
                  )}
                </div>
              </section>

              <section className="flex min-w-0 flex-col rounded-2xl border border-slate-200/80 bg-slate-100/40 p-4">
                <div className="mb-3.5 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 text-sm">🟢</span>
                    <h2 className="text-xs font-bold text-slate-800">{p.kanbanColumns.approved}</h2>
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
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-xs text-slate-400">{p.kanbanColumns.emptyApproved}</p>
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
          onAssignDraft={handleAssignDraft}
          onSendForReview={selectedItem.realStatus === "draft" && (canReview || selectedItem.createdBy === currentUserId || selectedItem.draftAssignedTo?.id === currentUserId) ? sendForReview : undefined}
          canReview={canReview}
          onEditTags={canReview || (selectedItem.realStatus === "draft" || selectedItem.realStatus === "review") && (selectedItem.createdBy === currentUserId || selectedItem.draftAssignedTo?.id === currentUserId) ? saveTags : undefined}
          onReject={canReview ? reject : undefined}
          onDelete={canReview ? deleteContent : undefined}
          onSavePlatform={canReview || (selectedItem.realStatus === "draft" || selectedItem.realStatus === "review") && (selectedItem.createdBy === currentUserId || selectedItem.draftAssignedTo?.id === currentUserId) ? savePlatform : undefined}
          onRetryPlatform={canReview ? retryPlatform : undefined}
        />
      )}

      {batchModalOpen && canReview && (
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
