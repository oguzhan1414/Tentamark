import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { processVideoRenderQueue, recoverStaleVideoRenders } from "@/lib/video/renderQueue";

export const maxDuration = 900;

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.RENDER_WORKER_SECRET || process.env.SCHEDULER_WEBHOOK_SECRET || process.env.CRON_SECRET;
  if (!expected) return process.env.NODE_ENV === "development";
  const header = req.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : req.headers.get("x-cron-secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await req.json().catch(() => ({}))) as { limit?: number };
    const recovered = await recoverStaleVideoRenders();
    const result = await processVideoRenderQueue({ limit: body.limit });
    return NextResponse.json({ recovered, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Render worker başarısız oldu." },
      { status: 500 }
    );
  }
}
