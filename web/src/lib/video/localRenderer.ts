import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { RenderExecutor, RenderExecutorResult } from "./renderExecutor";

const ENTRY_POINT = path.resolve(process.cwd(), "remotion", "index.ts");
const COMPOSITION_ID = "TentamarkBrandVideo";

// Bundling the Remotion project is the slow part (webpack) but the output
// doesn't change between renders (only inputProps do) — bundle once per
// server process, not once per job.
let bundleLocationPromise: Promise<string> | null = null;
function getBundleLocation(): Promise<string> {
  if (!bundleLocationPromise) {
    bundleLocationPromise = bundle({
      entryPoint: ENTRY_POINT,
      publicDir: path.resolve(process.cwd(), "public"),
      onProgress: () => {},
    });
  }
  return bundleLocationPromise;
}

// Single-flight guard: this runs on the founder's own machine for now, and a
// second concurrent render would launch a second headless-Chromium instance
// on top of the first. Queue rather than race — deleted wholesale once
// Lambda (which manages its own concurrency) replaces this executor.
let inFlight: Promise<RenderExecutorResult> | null = null;

export const localRenderer: RenderExecutor = async (inputProps) => {
  while (inFlight) {
    await inFlight.catch(() => undefined);
  }

  const run = (async (): Promise<RenderExecutorResult> => {
    const serveUrl = await getBundleLocation();
    const composition = await selectComposition({ serveUrl, id: COMPOSITION_ID, inputProps });

    const outputLocation = path.join(os.tmpdir(), `tentamark-video-${randomUUID()}.mp4`);
    await renderMedia({
      serveUrl,
      composition,
      codec: "h264",
      outputLocation,
      inputProps,
    });

    return {
      filePath: outputLocation,
      width: composition.width,
      height: composition.height,
      durationInFrames: composition.durationInFrames,
      fps: composition.fps,
    };
  })();

  inFlight = run;
  try {
    return await run;
  } finally {
    inFlight = null;
  }
};
