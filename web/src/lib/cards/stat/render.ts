import { renderHtmlToImage } from "../renderHtmlToImage";
import { statCardDimensions, type StatCardProps } from "./types";
import { pickStatVariant } from "./registry";

export async function renderStatCard(props: StatCardProps, options?: { variantKey?: string }): Promise<Buffer> {
  const dimensions = statCardDimensions(props.format);
  const buildHtml = pickStatVariant(options?.variantKey);
  return renderHtmlToImage(buildHtml(props), dimensions);
}
