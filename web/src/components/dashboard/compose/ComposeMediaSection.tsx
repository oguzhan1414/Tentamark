"use client";

import { useState } from "react";
import PlatformIcon from "@/components/PlatformIcon";
import type { LaunchPlatform } from "@/lib/ai/generateDrafts";

export type ComposeMediaItem =
  | { kind: "existing"; media: { id: string; file_url: string; file_type: string; file_name: string } }
  | { kind: "upload"; file: File; previewUrl: string }
  | { kind: "generated"; dataUrl: string };

interface ComposeMediaSectionProps {
  mediaItems: ComposeMediaItem[];
  removeMediaItem: (index: number) => void;
  moveMediaItem: (from: number, to: number) => void;
  mediaItemIsVideo: (item: ComposeMediaItem) => boolean;
  mediaItemPreviewUrl: (item: ComposeMediaItem) => string;
  requiresVideo: boolean;
  mediaPreview: string | null;
  mediaPreviewIsVideo: boolean;
  visualPromptOpen: boolean;
  setVisualPromptOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  visualPrompt: string;
  setVisualPrompt: (val: string) => void;
  imageError: string | null;
  canvaError: string | null;
  selectedPlatforms: LaunchPlatform[];
  tiktokVideoFile: File | null;
  onTiktokVideoChange: (file: File | null) => void;
  onAddUploadFiles: (files: File[]) => void;
  onOpenLibrary: () => void;
  canvaConnected: boolean;
  canvaBusy: boolean;
  onStartCanvaDesign: () => void;
  generatingImage: boolean;
  onTriggerImageGeneration: () => void;
  conceptAvailable: boolean;
  maxMediaItems: number;
  isEn: boolean;
}

