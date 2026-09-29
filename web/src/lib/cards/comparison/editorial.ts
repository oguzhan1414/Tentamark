import { type ComparisonCardProps, comparisonCardDimensions, escapeHtml, fontSizeForLength } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { alignForLogoSide, fontStackFor, googleFontsHrefFor } from "../cardTokenStyles";

export function renderComparisonEditorial(
  props: ComparisonCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { leftLabel, leftText, rightLabel, rightText, brandName, logoUrl, format } = props;
  const { colors, typography, layout } = tokens;
  const { width, height } = comparisonCardDimensions(format);
  const vertical = format === "story";
  const leftFont = fontSizeForLength(leftText.length);
  const rightFont = fontSizeForLength(rightText.length);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const safe = {
    leftLabel: escapeHtml(leftLabel),
    leftText: applyRichFormatting(leftText, { isDark: false }),
    rightLabel: escapeHtml(rightLabel),
    rightText: applyRichFormatting(rightText, { isDark: false, circleColor: colors.accent, underlineColor: colors.accent }),
    brand: escapeHtml(brandName),
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens)}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: ${colors.background}; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: ${vertical ? "column" : "row"};
    background: ${colors.background};
  }
  .side {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${vertical ? "60px 50px" : "80px 60px"};
    text-align: center;
  }
  .side.old {
    background: ${colors.background};
    border-${vertical ? "bottom" : "right"}: 1px solid rgba(0, 0, 0, 0.08);
  }
  .side.new {
    background: ${colors.surface};
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 999px;
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 28px;
  }
  .side.old .pill {
    background: #EAE8E1;
    color: #6B685F;
  }
  .side.new .pill {
    background: ${colors.accent}18;
    color: ${colors.accent};
    border: 1px solid ${colors.accent}40;
  }
  .content {
    font-family: ${bodyFont};
    font-weight: 600;
    line-height: 1.38;
    max-width: 85%;
  }
  .side.old .content {
    font-size: ${Math.round(leftFont * 0.95)}px;
    color: #55524B;
  }
  .side.new .content {
    font-size: ${Math.round(rightFont * 0.95)}px;
    color: ${colors.text};
    font-weight: 700;
  }
  .vs-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: ${colors.text};
    color: #FFFFFF;
    font-family: ${headingFont};
    font-weight: 700;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  }
  .brand-bottom {
    position: absolute;
    bottom: ${vertical ? "3%" : "4%"};
    ${alignForLogoSide(layout.logoPosition) === "flex-end" ? "right" : "left"}: 5%;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 5;
  }
  .brand-logo {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: contain;
    background: #FFF;
    border: 1px solid rgba(0,0,0,0.08);
    padding: 2px;
  }
  .brand-name {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #777;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="side old">
      <div class="pill">✕ ${safe.leftLabel}</div>
      <p class="content">${safe.leftText}</p>
    </div>
    <div class="vs-badge">vs</div>
    <div class="side new">
      <div class="pill">✓ ${safe.rightLabel}</div>
      <p class="content">${safe.rightText}</p>
    </div>
    <div class="brand-bottom">
      ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
      <span class="brand-name">${safe.brand}</span>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
