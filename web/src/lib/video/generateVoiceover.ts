import { randomUUID } from "crypto";
import type { Caption } from "@remotion/captions";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateVoiceoverAudio, estimateOpenAiTtsCost, TTS_MODEL } from "@/lib/ai/ttsProvider";
import { transcribeAudio, estimateGroqWhisperCost, WHISPER_MODEL } from "@/lib/ai/transcribeAudio";
import type { OpenAIVoice } from "./types";

type AdminClient = ReturnType<typeof createAdminClient>;

export type VoiceoverOutcome = { audioUrl: string; durationSeconds: number; captions: Caption[] };

/*
  Orchestrates TTS + transcription for one render job's voice-over script.
  Best-effort by design (mirrors generateSceneCopy()'s try/catch-and-log,
  ingestRemoteImage()'s silent-null-on-failure): returns null on ANY failure
  rather than throwing, so a voice-over hiccup never fails the whole video
  render — the caller just proceeds without narration/captions/ducking.

  Deliberately does NOT insert a `media` table row for the generated mp3 —
  only the Storage object, so Remotion's renderer has a fetchable URL. This
  is a transient render input (like the static preset background videos),
  not something that belongs in the brand's browsable media library.
*/
export async function generateVoiceover(
  script: string,
  voice: OpenAIVoice,
  brandId: string,
  admin: AdminClient
): Promise<VoiceoverOutcome | null> {
  const ttsStartedAt = Date.now();
  let tts: { audioBuffer: Buffer; contentType: "audio/mpeg" };
  try {
    tts = await generateVoiceoverAudio(script, voice);
    await admin.from("ai_runs").insert({
      brand_id: brandId,
      stage: "video_voiceover_tts",
      prompt_version: "video-v1",
      model: TTS_MODEL,
      input_tokens: script.length, // character count, not tokens — TTS bills per character
      output_tokens: 0,
      cost_estimate_usd: estimateOpenAiTtsCost(script.length),
      latency_ms: Date.now() - ttsStartedAt,
      status: "SUCCESS",
      error: null,
    });
  } catch (err) {
    await admin.from("ai_runs").insert({
      brand_id: brandId,
      stage: "video_voiceover_tts",
      prompt_version: "video-v1",
      model: TTS_MODEL,
      input_tokens: script.length,
      output_tokens: 0,
      cost_estimate_usd: 0,
      latency_ms: Date.now() - ttsStartedAt,
      status: "ERROR",
      error: err instanceof Error ? err.message : "Bilinmeyen hata",
    });
    return null;
  }

  const path = `${brandId}/${randomUUID()}-voiceover.mp3`;
  const { error: uploadError } = await admin.storage.from("media").upload(path, tts.audioBuffer, {
    contentType: tts.contentType,
    upsert: false,
  });
  if (uploadError) return null;

  const { data: publicUrl } = admin.storage.from("media").getPublicUrl(path);

  const transcribeStartedAt = Date.now();
  try {
    const transcription = await transcribeAudio(tts.audioBuffer);
    await admin.from("ai_runs").insert({
      brand_id: brandId,
      stage: "video_voiceover_transcribe",
      prompt_version: "video-v1",
      model: WHISPER_MODEL,
      input_tokens: 0,
      output_tokens: 0,
      cost_estimate_usd: estimateGroqWhisperCost(transcription.durationSeconds),
      latency_ms: Date.now() - transcribeStartedAt,
      status: "SUCCESS",
      error: null,
    });
    return {
      audioUrl: publicUrl.publicUrl,
      durationSeconds: transcription.durationSeconds,
      captions: transcription.captions,
    };
  } catch (err) {
    await admin.from("ai_runs").insert({
      brand_id: brandId,
      stage: "video_voiceover_transcribe",
      prompt_version: "video-v1",
      model: WHISPER_MODEL,
      input_tokens: 0,
      output_tokens: 0,
      cost_estimate_usd: 0,
      latency_ms: Date.now() - transcribeStartedAt,
      status: "ERROR",
      error: err instanceof Error ? err.message : "Bilinmeyen hata",
    });
    // Transcription failing after a successful TTS call means we'd have
    // audio with no real duration/timing — discarding the whole voiceover
    // (rather than keeping the audio without captions/rescale) protects the
    // "ses, sahne ve altyazı senkron" acceptance bar; the user can resubmit.
    return null;
  }
}
