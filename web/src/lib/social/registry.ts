import { facebookProvider } from "./metaProvider";
import { instagramProvider } from "./instagramProvider";
import { threadsProvider } from "./threadsProvider";
import type { SocialPlatform, SocialProvider } from "./types";

export function getProviderFor(platform: SocialPlatform): SocialProvider {
  if (platform === "facebook") return facebookProvider;
  if (platform === "instagram") return instagramProvider;
  if (platform === "threads") return threadsProvider;
  throw new Error(`${platform} için henüz bir connector yok.`);
}
