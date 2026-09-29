import { type QuoteCardProps, quoteCardDimensions, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderQuoteCyber(props: QuoteCardProps): string {
  const { quote, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = quoteCardDimensions(format);
  const fontSize = fontSizeForLength(quote.length, format);
  const formattedQuote = applyRichFormatting(quote, { isDark: true, highlightColor: "#00FF9D", circleColor: "#00F0FF", underlineColor: "#00FF9D" });

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    background: #06070A;
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
    background: #06070A;
    background-image:
      linear-gradient(to right, rgba(0, 255, 157, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 255, 157, 0.05) 1px, transparent 1px);
    background-size: 36px 36px;
    padding: ${format === "story" ? "260px 72px 420px" : "90px"};
  }

  .terminal-box {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "900px"};
    background: rgba(12, 14, 20, 0.92);
    border: 1px solid rgba(0, 255, 157, 0.35);
    border-radius: 24px;
    box-shadow: 
      0 0 50px rgba(0, 255, 157, 0.08),
      0 24px 64px rgba(0, 0, 0, 0.7),
      inset 0 1px 0 rgba(0, 255, 157, 0.3);
    overflow: hidden;
  }

  .terminal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: rgba(0, 255, 157, 0.04);
    border-bottom: 1px solid rgba(0, 255, 157, 0.15);
  }
  .window-dots {
    display: flex;
    gap: 8px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot-red { background: #FF5F56; }
  .dot-yellow { background: #FFBD2E; }
  .dot-green { background: #27C93F; }

  .terminal-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    color: #00FF9D;
    letter-spacing: 0.08em;
    opacity: 0.85;
  }

  .terminal-body {
    padding: ${format === "story" ? "64px 44px" : "56px 52px"};
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .prompt-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    color: #00F0FF;
    margin-bottom: 24px;
  }
  .cursor-blink {
    display: inline-block;
    width: 8px;
    height: 18px;
    background: #00FF9D;
    box-shadow: 0 0 8px #00FF9D;
  }

  .quote-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: ${fontSize * 0.98}px;
    font-weight: 600;
    line-height: 1.45;
    color: #ECFDF5;
    letter-spacing: -0.01em;
    margin-bottom: 40px;
  }

  .brand-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-top: 24px;
    border-top: 1px dashed rgba(0, 255, 157, 0.2);
  }
  .brand-id {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-logo {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    object-fit: contain;
    background: #00FF9D;
    padding: 2px;
  }
  .brand-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    color: #FFFFFF;
  }
  .status-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #00FF9D;
    background: rgba(0, 255, 157, 0.1);
    border: 1px solid rgba(0, 255, 157, 0.3);
    padding: 6px 12px;
    border-radius: 999px;
    letter-spacing: 0.05em;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <div class="terminal-box">
      <div class="terminal-header">
        <div class="window-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <span class="terminal-title">bash &mdash; insight.sh</span>
        <div style="width: 52px;"></div>
      </div>
      <div class="terminal-body">
        <div class="prompt-row">
          <span>&gt;_ output</span>
          <span class="cursor-blink"></span>
        </div>
        <p class="quote-text">${formattedQuote}</p>
        <div class="brand-footer">
          <div class="brand-id">
            ${logoUrl ? `<img class="brand-logo" src="${logoUrl}" alt="" />` : ""}
            <span class="brand-name">${brandName}</span>
          </div>
          <span class="status-badge">&#x25cf; VERIFIED_INSIGHT</span>
        </div>
      </div>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
