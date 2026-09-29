import { carouselCardDimensions, escapeHtml, type CardFormat } from "./types";
import { SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

// Every slide (cover/item/CTA) wraps this same page shell — same glow
// treatment as Quote Card so a carousel doesn't look like a different
// product, just different content per slide. Keeping it here means the
// three slide files only ever supply their own centerpiece markup.
export function carouselShell(opts: {
  format: CardFormat;
  accent: string;
  centerHtml: string;
  footerHtml: string;
  extraCss?: string;
}): string {
  const { width, height } = carouselCardDimensions(opts.format);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=IBM+Plex+Sans:wght@500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0B0A0F; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0B0A0F;
  }
  .glow {
    position: absolute;
    top: -18%;
    right: -14%;
    width: 62%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${opts.accent} 0%, ${opts.accent}00 70%);
    filter: blur(90px);
    opacity: 0.5;
  }
  .footer {
    position: absolute;
    bottom: 6%;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    z-index: 2;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 36px; height: 36px; border-radius: 10px; object-fit: contain; background: #fff; padding: 5px; }
  .brand-name { font-family: "IBM Plex Sans", sans-serif; font-weight: 600; font-size: 20px; letter-spacing: 0.02em; color: #ffffff; opacity: 0.85; }
  .dots { display: flex; align-items: center; gap: 6px; }
  ${opts.extraCss ?? ""}

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="glow"></div>
    ${opts.centerHtml}
    <div class="footer">
      ${opts.footerHtml}
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}

export function brandRowHtml(brandName: string, logoUrl?: string | null): string {
  return `<div class="brand-row">
    ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
    <span class="brand-name">${escapeHtml(brandName)}</span>
  </div>`;
}
