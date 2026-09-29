import { type CouponCardProps, couponCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderCouponBrutalist(props: CouponCardProps): string {
  const { discountText, couponCode, headline, expiryText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = couponCardDimensions(format);

  const safe = {
    discount: escapeHtml(discountText),
    code: escapeHtml(couponCode),
    headline: applySmartHighlights(headline),
    expiry: expiryText ? escapeHtml(expiryText) : "SINIRLI STOK",
    brand: escapeHtml(brandName),
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
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=IBM+Plex+Mono:wght@700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #FFFDF5; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #FFFDF5;
    padding: ${format === "story" ? "260px 64px 420px" : "64px 72px"};
  }
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, #0000000d 1px, transparent 1px),
                      linear-gradient(to bottom, #0000000d 1px, transparent 1px);
    background-size: 32px 32px;
  }
  ${SMART_HIGHLIGHT_CSS}

  .brutalist-coupon {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "860px"};
    background: #FFE600;
    border: 4px solid #111111;
    border-radius: 28px;
    box-shadow: 14px 14px 0px #111111;
    padding: ${format === "story" ? "54px 48px" : "44px 48px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .header-tag {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #111111;
    color: #FFE600;
    padding: 8px 18px;
    border-radius: 999px;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 14px;
    margin-bottom: 24px;
    letter-spacing: 0.05em;
  }

  .discount-box {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "86px" : "74px"};
    line-height: 0.95;
    color: #111111;
    letter-spacing: -0.04em;
    margin-bottom: 16px;
    text-transform: uppercase;
  }
  .headline {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "36px" : "30px"};
    line-height: 1.2;
    color: #111111;
    margin-bottom: 32px;
    max-width: 660px;
  }

  .code-container {
    width: 100%;
    background: #FFFFFF;
    border: 4px solid #111111;
    border-radius: 18px;
    padding: 18px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 6px 6px 0px #111111;
    margin-bottom: 24px;
  }
  .code-label {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 14px;
    color: #666666;
  }
  .code-txt {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 30px;
    color: #FF5A5F;
    letter-spacing: 0.14em;
  }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 13px;
    color: #111111;
  }
</style>
</head>
<body>
<div class="card">
  <div class="grid-pattern"></div>
  ${FILM_GRAIN_OVERLAY}

  <div class="brutalist-coupon">
    <div class="header-tag">🎟️ ${safe.brand} FLASH İNDİRİM</div>

    <div class="discount-box">${safe.discount}</div>
    <h1 class="headline">${safe.headline}</h1>

    <div class="code-container">
      <span class="code-label">KUPON KODU:</span>
      <span class="code-txt">${safe.code}</span>
    </div>

    <div class="footer-row">
      <span>[#PROMO]</span>
      <span>⏰ ${safe.expiry}</span>
    </div>
  </div>
</div>
</body>
</html>`;
}
