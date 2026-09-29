import { type FeatureTableCardProps, featureTableCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderFeatureTableBrutalist(props: FeatureTableCardProps): string {
  const { title, feature1, competitor1, tentamark1, feature2, competitor2, tentamark2, feature3, competitor3, tentamark3, feature4, competitor4, tentamark4, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = featureTableCardDimensions(format);

  const safe = {
    title: applySmartHighlights(title),
    brand: escapeHtml(brandName),
    f1: escapeHtml(feature1),
    c1: escapeHtml(competitor1),
    t1: escapeHtml(tentamark1),
    f2: escapeHtml(feature2),
    c2: escapeHtml(competitor2),
    t2: escapeHtml(tentamark2),
    f3: escapeHtml(feature3),
    c3: escapeHtml(competitor3),
    t3: escapeHtml(tentamark3),
    f4: feature4 ? escapeHtml(feature4) : "",
    c4: competitor4 ? escapeHtml(competitor4) : "",
    t4: tentamark4 ? escapeHtml(tentamark4) : "",
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const rows = [
    { f: safe.f1, c: safe.c1, t: safe.t1 },
    { f: safe.f2, c: safe.c2, t: safe.t2 },
    { f: safe.f3, c: safe.c3, t: safe.t3 },
  ];
  if (safe.f4 && safe.c4 && safe.t4) {
    rows.push({ f: safe.f4, c: safe.c4, t: safe.t4 });
  }

  const tableRowsHtml = rows.map((r) => `
    <div class="row">
      <div class="col feat">${r.f}</div>
      <div class="col comp">${r.c}</div>
      <div class="col tenta">${r.t}</div>
    </div>
  `).join("");

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
  ${SMART_HIGHLIGHT_CSS}

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
    background: #FFE600;
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
    padding: ${format === "story" ? "36px 32px" : "28px 32px"};
    display: flex;
    flex-direction: column;
    margin: 24px 0;
  }
  .sticker-title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "48px" : "40px"};
    line-height: 1.15;
    color: #111111;
    margin-bottom: 24px;
    text-align: center;
    letter-spacing: -0.02em;
  }

  .table-grid {
    border: 3px solid #111111;
    border-radius: 16px;
    overflow: hidden;
  }
  .head-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1.1fr;
    background: #111111;
    padding: 14px 18px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 800;
    color: #FFFFFF;
    text-transform: uppercase;
  }
  .head-row .brand-header {
    color: #00E599;
  }

  .row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1.1fr;
    padding: ${format === "story" ? "20px 18px" : "15px 18px"};
    border-bottom: 2px solid #111111;
    align-items: center;
    font-family: 'Space Grotesk', sans-serif;
  }
  .row:last-child {
    border-bottom: none;
  }
  .feat {
    font-weight: 800;
    font-size: ${format === "story" ? "19px" : "16px"};
    color: #111111;
  }
  .comp {
    font-weight: 700;
    font-size: ${format === "story" ? "17px" : "15px"};
    color: #666666;
  }
  .tenta {
    font-weight: 800;
    font-size: ${format === "story" ? "18px" : "16px"};
    color: #000000;
    background: #00E599;
    padding: 6px 12px;
    border-radius: 8px;
    border: 2px solid #111111;
    box-shadow: 2px 2px 0px #111111;
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
</style>
</head>
<body>
<div class="card">
  <div class="grid-pattern"></div>
  ${FILM_GRAIN_OVERLAY}

  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <div class="tag">ÖZELLİK KIYAS</div>
  </div>

  <div class="main-box">
    <h1 class="sticker-title">${safe.title}</h1>

    <div class="table-grid">
      <div class="head-row">
        <div>Kriter</div>
        <div>Eski Yöntem</div>
        <div class="brand-header">⚡ ${safe.brand}</div>
      </div>
      ${tableRowsHtml}
    </div>
  </div>

  <div class="footer">
    <span>[#VS_TABLE]</span>
    <span>KAYDET VE KIYASLA ↗</span>
  </div>
</div>
</body>
</html>`;
}
