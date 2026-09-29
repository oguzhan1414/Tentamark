import type { Caption } from "@remotion/captions";

// Groq hosts Whisper via an OpenAI-compatible endpoint, same host+prefix
// groqModel.ts already calls for chat completions. Confirmed live (smoke-
// tested against a real audio file): response includes both `duration`
// (seconds, float) and `words: [{word,start,end}]` (seconds) when word-level
// granularity is requested — one call gives everything generateVoiceover.ts
// needs, no separate duration-probing step.
export const WHISPER_MODEL = "whisper-large-v3";

export type TranscriptionResult = { durationSeconds: number; captions: Caption[] };

type WhisperWord = { word: string; start: number; end: number };

// Pure and decode-independent — kept separate from the real API call so it's
// unit-testable with plain arrays, same split as silenceDetection.ts's
// classifySilentWindows()/detectSilence(). Per @remotion/captions' own
// display-captions guidance, each word's `text` needs a leading space so
// concatenating tokens reproduces natural sentence spacing under
// `whiteSpace: "pre"` — except the very first word, which would otherwise
// start the sentence with a stray space.
export function wordsToCaptions(words: WhisperWord[]): Caption[] {
  return words.map((w, i) => ({
    text: i === 0 ? w.word : ` ${w.word}`,
    startMs: Math.round(w.start * 1000),
    endMs: Math.round(w.end * 1000),
    timestampMs: null,
    confidence: null,
  }));
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY tanımlı değil.");
  }

  const form = new FormData();
  // new Uint8Array(buffer) copies into a fresh, non-shared ArrayBuffer —
  // Buffer's own .buffer is typed ArrayBufferLike (could be SharedArrayBuffer),
  // which TS's BlobPart type doesn't accept directly.
  form.append("file", new Blob([new Uint8Array(audioBuffer)], { type: "audio/mpeg" }), "voiceover.mp3");
  form.append("model", WHISPER_MODEL);
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Groq Whisper isteği zaman aşımına uğradı (30sn).");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Groq Whisper hatası (HTTP ${res.status})`);
  }

  const words: WhisperWord[] = Array.isArray(json.words) ? json.words : [];
  if (words.length === 0) {
    throw new Error("Transkripsiyon sonucu kelime zamanlaması içermiyor.");
  }

  return {
    durationSeconds: Number(json.duration) || words[words.length - 1].end,
    captions: wordsToCaptions(words),
  };
}

// $ per second of audio — verified against Groq's published whisper-large-v3
// pricing ($0.111/hour = $0.111/3600s). Update if Groq reprices.
const WHISPER_PRICE_PER_SECOND = 0.111 / 3600;

export function estimateGroqWhisperCost(durationSeconds: number): number {
  return durationSeconds * WHISPER_PRICE_PER_SECOND;
}
