"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface TikTokFeedItem {
  id: string;
  mediaUrl: string;
  isVideo: boolean;
  caption?: string;
  title?: string;
  views: string;
  createdAt: string;
  isDraft?: boolean;
}

interface TikTokGridFeedProps {
  brandId: string;
  brandName: string;
  currentDraftMedia?: { url: string; isVideo: boolean; caption?: string } | null;
  isEn?: boolean;
  platform?: "tiktok" | "youtube";
}

export default function TikTokGridFeed({
  brandId,
  brandName,
  currentDraftMedia,
  isEn = false,
  platform = "tiktok",
}: TikTokGridFeedProps) {
  const [items, setItems] = useState<TikTokFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [selectedItem, setSelectedItem] = useState<TikTokFeedItem | null>(null);

  const handle = (brandName || "brand").toLowerCase().replace(/\s+/g, "");
  const initial = (brandName || "A")[0]?.toUpperCase() || "A";
  const isShorts = platform === "youtube";

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    async function loadData() {
      setLoading(true);
      try {
        const { data: dna } = await supabase
          .from("brand_dna")
          .select("tone_of_voice, industry")
          .eq("brand_id", brandId)
          .maybeSingle();

        if (ignore) return;
        if (dna) setBio(dna.tone_of_voice || dna.industry || "");

        const { data: contentRows } = await supabase
          .from("content")
          .select(`
            id,
            title,
            created_at,
            content_media(media(file_url, file_type)),
            content_platforms(platform, caption, scheduled_at, status)
          `)
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false })
          .limit(15);

        if (ignore) return;

        const list: TikTokFeedItem[] = [];
        if (contentRows) {
          const viewCounters = ["42.8K", "18.4K", "95.1K", "12.3K", "6.7K", "140K", "31.2K"];
          let countIdx = 0;

          for (const row of contentRows) {
            const rawMedia = row.content_media as Array<{ media?: { file_url?: string; file_type?: string } }> | undefined;
            const fileUrl = rawMedia?.[0]?.media?.file_url;
            if (!fileUrl) continue;

            const isVideo = Boolean(rawMedia?.[0]?.media?.file_type?.startsWith("video/"));
            const targetPlatform = (row.content_platforms as Array<{ platform: string; caption?: string }> | undefined)?.find(
              (p) => p.platform === platform || p.platform === "tiktok" || p.platform === "instagram"
            );

            list.push({
              id: row.id,
              mediaUrl: fileUrl,
              isVideo,
              caption: targetPlatform?.caption || row.title,
              title: row.title,
              views: viewCounters[countIdx % viewCounters.length],
              createdAt: row.created_at,
            });
            countIdx++;
          }
        }
        setItems(list);
      } catch (err) {
        console.warn("[TikTokGridFeed] Failed to load data:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [brandId, platform]);

  const displayList = useMemo(() => {
    const res: TikTokFeedItem[] = [];
    if (currentDraftMedia?.url) {
      res.push({
        id: "current-draft",
        mediaUrl: currentDraftMedia.url,
        isVideo: currentDraftMedia.isVideo,
        caption: currentDraftMedia.caption,
        title: isEn ? "Live Video Draft" : "Canlı Video Taslağı",
        views: isEn ? "Draft" : "Taslak",
        createdAt: new Date().toISOString(),
        isDraft: true,
      });
    }
    for (const item of items) {
      if (res.length >= 9) break;
      res.push(item);
    }
    return res;
  }, [currentDraftMedia, items, isEn]);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-slate-900">
      {/* Profile Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white text-center space-y-2">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-black text-white font-black text-xl flex items-center justify-center shadow-md ring-2 ring-slate-100">
            {initial}
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 mt-2">
            @{handle}
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {isShorts ? "YouTube Shorts Creator" : "TikTok Creator Profile"}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-xs pt-1">
          <div>
            <span className="font-extrabold text-slate-900">142</span>{" "}
            <span className="text-slate-400 text-[11px]">{isEn ? "Following" : "Takip"}</span>
          </div>
          <div>
            <span className="font-extrabold text-slate-900">48.6K</span>{" "}
            <span className="text-slate-400 text-[11px]">{isEn ? "Followers" : "Takipçi"}</span>
          </div>
          <div>
            <span className="font-extrabold text-slate-900">1.4M</span>{" "}
            <span className="text-slate-400 text-[11px]">{isEn ? "Likes" : "Beğeni"}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-[11px] text-slate-600 line-clamp-2 px-4 leading-relaxed">
          {bio || (isEn ? "Daily insights & short video drops." : "Günlük ipuçları, reels ve dikey video serileri.")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-around border-b border-slate-100 bg-slate-50/60 py-2 text-[11px] font-bold">
        <span className="text-slate-900 border-b-2 border-slate-900 pb-1 px-4 cursor-pointer">
          {isShorts ? "▶ Shorts (9:16)" : "🎬 Videolar (9:16)"}
        </span>
        <span className="text-slate-400 hover:text-slate-600 cursor-pointer">
          🔒 {isEn ? "Private" : "Özel"}
        </span>
        <span className="text-slate-400 hover:text-slate-600 cursor-pointer">
          ❤️ {isEn ? "Liked" : "Beğenilen"}
        </span>
      </div>

      {/* 3-Column 9:16 Vertical Grid */}
      <div className="p-1 sm:p-1.5">
        {loading ? (
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] rounded bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 6 }).map((_, idx) => {
              const item = displayList[idx];
              if (item) {
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group relative aspect-[9/16] overflow-hidden rounded bg-black cursor-pointer ${
                      item.isDraft ? "ring-2 ring-rose-500 shadow-md" : ""
                    }`}
                  >
                    {item.isVideo ? (
                      <video src={item.mediaUrl} muted loop autoPlay className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.mediaUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}

                    {/* Gradient scrim at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />

                    {/* Draft badge */}
                    {item.isDraft && (
                      <div className="absolute top-1 left-1 z-10">
                        <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[8px] font-black text-white shadow-xs">
                          {isEn ? "DRAFT" : "TASLAK"}
                        </span>
                      </div>
                    )}

                    {/* View counter on video */}
                    <div className="absolute bottom-1 left-1.5 flex items-center gap-1 text-[10px] font-extrabold text-white">
                      <span>▶</span>
                      <span>{item.views}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`empty-${idx}`}
                  className="aspect-[9/16] rounded border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-2 text-center text-slate-300"
                >
                  <span className="text-base mb-1">🎬</span>
                  <span className="text-[8px] font-semibold">{isEn ? "Empty" : "Boş"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-black text-white shadow-2xl p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer"
            >
              ✕
            </button>
            <div className="aspect-[9/16] rounded-xl overflow-hidden bg-slate-900">
              {selectedItem.isVideo ? (
                <video src={selectedItem.mediaUrl} controls autoPlay className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedItem.mediaUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">@{handle}</p>
              <p className="text-xs text-slate-300 line-clamp-3 mt-1 leading-relaxed whitespace-pre-wrap">
                {selectedItem.caption || (isEn ? "No caption available." : "Açıklama bulunmuyor.")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
