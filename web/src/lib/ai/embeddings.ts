"use server";

// Groq has no production-grade embedding model, so this is the one place in
// the app that calls a different provider — OpenAI's text-embedding-3-small
// (1536 dims, $0.02/1M tokens, cheap enough that per-post embedding cost is
// negligible). Requires OPENAI_API_KEY; callers should treat a missing key
// as "feature not configured yet" rather than a hard failure — see how
// /api/scheduler/publish wraps this in a best-effort try/catch.
export async function getEmbedding(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY tanımlı değil.");
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000), // model's input limit is far higher, this just guards against a stray huge input
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message ?? `OpenAI embedding hatası (HTTP ${res.status})`);
  }

  const embedding = json.data?.[0]?.embedding;
  if (!Array.isArray(embedding)) {
    throw new Error("OpenAI embedding yanıtı beklenmedik biçimde geldi.");
  }
  return embedding as number[];
}
