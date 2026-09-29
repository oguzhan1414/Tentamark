import { type StatCardProps, statCardDimensions, escapeHtml } from "./types";
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
  shadowCss,
} from "../cardTokenStyles";

export function renderStatEditorial(props: StatCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { statNumber, statLabel, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const { width, height } = statCardDimensions(format);
  const supportingText = props.supportingText?.trim();

  const safeStat = escapeHtml(statNumber);
  const safeLabel = applyRichFormatting(statLabel, { isDark: false });
  const safeBrand = escapeHtml(brandName);
  const safeSupporting = supportingText ? applyRichFormatting(supportingText, { isDark: false }) : "";
  const scale = densityScale(layout.density);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

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
    text-align: center;
  }
  .inner-frame {
    position: absolute;
    inset: ${format === "story" ? "180px 48px 340px" : "44px"};
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    border: ${frameBorderCss(shape.borderStyle, colors.text)};
    pointer-events: none;
  }
  .metric-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: ${colors.surface};
    border: 1px solid rgba(0, 0, 0, 0.09);
    border-radius: 999px;
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #555555;
    margin-bottom: 24px;
    z-index: 1;
  }
  .metric-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${colors.accent};
  }
  .stat-number {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? 170 : 150}px;
    line-height: 1;
    color: ${colors.text};
    letter-spacing: -0.03em;
    margin-bottom: 18px;
    z-index: 1;
  }
  .stat-label {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? 34 : 30}px;
    line-height: 1.35;
    color: #222222;
    max-width: 82%;
    z-index: 1;
  }
  .supporting-text {
    margin-top: 14px;
    font-family: ${bodyFont};
    font-weight: ${typography.bodyWeight};
    font-size: 18px;
    line-height: 1.5;
    color: #666666;
    max-width: 75%;
    z-index: 1;
  }
  .brand-divider {
    width: 44px;
    height: 2px;
    background: ${colors.accent};
    margin: 36px 0 20px;
    z-index: 1;
  }
  .brand-row {
    display: flex;
    align-items: center;
    align-self: ${alignForLogoSide(layout.logoPosition)};
    gap: 12px;
    z-index: 1;
  }
  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: contain;
    background: #ffffff;
    border: 1px solid rgba(0,0,0,0.08);
    padding: 3px;
    box-shadow: ${shadowCss(shape.shadowStyle)};
  }
  .brand-name {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 17px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #444444;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="inner-frame"></div>
    <div class="metric-badge">
      <span class="metric-dot"></span>
      <span>Metrik Raporu</span>
    </div>
    <div class="stat-number">${safeStat}</div>
    <div class="stat-label">${safeLabel}</div>
    ${safeSupporting ? `<div class="supporting-text">${safeSupporting}</div>` : ""}
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
