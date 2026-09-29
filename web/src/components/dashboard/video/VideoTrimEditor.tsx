"use client";

import { useEffect, useState } from "react";
import { detectSilence, type SilentWindow } from "@/lib/media/silenceDetection";

type Props = {
  fileUrl: string;
  posterUrl?: string | null;
  durationSeconds: number;
  trimStart: number;
  trimEnd: number;
  onChange: (trimStart: number, trimEnd: number) => void;
  onDurationDetected?: (seconds: number) => void;
  isEn: boolean;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Trim scrubber for a user-uploaded clip: two range inputs bound to
// trimStart/trimEnd, plus a best-effort, client-only "quiet region" overlay
// (see silenceDetection.ts) — purely advisory, never blocks anything if
// detection fails or isn't supported.
export function VideoTrimEditor({
  fileUrl,
  posterUrl,
  durationSeconds,
  trimStart,
  trimEnd,
  onChange,
  onDurationDetected,
  isEn,
}: Props) {
  // null = not checked yet (or this fileUrl's check hasn't resolved), []  =
  // checked and found nothing quiet — no separate "checked" flag needed.
  const [silentWindows, setSilentWindows] = useState<SilentWindow[] | null>(null);

  useEffect(() => {
    if (!fileUrl) return;
    let cancelled = false;
    detectSilence(fileUrl).then((windows) => {
      if (!cancelled) setSilentWindows(windows);
    });
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  const safeDuration = durationSeconds > 0 ? durationSeconds : 1;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {isEn ? "Trim clip" : "Klibi kırp"}
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          {formatTime(trimStart)} – {formatTime(trimEnd)} ({isEn ? "of" : "/"} {formatTime(durationSeconds)})
        </span>
      </div>

      <video
        key={fileUrl}
        src={fileUrl}
        poster={posterUrl ?? undefined}
        controls
        onLoadedMetadata={(e) => {
          // Fallback for the rare case the upload-time probe failed (see
          // videoUploadMeta.ts) and duration_seconds landed null in the DB —
          // the <video> element itself always knows its own duration once
          // loaded.
          if (!durationSeconds && Number.isFinite(e.currentTarget.duration)) {
            onDurationDetected?.(e.currentTarget.duration);
          }
        }}
        className="w-full rounded-xl bg-black max-h-64"
      />

      {/* Timeline with quiet-region shading — purely visual, advisory only */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 bg-slate-900/15"
          style={{
            left: `${(trimStart / safeDuration) * 100}%`,
            width: `${((trimEnd - trimStart) / safeDuration) * 100}%`,
          }}
        />
        {(silentWindows ?? []).map((w, i) => (
          <div
            key={i}
            title={isEn ? "Likely quiet" : "Muhtemelen sessiz"}
            className="absolute inset-y-0 bg-amber-400/70"
            style={{
              left: `${(w.startSeconds / safeDuration) * 100}%`,
              width: `${Math.max(((w.endSeconds - w.startSeconds) / safeDuration) * 100, 0.5)}%`,
            }}
          />
        ))}
      </div>
      {silentWindows && silentWindows.length > 0 && (
        <p className="text-[11px] text-amber-700">
          {isEn
            ? "Amber marks show likely quiet stretches — just a hint, trim wherever you like."
            : "Amber işaretler muhtemel sessiz bölgeleri gösterir — sadece bir ipucu, kırpma noktalarını istediğin gibi seçebilirsin."}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-[11px] font-semibold text-slate-500">
          {isEn ? "Start" : "Başlangıç"}
          <input
            type="range"
            min={0}
            max={durationSeconds}
            step={0.1}
            value={trimStart}
            onChange={(e) => {
              const next = Math.min(Number(e.target.value), trimEnd - 0.5);
              onChange(Math.max(0, next), trimEnd);
            }}
            className="mt-1.5 w-full cursor-pointer"
          />
        </label>
        <label className="text-[11px] font-semibold text-slate-500">
          {isEn ? "End" : "Bitiş"}
          <input
            type="range"
            min={0}
            max={durationSeconds}
            step={0.1}
            value={trimEnd}
            onChange={(e) => {
              const next = Math.max(Number(e.target.value), trimStart + 0.5);
              onChange(trimStart, Math.min(durationSeconds, next));
            }}
            className="mt-1.5 w-full cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
