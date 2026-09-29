import sharp from "sharp";

const CANDIDATE_COUNT = 5;

// A static, one-shot generalization of imageAnalysis.ts's isRegionBusy() —
// same "greyscale stdev of a region" primitive, just scored across a few
// candidate crop windows along the axis that actually gets cropped, instead
// of thresholded into a single true/false. Deliberately NOT per-frame: this
// runs once against the video's poster frame and produces one static
// object-position for the whole clip. True per-frame subject tracking would
// need real ML and is out of scope, same reasoning as Faz 3's background-
// removal skip.
export async function estimateFocalOffset(
  posterBuffer: Buffer,
  targetAspect: number
): Promise<{ objectPositionX: string; objectPositionY: string }> {
  const { width, height } = await sharp(posterBuffer).metadata();
  if (!width || !height) return { objectPositionX: "50%", objectPositionY: "50%" };

  const sourceAspect = width / height;
  // Roughly the same aspect already — no meaningful crop happens either way.
  if (Math.abs(sourceAspect - targetAspect) < 0.02) {
    return { objectPositionX: "50%", objectPositionY: "50%" };
  }

  if (sourceAspect > targetAspect) {
    // Source is relatively wider than the target — cropping trims the sides.
    const cropWidth = Math.round(height * targetAspect);
    const slack = width - cropWidth;
    const bestLeft = await bestOffset(posterBuffer, slack, (offset) => ({
      left: offset,
      top: 0,
      width: cropWidth,
      height,
    }));
    const percent = slack > 0 ? Math.round((bestLeft / slack) * 100) : 50;
    return { objectPositionX: `${percent}%`, objectPositionY: "50%" };
  }

  // Source is relatively taller than the target — cropping trims top/bottom.
  const cropHeight = Math.round(width / targetAspect);
  const slack = height - cropHeight;
  const bestTop = await bestOffset(posterBuffer, slack, (offset) => ({
    left: 0,
    top: offset,
    width,
    height: cropHeight,
  }));
  const percent = slack > 0 ? Math.round((bestTop / slack) * 100) : 50;
  return { objectPositionX: "50%", objectPositionY: `${percent}%` };
}

async function bestOffset(
  buffer: Buffer,
  slack: number,
  regionFor: (offset: number) => { left: number; top: number; width: number; height: number }
): Promise<number> {
  if (slack <= 0) return 0;

  let bestOffsetValue = 0;
  let bestStdev = -1;
  for (let i = 0; i < CANDIDATE_COUNT; i++) {
    const offset = Math.round((slack * i) / (CANDIDATE_COUNT - 1));
    // Must materialize before stats() — see isRegionBusy()'s comment in
    // imageAnalysis.ts for why chaining .extract().stats() directly silently
    // ignores the region on this sharp/libvips build.
    const regionBuffer = await sharp(buffer).extract(regionFor(offset)).toBuffer();
    const stats = await sharp(regionBuffer).greyscale().stats();
    const stdev = stats.channels[0].stdev;
    if (stdev > bestStdev) {
      bestStdev = stdev;
      bestOffsetValue = offset;
    }
  }
  return bestOffsetValue;
}
