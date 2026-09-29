import { createAdminClient } from "@/lib/supabase/admin";
import { resolveAndValidateUrl } from "@/lib/brand/htmlSignals";
import sharp from "sharp";
import { smartCropToSize, checkResolutionWarning } from "./imageAnalysis";

export type AdminClient = ReturnType<typeof createAdminClient>;

const FETCH_TIMEOUT_MS = 10000;
const MAX_BYTES = 10 * 1024 * 1024; // product photos are never legitimately bigger than this
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type IngestOptions = {
  // When given, the uploaded image is smart-cropped (sharp's attention
  // strategy — free, deterministic saliency detection, no ML API) to
  // exactly this size before upload, e.g. a full-bleed card background that
  // must fill one specific canvas size. Omit for image fields that just
  // get object-fit: cover'd at whatever size in HTML — no crop needed.
  cropTo?: { width: number; height: number };
};

/*
  Re-hosts a scraped remote image into the brand's own media library —
  same fetch→upload→insert shape as canva/design/finalize/route.ts, which
  exists because remote URLs (Canva exports, and here product-page images)
  can expire, get rate-limited, or vanish; the app should never depend on a
  third-party URL staying alive for a video render months later. Re-runs
  resolveAndValidateUrl per image since each one is its own remote host —
  the product PAGE having passed that check says nothing about its CDN.
  Best-effort: returns null on any failure rather than throwing, since one
  bad image shouldn't sink an entire product-video job over the other four.
*/
export async function ingestRemoteImage(
  remoteUrl: string,
  brandId: string,
  admin: AdminClient,
  options?: IngestOptions
): Promise<{ id: string; file_url: string; warning: string | null } | null> {
  try {
    const url = await resolveAndValidateUrl(remoteUrl);
    const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;

    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const ext = EXT_BY_TYPE[contentType];
    if (!ext) return null;

    const originalBuffer = Buffer.from(await res.arrayBuffer());
    if (originalBuffer.byteLength === 0 || originalBuffer.byteLength > MAX_BYTES) return null;

    const { width: actualWidth, height: actualHeight } = await sharp(originalBuffer).metadata();
    const warning =
      actualWidth && actualHeight
        ? checkResolutionWarning(actualWidth, actualHeight, options?.cropTo?.width ?? 800, options?.cropTo?.height ?? 800)
        : null;

    const uploadBuffer = options?.cropTo
      ? await smartCropToSize(originalBuffer, options.cropTo.width, options.cropTo.height)
      : originalBuffer;
    const uploadExt = options?.cropTo ? "png" : ext;
    const uploadContentType = options?.cropTo ? "image/png" : contentType;

    const path = `${brandId}/${crypto.randomUUID()}-product-image.${uploadExt}`;
    const { error: uploadError } = await admin.storage.from("media").upload(path, uploadBuffer, { contentType: uploadContentType });
    if (uploadError) return null;

    const { data: publicUrl } = admin.storage.from("media").getPublicUrl(path);

    const { data: mediaRow, error: insertError } = await admin
      .from("media")
      .insert({
        brand_id: brandId,
        file_name: `product-image.${uploadExt}`,
        file_url: publicUrl.publicUrl,
        file_type: uploadContentType,
        file_size: uploadBuffer.byteLength,
      })
      .select("id, file_url")
      .single();
    if (insertError || !mediaRow) return null;

    return { ...mediaRow, warning };
  } catch {
    return null;
  }
}
