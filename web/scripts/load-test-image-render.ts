import { performance } from "node:perf_hooks";
import { closeBrowserPool } from "../src/lib/cards/browserPool";
import { renderHtmlToImage } from "../src/lib/cards/renderHtmlToImage";

async function main() {
  const jobs = Math.max(1, Number(process.argv[2] ?? 12));
  const started = performance.now();
  const durations: number[] = [];

  try {
    await Promise.all(
      Array.from({ length: jobs }, async (_, index) => {
        const jobStarted = performance.now();
        const image = await renderHtmlToImage(
          `<html><body style="margin:0;width:100vw;height:100vh;background:#172b46;color:white;display:grid;place-items:center;font:700 48px sans-serif">Render ${index + 1}</body></html>`,
          { width: 540, height: 540 }
        );
        if (image.byteLength < 1_000) throw new Error(`Render ${index + 1} boş çıktı üretti.`);
        durations.push(performance.now() - jobStarted);
      })
    );
  } finally {
    await closeBrowserPool();
  }

  durations.sort((a, b) => a - b);
  const p95 = durations[Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1)];
  console.log(JSON.stringify({ jobs, totalMs: Math.round(performance.now() - started), p95Ms: Math.round(p95) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
