import { type ComparisonCardProps, comparisonCardDimensions, escapeHtml, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

// Square splits left/right; story splits top/bottom — a straight left/right
// cut on a 1080x1920 canvas would leave each side a cramped 540px-wide
// column, so the split axis follows the format instead of staying fixed.
export function renderComparisonSplit(props: ComparisonCardProps): string {
  const { leftLabel, leftText, rightLabel, rightText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = comparisonCardDimensions(format);
  const vertical = format === "story";
  const leftFont = fontSizeForLength(leftText.length);
  const rightFont = fontSizeForLength(rightText.length);

  const safe = {
    leftLabel: escapeHtml(leftLabel),
    leftText: applyRichFormatting(leftText, { isDark: true, circleColor: "#E5484D" }),
    rightLabel: escapeHtml(rightLabel),
    rightText: applyRichFormatting(rightText, { isDark: true, highlightColor: "#00FF9D", circleColor: accent, underlineColor: "#00FF9D" }),
    brand: escapeHtml(brandName),
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
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: ${vertical ? "column" : "row"};
    background: #0B0A0F;
  }
  .side {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 56px;
    overflow: hidden;
  }
  .side.old {
    background: #17151A;
  }
  .side.old::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, #E5484D 0%, #E5484D00 65%);
    opacity: 0.16;
  }
  .side.new {
    background: #0B0A0F;
  }
  .side.new::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 70% 70%, ${accent} 0%, ${accent}00 65%);
    opacity: 0.5;
    filter: blur(10px);
  }
  .label {
    position: relative;
    z-index: 1;
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 22px;
  }
  .side.old .label { color: #E5484D; opacity: 0.85; }
  .side.new .label { color: ${accent}; }
  .side-text {
    position: relative;
    z-index: 1;
    font-family: "Baloo 2", sans-serif;
    font-weight: 700;
    text-align: center;
    line-height: 1.32;
    max-width: 90%;
  }
  .side.old .side-text { color: #C9C4CC; }
  .side.new .side-text { color: #F7F5FB; }

  .vs-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    width: 84px;
    height: 84px;
    border-radius: 50%;
    background: #0B0A0F;
    border: 3px solid ${accent};
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: "Baloo 2", sans-serif;
    font-weight: 800;
    font-size: 24px;
    color: ${accent};
    box-shadow: 0 0 32px ${accent}80;
  }

  .brand-row {
    position: absolute;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
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
    <div class="side old">
      <span class="label">${safe.leftLabel}</span>
      <p class="side-text" style="font-size:${leftFont}px">${safe.leftText}</p>
    </div>
    <div class="side new">
      <span class="label">${safe.rightLabel}</span>
      <p class="side-text" style="font-size:${rightFont}px">${safe.rightText}</p>
    </div>
    <div class="vs-badge">VS</div>
    <div class="brand-row">
      ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
      <span class="brand-name">${safe.brand}</span>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
