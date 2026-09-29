import { type NotificationCardProps, notificationCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderNotificationBrutalist(props: NotificationCardProps): string {
  const { headline, subtext, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = notificationCardDimensions(format);
  const timeLabel = props.timeLabel?.trim() || "şimdi";

  const safe = {
    headline: applyRichFormatting(headline, { isDark: false }),
    subtext: applyRichFormatting(subtext, { isDark: false }),
    brand: escapeHtml(brandName),
    time: escapeHtml(timeLabel),
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&family=IBM+Plex+Mono:wght@600;700&family=IBM+Plex+Sans:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: #F4F2EC; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F4F2EC;
    background-image: radial-gradient(#00000018 1.5px, transparent 1.5px);
    background-size: 26px 26px;
    padding: 60px;
  }
  .window-box {
    position: relative;
    width: 90%;
    max-width: 880px;
    background: #FFFFFF;
    border: 5px solid #111111;
    border-radius: 20px;
    box-shadow: 16px 16px 0px #111111;
    overflow: hidden;
  }
  .window-bar {
    background: #111111;
    color: #FFFFFF;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: "IBM Plex Mono", monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }
  .window-controls {
    display: flex;
    gap: 8px;
  }
  .window-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid #111111;
  }
  .dot-red { background: #FF5A5F; }
  .dot-yellow { background: #FFE600; }
  .dot-green { background: #00D084; }
  .window-body {
    padding: ${format === "story" ? "60px 48px" : "48px 48px"};
  }
  .tag {
    display: inline-block;
    background: ${accent};
    color: #111111;
    font-family: "IBM Plex Mono", monospace;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.1em;
    padding: 4px 12px;
    border: 2px solid #111111;
    border-radius: 6px;
    margin-bottom: 18px;
  }
  .headline {
    font-family: "Baloo 2", sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? 48 : 42}px;
    color: #111111;
    line-height: 1.2;
    margin-bottom: 14px;
  }
  .subtext {
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 600;
    font-size: ${format === "story" ? 26 : 24}px;
    color: #444444;
    line-height: 1.4;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="window-box">
      <div class="window-bar">
        <div class="window-controls">
          <span class="window-dot dot-red"></span>
          <span class="window-dot dot-yellow"></span>
          <span class="window-dot dot-green"></span>
        </div>
        <span>${safe.brand} • ${safe.time}</span>
        <span>SYS_MSG</span>
      </div>
      <div class="window-body">
        <div class="tag">BİLDİRİM</div>
        <div class="headline">${safe.headline}</div>
        <p class="subtext">${safe.subtext}</p>
      </div>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
