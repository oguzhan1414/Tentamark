import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { getBrandContext } from "@/lib/brand/getBrandContext";
import { deriveBrandDesignTokens } from "@/lib/brand/designTokens";
import { buildCardPreview, type CardFormat } from "@/lib/cards/typeRegistry";

export const maxDuration = 10;

const VALID_FORMATS: CardFormat[] = ["square", "story", "landscape"];

export async function POST(req: NextRequest) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const type = typeof body.type === "string" ? body.type : "quote";
  const format = VALID_FORMATS.includes(body.format as CardFormat) ? (body.format as CardFormat) : "square";
  const values = (body.values && typeof body.values === "object" ? body.values : {}) as Record<string, unknown>;
  const variantKey = typeof body.variantKey === "string" ? body.variantKey : undefined;

  const supabase = await createClient();

  try {
    const [brandContext, brandRow] = await Promise.all([
      getBrandContext(brand.id),
      supabase.from("brands").select("logo_url").eq("id", brand.id).maybeSingle(),
    ]);

    const preview = await buildCardPreview(
      type,
      values,
      {
        brandName: brandContext.brandName,
        logoUrl: brandRow.data?.logo_url ?? null,
        accentColor: brandContext.colorPalette[0],
        format,
      },
      variantKey,
      deriveBrandDesignTokens(brandContext)
    );

    return NextResponse.json(preview);
  } catch (err) {
    console.error(`Card preview error (${type}):`, err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Önizleme oluşturulamadı." },
      { status: 500 }
    );
  }
}