export default function ComposeMediaSection({
  mediaItems,
  removeMediaItem,
  moveMediaItem,
  mediaItemIsVideo,
  mediaItemPreviewUrl,
  requiresVideo,
  mediaPreview,
  mediaPreviewIsVideo,
  visualPromptOpen,
  setVisualPromptOpen,
  visualPrompt,
  setVisualPrompt,
  imageError,
  canvaError,
  selectedPlatforms,
  tiktokVideoFile,
  onTiktokVideoChange,
  onAddUploadFiles,
  onOpenLibrary,
  canvaConnected,
  canvaBusy,
  onStartCanvaDesign,
  generatingImage,
  onTriggerImageGeneration,
  conceptAvailable,
  maxMediaItems,
  isEn,
}: ComposeMediaSectionProps) {
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const zoomedItem = zoomedIndex !== null ? mediaItems[zoomedIndex] : undefined;

  return (
    <div className="space-y-2">
      {requiresVideo && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">
          {isEn
            ? "TikTok and YouTube cannot post text or photos alone — a real video file must be uploaded (AI image generation is not available here)."
            : "TikTok ve YouTube metin veya fotoğrafla paylaşım yapamıyor — gerçek bir video dosyası yüklemen gerekiyor (AI görsel üretimi burada kullanılamaz)."}
        </p>
      )}

      {!requiresVideo && mediaItems.length > 1 && selectedPlatforms.includes("threads") && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2">
          {isEn
            ? "Threads does not support carousels — only the first image will be published on this platform."
            : "Threads carousel'i desteklemiyor — bu platformda yalnızca ilk görsel paylaşılacak."}
        </p>
      )}

      {!requiresVideo && (
        <div>
          <button
            type="button"
            onClick={() => setVisualPromptOpen((prev) => !prev)}
            aria-expanded={visualPromptOpen}
            className="text-[11px] font-semibold text-slate-500 hover:text-blue-700 cursor-pointer"
          >
            {isEn ? "AI image details" : "AI görsel ayrıntıları"}{" "}
            {visualPromptOpen ? "⌃" : "⌄"}
          </button>
          {visualPromptOpen && (
            <input
              type="text"
              value={visualPrompt}
              onChange={(e) => setVisualPrompt(e.target.value)}
              placeholder={
                isEn
                  ? "Visual concept for AI image (optional)…"
                  : "AI görseli için konsept (opsiyonel)…"
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
            />
          )}
        </div>
      )}

      {imageError && (
        <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg">{imageError}</p>
      )}
      {canvaError && (
        <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded-lg">{canvaError}</p>
      )}

      {/* Media previews strip */}
      {requiresVideo ? (
        mediaPreview && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-xs">
            <video src={mediaPreview} muted className="h-full w-full object-cover" />
          </div>
        )
      ) : (
        mediaItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mediaItems.map((item, index) => (
              <div
                key={index}
                className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-xs bg-slate-100"
              >
                <button
                  type="button"
                  onClick={() => setZoomedIndex(index)}
                  aria-label={isEn ? "Enlarge media" : "Görseli büyüt"}
                  className="block h-full w-full cursor-zoom-in"
                >
                  {mediaItemIsVideo(item) ? (
                    <video
                      src={mediaItemPreviewUrl(item)}
                      muted
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaItemPreviewUrl(item)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
                {mediaItems.length > 1 && (
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[9px] font-bold text-white">
                    {index + 1}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeMediaItem(index)}
                  aria-label={isEn ? "Remove media" : "Görseli kaldır"}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white shadow-sm transition hover:bg-red-600 cursor-pointer"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
                {mediaItems.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 flex justify-between px-0.5 pb-0.5 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => moveMediaItem(index, index - 1)}
                      disabled={index === 0}
                      aria-label={isEn ? "Move left" : "Öne al"}
                      className="flex h-4 w-4 items-center justify-center rounded bg-black/60 text-[10px] leading-none text-white disabled:opacity-0 cursor-pointer"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMediaItem(index, index + 1)}
                      disabled={index === mediaItems.length - 1}
                      aria-label={isEn ? "Move right" : "Sona al"}
                      className="flex h-4 w-4 items-center justify-center rounded bg-black/60 text-[10px] leading-none text-white disabled:opacity-0 cursor-pointer"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Action buttons toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {requiresVideo ? (
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer">
            <svg
              className="h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span>
              {tiktokVideoFile
                ? tiktokVideoFile.name
                : isEn
                ? "Select video (MP4/MOV)"
                : "Video seç (MP4/MOV)"}
            </span>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                onTiktokVideoChange(file);
              }}
            />
          </label>
        ) : (
          <>
            <label
              title={
                isEn
                  ? "Upload photos (hold Ctrl/Cmd or Shift to select several at once)"
                  : "Fotoğraf yükle (birden fazla seçmek için Ctrl/Cmd veya Shift'e basılı tutun)"
              }
              className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer ${
                mediaItems.length >= maxMediaItems
                  ? "opacity-40 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={mediaItems.length >= maxMediaItems}
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length > 0) onAddUploadFiles(files);
                }}
              />
            </label>

            <button
              type="button"
              onClick={onOpenLibrary}
              disabled={mediaItems.length >= maxMediaItems}
              title={isEn ? "Choose from library" : "Kütüphaneden seç"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={canvaConnected ? onStartCanvaDesign : undefined}
              disabled={!canvaConnected || canvaBusy || mediaItems.length >= maxMediaItems}
              title={
                canvaConnected
                  ? isEn
                    ? "Design with Canva"
                    : "Canva ile tasarla"
                  : isEn
                  ? "Connect Canva from Settings first"
                  : "Önce Ayarlar'dan Canva'yı bağla"
              }
              className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg transition hover:ring-2 hover:ring-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {canvaBusy ? (
                <span className="flex h-full w-full items-center justify-center border border-slate-200 bg-white">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                </span>
              ) : (
                <PlatformIcon name="canva" variant="tile" className="h-9 w-9 rounded-lg" />
              )}
            </button>

            <button
              type="button"
              onClick={onTriggerImageGeneration}
              disabled={generatingImage || !conceptAvailable || mediaItems.length >= maxMediaItems}
              title={isEn ? "Generate image with AI" : "AI ile görsel üret"}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {generatingImage ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                  />
                </svg>
              )}
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              {mediaItems.length > 1 && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {mediaItems.length} / {maxMediaItems}
                </span>
              )}
              {mediaPreview && !mediaPreviewIsVideo && (
                <span
                  title={
                    isEn
                      ? "AI will analyze the first image and tailor the copy to its content."
                      : "AI, metni üretirken ilk görseli gerçekten inceleyip içeriğine göre yazacak."
                  }
                  className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md"
                >
                  {isEn ? "✨ AI sees image" : "✨ AI görseli görüyor"}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {zoomedItem && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomedIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 cursor-zoom-out"
        >
          <button
            type="button"
            onClick={() => setZoomedIndex(null)}
            aria-label={isEn ? "Close" : "Kapat"}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white hover:bg-white/20 cursor-pointer"
          >
            ✕
          </button>
          {mediaItemIsVideo(zoomedItem) ? (
            <video
              src={mediaItemPreviewUrl(zoomedItem)}
              controls
              autoPlay
              className="max-h-full max-w-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mediaItemPreviewUrl(zoomedItem)}
              alt=""
              className="max-h-full max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}
