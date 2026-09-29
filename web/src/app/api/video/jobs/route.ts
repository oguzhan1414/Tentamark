import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitErrorResponse } from "@/lib/rateLimit";
import { prepareVideoDraft } from "@/lib/video/prepareVideoDraft";
import { OPENAI_TTS_VOICES, MAX_VOICEOVER_SCRIPT_LENGTH, type VideoDuration, type VideoFormat, type VideoMusicTrack, type OpenAIVoice } from "@/lib/video/types";
import type { VideoRecipeId } from "@/lib/video/scenePlan";
import { hasExactOwnedIds } from "@/lib/video/videoJobSecurity";

// Generous local-dev ceiling — this route returns 202 almost immediately
// (the actual render runs after the response via after()), this just bounds
// the request handler itself, not the render.
export const maxDuration = 300;

const VALID_FORMATS: VideoFormat[] = ["vertical", "horizontal"];
const VALID_DURATIONS: VideoDuration[] = [10, 15, 20];
const VALID_RECIPES: Array<VideoRecipeId | "auto"> = ["auto", "quick_promo", "product_spotlight", "content_story", "user_clip_reel"];
const VALID_MUSIC: VideoMusicTrack[] = ["lofi", "none"];
const VIDEO_BACKGROUND_PRESETS = ["", "video/background.mp4", "video/video.mp4"];
const VALID_UPLOAD_MIME = ["video/mp4", "video/webm", "video/quicktime"];
// Independent of the Storage bucket's 128MB cap — a render-cost guard for
// the single local-Chromium renderer, which has no queueing beyond one
// in-flight job (see localRenderer.ts).
const MAX_UPLOAD_DURATION_SECONDS = 180;

