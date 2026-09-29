import sharp from "sharp";

// Sharp is already a dependency (used only by a dev script until now) — its
// libvips-backed attention strategy gives free, deterministic saliency-based
// cropping without needing any ML API call or third-party service.

export async function smartCropToSize(buffer: Buffer, width: number, height: number): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, height, { fit: "cover", position: sharp.strategy.attention })
    .toBuffer();
}

// A generously loose threshold (0.7x) on purpose — this flags images that
// would visibly need upscaling, not ones that are merely smaller than the
// exact target (object-fit: cover already handles moderate size mismatch
// fine; only real under-resolution is worth interrupting the user for).
const RESOLUTION_TOLERANCE = 0.7;

export function checkResolutionWarning(
  actualWidth: number,
  actualHeight: number,
  targetWidth: number,
  targetHeight: number
): string | null {
  if (actualWidth < targetWidth * RESOLUTION_TOLERANCE || actualHeight < targetHeight * RESOLUTION_TOLERANCE) {
    return `Yüklenen görsel (${actualWidth}×${actualHeight}) hedef alan için düşük çözünürlüklü olabilir, büyütüldüğünde bulanıklaşabilir.`;
  }
  return null;
}

// stdev of a greyscale region is a cheap, real proxy for "how visually busy
// is this patch" — a flat sky or wall reads near 0, a detailed/high-contrast
// area (foliage, a crowd, printed text already in the photo) reads high.
// Doesn't attempt to identify WHAT is there, just whether text laid on top
// of it is likely to fight for attention.
const BUSY_STDEV_THRESHOLD = 45;

export async function isRegionBusy(
  buffer: Buffer,
  region: { left: number; top: number; width: number; height: number }
): Promise<boolean> {
  // Must materialize the extract into a real buffer before computing
  // stats() — chaining .extract(region).stats() directly in one pipeline
  // silently ignores the region on this sharp/libvips build and reports
  // stats for the WHOLE source image instead (verified empirically: two
  // wildly different sub-regions of the same image produced byte-identical
  // stats when chained, but correct/differing stats once the extract was
  // materialized to its own buffer first).
  const regionBuffer = await sharp(buffer).extract(region).toBuffer();
  const stats = await sharp(regionBuffer).greyscale().stats();
  return stats.channels[0].stdev > BUSY_STDEV_THRESHOLD;
}
