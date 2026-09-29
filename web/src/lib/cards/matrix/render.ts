import { renderHtmlToImage } from "../renderHtmlToImage";
import { type MatrixCardProps, matrixCardDimensions } from "./types";
import { pickMatrixVariant } from "./registry";

export async function renderMatrixCard(props: MatrixCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickMatrixVariant(variantKey)(props);
  return renderHtmlToImage(html, matrixCardDimensions(props.format));
}
