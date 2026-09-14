import { facebookProvider } from "./metaProvider";
import { instagramProvider } from "./instagramProvider";
import { threadsProvider } from "./threadsProvider";
import { tiktokProvider } from "./tiktokProvider";
import { pinterestProvider } from "./pinterestProvider";
import { telegramProvider } from "./telegramProvider";
import type { SocialPlatform, SocialProvider } from "./types";

export function getProviderFor(platform: SocialPlatform): SocialProvider {
  if (platform === "facebook") return facebookProvider;
  if (platform === "instagram") return instagramProvider;
  if (platform === "threads") return threadsProvider;
  if (platform === "tiktok") return tiktokProvider;
  if (platform === "pinterest") return pinterestProvider;
  if (platform === "telegram") return telegramProvider;
  throw new Error(`${platform} için henüz bir connector yok.`);
}
