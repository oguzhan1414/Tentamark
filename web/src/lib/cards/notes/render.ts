import { renderHtmlToImage } from "../renderHtmlToImage";
import { type NotesCardProps, notesCardDimensions } from "./types";
import { pickNotesVariant } from "./registry";

export async function renderNotesCard(props: NotesCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickNotesVariant(variantKey)(props);
  return renderHtmlToImage(html, notesCardDimensions(props.format));
}
