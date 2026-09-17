// Verified live against the real Groq /models endpoint, not docs — Groq's
// catalog turns over fast and llama-3.3-70b-versatile (what the docs listed)
// had already been removed by the time this was tested.
export const MODEL = "openai/gpt-oss-120b";

// Same family, smaller — for callsites that don't need deep brand/strategy
// reasoning (short rewrites, classification, templating pre-computed
// numbers into a sentence). Confirmed live against /v1/models (2026-09-16)
// and smoke-tested with jsonMode + reasoning_effort, behaves identically to
// MODEL. Half the price ($0.075/$0.30 per 1M vs $0.15/$0.60) and Groq's own
// benchmarks put it faster too — this is a real saving, not a quality
// tradeoff being hidden, since it's only used where the task genuinely
// doesn't need the bigger model's extra reasoning depth.
export const FAST_MODEL = "openai/gpt-oss-20b";

// $ per 1M tokens, input/output — verified live (Groq pricing pages,
// 2026-09-16). Used to compute ai_runs.cost_estimate_usd, which every
// callsite previously hardcoded to 0. Update this if Groq repriced a model;
// an unlisted model falls back to MODEL's rate rather than silently
// returning 0 again.
const PRICE_PER_MILLION: Record<string, { input: number; output: number }> = {
  "openai/gpt-oss-120b": { input: 0.15, output: 0.6 },
  "openai/gpt-oss-20b": { input: 0.075, output: 0.3 },
  "qwen/qwen3.8-27b": { input: 0.8, output: 4.0 },
};

export function estimateGroqCost(model: string, inputTokens: number, outputTokens: number): number {
  const price = PRICE_PER_MILLION[model] ?? PRICE_PER_MILLION[MODEL];
  return (inputTokens / 1_000_000) * price.input + (outputTokens / 1_000_000) * price.output;
}

// Vision-capable — MODEL above is text-only. Checked live against
// console.groq.com/docs/vision (2026-09): Llama 4 Scout/Maverick, the
// obvious choices, are both deprecated (Maverick Feb 2026, Scout shut down
// entirely in July 2026). qwen/qwen3.6-27b was the other live option here
// but Groq has since removed it too (confirmed 2026-09-15 against the real
// /v1/models list for this key — it 404s now); qwen/qwen3.8-27b is the only
// vision model left. Its "tunable reasoning effort" pitch reads as tuned
// for math/code, not descriptive captioning, but forcing reasoning_effort
// "none" below sidesteps that entirely — verified live it still returns a
// clean, un-truncated JSON caption with it off.
export const VISION_MODEL = "qwen/qwen3.8-27b";

export type GroqCallResult = {
  content: string;
  inputTokens: number;
  outputTokens: number;
  /** Which model actually served this call — callers use this (not MODEL)
   *  when computing cost_estimate_usd, since it may be FAST_MODEL. */
  model: string;
};

type GroqCallOptions = {
  /** Defaults to MODEL. Pass FAST_MODEL for callsites that don't need deep
   *  brand/strategy reasoning — see groqModel.ts's own comment on FAST_MODEL
   *  for which kinds of tasks that is. */
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Defaults to true — most callers want a structured JSON response. */
  jsonMode?: boolean;
  /** Prior turns inserted between the system prompt and the final user
   * message — only the assistant chat needs real multi-turn context, every
   * other callsite omits this and gets the original single-shot shape. */
  history?: { role: "user" | "assistant"; content: string }[];
  /** MODEL (openai/gpt-oss-120b) is a reasoning model — its hidden reasoning
   * tokens are drawn from the same maxTokens budget as the visible output,
   * so a large structured response (e.g. a multi-item JSON pack) can get
   * cut off mid-JSON with plenty of maxTokens still "spent" on reasoning.
   * Only set this on callsites that hit that in practice — leaving it
   * unset preserves every other callsite's existing behavior exactly. */
  reasoningEffort?: "low" | "medium" | "high";
};

// Shared by every Groq callsite (generateDrafts, getDashboardBriefing,
// autofillFromWebsite, generateWeeklyPack) — three near-identical inline
// copies was the real threshold to stop duplicating. Throws on failure;
// callers that want a silent fallback (e.g. the dashboard briefing, which
// must never break the dashboard) already wrap their call in try/catch.
export async function callGroq(
  systemPrompt: string,
  userMessage: string,
  options?: GroqCallOptions
): Promise<GroqCallResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY tanımlı değil.");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: options?.model ?? MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...(options?.history ?? []),
        { role: "user", content: userMessage },
      ],
      temperature: options?.temperature ?? 0.8,
      ...(options?.maxTokens ? { max_tokens: options.maxTokens } : {}),
      ...(options?.reasoningEffort ? { reasoning_effort: options.reasoningEffort } : {}),
      ...(options?.jsonMode === false ? {} : { response_format: { type: "json_object" } }),
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Groq API hatası (HTTP ${res.status})`);
  }

  const fallback = options?.jsonMode === false ? "" : "{}";
  return {
    content: json.choices?.[0]?.message?.content ?? fallback,
    inputTokens: json.usage?.prompt_tokens ?? 0,
    outputTokens: json.usage?.completion_tokens ?? 0,
    model: options?.model ?? MODEL,
  };
}

/*
  Same shape as callGroq, but the user message carries one or more images —
  OpenAI-compatible multi-part content (text block + image_url block(s)),
  which is the one thing callGroq's plain-string message can't express.
  image_url.url accepts either a real https:// URL or a base64 data URI
  (standard OpenAI vision convention, mirrored by Groq) — callers don't need
  to have already uploaded the file anywhere.

  reasoning_effort is hardcoded to "none" — verified live that qwen3.x
  defaults to thinking mode ON, and (unlike MODEL/gpt-oss-120b's hidden
  reasoning) writes its <think>...</think> block straight into the visible
  content before the real answer. With jsonMode on, a truncated thinking
  block IS the whole response and never parses as JSON; "none" skips it
  outright, which is also just correct for "write a caption for this photo"
  — no math/code reasoning to do.
*/
export async function callGroqVision(
  systemPrompt: string,
  userText: string,
  imageUrls: string[],
  options?: Pick<GroqCallOptions, "temperature" | "maxTokens" | "jsonMode">
): Promise<GroqCallResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY tanımlı değil.");
  }
  if (imageUrls.length === 0) {
    throw new Error("callGroqVision en az bir görsel gerektirir.");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      reasoning_effort: "none",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
          ],
        },
      ],
      temperature: options?.temperature ?? 0.8,
      ...(options?.maxTokens ? { max_tokens: options.maxTokens } : {}),
      ...(options?.jsonMode === false ? {} : { response_format: { type: "json_object" } }),
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `Groq Vision API hatası (HTTP ${res.status})`);
  }

  const fallback = options?.jsonMode === false ? "" : "{}";
  return {
    content: json.choices?.[0]?.message?.content ?? fallback,
    inputTokens: json.usage?.prompt_tokens ?? 0,
    outputTokens: json.usage?.completion_tokens ?? 0,
    model: VISION_MODEL,
  };
}
