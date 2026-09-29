import { type CarouselCardProps, pageDots, resolveAccent } from "./types";
import { carouselShell, brandRowHtml } from "./shell";
import { applyRichFormatting } from "../cardEffects";

export function renderCarouselCover(props: CarouselCardProps, totalSlides: number): string {
  const accent = resolveAccent(props.accentColor);
  const center = `
    <p style="position:relative;z-index:1;font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:15px;letter-spacing:0.14em;text-transform:uppercase;color:${accent};margin-bottom:24px;">Kaydır →</p>
    <h1 style="position:relative;z-index:1;max-width:82%;font-family:'Baloo 2',sans-serif;font-weight:800;font-size:72px;line-height:1.18;color:#F7F5FB;text-align:center;letter-spacing:-0.01em;">${applyRichFormatting(props.title, { isDark: true })}</h1>
  `;
  const footer = `${brandRowHtml(props.brandName, props.logoUrl)}<div class="dots">${pageDots(totalSlides, 0, accent)}</div>`;
  return carouselShell({ format: props.format, accent, centerHtml: center, footerHtml: footer });
}
