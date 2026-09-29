import assert from "node:assert/strict";
import sharp from "sharp";
import { estimateFocalOffset } from "../src/lib/media/focalPoint";
import { classifySilentWindows } from "../src/lib/media/silenceDetection";
import { planScenes } from "../src/lib/video/scenePlan";

let failures = 0;

function fail(message: string) {
  console.error(`FAIL: ${message}`);
  failures++;
}

async function testFocalOffset() {
  // Same checkerboard-corner technique as verify-image-processing.ts: a wide
  // poster with a high-contrast patch tucked in the far right — cropping it
  // to a vertical (9:16) target should pull the crop window toward that
  // side rather than staying centered.
  const width = 1600;
  const height = 900;
  const patch = 220;
  const svg = `
    <svg width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="#808080" />
      ${Array.from({ length: 10 })
        .map((_, row) =>
          Array.from({ length: 10 })
            .map((_, col) => {
              const x = width - patch + col * (patch / 10);
              const y = (height - patch) / 2 + row * (patch / 10);
              const fill = (row + col) % 2 === 0 ? "#000000" : "#ffffff";
              return `<rect x="${x}" y="${y}" width="${patch / 10}" height="${patch / 10}" fill="${fill}" />`;
            })
            .join("")
        )
        .join("")}
    </svg>
  `;
  const posterBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

  const focal = await estimateFocalOffset(posterBuffer, 9 / 16);
  const xPercent = Number(focal.objectPositionX.replace("%", ""));
  if (xPercent <= 60) {
    fail(`estimateFocalOffset: expected objectPositionX to skew right (>60%) toward the busy corner, got ${focal.objectPositionX}.`);
  } else {
    console.log(`OK: estimateFocalOffset skews toward the busy corner (objectPositionX=${focal.objectPositionX}).`);
  }

  // A same-aspect poster shouldn't get a skewed offset — nothing to crop.
  const squareBuffer = await sharp({ create: { width: 800, height: 800, channels: 3, background: { r: 128, g: 128, b: 128 } } })
    .png()
    .toBuffer();
  const centered = await estimateFocalOffset(squareBuffer, 1);
  assert.equal(centered.objectPositionX, "50%");
  assert.equal(centered.objectPositionY, "50%");
  console.log("OK: estimateFocalOffset stays centered when source/target aspect already match.");
}

function testSilenceClassifier() {
  const windowSeconds = 0.5;
  // loud, loud, quiet, quiet, quiet, loud, quiet
  const rms = [0.5, 0.4, 0.001, 0.0005, 0.002, 0.6, 0.0008];
  const windows = classifySilentWindows(rms, windowSeconds, -40);

  assert.equal(windows.length, 2, `expected 2 silent runs, got ${windows.length}`);
  assert.deepEqual(windows[0], { startSeconds: 1, endSeconds: 2.5 });
  assert.deepEqual(windows[1], { startSeconds: 3, endSeconds: 3.5 });
  console.log("OK: classifySilentWindows groups consecutive quiet windows into correct ranges.");

  const allLoud = classifySilentWindows([0.5, 0.6, 0.4], windowSeconds, -40);
  assert.equal(allLoud.length, 0);
  console.log("OK: classifySilentWindows returns no ranges when nothing is quiet.");
}

function testUserClipRecipe() {
  const planned = planScenes({
    durationSeconds: 15,
    imageCount: 0,
    seed: "test-user-upload",
    sourceType: "user_upload",
  });
  assert.equal(planned.recipeId, "user_clip_reel");
  const archetypes = planned.slots.map((s) => s.archetype);
  assert.deepEqual(archetypes, ["hook", "user_clip", "outro"]);
  console.log("OK: planScenes({sourceType:\"user_upload\"}) always resolves to [hook, user_clip, outro].");
}

async function main() {
  await testFocalOffset();
  testSilenceClassifier();
  testUserClipRecipe();

  if (failures > 0) {
    console.error(`\n${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("\nAll video-upload checks passed.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
