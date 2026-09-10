import { pollinationsProvider } from "./imageProviders/pollinations";
import type { ImageProvider } from "./imageProviders/types";

const PROVIDERS: Record<string, ImageProvider> = {
  pollinations: pollinationsProvider,
};
const DEFAULT_PROVIDER = "pollinations";

export type GenerateImageOptions = {
  prompt: string;
  width?: number;
  height?: number;
  seed?: number;
  provider?: string;
};

export type GenerateImageResult = {
  dataUrl: string;
  contentType: string;
  prompt: string;
  provider: string;
};

/*
  Deliberately does NOT touch Storage or the `media` table — this only
  generates and returns the image. Persisting was moved to the caller
  (compose/weekly's submitAll) so a generated-but-never-submitted image
  never creates an orphaned `media` row + Storage file. See
  13-build-checklist.md for why (real bug: every "Farklı Bir Görsel Dene"
  click, and every abandoned weekly-pack session, was leaving permanent
  orphans since generation used to write to Storage/DB immediately).
*/
export async function generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
  const {
    prompt,
    width = 1024,
    height = 1024,
    seed = Math.floor(Math.random() * 1000000),
    provider = DEFAULT_PROVIDER,
  } = options;

  if (!prompt || !prompt.trim()) {
    throw new Error("Görsel promptu belirtilmedi.");
  }

  const impl = PROVIDERS[provider];
  if (!impl) {
    throw new Error(`Bilinmeyen görsel sağlayıcı: ${provider}`);
  }

  const result = await impl.generate(prompt, { width, height, seed });
  const dataUrl = `data:${result.contentType};base64,${result.buffer.toString("base64")}`;

  return { dataUrl, contentType: result.contentType, prompt, provider: impl.name };
}
