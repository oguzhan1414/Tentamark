import type { RenderExecutor } from "./renderExecutor";
import { localRenderer } from "./localRenderer";

export type RenderProvider = "local";

const providers: Record<RenderProvider, RenderExecutor> = {
  local: localRenderer,
};

export function resolveRenderProvider(value = process.env.VIDEO_RENDER_PROVIDER ?? "local"): {
  name: RenderProvider;
  executor: RenderExecutor;
} {
  if (value in providers) {
    const name = value as RenderProvider;
    return { name, executor: providers[name] };
  }
  throw new Error(`Desteklenmeyen video render provider: ${value}`);
}
