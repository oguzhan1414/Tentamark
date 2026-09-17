import { NextRequest, NextResponse } from "next/server";
import { generateImagePrompt } from "@/lib/ai/generateImagePrompt";
import { generateImage } from "@/lib/ai/generateImage";
import { getBrandContext } from "@/lib/brand/getBrandContext";

import { checkRateLimit, rateLimitErrorResponse } from "@/lib/rateLimit";

// Returns the generated image as a data URL — does not touch Storage or
// the `media` table. See generateImage.ts for why: persisting only happens
// once the caller actually submits the content the image belongs to.
export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, {
      keyPrefix: "media-generate",
      limit: 10,
      windowSeconds: 60,
    });
    if (!rateLimit.success) {
      return rateLimitErrorResponse(
        rateLimit,
        "Görsel üretim sıklık limiti aşıldı. Lütfen bir süre bekleyip tekrar deneyin."
      );
    }

    const body = await req.json();
    const { visualConcept, title, brandName, brandId } = body;

    if (!visualConcept || typeof visualConcept !== "string") {
      return NextResponse.json(
        { success: false, error: "visualConcept (çekim konsepti) belirtilmedi." },
        { status: 400 }
      );
    }

    const colorPalette = typeof brandId === "string" ? (await getBrandContext(brandId)).colorPalette : [];

    const prompt = await generateImagePrompt(visualConcept, { title, brandName, colorPalette });
    const result = await generateImage({ prompt });

    return NextResponse.json({
      success: true,
      dataUrl: result.dataUrl,
      prompt: result.prompt,
      provider: result.provider,
    });
  } catch (err) {
    console.error("API /api/media/generate error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Görsel üretilemedi.",
      },
      { status: 500 }
    );
  }
}
