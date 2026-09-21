"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type VideoRenderJobStatus = "pending" | "rendering" | "completed" | "failed";

export type VideoRenderJobState = {
  status: VideoRenderJobStatus;
  error: string | null;
  outputUrl: string | null;
};

const POLL_INTERVAL_MS = 3000;

/*
  No dedicated polling API route — reads video_render_jobs directly via its
  RLS select policy (private.is_own_brand), same shape as useMediaLibrary.ts.
  Self-scheduling via setTimeout (not setInterval) so a slow request can't
  overlap the next tick, and polling naturally stops once the job reaches a
  terminal status instead of needing a separate "am I done" check.
*/
export function useVideoRenderJob(jobId: string | null): VideoRenderJobState | null {
  const [job, setJob] = useState<VideoRenderJobState | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const supabase = createClient();
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function tick() {
      const { data } = await supabase
        .from("video_render_jobs")
        .select("status, error, output_url")
        .eq("id", jobId as string)
        .single();
      if (cancelled) return;
      if (data) {
        const next: VideoRenderJobState = {
          status: data.status as VideoRenderJobStatus,
          error: data.error,
          outputUrl: data.output_url,
        };
        setJob(next);
        if (next.status === "completed" || next.status === "failed") return;
      }
      timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
    }

    tick();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [jobId]);

  return jobId ? job : null;
}
