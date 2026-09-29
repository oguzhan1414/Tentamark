import { type StatCardProps, statCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderStatBrutalist(props: StatCardProps): string {
  const { statNumber, statLabel, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = statCardDimensions(format);
  const supportingText = props.supportingText?.trim();

  const safe = {
    stat: escapeHtml(statNumber),
    label: applyRichFormatting(statLabel, { isDark: false }),
    brand: escapeHtml(brandName),
    supporting: supportingText ? applyRichFormatting(supportingText, { isDark: false }) : "",
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&family=IBM+Plex+Mono:wght@700&family=IBM+Plex+Sans:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    background: #F4F2EC;
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
    background: #F4F2EC;
    background-image: radial-gradient(#00000015 1.5px, transparent 1.5px);
    background-size: 28px 28px;
    padding: ${format === "story" ? "120px 60px" : "80px 80px"};
  }
  .brutalist-box {
    position: relative;
    width: 100%;
    max-width: 900px;
    background: #FFFFFF;
    border: 5px solid #111111;
    border-radius: 24px;
    padding: ${format === "story" ? "80px 50px" : "65px 60px"};
    box-shadow: 16px 16px 0px #111111;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .sticker-badge {
    position: absolute;
    top: -24px;
    background: ${accent};
    color: #111111;
    font-family: "IBM Plex Mono", monospace;
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 8px 22px;
    border: 3px solid #111111;
    border-radius: 999px;
    box-shadow: 4px 4px 0px #111111;
  }
  .stat-number {
    font-family: "Baloo 2", sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? 210 : 180}px;
    line-height: 0.95;
    color: #111111;
    margin: 12px 0 20px;
  }
  .stat-label {
    font-family: "Baloo 2", sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? 40 : 34}px;
    line-height: 1.2;
    color: #111111;
    max-width: 85%;
  }
  .stat-supporting {
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    font-size: ${format === "story" ? 22 : 20}px;
    line-height: 1.35;
    color: #555555;
    max-width: 80%;
    margin-top: 14px;
    margin-bottom: 30px;
  }
  .brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: #111111;
    padding: 10px 22px;
    border-radius: 999px;
  }
  .brand-logo {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    object-fit: contain;
    background: #FFFFFF;
    padding: 2px;
  }
  .brand-name {
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 700;
    font-size: 17px;
    color: #FFFFFF;
    letter-spacing: 0.04em;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="brutalist-box">
      <div class="sticker-badge">⚡ METRİK ANALİZİ</div>
      <div class="stat-number">${safe.stat}</div>
      <div class="stat-label">${safe.label}</div>
      ${safe.supporting ? `<div class="stat-supporting">${safe.supporting}</div>` : ""}
      <div class="brand-pill">
        ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
        <span class="brand-name">${safe.brand}</span>
      </div>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
