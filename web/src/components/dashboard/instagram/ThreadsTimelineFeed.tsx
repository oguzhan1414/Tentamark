"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ThreadItem {
  id: string;
  caption: string;
  mediaUrl?: string | null;
  createdAt: string;
  likes: number;
  replies: number;
  isDraft?: boolean;
}

interface ThreadsTimelineFeedProps {
  brandId: string;
  brandName: string;
  currentDraftCaption?: string;
  currentDraftMedia?: { url: string; isVideo: boolean } | null;
  isEn?: boolean;
  platform?: "threads" | "bluesky";
}

export default function ThreadsTimelineFeed({
  brandId,
  brandName,
  currentDraftCaption,
  currentDraftMedia,
  isEn = false,
  platform = "threads",
}: ThreadsTimelineFeedProps) {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bio, setBio] = useState("");

  const handle = (brandName || "brand").toLowerCase().replace(/\s+/g, "");
  const initial = (brandName || "T")[0]?.toUpperCase() || "T";
  const isBluesky = platform === "bluesky";

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
            content_platforms(platform, caption)
          `)
          .eq("brand_id", brandId)
          .order("created_at", { ascending: false })
          .limit(8);

        if (ignore) return;

        const list: ThreadItem[] = [];
        if (contentRows) {
          let seed = 9;
          for (const row of contentRows) {
            const rawMedia = row.content_media as Array<{ media?: { file_url?: string } }> | undefined;
            const fileUrl = rawMedia?.[0]?.media?.file_url || null;

            const targetPlatform = (row.content_platforms as Array<{ platform: string; caption?: string }> | undefined)?.find(
              (p) => p.platform === platform || p.platform === "threads" || p.platform === "bluesky" || p.platform === "instagram"
            );

            list.push({
              id: row.id,
              caption: targetPlatform?.caption || row.title,
              mediaUrl: fileUrl,
              createdAt: row.created_at,
              likes: 12 + (seed * 8) % 120,
              replies: 2 + (seed * 3) % 25,
            });
            seed++;
          }
        }
        setThreads(list);
      } catch (err) {
        console.warn("[ThreadsTimelineFeed] Failed to load threads:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [brandId, platform]);

  const displayThreads = useMemo(() => {
    const res: ThreadItem[] = [];
    if (currentDraftCaption?.trim() || currentDraftMedia?.url) {
      res.push({
        id: "current-draft",
        caption: currentDraftCaption || (isEn ? "Draft thread post..." : "Taslak ileti metni..."),
        mediaUrl: currentDraftMedia?.url || null,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: 0,
        isDraft: true,
      });
    }
    for (const t of threads) {
      if (res.length >= 6) break;
      res.push(t);
    }
    return res;
  }, [currentDraftCaption, currentDraftMedia, threads, isEn]);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-slate-900">
      {/* Profile Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">{brandName}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium">@{handle}</span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600">
                {isBluesky ? "bsky.social" : "threads.net"}
              </span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-full bg-slate-900 text-white font-extrabold text-lg flex items-center justify-center shadow-sm">
            {initial}
          </div>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          {bio || (isEn ? "Sharing thoughts, drops and behind the scenes." : "Marka güncellemeleri, düşünceler ve sahne arkası paylaşımları.")}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>14.2K {isEn ? "followers" : "takipçi"}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {isBluesky ? "🦋 Bluesky Timeline" : "🧵 Threads Feed"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-around border-b border-slate-100 py-2 text-xs font-bold text-slate-500 bg-slate-50/40">
        <span className="text-slate-900 border-b-2 border-slate-900 pb-1 px-4 cursor-pointer">
          {isEn ? "Threads" : "İletiler"}
        </span>
        <span className="hover:text-slate-900 cursor-pointer">{isEn ? "Replies" : "Yanıtlar"}</span>
        <span className="hover:text-slate-900 cursor-pointer">{isEn ? "Reposts" : "Yeniden Paylaşım"}</span>
      </div>

      {/* Chronological Stream */}
      <div className="divide-y divide-slate-100 p-2 sm:p-3 space-y-2">
        {loading ? (
          <div className="space-y-3 p-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          displayThreads.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl transition ${
                item.isDraft ? "bg-violet-50/70 border border-violet-200 shadow-2xs" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {initial}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">@{handle}</span>
                    {item.isDraft ? (
                      <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[8px] font-black text-white shadow-2xs">
                        {isEn ? "LIVE DRAFT" : "CANLI TASLAK"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    )}
                  </div>

                  {/* Caption */}
                  <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {item.caption}
                  </p>

                  {/* Attached Media if any */}
                  {item.mediaUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden aspect-video max-h-40 bg-slate-100 border border-slate-200/80">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}

                  {/* Action row (Heart, Comment, Repost, Share) */}
                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 hover:text-rose-600 transition cursor-pointer">
                      ❤️ {item.likes}
                    </span>
                    <span className="flex items-center gap-1 hover:text-blue-600 transition cursor-pointer">
                      💬 {item.replies}
                    </span>
                    <span className="hover:text-emerald-600 transition cursor-pointer">
                      🔁
                    </span>
                    <span className="hover:text-slate-600 transition cursor-pointer">
                      ↗️
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
