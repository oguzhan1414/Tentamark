"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import { useVideoRenderJob } from "@/lib/video/useVideoRenderJob";
import { StoryboardEditor } from "@/components/dashboard/video/StoryboardEditor";
import { PLATFORM_LABEL } from "@/lib/ai/platforms";
import type { ScenePlanItem, VideoFormat } from "@/lib/video/types";
import type { TraitScores } from "@/lib/brand/traits";
import type { Caption } from "@remotion/captions";

type ContentPlatformRow = { id: string; platform: string; caption: string; status: string; scheduled_at: string | null };
type ContentRow = {
  id: string;
  format: string;
  status: string;
  content_media: { position: number; media: { file_url: string } | null }[];
  content_platforms: ContentPlatformRow[];
};
type PackageRow = { id: string; title: string; core_idea: string; status: string };
type VideoJobRow = { id: string; format: VideoFormat };

function OutputCard({ title, content, isEn }: { title: string; content: ContentRow | undefined; isEn: boolean }) {
  const images = (content?.content_media ?? []).slice().sort((a, b) => a.position - b.position);
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
      {images.length === 0 ? (
        <div className="mt-2 flex h-40 items-center justify-center rounded-xl bg-slate-50 text-xs text-slate-400">
          {isEn ? "Not ready yet" : "Henüz hazır değil"}
        </div>
      ) : (
        <div className={`mt-2 ${images.length > 1 ? "flex gap-2 overflow-x-auto pb-1" : ""}`}>
          {images.map((img, i) =>
            img.media ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img.media.file_url}
                alt=""
                className={`rounded-xl bg-slate-100 object-cover ${images.length > 1 ? "h-40 w-40 shrink-0" : "w-full max-h-80"}`}
              />
            ) : null
          )}
        </div>
      )}
      {content && content.content_platforms.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {content.content_platforms.map((cp) => (
            <span key={cp.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {PLATFORM_LABEL[cp.platform as keyof typeof PLATFORM_LABEL] ?? cp.platform}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PackageDetailPage() {
  const { id: packageId } = useParams<{ id: string }>();
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);
  const { isEn } = useLanguage();

  const [pkg, setPkg] = useState<PackageRow | null>(null);
  const [contentRows, setContentRows] = useState<ContentRow[]>([]);
  const [videoJob, setVideoJob] = useState<VideoJobRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduledAt, setScheduledAt] = useState("");
  const [approving, setApproving] = useState(false);
  const [approveResult, setApproveResult] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [brandDesign, setBrandDesign] = useState<{ colorPalette: string[]; visualStyle: string | null; traitScores: TraitScores | null }>({
    colorPalette: [],
    visualStyle: null,
    traitScores: null,
  });

  // Plain fetch, no setState inside — both the mount effect and
  // handleApprove's post-approve refresh call this, each doing its own
  // setState afterward. Keeping setState out of this function (and out of
  // the effect's inline IIFE below) is what a shared "load" helper needs to
  // satisfy react-hooks' set-state-in-effect rule.
  const fetchPackageData = useCallback(async () => {
    const [{ data: pkgRow }, { data: rows }, { data: job }] = await Promise.all([
      supabase.from("content_packages").select("id, title, core_idea, status").eq("id", packageId).maybeSingle(),
      supabase
        .from("content")
        .select("id, format, status, content_media(position, media(file_url)), content_platforms(id, platform, caption, status, scheduled_at)")
        .eq("package_id", packageId),
      supabase.from("video_render_jobs").select("id, format").eq("package_id", packageId).maybeSingle(),
    ]);
    return { pkgRow, rows, job };
  }, [supabase, packageId]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const { pkgRow, rows, job } = await fetchPackageData();
      if (ignore) return;
      setPkg(pkgRow as PackageRow | null);
      setContentRows((rows ?? []) as unknown as ContentRow[]);
      setVideoJob(job as VideoJobRow | null);
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [fetchPackageData]);

  // Same brand_dna fields the final render pulls (buildVideoInputProps.ts),
  // so the storyboard preview here matches — see dashboard/video/page.tsx
  // for the same pattern on the other StoryboardEditor call site.
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

  const job = useVideoRenderJob(videoJob?.id ?? null);

  const feedContent = contentRows.find((c) => c.format === "post" && c.content_media.length === 1);
  const storyContent = contentRows.find((c) => c.format === "story");
  const carouselContent = contentRows.find((c) => c.format === "post" && c.content_media.length > 1);
  const videoContent = contentRows.find((c) => c.format === "reel");

  async function handleApprove() {
    setApproving(true);
    setApproveError(null);
    setApproveResult(null);
    try {
      const res = await fetch(`/api/packages/${packageId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? (isEn ? "Approval failed." : "Onay başarısız."));
      setApproveResult(
        isEn ? `${data.approvedCount} output(s) approved.` : `${data.approvedCount} çıktı onaylandı.`
      );
      const { pkgRow, rows, job: jobRow } = await fetchPackageData();
      setPkg(pkgRow as PackageRow | null);
      setContentRows((rows ?? []) as unknown as ContentRow[]);
      setVideoJob(jobRow as VideoJobRow | null);
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : isEn ? "Approval failed." : "Onay başarısız.");
    } finally {
      setApproving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-400">{isEn ? "Loading…" : "Yükleniyor…"}</div>;
  }
  if (!pkg) {
    return <div className="p-8 text-center text-sm text-red-500">{isEn ? "Package not found." : "Paket bulunamadı."}</div>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{pkg.title}</h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">{pkg.core_idea}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <OutputCard title={isEn ? "Feed" : "Feed"} content={feedContent} isEn={isEn} />
        <OutputCard title={isEn ? "Story" : "Story"} content={storyContent} isEn={isEn} />
        <OutputCard title={isEn ? "Carousel" : "Carousel"} content={carouselContent} isEn={isEn} />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{isEn ? "Video" : "Video"}</p>
        {!job || job.status === "pending" ? (
          <div className="flex h-40 items-center justify-center gap-3 rounded-xl bg-slate-50 text-xs text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            {isEn ? "Preparing draft…" : "Taslak hazırlanıyor…"}
          </div>
        ) : job.status === "draft" ? (
          (() => {
            const draftPlan = job.scenePlan && typeof job.scenePlan === "object" ? (job.scenePlan as Record<string, unknown>) : {};
            const scenes = Array.isArray(draftPlan.scenes) ? (draftPlan.scenes as ScenePlanItem[]) : [];
            if (scenes.length === 0) return null;
            const settings = draftPlan.settings && typeof draftPlan.settings === "object" ? (draftPlan.settings as Record<string, unknown>) : {};
            return (
              <StoryboardEditor
                jobId={videoJob!.id}
                brandId={brand.id}
                brandName={brand.name}
                format={videoJob!.format}
                initialScenes={scenes}
                voiceoverAudio={typeof draftPlan.voiceoverAudio === "string" ? draftPlan.voiceoverAudio : null}
                captions={Array.isArray(draftPlan.captions) ? (draftPlan.captions as Caption[]) : null}
                recipeId={typeof draftPlan.recipeId === "string" ? draftPlan.recipeId : undefined}
                videoBackgroundUrl={typeof settings.videoBackgroundUrl === "string" ? settings.videoBackgroundUrl : undefined}
                musicTrack={settings.musicTrack === "none" ? "none" : "lofi"}
                accentColors={brandDesign.colorPalette}
                visualStyle={brandDesign.visualStyle}
                traitScores={brandDesign.traitScores}
                isEn={isEn}
                onRenderStarted={() => {}}
              />
            );
          })()
        ) : job.status === "queued" || job.status === "rendering" ? (
          <div className="flex h-40 items-center justify-center gap-3 rounded-xl bg-slate-50 text-xs text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
            {isEn ? "Rendering…" : "Render ediliyor…"}
          </div>
        ) : job.status === "completed" && job.outputUrl ? (
          <video src={job.outputUrl} controls className="mx-auto max-h-[420px] rounded-xl bg-black" />
        ) : (
          <p className="text-xs font-semibold text-red-600">{job.error ?? (isEn ? "Video failed." : "Video başarısız oldu.")}</p>
        )}
        {videoContent && videoContent.content_platforms.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {videoContent.content_platforms.map((cp) => (
              <span key={cp.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {PLATFORM_LABEL[cp.platform as keyof typeof PLATFORM_LABEL] ?? cp.platform}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {isEn ? "Approve & Schedule" : "Onayla ve Zamana Ekle"}
        </p>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800"
        />
        {approveError && <p className="text-xs font-semibold text-red-600">{approveError}</p>}
        {approveResult && <p className="text-xs font-semibold text-emerald-600">{approveResult}</p>}
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          {approving ? (isEn ? "Approving…" : "Onaylanıyor…") : isEn ? "Approve & Schedule" : "Onayla ve Zamana Ekle"}
        </button>
      </div>
    </div>
  );
}
