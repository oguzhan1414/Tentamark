import { type NotificationCardProps, notificationCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

// Glassmorphism only reads as premium over something busy underneath it —
// a flat solid backdrop makes the frosted card look like a grey box. The
// aurora mesh here exists purely to give the blur something worth blurring.
export function renderNotificationBubble(props: NotificationCardProps): string {
  const { headline, subtext, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = notificationCardDimensions(format);
  const timeLabel = props.timeLabel?.trim() || "şimdi";

  const safe = {
    headline: applyRichFormatting(headline, { isDark: true }),
    subtext: applyRichFormatting(subtext, { isDark: true }),
    brand: escapeHtml(brandName),
    time: escapeHtml(timeLabel),
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
    align-items: center;
    justify-content: center;
    background: #0B0A0F;
    overflow: hidden;
  }
  .aurora {
    position: absolute;
    inset: 0;
  }
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);
  }
  .blob.a { top: -10%; left: -10%; width: 65%; aspect-ratio: 1; background: ${accent}; opacity: 0.55; }
  .blob.b { bottom: -14%; right: -8%; width: 60%; aspect-ratio: 1; background: #6D5BFF; opacity: 0.5; }
  .blob.c { top: 30%; right: 10%; width: 40%; aspect-ratio: 1; background: #00C4CC; opacity: 0.35; }

  .bubble {
    position: relative;
    z-index: 1;
    width: 84%;
    max-width: 880px;
    background: rgba(18, 16, 24, 0.55);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 32px;
    padding: 40px 40px 44px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.35);
  }
  .bubble-top {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
  }
  .app-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    object-fit: contain;
    background: #ffffff;
    padding: 4px;
  }
  .app-name {
    flex: 1;
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.55);
  }
  .time {
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    font-size: 15px;
    color: rgba(255,255,255,0.45);
  }
  .headline {
    font-family: "Baloo 2", sans-serif;
    font-weight: 700;
    font-size: 38px;
    line-height: 1.25;
    color: #ffffff;
    margin-bottom: 10px;
  }
  .subtext {
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    font-size: 20px;
    line-height: 1.5;
    color: rgba(255,255,255,0.72);
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="aurora">
      <div class="blob a"></div>
      <div class="blob b"></div>
      <div class="blob c"></div>
    </div>
    <div class="bubble">
      <div class="bubble-top">
        ${logoUrl ? `<img class="app-icon" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
        <span class="app-name">${safe.brand}</span>
        <span class="time">${safe.time}</span>
      </div>
      <p class="headline">${safe.headline}</p>
      <p class="subtext">${safe.subtext}</p>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
