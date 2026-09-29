import { type CarouselCardProps, pageDots, resolveAccent } from "./types";
import { carouselShell, brandRowHtml } from "./shell";
import { applyRichFormatting } from "../cardEffects";

export function renderCarouselCta(props: CarouselCardProps, totalSlides: number): string {
  const accent = resolveAccent(props.accentColor);
  const ctaLabel = props.ctaLabel?.trim() || "Kaydet, sonra tekrar bak.";
  const center = `
    <div style="position:relative;z-index:1;width:80px;height:80px;border-radius:50%;background:${accent};display:flex;align-items:center;justify-content:center;margin-bottom:32px;box-shadow:0 0 40px ${accent}80;">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0B0A0F" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"/></svg>
    </div>
    <p style="position:relative;z-index:1;max-width:78%;font-family:'Baloo 2',sans-serif;font-weight:700;font-size:52px;line-height:1.3;color:#F7F5FB;text-align:center;">${applyRichFormatting(ctaLabel, { isDark: true })}</p>
  `;
  const footer = `${brandRowHtml(props.brandName, props.logoUrl)}<div class="dots">${pageDots(totalSlides, totalSlides - 1, accent)}</div>`;
  return carouselShell({ format: props.format, accent, centerHtml: center, footerHtml: footer });
}
