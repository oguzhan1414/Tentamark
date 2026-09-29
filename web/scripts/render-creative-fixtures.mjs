import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import sharp from "sharp";

const root = process.cwd();
const updateMode = process.argv.includes("--update");

const ENTRY_POINT = path.join(root, "remotion", "index.ts");
const PUBLIC_DIR = path.join(root, "public");
const COMPOSITION_ID = "TentamarkBrandVideo";
const FIXTURES_DIR = path.join(root, "remotion", "fixtures");
const SNAPSHOTS_DIR = path.join(FIXTURES_DIR, "__snapshots__");

// Must match web/remotion/theme.ts's transitionFrames exactly — this script
// re-derives each scene's start frame from the fixture JSON without
// bundling src/lib/video/scenePlan.ts, so the constant is duplicated here.
const TRANSITION_FRAMES = 15;

// Anti-aliasing/font-hinting can nudge a handful of soft-edge pixels between
// otherwise-identical renders on different machines. These thresholds absorb
// that noise without masking a real layout regression, which differs by far
// more than a few edge pixels.
const PIXEL_DELTA_THRESHOLD = 12; // per channel, 0-255
// Found live: baselines regenerated on Windows, checked against CI's Ubuntu
// Chromium headless-shell build, showed up to ~2% diff on frames with zero
// actual design change (font hinting/anti-aliasing only) — 0.002 was
// calibrated too tight for that real a cross-OS gap. A genuine layout/design
// regression measures in the tens of percent (confirmed: this session's
// actual visual redesign hit 12-65% before baselines were updated for it),
// so 0.03 still catches real regressions with a wide margin while absorbing
// legitimate cross-machine rendering noise.
const MAX_DIFF_RATIO = 0.03; // fraction of pixels allowed to exceed the delta

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

// Mirrors web/remotion/Main.tsx's TransitionSeries layout: every cut
// overlaps by TRANSITION_FRAMES (shortening the timeline) except the cut
// into the final (outro) scene, which is a light-leak Overlay and does not
// shorten it. web/src/lib/video/scenePlan.ts's getRenderedDurationInFrames
// applies the same rule to the total; this applies it per scene so each
// scene's true on-screen frame range can be located.
function computeSceneStartFrames(scenePlan) {
  const lightLeakCutIndex = scenePlan.length - 2;
  const starts = [0];
  for (let i = 1; i < scenePlan.length; i++) {
    const cutIndex = i - 1;
    const shortens = cutIndex !== lightLeakCutIndex;
    starts.push(starts[i - 1] + scenePlan[i - 1].frames - (shortens ? TRANSITION_FRAMES : 0));
  }
  return starts;
}

