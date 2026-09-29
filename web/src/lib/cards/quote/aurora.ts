import { type QuoteCardProps, quoteCardDimensions, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderQuoteAurora(props: QuoteCardProps): string {
  const { quote, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = quoteCardDimensions(format);
  const fontSize = fontSizeForLength(quote.length, format);
  const formattedQuote = applyRichFormatting(quote, { isDark: true });

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    background: #070811;
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
    background: #070811;
    padding: ${format === "story" ? "260px 72px 420px" : "90px"};
  }
  /* VisionOS Fluid Blurred Mesh */
  .orb-1 {
    position: absolute;
    top: -10%;
    left: -10%;
    width: 65%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #6366F1 0%, rgba(99, 102, 241, 0) 70%);
    filter: blur(120px);
    opacity: 0.55;
    animation: orbDrift1 9s ease-in-out infinite;
  }
  .orb-2 {
    position: absolute;
    top: 20%;
    right: -15%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #EC4899 0%, rgba(236, 72, 153, 0) 70%);
    filter: blur(130px);
    opacity: 0.45;
    animation: orbDrift2 11s ease-in-out infinite;
  }
  .orb-3 {
    position: absolute;
    bottom: -15%;
    left: 20%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #10B981 0%, rgba(16, 185, 129, 0) 70%);
    filter: blur(140px);
    opacity: 0.40;
    animation: orbDrift3 13s ease-in-out infinite;
  }
  @keyframes orbDrift1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(4%, 3%) scale(1.1); }
  }
  @keyframes orbDrift2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-3%, 4%) scale(1.08); }
  }
  @keyframes orbDrift3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(3%, -3%) scale(1.06); }
  }

  /* Frosted Glass Container */
  .glass-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "900px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${format === "story" ? "70px 50px" : "64px 60px"};
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(48px);
    -webkit-backdrop-filter: blur(48px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.35);
    border-radius: 36px;
    text-align: center;
    opacity: 0;
    animation: cardEnter 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards;
  }
  @keyframes cardEnter {
    from { opacity: 0; transform: translateY(18px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .badge-row {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    margin-bottom: 32px;
  }
  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00FF9D;
    box-shadow: 0 0 10px #00FF9D;
  }
  .badge-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.9);
  }

  .quote-text {
    font-family: 'Outfit', sans-serif;
    font-size: ${fontSize * 1.05}px;
    font-weight: 700;
    line-height: 1.32;
    color: #FFFFFF;
    text-shadow: 0 2px 24px rgba(255, 255, 255, 0.18);
    letter-spacing: -0.015em;
    margin-bottom: 40px;
  }

  .brand-row {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 10px 20px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: contain;
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 18px;
    font-weight: 700;
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
    <div class="orb-3"></div>

    <div class="glass-card">
      <div class="badge-row">
        <span class="badge-dot"></span>
        <span class="badge-text">Günün Fikri</span>
      </div>
      <p class="quote-text">${formattedQuote}</p>
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
