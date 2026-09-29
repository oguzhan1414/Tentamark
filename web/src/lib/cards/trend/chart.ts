import { type TrendCardProps, trendCardDimensions, escapeHtml, resolveAccent, buildSparkline } from "./types";

export function renderTrendChart(props: TrendCardProps): string {
  const { statNumber, statLabel, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = trendCardDimensions(format);

  const chartWidth = Math.round(width * 0.72);
  const chartHeight = format === "story" ? 260 : 220;
  const { linePath, areaPath, endpoint } = buildSparkline(props.trendPoints, chartWidth, chartHeight);
  const gridLines = [0.25, 0.5, 0.75].map((f) => `<line x1="0" y1="${chartHeight * f}" x2="${chartWidth}" y2="${chartHeight * f}" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1" />`).join("");

  const safe = { stat: escapeHtml(statNumber), label: escapeHtml(statLabel), brand: escapeHtml(brandName) };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=IBM+Plex+Sans:wght@500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0B0A0F; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0B0A0F;
  }
  .glow {
    position: absolute;
    top: -18%;
    left: -16%;
    width: 58%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent} 0%, ${accent}00 70%);
    filter: blur(90px);
    opacity: 0.4;
  }
  .stat-number {
    position: relative;
    z-index: 1;
    font-family: "Baloo 2", sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? 150 : 128}px;
    line-height: 1;
    color: #F7F5FB;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .stat-label {
    position: relative;
    z-index: 1;
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 600;
    font-size: 24px;
    color: ${accent};
    margin-top: 10px;
    margin-bottom: 48px;
    text-align: center;
    max-width: 80%;
  }
  .chart-wrap { position: relative; z-index: 1; }
  .brand-row {
    position: absolute;
    bottom: 6%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-logo { width: 36px; height: 36px; border-radius: 10px; object-fit: contain; background: #fff; padding: 5px; }
  .brand-name { font-family: "IBM Plex Sans", sans-serif; font-weight: 600; font-size: 20px; letter-spacing: 0.02em; color: #ffffff; opacity: 0.85; }
</style>
</head>
<body>
  <div class="card">
    <div class="glow"></div>
    <p class="stat-number">${safe.stat}</p>
    <p class="stat-label">${safe.label}</p>
    <div class="chart-wrap">
      <svg width="${chartWidth}" height="${chartHeight + 10}" viewBox="0 0 ${chartWidth} ${chartHeight + 10}">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${accent}" stop-opacity="0.35" />
            <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaPath}" fill="url(#areaFill)" />
        <path d="${linePath}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${endpoint[0]}" cy="${endpoint[1]}" r="8" fill="${accent}" />
        <circle cx="${endpoint[0]}" cy="${endpoint[1]}" r="14" fill="${accent}" fill-opacity="0.25" />
      </svg>
    </div>
    <div class="brand-row">
      ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
      <span class="brand-name">${safe.brand}</span>
    </div>
  </div>
</body>
</html>`;
}
