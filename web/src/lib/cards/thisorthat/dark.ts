import { type ThisOrThatCardProps, thisOrThatCardDimensions, escapeHtml, resolveAccent } from "./types";

export function renderThisOrThatDark(props: ThisOrThatCardProps): string {
  const { question, optionA, optionB, ctaText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = thisOrThatCardDimensions(format);

  const safe = {
    question: escapeHtml(question),
    optA: escapeHtml(optionA),
    optB: escapeHtml(optionB),
    cta: ctaText ? escapeHtml(ctaText) : (format === "story" ? "Hikayede Oy Ver 👆" : "Fikrini Yorumda Belirt 👇"),
    brand: escapeHtml(brandName),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const pollStickerPlaceholder = format === "story"
    ? `<div class="poll-guide-zone">
        <span class="poll-guide-icon">📊</span>
        <span class="poll-guide-text">ANKET ÇIKARTMASI BURAYA</span>
      </div>`
    : "";

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
    padding: ${format === "story" ? "260px 80px 420px" : "64px 80px 56px"};
    overflow: hidden;
  }
  .glow-a {
    position: absolute;
    top: 15%;
    left: -15%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #06B6D433 0%, transparent 70%);
    filter: blur(100px);
  }
  .glow-b {
    position: absolute;
    bottom: 20%;
    right: -15%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #EC489933 0%, transparent 70%);
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
    align-items: center;
    text-align: center;
    margin: 32px 0;
  }
  .kicker {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #38BDF8;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  .question {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "54px" : "46px"};
    line-height: 1.18;
    color: #F8FAFC;
    letter-spacing: -0.02em;
    margin-bottom: ${format === "story" ? "40px" : "32px"};
    max-width: 900px;
  }

  .options-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .option-box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${format === "story" ? "36px 36px" : "28px 32px"};
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    backdrop-filter: blur(16px);
  }
  .option-box.opt-a {
    border-color: rgba(6, 182, 212, 0.4);
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%);
  }
  .option-box.opt-b {
    border-color: rgba(236, 72, 153, 0.4);
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%);
  }
  .option-badge {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 20px;
    flex-shrink: 0;
  }
  .option-box.opt-a .option-badge { background: #06B6D4; color: #0A0A0F; box-shadow: 0 0 16px rgba(6, 182, 212, 0.5); }
  .option-box.opt-b .option-badge { background: #EC4899; color: #FFFFFF; box-shadow: 0 0 16px rgba(236, 72, 153, 0.5); }
  .option-text {
    flex: 1;
    text-align: left;
    padding-left: 20px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: ${format === "story" ? "26px" : "22px"};
    color: #F8FAFC;
    line-height: 1.35;
  }

  .or-divider {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.4);
    margin: -6px 0;
  }

  .poll-guide-zone {
    width: 100%;
    margin-top: 24px;
    padding: 18px 24px;
    border: 2px dashed rgba(255, 255, 255, 0.25);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.02);
  }
  .poll-guide-icon { font-size: 20px; }
  .poll-guide-text {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.6);
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
  .cta-pill {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    font-weight: 700;
    padding: 6px 18px;
    border-radius: 999px;
  }
</style>
</head>
<body>
<div class="card">
  <div class="glow-a"></div>
  <div class="glow-b"></div>

  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="tag">ETKİLEŞİM &amp; ANKET</span>
  </div>

  <div class="main">
    <div class="kicker">HIZLI SORU 🤔</div>
    <h1 class="question">${safe.question}</h1>

    <div class="options-container">
      <div class="option-box opt-a">
        <div class="option-badge">A</div>
        <div class="option-text">${safe.optA}</div>
      </div>

      <div class="or-divider">VEYA</div>

      <div class="option-box opt-b">
        <div class="option-badge">B</div>
        <div class="option-text">${safe.optB}</div>
      </div>
    </div>

    ${pollStickerPlaceholder}
  </div>

  <div class="footer">
    <span class="cta-pill">${safe.cta}</span>
    <span>Senin Seçimin Hangisi? 🗳️</span>
  </div>
</div>
</body>
</html>`;
}
