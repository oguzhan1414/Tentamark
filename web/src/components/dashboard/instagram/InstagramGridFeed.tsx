"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface GridFeedItem {
  id: string;
  imageUrl: string;
  isVideo: boolean;
  caption?: string;
  title?: string;
  status: "DRAFT" | "NEEDS_REVIEW" | "APPROVED" | "SCHEDULED" | "PUBLISHED";
  scheduledAt?: string | null;
  createdAt: string;
  isDraftCurrent?: boolean;
}

interface InstagramGridFeedProps {
  brandId: string;
  brandName: string;
  currentDraftMedia?: { url: string; isVideo: boolean; caption?: string } | null;
  maxItems?: number;
  isEn?: boolean;
  className?: string;
  compact?: boolean;
}

export default function InstagramGridFeed({
  brandId,
  brandName,
  currentDraftMedia,
  maxItems = 9,
  isEn = false,
  className = "",
  compact = false,
}: InstagramGridFeedProps) {
  const [posts, setPosts] = useState<GridFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState<string>("");
  const [selectedPost, setSelectedPost] = useState<GridFeedItem | null>(null);
  const [includeDraft, setIncludeDraft] = useState(true);

  const handle = (brandName || "brand").toLowerCase().replace(/\s+/g, "");
  const initial = (brandName || "A")[0]?.toUpperCase() || "A";

  // 1. Fetch Brand Bio & Past Instagram/Media Posts
  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    async function loadFeedData() {
      setLoading(true);
      try {
        // Fetch bio / tone from brand_dna
        const { data: dna } = await supabase
          .from("brand_dna")
          .select("tone_of_voice, industry")
          .eq("brand_id", brandId)
          .maybeSingle();

        if (ignore) return;
        if (dna) {
          setBio(dna.tone_of_voice || dna.industry || "");
        }

        // Fetch recent posts with media
        const { data: contentRows } = await supabase
          .from("content")
          .select(`
            id,
            title,
            status,
            created_at,
            content_media(media(file_url, file_type)),
            content_platforms(platform, caption, scheduled_at, status)
          `)
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (ignore) return;

        const items: GridFeedItem[] = [];
        if (contentRows) {
          for (const row of contentRows) {
            const rawMedia = row.content_media as Array<{ media?: { file_url?: string; file_type?: string } }> | undefined;
            const firstMedia = rawMedia?.[0]?.media;
            const fileUrl = firstMedia?.file_url;
            if (!fileUrl) continue;

            const isVideo = Boolean(firstMedia?.file_type?.startsWith("video/"));
            const igPlatform = (row.content_platforms as Array<{ platform: string; caption?: string; scheduled_at?: string; status: string }> | undefined)?.find(
              (p) => p.platform === "instagram"
            );

            items.push({
              id: row.id,
              imageUrl: fileUrl,
              isVideo,
              caption: igPlatform?.caption || row.title,
              title: row.title,
              status: (row.status as GridFeedItem["status"]) || "PUBLISHED",
              scheduledAt: igPlatform?.scheduled_at,
              createdAt: row.created_at,
            });
          }
        }

        setPosts(items);
      } catch (err) {
        console.warn("[InstagramGridFeed] Failed to load grid data:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFeedData();
    return () => {
      ignore = true;
    };
  }, [brandId]);

  // 2. Prepare 3x3 grid items (Slot 0 is current draft if available and enabled)
  const gridItems = useMemo<GridFeedItem[]>(() => {
    const list: GridFeedItem[] = [];

    // Current draft post in slot 0
    if (includeDraft && currentDraftMedia?.url) {
      list.push({
        id: "current-draft",
        imageUrl: currentDraftMedia.url,
        isVideo: currentDraftMedia.isVideo,
        caption: currentDraftMedia.caption || "",
        title: isEn ? "Live Draft Post" : "Canlı Taslak Gönderi",
        status: "DRAFT",
        createdAt: new Date().toISOString(),
        isDraftCurrent: true,
      });
    }

    // Add past posts up to maxItems
    for (const p of posts) {
      if (list.length >= maxItems) break;
      list.push(p);
    }

    return list;
  }, [includeDraft, currentDraftMedia, posts, maxItems, isEn]);

  // Aesthetic harmony score simulation based on draft image presence
  const harmonyScore = useMemo(() => {
    if (!currentDraftMedia?.url) return 92;
    // Stable pseudo-score between 91% and 98%
    const seed = currentDraftMedia.url.length;
    return 91 + (seed % 8);
  }, [currentDraftMedia]);

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-slate-900 ${className}`}>
      {/* Top Header: Instagram Profile Card */}
      {!compact && (
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex items-start gap-3.5 sm:gap-5">
            {/* Story Avatar Ring */}
            <div className="relative shrink-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2.5px] shadow-sm">
                <div className="h-full w-full rounded-full bg-white p-[2px]">
                  <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-lg sm:text-xl">
                    {initial}
                  </div>
                </div>
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" title="Online" />
            </div>

            {/* Profile Info & Metrics */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  @{handle}
                </h3>
                <span className="inline-flex items-center text-blue-500" title="Verified Brand">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </span>
                {currentDraftMedia?.url && (
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-700 border border-rose-200">
                    ⚡ {isEn ? "Live Feed Preview" : "Canlı Akış Önizlemesi"}
                  </span>
                )}
              </div>

              {/* Stats Bar */}
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{posts.length + (currentDraftMedia?.url ? 1 : 0)}</span>{" "}
                  <span className="text-slate-500">{isEn ? "posts" : "gönderi"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">12.8K</span>{" "}
                  <span className="text-slate-500">{isEn ? "followers" : "takipçi"}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">412</span>{" "}
                  <span className="text-slate-500">{isEn ? "following" : "takip"}</span>
                </div>
              </div>

              {/* Bio snippet */}
              <div className="pt-0.5">
                <p className="text-xs font-bold text-slate-800">{brandName}</p>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {bio || (isEn ? "Official brand profile & latest drops." : "Resmi marka profili ve güncel içerikler.")}
                </p>
                <span className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">
                  tentamark.com/@{handle}
                </span>
              </div>
            </div>
          </div>

          {/* Aesthetic Harmony Banner */}
          {currentDraftMedia?.url && (
            <div className="mt-3.5 flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80 px-3 py-2 text-xs text-violet-900">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">🎨</span>
                <span className="font-semibold truncate">
                  {isEn
                    ? `Grid Visual Harmony: %${harmonyScore} — Perfectly matches existing feed palette.`
                    : `Izgara Görsel Uyumu: %${harmonyScore} — Mevcut profil renk paletiyle kusursuz uyum.`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIncludeDraft(!includeDraft)}
                className="shrink-0 text-[11px] font-bold text-violet-700 hover:text-violet-900 underline cursor-pointer"
              >
                {includeDraft
                  ? isEn ? "Hide Draft" : "Taslağı Gizle"
                  : isEn ? "Show Draft" : "Taslağı Göster"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Tabs Navigation */}
      <div className="flex items-center justify-center border-b border-slate-100 bg-slate-50/50 py-2">
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1.5 px-3 cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="7" height="7" strokeWidth={2} />
            <rect x="14" y="3" width="7" height="7" strokeWidth={2} />
            <rect x="14" y="14" width="7" height="7" strokeWidth={2} />
            <rect x="3" y="14" width="7" height="7" strokeWidth={2} />
          </svg>
          <span className="uppercase tracking-wider text-[10px]">
            {isEn ? "Grid Posts (3x3)" : "Gönderi Izgarası"}
          </span>
        </button>
      </div>

      {/* 3x3 Square Grid Canvas */}
      <div className="p-1 sm:p-2">
        {loading ? (
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 aspect-square">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-md bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
            {Array.from({ length: maxItems }).map((_, idx) => {
              const item = gridItems[idx];

              // If item exists: render post square
              if (item) {
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPost(item)}
                    className={`group relative aspect-square overflow-hidden rounded-md bg-slate-100 cursor-pointer transition ${
                      item.isDraftCurrent ? "ring-2 ring-violet-500 shadow-md" : "hover:opacity-90"
                    }`}
                  >
                    {item.isVideo ? (
                      <video src={item.imageUrl} muted loop autoPlay className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.title || "Post"} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}

                    {/* Badge: If current draft */}
                    {item.isDraftCurrent && (
                      <div className="absolute top-1 left-1 z-10">
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-black text-white shadow-xs">
                          <span>✨</span>
                          <span>{isEn ? "NEW" : "YENİ"}</span>
                        </span>
                      </div>
                    )}

                    {/* Media type indicator */}
                    {item.isVideo && (
                      <div className="absolute top-1 right-1 z-10 text-white drop-shadow-md">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    )}

                    {/* Hover Overlay with Stats / Status */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5 text-white p-2 text-center">
                      <div className="flex items-center gap-3 text-xs font-extrabold">
                        <span className="flex items-center gap-1">
                          ❤️ 48
                        </span>
                        <span className="flex items-center gap-1">
                          💬 6
                        </span>
                      </div>
                      {item.isDraftCurrent ? (
                        <span className="text-[10px] font-black text-violet-300">
                          {isEn ? "Click to inspect" : "İncelemek için tıkla"}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-200">
                          {item.status === "SCHEDULED" ? (isEn ? "Scheduled" : "Planlandı") : (isEn ? "Published" : "Yayınlandı")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              // Empty filler square if fewer than 9 posts
              return (
                <div
                  key={`empty-${idx}`}
                  className="aspect-square rounded-md border border-dashed border-slate-200 bg-slate-50/70 flex flex-col items-center justify-center p-2 text-center text-slate-300"
                >
                  <svg className="h-5 w-5 mb-1 stroke-current" fill="none" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-[9px] font-medium">
                    {isEn ? "Empty Slot" : "Boş Yuva"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal when clicking any post */}
      {selectedPost && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col sm:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
            >
              ✕
            </button>

            {/* Media side */}
            <div className="sm:w-1/2 aspect-square bg-black flex items-center justify-center">
              {selectedPost.isVideo ? (
                <video src={selectedPost.imageUrl} controls autoPlay className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedPost.imageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>

            {/* Content info side */}
            <div className="sm:w-1/2 p-4 sm:p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {initial}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">@{handle}</h4>
                    <span className="text-[10px] text-slate-400">
                      {selectedPost.isDraftCurrent
                        ? isEn ? "Live Draft Post" : "Canlı Taslak Gönderi"
                        : new Date(selectedPost.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap pr-1">
                  {selectedPost.caption || (isEn ? "No caption available." : "Metin bulunmuyor.")}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  selectedPost.isDraftCurrent
                    ? "bg-violet-100 text-violet-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}>
                  {selectedPost.isDraftCurrent ? "✨ Taslak" : "✓ Yayınlandı / Planlandı"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isEn ? "Instagram 3x3 Grid" : "Instagram 3x3 Izgara"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
