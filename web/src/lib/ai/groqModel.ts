// Verified live against the real Groq /models endpoint, not docs — Groq's
// catalog turns over fast and llama-3.3-70b-versatile (what the docs listed)
// had already been removed by the time this was tested.
export const MODEL = "openai/gpt-oss-120b";

export type GroqCallResult = {
  content: string;
  inputTokens: number;
  outputTokens: number;
};

type GroqCallOptions = {
  temperature?: number;
  maxTokens?: number;
  /** Defaults to true — most callers want a structured JSON response. */
  jsonMode?: boolean;
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
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: options?.temperature ?? 0.8,
      ...(options?.maxTokens ? { max_tokens: options.maxTokens } : {}),
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
  };
}
