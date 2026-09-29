import { type ComparisonCardProps, comparisonCardDimensions, escapeHtml, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderComparisonBrutalist(props: ComparisonCardProps): string {
  const { leftLabel, leftText, rightLabel, rightText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = comparisonCardDimensions(format);
  const vertical = format === "story";
  const leftFont = fontSizeForLength(leftText.length);
  const rightFont = fontSizeForLength(rightText.length);

  const safe = {
    leftLabel: escapeHtml(leftLabel),
    leftText: applyRichFormatting(leftText, { isDark: false }),
    rightLabel: escapeHtml(rightLabel),
    rightText: applyRichFormatting(rightText, { isDark: false, circleColor: accent, underlineColor: accent }),
    brand: escapeHtml(brandName),
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
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: #F4F2EC; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: ${vertical ? "column" : "row"};
    background: #F4F2EC;
    background-image: radial-gradient(#00000018 1.5px, transparent 1.5px);
    background-size: 26px 26px;
    padding: ${vertical ? "50px 40px" : "50px 50px"};
    gap: 30px;
  }
  .box {
    position: relative;
    flex: 1;
    background: #FFFFFF;
    border: 4px solid #111111;
    border-radius: 20px;
    box-shadow: 10px 10px 0px #111111;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 36px;
    text-align: center;
  }
  .box.new {
    background: #FFFFFF;
    border-color: #111111;
  }
  .sticker {
    position: absolute;
    top: -20px;
    font-family: "IBM Plex Mono", monospace;
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 6px 18px;
    border: 3px solid #111111;
    border-radius: 999px;
    box-shadow: 4px 4px 0px #111111;
  }
  .box.old .sticker {
    background: #FF5A5F;
    color: #FFFFFF;
  }
  .box.new .sticker {
    background: ${accent};
    color: #111111;
  }
  .content {
    font-family: "Baloo 2", sans-serif;
    font-weight: 800;
    line-height: 1.25;
    color: #111111;
  }
  .box.old .content {
    font-size: ${Math.round(leftFont * 0.9)}px;
    opacity: 0.85;
  }
  .box.new .content {
    font-size: ${Math.round(rightFont * 0.95)}px;
  }
  .vs-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 20;
    background: #111111;
    color: #FFE600;
    font-family: "IBM Plex Mono", monospace;
    font-weight: 700;
    font-size: 18px;
    padding: 8px 18px;
    border-radius: 999px;
    border: 3px solid #FFE600;
    box-shadow: 4px 4px 0px #111111;
  }
  .brand-bar {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: #111111;
    color: #FFF;
    padding: 4px 14px;
    border-radius: 999px;
    font-family: "IBM Plex Sans", sans-serif;
    font-size: 12px;
    font-weight: 700;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="box old">
      <div class="sticker">✕ ${safe.leftLabel}</div>
      <p class="content">${safe.leftText}</p>
    </div>
    <div class="vs-badge">VS</div>
    <div class="box new">
      <div class="sticker">⚡ ${safe.rightLabel}</div>
      <p class="content">${safe.rightText}</p>
    </div>
    <div class="brand-bar">
      <span>${safe.brand}</span>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