async function toRawPng(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function diffAgainstBaseline(baselineBuffer, actualBuffer) {
  const baseline = await toRawPng(baselineBuffer);
  const actual = await toRawPng(actualBuffer);
  if (baseline.width !== actual.width || baseline.height !== actual.height) {
    return { matches: false, reason: `size ${actual.width}x${actual.height} vs baseline ${baseline.width}x${baseline.height}` };
  }

  let diffPixels = 0;
  const totalPixels = baseline.width * baseline.height;
  for (let i = 0; i < baseline.data.length; i += 4) {
    const dr = Math.abs(baseline.data[i] - actual.data[i]);
    const dg = Math.abs(baseline.data[i + 1] - actual.data[i + 1]);
    const db = Math.abs(baseline.data[i + 2] - actual.data[i + 2]);
    const da = Math.abs(baseline.data[i + 3] - actual.data[i + 3]);
    if (dr > PIXEL_DELTA_THRESHOLD || dg > PIXEL_DELTA_THRESHOLD || db > PIXEL_DELTA_THRESHOLD || da > PIXEL_DELTA_THRESHOLD) {
      diffPixels++;
    }
  }

  const ratio = diffPixels / totalPixels;
  if (ratio > MAX_DIFF_RATIO) {
    return { matches: false, reason: `${(ratio * 100).toFixed(2)}% of pixels differ (limit ${(MAX_DIFF_RATIO * 100).toFixed(2)}%)` };
  }
  return { matches: true };
}

async function main() {
  const fixtureFiles = (await readdir(FIXTURES_DIR)).filter((file) => file.endsWith(".json")).sort();
  if (fixtureFiles.length === 0) {
    console.error("ERROR: no fixture JSON files found in remotion/fixtures/");
    process.exitCode = 1;
    return;
  }

  console.log("Bundling Remotion project...");
  const serveUrl = await bundle({ entryPoint: ENTRY_POINT, publicDir: PUBLIC_DIR, onProgress: () => {} });
  const browser = await openBrowser("chrome");

  const failures = [];
  let checkedCount = 0;
  let createdOrUpdatedCount = 0;

  try {
    for (const fixtureFile of fixtureFiles) {
      const fixtureName = fixtureFile.replace(/\.json$/, "");
      const inputProps = JSON.parse(await readFile(path.join(FIXTURES_DIR, fixtureFile), "utf8"));
      const scenePlan = Array.isArray(inputProps.scenePlan) ? inputProps.scenePlan : [];
      if (scenePlan.length === 0) {
        failures.push(`${fixtureFile}: scenePlan is empty`);
        continue;
      }

      const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });
      const sceneStarts = computeSceneStartFrames(scenePlan);
      const snapshotDir = path.join(SNAPSHOTS_DIR, fixtureName);
      await mkdir(snapshotDir, { recursive: true });

      for (let i = 0; i < scenePlan.length; i++) {
        const scene = scenePlan[i];
        const midFrame = Math.max(
          0,
          Math.min(sceneStarts[i] + Math.floor(scene.frames / 2), composition.durationInFrames - 1)
        );
        const snapshotName = `${String(i).padStart(2, "0")}-${scene.archetype}.png`;
        const baselinePath = path.join(snapshotDir, snapshotName);
        const actualPath = path.join(snapshotDir, snapshotName.replace(/\.png$/, ".actual.png"));

        const { buffer } = await renderStill({
          serveUrl,
          composition,
          output: null,
          frame: midFrame,
          inputProps,
          imageFormat: "png",
          puppeteerInstance: browser,
        });
        checkedCount++;

        const baselineMissing = !(await pathExists(baselinePath));
        if (updateMode || baselineMissing) {
          await writeFile(baselinePath, buffer);
          await rm(actualPath, { force: true });
          createdOrUpdatedCount++;
          console.log(`${baselineMissing ? "CREATED" : "UPDATED"}: ${fixtureName}/${snapshotName} (frame ${midFrame})`);
          continue;
        }

        const baselineBuffer = await readFile(baselinePath);
        const result = await diffAgainstBaseline(baselineBuffer, buffer);
        if (result.matches) {
          await rm(actualPath, { force: true });
          console.log(`OK: ${fixtureName}/${snapshotName} (frame ${midFrame})`);
        } else {
          await writeFile(actualPath, buffer);
          failures.push(`${fixtureName}/${snapshotName}: ${result.reason}`);
          console.error(`MISMATCH: ${fixtureName}/${snapshotName} (frame ${midFrame}) -> ${result.reason}`);
        }
      }
    }
  } finally {
    await browser.close({ silent: true });
  }

  console.log("");
  console.log(`Checked ${checkedCount} scene snapshot(s) across ${fixtureFiles.length} fixture(s).`);
  if (createdOrUpdatedCount > 0) {
    console.log(`Wrote ${createdOrUpdatedCount} baseline snapshot(s) (${updateMode ? "explicit --update" : "no prior baseline"}).`);
  }
  if (!updateMode && failures.length > 0) {
    console.error(`${failures.length} snapshot mismatch(es):`);
    failures.forEach((failure) => console.error(`  - ${failure}`));
    process.exitCode = 1;
  } else if (failures.length === 0) {
    console.log("All snapshots match their baseline.");
  }
}

await main();
