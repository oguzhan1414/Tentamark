import { type TrendCardProps, trendCardDimensions, escapeHtml, resolveAccent, buildSparkline } from "./types";

export function renderTrendBrutalist(props: TrendCardProps): string {
  const { statNumber, statLabel, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = trendCardDimensions(format);

  const chartWidth = Math.round(width * 0.76);
  const chartHeight = format === "story" ? 280 : 230;
  const { linePath, areaPath, endpoint } = buildSparkline(props.trendPoints, chartWidth, chartHeight);

  const safe = {
    stat: escapeHtml(statNumber),
    label: escapeHtml(statLabel),
    brand: escapeHtml(brandName),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const avatarHtml = logoUrl
    ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="${safe.brand}" />`
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
  html, body { width: ${width}px; height: ${height}px; background: #FFFDEB; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #FFFDEB;
    padding: ${format === "story" ? "90px 64px 80px" : "64px 72px 56px"};
  }
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, #0000000f 1px, transparent 1px),
                      linear-gradient(to bottom, #0000000f 1px, transparent 1px);
    background-size: 36px 36px;
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
  .tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    background: #00E599;
    color: #111111;
    padding: 6px 12px;
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
    padding: ${format === "story" ? "56px 48px" : "44px 48px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 36px 0;
  }
  .stat-number {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? 144 : 124}px;
    line-height: 1;
    color: #111111;
    letter-spacing: -0.03em;
  }
  .stat-label {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 22px;
    color: #444444;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 8px;
    margin-bottom: 36px;
    text-align: center;
  }

  .chart-wrapper {
    width: ${chartWidth}px;
    border: 3px solid #111111;
    border-radius: 16px;
    background: #FFFDF9;
    padding: 16px 20px;
    box-shadow: 4px 4px 0px #111111;
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
</style>
</head>
<body>
<div class="card">
  <div class="grid-pattern"></div>
  <div class="header">
    <div class="brand-row">
      ${avatarHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <div class="tag">METRİK RAPORU</div>
  </div>

  <div class="main-box">
    <div class="stat-number">${safe.stat}</div>
    <div class="stat-label">${safe.label}</div>

    <div class="chart-wrapper">
      <svg width="${chartWidth}" height="${chartHeight}" viewBox="0 0 ${chartWidth} ${chartHeight}">
        <defs>
          <linearGradient id="areaGradB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#FFE600" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#FFE600" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#areaGradB)" />
        <path d="${linePath}" fill="none" stroke="#111111" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${endpoint[0]}" cy="${endpoint[1]}" r="10" fill="${accent}" stroke="#111111" stroke-width="4" />
      </svg>
    </div>
  </div>

  <div class="footer">
    <span>[#GROWTH]</span>
    <span>TAKİP ET VE UYGULA 🚀</span>
  </div>
</div>
</body>
</html>`;
}
