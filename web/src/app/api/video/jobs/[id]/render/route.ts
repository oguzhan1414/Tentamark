import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processVideoRenderQueue } from "@/lib/video/renderQueue";

// Generous local-dev ceiling — this route returns 202 almost immediately
// (the actual render runs after the response via after()), matching the
// original POST /api/video/jobs' own maxDuration reasoning.
export const maxDuration = 300;

/*
  The explicit "I'm done editing, render this" action (Faz 6) — the
  storyboard editor's draft->rendering transition. Deliberately thin: no AI
  work happens here or in renderVideoJob() anymore, that already ran once in
  prepareVideoDraft.ts. This route's only job is the status gate (must be
  the brand's own 'draft' row) and firing the actual render.
*/
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("video_render_jobs")
    .select("id, status")
    .eq("id", id)
    .eq("brand_id", brand.id)
    .maybeSingle();
  if (error || !job) return NextResponse.json({ error: "Video işi bulunamadı." }, { status: 404 });
  if (job.status !== "draft") {
    return NextResponse.json({ error: "Bu iş render için hazır değil." }, { status: 400 });
  }

  // Atomically move draft -> queued. The status predicate makes simultaneous
  // clicks idempotent: only one request can claim the draft row.
  const admin = createAdminClient();
  const queuedAt = new Date().toISOString();
  const { data: claimedJob, error: updateError } = await admin
    .from("video_render_jobs")
    .update({ status: "queued", queued_at: queuedAt, next_attempt_at: queuedAt, completed_at: null, error: null })
    .eq("id", id)
    .eq("brand_id", brand.id)
    .eq("status", "draft")
    .select("id")
    .maybeSingle();
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (!claimedJob) {
    return NextResponse.json({ error: "Video işi başka bir işlem tarafından başlatıldı." }, { status: 409 });
  }

  after(() => processVideoRenderQueue({ jobId: id }));

  return NextResponse.json({ ok: true }, { status: 202 });
}
