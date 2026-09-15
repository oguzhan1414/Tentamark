import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { createBlankDesign, getValidAccessToken } from "@/lib/canva/client";

// Opens a fresh blank design and hands back its edit_url with a
// correlation_state appended, ready for the caller to window.open() it.
// No session bookkeeping needed server-side beyond that: the returned
// design_id travels back inside Canva's signed correlation_jwt (see
// design/return), and the tab that opened the popup already knows its own
// brand — it's the one that will call design/finalize.
export async function POST() {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const supabase = await createClient();
  const accessToken = await getValidAccessToken(supabase, brand.id);
  if (!accessToken) {
    return NextResponse.json({ error: "Canva bağlı değil.", code: "not_connected" }, { status: 409 });
  }

  try {
    const { editUrl } = await createBlankDesign(accessToken, `${brand.name} Gönderisi`);
    const correlationState = randomBytes(12).toString("base64url");
    const url = new URL(editUrl);
    url.searchParams.set("correlation_state", correlationState);
    return NextResponse.json({ editUrl: url.toString() });
  } catch (err) {
    console.error("Canva design/start failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Canva tasarımı başlatılamadı." }, { status: 502 });
  }
}
