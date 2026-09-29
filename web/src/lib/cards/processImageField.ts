import sharp from "sharp";
import { ingestRemoteImage, type AdminClient } from "@/lib/media/ingestRemoteImage";
import { checkResolutionWarning, isRegionBusy } from "@/lib/media/imageAnalysis";
import type { FieldConfig } from "./templateFieldConfig";

const DATA_URI_RE = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/i;
const DEFAULT_MIN_DIMENSION = 800;

export type ProcessImageContext = {
  brandId: string;
  admin: AdminClient;
  canvasWidth: number;
  canvasHeight: number;
};

export type ProcessImageResult = { value: string; warnings: string[] };

// Called once per image field right before rendering (real generation only,
// never the live preview route — see api/cards/[type]/route.ts). Every
// https:// image field gets re-hosted into the brand's own Storage, same
// reliability reasoning as the video pipeline's ingestRemoteImage; a
// data:-URI field is already local so it only gets the (cheap) resolution
// check. Never throws — a processing hiccup falls back to the original
// value rather than sinking the whole render over one photo.
export async function processImageField(
  rawValue: string,
  field: FieldConfig,
  ctx: ProcessImageContext
): Promise<ProcessImageResult> {
  const warnings: string[] = [];

  const dataMatch = rawValue.match(DATA_URI_RE);
  if (dataMatch) {
    try {
      const buffer = Buffer.from(dataMatch[2], "base64");
      const { width, height } = await sharp(buffer).metadata();
      if (width && height) {
        const target = field.fullBleed
          ? { width: ctx.canvasWidth, height: ctx.canvasHeight }
          : { width: DEFAULT_MIN_DIMENSION, height: DEFAULT_MIN_DIMENSION };
        const warning = checkResolutionWarning(width, height, target.width, target.height);
        if (warning) warnings.push(warning);
      }
    } catch {
      // Corrupt/unreadable data URI — let the render itself fail loudly if
      // the browser can't decode it either, rather than guessing here.
    }
    return { value: rawValue, warnings };
  }

  if (!/^https?:\/\//i.test(rawValue)) {
    // Not a URL or data URI we recognize — pass through untouched.
    return { value: rawValue, warnings };
  }

  const ingested = await ingestRemoteImage(
    rawValue,
    ctx.brandId,
    ctx.admin,
    field.fullBleed ? { cropTo: { width: ctx.canvasWidth, height: ctx.canvasHeight } } : undefined
  );

  if (!ingested) {
    warnings.push("Görsel marka kütüphanesine aktarılamadı, orijinal bağlantı kullanıldı.");
    return { value: rawValue, warnings };
  }
  if (ingested.warning) warnings.push(ingested.warning);

  if (field.fullBleed && field.textSafeZone) {
    try {
      const res = await fetch(ingested.file_url);
      const buffer = Buffer.from(await res.arrayBuffer());
      const zone = field.textSafeZone;
      const region = {
        left: Math.round(zone.left * ctx.canvasWidth),
        top: Math.round(zone.top * ctx.canvasHeight),
        width: Math.round(zone.width * ctx.canvasWidth),
        height: Math.round(zone.height * ctx.canvasHeight),
      };
      if (await isRegionBusy(buffer, region)) {
        warnings.push("Görselin metin/rozet bölgesi oldukça yoğun görünüyor, okunabilirlik etkilenebilir.");
      }
    } catch {
      // Best-effort quality check — never blocks the actual render.
    }
  }

  return { value: ingested.file_url, warnings };
}
