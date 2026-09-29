import { type FeatureTableCardProps, featureTableCardDimensions, escapeHtml } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { flexDirForLogoSide, fontStackFor, googleFontsHrefFor, radiusPx, shadowCss } from "../cardTokenStyles";

export function renderFeatureTableEditorial(
  props: FeatureTableCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { title, feature1, competitor1, tentamark1, feature2, competitor2, tentamark2, feature3, competitor3, tentamark3, feature4, competitor4, tentamark4, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const { width, height } = featureTableCardDimensions(format);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const safe = {
    title: applySmartHighlights(title),
    brand: escapeHtml(brandName),
    f1: escapeHtml(feature1),
    c1: escapeHtml(competitor1),
    t1: escapeHtml(tentamark1),
    f2: escapeHtml(feature2),
    c2: escapeHtml(competitor2),
    t2: escapeHtml(tentamark2),
    f3: escapeHtml(feature3),
    c3: escapeHtml(competitor3),
    t3: escapeHtml(tentamark3),
    f4: feature4 ? escapeHtml(feature4) : "",
    c4: competitor4 ? escapeHtml(competitor4) : "",
    t4: tentamark4 ? escapeHtml(tentamark4) : "",
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const rows = [
    { f: safe.f1, c: safe.c1, t: safe.t1 },
    { f: safe.f2, c: safe.c2, t: safe.t2 },
    { f: safe.f3, c: safe.c3, t: safe.t3 },
  ];
  if (safe.f4 && safe.c4 && safe.t4) {
    rows.push({ f: safe.f4, c: safe.c4, t: safe.t4 });
  }

  const tableRowsHtml = rows.map((r) => `
    <div class="row">
      <div class="col feat">${r.f}</div>
      <div class="col comp">${r.c}</div>
      <div class="col tenta">${r.t}</div>
    </div>
  `).join("");

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
  ${SMART_HIGHLIGHT_CSS}

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
    margin-bottom: 10px;
  }
  .title {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? "56px" : "48px"};
    line-height: 1.15;
    color: ${colors.text};
    margin-bottom: 36px;
  }

  .table-card {
    background: ${colors.surface};
    border: 1px solid #E6E1D8;
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    overflow: hidden;
    box-shadow: ${shadowCss(shape.shadowStyle)};
  }
  .head-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1.1fr;
    background: #F8F7F4;
    border-bottom: 1px solid #E6E1D8;
    padding: 18px 24px;
    font-family: ${bodyFont};
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #6B7280;
  }
  .head-row .highlight-head {
    color: ${colors.text};
  }

  .row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1.1fr;
    padding: ${format === "story" ? "24px 24px" : "18px 24px"};
    border-bottom: 1px solid #F3F0EB;
    align-items: center;
    font-family: ${bodyFont};
  }
  .row:last-child {
    border-bottom: none;
  }
  .feat {
    font-weight: 700;
    font-size: ${format === "story" ? "20px" : "17px"};
    color: #1F2937;
  }
  .comp {
    font-weight: 600;
    font-size: ${format === "story" ? "18px" : "16px"};
    color: #6B7280;
  }
  .tenta {
    font-weight: 800;
    font-size: ${format === "story" ? "19px" : "17px"};
    color: ${colors.accent};
    background: ${colors.accent}15;
    padding: 8px 14px;
    border-radius: 12px;
    border: 1px solid ${colors.accent}40;
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
</style>
</head>
<body>
<div class="card">
  ${FILM_GRAIN_OVERLAY}

  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="edition">KARŞILAŞTIRMALI DEĞERLENDİRME</span>
  </div>

  <div class="main">
    <div class="kicker">ÖZELLİK ANALİZİ</div>
    <h1 class="title">${safe.title}</h1>

    <div class="table-card">
      <div class="head-row">
        <div>Kriter</div>
        <div>Geleneksel</div>
        <div class="highlight-head">✨ ${safe.brand}</div>
      </div>
      ${tableRowsHtml}
    </div>
  </div>

  <div class="footer">
    <span>Kapsamlı Karar Tablosu</span>
    <span>Kaydetmeyi Unutmayın 🔖</span>
  </div>
</div>
</body>
</html>`;
}
