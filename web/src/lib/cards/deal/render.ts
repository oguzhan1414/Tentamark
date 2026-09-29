import { renderHtmlToImage } from "../renderHtmlToImage";
import { type DealCardProps, dealCardDimensions } from "./types";
import { pickDealVariant } from "./registry";

export async function renderDealCard(props: DealCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickDealVariant(variantKey)(props);
  const dims = dealCardDimensions(props.format);
  return renderHtmlToImage(html, dims);
}
