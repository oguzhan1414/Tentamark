import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, rateLimitErrorResponse } from "@/lib/rateLimit";
import { getBrandContext } from "@/lib/brand/getBrandContext";
import { deriveBrandDesignTokens } from "@/lib/brand/designTokens";
import { getCardType, type CardFormat } from "@/lib/cards/typeRegistry";
import { getCardTemplate } from "@/lib/cards/templateFieldConfig";
import { processImageField } from "@/lib/cards/processImageField";
import { persistCardImage } from "@/lib/cards/persistCardImage";

// Renders synchronously in the request/response cycle, unlike video jobs —
// one card (or a handful, for a carousel) is a few seconds of headless-
// browser work, not minutes of frame-by-frame composition, so there's no
// need for the job-row + after()-trigger + polling machinery
// video/jobs/route.ts uses.
export const maxDuration = 60;

const VALID_FORMATS: CardFormat[] = ["square", "story", "landscape"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const cardType = getCardType(type);
  if (!cardType) return NextResponse.json({ error: "Geçersiz şablon türü." }, { status: 404 });

  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const rateLimit = checkRateLimit(req, {
    limit: 15,
    windowSeconds: 600,
    keyPrefix: `card-${type}`,
    identifier: brand.id,
  });
  if (!rateLimit.success) {
    return rateLimitErrorResponse(rateLimit, "Çok fazla görsel oluşturma isteği gönderildi. Birkaç dakika sonra tekrar deneyin.");
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (!VALID_FORMATS.includes(body.format as CardFormat)) {
    return NextResponse.json({ error: "Geçersiz format." }, { status: 400 });
  }
  const format = body.format as CardFormat;
  if (!cardType.supportedFormats.includes(format)) {
    return NextResponse.json({ error: "Bu şablon bu formatı desteklemiyor." }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    const [brandContext, brandRow] = await Promise.all([
      getBrandContext(brand.id),
      supabase.from("brands").select("logo_url").eq("id", brand.id).maybeSingle(),
    ]);

    const props = await cardType.parseBody(body, {
      brandName: brandContext.brandName,
      logoUrl: brandRow.data?.logo_url ?? null,
      accentColor: brandContext.colorPalette[0],
      format,
    });
    const tokens = deriveBrandDesignTokens(brandContext);
    const dimensions = cardType.dimensions(format);

    // Real generation (unlike the live preview route) re-hosts every image
    // field into the brand's own Storage and runs the smart-crop/resolution/
    // busy-region checks — a rendered image is persisted and shared, so it
    // shouldn't stay dependent on a third-party URL staying alive, the way a
    // throwaway preview can.
    const warnings: string[] = [];
    const template = getCardTemplate(type);
    if (template) {
      const admin = createAdminClient();
      const propsRecord = props as Record<string, unknown>;
      for (const field of template.fields) {
        if (field.kind !== "image") continue;
        const rawValue = propsRecord[field.key];
        if (typeof rawValue !== "string" || !rawValue) continue;
        const { value, warnings: fieldWarnings } = await processImageField(rawValue, field, {
          brandId: brand.id,
          admin,
          canvasWidth: dimensions.width,
          canvasHeight: dimensions.height,
        });
        propsRecord[field.key] = value;
        warnings.push(...fieldWarnings);
      }
    }

    const buffers = await cardType.render(
      props,
      typeof body.variantKey === "string" ? body.variantKey : undefined,
      tokens
    );

    const results = await Promise.all(
      buffers.map((buffer, i) =>
        persistCardImage(
          supabase,
          brand.id,
          buffer,
          dimensions,
          buffers.length > 1 ? `${cardType.fileNamePrefix}-${i + 1}` : cardType.fileNamePrefix
        )
      )
    );

    return NextResponse.json({ results, warnings });
  } catch (err) {
    console.error(`Card render error (${type}):`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Görsel oluşturulamadı." },
      { status: 500 }
    );
  }
}
