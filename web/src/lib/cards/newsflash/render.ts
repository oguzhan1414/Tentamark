import { renderHtmlToImage } from "../renderHtmlToImage";
import { type NewsFlashCardProps, newsFlashCardDimensions } from "./types";
import { pickNewsFlashVariant } from "./registry";

export async function renderNewsFlashCard(props: NewsFlashCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickNewsFlashVariant(variantKey)(props);
  const dims = newsFlashCardDimensions(props.format);
  return renderHtmlToImage(html, dims);
}
