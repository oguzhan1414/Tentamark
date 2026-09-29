import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { smartCropToSize, checkResolutionWarning, isRegionBusy } from "../src/lib/media/imageAnalysis";

/*
  No network dependency: builds its own synthetic test images with sharp
  instead of fetching a real photo, so this proves the sharp-level logic
  (attention-crop, resolution math, busy-region stdev) works in isolation
  from ingestRemoteImage's fetch/upload plumbing.
*/
let failures = 0;

function fail(message: string) {
  console.error(`FAIL: ${message}`);
  failures++;
}

async function testSmartCrop() {
  // A wide (2000x800) flat grey canvas with one small, high-contrast
  // checkerboard patch tucked in the far top-right corner, cropped down to
  // a 400x400 square. Cropping a wide source to a square target actually
  // discards pixels (unlike a same-aspect-ratio resize, which wouldn't
  // exercise position at all) — a center crop keeps only the middle third
  // of the width and entirely misses the corner patch, while sharp's
  // attention strategy should pull the crop window toward it.
  const width = 2000;
  const height = 800;
  const patch = 200;
  const svg = `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#808080" />
      ${Array.from({ length: 10 })
        .map((_, row) =>
          Array.from({ length: 10 })
            .map((_, col) => {
              const x = width - patch + col * (patch / 10);
              const y = row * (patch / 10);
              const fill = (row + col) % 2 === 0 ? "#000000" : "#ffffff";
              return `<rect x="${x}" y="${y}" width="${patch / 10}" height="${patch / 10}" fill="${fill}" />`;
            })
            .join("")
        )
        .join("")}
    </svg>
  `;
  const buffer = await sharp(Buffer.from(svg)).png().toBuffer();

  const cropped = await smartCropToSize(buffer, 400, 400);
  const outDir = path.join(process.cwd(), "scripts", "image-processing-check");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "smart-crop-source.png"), buffer);
  await writeFile(path.join(outDir, "smart-crop-result.png"), cropped);

  // The checkerboard patch is high-stdev; a crop that favors it should have
  // a visibly higher greyscale stdev than a plain center-crop would.
  const centerCropped = await sharp(buffer)
    .resize(400, 400, { fit: "cover", position: "centre" })
    .toBuffer();
  const attentionStats = await sharp(cropped).greyscale().stats();
  const centerStats = await sharp(centerCropped).greyscale().stats();

  if (attentionStats.channels[0].stdev <= centerStats.channels[0].stdev) {
    fail(
      `smartCropToSize: expected attention-crop stdev (${attentionStats.channels[0].stdev.toFixed(1)}) > center-crop stdev (${centerStats.channels[0].stdev.toFixed(1)}) — attention strategy doesn't seem to favor the busy corner. Check scripts/image-processing-check/*.png.`
    );
  } else {
    console.log(
      `OK: smartCropToSize favors the busy corner (attention stdev ${attentionStats.channels[0].stdev.toFixed(1)} > center stdev ${centerStats.channels[0].stdev.toFixed(1)}).`
    );
  }

  const meta = await sharp(cropped).metadata();
  assert.equal(meta.width, 400);
  assert.equal(meta.height, 400);
}

function testResolutionWarning() {
  const tooSmall = checkResolutionWarning(400, 400, 1080, 1080);
  if (!tooSmall) fail("checkResolutionWarning: expected a warning for 400x400 vs target 1080x1080, got null.");
  else console.log("OK: checkResolutionWarning flags an under-resolution image.");

  const fine = checkResolutionWarning(1200, 1200, 1080, 1080);
  if (fine) fail(`checkResolutionWarning: expected null for 1200x1200 vs target 1080x1080, got "${fine}".`);
  else console.log("OK: checkResolutionWarning stays silent for a sufficiently large image.");
}

async function testBusyRegion() {
  const size = 600;
  const flatBuffer = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 120, g: 120, b: 120 } },
  })
    .png()
    .toBuffer();

  const noiseSvg = `
    <svg width="${size}" height="${size}">
      ${Array.from({ length: 30 })
        .map(() => {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          const r = Math.floor(Math.random() * 40) + 10;
          const fill = Math.random() > 0.5 ? "#000000" : "#ffffff";
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" />`;
        })
        .join("")}
    </svg>
  `;
  const busyBuffer = await sharp(Buffer.from(noiseSvg)).png().toBuffer();

  const fullRegion = { left: 0, top: 0, width: size, height: size };

  const flatIsBusy = await isRegionBusy(flatBuffer, fullRegion);
  if (flatIsBusy) fail("isRegionBusy: expected a flat grey region to read as NOT busy.");
  else console.log("OK: isRegionBusy correctly reads a flat region as not busy.");

  const busyIsBusy = await isRegionBusy(busyBuffer, fullRegion);
  if (!busyIsBusy) fail("isRegionBusy: expected a high-contrast noisy region to read as busy.");
  else console.log("OK: isRegionBusy correctly reads a noisy region as busy.");

  // A full-image region can pass even if extract() were silently ignored
  // (exactly the bug this caught once, in a sibling function — see
  // focalPoint.ts/imageAnalysis.ts's materialize-before-stats() comment) —
  // this composites ONE image with a flat top half and a noisy bottom half,
  // so only a region that's ACTUALLY cropped to the right half gives the
  // right answer.
  const splitBuffer = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 120, g: 120, b: 120 } },
  })
    .composite([{ input: busyBuffer, top: Math.floor(size / 2), left: 0 }])
    .png()
    .toBuffer();
  const topHalf = { left: 0, top: 0, width: size, height: Math.floor(size / 2) };
  const bottomHalf = { left: 0, top: Math.floor(size / 2), width: size, height: Math.floor(size / 2) };

  const topIsBusy = await isRegionBusy(splitBuffer, topHalf);
  if (topIsBusy) fail("isRegionBusy: expected the flat top half of a split image to read as NOT busy.");
  else console.log("OK: isRegionBusy correctly ignores a noisy region OUTSIDE the requested crop.");

  const bottomIsBusy = await isRegionBusy(splitBuffer, bottomHalf);
  if (!bottomIsBusy) fail("isRegionBusy: expected the noisy bottom half of a split image to read as busy.");
  else console.log("OK: isRegionBusy correctly detects a noisy region INSIDE the requested crop.");
}

async function main() {
  await testSmartCrop();
  testResolutionWarning();
  await testBusyRegion();

  if (failures > 0) {
    console.error(`\n${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nAll image-processing checks passed.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
