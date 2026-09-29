import type { OpenAIVoice } from "@/lib/video/types";

// Same provider embeddings.ts already uses (OPENAI_API_KEY) — tts-1 chosen
// over tts-1-hd for the video voice-over path since render turnaround time
// matters more here than the marginal quality gain, and captions/ducking
// downstream don't benefit from the hi-fi encode.
export const TTS_MODEL = "tts-1";

export type TtsAudioResult = { audioBuffer: Buffer; contentType: "audio/mpeg" };

export async function generateVoiceoverAudio(script: string, voice: OpenAIVoice): Promise<TtsAudioResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY tanımlı değil.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: TTS_MODEL,
        voice,
        input: script,
        response_format: "mp3",
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("OpenAI TTS isteği zaman aşımına uğradı (30sn).");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    // Error responses are JSON even though a success response is raw audio.
    const json = await res.json().catch(() => null);
    throw new Error(json?.error?.message ?? `OpenAI TTS hatası (HTTP ${res.status})`);
  }

  const audioBuffer = Buffer.from(await res.arrayBuffer());
  return { audioBuffer, contentType: "audio/mpeg" };
}

// $ per 1M characters — verified against OpenAI's published tts-1 pricing
// ($15/1M chars). Used to compute ai_runs.cost_estimate_usd; update if
// OpenAI reprices. Character count (not tokens) is the real billing unit
// for TTS, unlike callGroq's token-based estimateGroqCost.
const TTS_PRICE_PER_MILLION_CHARS = 15;

export function estimateOpenAiTtsCost(characterCount: number): number {
  return (characterCount / 1_000_000) * TTS_PRICE_PER_MILLION_CHARS;
}
