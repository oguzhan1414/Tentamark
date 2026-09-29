import { type CouponCardProps, couponCardDimensions, escapeHtml } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { fontStackFor, googleFontsHrefFor } from "../cardTokenStyles";

export function renderCouponModern(props: CouponCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { discountText, couponCode, headline, expiryText, brandName, logoUrl, format } = props;
  const { colors, typography } = tokens;
  // Kept dark ("premium black card") on purpose — only the gold accent
  // becomes the brand's own accent; the black canvas is this variant's
  // actual character, same reasoning as podcast/chat/newsflash's fixed
  // palettes. Unlike legibleChipColor (clamped for a colored chip behind
  // white text), colors.accent is already luminance-filtered to pop
  // against a dark background, so it's used directly here.
  const accent = colors.accent;
  const { width, height } = couponCardDimensions(format);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const safe = {
    discount: escapeHtml(discountText),
    code: escapeHtml(couponCode),
    headline: applySmartHighlights(headline),
    expiry: expiryText ? escapeHtml(expiryText) : "Sınırlı Süre Geçerli",
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
<link href="${googleFontsHrefFor(tokens, ["IBM Plex Mono:wght@600;700"])}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0A0A0F; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #0A0A0F;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 72px"};
  }
  .glow {
    position: absolute;
    top: 20%;
    right: 15%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
    filter: blur(120px);
  }
  ${SMART_HIGHLIGHT_CSS}

  .modern-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "860px"};
    background: linear-gradient(135deg, #1C1917 0%, #0C0A09 100%);
    border-radius: 36px;
    padding: ${format === "story" ? "60px 52px" : "50px 52px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border: 2px solid ${accent}66;
    box-shadow: 0 25px 70px -15px rgba(0,0,0,0.7);
  }

  .brand-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }
  .brand-logo { width: 40px; height: 40px; border-radius: 12px; object-fit: cover; }
  .brand-fallback {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: ${accent};
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 18px;
  }
  .brand-name {
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 20px;
    color: #FFFFFF;
  }

  .discount-number {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? "82px" : "70px"};
    line-height: 1;
    color: ${accent};
    letter-spacing: -0.02em;
    margin-bottom: 20px;
    text-shadow: 0 0 40px ${accent}66;
  }
  .title {
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: ${format === "story" ? "36px" : "30px"};
    line-height: 1.25;
    color: #F5F5F4;
    margin-bottom: 36px;
    max-width: 700px;
  }

  .coupon-pill {
    background: ${accent}1a;
    border: 2px solid ${accent};
    border-radius: 20px;
    padding: 16px 36px;
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    box-shadow: 0 0 30px ${accent}26;
  }
  .code-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: #A8A29E;
  }
  .code-text {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 28px;
    color: #FFFFFF;
    letter-spacing: 0.12em;
  }

  .expiry-tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    color: #A8A29E;
  }
</style>
</head>
<body>
<div class="card">
  <div class="glow"></div>
  ${FILM_GRAIN_OVERLAY}

  <div class="modern-card">
    <div class="brand-bar">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>

    <div class="discount-number">${safe.discount}</div>
    <h1 class="title">${safe.headline}</h1>

    <div class="coupon-pill">
      <span class="code-title">KUPON KODU:</span>
      <span class="code-text">${safe.code}</span>
    </div>

    <div class="expiry-tag">⚡ ${safe.expiry}</div>
  </div>
</div>
</body>
</html>`;
}
