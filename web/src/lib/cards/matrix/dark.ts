import { type MatrixCardProps, matrixCardDimensions, escapeHtml, resolveAccent } from "./types";

export function renderMatrixDark(props: MatrixCardProps): string {
  const { title, q1Label, q1Text, q2Label, q2Text, q3Label, q3Text, q4Label, q4Text, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = matrixCardDimensions(format);

  const safe = {
    title: escapeHtml(title),
    brand: escapeHtml(brandName),
    q1L: escapeHtml(q1Label),
    q1T: escapeHtml(q1Text),
    q2L: escapeHtml(q2Label),
    q2T: escapeHtml(q2Text),
    q3L: escapeHtml(q3Label),
    q3T: escapeHtml(q3Text),
    q4L: escapeHtml(q4Label),
    q4T: escapeHtml(q4Text),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

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
    top: 30%;
    left: 20%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent}22 0%, transparent 70%);
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
    margin: 28px 0;
  }
  .title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "52px" : "44px"};
    line-height: 1.2;
    color: #F8FAFC;
    letter-spacing: -0.02em;
    margin-bottom: 32px;
    text-align: center;
  }

  .grid-2x2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
  }
  .quadrant {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: ${format === "story" ? "28px 24px" : "22px 24px"};
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .quadrant.highlight {
    border-color: ${accent}66;
    background: linear-gradient(135deg, ${accent}15 0%, rgba(255,255,255,0.03) 100%);
  }
  .q-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 13px;
    color: #38BDF8;
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid rgba(56, 189, 248, 0.3);
    padding: 4px 12px;
    border-radius: 999px;
    margin-bottom: 12px;
    width: fit-content;
  }
  .quadrant.highlight .q-badge {
    color: ${accent};
    background: ${accent}22;
    border-color: ${accent}55;
  }
  .q-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    font-size: ${format === "story" ? "20px" : "17px"};
    line-height: 1.45;
    color: #E2E8F0;
    white-space: pre-wrap;
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
    <span class="tag">MATRİS &amp; REHBER</span>
  </div>

  <div class="main">
    <h1 class="title">${safe.title}</h1>

    <div class="grid-2x2">
      <div class="quadrant">
        <div class="q-badge">01. ${safe.q1L}</div>
        <div class="q-text">${safe.q1T}</div>
      </div>

      <div class="quadrant">
        <div class="q-badge">02. ${safe.q2L}</div>
        <div class="q-text">${safe.q2T}</div>
      </div>

      <div class="quadrant">
        <div class="q-badge">03. ${safe.q3L}</div>
        <div class="q-text">${safe.q3T}</div>
      </div>

      <div class="quadrant highlight">
        <div class="q-badge">04. ${safe.q4L}</div>
        <div class="q-text">${safe.q4T}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span class="save-pill">Kaydet &amp; Sakla 🔖</span>
    <span>İçerik Araçları 🧭</span>
  </div>
</div>
</body>
</html>`;
}
