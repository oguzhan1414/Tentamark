"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface FacebookFeedItem {
  id: string;
  caption: string;
  mediaUrl?: string | null;
  createdAt: string;
  likes: number;
  comments: number;
  isDraft?: boolean;
}

interface FacebookPageFeedProps {
  brandId: string;
  brandName: string;
  currentDraftCaption?: string;
  currentDraftMedia?: { url: string; isVideo: boolean } | null;
  isEn?: boolean;
}

export default function FacebookPageFeed({
  brandId,
  brandName,
  currentDraftCaption,
  currentDraftMedia,
  isEn = false,
}: FacebookPageFeedProps) {
  const [posts, setPosts] = useState<FacebookFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  const initial = (brandName || "F")[0]?.toUpperCase() || "F";

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    async function loadData() {
      setLoading(true);
      try {
        const { data: dna } = await supabase
          .from("brand_dna")
          .select("industry")
          .eq("brand_id", brandId)
          .maybeSingle();

        if (ignore) return;
        if (dna) setCategory(dna.industry || (isEn ? "Brand & Media Page" : "İşletme & Marka Sayfası"));

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

        const list: FacebookFeedItem[] = [];
        if (contentRows) {
          let seed = 12;
          for (const row of contentRows) {
            const rawMedia = row.content_media as Array<{ media?: { file_url?: string } }> | undefined;
            const fileUrl = rawMedia?.[0]?.media?.file_url || null;

            const targetPlatform = (row.content_platforms as Array<{ platform: string; caption?: string }> | undefined)?.find(
              (p) => p.platform === "facebook" || p.platform === "instagram"
            );

            list.push({
              id: row.id,
              caption: targetPlatform?.caption || row.title,
              mediaUrl: fileUrl,
              createdAt: row.created_at,
              likes: 24 + (seed * 11) % 240,
              comments: 4 + (seed * 2) % 35,
            });
            seed++;
          }
        }
        setPosts(list);
      } catch (err) {
        console.warn("[FacebookPageFeed] Failed to load Facebook data:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [brandId, isEn]);

  const displayPosts = useMemo(() => {
    const res: FacebookFeedItem[] = [];
    if (currentDraftCaption?.trim() || currentDraftMedia?.url) {
      res.push({
        id: "current-draft",
        caption: currentDraftCaption || (isEn ? "Draft post copy..." : "Taslak gönderi metni..."),
        mediaUrl: currentDraftMedia?.url || null,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
        isDraft: true,
      });
    }
    for (const p of posts) {
      if (res.length >= 6) break;
      res.push(p);
    }
    return res;
  }, [currentDraftCaption, currentDraftMedia, posts, isEn]);

  return (
    <div className="flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-slate-900">
      {/* Cover Banner & Page Profile */}
      <div className="bg-white border-b border-slate-200">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="px-4 pb-3 relative">
          <div className="-mt-10 flex items-end justify-between">
            <div className="h-16 w-16 rounded-full bg-[#1877F2] text-white font-black text-xl flex items-center justify-center border-4 border-white shadow-md">
              {initial}
            </div>
            <span className="rounded-lg bg-blue-50 text-[#1877F2] font-bold text-[10px] px-2.5 py-1 border border-blue-200">
              👥 {isEn ? "Facebook Page" : "Facebook Sayfası"}
            </span>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-slate-900">{brandName}</h3>
              <span className="text-[#1877F2] text-xs">✓</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {category || (isEn ? "Business & Brand Page" : "İşletme & Marka Sayfası")} · 24K {isEn ? "likes" : "beğeni"}
            </p>
          </div>
        </div>
      </div>

      {/* Posts Stream */}
      <div className="p-2 sm:p-3 space-y-2.5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white animate-pulse" />
            ))}
          </div>
        ) : (
          displayPosts.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs ${
                item.isDraft ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#1877F2] text-white text-xs font-bold flex items-center justify-center">
                      {initial}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{brandName}</h4>
                      <p className="text-[10px] text-slate-400">
                        {item.isDraft
                          ? isEn ? "Draft · Just now" : "Taslak · Şimdi"
                          : new Date(item.createdAt).toLocaleDateString("tr-TR")} · 🌐
                      </p>
                    </div>
                  </div>
                  {item.isDraft && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[8px] font-black text-white">
                      {isEn ? "LIVE DRAFT" : "CANLI TASLAK"}
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {item.caption}
                </p>
              </div>

              {/* Media */}
              {item.mediaUrl && (
                <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}

              {/* Like / Comment / Share bar */}
              <div className="border-t border-slate-100 px-3 py-1.5 flex items-center justify-around text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1 hover:text-[#1877F2] cursor-pointer">
                  👍 {item.likes > 0 ? item.likes : (isEn ? "Like" : "Beğen")}
                </span>
                <span className="flex items-center gap-1 hover:text-[#1877F2] cursor-pointer">
                  💬 {item.comments > 0 ? item.comments : (isEn ? "Comment" : "Yorum Yap")}
                </span>
                <span className="flex items-center gap-1 hover:text-[#1877F2] cursor-pointer">
                  ↗️ {isEn ? "Share" : "Paylaş"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
