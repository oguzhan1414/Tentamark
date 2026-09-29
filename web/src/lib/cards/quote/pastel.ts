import { type QuoteCardProps, quoteCardDimensions, escapeHtml, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderQuotePastel(props: QuoteCardProps): string {
  const { quote, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = quoteCardDimensions(format);
  const fontSize = fontSizeForLength(quote.length, format);
  const safeQuote = applyRichFormatting(quote, { isDark: false });
  const safeBrand = escapeHtml(brandName);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=IBM+Plex+Sans:wght@600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    background: #FFF7ED;
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
    background: linear-gradient(145deg, #FFF9F2 0%, #FEE2E2 40%, #EDE9FE 100%);
    padding: ${format === "story" ? "120px 60px" : "80px 80px"};
  }
  .organic-orb-1 {
    position: absolute;
    top: 5%;
    left: 10%;
    width: 480px;
    height: 480px;
    border-radius: 50%;
    background: ${accent};
    filter: blur(120px);
    opacity: 0.18;
  }
  .organic-orb-2 {
    position: absolute;
    bottom: 8%;
    right: 8%;
    width: 420px;
    height: 420px;
    border-radius: 50%;
    background: #C4B5FD;
    filter: blur(110px);
    opacity: 0.25;
  }
  .glass-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 920px;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(30px);
    border: 2px solid rgba(255, 255, 255, 0.85);
    border-radius: 36px;
    padding: ${format === "story" ? "80px 50px" : "70px 65px"};
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .pastel-badge {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    color: ${accent};
    margin-bottom: 28px;
  }
  .quote-text {
    font-family: "Plus Jakarta Sans", sans-serif;
    font-weight: 700;
    font-size: ${Math.round(fontSize * 0.92)}px;
    line-height: 1.32;
    color: #332A38;
    margin-bottom: 36px;
    letter-spacing: -0.015em;
  }
  .brand-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 999px;
    border: 1px solid rgba(0, 0, 0, 0.04);
  }
  .brand-logo {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: contain;
  }
  .brand-name {
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: #4A4050;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="organic-orb-1"></div>
    <div class="organic-orb-2"></div>
    <div class="glass-card">
      <div class="pastel-badge">❝</div>
      <p class="quote-text">${safeQuote}</p>
      <div class="brand-row">
        ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
        <span class="brand-name">${safeBrand}</span>
      </div>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
