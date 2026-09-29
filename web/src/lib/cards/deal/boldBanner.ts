import { type DealCardProps, dealCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderDealBoldBanner(props: DealCardProps): string {
  const { productImageUrl, title, priceText, badgeText, features, ctaText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = dealCardDimensions(format);

  const safeTitle = applyRichFormatting(title, { isDark: true, highlightColor: "#FFE600" });
  const safePrice = escapeHtml(priceText);
  const safeBadge = badgeText ? escapeHtml(badgeText) : "SINIRLI STOK";
  const safeBrand = escapeHtml(brandName);

  const isStory = format === "story";
  const isLandscape = format === "landscape";

  const featureItemsHtml = features
    .slice(0, 4)
    .map((f) => `<span class="feature-pill">&#x2713; ${applyRichFormatting(f, { isDark: true })}</span>`)
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@800;900&family=Plus+Jakarta+Sans:wght@700;800&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0E0E12; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: #0E0E12;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: ${isStory ? "260px 72px 420px" : isLandscape ? "80px 100px" : "70px 70px"};
    overflow: hidden;
  }

  .bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.65);
  }
  .bg-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(14, 14, 18, 0.95) 0%, rgba(14, 14, 18, 0.3) 50%, rgba(14, 14, 18, 0.7) 100%);
    pointer-events: none;
  }

  .top-row {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .badge-ribbon {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 24px;
    background: #FFE600;
    color: #111111;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 15px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-radius: 999px;
    box-shadow: 0 4px 20px rgba(255, 230, 0, 0.4);
  }

  .price-badge {
    padding: 10px 24px;
    background: #FF3B30;
    color: #FFFFFF;
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 900;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(255, 59, 48, 0.4);
    letter-spacing: -0.02em;
  }

  .bottom-card {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: rgba(20, 20, 26, 0.85);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 32px;
    padding: ${isLandscape ? "44px 56px" : "40px 44px"};
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  }

  .product-title {
    font-family: 'Outfit', sans-serif;
    font-weight: 900;
    font-size: ${isLandscape ? 60 : isStory ? 48 : 42}px;
    line-height: 1.15;
    color: #FFFFFF;
    letter-spacing: -0.02em;
  }

  .features-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .feature-pill {
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 999px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #F3F4F6;
  }

  .brand-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0.05em;
  }
  .cta-button {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 14px;
    padding: 10px 22px;
    background: #FFFFFF;
    color: #111111;
    border-radius: 12px;
    letter-spacing: 0.05em;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <img class="bg-image" src="${productImageUrl}" alt="" />
    <div class="bg-gradient"></div>

    <div class="top-row">
      <div class="badge-ribbon">&#x26a1; ${safeBadge}</div>
      <div class="price-badge">${safePrice}</div>
    </div>

    <div class="bottom-card">
      <h1 class="product-title">${safeTitle}</h1>
      <div class="features-wrap">
        ${featureItemsHtml}
      </div>
      <div class="brand-footer">
        <span class="brand-name">${safeBrand}</span>
        <div class="cta-button">${ctaText || "Fırsatı Yakala ↗"}</div>
      </div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
