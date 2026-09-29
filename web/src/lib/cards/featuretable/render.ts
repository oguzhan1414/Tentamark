import { renderHtmlToImage } from "../renderHtmlToImage";
import { type FeatureTableCardProps, featureTableCardDimensions } from "./types";
import { pickFeatureTableVariant } from "./registry";

export async function renderFeatureTableCard(props: FeatureTableCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickFeatureTableVariant(variantKey)(props);
  return renderHtmlToImage(html, featureTableCardDimensions(props.format));
}
