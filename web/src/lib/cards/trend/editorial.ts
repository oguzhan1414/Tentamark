import { type TrendCardProps, trendCardDimensions, escapeHtml, buildSparkline } from "./types";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { flexDirForLogoSide, fontStackFor, googleFontsHrefFor, radiusPx, shadowCss } from "../cardTokenStyles";

export function renderTrendEditorial(props: TrendCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { statNumber, statLabel, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const accent = colors.accent;
  const { width, height } = trendCardDimensions(format);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const chartWidth = Math.round(width * 0.76);
  const chartHeight = format === "story" ? 300 : 250;
  const { linePath, areaPath, endpoint } = buildSparkline(props.trendPoints, chartWidth, chartHeight);
  const gridLines = [0.25, 0.5, 0.75].map((f) => `<line x1="0" y1="${chartHeight * f}" x2="${chartWidth}" y2="${chartHeight * f}" stroke="#E5E7EB" stroke-width="1.5" stroke-dasharray="4 4" />`).join("");

  const safe = {
    stat: escapeHtml(statNumber),
    label: escapeHtml(statLabel),
    brand: escapeHtml(brandName),
  };

  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${brandName ? brandName.charAt(0).toUpperCase() : "T"}</div>`;

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
    padding: ${format === "story" ? "100px 72px 80px" : "72px 80px 60px"};
  }
  .header {
    display: flex;
    flex-direction: ${flexDirForLogoSide(layout.logoPosition)};
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E5E1D8;
    padding-bottom: 24px;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #E5E1D8;
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
  .badge {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${accent};
    background: ${accent}15;
    border: 1px solid ${accent}40;
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
  }
  .stat-number {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? 140 : 120}px;
    line-height: 1;
    color: ${colors.text};
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }
  .stat-label {
    font-family: ${bodyFont};
    font-weight: 600;
    font-size: 24px;
    color: #4B5563;
    margin-bottom: 48px;
    text-align: center;
  }

  .chart-container {
    width: ${chartWidth}px;
    background: ${colors.surface};
    border: 1px solid #E5E1D8;
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    padding: 24px 28px;
    box-shadow: ${shadowCss(shape.shadowStyle)};
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #E5E1D8;
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
    <div class="badge">TREND ANALİZİ</div>
  </div>

  <div class="main">
    <div class="stat-number">${safe.stat}</div>
    <div class="stat-label">${safe.label}</div>

    <div class="chart-container">
      <svg width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${accent}" stop-opacity="0.22" />
            <stop offset="100%" stop-color="${accent}" stop-opacity="0.01" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaPath}" fill="url(#areaGrad)" />
        <path d="${linePath}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${endpoint[0]}" cy="${endpoint[1]}" r="8" fill="#FFFFFF" stroke="${accent}" stroke-width="4" />
      </svg>
    </div>
  </div>

  <div class="footer">
    <span>Performans Raporu</span>
    <span>Veriye Dayalı Büyüme 📈</span>
  </div>
</div>
</body>
</html>`;
}
