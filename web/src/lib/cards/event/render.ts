import { renderHtmlToImage } from "../renderHtmlToImage";
import { type EventCardProps, eventCardDimensions } from "./types";
import { pickEventVariant } from "./registry";

export async function renderEventCard(props: EventCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickEventVariant(variantKey)(props);
  return renderHtmlToImage(html, eventCardDimensions(props.format));
}
