import { type ProductCardProps, productCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderProductBrutalist(props: ProductCardProps): string {
  const { imageUrl, title, description, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = productCardDimensions(format);

  const safe = {
    title: escapeHtml(title),
    titleFormatted: applyRichFormatting(title, { isDark: false }),
    description: applyRichFormatting(description, { isDark: false }),
    brand: escapeHtml(brandName),
    imageUrl: escapeHtml(imageUrl),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const avatarHtml = logoUrl
    ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="${safe.brand}" />`
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
    padding: ${format === "story" ? "90px 64px 80px" : "64px 72px 56px"};
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
  .brand-logo {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 2px solid #111111;
    object-fit: cover;
    background: #FFFFFF;
  }
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
  .brand-name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 22px;
    color: #111111;
  }
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

  .main-poster {
    position: relative;
    z-index: 1;
    background: #FFFFFF;
    border: 4px solid #111111;
    border-radius: 24px;
    box-shadow: 12px 12px 0px #111111;
    padding: ${format === "story" ? "36px 36px 44px" : "28px 28px 36px"};
    display: flex;
    flex-direction: column;
    margin: 28px 0;
  }

  .image-box {
    position: relative;
    width: 100%;
    height: ${format === "story" ? "680px" : "440px"};
    border: 3px solid #111111;
    border-radius: 16px;
    overflow: hidden;
    background: #F4F2EC;
    margin-bottom: 28px;
  }
  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .sticker {
    position: absolute;
    top: 16px;
    right: 16px;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 13px;
    padding: 6px 14px;
    background: ${accent};
    color: #111111;
    border: 3px solid #111111;
    border-radius: 8px;
    box-shadow: 3px 3px 0px #111111;
    text-transform: uppercase;
  }

  .title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "52px" : "44px"};
    line-height: 1.15;
    color: #111111;
    margin-bottom: 12px;
    letter-spacing: -0.02em;
  }
  .desc {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    line-height: 1.45;
    color: #444444;
    font-weight: 600;
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
  .buy-pill {
    background: #111111;
    color: #FFE600;
    padding: 8px 18px;
    border: 2px solid #111111;
    border-radius: 999px;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="grid-pattern"></div>
  <div class="header">
    <div class="brand-row">
      ${avatarHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <div class="tag">ÖZEL ÜRÜN</div>
  </div>

  <div class="main-poster">
    <div class="image-box">
      <img src="${safe.imageUrl}" alt="${safe.title}" class="product-image" />
      <div class="sticker">HOT PICK 🔥</div>
    </div>
    <h1 class="title">${safe.titleFormatted}</h1>
    <p class="desc">${safe.description}</p>
  </div>

  <div class="footer">
    <span class="buy-pill">HEMEN İNCELE ⚡</span>
    <span>LİNK BİYOGRAFİDE ↗</span>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
