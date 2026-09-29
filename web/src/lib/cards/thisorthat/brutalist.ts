import { type ThisOrThatCardProps, thisOrThatCardDimensions, escapeHtml, resolveAccent } from "./types";

export function renderThisOrThatBrutalist(props: ThisOrThatCardProps): string {
  const { question, optionA, optionB, ctaText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = thisOrThatCardDimensions(format);

  const safe = {
    question: escapeHtml(question),
    optA: escapeHtml(optionA),
    optB: escapeHtml(optionB),
    cta: ctaText ? escapeHtml(ctaText) : (format === "story" ? "OYUNU KULLAN 👆" : "YORUMDA BELİRT 👇"),
    brand: escapeHtml(brandName),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const pollStickerPlaceholder = format === "story"
    ? `<div class="poll-sticker-frame">
        <span>📊 ANKET ÇIKARTMASI BURAYA</span>
      </div>`
    : "";

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
    padding: ${format === "story" ? "44px 40px" : "36px 40px"};
    display: flex;
    flex-direction: column;
    margin: 28px 0;
    text-align: center;
  }
  .sticker-q {
    display: inline-block;
    background: #FF5A5F;
    color: #FFFFFF;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 13px;
    padding: 6px 14px;
    border: 3px solid #111111;
    border-radius: 8px;
    box-shadow: 3px 3px 0px #111111;
    margin: 0 auto 16px;
    width: fit-content;
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

  .options-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .opt-box {
    display: flex;
    align-items: center;
    gap: 18px;
    border: 3px solid #111111;
    border-radius: 16px;
    padding: ${format === "story" ? "20px 24px" : "16px 20px"};
    box-shadow: 5px 5px 0px #111111;
    text-align: left;
  }
  .opt-box.a { background: #FFE600; }
  .opt-box.b { background: #00E599; }
  .badge-letter {
    width: 40px;
    height: 40px;
    border: 2px solid #111111;
    border-radius: 10px;
    background: #FFFFFF;
    color: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 20px;
    flex-shrink: 0;
  }
  .opt-text {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "24px" : "20px"};
    color: #111111;
    line-height: 1.3;
  }

  .poll-sticker-frame {
    margin-top: 20px;
    border: 3px dashed #111111;
    border-radius: 14px;
    padding: 16px;
    background: #FFFDF5;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 13px;
    color: #111111;
    letter-spacing: 0.08em;
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
    <div class="tag">SEÇİMİNİ YAP</div>
  </div>

  <div class="main-box">
    <div class="sticker-q">HANGİSİ DAHA İYİ?</div>
    <h1 class="title">${safe.question}</h1>

    <div class="options-stack">
      <div class="opt-box a">
        <div class="badge-letter">A</div>
        <div class="opt-text">${safe.optA}</div>
      </div>

      <div class="opt-box b">
        <div class="badge-letter">B</div>
        <div class="opt-text">${safe.optB}</div>
      </div>
    </div>

    ${pollStickerPlaceholder}
  </div>

  <div class="footer">
    <span>[#THIS_OR_THAT]</span>
    <span>${safe.cta} ↗</span>
  </div>
</div>
</body>
</html>`;
}
