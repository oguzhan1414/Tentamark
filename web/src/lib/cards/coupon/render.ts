import { renderHtmlToImage } from "../renderHtmlToImage";
import { type CouponCardProps, couponCardDimensions } from "./types";
import { pickCouponVariant } from "./registry";

export async function renderCouponCard(props: CouponCardProps, variantKey?: string): Promise<Buffer> {
  const html = pickCouponVariant(variantKey)(props);
  return renderHtmlToImage(html, couponCardDimensions(props.format));
}
