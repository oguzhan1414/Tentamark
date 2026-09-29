import { type StatCardProps, statCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

// No chart competing for space (that's trend/chart.ts) — the number gets to
// be the whole page. A distinct feel from Trend, not just Trend-minus-graph:
// bigger type, a badge icon standing in for the visual weight the chart
// would otherwise carry.
export function renderStatHero(props: StatCardProps): string {
  const { statNumber, statLabel, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = statCardDimensions(format);
  const supportingText = props.supportingText?.trim();

  const safe = {
    stat: escapeHtml(statNumber),
    label: applyRichFormatting(statLabel, { isDark: true }),
    brand: escapeHtml(brandName),
    supporting: supportingText ? applyRichFormatting(supportingText, { isDark: true }) : "",
  };

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
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent} 0%, ${accent}00 65%);
    filter: blur(110px);
    opacity: 0.45;
  }
  .badge {
    position: relative;
    z-index: 1;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: ${accent}1f;
    border: 2px solid ${accent};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 36px;
  }
  .stat-number {
    position: relative;
    z-index: 1;
    font-family: "Baloo 2", sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? 220 : 190}px;
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
    font-size: 28px;
    color: ${accent};
    margin-top: 18px;
    text-align: center;
    max-width: 80%;
  }
  .supporting {
    position: relative;
    z-index: 1;
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    font-size: 20px;
    color: rgba(247,245,251,0.55);
    margin-top: 16px;
    text-align: center;
    max-width: 70%;
    line-height: 1.5;
  }
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

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="glow"></div>
    <div class="badge">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-9 9-5-5-5 5"/></svg>
    </div>
    <p class="stat-number">${safe.stat}</p>
    <p class="stat-label">${safe.label}</p>
    ${safe.supporting ? `<p class="supporting">${safe.supporting}</p>` : ""}
    <div class="brand-row">
      ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
      <span class="brand-name">${safe.brand}</span>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
