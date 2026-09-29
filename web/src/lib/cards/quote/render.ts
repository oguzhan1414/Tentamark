import { renderHtmlToImage } from "../renderHtmlToImage";
import { quoteCardDimensions, type QuoteCardProps } from "./types";
import { pickQuoteVariant } from "./registry";

export async function renderQuoteCard(props: QuoteCardProps, options?: { variantKey?: string }): Promise<Buffer> {
  const dimensions = quoteCardDimensions(props.format);
  const buildHtml = pickQuoteVariant(options?.variantKey);
  const html = buildHtml(props);
  return renderHtmlToImage(html, dimensions);
}
