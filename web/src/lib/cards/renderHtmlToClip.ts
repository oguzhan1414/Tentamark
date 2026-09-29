import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { ImageDimensions } from "./renderHtmlToImage";
import { withBrowserPage } from "./browserPool";

export type ClipOptions = {
  fps?: number;
  durationSeconds?: number;
};

// Renders a card's CSS animations (see cardEffects.ts's handDraw/
// markerReveal, and any per-template ambient motion like quote/aurora.ts's
// orbDrift) to a short MP4 instead of a single PNG. Deliberately does NOT
// rely on Playwright's own screen-recording (defaults to WEBM, and captures
// real wall-clock playback with no control over exact frame timing) — every
// animation on the page is paused right after load, then scrubbed via the
// Web Animations API's currentTime one exact frame at a time, so the output
// is frame-accurate and independent of how fast this machine can screenshot.
export async function renderHtmlToClip(
  html: string,
  dimensions: ImageDimensions,
  options: ClipOptions = {}
): Promise<Buffer> {
  const fps = options.fps ?? 30;
  const durationSeconds = options.durationSeconds ?? 3;
  const totalFrames = Math.max(1, Math.round(fps * durationSeconds));

  const frameDir = await mkdtemp(path.join(tmpdir(), "card-clip-"));
  try {
    await withBrowserPage(dimensions, async (page) => {
      await page.setContent(html, { waitUntil: "networkidle" });

      await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));

      for (let i = 0; i < totalFrames; i++) {
        const timeMs = (i / fps) * 1000;
        await page.evaluate((t) => {
          document.getAnimations().forEach((a) => {
            a.currentTime = t;
          });
        }, timeMs);
        const framePath = path.join(frameDir, `frame-${String(i).padStart(5, "0")}.png`);
        await page.screenshot({ path: framePath });
      }
    });

    const outputPath = path.join(frameDir, "clip.mp4");
    await encodeFramesToMp4(frameDir, fps, outputPath);
    return await readFile(outputPath);
  } finally {
    await rm(frameDir, { recursive: true, force: true });
  }
}

function encodeFramesToMp4(frameDir: string, fps: number, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", [
      "-y",
      "-framerate", String(fps),
      "-i", path.join(frameDir, "frame-%05d.png"),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-crf", "18",
      "-preset", "medium",
      "-movflags", "+faststart",
      outputPath,
    ]);
    let stderr = "";
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-2000)}`));
    });
  });
}
