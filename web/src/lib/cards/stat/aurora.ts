import { type StatCardProps, statCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderStatAurora(props: StatCardProps): string {
  const { statNumber, statLabel, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = statCardDimensions(format);
  const supportingText = props.supportingText?.trim();

  const formattedStat = escapeHtml(statNumber);
  const formattedLabel = applyRichFormatting(statLabel, { isDark: true });
  const formattedSupport = supportingText ? applyRichFormatting(supportingText, { isDark: true }) : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #070811; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #070811;
    padding: ${format === "story" ? "260px 72px 420px" : "90px"};
  }

  .orb-1 {
    position: absolute;
    top: -15%;
    right: -10%;
    width: 70%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #6366F1 0%, rgba(99, 102, 241, 0) 70%);
    filter: blur(130px);
    opacity: 0.55;
  }
  .orb-2 {
    position: absolute;
    bottom: -15%;
    left: -10%;
    width: 65%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #EC4899 0%, rgba(236, 72, 153, 0) 70%);
    filter: blur(140px);
    opacity: 0.45;
  }

  .glass-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "880px"};
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(48px);
    -webkit-backdrop-filter: blur(48px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35);
    border-radius: 40px;
    padding: ${format === "story" ? "72px 48px" : "64px 60px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .badge-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 24px;
  }
  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00FF9D;
    box-shadow: 0 0 8px #00FF9D;
  }

  .stat-number {
    font-family: 'Outfit', sans-serif;
    font-weight: 900;
    font-size: ${format === "story" ? 170 : 150}px;
    line-height: 1;
    background: linear-gradient(135deg, #FFFFFF 30%, #E2E8F0 60%, rgba(255,255,255,0.7) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 4px 28px rgba(255, 255, 255, 0.25));
    letter-spacing: -0.04em;
    margin-bottom: 20px;
  }

  .stat-label {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: ${format === "story" ? 36 : 32}px;
    line-height: 1.3;
    color: #F8FAFC;
    max-width: 85%;
    margin-bottom: 24px;
  }

  .stat-support {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 20px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.7);
    max-width: 80%;
    margin-bottom: 36px;
  }

  .brand-row {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 22px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
  .brand-logo {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    object-fit: contain;
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0.02em;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <div class="orb-1"></div>
    <div class="orb-2"></div>

    <div class="glass-card">
      <div class="badge-tag">
        <span class="badge-dot"></span>
        <span>Başarı Metriği</span>
      </div>
      <div class="stat-number">${formattedStat}</div>
      <p class="stat-label">${formattedLabel}</p>
      ${formattedSupport ? `<p class="stat-support">${formattedSupport}</p>` : ""}
      <div class="brand-row">
        ${logoUrl ? `<img class="brand-logo" src="${logoUrl}" alt="" />` : ""}
        <span class="brand-name">${brandName}</span>
      </div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
