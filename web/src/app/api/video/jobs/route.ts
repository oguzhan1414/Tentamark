import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitErrorResponse } from "@/lib/rateLimit";
import { renderVideoJob } from "@/lib/video/renderVideoJob";
import type { VideoDuration, VideoFormat } from "@/lib/video/types";

// Generous local-dev ceiling — this route returns 202 almost immediately
// (the actual render runs after the response via after()), this just bounds
// the request handler itself, not the render.
export const maxDuration = 300;

const VALID_FORMATS: VideoFormat[] = ["vertical", "horizontal"];
const VALID_DURATIONS: VideoDuration[] = [10, 15, 20];

/*
  Single route: insert the job row AND trigger its render, atomically from
  the caller's point of view. Splitting "create" and "start" into two calls
  would leave an orphaned `pending` row forever if the client navigated away
  between them — nothing else ever picks up a job that wasn't just inserted.

  No separate polling route: the client reads video_render_jobs directly via
  RLS (see useVideoRenderJob.ts), the same pattern useMediaLibrary.ts already
  uses for "read my brand's own rows".
*/
export async function POST(req: NextRequest) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const rateLimit = checkRateLimit(req, {
    limit: 5,
    windowSeconds: 600,
    keyPrefix: "video-jobs",
    identifier: brand.id,
  });
  if (!rateLimit.success) {
    return rateLimitErrorResponse(rateLimit, "Çok fazla video oluşturma isteği gönderildi. Birkaç dakika sonra tekrar deneyin.");
  }

  const body = (await req.json().catch(() => ({}))) as {
    format?: string;
    durationSeconds?: number;
    sourceType?: string;
    sourceContentId?: string;
    topic?: string;
    selectedMediaIds?: string[];
  };

  if (!VALID_FORMATS.includes(body.format as VideoFormat)) {
    return NextResponse.json({ error: "Geçersiz format." }, { status: 400 });
  }
  if (!VALID_DURATIONS.includes(body.durationSeconds as VideoDuration)) {
    return NextResponse.json({ error: "Geçersiz süre." }, { status: 400 });
  }

  const sourceType = body.sourceType;
  if (sourceType === "existing_content") {
    if (typeof body.sourceContentId !== "string" || !body.sourceContentId) {
      return NextResponse.json({ error: "İçerik seçilmedi." }, { status: 400 });
    }
  } else if (sourceType === "custom_topic") {
    if (typeof body.topic !== "string" || !body.topic.trim()) {
      return NextResponse.json({ error: "Konu girilmedi." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Geçersiz kaynak türü." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: job, error } = await supabase
    .from("video_render_jobs")
    .insert({
      brand_id: brand.id,
      created_by: user?.id ?? null,
      format: body.format,
      duration_seconds: body.durationSeconds,
      source_type: sourceType,
      source_content_id: sourceType === "existing_content" ? body.sourceContentId : null,
      topic: sourceType === "custom_topic" ? (body.topic as string).trim() : null,
      selected_media_ids: Array.isArray(body.selectedMediaIds) ? body.selectedMediaIds : [],
    })
    .select("id")
    .single();

  if (error || !job) {
    return NextResponse.json({ error: error?.message ?? "Video işi oluşturulamadı." }, { status: 500 });
  }

  after(() => renderVideoJob(job.id));

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
