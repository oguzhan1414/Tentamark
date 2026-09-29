import { type ChecklistCardProps, checklistCardDimensions, escapeHtml } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { flexDirForLogoSide, fontStackFor, googleFontsHrefFor, radiusPx, shadowCss } from "../cardTokenStyles";

export function renderChecklistEditorial(
  props: ChecklistCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { title, items, subtitle, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const { width, height } = checklistCardDimensions(format);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const safe = {
    title: applyRichFormatting(title, { isDark: false }),
    subtitle: subtitle ? escapeHtml(subtitle) : "KONTROL LİSTESİ",
    brand: escapeHtml(brandName),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const itemElements = items.map((it, idx) => {
    return `<div class="check-row">
      <div class="num-box">${idx + 1}</div>
      <div class="text-content">${applyRichFormatting(it, { isDark: false })}</div>
    </div>`;
  }).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens)}" rel="stylesheet">
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
    padding: ${format === "story" ? "260px 80px 420px" : "64px 80px 56px"};
  }
  .header {
    display: flex;
    flex-direction: ${flexDirForLogoSide(layout.logoPosition)};
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E6E1D8;
    padding-bottom: 22px;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; border: 1px solid #E6E1D8; background: #fff; }
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
  .brand-name { font-family: ${bodyFont}; font-weight: 700; font-size: 22px; color: #18181B; }
  .edition { font-family: ${bodyFont}; font-weight: 700; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3AF; }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 32px 0;
  }
  .kicker {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${colors.accent};
    margin-bottom: 12px;
  }
  .title {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? "56px" : "48px"};
    line-height: 1.16;
    color: ${colors.text};
    margin-bottom: 36px;
    max-width: 900px;
  }

  .list-wrapper {
    background: ${colors.surface};
    border: 1px solid #E6E1D8;
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    padding: 32px 36px;
    box-shadow: ${shadowCss(shape.shadowStyle)};
    display: flex;
    flex-direction: column;
    gap: ${format === "story" ? "24px" : "18px"};
  }
  .check-row {
    display: flex;
    align-items: center;
    gap: 18px;
    padding-bottom: ${format === "story" ? "20px" : "16px"};
    border-bottom: 1px solid #F3F0EB;
  }
  .check-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .num-box {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #F4F1EA;
    color: #1F2937;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 14px;
    flex-shrink: 0;
  }
  .text-content {
    font-family: ${bodyFont};
    font-weight: 600;
    font-size: ${format === "story" ? "22px" : "19px"};
    line-height: 1.4;
    color: #1F2937;
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

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="edition">ADIM ADIM REHBER</span>
  </div>

  <div class="main">
    <div class="kicker">${safe.subtitle}</div>
    <h1 class="title">${safe.title}</h1>
    <div class="list-wrapper">
      ${itemElements}
    </div>
  </div>

  <div class="footer">
    <span>Daha Fazlası İçin Profilimizi İnceleyin</span>
    <span>Kaydet 🔖</span>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
