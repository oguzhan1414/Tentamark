import { type CarouselCardProps, carouselCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

function brutalistShell(opts: {
  format: "square" | "story";
  accent: string;
  brandName: string;
  logoUrl?: string | null;
  slideNumber: number;
  totalSlides: number;
  centerHtml: string;
}): string {
  const { width, height } = carouselCardDimensions(opts.format);
  const accent = opts.accent;
  const safeBrand = escapeHtml(opts.brandName);
  const initial = opts.brandName ? opts.brandName.charAt(0).toUpperCase() : "T";

  const logoHtml = opts.logoUrl
    ? `<img src="${escapeHtml(opts.logoUrl)}" alt="${safeBrand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #FFFDF5; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #FFFDF5;
    padding: ${opts.format === "story" ? "90px 64px 80px" : "64px 72px 56px"};
  }
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, #0000000d 1px, transparent 1px),
                      linear-gradient(to bottom, #0000000d 1px, transparent 1px);
    background-size: 32px 32px;
  }
  .header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FFFFFF;
    border: 3px solid #111111;
    border-radius: 16px;
    padding: 16px 24px;
    box-shadow: 6px 6px 0px #111111;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 2px solid #111111;
    object-fit: cover;
    background: #FFFFFF;
  }
  .brand-fallback {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 2px solid #111111;
    background: #FFE600;
    color: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 18px;
  }
  .brand-name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 22px;
    color: #111111;
  }
  .counter {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    background: #FFE600;
    color: #111111;
    padding: 6px 14px;
    border: 2px solid #111111;
    border-radius: 8px;
  }

  .main-box {
    position: relative;
    z-index: 1;
    background: #FFFFFF;
    border: 4px solid #111111;
    border-radius: 24px;
    box-shadow: 12px 12px 0px #111111;
    padding: ${opts.format === "story" ? "56px 44px" : "44px 44px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: 32px 0;
  }

  .footer {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 14px;
    color: #111111;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="grid-pattern"></div>
  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safeBrand}</span>
    </div>
    <div class="counter">[0${opts.slideNumber + 1} / 0${opts.totalSlides}]</div>
  </div>

  <div class="main-box">
    ${opts.centerHtml}
  </div>

  <div class="footer">
    <span>KAYDIRARAK OKU ➔</span>
    <span>KAYDET 🔖</span>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}

export function renderCarouselCoverBrutalist(props: CarouselCardProps, totalSlides: number): string {
  const accent = resolveAccent(props.accentColor);
  const center = `
    <div style="font-family:'IBM Plex Mono',monospace;font-weight:800;font-size:14px;background:${accent};color:#111111;padding:6px 14px;border:3px solid #111111;border-radius:8px;box-shadow:3px 3px 0px #111111;margin-bottom:28px;">
      SERİ İÇERİK
    </div>
    <h1 style="max-width:88%;font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:${props.format === "story" ? "74px" : "66px"};line-height:1.14;color:#111111;letter-spacing:-0.03em;">${applyRichFormatting(props.title, { isDark: false })}</h1>
  `;
  return brutalistShell({
    format: props.format,
    accent,
    brandName: props.brandName,
    logoUrl: props.logoUrl,
    slideNumber: 0,
    totalSlides,
    centerHtml: center,
  });
}

export function renderCarouselItemBrutalist(
  props: CarouselCardProps,
  opts: { text: string; slideIndex: number; itemNumber: number; totalSlides: number }
): string {
  const accent = resolveAccent(props.accentColor);
  const center = `
    <div style="width:72px;height:72px;border-radius:16px;background:#FFE600;border:3px solid #111111;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:32px;color:#111111;margin-bottom:32px;box-shadow:4px 4px 0px #111111;">
      #0${opts.itemNumber}
    </div>
    <p style="max-width:86%;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:${props.format === "story" ? "54px" : "46px"};line-height:1.25;color:#111111;">${applyRichFormatting(opts.text, { isDark: false })}</p>
  `;
  return brutalistShell({
    format: props.format,
    accent,
    brandName: props.brandName,
    logoUrl: props.logoUrl,
    slideNumber: opts.slideIndex,
    totalSlides: opts.totalSlides,
    centerHtml: center,
  });
}

export function renderCarouselCtaBrutalist(props: CarouselCardProps, totalSlides: number): string {
  const accent = resolveAccent(props.accentColor);
  const ctaLabel = props.ctaLabel?.trim() || "Kaydet, sonra tekrar bak.";
  const center = `
    <div style="width:84px;height:84px;border-radius:20px;background:#111111;border:3px solid #111111;display:flex;align-items:center;justify-content:center;margin-bottom:28px;box-shadow:6px 6px 0px #FFE600;">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFE600" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"/></svg>
    </div>
    <p style="max-width:82%;font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:${props.format === "story" ? "56px" : "48px"};line-height:1.2;color:#111111;">${applyRichFormatting(ctaLabel, { isDark: false })}</p>
  `;
  return brutalistShell({
    format: props.format,
    accent,
    brandName: props.brandName,
    logoUrl: props.logoUrl,
    slideNumber: totalSlides - 1,
    totalSlides,
    centerHtml: center,
  });
}
