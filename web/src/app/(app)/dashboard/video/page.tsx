"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { useMediaLibrary } from "@/lib/media/useMediaLibrary";
import { useVideoRenderJob } from "@/lib/video/useVideoRenderJob";
import type { VideoDuration, VideoFormat } from "@/lib/video/types";

type ExistingContent = { id: string; title: string };

const DURATIONS: VideoDuration[] = [10, 15, 20];

export default function VideoPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);
  const { t } = useLanguage();
  const v = t.dashboard.video;

  const [format, setFormat] = useState<VideoFormat>("vertical");
  const [durationSeconds, setDurationSeconds] = useState<VideoDuration>(15);
  const [sourceType, setSourceType] = useState<"existing_content" | "custom_topic">("custom_topic");

  const [existingContent, setExistingContent] = useState<ExistingContent[] | null>(null);
  const [sourceContentId, setSourceContentId] = useState<string>("");

  const [topic, setTopic] = useState("");
  const media = useMediaLibrary(brand.id, sourceType === "custom_topic");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const job = useVideoRenderJob(jobId);

  useEffect(() => {
    if (sourceType !== "existing_content" || existingContent !== null) return;
    let ignore = false;
    (async () => {
      const { data } = await supabase
        .from("content")
        .select("id, title")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: false })
        .limit(30);
      if (!ignore) setExistingContent((data ?? []) as ExistingContent[]);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, sourceType, existingContent]);

  function toggleMedia(id: string) {
    setSelectedMediaIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/video/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          durationSeconds,
          sourceType,
          sourceContentId: sourceType === "existing_content" ? sourceContentId : undefined,
          topic: sourceType === "custom_topic" ? topic : undefined,
          selectedMediaIds: sourceType === "custom_topic" ? selectedMediaIds : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? v.errorGeneric);
      setJobId(data.jobId as string);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : v.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setJobId(null);
    setSubmitError(null);
  }

  const canSubmit =
    !submitting && (sourceType === "existing_content" ? Boolean(sourceContentId) : topic.trim().length > 0);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{v.title}</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">{v.subtitle}</p>
      </div>

      {job && (job.status === "pending" || job.status === "rendering") && (
        <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            {job.status === "pending" ? v.statusPending : v.statusRendering}
          </p>
        </div>
      )}

      {job && job.status === "failed" && (
        <div className="rounded-[22px] border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm font-bold text-red-700">{v.statusFailed}</p>
          {job.error && <p className="mt-1 text-xs text-red-600">{job.error}</p>}
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
          >
            {v.createAnotherButton}
          </button>
        </div>
      )}

      {job && job.status === "completed" && job.outputUrl && (
        <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <p className="text-sm font-bold text-slate-900">{v.statusCompleted}</p>
          <video
            src={job.outputUrl}
            controls
            className={`mt-4 mx-auto rounded-2xl bg-black ${format === "vertical" ? "max-h-[70vh]" : "w-full"}`}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={job.outputUrl}
              download
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
            >
              {v.downloadButton}
            </a>
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              {v.createAnotherButton}
            </button>
          </div>
        </div>
      )}

      {!jobId && (
        <div className="space-y-5 rounded-[22px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.formatLabel}</span>
            <div className="mt-2 flex gap-2">
              {(["vertical", "horizontal"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    format === f ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f === "vertical" ? v.formatVertical : v.formatHorizontal}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.durationLabel}</span>
            <div className="mt-2 flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationSeconds(d)}
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    durationSeconds === d ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {v.durationSeconds.replace("{seconds}", String(d))}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.sourceLabel}</span>
            <div className="mt-2 flex gap-2">
              {(["custom_topic", "existing_content"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSourceType(s)}
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    sourceType === s ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s === "custom_topic" ? v.sourceCustom : v.sourceExisting}
                </button>
              ))}
            </div>
          </div>

          {sourceType === "existing_content" ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.existingContentLabel}</label>
              {existingContent && existingContent.length === 0 ? (
                <p className="mt-2 text-sm text-slate-400">{v.existingContentEmpty}</p>
              ) : (
                <select
                  value={sourceContentId}
                  onChange={(e) => setSourceContentId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800"
                >
                  <option value="" disabled>
                    {v.existingContentLabel}
                  </option>
                  {(existingContent ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.topicLabel}</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={v.topicPlaceholder}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.mediaPickerLabel}</label>
                {media.items.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">{v.mediaPickerEmpty}</p>
                ) : (
                  <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {media.items
                      .filter((m) => m.file_type.startsWith("image/"))
                      .map((m) => {
                        const selected = selectedMediaIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleMedia(m.id)}
                            className={`relative aspect-square overflow-hidden rounded-lg cursor-pointer ring-2 ring-offset-2 transition ${
                              selected ? "ring-slate-900" : "ring-transparent hover:ring-slate-300"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={m.file_url}
                              alt={m.alt_text ?? m.file_name}
                              className={`h-full w-full object-cover transition ${selected ? "" : "opacity-90"}`}
                            />
                            {selected && (
                              <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
                                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.704 5.29a1 1 0 010 1.415l-7.5 7.5a1 1 0 01-1.415 0l-3.5-3.5a1 1 0 111.415-1.415L8.5 12.086l6.79-6.796a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                            {selected && <span className="absolute inset-0 bg-slate-900/10" />}
                          </button>
                        );
                      })}
                  </div>
                )}
                {selectedMediaIds.length > 0 && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {selectedMediaIds.length} {v.mediaPickerLabel.toLowerCase()}
                  </p>
                )}
              </div>
            </>
          )}

          {submitError && <p className="text-xs font-semibold text-red-600">{submitError}</p>}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            {submitting ? v.submitting : v.submitButton}
          </button>
        </div>
      )}
    </div>
  );
}
