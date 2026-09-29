import { type ChecklistCardProps, checklistCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderChecklistDark(props: ChecklistCardProps): string {
  const { title, items, subtitle, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = checklistCardDimensions(format);

  const safe = {
    title: applyRichFormatting(title, { isDark: true }),
    subtitle: subtitle ? escapeHtml(subtitle) : "KONTROL LİSTESİ",
    brand: escapeHtml(brandName),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const itemElements = items.map((it, idx) => {
    return `<div class="check-item">
      <div class="tick-wrapper">
        <div class="tick-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        ${idx < items.length - 1 ? '<div class="timeline-line"></div>' : ""}
      </div>
      <div class="item-text">${applyRichFormatting(it, { isDark: true })}</div>
    </div>`;
  }).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0A0A0F; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #0A0A0F;
    padding: ${format === "story" ? "260px 80px 420px" : "64px 80px 56px"};
    overflow: hidden;
  }
  .glow {
    position: absolute;
    top: 20%;
    left: -15%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
    filter: blur(100px);
  }

  .header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 22px;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; background: #fff; padding: 4px; }
  .brand-fallback {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(255,255,255,0.1);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 19px;
  }
  .brand-name { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 22px; color: #FFFFFF; }
  .tag { font-family: 'IBM Plex Mono', monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; color: rgba(255, 255, 255, 0.5); text-transform: uppercase; }

  .main {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 32px 0;
  }
  .subtitle-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${accent}22;
    border: 1px solid ${accent}55;
    color: ${accent};
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 6px 16px;
    border-radius: 999px;
    margin-bottom: 16px;
    width: fit-content;
  }
  .title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "54px" : "46px"};
    line-height: 1.2;
    color: #F8FAFC;
    letter-spacing: -0.02em;
    margin-bottom: 36px;
    max-width: 900px;
  }

  .checklist-container {
    display: flex;
    flex-direction: column;
  }
  .check-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    position: relative;
  }
  .tick-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .tick-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: ${accent}22;
    border: 2px solid ${accent};
    color: ${accent};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px ${accent}44;
    flex-shrink: 0;
    z-index: 2;
  }
  .timeline-line {
    width: 2px;
    height: calc(100% - 10px);
    background: rgba(255, 255, 255, 0.12);
    position: absolute;
    top: 36px;
    left: 17px;
    z-index: 1;
  }
  .item-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    font-size: ${format === "story" ? "24px" : "21px"};
    line-height: 1.45;
    color: #E2E8F0;
    padding-bottom: ${format === "story" ? "32px" : "24px"};
    padding-top: 4px;
    flex: 1;
  }

  .footer {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 20px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: #64748B;
  }
  .save-pill {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    font-weight: 700;
    padding: 6px 16px;
    border-radius: 999px;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="glow"></div>

  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="tag">REHBER &amp; ADIMLAR</span>
  </div>

  <div class="main">
    <div class="subtitle-pill">${safe.subtitle}</div>
    <h1 class="title">${safe.title}</h1>
    <div class="checklist-container">
      ${itemElements}
    </div>
  </div>

  <div class="footer">
    <span class="save-pill">Kaydet &amp; Uygula 🔖</span>
    <span>Takipte Kal ↗</span>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
