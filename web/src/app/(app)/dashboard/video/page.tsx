"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { useMediaLibrary, type MediaLibraryItem } from "@/lib/media/useMediaLibrary";
import { useVideoRenderJob } from "@/lib/video/useVideoRenderJob";
import { createPreviewInputProps } from "@/lib/video/previewPlan";
import { VIDEO_RECIPES, type VideoRecipeId } from "@/lib/video/scenePlan";
import { OPENAI_TTS_VOICES, MAX_VOICEOVER_SCRIPT_LENGTH, type VideoDuration, type VideoFormat, type VideoMusicTrack, type OpenAIVoice } from "@/lib/video/types";
import type { TraitScores } from "@/lib/brand/traits";
import { VideoPlanPreview } from "@/components/dashboard/video/VideoPlanPreview";
import { VideoTrimEditor } from "@/components/dashboard/video/VideoTrimEditor";
import { StoryboardEditor } from "@/components/dashboard/video/StoryboardEditor";
import MediaLibraryModal from "@/components/dashboard/MediaLibraryModal";
import type { ScenePlanItem } from "@/lib/video/types";
import type { Caption } from "@remotion/captions";

type ExistingContent = { id: string; title: string };

const DURATIONS: VideoDuration[] = [10, 15, 20];

function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);
  const { t, isEn } = useLanguage();
  const v = t.dashboard.video;

  const [format, setFormat] = useState<VideoFormat>("vertical");
  const [durationSeconds, setDurationSeconds] = useState<VideoDuration>(15);
  const [sourceType, setSourceType] = useState<"existing_content" | "custom_topic" | "product_url" | "user_upload">("custom_topic");

  const [existingContent, setExistingContent] = useState<ExistingContent[] | null>(null);
  const [sourceContentId, setSourceContentId] = useState<string>("");

  const [topic, setTopic] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [recipeId, setRecipeId] = useState<VideoRecipeId | "auto">("auto");
  const [videoBackgroundUrl, setVideoBackgroundUrl] = useState("");
  const [musicTrack, setMusicTrack] = useState<VideoMusicTrack>("lofi");
  const media = useMediaLibrary(brand.id, sourceType === "custom_topic");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const [showClipPicker, setShowClipPicker] = useState(false);
  const [sourceMediaItem, setSourceMediaItem] = useState<MediaLibraryItem | null>(null);
  const [clipDuration, setClipDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [alsoGenerateOtherFormat, setAlsoGenerateOtherFormat] = useState(false);
  const [extraFormatNote, setExtraFormatNote] = useState<"queued" | "error" | null>(null);

  const [voiceoverEnabled, setVoiceoverEnabled] = useState(false);
  const [voiceoverScript, setVoiceoverScript] = useState("");
  const [voiceoverVoice, setVoiceoverVoice] = useState<OpenAIVoice>("alloy");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const job = useVideoRenderJob(jobId);

  // Same brand_dna fields getBrandContext() feeds the final render with
  // (buildVideoInputProps.ts) — fetched client-side here so the preview
  // (both the pre-creation VideoPlanPreview and the post-creation
  // StoryboardEditor) matches the render instead of always showing the
  // hardcoded fallback red/neutral design.
  const [brandDesign, setBrandDesign] = useState<{ colorPalette: string[]; visualStyle: string | null; traitScores: TraitScores | null }>({
    colorPalette: [],
    visualStyle: null,
    traitScores: null,
  });

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { data } = await supabase
        .from("brand_dna")
        .select("color_palette, visual_style, trait_scores")
        .eq("brand_id", brand.id)
        .maybeSingle();
      if (ignore) return;
      setBrandDesign({
        colorPalette: Array.isArray(data?.color_palette) ? data.color_palette.map(String) : [],
        visualStyle: (data?.visual_style as string | null) ?? null,
        traitScores: (data?.trait_scores as TraitScores | null) ?? null,
      });
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

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

  function buildJobBody(targetFormat: VideoFormat) {
    return {
      format: targetFormat,
      durationSeconds,
      sourceType,
      sourceContentId: sourceType === "existing_content" ? sourceContentId : undefined,
      topic: sourceType === "custom_topic" ? topic : undefined,
      productUrl: sourceType === "product_url" ? productUrl : undefined,
      selectedMediaIds: sourceType === "custom_topic" ? selectedMediaIds : undefined,
      sourceMediaId: sourceType === "user_upload" ? sourceMediaItem?.id : undefined,
      trimStartSeconds: sourceType === "user_upload" ? trimStart : undefined,
      trimEndSeconds: sourceType === "user_upload" ? trimEnd : undefined,
      voiceoverScript: voiceoverEnabled && sourceType !== "user_upload" ? voiceoverScript.trim() : undefined,
      voiceoverVoice: voiceoverEnabled && sourceType !== "user_upload" ? voiceoverVoice : undefined,
      recipeId,
      videoBackgroundUrl,
      musicTrack,
    };
  }

  async function handleSubmit() {
    setSubmitError(null);
    setExtraFormatNote(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/video/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildJobBody(format)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? v.errorGeneric);
      setJobId(data.jobId as string);

      // Second format is fired-and-forgotten rather than tracked live —
      // avoids doubling every status/result panel below for a feature
      // that's only offered on the user_upload path. Its output still lands
      // in the media library via renderVideoJob.ts same as any other job,
      // just without a progress bar on this screen.
      if (sourceType === "user_upload" && alsoGenerateOtherFormat) {
        const otherFormat: VideoFormat = format === "vertical" ? "horizontal" : "vertical";
        setExtraFormatNote("queued");
        fetch("/api/video/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildJobBody(otherFormat)),
        })
          .then((extraRes) => {
            if (!extraRes.ok) setExtraFormatNote("error");
          })
          .catch(() => setExtraFormatNote("error"));
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : v.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setJobId(null);
    setSubmitError(null);
    setExtraFormatNote(null);
  }

  const voiceoverValid =
    !voiceoverEnabled ||
    sourceType === "user_upload" ||
    (voiceoverScript.trim().length > 0 && voiceoverScript.trim().length <= MAX_VOICEOVER_SCRIPT_LENGTH);

  const canSubmit =
    !submitting &&
    voiceoverValid &&
    (sourceType === "existing_content"
      ? Boolean(sourceContentId)
      : sourceType === "product_url"
      ? productUrl.trim().length > 0
      : sourceType === "user_upload"
      ? Boolean(sourceMediaItem)
      : topic.trim().length > 0);

  const previewTopic = sourceType === "product_url"
    ? productUrl.trim() || (isEn ? "Featured product" : "Öne çıkan ürün")
    : sourceType === "existing_content"
      ? existingContent?.find((content) => content.id === sourceContentId)?.title || (isEn ? "Existing content" : "Mevcut içerik")
      : sourceType === "user_upload"
        ? sourceMediaItem?.file_name || (isEn ? "Your uploaded clip" : "Yüklediğiniz klip")
        : topic.trim() || (isEn ? "Your next campaign" : "Yeni kampanyanız");
  const previewImages = media.items
    .filter((item) => selectedMediaIds.includes(item.id) && item.file_type.startsWith("image/"))
    .map((item) => item.file_url);
  const previewInputProps = createPreviewInputProps({
    format,
    durationSeconds,
    sourceType,
    requestedRecipe: recipeId,
    topic: previewTopic,
    imageUrls: previewImages,
    brandName: brand.name,
    accentColors: brandDesign.colorPalette,
    visualStyle: brandDesign.visualStyle,
    traitScores: brandDesign.traitScores,
    videoBackgroundUrl: videoBackgroundUrl || undefined,
    userClipUrl: sourceType === "user_upload" ? sourceMediaItem?.file_url : undefined,
    musicTrack,
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{v.title}</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">{v.subtitle}</p>
      </div>

      {job && (job.status === "pending" || job.status === "queued" || job.status === "rendering") && (
        <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            {job.status === "pending" ? v.statusPending : v.statusRendering}
          </p>
        </div>
      )}

      {job && job.status === "draft" && (() => {
        const plan = job.scenePlan && typeof job.scenePlan === "object" ? (job.scenePlan as Record<string, unknown>) : {};
        const scenes = Array.isArray(plan.scenes) ? (plan.scenes as ScenePlanItem[]) : [];
        if (scenes.length === 0) {
          return (
            <div className="rounded-[22px] border border-red-100 bg-red-50 p-6 text-center">
              <p className="text-sm font-bold text-red-700">{v.statusFailed}</p>
            </div>
          );
        }
        return (
          <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <StoryboardEditor
              jobId={jobId as string}
              brandId={brand.id}
              brandName={brand.name}
              format={format}
              initialScenes={scenes}
              voiceoverAudio={typeof plan.voiceoverAudio === "string" ? plan.voiceoverAudio : null}
              captions={Array.isArray(plan.captions) ? (plan.captions as Caption[]) : null}
              recipeId={typeof plan.recipeId === "string" ? plan.recipeId : undefined}
              videoBackgroundUrl={videoBackgroundUrl || undefined}
              musicTrack={musicTrack}
              accentColors={brandDesign.colorPalette}
              visualStyle={brandDesign.visualStyle}
              traitScores={brandDesign.traitScores}
              isEn={isEn}
              onRenderStarted={() => {
                /* useVideoRenderJob's own polling picks up the draft->rendering transition */
              }}
            />
          </div>
        );
      })()}

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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isEn ? "Video recipe" : "Video tarifi"}
            </span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRecipeId("auto")}
                className={`rounded-xl border p-3 text-left transition ${recipeId === "auto" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:border-slate-300"}`}
              >
                <span className="block text-xs font-bold">{isEn ? "Automatic" : "Otomatik"}</span>
                <span className={`mt-1 block text-[11px] ${recipeId === "auto" ? "text-slate-300" : "text-slate-500"}`}>
                  {isEn ? "Chooses from the content source." : "İçerik kaynağına göre seçilir."}
                </span>
              </button>
              {(Object.entries(VIDEO_RECIPES) as Array<[VideoRecipeId, (typeof VIDEO_RECIPES)[VideoRecipeId]]>).map(([id, recipe]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRecipeId(id)}
                  className={`rounded-xl border p-3 text-left transition ${recipeId === id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <span className="block text-xs font-bold">{recipe.label}</span>
                  <span className={`mt-1 block text-[11px] ${recipeId === id ? "text-slate-300" : "text-slate-500"}`}>{recipe.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isEn ? "Video background" : "Video arka planı"}
              <select
                value={videoBackgroundUrl}
                onChange={(event) => setVideoBackgroundUrl(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-800"
              >
                <option value="">{isEn ? "Dynamic brand background" : "Dinamik marka arka planı"}</option>
                <option value="video/background.mp4">{isEn ? "Cinematic" : "Sinematik"}</option>
                <option value="video/video.mp4">{isEn ? "Product motion" : "Ürün hareketi"}</option>
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isEn ? "Music" : "Müzik"}
              <select
                value={musicTrack}
                onChange={(event) => setMusicTrack(event.target.value as VideoMusicTrack)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-800"
              >
                <option value="lofi">Lo-fi Beat</option>
                <option value="none">{isEn ? "No music" : "Müzik yok"}</option>
              </select>
            </label>
          </div>

          {sourceType !== "user_upload" && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <input
                  type="checkbox"
                  checked={voiceoverEnabled}
                  onChange={(e) => setVoiceoverEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                />
                {v.voiceoverSectionLabel}
              </label>
              {voiceoverEnabled && (
                <>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.voiceoverScriptLabel}</label>
                      <span className="text-[11px] font-medium text-slate-400">
                        {voiceoverScript.length}/{MAX_VOICEOVER_SCRIPT_LENGTH}
                      </span>
                    </div>
                    <textarea
                      value={voiceoverScript}
                      onChange={(e) => setVoiceoverScript(e.target.value)}
                      placeholder={v.voiceoverScriptPlaceholder}
                      rows={4}
                      maxLength={MAX_VOICEOVER_SCRIPT_LENGTH}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">{v.voiceoverScriptHint}</p>
                  </div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {v.voiceoverVoiceLabel}
                    <select
                      value={voiceoverVoice}
                      onChange={(e) => setVoiceoverVoice(e.target.value as OpenAIVoice)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-800"
                    >
                      {OPENAI_TTS_VOICES.map((voice) => (
                        <option key={voice} value={voice}>
                          {voice}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
            </div>
          )}

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
              {(["custom_topic", "existing_content", "product_url", "user_upload"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSourceType(s)}
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    sourceType === s ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s === "custom_topic"
                    ? v.sourceCustom
                    : s === "existing_content"
                    ? v.sourceExisting
                    : s === "product_url"
                    ? v.sourceProductUrl
                    : v.sourceUserUpload}
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
          ) : sourceType === "product_url" ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.productUrlLabel}</label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder={v.productUrlPlaceholder}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800"
              />
              <p className="mt-1.5 text-xs text-slate-400">{v.productUrlHint}</p>
            </div>
          ) : sourceType === "user_upload" ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{v.userUploadLabel}</label>
                {!sourceMediaItem ? (
                  <button
                    type="button"
                    onClick={() => setShowClipPicker(true)}
                    className="mt-2 w-full rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-xs font-bold text-slate-600 hover:border-rose-400 hover:text-rose-600 transition cursor-pointer"
                  >
                    {v.userUploadPickButton}
                  </button>
                ) : (
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                    <video
                      src={sourceMediaItem.file_url}
                      poster={sourceMediaItem.poster_url ?? undefined}
                      muted
                      className="h-14 w-14 rounded-xl object-cover border border-slate-200 bg-black shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{sourceMediaItem.file_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {formatSeconds(clipDuration)} {isEn ? "total" : "toplam"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowClipPicker(true)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                    >
                      {v.userUploadChangeButton}
                    </button>
                  </div>
                )}
              </div>

              {sourceMediaItem && clipDuration > 0 && (
                <VideoTrimEditor
                  fileUrl={sourceMediaItem.file_url}
                  posterUrl={sourceMediaItem.poster_url}
                  durationSeconds={clipDuration}
                  trimStart={trimStart}
                  trimEnd={trimEnd}
                  onChange={(start, end) => {
                    setTrimStart(start);
                    setTrimEnd(end);
                  }}
                  onDurationDetected={(seconds) => {
                    setClipDuration(seconds);
                    setTrimEnd(seconds);
                  }}
                  isEn={isEn}
                />
              )}

              {sourceMediaItem && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={alsoGenerateOtherFormat}
                    onChange={(e) => setAlsoGenerateOtherFormat(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                  />
                  {v.alsoGenerateOtherFormat.replace(
                    "{format}",
                    format === "vertical" ? v.formatHorizontal : v.formatVertical
                  )}
                </label>
              )}

              {extraFormatNote && (
                <p className={`text-xs font-semibold ${extraFormatNote === "error" ? "text-red-600" : "text-emerald-600"}`}>
                  {extraFormatNote === "error" ? v.extraFormatError : v.extraFormatQueued}
                </p>
              )}

              <p className="text-[11px] text-slate-400">{v.voiceoverUserUploadHint}</p>
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

          <VideoPlanPreview inputProps={previewInputProps} />

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

      {showClipPicker && (
        <MediaLibraryModal
          brandId={brand.id}
          defaultFilter="video"
          onSelect={(item) => {
            setSourceMediaItem(item);
            setClipDuration(item.duration_seconds ?? 0);
            setTrimStart(0);
            setTrimEnd(item.duration_seconds ?? 0);
            setShowClipPicker(false);
          }}
          onClose={() => setShowClipPicker(false)}
        />
      )}
    </div>
  );
}
