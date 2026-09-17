"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";
import ComposePreviewCard from "@/components/dashboard/ComposePreviewCard";
import type { LaunchPlatform } from "@/lib/ai/generateDrafts";

interface ComposePublishBarProps {
  scheduledAt: string;
  setScheduledAt: (val: string) => void;
  timezone: string;
  scheduleMenuOpen: boolean;
  setScheduleMenuOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  defaultScheduleValue: () => string;
  previewOpen: boolean;
  setPreviewOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  previewablePlatforms: PlatformName[];
  previewPlatform: PlatformName;
  setPreviewPlatform: (p: PlatformName) => void;
  brandId?: string;
  brandName: string;
  currentPreviewText: string;
  previewMedia?: { url: string; isVideo: boolean }[];
  selectedPlatforms: LaunchPlatform[];
  hashtagsAsFirstComment: boolean;
  setHashtagsAsFirstComment: (val: boolean) => void;
  submitting: boolean;
  submitMenuOpen: boolean;
  setSubmitMenuOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  submit: (status: "DRAFT" | "NEEDS_REVIEW" | "APPROVED", overrideIso?: string) => void;
  submitError: string | null;
  isEn: boolean;
}

export default function ComposePublishBar({
  brandId,
  scheduledAt,
  setScheduledAt,
  timezone,
  scheduleMenuOpen,
  setScheduleMenuOpen,
  defaultScheduleValue,
  previewOpen,
  setPreviewOpen,
  previewablePlatforms,
  previewPlatform,
  setPreviewPlatform,
  brandName,
  currentPreviewText,
  previewMedia,
  selectedPlatforms,
  hashtagsAsFirstComment,
  setHashtagsAsFirstComment,
  submitting,
  submitMenuOpen,
  setSubmitMenuOpen,
  submit,
  submitError,
  isEn,
}: ComposePublishBarProps) {
  const scheduleMenuRef = useRef<HTMLDivElement>(null);
  const submitMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        scheduleMenuRef.current &&
        !scheduleMenuRef.current.contains(event.target as Node)
      ) {
        setScheduleMenuOpen(false);
      }
      if (
        submitMenuRef.current &&
        !submitMenuRef.current.contains(event.target as Node)
      ) {
        setSubmitMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setScheduleMenuOpen, setSubmitMenuOpen]);

  return (
    <div className="space-y-4">
      {/* Scheduling Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="compose_scheduled_at"
            className="text-xs font-bold uppercase tracking-wider text-slate-400"
          >
            {isEn ? "Publish Date & Time" : "Yayın Tarihi & Saati"}
          </label>
          <span className="text-[11px] text-slate-400">{timezone}</span>
        </div>

        <div className="flex gap-1.5">
          <input
            id="compose_scheduled_at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-medium text-slate-800 focus:border-slate-400 focus:outline-none"
          />

          <div ref={scheduleMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setScheduleMenuOpen((prev) => !prev)}
              aria-label={isEn ? "Scheduling shortcuts" : "Zamanlama kısayolları"}
              aria-expanded={scheduleMenuOpen}
              className="flex h-full items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                className={`h-3 w-3 transition-transform ${
                  scheduleMenuOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {scheduleMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <span className="block px-2.5 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isEn ? "Scheduling" : "Zamanlama"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setScheduledAt(defaultScheduleValue());
                    setScheduleMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <span>⚡</span>
                  <span>
                    {isEn
                      ? "Best time (tomorrow, 19:30)"
                      : "En iyi zaman (yarın, 19:30)"}
                  </span>
                </button>
                <Link
                  href="/settings?tab=genel"
                  onClick={() => setScheduleMenuOpen(false)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <svg
                    className="h-3.5 w-3.5 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18"
                    />
                  </svg>
                  <span>
                    {isEn
                      ? "Change workspace time zone"
                      : "Çalışma alanı saat dilimini değiştir"}
                    <span className="block text-[10px] font-normal text-slate-400">
                      {timezone}
                    </span>
                  </span>
                </Link>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setPreviewOpen((prev) => !prev)}
            aria-label={isEn ? "Toggle preview" : "Önizlemeyi aç/kapat"}
            aria-expanded={previewOpen}
            className={`flex h-full items-center justify-center rounded-xl border px-2.5 transition cursor-pointer ${
              previewOpen
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {previewOpen && (
          <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {isEn ? "Preview" : "Önizleme"}
              </span>
              {previewablePlatforms.length > 0 && (
                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                  {previewablePlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreviewPlatform(p)}
                      className={`flex h-6 w-6 items-center justify-center rounded-md transition cursor-pointer ${
                        previewPlatform === p
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                      title={platformLabel(p)}
                    >
                      <PlatformIcon name={p} className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mx-auto max-w-[320px] sm:max-w-[360px] transition-all">
              <ComposePreviewCard
                platform={previewPlatform}
                brandName={brandName}
                caption={currentPreviewText}
                media={previewMedia ?? []}
                brandId={brandId}
              />
            </div>
          </div>
        )}
      </div>

      {/* First-comment hashtags */}
      {selectedPlatforms.some((p) => p === "instagram" || p === "facebook") && (
        <label className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={hashtagsAsFirstComment}
            onChange={(e) => setHashtagsAsFirstComment(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
          />
          <span className="text-xs font-medium text-slate-700">
            {isEn ? "🏷️ Post hashtags as first comment" : "🏷️ Hashtag'leri ilk yoruma at"}
            <span className="ml-1 text-slate-400 font-normal">
              {isEn ? "(Instagram/Facebook only)" : "(yalnızca Instagram/Facebook)"}
            </span>
          </span>
        </label>
      )}

      {/* Submit Buttons */}
      <div ref={submitMenuRef} className="relative flex pt-2">
        <button
          type="button"
          disabled={!scheduledAt || submitting}
          onClick={() => submit("NEEDS_REVIEW")}
          className="flex-1 rounded-l-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
        >
          {submitting
            ? isEn
              ? "Saving..."
              : "Kaydediliyor..."
            : isEn
            ? "Schedule & Send for Review 🚀"
            : "Zamanla & Onaya Gönder 🚀"}
        </button>
        <button
          type="button"
          disabled={!scheduledAt || submitting}
          onClick={() => setSubmitMenuOpen((prev) => !prev)}
          aria-label={isEn ? "More publish options" : "Diğer yayın seçenekleri"}
          aria-expanded={submitMenuOpen}
          className="rounded-r-xl border-l border-white/25 bg-blue-600 px-3 hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
        >
          <svg
            className="h-3.5 w-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {submitMenuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1.5 w-72 space-y-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <button
              type="button"
              disabled={!scheduledAt || submitting}
              onClick={() => {
                setSubmitMenuOpen(false);
                submit("DRAFT");
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
            >
              {isEn ? "Save as Draft" : "Taslak Olarak Kaydet"}
            </button>
            <button
              type="button"
              disabled={!scheduledAt || submitting}
              onClick={() => {
                setSubmitMenuOpen(false);
                if (
                  !confirm(
                    isEn
                      ? "This post will be published to your real accounts in about 1 minute without going through review. Are you sure?"
                      : "Bu gönderi incelemeden geçmeden, yaklaşık 1 dakika içinde gerçek hesaplarınızda yayınlanacak. Emin misiniz?"
                  )
                )
                  return;
                submit("APPROVED", new Date().toISOString());
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-amber-800 hover:bg-amber-50 transition disabled:opacity-50 cursor-pointer"
            >
              {isEn ? "⚡ Publish Now (Skip Review)" : "⚡ Şimdi Yayınla (İncelemeyi Atla)"}
              <span className="mt-0.5 block text-[10px] font-normal text-slate-400">
                {isEn
                  ? "Ignores the scheduled date — live in ~1 minute."
                  : "Seçili tarihi yok sayar — ~1 dakikada yayında."}
              </span>
            </button>
          </div>
        )}
      </div>

      {submitError && (
        <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
          {submitError}
        </p>
      )}
    </div>
  );
}
