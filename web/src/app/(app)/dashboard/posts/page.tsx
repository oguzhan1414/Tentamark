"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import { STATUS_LABEL, type UIStatus } from "@/lib/contentStatus";
import PlatformIcon, { type PlatformName, platformLabel } from "@/components/PlatformIcon";

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
  metadata?: {
    hook?: string;
    visualPrompt?: string;
    pillar?: string;
  } | null;
  content_platforms: PlatformRow[];
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

const FILTERS: { key: "all" | UIStatus; label: string }[] = [
  { key: "all", label: "Tümü" },
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
  return "review";
}

export default function PostsPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<ContentRow[] | null>(null);
  const [filter, setFilter] = useState<"all" | UIStatus>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<ContentRow | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load content
  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from("content")
        .select(
          "id, title, core_idea, category, status, created_at, content_media(media(file_url)), content_platforms(id, platform, caption, hashtags, status, scheduled_at)"
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

      setRows(
        ((data ?? []) as Array<Record<string, unknown>>).map((r) => {
          const { hook, visualPrompt } = parseCoreIdea(r.core_idea as string | null);
          return {
            id: String(r.id),
            title: String(r.title || "(Başlıksız)"),
            body: (r.core_idea as string) ?? null,
            status: String(r.status),
            created_at: String(r.created_at),
            imageUrl: firstImageUrl(r.content_media),
            metadata: {
              hook: hook ?? undefined,
              visualPrompt: visualPrompt ?? undefined,
              pillar: (r.category as string) ?? undefined,
            },
            content_platforms: (r.content_platforms ?? []) as PlatformRow[],
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

  // Filter & Search
  const filtered = useMemo(() => {
    let result = filter === "all" ? allRows : allRows.filter((r) => overallStatus(r) === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.metadata?.hook?.toLowerCase().includes(q) ||
          r.metadata?.pillar?.toLowerCase().includes(q) ||
          r.content_platforms.some((p) => p.caption?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allRows, filter, searchQuery]);

  const reviewIds = useMemo(
    () => allRows.filter((r) => overallStatus(r) === "review").map((r) => r.id),
    [allRows]
  );

  async function approve(id: string) {
    setBusyId(id);
    const { error } = await supabase.from("content").update({ status: "APPROVED" }).eq("id", id);
    setBusyId(null);
    if (error) {
      console.error("Onaylanamadı:", error.message);
      return;
    }
    if (selectedPost?.id === id) {
      setSelectedPost((prev) => (prev ? { ...prev, status: "APPROVED" } : null));
    }
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
    if (selectedPost?.id === id) {
      setSelectedPost((prev) => (prev ? { ...prev, status: "DRAFT" } : null));
    }
    setRefreshKey((k) => k + 1);
  }

  async function approveAll() {
    if (reviewIds.length === 0) return;
    const { error } = await supabase.from("content").update({ status: "APPROVED" }).in("id", reviewIds);
    if (error) {
      console.error("Toplu onaylanamadı:", error.message);
      return;
    }
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
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
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#6366F1] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-indigo-500/25 hover:bg-indigo-600 transition"
          >
            <span>⚡ 7 Günlük Paket</span>
          </Link>

          <Link
            href="/dashboard/compose"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Yeni Gönderi</span>
          </Link>
        </div>
      </div>

      {/* 2. Filters Bar & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const count = f.key === "all" ? allRows.length : allRows.filter((r) => overallStatus(r) === f.key).length;
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
                    active
                      ? "bg-white/20 text-white"
                      : f.key === "review" && count > 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Grid/List View Toggles */}
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
              className="w-48 sm:w-60 rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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

      {/* 3. Main Content: 6-Grid View or List View */}
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
              className="rounded-xl bg-[#6366F1] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-600 transition"
            >
              Haftalık Paket Üret 🚀
            </Link>
            <Link
              href="/dashboard/compose"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Tekli Gönderi Yaz
            </Link>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* ================= 6-GRID CARD VIEW ================= */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => {
            const status = overallStatus(row);
            const platforms = row.content_platforms ?? [];
            const scheduledAt = platforms[0]?.scheduled_at;

            return (
              <div
                key={row.id}
                className="group flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Top Card Info Bar */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    {/* Platform Icons */}
                    <div className="flex items-center gap-1.5">
                      {platforms.length > 0 ? (
                        platforms.map((p, idx) => (
                          <PlatformIcon
                            key={p.id ?? `${p.platform}-${idx}`}
                            name={p.platform}
                            className="h-6 w-6 rounded-md shadow-2xs"
                          />
                        ))
                      ) : (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                          GENEL
                        </span>
                      )}

                      {scheduledAt && (
                        <span className="font-mono text-[10px] text-slate-400 ml-1">
                          {new Date(scheduledAt).toLocaleDateString("tr-TR", {
                            weekday: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold tracking-tight ${STATUS_LABEL[status].className}`}
                    >
                      {STATUS_LABEL[status].label}
                    </span>
                  </div>

                  {/* Visual Media Showcase */}
                  <div
                    onClick={() => setSelectedPost(row)}
                    className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-slate-50 group-hover:border-slate-200 transition"
                  >
                    {row.imageUrl ? (
                      <Image
                        src={row.imageUrl}
                        alt={row.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-indigo-50/50 via-slate-50 to-purple-50/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-500 shadow-xs mb-2">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">
                          {row.metadata?.visualPrompt ? "Görsel Konsepti Hazır" : "Görsel Bekleniyor"}
                        </span>
                        <p className="mt-1 line-clamp-2 text-[10px] text-slate-400">
                          {row.metadata?.visualPrompt || "AI tarafından metne uygun görsel henüz üretilmedi."}
                        </p>
                      </div>
                    )}

                    {/* Pillar Badge Overlay */}
                    {row.metadata?.pillar && (
                      <div className="absolute left-2.5 top-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-2xs backdrop-blur-xs">
                        #{row.metadata.pillar}
                      </div>
                    )}
                  </div>

                  {/* Hook & Title */}
                  <div className="space-y-1.5">
                    {row.metadata?.hook && (
                      <div className="rounded-lg bg-amber-50/70 px-2.5 py-1 text-[11px] font-medium text-amber-900 border border-amber-200/40">
                        <span className="font-bold">🪝 Kanca: </span>
                        <span>&ldquo;{row.metadata.hook}&rdquo;</span>
                      </div>
                    )}

                    <h3
                      onClick={() => setSelectedPost(row)}
                      className="cursor-pointer font-display text-sm font-bold text-slate-900 transition group-hover:text-indigo-600 line-clamp-1"
                    >
                      {row.title}
                    </h3>

                    <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed">
                      {platforms[0]?.caption || row.body || "İçerik açıklaması..."}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPost(row)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    İncele
                  </button>

                  <div className="flex items-center gap-1.5">
                    {status === "review" && (
                      <>
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => reject(row.id)}
                          className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:border-red-200 hover:text-red-600 transition disabled:opacity-40"
                          title="Taslağa Geri Al"
                        >
                          Reddet
                        </button>
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={() => approve(row.id)}
                          className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-40"
                        >
                          ✓ Onayla
                        </button>
                      </>
                    )}

                    {status === "scheduled" && (
                      <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
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
        /* ================= LIST TABLE VIEW ================= */
        <div className="overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50/70 font-mono text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">İçerik / Kanca</th>
                  <th className="px-4 py-3.5">Platformlar</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Tarih</th>
                  <th className="px-4 py-3.5">Durum</th>
                  <th className="px-5 py-3.5 text-right">Eylemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => {
                  const status = overallStatus(row);
                  const platforms = row.content_platforms ?? [];

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedPost(row)}
                      className="cursor-pointer hover:bg-slate-50/70 transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {row.imageUrl ? (
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 shadow-xs">
                              <Image src={row.imageUrl} alt="" fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-display font-bold text-slate-900 truncate">{row.title}</p>
                            {row.metadata?.hook && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                &ldquo;{row.metadata.hook}&rdquo;
                              </p>
                            )}
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
                      <td className="px-4 py-4">
                        {row.metadata?.pillar ? (
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                            #{row.metadata.pillar}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-[11px] text-slate-500">
                        {new Date(row.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold ${STATUS_LABEL[status].className}`}
                        >
                          {STATUS_LABEL[status].label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {status === "review" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => reject(row.id)}
                              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-red-600"
                            >
                              Reddet
                            </button>
                            <button
                              type="button"
                              onClick={() => approve(row.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700"
                            >
                              Onayla
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedPost(row)}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
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

      {/* 4. Detailed Slide-out Inspector Drawer */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Kapat"
            onClick={() => setSelectedPost(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
          <aside className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-slate-200 bg-white p-6 sm:p-7 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase font-bold ${
                      STATUS_LABEL[overallStatus(selectedPost)].className
                    }`}
                  >
                    {STATUS_LABEL[overallStatus(selectedPost)].label}
                  </span>
                  {selectedPost.metadata?.pillar && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                      #{selectedPost.metadata.pillar}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-slate-900 mt-2">
                  {selectedPost.title}
                </h3>
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

            {/* Generated Image Preview */}
            <div className="mt-4">
              {selectedPost.imageUrl ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
                  <Image
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    fill
                    className="object-cover"
                  />
                  <a
                    href={selectedPost.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md hover:bg-black/80"
                  >
                    Büyüt ↗
                  </a>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-xs text-slate-500">Bu gönderiye henüz görsel üretilmedi.</p>
                  <Link
                    href="/dashboard/compose/weekly"
                    className="mt-2 inline-block text-xs font-bold text-indigo-600 hover:underline"
                  >
                    AI ile Görsel Üret ⚡
                  </Link>
                </div>
              )}
            </div>

            {/* 2-Second Hook */}
            {selectedPost.metadata?.hook && (
              <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                  🪝 2 Saniyelik Kanca (Hook)
                </span>
                <p className="mt-1 text-xs font-semibold text-slate-900 leading-snug">
                  &ldquo;{selectedPost.metadata.hook}&rdquo;
                </p>
              </div>
            )}

            {/* Visual Concept */}
            {selectedPost.metadata?.visualPrompt && (
              <div className="mt-3 rounded-2xl border border-blue-200/70 bg-blue-50/50 p-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                  🎨 Görsel / Video Çekim Konsepti
                </span>
                <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                  {selectedPost.metadata.visualPrompt}
                </p>
              </div>
            )}

            {/* Platform Captions */}
            <div className="mt-5 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Platform Metinleri ({selectedPost.content_platforms.length})
              </span>

              {selectedPost.content_platforms.map((p, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <PlatformIcon name={p.platform} className="h-5 w-5 rounded-md" />
                      <span className="text-xs font-bold text-slate-800">
                        {platformLabel(p.platform)}
                      </span>
                    </div>
                    {p.scheduled_at && (
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(p.scheduled_at).toLocaleString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  <p className="whitespace-pre-line text-xs text-slate-800 leading-relaxed">
                    {p.caption || selectedPost.body || "Metin bulunamadı."}
                  </p>

                  {p.hashtags && p.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-200/40">
                      {p.hashtags.map((h, hIdx) => (
                        <span key={hIdx} className="font-mono text-[10px] text-indigo-600 font-medium">
                          #{h.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions Drawer */}
            <div className="mt-auto flex items-center gap-3 pt-6 border-t border-slate-100">
              {overallStatus(selectedPost) === "review" && (
                <>
                  <button
                    type="button"
                    disabled={busyId === selectedPost.id}
                    onClick={() => reject(selectedPost.id)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:border-red-200 transition"
                  >
                    Reddet
                  </button>
                  <button
                    type="button"
                    disabled={busyId === selectedPost.id}
                    onClick={() => approve(selectedPost.id)}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    ✓ Onayla
                  </button>
                </>
              )}

              <Link
                href="/dashboard/compose"
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-center text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
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
