import { chromium, type Browser, type Page } from "playwright";
import { existsSync } from "node:fs";
import type { ImageDimensions } from "./renderHtmlToImage";

const MAX_CONCURRENCY = Math.max(1, Number(process.env.IMAGE_RENDER_CONCURRENCY ?? 2));
const PAGE_TIMEOUT_MS = Math.max(5_000, Number(process.env.IMAGE_RENDER_TIMEOUT_MS ?? 45_000));

let browserPromise: Promise<Browser> | null = null;
let active = 0;
const waiters: Array<() => void> = [];

function executablePath(): string | undefined {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
  if (configured && existsSync(configured)) return configured;
  const systemCandidates = process.platform === "win32"
    ? [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
        "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      ]
    : [];
  return systemCandidates.find((candidate) => existsSync(candidate));
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({ executablePath: executablePath() });
    browserPromise.then((browser) => browser.on("disconnected", () => (browserPromise = null))).catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

async function acquire(): Promise<() => void> {
  if (active >= MAX_CONCURRENCY) await new Promise<void>((resolve) => waiters.push(resolve));
  active += 1;
  return () => {
    active -= 1;
    waiters.shift()?.();
  };
}

export async function withBrowserPage<T>(
  dimensions: ImageDimensions,
  operation: (page: Page) => Promise<T>
): Promise<T> {
  const release = await acquire();
  try {
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      const browser = await getBrowser();
      const context = await browser.newContext({ viewport: dimensions });
      const page = await context.newPage();
      page.setDefaultTimeout(PAGE_TIMEOUT_MS);
      page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MS);
      try {
        return await operation(page);
      } catch (error) {
        lastError = error;
        const disconnected = !browser.isConnected();
        if (!disconnected || attempt === 1) throw error;
        browserPromise = null;
      } finally {
        await context.close().catch(() => undefined);
      }
    }
    throw lastError;
  } finally {
    release();
  }
}

export async function closeBrowserPool(): Promise<void> {
  const current = browserPromise;
  browserPromise = null;
  if (current) await (await current).close().catch(() => undefined);
}
