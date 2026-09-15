import { NextRequest, NextResponse } from "next/server";
import { getCurrentBrand } from "@/lib/brand";
import { createClient } from "@/lib/supabase/server";
import { createExportJob, getValidAccessToken, pollExportJob } from "@/lib/canva/client";

// Called by the tab that opened the Canva popup once it receives the
// postMessage from design/return. Exports the finished design as PNG,
// re-hosts it in this brand's own Storage (Canva's export URL expires in
// 24h — every other media library item is a permanent Storage URL, and
// this one needs to behave the same way), then inserts it into `media`
// exactly like useMediaLibrary's upload() does.
export async function POST(req: NextRequest) {
  const brand = await getCurrentBrand();
  if (!brand) return NextResponse.json({ error: "Marka bulunamadı." }, { status: 401 });

  const { designId } = await req.json().catch(() => ({}));
  if (typeof designId !== "string" || !designId) {
    return NextResponse.json({ error: "designId eksik." }, { status: 400 });
  }

  const supabase = await createClient();
  const accessToken = await getValidAccessToken(supabase, brand.id);
  if (!accessToken) {
    return NextResponse.json({ error: "Canva bağlı değil.", code: "not_connected" }, { status: 409 });
  }

  try {
    const jobId = await createExportJob(accessToken, designId);
    const downloadUrl = await pollExportJob(accessToken, jobId);

    const fileRes = await fetch(downloadUrl);
    if (!fileRes.ok) throw new Error("Canva export dosyası indirilemedi.");
    const bytes = new Uint8Array(await fileRes.arrayBuffer());

    const path = `${brand.id}/${crypto.randomUUID()}-canva-tasarim.png`;
    const { error: uploadError } = await supabase.storage.from("media").upload(path, bytes, {
      contentType: "image/png",
    });
    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
    const { data: mediaRow, error: mediaError } = await supabase
      .from("media")
      .insert({
        brand_id: brand.id,
        file_name: "canva-tasarim.png",
        file_url: publicUrl.publicUrl,
        file_type: "image/png",
        file_size: bytes.byteLength,
        dimensions: { width: 1080, height: 1080 },
      })
      .select("id, file_name, file_url, file_type, alt_text")
      .single();
    if (mediaError || !mediaRow) throw new Error(mediaError?.message ?? "Medya kaydedilemedi.");

    return NextResponse.json({ media: mediaRow });
  } catch (err) {
    console.error("Canva design/finalize failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Canva tasarımı içeri aktarılamadı." }, { status: 502 });
  }
}
