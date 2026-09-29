import { noise2D } from "@remotion/noise";

// Perlin-noise-driven drift instead of Math.sin(frame / N) — a sine wave
// repeats exactly every cycle and starts reading as mechanical once you
// watch more than one loop of it; noise2D never exactly repeats, so
// floating/drifting elements (background orbs, card hover-float) feel
// organic instead of visibly looping. Pulses/heartbeats stay on Math.sin on
// purpose elsewhere — a "pulse" is SUPPOSED to feel regular, only positional
// drift benefits from irregularity.
export function organicDrift(seed: string, frame: number, frequency: number, amplitude: number): number {
  return noise2D(seed, frame * frequency, 0) * amplitude;
}
