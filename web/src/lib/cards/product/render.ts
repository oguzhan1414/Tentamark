import { renderHtmlToImage } from "../renderHtmlToImage";
import { productCardDimensions, type ProductCardProps } from "./types";
import { pickProductVariant } from "./registry";

export async function renderProductCard(props: ProductCardProps, options?: { variantKey?: string }): Promise<Buffer> {
  const dimensions = productCardDimensions(props.format);
  const buildHtml = pickProductVariant(options?.variantKey);
  return renderHtmlToImage(buildHtml(props), dimensions);
}
