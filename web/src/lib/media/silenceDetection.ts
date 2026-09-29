export type SilentWindow = { startSeconds: number; endSeconds: number };

const DEFAULT_WINDOW_SECONDS = 0.5;
const DEFAULT_THRESHOLD_DB = -40;

// Pure, decode-independent — takes an already-computed per-window RMS
// amplitude profile and groups consecutive quiet windows into ranges. Kept
// separate from detectSilence() (the real Web Audio decode) so this can be
// unit-tested with plain arrays, no browser/audio file involved.
export function classifySilentWindows(
  rmsValues: number[],
  windowSeconds: number = DEFAULT_WINDOW_SECONDS,
  thresholdDb: number = DEFAULT_THRESHOLD_DB
): SilentWindow[] {
  const thresholdAmplitude = Math.pow(10, thresholdDb / 20);
  const windows: SilentWindow[] = [];
  let runStart: number | null = null;
  for (let i = 0; i <= rmsValues.length; i++) {
    const isSilent = i < rmsValues.length && rmsValues[i] < thresholdAmplitude;
    if (isSilent && runStart === null) {
      runStart = i;
    } else if (!isSilent && runStart !== null) {
      windows.push({ startSeconds: runStart * windowSeconds, endSeconds: i * windowSeconds });
      runStart = null;
    }
  }
  return windows;
}

// Real decode path — browser-only (Web Audio API's native decodeAudioData,
// not ffmpeg/mediabunny; see Faz 4 plan notes on why this only works
// client-side). Best-effort progressive enhancement: returns null instead of
// throwing on any failure (unsupported codec, no AudioContext, corrupt
// file) so callers can treat this as purely advisory, never blocking.
export async function detectSilence(
  source: File | string,
  windowSeconds: number = DEFAULT_WINDOW_SECONDS,
  thresholdDb: number = DEFAULT_THRESHOLD_DB
): Promise<SilentWindow[] | null> {
  try {
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;

    const ctx = new AudioContextCtor();
    try {
      const arrayBuffer = typeof source === "string" ? await (await fetch(source)).arrayBuffer() : await source.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const sampleRate = audioBuffer.sampleRate;
      const windowSize = Math.max(1, Math.round(windowSeconds * sampleRate));
      const channelData = audioBuffer.getChannelData(0);

      const rmsValues: number[] = [];
      for (let start = 0; start < channelData.length; start += windowSize) {
        const end = Math.min(start + windowSize, channelData.length);
        let sumSquares = 0;
        for (let i = start; i < end; i++) sumSquares += channelData[i] * channelData[i];
        rmsValues.push(Math.sqrt(sumSquares / (end - start)));
      }
      return classifySilentWindows(rmsValues, windowSeconds, thresholdDb);
    } finally {
      await ctx.close();
    }
  } catch {
    return null;
  }
}
