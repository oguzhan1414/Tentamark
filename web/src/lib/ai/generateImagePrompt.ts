import { callGroq } from "./groqModel";

export async function generateImagePrompt(
  visualConcept: string,
  options?: { title?: string; brandName?: string }
): Promise<string> {
  const cleanConcept = visualConcept.trim();
  if (!cleanConcept) {
    return "Commercial studio photography, modern clean aesthetic, professional lighting, 8k resolution";
  }

  const systemPrompt = `You are an expert art director and AI image prompt engineer for Flux.1 and Midjourney.
Convert the following visual/shooting concept description (which may be in Turkish) into a single, highly effective, professional English image prompt for an AI photo generator.

Rules:
- Focus on photorealistic, commercial advertising quality.
- Include specific camera and lighting details (e.g. 35mm lens, soft studio lighting, shallow depth of field, high-end editorial look).
- Describe subject, environment, materials, colors, and mood.
- DO NOT add visible text, letters, watermarks, or logos in the scene.
- Return ONLY the final prompt text in English. No markdown, no quotes, no explanations.`;

  const userMessage = [
    options?.brandName ? `Brand: ${options.brandName}` : null,
    options?.title ? `Content Title: ${options.title}` : null,
    `Visual Concept: ${cleanConcept}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await callGroq(systemPrompt, userMessage, {
      temperature: 0.5,
      maxTokens: 300,
      jsonMode: false,
    });
    const prompt = result.content.trim().replace(/^["']|["']$/g, "");
    return prompt || cleanConcept;
  } catch (err) {
    console.warn("generateImagePrompt failed, using fallback:", err);
    return `${cleanConcept}, commercial photography, clean lighting, 8k`;
  }
}
