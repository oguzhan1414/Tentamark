import { type QuoteCardProps, quoteCardDimensions, escapeHtml, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderQuoteCentered(props: QuoteCardProps): string {
  const { quote, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = quoteCardDimensions(format);
  const fontSize = fontSizeForLength(quote.length, format);
  const safeQuote = applyRichFormatting(quote, { isDark: true });
  const safeBrand = escapeHtml(brandName);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=IBM+Plex+Sans:wght@500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    background: #0B0A0F;
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
    background: #0B0A0F;
  }
  /* Signature glow — the whole reason we didn't go the no-browser route */
  .glow-primary {
    position: absolute;
    top: -18%;
    right: -14%;
    width: 62%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent} 0%, ${accent}00 70%);
    filter: blur(90px);
    opacity: 0.55;
  }
  .glow-secondary {
    position: absolute;
    bottom: -20%;
    left: -16%;
    width: 55%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #6D5BFF 0%, #6D5BFF00 70%);
    filter: blur(100px);
    opacity: 0.35;
  }
  .quote-mark {
    position: absolute;
    top: ${format === "story" ? "9%" : "8%"};
    left: 50%;
    transform: translateX(-50%);
    font-family: "Baloo 2", sans-serif;
    font-size: ${format === "story" ? 220 : 180}px;
    font-weight: 800;
    color: #ffffff;
    opacity: 0.08;
    line-height: 1;
  }
  .quote-text {
    position: relative;
    z-index: 1;
    max-width: 82%;
    font-family: "Baloo 2", sans-serif;
    font-weight: 700;
    font-size: ${fontSize}px;
    line-height: 1.28;
    color: #F7F5FB;
    text-align: center;
    letter-spacing: -0.01em;
  }
  .brand-row {
    position: absolute;
    bottom: ${format === "story" ? "7%" : "8%"};
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 1;
  }
  .brand-divider {
    position: absolute;
    bottom: ${format === "story" ? "12%" : "14%"};
    left: 50%;
    transform: translateX(-50%);
    width: 64px;
    height: 3px;
    border-radius: 999px;
    background: ${accent};
    opacity: 0.85;
  }
  .brand-logo {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: contain;
    background: #ffffff;
    padding: 6px;
  }
  .brand-name {
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 600;
    font-size: 26px;
    letter-spacing: 0.02em;
    color: #ffffff;
    opacity: 0.92;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="glow-primary"></div>
    <div class="glow-secondary"></div>
    <div class="quote-mark">&ldquo;</div>
    <p class="quote-text">${safeQuote}</p>
    <div class="brand-divider"></div>
    <div class="brand-row">
      ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
      <span class="brand-name">${safeBrand}</span>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
