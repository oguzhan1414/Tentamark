import { type CarouselCardProps, carouselCardDimensions, escapeHtml } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { flexDirForLogoSide, fontStackFor, googleFontsHrefFor, legibleChipColor, radiusPx } from "../cardTokenStyles";

function editorialShell(opts: {
  format: "square" | "story";
  tokens: BrandDesignTokens;
  brandName: string;
  logoUrl?: string | null;
  slideNumber: number;
  totalSlides: number;
  centerHtml: string;
}): string {
  const { width, height } = carouselCardDimensions(opts.format);
  const { colors, typography, layout } = opts.tokens;
  const bodyFont = fontStackFor(typography.bodyFamily);
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
<link href="${googleFontsHrefFor(opts.tokens)}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: ${colors.background}; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: ${colors.background};
    padding: ${opts.format === "story" ? "96px 72px 80px" : "64px 80px 56px"};
  }
  .header {
    display: flex;
    flex-direction: ${flexDirForLogoSide(layout.logoPosition)};
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E6E1D8;
    padding-bottom: 24px;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #E6E1D8;
    background: #FFFFFF;
  }
  .brand-fallback {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #18181B;
    color: #FAF9F6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 19px;
  }
  .brand-name {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 22px;
    color: #18181B;
  }
  .slide-counter {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.12em;
    color: #6B7280;
    background: ${colors.surface};
    border: 1px solid #E6E1D8;
    padding: 6px 14px;
    border-radius: 999px;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 40px 0;
    text-align: center;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #E6E1D8;
    padding-top: 20px;
    font-family: ${bodyFont};
    font-size: 13px;
    color: #9CA3AF;
  }
  .progress-line {
    width: 140px;
    height: 4px;
    background: #E5E1D8;
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }
  .progress-bar {
    height: 100%;
    width: ${((opts.slideNumber + 1) / opts.totalSlides) * 100}%;
    background: ${colors.accent};
    border-radius: 999px;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safeBrand}</span>
    </div>
    <div class="slide-counter">0${opts.slideNumber + 1} / 0${opts.totalSlides}</div>
  </div>

  <div class="main">
    ${opts.centerHtml}
  </div>

  <div class="footer">
    <span>Kaydırarak Devam Edin →</span>
    <div class="progress-line">
      <div class="progress-bar"></div>
    </div>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}

export function renderCarouselCoverEditorial(
  props: CarouselCardProps,
  totalSlides: number,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { colors, typography } = tokens;
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);
  const center = `
    <div style='display:inline-flex;align-items:center;gap:8px;font-family:${bodyFont};font-weight:700;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:${colors.accent};background:${colors.surface};border:1px solid #E6E1D8;padding:8px 18px;border-radius:999px;margin-bottom:32px;'>
      <span>Özel Seri Rehber</span>
    </div>
    <h1 style='max-width:88%;font-family:${headingFont};font-weight:${typography.headingWeight};font-size:${props.format === "story" ? "76px" : "68px"};line-height:1.15;color:${colors.text};letter-spacing:-0.02em;'>${applyRichFormatting(props.title, { isDark: false })}</h1>
  `;
  return editorialShell({
    format: props.format,
    tokens,
    brandName: props.brandName,
    logoUrl: props.logoUrl,
    slideNumber: 0,
    totalSlides,
    centerHtml: center,
  });
}

export function renderCarouselItemEditorial(
  props: CarouselCardProps,
  opts: { text: string; slideIndex: number; itemNumber: number; totalSlides: number },
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { colors, typography, shape } = tokens;
  const headingFont = fontStackFor(typography.headingFamily);
  const center = `
    <div style='width:68px;height:68px;border-radius:${radiusPx(shape.radiusStyle)}px;background:${colors.surface};border:2px solid #E6E1D8;display:flex;align-items:center;justify-content:center;font-family:${headingFont};font-weight:${typography.headingWeight};font-size:30px;color:${colors.text};margin-bottom:36px;box-shadow:0 8px 24px -6px rgba(0,0,0,0.06);'>
      0${opts.itemNumber}
    </div>
    <p style='max-width:86%;font-family:${headingFont};font-weight:600;font-size:${props.format === "story" ? "56px" : "48px"};line-height:1.28;color:#1F2937;'>${applyRichFormatting(opts.text, { isDark: false })}</p>
  `;
  return editorialShell({
    format: props.format,
    tokens,
    brandName: props.brandName,
    logoUrl: props.logoUrl,
    slideNumber: opts.slideIndex,
    totalSlides: opts.totalSlides,
    centerHtml: center,
  });
}

export function renderCarouselCtaEditorial(
  props: CarouselCardProps,
  totalSlides: number,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { colors, typography } = tokens;
  const headingFont = fontStackFor(typography.headingFamily);
  const chipColor = legibleChipColor(colors.primary);
  const ctaLabel = props.ctaLabel?.trim() || "Kaydet, sonra tekrar bak.";
  const center = `
    <div style="width:84px;height:84px;border-radius:50%;background:${chipColor};display:flex;align-items:center;justify-content:center;margin-bottom:32px;box-shadow:0 10px 30px rgba(0,0,0,0.15);">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FAF9F6" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-4-7 4V5z"/></svg>
    </div>
    <p style='max-width:82%;font-family:${headingFont};font-weight:${typography.headingWeight};font-size:${props.format === "story" ? "58px" : "50px"};line-height:1.24;color:${colors.text};'>${applyRichFormatting(ctaLabel, { isDark: false })}</p>
  `;
  return editorialShell({
    format: props.format,
    tokens,
    brandName: props.brandName,
    logoUrl: props.logoUrl,
    slideNumber: totalSlides - 1,
    totalSlides,
    centerHtml: center,
  });
}
