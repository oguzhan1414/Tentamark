import { NextRequest, NextResponse } from "next/server";
import { generateImagePrompt } from "@/lib/ai/generateImagePrompt";
import { generateImage } from "@/lib/ai/generateImage";

// Returns the generated image as a data URL — does not touch Storage or
// the `media` table. See generateImage.ts for why: persisting only happens
// once the caller actually submits the content the image belongs to.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visualConcept, title, brandName } = body;

    if (!visualConcept || typeof visualConcept !== "string") {
      return NextResponse.json(
        { success: false, error: "visualConcept (çekim konsepti) belirtilmedi." },
        { status: 400 }
      );
    }

    const prompt = await generateImagePrompt(visualConcept, { title, brandName });
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
