import { readFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildVideoInputProps } from "./buildVideoInputProps";
import { localRenderer } from "./localRenderer";

/*
  The whole job lifecycle for one video_render_jobs row: resolve brand/copy,
  render (today: locally, via localRenderer — see renderExecutor.ts for the
  swap-to-Lambda seam), upload the result into the brand's existing `media`
  table/bucket (already supports video/mp4, see patch 0018), and record the
  outcome. Called fire-and-forget from the API route via next/server's
  after() — this function owns every status transition on the row.
*/
export async function renderVideoJob(jobId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: job, error: jobError } = await admin
    .from("video_render_jobs")
    .select("id, brand_id, created_by")
    .eq("id", jobId)
    .single();
  if (jobError || !job) {
    console.error("renderVideoJob: job not found", jobId, jobError?.message);
    return;
  }

  await admin.from("video_render_jobs").update({ status: "rendering", started_at: new Date().toISOString() }).eq("id", jobId);

  let tempFilePath: string | null = null;
  try {
    const inputProps = await buildVideoInputProps(jobId, admin);
    await admin.from("video_render_jobs").update({ scene_plan: inputProps.scenePlan }).eq("id", jobId);

    const rendered = await localRenderer(inputProps);
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
    if (mediaError || !mediaRow) throw new Error(`Medya kaydı oluşturulamadı: ${mediaError?.message ?? "bilinmeyen hata"}`);

    await admin
      .from("video_render_jobs")
      .update({
        status: "completed",
        output_media_id: mediaRow.id,
        output_url: publicUrl.publicUrl,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Video render sırasında bilinmeyen bir hata oluştu.";
    console.error("renderVideoJob failed:", jobId, message);
    await admin
      .from("video_render_jobs")
      .update({ status: "failed", error: message, completed_at: new Date().toISOString() })
      .eq("id", jobId);
  } finally {
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => undefined);
    }
  }
}
