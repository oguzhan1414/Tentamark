import { type QuoteCardProps, quoteCardDimensions, escapeHtml, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderQuoteBrutalist(props: QuoteCardProps): string {
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
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&family=IBM+Plex+Mono:wght@600;700&family=IBM+Plex+Sans:wght@700&display=swap" rel="stylesheet">
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
    padding: ${format === "story" ? "80px 50px" : "70px 60px"};
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
  .quote-text {
    font-family: "Baloo 2", sans-serif;
    font-weight: 800;
    font-size: ${Math.round(fontSize * 0.95)}px;
    line-height: 1.25;
    color: #111111;
    margin-bottom: 36px;
    word-break: break-word;
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
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: contain;
    background: #FFFFFF;
    padding: 2px;
  }
  .brand-name {
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: #FFFFFF;
    letter-spacing: 0.04em;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="brutalist-box">
      <div class="sticker-badge">❝ ALINTI</div>
      <p class="quote-text">&ldquo;${safeQuote}&rdquo;</p>
      <div class="brand-pill">
        ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
        <span class="brand-name">${safeBrand}</span>
      </div>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
