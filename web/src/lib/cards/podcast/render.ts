import { renderHtmlToImage } from "../renderHtmlToImage";
import { type PodcastCardProps, podcastCardDimensions } from "./types";
import { pickPodcastVariant } from "./registry";

export async function renderPodcastCard(props: PodcastCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickPodcastVariant(variantKey)(props);
  const dims = podcastCardDimensions(props.format);
  return renderHtmlToImage(html, dims);
}
