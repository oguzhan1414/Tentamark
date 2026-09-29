import os from "node:os";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderVideoJob } from "./renderVideoJob";

const DEFAULT_BATCH_SIZE = 1;

export type RenderQueueSummary = {
  claimed: number;
  completed: number;
  retried: number;
  failed: number;
};

export async function recoverStaleVideoRenders(staleAfterMinutes = 12): Promise<number> {
  const admin = createAdminClient();
  const staleBefore = new Date(Date.now() - staleAfterMinutes * 60_000).toISOString();
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("video_render_jobs")
    .update({
      status: "queued",
      next_attempt_at: now,
      queued_at: now,
      worker_id: null,
      error: "Worker zaman aşımı: iş güvenli biçimde yeniden kuyruğa alındı.",
    })
    .eq("status", "rendering")
    .lt("started_at", staleBefore)
    .select("id");
  if (error) throw new Error(`Takılı render işleri kurtarılamadı: ${error.message}`);
  return data?.length ?? 0;
}

type QueueCandidate = {
  id: string;
  attempt_count: number | null;
  max_attempts: number | null;
  queued_at: string | null;
};

export async function processVideoRenderQueue(options: { jobId?: string; limit?: number } = {}): Promise<RenderQueueSummary> {
  const admin = createAdminClient();
  const limit = Math.max(1, Math.min(options.limit ?? DEFAULT_BATCH_SIZE, 5));
  let query = admin
    .from("video_render_jobs")
    .select("id, attempt_count, max_attempts, queued_at")
    .eq("status", "queued")
    .lte("next_attempt_at", new Date().toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(limit);
  if (options.jobId) query = query.eq("id", options.jobId);

  const { data, error } = await query;
  if (error) throw new Error(`Render kuyruğu okunamadı: ${error.message}`);

  const summary: RenderQueueSummary = { claimed: 0, completed: 0, retried: 0, failed: 0 };
  for (const candidate of (data ?? []) as QueueCandidate[]) {
    const attemptNumber = (candidate.attempt_count ?? 0) + 1;
    const startedAt = new Date();
    const { data: claimed, error: claimError } = await admin
      .from("video_render_jobs")
      .update({
        status: "rendering",
        attempt_count: attemptNumber,
        started_at: startedAt.toISOString(),
        worker_id: `${os.hostname()}:${process.pid}`,
        queue_wait_ms: candidate.queued_at ? Math.max(0, startedAt.getTime() - new Date(candidate.queued_at).getTime()) : 0,
        error: null,
      })
      .eq("id", candidate.id)
      .eq("status", "queued")
      .select("id")
      .maybeSingle();
    if (claimError) throw new Error(`Render işi sahiplenilemedi: ${claimError.message}`);
    if (!claimed) continue;

    summary.claimed += 1;
    const outcome = await renderVideoJob(candidate.id, {
      attemptNumber,
      maxAttempts: candidate.max_attempts ?? 3,
      startedAt,
    });
    summary[outcome] += 1;
  }

  return summary;
}
