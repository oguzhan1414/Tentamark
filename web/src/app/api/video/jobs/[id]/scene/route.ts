import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";

/*
  Storyboard editor autosave (Faz 6) — persists the FULL edited scenes array
  after any local change (reorder/delete/duplicate/duration/text/media). The
  status column is never touched here, so patch 0064's RLS policy (which
  only allows edits that keep status='draft') permits this via the normal
  request-scoped client — no admin client needed, unlike the render/
  regenerate-scene routes which transition status or need to re-call Groq.
*/
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    scenes?: unknown;
    settings?: { videoBackgroundUrl?: unknown; musicTrack?: unknown };
  };
  if (!Array.isArray(body.scenes) || body.scenes.length < 2 || body.scenes.length > 20) {
    return NextResponse.json({ error: "Geçersiz sahne listesi." }, { status: 400 });
  }
  const validShape = body.scenes.every(
    (s) => s && typeof s === "object" && typeof (s as Record<string, unknown>).archetype === "string" && typeof (s as Record<string, unknown>).frames === "number"
  );
  if (!validShape) return NextResponse.json({ error: "Geçersiz sahne verisi." }, { status: 400 });

  const supabase = await createClient();
  const { data: job, error } = await supabase
    .from("video_render_jobs")
    .select("id, status, scene_plan")
    .eq("id", id)
    .eq("brand_id", brand.id)
    .maybeSingle();
  if (error || !job) return NextResponse.json({ error: "Video işi bulunamadı." }, { status: 404 });
  if (job.status !== "draft") return NextResponse.json({ error: "Bu iş artık düzenlenemez." }, { status: 400 });

  const currentPlan = job.scene_plan && typeof job.scene_plan === "object" ? (job.scene_plan as Record<string, unknown>) : {};
  const currentSettings = currentPlan.settings && typeof currentPlan.settings === "object"
    ? (currentPlan.settings as Record<string, unknown>)
    : {};
  const allowedBackgrounds = [null, "", "video/background.mp4", "video/video.mp4"];
  const requestedBackground = body.settings?.videoBackgroundUrl;
  if (requestedBackground !== undefined && !allowedBackgrounds.includes(requestedBackground as string | null)) {
    return NextResponse.json({ error: "Geçersiz video arka planı." }, { status: 400 });
  }
  const requestedMusic = body.settings?.musicTrack;
  if (requestedMusic !== undefined && requestedMusic !== "lofi" && requestedMusic !== "none") {
    return NextResponse.json({ error: "Geçersiz müzik seçimi." }, { status: 400 });
  }
  const nextSettings = {
    ...currentSettings,
    ...(requestedBackground !== undefined ? { videoBackgroundUrl: requestedBackground || null } : {}),
    ...(requestedMusic !== undefined ? { musicTrack: requestedMusic } : {}),
  };
  const { error: updateError } = await supabase
    .from("video_render_jobs")
    .update({ scene_plan: { ...currentPlan, settings: nextSettings, scenes: body.scenes } })
    .eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
