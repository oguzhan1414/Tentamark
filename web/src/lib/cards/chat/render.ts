import { renderHtmlToImage } from "../renderHtmlToImage";
import { type ChatCardProps, chatCardDimensions } from "./types";
import { pickChatVariant } from "./registry";

export async function renderChatCard(props: ChatCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickChatVariant(variantKey)(props);
  return renderHtmlToImage(html, chatCardDimensions(props.format));
}
