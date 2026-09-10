// ai-marketing-manager-project-spec.md §17: "Görsel üretimini provider
// abstraction ile yap... tek sağlayıcıya kilitlenmezsin." Pollinations
// (free tier) is the first implementation; a paid provider (OpenAI /
// Replicate-hosted Flux) can be added later as a second ImageProvider
// without touching callers.

export type ImageGenerateOptions = {
  width?: number;
  height?: number;
  seed?: number;
};

export type ImageProviderResult = {
  buffer: Buffer;
  contentType: string;
};

export type ImageProvider = {
  name: string;
  generate(prompt: string, options?: ImageGenerateOptions): Promise<ImageProviderResult>;
};
