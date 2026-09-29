import { type CarouselCardProps, pageDots, resolveAccent } from "./types";
import { carouselShell, brandRowHtml } from "./shell";
import { applyRichFormatting } from "../cardEffects";

export function renderCarouselItem(
  props: CarouselCardProps,
  opts: { text: string; slideIndex: number; itemNumber: number; totalSlides: number }
): string {
  const accent = resolveAccent(props.accentColor);
  const center = `
    <span style="position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:16px;background:${accent}22;border:2px solid ${accent};font-family:'Baloo 2',sans-serif;font-weight:800;font-size:26px;color:${accent};margin-bottom:32px;">${opts.itemNumber}</span>
    <p style="position:relative;z-index:1;max-width:82%;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:56px;line-height:1.3;color:#F7F5FB;text-align:center;letter-spacing:-0.01em;">${applyRichFormatting(opts.text, { isDark: true })}</p>
  `;
  const footer = `${brandRowHtml(props.brandName, props.logoUrl)}<div class="dots">${pageDots(opts.totalSlides, opts.slideIndex, accent)}</div>`;
  return carouselShell({ format: props.format, accent, centerHtml: center, footerHtml: footer });
}
