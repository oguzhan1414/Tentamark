import type { PlatformName } from "@/components/PlatformIcon";

// Only platforms that (a) accept a static single-image post and (b) have an
// ideal ratio meaningfully different from a generic upload — worth an
// automatic crop. TikTok/YouTube are video-only (cropping a still image
// doesn't apply to them); Telegram renders most ratios cleanly, so forcing
// a re-crop there isn't worth the extra generated file. Verified live
// against each platform's own 2026 published sizing guidance.
export const PLATFORM_IMAGE_RATIO: Partial<Record<PlatformName, number>> = {
  instagram: 4 / 5,
  facebook: 4 / 5,
  threads: 4 / 5,
  pinterest: 2 / 3,
};
