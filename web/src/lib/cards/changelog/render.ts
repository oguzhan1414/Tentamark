import { renderHtmlToImage } from "../renderHtmlToImage";
import { type ChangelogCardProps, changelogCardDimensions } from "./types";
import { pickChangelogVariant } from "./registry";

export async function renderChangelogCard(props: ChangelogCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickChangelogVariant(variantKey)(props);
  return renderHtmlToImage(html, changelogCardDimensions(props.format));
}
