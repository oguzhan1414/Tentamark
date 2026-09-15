import type { ImageProvider } from "./types";

// Free, keyless public proxy — no SLA, known to 429 under load. Two models
// tried in sequence: "flux" for quality, falling back to "turbo" (SDXL
// Turbo, faster/lower quality) if flux times out or is rate-limited.
const ATTEMPTS = [
  { model: "flux", timeoutMs: 35000 },
  { model: "turbo", timeoutMs: 25000 },
];

async function fetchOnce(
  prompt: string,
  model: string,
  width: number,
  height: number,
  seed: number,
  timeoutMs: number
): Promise<Buffer | null> {
  const encodedPrompt = encodeURIComponent(prompt.trim());
  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&nologo=true&seed=${seed}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // nologo=true above only actually drops the watermark for an
    // authenticated (registered, free-tier) account — verified live, an
    // anonymous request keeps the "pollinations.ai" stamp regardless of
    // that param. Falls back to the old anonymous behavior if the token
    // isn't configured, rather than failing outright.
    const token = process.env.POLLINATIONS_API_TOKEN;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "image/jpeg,image/png,image/*",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    clearTimeout(timeoutId);

    if (res.status === 429) {
      console.warn(`Pollinations ${model} returned 429, waiting 2.5s before fallback...`);
      await new Promise((r) => setTimeout(r, 2500));
      return null;
    }
    if (!res.ok) {
      console.warn(`Pollinations ${model} returned HTTP ${res.status}, trying fallback...`);
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    return buffer.byteLength > 1000 ? buffer : null;
  } catch (err) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === "AbortError";
    console.warn(`Pollinations ${model} ${isAbort ? "timed out" : "failed"}:`, err instanceof Error ? err.message : err);
    throw isAbort
      ? new Error(`Görsel üretimi zaman aşımına uğradı (${model}).`)
      : err instanceof Error
        ? err
        : new Error(String(err));
  }
}

export const pollinationsProvider: ImageProvider = {
  name: "pollinations",
  async generate(prompt, options = {}) {
    const { width = 1024, height = 1024, seed = Math.floor(Math.random() * 1000000) } = options;

    let lastError: Error | null = null;
    for (let i = 0; i < ATTEMPTS.length; i++) {
      const attempt = ATTEMPTS[i];
      try {
        const buffer = await fetchOnce(prompt, attempt.model, width, height, seed, attempt.timeoutMs);
        if (buffer) return { buffer, contentType: "image/jpeg" };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
      if (i < ATTEMPTS.length - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    throw lastError ?? new Error("Görsel sunucusu şu an yoğun. Lütfen birkaç saniye sonra tekrar deneyin.");
  },
};
