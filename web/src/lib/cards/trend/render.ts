import { renderHtmlToImage } from "../renderHtmlToImage";
import { trendCardDimensions, type TrendCardProps } from "./types";
import { pickTrendVariant } from "./registry";

export async function renderTrendCard(props: TrendCardProps, options?: { variantKey?: string }): Promise<Buffer> {
  const dimensions = trendCardDimensions(props.format);
  const buildHtml = pickTrendVariant(options?.variantKey);
  return renderHtmlToImage(buildHtml(props), dimensions);
}
