import type { PlatformName } from "@/components/PlatformIcon";

/*
  Single source of truth for per-platform caption length — was previously
  only a cosmetic counter in ComposeForm.tsx (CHAR_LIMIT), never enforced
  anywhere, and using .length (UTF-16 code units) for every platform
  regardless of how that platform's own API actually measures the limit.
  Found live: a Bluesky post at 403 graphemes (its real API limit is 300
  graphemes) sailed through compose, approval and scheduling, then
  retry-looped at publish time with a cryptic platform error and no
  user-facing explanation. Every provider below maps 1:1 to registry.ts's
  getProviderFor — the remaining PlatformName values (linkedin, x,
  woocommerce, shopify, google-business, discord, whatsapp, canva) have no
  live connector yet, so their numbers stay informational-only (compose
  counter) with no server-side enforcement possible.

  Units genuinely differ per platform and a plain .length check silently
  mismeasures several of them:
    - utf16:       JS .length is already correct (Telegram, TikTok)
    - bytes:       UTF-8 byte length, not .length (YouTube description,
                    Threads — both documented as byte/UTF-8-sensitive)
    - codepoints:  [...text].length, not .length (Pinterest, per its
                    published OpenAPI schema's maxLength semantics)
    - graphemes:   Intl.Segmenter grapheme count (Bluesky — this is the
                    exact unit its own API error message uses)
  instagram/facebook's real limits are either unspecified (Instagram) or
  entirely undocumented (Facebook) — utf16 is the conservative default.
*/
export type CaptionUnit = "utf16" | "bytes" | "codepoints" | "graphemes";

export const CAPTION_LIMITS: Record<PlatformName, { limit: number; unit: CaptionUnit }> = {
  instagram: { limit: 2200, unit: "utf16" },
  facebook: { limit: 500, unit: "utf16" },
  linkedin: { limit: 3000, unit: "utf16" },
  tiktok: { limit: 2200, unit: "utf16" },
  youtube: { limit: 5000, unit: "bytes" },
  x: { limit: 280, unit: "utf16" },
  pinterest: { limit: 800, unit: "codepoints" },
  threads: { limit: 500, unit: "bytes" },
  telegram: { limit: 1024, unit: "utf16" },
  bluesky: { limit: 300, unit: "graphemes" },
  woocommerce: { limit: 2000, unit: "utf16" },
  shopify: { limit: 2000, unit: "utf16" },
  "google-business": { limit: 1500, unit: "utf16" },
  discord: { limit: 2000, unit: "utf16" },
  whatsapp: { limit: 1024, unit: "utf16" },
  canva: { limit: 1000, unit: "utf16" },
};

export function countCaptionLength(text: string, unit: CaptionUnit): number {
  switch (unit) {
    case "bytes":
      return new TextEncoder().encode(text).length;
    case "codepoints":
      return [...text].length;
    case "graphemes": {
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
        return [...segmenter.segment(text)].length;
      }
      return [...text].length; // close approximation where Segmenter is unavailable
    }
    case "utf16":
    default:
      return text.length;
  }
}

export type CaptionLimitCheck = { valid: boolean; count: number; limit: number; unit: CaptionUnit; reason?: string };

export function checkCaptionLimit(platform: PlatformName, text: string): CaptionLimitCheck {
  const { limit, unit } = CAPTION_LIMITS[platform] ?? { limit: 2000, unit: "utf16" as CaptionUnit };
  const count = countCaptionLength(text, unit);
  return {
    valid: count <= limit,
    count,
    limit,
    unit,
    reason: count > limit ? `Metin ${limit} karakter sınırını aşıyor (şu an ${count}).` : undefined,
  };
}
