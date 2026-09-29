import { type QuoteCardProps, quoteCardDimensions, escapeHtml, fontSizeForLength } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import {
  alignForLogoSide,
  densityScale,
  fontStackFor,
  frameBorderCss,
  googleFontsHrefFor,
  radiusPx,
  scalePadding,
} from "../cardTokenStyles";

export function renderQuoteEditorial(props: QuoteCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { quote, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const { width, height } = quoteCardDimensions(format);
  const fontSize = fontSizeForLength(quote.length, format);
  const safeQuote = applyRichFormatting(quote, { isDark: false });
  const safeBrand = escapeHtml(brandName);
  const scale = densityScale(layout.density);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);
  const border = frameBorderCss(shape.borderStyle, colors.text);
  const dotDisplay = shape.borderStyle === "none" ? "none" : "block";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens)}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    background: ${colors.background};
    overflow: hidden;
  }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${colors.background};
    padding: ${format === "story" ? scalePadding([260, 72, 420], scale) : scalePadding([90, 90], scale)};
  }
  /* Elegant luxury inner frame */
  .inner-border {
    position: absolute;
    inset: ${format === "story" ? "180px 48px 340px" : "44px"};
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    border: ${border};
    pointer-events: none;
  }
  .inner-border::before {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    width: 8px;
    height: 8px;
    background: ${colors.accent};
    border-radius: 50%;
    display: ${dotDisplay};
  }
  .inner-border::after {
    content: "";
    position: absolute;
    bottom: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    background: ${colors.accent};
    border-radius: 50%;
    display: ${dotDisplay};
  }
  /* Giant subtle editorial quote mark */
  .quote-mark {
    font-family: ${headingFont};
    font-size: ${format === "story" ? 180 : 150}px;
    font-weight: ${typography.headingWeight};
    color: ${colors.accent};
    opacity: 0.28;
    line-height: 0.8;
    margin-bottom: 20px;
    user-select: none;
  }
  .quote-text {
    position: relative;
    z-index: 1;
    max-width: 90%;
    font-family: ${headingFont};
    font-style: italic;
    font-weight: ${typography.headingWeight};
    font-size: ${Math.round(fontSize * 1.05)}px;
    line-height: 1.35;
    color: ${colors.text};
    text-align: center;
    letter-spacing: -0.01em;
  }
  .brand-divider {
    width: 48px;
    height: 2px;
    background: ${colors.accent};
    margin: 36px 0 20px;
  }
  .brand-row {
    display: flex;
    align-items: center;
    align-self: ${alignForLogoSide(layout.logoPosition)};
    gap: 14px;
    z-index: 1;
  }
  .brand-logo {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: contain;
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.08);
    padding: 3px;
  }
  .brand-name {
    font-family: ${bodyFont};
    font-weight: ${typography.bodyWeight};
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: #4A4A4A;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="inner-border"></div>
    <div class="quote-mark">&ldquo;</div>
    <p class="quote-text">${safeQuote}</p>
    <div class="brand-divider"></div>
    <div class="brand-row">
      ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
      <span class="brand-name">${safeBrand}</span>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
