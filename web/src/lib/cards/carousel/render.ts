import { renderHtmlSetToImages } from "../renderHtmlToImage";
import { carouselCardDimensions, type CarouselCardProps } from "./types";
import { pickCarouselVariant } from "./registry";

// Returns one PNG buffer per slide, in post order: [cover, ...items, cta].
export async function renderCarouselSet(props: CarouselCardProps, options?: { variantKey?: string }): Promise<Buffer[]> {
  if (props.items.length === 0) throw new Error("Carousel en az bir madde gerektirir.");
  const layout = pickCarouselVariant(options?.variantKey);
  const dimensions = carouselCardDimensions(props.format);
  const totalSlides = props.items.length + 2;

  const htmls = [
    layout.cover(props, totalSlides),
    ...props.items.map((text, i) =>
      layout.item(props, { text, slideIndex: i + 1, itemNumber: i + 1, totalSlides })
    ),
    layout.cta(props, totalSlides),
  ];

  return renderHtmlSetToImages(htmls.map((html) => ({ html, dimensions })));
}
