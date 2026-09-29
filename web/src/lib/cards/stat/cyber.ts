import { type StatCardProps, statCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderStatCyber(props: StatCardProps): string {
  const { statNumber, statLabel, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = statCardDimensions(format);
  const supportingText = props.supportingText?.trim();

  const formattedStat = escapeHtml(statNumber);
  const formattedLabel = applyRichFormatting(statLabel, { isDark: true, highlightColor: "#00FF9D", circleColor: "#00F0FF", underlineColor: "#00FF9D" });
  const formattedSupport = supportingText ? applyRichFormatting(supportingText, { isDark: true, highlightColor: "#00FF9D", circleColor: "#00F0FF" }) : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #06070A; overflow: hidden; }
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
    max-width: ${format === "story" ? "920px" : "880px"};
    background: rgba(12, 14, 20, 0.92);
    border: 1px solid rgba(0, 255, 157, 0.35);
    border-radius: 28px;
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
  }

  .terminal-body {
    padding: ${format === "story" ? "68px 48px" : "60px 54px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .prompt-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: #00F0FF;
    margin-bottom: 20px;
  }

  .stat-number {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 900;
    font-size: ${format === "story" ? 160 : 140}px;
    line-height: 1;
    color: #00FF9D;
    text-shadow: 0 0 35px rgba(0, 255, 157, 0.45);
    letter-spacing: -0.04em;
    margin-bottom: 20px;
  }

  .stat-label {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    font-size: ${format === "story" ? 32 : 28}px;
    line-height: 1.35;
    color: #ECFDF5;
    max-width: 85%;
    margin-bottom: 20px;
  }

  .stat-support {
    font-family: 'JetBrains Mono', monospace;
    font-size: 17px;
    line-height: 1.5;
    color: rgba(236, 253, 245, 0.7);
    max-width: 80%;
    margin-bottom: 36px;
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
    padding: 6px 14px;
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
        <span class="terminal-title">analytics.sys // metric_report</span>
        <div style="width: 52px;"></div>
      </div>
      <div class="terminal-body">
        <div class="prompt-tag">&gt;_ METRIC_DISCOVERY:</div>
        <div class="stat-number">${formattedStat}</div>
        <p class="stat-label">${formattedLabel}</p>
        ${formattedSupport ? `<p class="stat-support">${formattedSupport}</p>` : ""}
        <div class="brand-footer">
          <div class="brand-id">
            ${logoUrl ? `<img class="brand-logo" src="${logoUrl}" alt="" />` : ""}
            <span class="brand-name">${brandName}</span>
          </div>
          <span class="status-badge">&#x25cf; 200_VERIFIED</span>
        </div>
      </div>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
