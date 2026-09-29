import { type ChecklistCardProps, checklistCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderChecklistAurora(props: ChecklistCardProps): string {
  const { title, items, subtitle, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = checklistCardDimensions(format);

  const safeTitle = applyRichFormatting(title, { isDark: true });
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : "KONTROL LİSTESİ";
  const safeBrand = escapeHtml(brandName);

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safeBrand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const itemElements = items.map((it) => {
    const formattedItem = applyRichFormatting(it, { isDark: true });
    return `<div class="check-item">
      <div class="tick-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00FF9D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <div class="item-text">${formattedItem}</div>
    </div>`;
  }).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #070811; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #070811;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 80px 56px"};
    overflow: hidden;
  }

  .orb-1 {
    position: absolute;
    top: -10%;
    right: -10%;
    width: 65%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #6366F1 0%, transparent 70%);
    filter: blur(120px);
    opacity: 0.5;
  }
  .orb-2 {
    position: absolute;
    bottom: -10%;
    left: -10%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #EC4899 0%, transparent 70%);
    filter: blur(130px);
    opacity: 0.45;
  }

  .header {
    position: relative;
    z-index: 10;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 999px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 16px;
  }
  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #00FF9D;
    box-shadow: 0 0 8px #00FF9D;
  }
  .title {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? 44 : 40}px;
    line-height: 1.25;
    color: #FFFFFF;
    letter-spacing: -0.02em;
  }

  .checklist {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 28px 0;
  }
  .check-item {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 18px 24px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    border-radius: 20px;
  }
  .tick-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(0, 255, 157, 0.12);
    border: 1px solid rgba(0, 255, 157, 0.4);
    box-shadow: 0 0 12px rgba(0, 255, 157, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    shrink: 0;
  }
  .item-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    font-size: ${format === "story" ? 22 : 20}px;
    line-height: 1.4;
    color: #F8FAFC;
  }

  .footer {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: contain;
  }
  .brand-fallback {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #00FF9D;
    color: #070811;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: #FFFFFF;
  }
  .hint-pill {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 6px 14px;
    border-radius: 999px;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <div class="orb-1"></div>
    <div class="orb-2"></div>

    <div class="header">
      <div class="badge">
        <span class="badge-dot"></span>
        <span>${safeSubtitle}</span>
      </div>
      <h1 class="title">${safeTitle}</h1>
    </div>

    <div class="checklist">
      ${itemElements}
    </div>

    <div class="footer">
      <div class="brand-group">
        ${logoHtml}
        <span class="brand-name">${safeBrand}</span>
      </div>
      <div class="hint-pill">Uygula &amp; Kaydet &#x2197;</div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
