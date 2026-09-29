import { readFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { assembleVideoInputProps } from "./buildVideoInputProps";
import { resolveRenderProvider } from "./renderProvider";
import { estimateRenderCostUsd, retryBackoffSeconds } from "./renderMetrics";
import { generateDrafts } from "@/lib/ai/generateDrafts";
import type { LaunchPlatform } from "@/lib/ai/platforms";

type AdminClient = ReturnType<typeof createAdminClient>;

// Faz 7 (çoklu format paketi): if this job was created as part of a
// content package, its output has nowhere to go until this closes the
// loop — createContentPackage.ts left a media-less `content` row
// (format:'reel', status:'GENERATING') waiting for exactly this. Reuses
// whichever platforms the package's sibling outputs (feed/story/carousel)
// already targeted, rather than asking the user to pick again. Best-effort:
// a failure here never undoes the completed render, it just leaves the
// package's video slot unattached (logged) for manual follow-up.
async function attachToPackage(admin: AdminClient, packageId: string, brandId: string, mediaId: string): Promise<void> {
  const { data: packageContentRows } = await admin.from("content").select("id, format, core_idea").eq("package_id", packageId);
  const videoContent = packageContentRows?.find((c) => c.format === "reel");
  if (!videoContent) return;

  const siblingIds = (packageContentRows ?? []).filter((c) => c.format !== "reel").map((c) => c.id);

  await admin.from("content_media").insert({ content_id: videoContent.id, media_id: mediaId, position: 0 });

  if (siblingIds.length > 0) {
    const { data: siblingPlatformRows } = await admin.from("content_platforms").select("platform").in("content_id", siblingIds);
    const platforms = Array.from(new Set((siblingPlatformRows ?? []).map((r) => r.platform as LaunchPlatform)));
    if (platforms.length > 0) {
      // mediaUrl (5th param) intentionally omitted — generateDrafts only
      // handles an image there (routes straight into callGroqVision with no
      // video-vs-image check of its own); passing the rendered .mp4 would
      // send a video URL into an image-only vision call.
      const drafts = await generateDrafts(brandId, videoContent.core_idea, platforms, "reel", undefined, "brand", admin);
      await admin.from("content_platforms").insert(
        platforms.map((platform) => ({
          content_id: videoContent.id,
          platform,
          caption: drafts[platform] ?? videoContent.core_idea.slice(0, 200),
          status: "PENDING",
        }))
      );
    }
  }

  await admin.from("content").update({ status: "NEEDS_REVIEW" }).eq("id", videoContent.id);
}

/*
  Render-only now (Faz 6) — every AI/network-costly step already ran once in
  prepareVideoDraft.ts, landing a possibly user-edited scene_plan in 'draft'.
  This just assembles that already-final plan into Remotion's input shape
  (assembleVideoInputProps — no AI calls) and renders it (today: locally via
  localRenderer — see renderExecutor.ts for the swap-to-Lambda seam), uploads
  the result into the brand's existing `media` table/bucket (already
  supports video/mp4, see patch 0018), and records the outcome. Called
  fire-and-forget from POST /api/video/jobs/[id]/render via next/server's
  after() — this function owns the draft->rendering->completed/failed leg.
*/
export type RenderJobOutcome = "completed" | "retried" | "failed";

export async function renderVideoJob(
  jobId: string,
  queue: { attemptNumber: number; maxAttempts: number; startedAt: Date }
): Promise<RenderJobOutcome> {
  const admin = createAdminClient();

  const { data: job, error: jobError } = await admin
    .from("video_render_jobs")
    .select("id, brand_id, created_by, package_id")
    .eq("id", jobId)
    .single();
  if (jobError || !job) {
    console.error("renderVideoJob: job not found", jobId, jobError?.message);
    return "failed";
  }

  let tempFilePath: string | null = null;
  try {
    const inputProps = await assembleVideoInputProps(jobId, admin);
    const provider = resolveRenderProvider();
    const rendered = await provider.executor(inputProps);
    tempFilePath = rendered.filePath;

    const fileBuffer = await readFile(rendered.filePath);
    const storagePath = `${job.brand_id}/${randomUUID()}-tentamark-video.mp4`;
    const { error: uploadError } = await admin.storage.from("media").upload(storagePath, fileBuffer, {
      contentType: "video/mp4",
      upsert: false,
    });
    if (uploadError) throw new Error(`Depolamaya yükleme başarısız: ${uploadError.message}`);

    const { data: publicUrl } = admin.storage.from("media").getPublicUrl(storagePath);

    const { data: mediaRow, error: mediaError } = await admin
      .from("media")
      .insert({
        brand_id: job.brand_id,
        file_name: "tentamark-video.mp4",
        file_url: publicUrl.publicUrl,
        file_type: "video/mp4",
        file_size: fileBuffer.byteLength,
        dimensions: { width: rendered.width, height: rendered.height },
        duration_seconds: Math.round(rendered.durationInFrames / rendered.fps),
      })
      .select("id")
      .single();
    if (mediaError || !mediaRow) {
      await admin.storage.from("media").remove([storagePath]).catch(() => undefined);
      throw new Error(`Medya kaydı oluşturulamadı: ${mediaError?.message ?? "bilinmeyen hata"}`);
    }

    const completedAt = new Date();
    const renderDurationMs = completedAt.getTime() - queue.startedAt.getTime();
    const costPerMinute = Number(process.env.VIDEO_RENDER_COST_PER_MINUTE_USD ?? 0);
    const estimatedCostUsd = estimateRenderCostUsd(renderDurationMs, costPerMinute);

    await admin
      .from("video_render_jobs")
      .update({
        status: "completed",
        output_media_id: mediaRow.id,
        output_url: publicUrl.publicUrl,
        completed_at: completedAt.toISOString(),
        render_duration_ms: renderDurationMs,
        estimated_cost_usd: estimatedCostUsd,
        render_provider: provider.name,
      })
      .eq("id", jobId);

    if (job.package_id) {
      try {
        await attachToPackage(admin, job.package_id, job.brand_id, mediaRow.id);
      } catch (err) {
        console.error("renderVideoJob: package attachment failed", jobId, err);
      }
    }
    return "completed";
  } catch (err) {
    const message = err instanceof Error ? err.message : "Video render sırasında bilinmeyen bir hata oluştu.";
    console.error("renderVideoJob failed:", jobId, message);
    const renderDurationMs = Date.now() - queue.startedAt.getTime();
    if (queue.attemptNumber < queue.maxAttempts) {
      const backoffSeconds = retryBackoffSeconds(queue.attemptNumber);
      await admin
        .from("video_render_jobs")
        .update({
          status: "queued",
          error: message,
          render_duration_ms: renderDurationMs,
          next_attempt_at: new Date(Date.now() + backoffSeconds * 1000).toISOString(),
          worker_id: null,
        })
        .eq("id", jobId)
        .eq("status", "rendering");
      return "retried";
    }
    await admin
      .from("video_render_jobs")
      .update({
        status: "failed",
        error: message,
        render_duration_ms: renderDurationMs,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId)
      .eq("status", "rendering");
    return "failed";
  } finally {
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => undefined);
    }
  }
}
