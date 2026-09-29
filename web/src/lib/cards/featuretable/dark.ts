import { type FeatureTableCardProps, featureTableCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderFeatureTableDark(props: FeatureTableCardProps): string {
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
    <div class="table-row">
      <div class="col feature-col">${r.f}</div>
      <div class="col competitor-col">${r.c}</div>
      <div class="col brand-col">${r.t}</div>
    </div>
  `).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
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
    padding: ${format === "story" ? "260px 72px 420px" : "64px 80px 56px"};
    overflow: hidden;
  }
  .glow {
    position: absolute;
    top: 25%;
    right: 10%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
    filter: blur(120px);
  }
  ${SMART_HIGHLIGHT_CSS}

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
  .kicker {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: ${accent};
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  .title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "52px" : "44px"};
    line-height: 1.18;
    color: #F8FAFC;
    letter-spacing: -0.02em;
    margin-bottom: 36px;
  }

  .table-box {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
  }
  .table-header {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1.1fr;
    background: rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 18px 24px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
  }
  .table-header .brand-head {
    color: ${accent};
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .table-row {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1.1fr;
    padding: ${format === "story" ? "24px 24px" : "18px 24px"};
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    align-items: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .table-row:last-child {
    border-bottom: none;
  }
  .feature-col {
    font-weight: 700;
    font-size: ${format === "story" ? "20px" : "17px"};
    color: #F1F5F9;
  }
  .competitor-col {
    font-weight: 600;
    font-size: ${format === "story" ? "18px" : "16px"};
    color: #94A3B8;
  }
  .brand-col {
    font-weight: 800;
    font-size: ${format === "story" ? "19px" : "17px"};
    color: ${accent};
    background: ${accent}15;
    padding: 8px 14px;
    border-radius: 12px;
    border: 1px solid ${accent}33;
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
</style>
</head>
<body>
<div class="card">
  <div class="glow"></div>
  ${FILM_GRAIN_OVERLAY}

  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="tag">KIYASLAMA TABLOSU</span>
  </div>

  <div class="main">
    <div class="kicker">DOĞRU KARARI VERİN ⚖️</div>
    <h1 class="title">${safe.title}</h1>

    <div class="table-box">
      <div class="table-header">
        <div>Kriter</div>
        <div>Eski Yöntem</div>
        <div class="brand-head">⚡ ${safe.brand}</div>
      </div>
      ${tableRowsHtml}
    </div>
  </div>

  <div class="footer">
    <span>Farkı Kendiniz Görün</span>
    <span>Kaydet &amp; Karşılaştır 🔖</span>
  </div>
</div>
</body>
</html>`;
}
