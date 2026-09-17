"use server";

import { createClient } from "@/lib/supabase/server";
import { getEmbedding } from "./embeddings";
import { vectorCentroid, cosineSimilarity } from "../statistics";

// Below this, a centroid is either undefined or too noisy to mean anything
// (e.g. 1-2 posts just IS the centroid — comparing a draft to itself isn't
// a real signal). Real minimum for a centroid-based similarity to say
// anything meaningful about "the brand's voice" as opposed to "one post".
const MIN_EMBEDDED_POSTS = 5;

function parseEmbedding(raw: unknown): number[] | null {
  if (Array.isArray(raw)) return raw.map(Number);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(Number) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export type BrandVoiceConsistency = {
  score: number; // 0-100, raw cosine similarity * 100
  sampleSize: number;
};

/*
  Real, measured brand-voice consistency — not an LLM's subjective "sounds
  on-brand" guess. Embeds every successfully published caption (see
  /api/scheduler/publish), averages them into a "voice centroid" vector, and
  scores a new draft by cosine similarity to that centroid. Returns null
  (not a fabricated number) whenever there isn't enough real history yet, or
  OPENAI_API_KEY isn't configured.
*/
export async function getBrandVoiceConsistency(
  brandId: string,
  draftText: string
): Promise<BrandVoiceConsistency | null> {
  if (!draftText.trim() || !process.env.OPENAI_API_KEY) return null;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("content_embeddings")
    .select("embedding")
    .eq("brand_id", brandId);

  // PostgREST returns pgvector columns as their text form ("[0.01,-0.02,...]"),
  // not a parsed JSON array — parse defensively either way.
  const embeddings = (rows ?? [])
    .map((r) => parseEmbedding(r.embedding))
    .filter((e): e is number[] => e !== null && e.length > 0);

  if (embeddings.length < MIN_EMBEDDED_POSTS) return null;

  try {
    const centroid = vectorCentroid(embeddings);
    const draftEmbedding = await getEmbedding(draftText);
    const similarity = cosineSimilarity(draftEmbedding, centroid);
    return {
      score: Math.round(Math.max(0, similarity) * 100),
      sampleSize: embeddings.length,
    };
  } catch (err) {
    console.error("Marka sesi tutarlılık skoru hesaplanamadı:", err instanceof Error ? err.message : err);
    return null;
  }
}
