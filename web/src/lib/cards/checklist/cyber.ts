import { type ChecklistCardProps, checklistCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderChecklistCyber(props: ChecklistCardProps): string {
  const { title, items, subtitle, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = checklistCardDimensions(format);

  const safeTitle = applyRichFormatting(title, { isDark: true, highlightColor: "#00FF9D", circleColor: "#00F0FF", underlineColor: "#00FF9D" });
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : "DEPLOYMENT_CHECKLIST.EXE";
  const safeBrand = escapeHtml(brandName);

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safeBrand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const itemElements = items.map((it, idx) => {
    const formattedItem = applyRichFormatting(it, { isDark: true, highlightColor: "#00FF9D", circleColor: "#00F0FF", underlineColor: "#00FF9D" });
    return `<div class="check-item">
      <span class="step-num">0${idx + 1}</span>
      <span class="tick-box">[&#x2713;]</span>
      <div class="item-text">${formattedItem}</div>
    </div>`;
  }).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #06070A; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #06070A;
    background-image:
      linear-gradient(to right, rgba(0, 255, 157, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 255, 157, 0.05) 1px, transparent 1px);
    background-size: 36px 36px;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 80px 56px"};
    overflow: hidden;
  }

  .terminal-box {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: rgba(12, 14, 20, 0.92);
    border: 1px solid rgba(0, 255, 157, 0.35);
    border-radius: 28px;
    box-shadow: 0 0 45px rgba(0, 255, 157, 0.08), 0 24px 64px rgba(0, 0, 0, 0.7);
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
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot-red { background: #FF5F56; }
  .dot-yellow { background: #FFBD2E; }
  .dot-green { background: #27C93F; }

  .terminal-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    color: #00FF9D;
    letter-spacing: 0.08em;
  }

  .terminal-content {
    padding: ${format === "story" ? "54px 44px" : "44px 48px"};
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .prompt-row {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #00F0FF;
    margin-bottom: 12px;
  }
  .title {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 800;
    font-size: ${format === "story" ? 40 : 36}px;
    line-height: 1.3;
    color: #ECFDF5;
    margin-bottom: 32px;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .check-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    background: rgba(0, 255, 157, 0.03);
    border: 1px solid rgba(0, 255, 157, 0.15);
    border-radius: 14px;
  }
  .step-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
  }
  .tick-box {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 800;
    color: #00FF9D;
    text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
  }
  .item-text {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    font-size: ${format === "story" ? 20 : 18}px;
    line-height: 1.4;
    color: #F0FDF4;
  }

  .terminal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 28px;
    border-top: 1px solid rgba(0, 255, 157, 0.15);
    background: rgba(0, 255, 157, 0.02);
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-logo {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    object-fit: contain;
  }
  .brand-fallback {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: #00FF9D;
    color: #06070A;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  .brand-name {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: 15px;
    color: #FFFFFF;
  }
  .status-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: #00FF9D;
    background: rgba(0, 255, 157, 0.1);
    border: 1px solid rgba(0, 255, 157, 0.3);
    padding: 4px 12px;
    border-radius: 999px;
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
        <span class="terminal-title">${safeSubtitle}</span>
        <div style="width: 52px;"></div>
      </div>

      <div class="terminal-content">
        <div class="prompt-row">&gt;_ EXECUTION_PLAN:</div>
        <h1 class="title">${safeTitle}</h1>
        <div class="items-list">
          ${itemElements}
        </div>
      </div>

      <div class="terminal-footer">
        <div class="brand-group">
          ${logoHtml}
          <span class="brand-name">${safeBrand}</span>
        </div>
        <span class="status-badge">&#x25cf; 100%_PASS</span>
      </div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
