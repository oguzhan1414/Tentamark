import { type StatCardProps, statCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderStatClay(props: StatCardProps): string {
  const { statNumber, statLabel, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = statCardDimensions(format);
  const supportingText = props.supportingText?.trim();

  const formattedStat = escapeHtml(statNumber);
  const formattedLabel = applyRichFormatting(statLabel, { isDark: false });
  const formattedSupport = supportingText ? applyRichFormatting(supportingText, { isDark: false }) : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #F3EFE6; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 50% 40%, #FAF8F2 0%, #EDE6D8 100%);
    padding: ${format === "story" ? "260px 72px 420px" : "90px"};
  }

  .clay-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "880px"};
    background: #FFFFFF;
    border-radius: 44px;
    padding: ${format === "story" ? "72px 48px" : "64px 60px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border: 3px solid rgba(255, 255, 255, 0.8);
    box-shadow: 
      0 32px 64px -16px rgba(80, 60, 40, 0.14),
      0 12px 28px -6px rgba(0, 0, 0, 0.04),
      inset 0 2px 4px rgba(255, 255, 255, 0.9);
  }

  .pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 999px;
    background: #FEF3C7;
    color: #92400E;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }

  .stat-number {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 900;
    font-size: ${format === "story" ? 170 : 150}px;
    line-height: 1;
    color: #1C1917;
    letter-spacing: -0.04em;
    margin-bottom: 20px;
  }

  .stat-label {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? 34 : 30}px;
    line-height: 1.35;
    color: #292524;
    max-width: 85%;
    margin-bottom: 20px;
  }

  .stat-support {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 18px;
    line-height: 1.5;
    color: #78716C;
    max-width: 80%;
    margin-bottom: 36px;
  }

  .brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 22px;
    background: #F7F5EE;
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.06);
  }
  .brand-logo {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: contain;
    background: #FFFFFF;
    padding: 2px;
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: #44403C;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <div class="clay-card">
      <div class="pill-badge">⚡ İSTATİSTİK RAPORU</div>
      <div class="stat-number">${formattedStat}</div>
      <p class="stat-label">${formattedLabel}</p>
      ${formattedSupport ? `<p class="stat-support">${formattedSupport}</p>` : ""}
      <div class="brand-pill">
        ${logoUrl ? `<img class="brand-logo" src="${logoUrl}" alt="" />` : ""}
        <span class="brand-name">${brandName}</span>
      </div>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
