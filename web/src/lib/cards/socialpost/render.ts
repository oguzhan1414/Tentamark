import { renderHtmlToImage } from "../renderHtmlToImage";
import { socialPostCardDimensions, type SocialPostCardProps } from "./types";
import { pickSocialPostVariant } from "./registry";

export async function renderSocialPostCard(props: SocialPostCardProps, options?: { variantKey?: string }): Promise<Buffer> {
  const dimensions = socialPostCardDimensions(props.format);
  const buildHtml = pickSocialPostVariant(options?.variantKey);
  return renderHtmlToImage(buildHtml(props), dimensions);
}
