import { renderHtmlToImage } from "../renderHtmlToImage";
import { type ThisOrThatCardProps, thisOrThatCardDimensions } from "./types";
import { pickThisOrThatVariant } from "./registry";

export async function renderThisOrThatCard(props: ThisOrThatCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickThisOrThatVariant(variantKey)(props);
  return renderHtmlToImage(html, thisOrThatCardDimensions(props.format));
}