/*
  Single route: insert the job row AND trigger draft preparation, atomically
  from the caller's point of view. Splitting "create" and "start" into two
  calls would leave an orphaned `pending` row forever if the client
  navigated away between them — nothing else ever picks up a job that
  wasn't just inserted.

  This no longer renders — prepareVideoDraft() runs the AI-costly work once
  and lands the job in 'draft' for the storyboard editor (Faz 6). The actual
  render only happens when the user explicitly hits
  POST /api/video/jobs/[id]/render.

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
    productUrl?: string;
    sourceMediaId?: string;
    trimStartSeconds?: number;
    trimEndSeconds?: number;
    voiceoverScript?: string;
    voiceoverVoice?: string;
    recipeId?: string;
    videoBackgroundUrl?: string;
    musicTrack?: string;
  };

  if (!VALID_FORMATS.includes(body.format as VideoFormat)) {
    return NextResponse.json({ error: "Geçersiz format." }, { status: 400 });
  }
  if (!VALID_DURATIONS.includes(body.durationSeconds as VideoDuration)) {
    return NextResponse.json({ error: "Geçersiz süre." }, { status: 400 });
  }
  if (!VALID_RECIPES.includes((body.recipeId ?? "auto") as VideoRecipeId | "auto")) {
    return NextResponse.json({ error: "Geçersiz video tarifi." }, { status: 400 });
  }
  if (!VALID_MUSIC.includes((body.musicTrack ?? "lofi") as VideoMusicTrack)) {
    return NextResponse.json({ error: "Geçersiz müzik seçimi." }, { status: 400 });
  }
  if (!VIDEO_BACKGROUND_PRESETS.includes(body.videoBackgroundUrl ?? "")) {
    return NextResponse.json({ error: "Geçersiz arka plan videosu." }, { status: 400 });
  }

  const voiceoverScript = typeof body.voiceoverScript === "string" ? body.voiceoverScript.trim() : "";
  if (voiceoverScript.length > MAX_VOICEOVER_SCRIPT_LENGTH) {
    return NextResponse.json(
      { error: `Seslendirme metni en fazla ${MAX_VOICEOVER_SCRIPT_LENGTH} karakter olabilir.` },
      { status: 400 }
    );
  }
  const voiceoverVoice: OpenAIVoice = (OPENAI_TTS_VOICES as readonly string[]).includes(body.voiceoverVoice ?? "")
    ? (body.voiceoverVoice as OpenAIVoice)
    : "alloy";

  const supabase = await createClient();

  const sourceType = body.sourceType;
  if (sourceType === "existing_content") {
    if (typeof body.sourceContentId !== "string" || !body.sourceContentId) {
      return NextResponse.json({ error: "İçerik seçilmedi." }, { status: 400 });
    }
    const { data: sourceContent, error: sourceContentError } = await supabase
      .from("content")
      .select("id")
      .eq("id", body.sourceContentId)
      .eq("brand_id", brand.id)
      .maybeSingle();
    if (sourceContentError || !sourceContent) {
      return NextResponse.json({ error: "Seçilen içerik bu markaya ait değil veya bulunamadı." }, { status: 400 });
    }
  } else if (sourceType === "custom_topic") {
    if (typeof body.topic !== "string" || !body.topic.trim()) {
      return NextResponse.json({ error: "Konu girilmedi." }, { status: 400 });
    }
  } else if (sourceType === "product_url") {
    // Cheap sanity check only — the real SSRF-safe validation + fetch
    // happens inside scrapeProductUrl() during the async render, where a
    // bad URL surfaces as a clean "failed" job instead of a 500 here.
    try {
      new URL(body.productUrl ?? "");
    } catch {
      return NextResponse.json({ error: "Geçersiz ürün linki." }, { status: 400 });
    }
  } else if (sourceType === "user_upload") {
    if (typeof body.sourceMediaId !== "string" || !body.sourceMediaId) {
      return NextResponse.json({ error: "Video seçilmedi." }, { status: 400 });
    }
    // Kendi videosu zaten kendi sesini taşıyor — üzerine AI seslendirme
    // binmesi iki sesin üst üste binmesine yol açar (bkz. UserClipShowcase.tsx).
    if (voiceoverScript) {
      return NextResponse.json({ error: "Kendi video yükleme akışında seslendirme kullanılamaz." }, { status: 400 });
    }
    // RLS-scoped to this brand via the request-scoped client — a media row
    // from another brand simply won't be found here, same as any other
    // brand-scoped select in this app.
    const { data: mediaRow, error: mediaError } = await supabase
      .from("media")
      .select("file_type, duration_seconds")
      .eq("id", body.sourceMediaId)
      .eq("brand_id", brand.id)
      .maybeSingle();
    if (mediaError || !mediaRow) {
      return NextResponse.json({ error: "Seçilen video bulunamadı." }, { status: 400 });
    }
    if (!VALID_UPLOAD_MIME.includes(mediaRow.file_type)) {
      return NextResponse.json({ error: "Desteklenmeyen video dosya türü." }, { status: 400 });
    }
    if (mediaRow.duration_seconds && mediaRow.duration_seconds > MAX_UPLOAD_DURATION_SECONDS) {
      return NextResponse.json(
        { error: `Video en fazla ${MAX_UPLOAD_DURATION_SECONDS} saniye olabilir.` },
        { status: 400 }
      );
    }
  } else {
    return NextResponse.json({ error: "Geçersiz kaynak türü." }, { status: 400 });
  }

  const selectedMediaIds = Array.isArray(body.selectedMediaIds)
    ? Array.from(new Set(body.selectedMediaIds.filter((id): id is string => typeof id === "string" && id.length > 0)))
    : [];
  if (selectedMediaIds.length > 20) {
    return NextResponse.json({ error: "En fazla 20 medya seçilebilir." }, { status: 400 });
  }
  if (selectedMediaIds.length > 0) {
    const { data: selectedMedia, error: selectedMediaError } = await supabase
      .from("media")
      .select("id")
      .eq("brand_id", brand.id)
      .in("id", selectedMediaIds);
    if (selectedMediaError || !hasExactOwnedIds(selectedMediaIds, (selectedMedia ?? []).map((row) => row.id))) {
      return NextResponse.json({ error: "Seçilen medyalardan biri bu markaya ait değil veya bulunamadı." }, { status: 400 });
    }
  }

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
      product_url: sourceType === "product_url" ? (body.productUrl as string).trim() : null,
      source_media_id: sourceType === "user_upload" ? body.sourceMediaId : null,
      selected_media_ids: selectedMediaIds,
      scene_plan: {
        settings: {
          recipeId: body.recipeId ?? "auto",
          videoBackgroundUrl: body.videoBackgroundUrl || null,
          musicTrack: body.musicTrack ?? "lofi",
          trimStartSeconds: sourceType === "user_upload" ? body.trimStartSeconds ?? 0 : undefined,
          trimEndSeconds: sourceType === "user_upload" ? body.trimEndSeconds : undefined,
          voiceoverScript: voiceoverScript || undefined,
          voiceoverVoice: voiceoverScript ? voiceoverVoice : undefined,
        },
      },
    })
    .select("id")
    .single();

  if (error || !job) {
    return NextResponse.json({ error: error?.message ?? "Video işi oluşturulamadı." }, { status: 500 });
  }

  after(() => prepareVideoDraft(job.id));

  return NextResponse.json({ jobId: job.id }, { status: 202 });
}
