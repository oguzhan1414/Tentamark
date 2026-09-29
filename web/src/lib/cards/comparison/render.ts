import { renderHtmlToImage } from "../renderHtmlToImage";
import { comparisonCardDimensions, type ComparisonCardProps } from "./types";
import { pickComparisonVariant } from "./registry";

export async function renderComparisonCard(props: ComparisonCardProps, options?: { variantKey?: string }): Promise<Buffer> {
  const dimensions = comparisonCardDimensions(props.format);
  const buildHtml = pickComparisonVariant(options?.variantKey);
  return renderHtmlToImage(buildHtml(props), dimensions);
}
