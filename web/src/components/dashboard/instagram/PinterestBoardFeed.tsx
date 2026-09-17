"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface PinterestPinItem {
  id: string;
  mediaUrl: string;
  title: string;
  caption?: string;
  saves: number;
  createdAt: string;
  isDraft?: boolean;
}

interface PinterestBoardFeedProps {
  brandId: string;
  brandName: string;
  currentDraftMedia?: { url: string; isVideo: boolean; caption?: string } | null;
  isEn?: boolean;
}

export default function PinterestBoardFeed({
  brandId,
  brandName,
  currentDraftMedia,
  isEn = false,
}: PinterestBoardFeedProps) {
  const [pins, setPins] = useState<PinterestPinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState<PinterestPinItem | null>(null);

  const handle = (brandName || "brand").toLowerCase().replace(/\s+/g, "");
  const initial = (brandName || "P")[0]?.toUpperCase() || "P";

  useEffect(() => {
    let ignore = false;
    const supabase = createClient();

    async function loadData() {
      setLoading(true);
      try {
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
          .limit(12);

        if (ignore) return;

        const list: PinterestPinItem[] = [];
        if (contentRows) {
          let seed = 14;
          for (const row of contentRows) {
            const rawMedia = row.content_media as Array<{ media?: { file_url?: string; file_type?: string } }> | undefined;
            const fileUrl = rawMedia?.[0]?.media?.file_url;
            if (!fileUrl) continue;

            const pinPlatform = (row.content_platforms as Array<{ platform: string; caption?: string }> | undefined)?.find(
              (p) => p.platform === "pinterest" || p.platform === "instagram"
            );

            list.push({
              id: row.id,
              mediaUrl: fileUrl,
              title: row.title,
              caption: pinPlatform?.caption || row.title,
              saves: 18 + (seed * 7) % 180,
              createdAt: row.created_at,
            });
            seed++;
          }
        }
        setPins(list);
      } catch (err) {
        console.warn("[PinterestBoardFeed] Failed to load pins:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [brandId]);

  const displayPins = useMemo(() => {
    const res: PinterestPinItem[] = [];
    if (currentDraftMedia?.url) {
      res.push({
        id: "current-draft",
        mediaUrl: currentDraftMedia.url,
        title: isEn ? "New Pin Draft" : "Yeni Pin Taslağı",
        caption: currentDraftMedia.caption,
        saves: 0,
        createdAt: new Date().toISOString(),
        isDraft: true,
      });
    }
    for (const p of pins) {
      if (res.length >= 8) break;
      res.push(p);
    }
    return res;
  }, [currentDraftMedia, pins, isEn]);

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden text-slate-900">
      {/* Pinterest Board Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-rose-50/30 to-white text-center space-y-2">
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-[#E60023] text-white font-black text-xl flex items-center justify-center shadow-md">
            {initial}
          </div>
          <h3 className="font-extrabold text-sm text-slate-900 mt-2">
            {brandName}
          </h3>
          <span className="text-[10px] font-semibold text-slate-400">
            pinterest.com/{handle} · {displayPins.length} {isEn ? "Pins" : "Pin"}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E60023] text-white text-[11px] font-bold px-4 py-1 shadow-xs">
          <span>📌</span>
          <span>{isEn ? "Moodboard & Pin Planner" : "Canlı Pano Akışı"}</span>
        </div>
      </div>

      {/* 2-Column Waterfall Masonry Pinboard */}
      <div className="p-2 sm:p-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 items-start">
            {displayPins.map((pin, idx) => (
              <div
                key={pin.id}
                onClick={() => setSelectedPin(pin)}
                className={`group relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 shadow-xs cursor-pointer transition hover:shadow-md ${
                  pin.isDraft ? "ring-2 ring-[#E60023]" : ""
                } ${idx % 2 === 1 ? "mt-2" : ""}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pin.mediaUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />

                  {/* Red Save button simulation on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <span className="rounded-full bg-[#E60023] text-white text-[10px] font-black px-3 py-1 shadow-md">
                      {isEn ? "Save" : "Kaydet"}
                    </span>
                  </div>

                  {pin.isDraft && (
                    <div className="absolute top-2 left-2">
                      <span className="rounded-full bg-slate-900/90 text-white text-[8px] font-black px-2 py-0.5 shadow-xs">
                        {isEn ? "NEW PIN" : "YENİ PİN"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pin Card Footer */}
                <div className="p-2 space-y-1">
                  <p className="text-[11px] font-bold text-slate-800 line-clamp-1">
                    {pin.title}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>@{handle}</span>
                    <span>📌 {pin.saves} {isEn ? "saves" : "kaydetme"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPin && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setSelectedPin(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl p-4 flex flex-col sm:flex-row gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPin(null)}
              className="absolute top-3 right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer"
            >
              ✕
            </button>
            <div className="sm:w-1/2 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedPin.mediaUrl} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="sm:w-1/2 flex flex-col justify-between py-2">
              <div className="space-y-2">
                <span className="rounded-full bg-[#E60023] text-white text-[10px] font-black px-2.5 py-0.5 inline-block">
                  Pinterest Pin
                </span>
                <h4 className="text-sm font-bold text-slate-900">{selectedPin.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {selectedPin.caption || (isEn ? "No caption." : "Açıklama yok.")}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{isEn ? "Pinterest Board Preview" : "Pinterest Pano Önizlemesi"}</span>
                <span className="font-bold text-[#E60023]">📌 {selectedPin.saves}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
