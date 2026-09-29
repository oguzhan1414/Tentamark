import { type QuoteCardProps, quoteCardDimensions, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderQuoteClay(props: QuoteCardProps): string {
  const { quote, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = quoteCardDimensions(format);
  const fontSize = fontSizeForLength(quote.length, format);
  const formattedQuote = applyRichFormatting(quote, { isDark: false });

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    background: #F3EFE6;
    overflow: hidden;
  }
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
    max-width: ${format === "story" ? "920px" : "900px"};
    background: #FFFFFF;
    border-radius: 44px;
    padding: ${format === "story" ? "72px 52px" : "68px 64px"};
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

  .quote-icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: #FEF3C7;
    color: #D97706;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 900;
    margin-bottom: 28px;
    box-shadow: 0 8px 18px rgba(217, 119, 6, 0.15);
  }

  .quote-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: ${fontSize * 1.02}px;
    font-weight: 800;
    line-height: 1.34;
    color: #1C1917;
    letter-spacing: -0.02em;
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }
  .brand-logo {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: contain;
    background: #FFFFFF;
    padding: 3px;
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
      <div class="quote-icon">“</div>
      <p class="quote-text">${formattedQuote}</p>
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
