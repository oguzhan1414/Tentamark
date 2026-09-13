"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PlatformIcon from "@/components/PlatformIcon";
import type { CalendarPost } from "./types";

type Props = {
  post: CalendarPost;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export default function CalendarDetailModal({
  post,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"analytics" | "comments">("analytics");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  const analytics = post.analytics || {
    views: "7.13K",
    reach: "7.13K",
    engagement: "1.11K",
    videoPlays: { threeSec: 0, oneMin: 0, avgMinutes: "0:00" },
    reactions: { like: 6, love: 14, haha: 27, wow: 3, sad: 41, angry: 39, total: 130 },
    comments: 759,
    shares: 42,
    linkClicks: 0,
    otherClicks: 306,
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-md">
      {/* Top Bar (matching screenshot 3) */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-xs">
        {/* Left: Platform badge, Campaign, Tags */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <PlatformIcon name={post.platform} variant="bare" className="h-4 w-4 text-white" />
          </div>

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition"
          >
            +
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* Campaign Pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            <span>📢</span>
            <span>{post.campaignName || "Campaign"}</span>
          </span>

          {/* Engagement tag */}
          {post.tags[0] && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 hidden sm:inline-block">
              {post.tags[0]}
            </span>
          )}

          {/* Labels Pill */}
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hidden md:inline-block">
            Labels
          </span>
        </div>

        {/* Right: Team, Share, Icons, Close */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex -space-x-1.5 hidden sm:flex">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white ring-2 ring-white">
              N
            </div>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white">
              O
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Share
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* Analytics Icon */}
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              activeTab === "analytics" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          {/* Comments Icon */}
          <button
            type="button"
            onClick={() => setActiveTab("comments")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              activeTab === "comments" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition ml-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Split Area (matching screenshot 3) */}
      <div className="relative flex flex-1 overflow-hidden bg-[#edf1f5]/90">
        {/* Floating Left Arrow */}
        <button
          type="button"
          onClick={onPrev}
          aria-label="Önceki"
          className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg hover:bg-white transition cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Floating Right Arrow */}
        <button
          type="button"
          onClick={onNext}
          aria-label="Sonraki"
          className="absolute right-[415px] top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg hover:bg-white transition cursor-pointer hidden sm:flex"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Left / Center Preview Section */}
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-6 sm:px-8">
          {/* Top Device View Switcher */}
          <div className="mb-5 flex items-center rounded-xl bg-white p-1 shadow-xs border border-slate-200">
            <button
              type="button"
              onClick={() => setDeviceView("desktop")}
              className={`flex h-8 w-10 items-center justify-center rounded-lg transition ${
                deviceView === "desktop" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setDeviceView("mobile")}
              className={`flex h-8 w-10 items-center justify-center rounded-lg transition ${
                deviceView === "mobile" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div className="flex w-full max-w-2xl items-start justify-center gap-6">
            {/* Left Status and Publication info */}
            <div className="hidden sm:flex flex-col items-end pt-8 shrink-0 w-48 text-right space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Approved by Nora</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                  ✓
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="leading-tight">Post has been published about 6 hours ago</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shrink-0">
                  f
                </span>
              </div>
            </div>

            {/* Simulated Post Card (matching screenshot 3) */}
            <div
              className={`w-full transition-all duration-300 ${
                deviceView === "mobile"
                  ? "max-w-[340px] rounded-[32px] border-[6px] border-slate-800 bg-white p-1 shadow-2xl"
                  : "max-w-[480px] rounded-2xl border border-slate-200 bg-white shadow-xl"
              }`}
            >
              <div className="overflow-hidden rounded-xl bg-white">
                {/* Header */}
                <div className="flex items-center justify-between p-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                      j
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900">{post.accountName}</span>
                      <p className="text-[11px] text-slate-500">{post.date} • {post.timeLabel}</p>
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="p-3.5 text-xs leading-relaxed text-slate-800">
                  {post.caption}
                </div>

                {/* Media (with play overlay if video, matching screenshot 3) */}
                {post.imageUrl && (
                  <div className="relative aspect-4/3 w-full bg-slate-100">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      sizes="480px"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs shadow-lg">
                        <svg className="h-6 w-6 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Analytics Drawer Panel (matching screenshot 3) */}
        <aside className="w-full sm:w-[400px] shrink-0 border-l border-slate-200 bg-white flex flex-col h-full shadow-lg z-10 overflow-y-auto">
          <div className="flex h-14 items-center justify-between border-b border-slate-100 px-6">
            <h3 className="font-semibold text-sm text-slate-800">Analytics</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Top 3 KPI Cards: Views, Reach, Engmt */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">Views</span>
                <p className="mt-1 text-lg font-bold text-slate-900">{analytics.views}</p>
                <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full w-4/5" />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">Reach</span>
                <p className="mt-1 text-lg font-bold text-slate-900">{analytics.reach}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500">Engmt.</span>
                <p className="mt-1 text-lg font-bold text-slate-900">{analytics.engagement}</p>
              </div>
            </div>

            {/* Plays Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <span>Plays</span>
                <span className="text-slate-400 text-[10px]">ℹ</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span className="flex items-center gap-2">
                    <span>▷</span> 3-second video views
                  </span>
                  <span className="font-semibold text-slate-900">{analytics.videoPlays?.threeSec ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span className="flex items-center gap-2">
                    <span>▷</span> 1 minute video views
                  </span>
                  <span className="font-semibold text-slate-900">{analytics.videoPlays?.oneMin ?? 0}</span>
                </div>
                <div className="flex items-center justify-between py-1 text-slate-600">
                  <span className="flex items-center gap-2">
                    <span>🎥</span> Avg. minutes viewed
                  </span>
                  <span className="font-semibold text-slate-900">{analytics.videoPlays?.avgMinutes ?? "0:00"}</span>
                </div>
              </div>
            </div>

            {/* Engagements Section (with Reaction Emojis, matching screenshot 3) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Engagements</span>
                <span className="font-bold text-slate-900">{analytics.engagement}</span>
              </div>

              {/* Reaction Emojis Strip */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-base">👍</span>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">{analytics.reactions.like}</p>
                </div>
                <div>
                  <span className="text-base">❤️</span>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">{analytics.reactions.love}</p>
                </div>
                <div>
                  <span className="text-base">😆</span>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">{analytics.reactions.haha}</p>
                </div>
                <div>
                  <span className="text-base">😮</span>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">{analytics.reactions.wow}</p>
                </div>
                <div>
                  <span className="text-base">😢</span>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">{analytics.reactions.sad}</p>
                </div>
                <div>
                  <span className="text-base">😡</span>
                  <p className="text-[11px] font-bold text-slate-700 mt-0.5">{analytics.reactions.angry}</p>
                </div>
              </div>

              {/* Engagement details rows */}
              <div className="space-y-2 text-xs pt-1">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Reactions</span>
                  <span className="font-semibold text-slate-900">{analytics.reactions.total}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Comments</span>
                  <span className="font-semibold text-slate-900">{analytics.comments}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Shares</span>
                  <span className="font-semibold text-slate-900">{analytics.shares}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>Link clicks</span>
                  <span className="font-semibold text-slate-900">{analytics.linkClicks}</span>
                </div>
                <div className="flex items-center justify-between py-1 text-slate-600">
                  <span>Other clicks</span>
                  <span className="font-semibold text-slate-900">{analytics.otherClicks}</span>
                </div>
              </div>
            </div>

            {/* Bottom View All Analytics Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
              >
                View all analytics
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-1.5">
                34,754 post impressions over the past week
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
