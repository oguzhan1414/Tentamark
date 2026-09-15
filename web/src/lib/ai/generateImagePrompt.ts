import { callGroq } from "./groqModel";

export async function generateImagePrompt(
  visualConcept: string,
  options?: { title?: string; brandName?: string; colorPalette?: string[] }
): Promise<string> {
  const cleanConcept = visualConcept.trim();
  if (!cleanConcept) {
    return "Commercial studio photography, modern clean aesthetic, professional lighting, 8k resolution";
  }

  const hasColors = Boolean(options?.colorPalette?.length);

  const systemPrompt = `You are an expert art director and AI image prompt engineer for Flux.1 and Midjourney.
Convert the following visual/shooting concept description (which may be in Turkish) into a single, highly effective, professional English image prompt for an AI photo generator.

Rules:
- Focus on photorealistic, commercial advertising quality.
- Include specific camera and lighting details (e.g. 35mm lens, soft studio lighting, shallow depth of field, high-end editorial look).
- Describe subject, environment, materials, colors, and mood.
${hasColors ? "- A brand color palette is provided — use those exact hex colors as the dominant palette (props, wardrobe, lighting gels, backdrop) instead of inventing your own." : ""}
- DO NOT add visible text, letters, watermarks, or logos in the scene.
- Return ONLY the final prompt text in English. No markdown, no quotes, no explanations.`;

  const userMessage = [
    options?.brandName ? `Brand: ${options.brandName}` : null,
    options?.colorPalette?.length ? `Brand Color Palette (use as dominant colors): ${options.colorPalette.join(", ")}` : null,
    options?.title ? `Content Title: ${options.title}` : null,
    `Visual Concept: ${cleanConcept}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    // reasoningEffort was missing here — MODEL (gpt-oss-120b) defaults to a
    // heavier reasoning mode whose hidden thinking tokens draw from the same
    // maxTokens budget as the visible output (see groqModel.ts). Verified
    // live: without this, a real prompt burned all 300 tokens on invisible
    // reasoning and returned an EMPTY content string, silently falling back
    // to the raw, un-engineered (often Turkish) concept text below — no
    // camera/lighting direction, which is almost certainly why generated
    // images have been coming out wrong. "low" is the lowest value this
    // model actually accepts (unlike the vision model, "none" 400s here).
    const result = await callGroq(systemPrompt, userMessage, {
      temperature: 0.5,
      maxTokens: 300,
      jsonMode: false,
      reasoningEffort: "low",
    });
    const prompt = result.content.trim().replace(/^["']|["']$/g, "");
    return prompt || cleanConcept;
  } catch (err) {
    console.warn("generateImagePrompt failed, using fallback:", err);
    return `${cleanConcept}, commercial photography, clean lighting, 8k`;
  }
}
