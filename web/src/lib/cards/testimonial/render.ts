import { renderHtmlToImage } from "../renderHtmlToImage";
import { testimonialCardDimensions, type TestimonialCardProps } from "./types";
import { pickTestimonialVariant } from "./registry";

export async function renderTestimonialCard(props: TestimonialCardProps, options?: { variantKey?: string }): Promise<Buffer> {
  const dimensions = testimonialCardDimensions(props.format);
  const buildHtml = pickTestimonialVariant(options?.variantKey);
  return renderHtmlToImage(buildHtml(props), dimensions);
}
