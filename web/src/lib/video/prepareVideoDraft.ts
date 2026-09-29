import { createAdminClient } from "@/lib/supabase/admin";
import { buildDraftScenePlan } from "./buildVideoInputProps";

/*
  Draft-preparation half of what renderVideoJob.ts used to do in one shot —
  runs every AI/network-costly step (buildDraftScenePlan) and lands the
  result in scene_plan with status:'draft' instead of immediately rendering.
  Called fire-and-forget from POST /api/video/jobs via after(), same
  pending->X transition shape renderVideoJob.ts already uses, just landing
  on 'draft' instead of 'rendering'/'completed'. The user's own storyboard
  edits (PATCH /api/video/jobs/[id]/scene) and the explicit
  POST /api/video/jobs/[id]/render call are what move the job past this
  point — nothing here triggers a render.
*/
export async function prepareVideoDraft(jobId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: job, error: jobError } = await admin
    .from("video_render_jobs")
    .select("id, scene_plan")
    .eq("id", jobId)
    .single();
  if (jobError || !job) {
    console.error("prepareVideoDraft: job not found", jobId, jobError?.message);
    return;
  }

  try {
    const draft = await buildDraftScenePlan(jobId, admin);
    const existingSettings =
      job.scene_plan && typeof job.scene_plan === "object" ? (job.scene_plan as Record<string, unknown>).settings : null;

    const { error: updateError } = await admin
      .from("video_render_jobs")
      .update({
        status: "draft",
        scene_plan: {
          recipeId: draft.recipeId,
          settings: existingSettings ?? {},
          scenes: draft.scenes,
          voiceoverAudio: draft.voiceoverAudio ?? null,
          captions: draft.captions ?? null,
          resolvedSourceText: draft.resolvedSourceText,
          resolvedProduct: draft.resolvedProduct ?? null,
        },
      })
      .eq("id", jobId);
    if (updateError) throw new Error(`Video taslağı kaydedilemedi: ${updateError.message}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Taslak hazırlanırken bilinmeyen bir hata oluştu.";
    console.error("prepareVideoDraft failed:", jobId, message);
    await admin.from("video_render_jobs").update({ status: "failed", error: message }).eq("id", jobId);
  }
}
