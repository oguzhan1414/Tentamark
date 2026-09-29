import { type CouponCardProps, couponCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderCouponTicket(props: CouponCardProps): string {
  const { discountText, couponCode, headline, expiryText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = couponCardDimensions(format);

  const safe = {
    discount: escapeHtml(discountText),
    code: escapeHtml(couponCode),
    headline: applySmartHighlights(headline),
    expiry: expiryText ? escapeHtml(expiryText) : "Sınırlı Süre İçin Geçerli",
    brand: escapeHtml(brandName),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  // Barcode line generator
  const barcodeLines = [
    3, 1, 4, 2, 1, 3, 5, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 1, 5, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 2, 1, 4
  ].map((w, i) => `<rect x="${i * 14}" y="0" width="${w * 2}" height="48" fill="#111111" />`).join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0E0D12; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #0E0D12;
    padding: ${format === "story" ? "260px 64px 420px" : "64px 72px"};
  }
  .glow {
    position: absolute;
    top: 25%;
    left: 20%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
    filter: blur(120px);
  }
  ${SMART_HIGHLIGHT_CSS}

  .ticket-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "880px"};
    background: #FFFDF9;
    border-radius: 36px;
    box-shadow: 0 30px 80px -20px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ticket-top {
    padding: ${format === "story" ? "54px 48px 36px" : "44px 48px 32px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .brand-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }
  .brand-logo { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; }
  .brand-fallback {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #111111;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 16px;
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 18px;
    letter-spacing: 0.04em;
    color: #111111;
  }

  .discount-tag {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "74px" : "64px"};
    line-height: 1;
    color: ${accent};
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  }
  .headline {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "32px" : "28px"};
    line-height: 1.25;
    color: #111111;
    max-width: 680px;
    margin-bottom: 12px;
  }
  .expiry {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 14px;
    color: #666666;
  }

  /* Perforated separator with cutouts */
  .cutout-row {
    position: relative;
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .hole {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #0E0D12;
  }
  .hole.left { margin-left: -18px; }
  .hole.right { margin-right: -18px; }
  .dashed-line {
    flex: 1;
    border-top: 3px dashed #CBD5E1;
    margin: 0 16px;
  }

  .ticket-bottom {
    background: #F8F7F4;
    padding: 32px 48px 36px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .code-box {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #FFFFFF;
    border: 2px dashed ${accent};
    border-radius: 16px;
    padding: 14px 28px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.04);
  }
  .code-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: #64748B;
  }
  .code-value {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 26px;
    color: #111111;
    letter-spacing: 0.1em;
  }

  .barcode-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  .barcode-number {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: #94A3B8;
    letter-spacing: 0.25em;
  }
</style>
</head>
<body>
<div class="card">
  <div class="glow"></div>
  ${FILM_GRAIN_OVERLAY}

  <div class="ticket-container">
    <div class="ticket-top">
      <div class="brand-row">
        ${logoHtml}
        <span class="brand-name">${safe.brand}</span>
      </div>

      <div class="discount-tag">${safe.discount}</div>
      <h1 class="headline">${safe.headline}</h1>
      <div class="expiry">⏰ ${safe.expiry}</div>
    </div>

    <div class="cutout-row">
      <div class="hole left"></div>
      <div class="dashed-line"></div>
      <div class="hole right"></div>
    </div>

    <div class="ticket-bottom">
      <div class="code-box">
        <span class="code-label">KUPON KODU:</span>
        <span class="code-value">${safe.code}</span>
      </div>

      <div class="barcode-wrapper">
        <svg width="476" height="48" viewBox="0 0 476 48">
          ${barcodeLines}
        </svg>
        <span class="barcode-number">2 0 2 6 9 8 7 1 4 5 0 2</span>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}
