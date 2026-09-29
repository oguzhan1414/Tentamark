import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { checkRateLimit, rateLimitErrorResponse } from "@/lib/rateLimit";
import { classifyContentPurpose } from "@/lib/ai/classifyContentPurpose";
import { CONTENT_PURPOSE_LABELS, getTemplateSuggestions } from "@/lib/cards/contentPurpose";

const MAX_TOPIC_LENGTH = 200;

export async function POST(req: NextRequest) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const rateLimit = checkRateLimit(req, {
    limit: 15,
    windowSeconds: 600,
    keyPrefix: "card-suggest-template",
    identifier: brand.id,
  });
  if (!rateLimit.success) {
    return rateLimitErrorResponse(rateLimit, "Çok fazla öneri isteği gönderildi. Birkaç dakika sonra tekrar deneyin.");
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!topic) return NextResponse.json({ error: "Konu boş olamaz." }, { status: 400 });
  if (topic.length > MAX_TOPIC_LENGTH) {
    return NextResponse.json({ error: `Konu en fazla ${MAX_TOPIC_LENGTH} karakter olabilir.` }, { status: 400 });
  }

  try {
    const purpose = await classifyContentPurpose(topic, brand.id);
    const suggestions = getTemplateSuggestions(purpose);
    return NextResponse.json({ purpose, purposeLabel: CONTENT_PURPOSE_LABELS[purpose], suggestions });
  } catch (err) {
    console.error("Template suggestion error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Öneri oluşturulamadı." },
      { status: 500 }
    );
  }
}
