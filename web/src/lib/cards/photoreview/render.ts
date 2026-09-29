import { renderHtmlToImage } from "../renderHtmlToImage";
import { type PhotoReviewCardProps, photoReviewCardDimensions } from "./types";
import { pickPhotoReviewVariant } from "./registry";

export async function renderPhotoReviewCard(props: PhotoReviewCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickPhotoReviewVariant(variantKey)(props);
  const dims = photoReviewCardDimensions(props.format);
  return renderHtmlToImage(html, dims);
}
