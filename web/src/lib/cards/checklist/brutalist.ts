import { type ChecklistCardProps, checklistCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderChecklistBrutalist(props: ChecklistCardProps): string {
  const { title, items, subtitle, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = checklistCardDimensions(format);

  const safe = {
    title: applyRichFormatting(title, { isDark: false }),
    subtitle: subtitle ? escapeHtml(subtitle) : "KONTROL LİSTESİ",
    brand: escapeHtml(brandName),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const itemElements = items.map((it) => {
    return `<div class="item-block">
      <div class="checkbox-box">✔</div>
      <div class="item-label">${applyRichFormatting(it, { isDark: false })}</div>
    </div>`;
  }).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #FFFDF5; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #FFFDF5;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 72px 56px"};
  }
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, #0000000d 1px, transparent 1px),
                      linear-gradient(to bottom, #0000000d 1px, transparent 1px);
    background-size: 32px 32px;
  }
  .header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FFFFFF;
    border: 3px solid #111111;
    border-radius: 16px;
    padding: 16px 24px;
    box-shadow: 6px 6px 0px #111111;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 38px; height: 38px; border-radius: 8px; border: 2px solid #111111; object-fit: cover; background: #fff; }
  .brand-fallback {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 2px solid #111111;
    background: #FFE600;
    color: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 18px;
  }
  .brand-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 22px; color: #111111; }
  .tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    background: #00E599;
    color: #111111;
    padding: 6px 12px;
    border: 2px solid #111111;
    border-radius: 8px;
  }

  .main-box {
    position: relative;
    z-index: 1;
    background: #FFFFFF;
    border: 4px solid #111111;
    border-radius: 24px;
    box-shadow: 12px 12px 0px #111111;
    padding: ${format === "story" ? "44px 40px" : "36px 40px"};
    display: flex;
    flex-direction: column;
    margin: 28px 0;
  }
  .sticker {
    display: inline-block;
    background: #FFE600;
    color: #111111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 13px;
    padding: 6px 14px;
    border: 3px solid #111111;
    border-radius: 8px;
    box-shadow: 3px 3px 0px #111111;
    margin-bottom: 16px;
    width: fit-content;
    text-transform: uppercase;
  }
  .title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "52px" : "42px"};
    line-height: 1.15;
    color: #111111;
    margin-bottom: 28px;
    letter-spacing: -0.02em;
  }

  .items-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .item-block {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #F8F7F2;
    border: 2px solid #111111;
    border-radius: 12px;
    padding: ${format === "story" ? "18px 20px" : "14px 18px"};
    box-shadow: 3px 3px 0px #111111;
  }
  .checkbox-box {
    width: 32px;
    height: 32px;
    background: #00E599;
    border: 2px solid #111111;
    border-radius: 8px;
    color: #111111;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .item-label {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: ${format === "story" ? "22px" : "19px"};
    color: #111111;
    line-height: 1.35;
  }

  .footer {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 14px;
    color: #111111;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="grid-pattern"></div>
  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <div class="tag">EYLEM PLANI</div>
  </div>

  <div class="main-box">
    <div class="sticker">📌 ${safe.subtitle}</div>
    <h1 class="title">${safe.title}</h1>
    <div class="items-stack">
      ${itemElements}
    </div>
  </div>

  <div class="footer">
    <span>[#CHECKLIST]</span>
    <span>KAYDET VE UYGULA ↗</span>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
