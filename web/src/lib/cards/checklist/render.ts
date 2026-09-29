import { renderHtmlToImage } from "../renderHtmlToImage";
import { type ChecklistCardProps, checklistCardDimensions } from "./types";
import { pickChecklistVariant } from "./registry";

export async function renderChecklistCard(props: ChecklistCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickChecklistVariant(variantKey)(props);
  return renderHtmlToImage(html, checklistCardDimensions(props.format));
}
