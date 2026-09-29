import { withBrowserPage } from "./browserPool";

export type ImageDimensions = { width: number; height: number };

// The one shared Playwright entry point every card template renders
// through — a template file only ever needs to produce an HTML string; it
// never touches the browser itself. Launches a fresh local Chromium per
// call. browserPool.ts owns the shared Chromium lifecycle, concurrency cap,
// timeout and one controlled reconnect attempt.
// cardEffects.ts's hand-drawn/highlight reveals are real CSS animations
// (needed for the animated-clip render path in renderHtmlToClip.ts) that
// start playing the instant the page loads. A plain screenshot taken any
// time after that would otherwise catch them mid-draw at a race-dependent
// point — jumping every animation straight to its fill-mode:forwards end
// state makes static PNG output deterministic again (always "fully
// revealed"), matching how these cards looked before animation existed.
async function settleAnimations(page: import("playwright").Page): Promise<void> {
  await page.evaluate(() =>
    document.getAnimations().forEach((a) => {
      // Animation.finish() throws for infinite-iteration effects (e.g. an
      // ambient background drift) — those have no "end" to jump to, so
      // leave them running; whatever point they're at still looks fine in
      // a still frame, unlike a highlight/draw-in caught mid-reveal.
      try {
        a.finish();
      } catch {
        // ignore
      }
    })
  );
}

export async function renderHtmlToImage(html: string, dimensions: ImageDimensions): Promise<Buffer> {
  return withBrowserPage(dimensions, async (page) => {
    await page.setContent(html, { waitUntil: "networkidle" });
    await settleAnimations(page);
    return await page.screenshot({ type: "png" });
  });
}

// For a connected SET of images (a carousel) — one Chromium launch shared
// across every slide instead of one per slide, since a fresh browser
// process per image is the most expensive part of a single render by far.
export async function renderHtmlSetToImages(
  items: { html: string; dimensions: ImageDimensions }[]
): Promise<Buffer[]> {
  const buffers: Buffer[] = [];
  for (const item of items) {
    buffers.push(
      await withBrowserPage(item.dimensions, async (page) => {
      await page.setContent(item.html, { waitUntil: "networkidle" });
      await settleAnimations(page);
        return page.screenshot({ type: "png" });
      })
    );
  }
  return buffers;
}
