import { type MatrixCardProps, matrixCardDimensions, escapeHtml, resolveAccent } from "./types";

export function renderMatrixBrutalist(props: MatrixCardProps): string {
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
    padding: ${format === "story" ? "40px 36px" : "32px 36px"};
    display: flex;
    flex-direction: column;
    margin: 24px 0;
  }
  .sticker-title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "46px" : "38px"};
    line-height: 1.15;
    color: #111111;
    margin-bottom: 24px;
    text-align: center;
    letter-spacing: -0.02em;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .quad-box {
    border: 3px solid #111111;
    border-radius: 14px;
    padding: ${format === "story" ? "22px 20px" : "18px 20px"};
    box-shadow: 4px 4px 0px #111111;
    display: flex;
    flex-direction: column;
  }
  .quad-box.c1 { background: #FEF08A; }
  .quad-box.c2 { background: #BAE6FD; }
  .quad-box.c3 { background: #BBF7D0; }
  .quad-box.c4 { background: #FED7AA; }

  .quad-label {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 13px;
    text-transform: uppercase;
    color: #111111;
    margin-bottom: 8px;
    letter-spacing: 0.04em;
  }
  .quad-text {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: ${format === "story" ? "20px" : "17px"};
    line-height: 1.35;
    color: #111111;
    white-space: pre-wrap;
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
  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <div class="tag">CHEAT SHEET</div>
  </div>

  <div class="main-box">
    <h1 class="sticker-title">${safe.title}</h1>

    <div class="grid-layout">
      <div class="quad-box c1">
        <div class="quad-label">[01] ${safe.q1L}</div>
        <div class="quad-text">${safe.q1T}</div>
      </div>

      <div class="quad-box c2">
        <div class="quad-label">[02] ${safe.q2L}</div>
        <div class="quad-text">${safe.q2T}</div>
      </div>

      <div class="quad-box c3">
        <div class="quad-label">[03] ${safe.q3L}</div>
        <div class="quad-text">${safe.q3T}</div>
      </div>

      <div class="quad-box c4">
        <div class="quad-label">[04] ${safe.q4L}</div>
        <div class="quad-text">${safe.q4T}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>[#MATRIX_2X2]</span>
    <span>KAYDET VE KULLAN ↗</span>
  </div>
</div>
</body>
</html>`;
}
