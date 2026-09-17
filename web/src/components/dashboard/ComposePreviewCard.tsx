"use client";

import { useState } from "react";
import type { PlatformName } from "@/components/PlatformIcon";
import { useLanguage } from "@/context/LanguageContext";
import InstagramGridFeed from "./instagram/InstagramGridFeed";
import TikTokGridFeed from "./instagram/TikTokGridFeed";
import PinterestBoardFeed from "./instagram/PinterestBoardFeed";
import ThreadsTimelineFeed from "./instagram/ThreadsTimelineFeed";
import FacebookPageFeed from "./instagram/FacebookPageFeed";

type PreviewMediaItem = { url: string; isVideo: boolean };

type Props = {
  platform: PlatformName;
  brandName: string;
  caption: string;
  media: PreviewMediaItem[];
  brandId?: string;
};

export default function ComposePreviewCard({ platform, brandName, caption, media, brandId }: Props) {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const [index, setIndex] = useState(0);
  const [viewStyle, setViewStyle] = useState<"post" | "profile">("post");

  const initial = brandName[0]?.toUpperCase() || "A";
  const handle = (brandName || (isEn ? "brand" : "marka")).toLowerCase().replace(/\s+/g, "");

  // Only Instagram/Facebook ever publish more than the first item — showing
  // carousel nav on Threads/TikTok would preview something that can't
  // actually happen there.
  const supportsCarousel = platform === "instagram" || platform === "facebook";
  const visibleMedia = supportsCarousel ? media : media.slice(0, 1);
  const safeIndex = visibleMedia.length > 0 ? Math.min(index, visibleMedia.length - 1) : 0;
  const current = visibleMedia[safeIndex] ?? null;
  const mediaUrl = current?.url ?? null;
  const mediaIsVideo = current?.isVideo ?? false;
  const isCarousel = visibleMedia.length > 1;

  const mediaNode = mediaUrl ? (
    mediaIsVideo ? (
      <video src={mediaUrl} muted loop autoPlay className="h-full w-full object-cover" />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={mediaUrl} alt="" className="h-full w-full object-cover" />
    )
  ) : null;

  // Real click-through nav, not a static "1/N" label — a carousel you can't
  // actually browse isn't a preview of the real thing.
  const carouselNav = isCarousel && (
    <>
      <span className="absolute right-2 top-2 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
        {safeIndex + 1}/{visibleMedia.length}
      </span>
      {safeIndex > 0 && (
        <button
          type="button"
          onClick={() => setIndex(safeIndex - 1)}
          aria-label={isEn ? "Previous image" : "Önceki görsel"}
          className="absolute left-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {safeIndex < visibleMedia.length - 1 && (
        <button
          type="button"
          onClick={() => setIndex(safeIndex + 1)}
          aria-label={isEn ? "Next image" : "Sonraki görsel"}
          className="absolute right-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
        {visibleMedia.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={isEn ? `Go to image ${i + 1}` : `${i + 1}. görsele git`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === safeIndex ? "w-3 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </>
  );

  const emptyMedia = (
    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-slate-50">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm mb-2">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <span className="text-xs font-bold text-slate-700">{isEn ? "Live Media Canvas" : "Canlı Görsel Alanı"}</span>
      <p className="text-[11px] text-slate-400 mt-0.5">
        {isEn ? "Will instantly preview here once you generate or upload media." : "Görsel ürettiğinizde veya yüklediğinizde anında burada canlanacak."}
      </p>
    </div>
  );

  const captionNode = (
    <p className="whitespace-pre-line">
      <span className="font-bold text-slate-900 mr-1.5">{brandName}</span>
      {caption}
    </p>
  );

  const profileSupported = Boolean(brandId);

  const profilePlannerNode = brandId ? (
    platform === "instagram" ? (
      <InstagramGridFeed
        brandId={brandId}
        brandName={brandName}
        currentDraftMedia={mediaUrl ? { url: mediaUrl, isVideo: mediaIsVideo, caption } : null}
        isEn={isEn}
      />
    ) : platform === "tiktok" || platform === "youtube" ? (
      <TikTokGridFeed
        brandId={brandId}
        brandName={brandName}
        currentDraftMedia={mediaUrl ? { url: mediaUrl, isVideo: mediaIsVideo, caption } : null}
        isEn={isEn}
        platform={platform}
      />
    ) : platform === "pinterest" ? (
      <PinterestBoardFeed
        brandId={brandId}
        brandName={brandName}
        currentDraftMedia={mediaUrl ? { url: mediaUrl, isVideo: mediaIsVideo, caption } : null}
        isEn={isEn}
      />
    ) : platform === "threads" || platform === "bluesky" ? (
      <ThreadsTimelineFeed
        brandId={brandId}
        brandName={brandName}
        currentDraftCaption={caption}
        currentDraftMedia={mediaUrl ? { url: mediaUrl, isVideo: mediaIsVideo } : null}
        isEn={isEn}
        platform={platform}
      />
    ) : platform === "facebook" ? (
      <FacebookPageFeed
        brandId={brandId}
        brandName={brandName}
        currentDraftCaption={caption}
        currentDraftMedia={mediaUrl ? { url: mediaUrl, isVideo: mediaIsVideo } : null}
        isEn={isEn}
      />
    ) : null
  ) : null;

  const switcherNode = profileSupported && (
    <div className="flex items-center rounded-xl bg-slate-100 p-1 text-[11px] font-bold shadow-2xs mb-2.5">
      <button
        type="button"
        onClick={() => setViewStyle("post")}
        className={`flex-1 py-1.5 text-center rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
          viewStyle === "post" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <span>📱</span>
        <span>{isEn ? "Feed Post" : "Tekil Akış"}</span>
      </button>
      <button
        type="button"
        onClick={() => setViewStyle("profile")}
        className={`flex-1 py-1.5 text-center rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
          viewStyle === "profile" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
        }`}
      >
        <span>🌐</span>
        <span>{isEn ? "Profile / Feed Planner" : "Profil & Akış Planlayıcı"}</span>
      </button>
    </div>
  );

  if (viewStyle === "profile" && profilePlannerNode) {
    return (
      <div className="space-y-2.5">
        {switcherNode}
        {profilePlannerNode}
      </div>
    );
  }

  const wrapWithSwitcher = (node: React.ReactNode) => (
    <div className="space-y-2.5">
      {switcherNode}
      {node}
    </div>
  );

  if (platform === "tiktok") {
    return wrapWithSwitcher(
      <div className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-slate-950 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
        <div className="relative aspect-[9/16] w-full bg-slate-900">
          {mediaUrl ? (
            mediaNode
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-white">{isEn ? "Video required" : "Video gerekli"}</span>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isEn ? "TikTok does not support text or photo-only posts." : "TikTok metin veya fotoğrafla paylaşım yapamıyor."}
              </p>
            </div>
          )}

          {/* Gradient scrim so white overlay text/icons stay legible over any video */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />

          {/* Right action rail */}
          <div className="absolute right-2.5 bottom-16 flex flex-col items-center gap-4 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-900 ring-2 ring-white">
              {initial}
            </div>
            <button type="button" className="flex flex-col items-center gap-0.5">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button type="button" className="flex flex-col items-center gap-0.5">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
            <button type="button" className="flex flex-col items-center gap-0.5">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          {/* Bottom caption overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 pr-14 text-white">
            <p className="text-xs font-bold">@{handle}</p>
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs leading-relaxed">{caption}</p>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "facebook") {
    return wrapWithSwitcher(
      <div className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-xs font-bold text-white shadow-2xs">
            {initial}
          </div>
          <div>
            <span className="font-display text-xs font-bold text-slate-900">{brandName}</span>
            <p className="flex items-center gap-1 text-[10px] text-slate-400">
              <span>{isEn ? "Sponsored · Just now" : "Sponsorlu · Şimdi"}</span>
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </p>
          </div>
        </div>

        {/* Facebook shows the caption above the media, not below it */}
        <div className="px-4 pb-3 text-xs leading-relaxed text-slate-800 whitespace-pre-line">
          {caption || <span className="text-slate-400">{isEn ? "Your copy will appear here…" : "Metniniz burada görünecek…"}</span>}
        </div>

        <div className="relative aspect-[1.91/1] w-full bg-slate-100 overflow-hidden">
          {mediaUrl ? mediaNode : emptyMedia}
          {carouselNav}
        </div>

        <div className="flex items-center justify-around border-t border-slate-100 px-2 py-1.5">
          {[
            { label: isEn ? "Like" : "Beğen", d: "M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2v10z" },
            { label: isEn ? "Comment" : "Yorum Yap", d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
            { label: isEn ? "Share" : "Paylaş", d: "M8.684 13.342a3 3 0 100-2.684m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" },
          ].map((btn) => (
            <button
              key={btn.label}
              type="button"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={btn.d} />
              </svg>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (platform === "threads" || platform === "bluesky") {
    return wrapWithSwitcher(
      <div className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {initial}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">{handle}</span>
                <span className="text-[10px] text-slate-400">{isEn ? "Just now" : "Şimdi"}</span>
              </div>
            </div>
            <span className="text-slate-400 text-xs">•••</span>
          </div>

          <p className="pl-10 text-xs leading-relaxed text-slate-800 whitespace-pre-line">
            {caption || <span className="text-slate-400">{isEn ? "Your copy will appear here…" : "Metniniz burada görünecek…"}</span>}
          </p>

          {mediaUrl && <div className="ml-10 relative aspect-square w-[calc(100%-2.5rem)] overflow-hidden rounded-xl bg-slate-100">{mediaNode}</div>}

          <div className="pl-10 flex items-center gap-3.5 pt-1 text-slate-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5a4.5 4.5 0 000-9H12" />
            </svg>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>

          <p className="pl-10 text-[11px] text-slate-400">
            {isEn ? "Likes and replies will appear here once published." : "Beğenmeler ve yanıtlar yayınlandıktan sonra burada görünür."}
          </p>
        </div>
      </div>
    );
  }

  if (platform === "pinterest") {
    return wrapWithSwitcher(
      <div className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="relative aspect-[2/3] w-full bg-slate-100 overflow-hidden">
          {mediaUrl ? mediaNode : emptyMedia}
          {mediaUrl && (
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full bg-[#E60023] px-4 py-2 text-xs font-bold text-white shadow-md"
            >
              {isEn ? "Save" : "Kaydet"}
            </button>
          )}
        </div>
        <div className="p-4 space-y-2.5">
          <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
            {caption || <span className="font-normal text-slate-400">{isEn ? "Your description will appear here…" : "Açıklamanız burada görünecek…"}</span>}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E60023] text-[10px] font-bold text-white">
              {initial}
            </div>
            <span className="text-xs font-semibold text-slate-700">{brandName}</span>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "telegram") {
    return wrapWithSwitcher(
      <div className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#26A5E4] text-xs font-bold text-white shadow-2xs">
            {initial}
          </div>
          <div>
            <span className="font-display text-xs font-bold text-slate-900">{brandName}</span>
            <p className="text-[10px] text-slate-400">{isEn ? "Channel · Just now" : "Kanal · Şimdi"}</p>
          </div>
        </div>

        {mediaUrl && <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">{mediaNode}</div>}

        <div className="px-4 py-3 text-xs leading-relaxed text-slate-800 whitespace-pre-line">
          {caption || <span className="text-slate-400">{isEn ? "Your copy will appear here…" : "Metniniz burada görünecek…"}</span>}
        </div>

        <div className="px-4 pb-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <span>{isEn ? "View count will appear here once published." : "Görüntülenme sayısı yayınlandıktan sonra görünür."}</span>
        </div>
      </div>
    );
  }

  if (platform === "youtube") {
    return wrapWithSwitcher(
      <div className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-slate-950 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
        <div className="relative aspect-[9/16] w-full bg-slate-900">
          {mediaUrl ? (
            mediaNode
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-white">{isEn ? "Video required" : "Video gerekli"}</span>
              <p className="text-[11px] text-white/50 mt-0.5">
                {isEn ? "YouTube Shorts does not support text or photo-only posts." : "YouTube metin veya fotoğrafla paylaşım yapamıyor."}
              </p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />

          <div className="absolute right-2.5 bottom-16 flex flex-col items-center gap-4 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-900 ring-2 ring-white">
              {initial}
            </div>
            <button type="button" className="flex flex-col items-center gap-0.5">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button type="button" className="flex flex-col items-center gap-0.5">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-[#FF0000] px-1.5 py-0.5 text-[10px] font-bold text-white">
            Shorts
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 pr-14 text-white">
            <p className="text-xs font-bold">@{handle}</p>
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs leading-relaxed">{caption}</p>
          </div>
        </div>
      </div>
    );
  }

  // Instagram — the default/fallback shape.
  return wrapWithSwitcher(
    <div className="overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-[#FA5252] font-bold text-xs text-white shadow-2xs">
            {initial}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-display text-xs font-bold text-slate-900">{brandName}</span>
              <svg className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-[10px] text-slate-400">{isEn ? "Sponsored · Just now" : "Sponsorlu · Şimdi"}</p>
          </div>
        </div>
        <span className="text-xs text-slate-400">•••</span>
      </div>

      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        {mediaUrl ? mediaNode : emptyMedia}
        {carouselNav}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-slate-800">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <svg className="h-5 w-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>

        <div className="text-xs text-slate-800 leading-relaxed space-y-1">{captionNode}</div>

        <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
          <span>{isEn ? "Add a comment..." : "Yorum ekle..."}</span>
          <span className="text-rose-600 font-bold cursor-pointer">{isEn ? "Post" : "Paylaş"}</span>
        </div>
      </div>
    </div>
  );
}
