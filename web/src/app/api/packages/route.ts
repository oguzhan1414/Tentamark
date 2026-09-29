import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitErrorResponse } from "@/lib/rateLimit";
import { createContentPackage } from "@/lib/content/createContentPackage";
import { ALL_PLATFORMS, type LaunchPlatform } from "@/lib/ai/platforms";
import { prepareVideoDraft } from "@/lib/video/prepareVideoDraft";

// Card rendering (feed+story+carousel, a handful of Playwright renders) plus
// a couple of Groq calls all happen synchronously here — same budget
// api/cards/[type]/route.ts already uses for its own synchronous render
// work. The video's AI-costly draft prep continues in the background via
// prepareVideoDraft's own after() call, same as a normal video job.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const rateLimit = checkRateLimit(req, {
    limit: 5,
    windowSeconds: 600,
    keyPrefix: "content-packages",
    identifier: brand.id,
  });
  if (!rateLimit.success) {
    return rateLimitErrorResponse(rateLimit, "Çok fazla paket oluşturma isteği gönderildi. Birkaç dakika sonra tekrar deneyin.");
  }

  const body = (await req.json().catch(() => ({}))) as { topic?: string; platforms?: string[] };
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!topic) return NextResponse.json({ error: "Konu girilmedi." }, { status: 400 });

  const platforms = Array.isArray(body.platforms) ? body.platforms.filter((p): p is LaunchPlatform => ALL_PLATFORMS.includes(p as LaunchPlatform)) : [];
  if (platforms.length === 0) return NextResponse.json({ error: "En az bir platform seçilmeli." }, { status: 400 });

  const supabase = await createClient();
  try {
    const { packageId, videoJobId } = await createContentPackage(brand.id, topic, platforms, supabase);
    if (videoJobId) after(() => prepareVideoDraft(videoJobId));
    return NextResponse.json({ packageId });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Paket oluşturulamadı." }, { status: 500 });
  }
}
