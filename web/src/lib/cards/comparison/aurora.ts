import { type ComparisonCardProps, comparisonCardDimensions, escapeHtml, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderComparisonAurora(props: ComparisonCardProps): string {
  const { leftLabel, leftText, rightLabel, rightText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = comparisonCardDimensions(format);
  const vertical = format === "story";
  const leftFont = fontSizeForLength(leftText.length);
  const rightFont = fontSizeForLength(rightText.length);

  const safe = {
    leftLabel: escapeHtml(leftLabel),
    leftText: applyRichFormatting(leftText, { isDark: true, circleColor: "#FF4757" }),
    rightLabel: escapeHtml(rightLabel),
    rightText: applyRichFormatting(rightText, { isDark: true, highlightColor: "#00FF9D", circleColor: "#00F0FF", underlineColor: "#00FF9D" }),
    brand: escapeHtml(brandName),
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #070811; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: ${vertical ? "column" : "row"};
    background: #070811;
    padding: ${vertical ? "260px 72px 420px" : "80px"};
    gap: 32px;
    align-items: center;
    justify-content: center;
  }

  .orb-1 {
    position: absolute;
    top: -10%;
    left: -10%;
    width: 65%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #EF4444 0%, transparent 65%);
    filter: blur(140px);
    opacity: 0.35;
  }
  .orb-2 {
    position: absolute;
    bottom: -10%;
    right: -10%;
    width: 65%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #10B981 0%, transparent 65%);
    filter: blur(140px);
    opacity: 0.4;
  }

  .side-card {
    position: relative;
    z-index: 10;
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${vertical ? "36px 40px" : "48px 44px"};
    border-radius: 32px;
    text-align: center;
    backdrop-filter: blur(36px);
    -webkit-backdrop-filter: blur(36px);
  }
  .side-old {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(239, 68, 68, 0.25);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  }
  .side-new {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(16, 185, 129, 0.4);
    box-shadow: 0 20px 60px rgba(0, 255, 157, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .side-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border-radius: 999px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .badge-old {
    background: rgba(239, 68, 68, 0.12);
    color: #F87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  .badge-new {
    background: rgba(16, 185, 129, 0.15);
    color: #34D399;
    border: 1px solid rgba(16, 185, 129, 0.4);
    box-shadow: 0 0 14px rgba(16, 185, 129, 0.25);
  }

  .text-content {
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: -0.01em;
  }
  .text-old {
    font-size: ${Math.round(leftFont * 0.95)}px;
    color: rgba(255, 255, 255, 0.65);
  }
  .text-new {
    font-size: ${Math.round(rightFont * 1.02)}px;
    color: #FFFFFF;
    text-shadow: 0 2px 20px rgba(255, 255, 255, 0.18);
  }

  .vs-circle {
    position: absolute;
    ${vertical ? "top: 50%; left: 50%;" : "top: 50%; left: 50%;"}
    transform: translate(-50%, -50%);
    z-index: 20;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #0B0A14;
    border: 2px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Outfit', sans-serif;
    font-weight: 900;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0.05em;
  }

  .brand-tag {
    position: absolute;
    bottom: ${vertical ? "340px" : "32px"};
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .brand-logo {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    object-fit: contain;
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #FFFFFF;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <div class="orb-1"></div>
    <div class="orb-2"></div>

    <div class="side-card side-old">
      <div class="side-badge badge-old">&#x2715; ${safe.leftLabel}</div>
      <p class="text-content text-old">${safe.leftText}</p>
    </div>

    <div class="vs-circle">VS</div>

    <div class="side-card side-new">
      <div class="side-badge badge-new">&#x2713; ${safe.rightLabel}</div>
      <p class="text-content text-new">${safe.rightText}</p>
    </div>

    <div class="brand-tag">
      ${logoUrl ? `<img class="brand-logo" src="${logoUrl}" alt="" />` : ""}
      <span class="brand-name">${safe.brand}</span>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
