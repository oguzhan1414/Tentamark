import { type MatrixCardProps, matrixCardDimensions, escapeHtml } from "./types";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { flexDirForLogoSide, fontStackFor, googleFontsHrefFor, radiusPx, shadowCss } from "../cardTokenStyles";

export function renderMatrixEditorial(props: MatrixCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { title, q1Label, q1Text, q2Label, q2Text, q3Label, q3Text, q4Label, q4Text, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const { width, height } = matrixCardDimensions(format);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const safe = {
    title: escapeHtml(title),
    brand: escapeHtml(brandName),
    q1L: escapeHtml(q1Label),
    q1T: escapeHtml(q1Text),
    q2L: escapeHtml(q2Label),
    q2T: escapeHtml(q2Text),
    q3L: escapeHtml(q3Label),
    q3T: escapeHtml(q3Text),
    q4L: escapeHtml(q4Label),
    q4T: escapeHtml(q4Text),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

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
  .badge { font-family: ${bodyFont}; font-weight: 700; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3AF; }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 28px 0;
  }
  .kicker {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${colors.accent};
    text-align: center;
    margin-bottom: 8px;
  }
  .title {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? "54px" : "44px"};
    line-height: 1.15;
    color: ${colors.text};
    margin-bottom: 32px;
    text-align: center;
  }

  .matrix-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: #E6E1D8;
    gap: 1px;
    border: 1px solid #E6E1D8;
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    overflow: hidden;
    box-shadow: ${shadowCss(shape.shadowStyle)};
  }
  .quadrant {
    background: ${colors.surface};
    padding: ${format === "story" ? "32px 28px" : "26px 28px"};
    display: flex;
    flex-direction: column;
  }
  .q-label {
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${colors.text};
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .q-dot { width: 6px; height: 6px; border-radius: 50%; background: ${colors.accent}; }
  .q-text {
    font-family: ${bodyFont};
    font-weight: 600;
    font-size: ${format === "story" ? "20px" : "17px"};
    line-height: 1.45;
    color: #4B5563;
    white-space: pre-wrap;
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
  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="badge">STRATEJİK MATRİS</span>
  </div>

  <div class="main">
    <div class="kicker">HIZLI BAŞVURU KILAVUZU</div>
    <h1 class="title">${safe.title}</h1>

    <div class="matrix-box">
      <div class="quadrant">
        <div class="q-label"><span class="q-dot"></span> ${safe.q1L}</div>
        <div class="q-text">${safe.q1T}</div>
      </div>

      <div class="quadrant">
        <div class="q-label"><span class="q-dot"></span> ${safe.q2L}</div>
        <div class="q-text">${safe.q2T}</div>
      </div>

      <div class="quadrant">
        <div class="q-label"><span class="q-dot"></span> ${safe.q3L}</div>
        <div class="q-text">${safe.q3T}</div>
      </div>

      <div class="quadrant">
        <div class="q-label"><span class="q-dot"></span> ${safe.q4L}</div>
        <div class="q-text">${safe.q4T}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Kategorize Edilmiş Liste</span>
    <span>Kaydetmeyi Unutmayın 🔖</span>
  </div>
</div>
</body>
</html>`;
}
