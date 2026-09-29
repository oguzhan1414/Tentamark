import { type DealCardProps, dealCardDimensions, escapeHtml } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { fontStackFor, googleFontsHrefFor, legibleChipColor } from "../cardTokenStyles";

// The photo-driven neutral canvas is kept as-is (deliberately "editorial
// photography", not a brand-neutral background) — fonts and the price
// badge's fill are the brand-driven touches here.
export function renderDealLifestyleSplit(props: DealCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { productImageUrl, title, priceText, badgeText, features, ctaText, brandName, logoUrl, format } = props;
  const headingFont = fontStackFor(tokens.typography.headingFamily);
  const bodyFont = fontStackFor(tokens.typography.bodyFamily);
  const priceChip = legibleChipColor(tokens.colors.primary);
  const { width, height } = dealCardDimensions(format);

  const safeTitle = applyRichFormatting(title, { isDark: true, highlightColor: "#FDE047" });
  const safePrice = escapeHtml(priceText);
  const safeBadge = badgeText ? escapeHtml(badgeText) : "HOT DEALS";
  const safeBrand = escapeHtml(brandName);

  const isStory = format === "story";
  const isLandscape = format === "landscape";

  const featureItemsHtml = features
    .slice(0, 4)
    .map((f) => `<li>${applyRichFormatting(f, { isDark: false })}</li>`)
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens, ["Space Grotesk:wght@700"])}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #EFECE6; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: #EFECE6;
    display: flex;
    flex-direction: ${isLandscape ? "row" : "column"};
    padding: ${isStory ? "260px 72px 420px" : "0"};
    overflow: hidden;
  }

  /* Photo Section */
  .photo-section {
    position: relative;
    flex: ${isLandscape ? "1.2" : isStory ? "1" : "1.1"};
    width: 100%;
    height: ${isLandscape ? "100%" : "auto"};
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: ${isLandscape ? "60px 80px" : "48px 48px"};
    ${isStory ? "border-radius: 36px 36px 0 0;" : ""}
  }
  .product-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.85);
  }
  .photo-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6) 100%);
    pointer-events: none;
  }

  .badge-tag {
    position: relative;
    z-index: 10;
    padding: 6px 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #FFFFFF;
    margin-bottom: 16px;
  }

  .product-title {
    position: relative;
    z-index: 10;
    font-family: ${headingFont};
    font-weight: 900;
    font-size: ${isLandscape ? 64 : isStory ? 52 : 46}px;
    line-height: 1.15;
    color: #FFFFFF;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
    text-align: center;
    max-width: 90%;
  }

  /* Circular Floating Price Tag */
  .price-circle {
    position: absolute;
    ${isLandscape ? "top: 50%; left: 54%; transform: translate(-50%, -50%);" : "top: 58%; left: 80px; transform: translateY(-50%);"}
    z-index: 25;
    width: ${isLandscape ? 160 : isStory ? 150 : 140}px;
    height: ${isLandscape ? 160 : isStory ? 150 : 140}px;
    border-radius: 50%;
    background: ${priceChip};
    border: 4px solid #EFECE6;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .price-number {
    font-family: ${headingFont};
    font-weight: 900;
    font-size: ${isLandscape ? 40 : 36}px;
    color: #FFFFFF;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  /* Info / Features Section */
  .info-section {
    position: relative;
    z-index: 10;
    flex: ${isLandscape ? "0.9" : isStory ? "0.8" : "0.75"};
    background: #EFECE6;
    padding: ${isLandscape ? "60px 80px" : isStory ? "40px 48px" : "36px 56px"};
    display: flex;
    align-items: center;
    justify-content: space-between;
    ${isStory ? "border-radius: 0 0 36px 36px; box-shadow: 0 24px 60px rgba(0,0,0,0.15);" : ""}
  }

  .features-block {
    margin-left: ${isLandscape ? "60px" : "150px"};
  }
  .features-heading {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #57534E;
    margin-bottom: 12px;
  }
  .features-list {
    list-style: none;
    font-family: ${bodyFont};
    font-size: ${isLandscape ? 17 : 16}px;
    font-weight: 700;
    color: #1C1917;
    line-height: 1.7;
  }
  .features-list li::before {
    content: "• ";
    color: #78716C;
    font-size: 18px;
  }

  .brand-block {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }
  .brand-logo {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    object-fit: contain;
  }
  .brand-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 800;
    color: #1C1917;
    letter-spacing: 0.05em;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <div class="photo-section">
      <img class="product-img" src="${productImageUrl}" alt="${title}" />
      <div class="photo-scrim"></div>

      <div class="badge-tag">${safeBadge}</div>
      <h1 class="product-title">${safeTitle}</h1>
    </div>

    <div class="price-circle">
      <span class="price-number">${safePrice}</span>
    </div>

    <div class="info-section">
      <div class="features-block">
        <div class="features-heading">Öne Çıkan Özellikler</div>
        <ul class="features-list">
          ${featureItemsHtml}
        </ul>
      </div>

      <div class="brand-block">
        ${logoUrl ? `<img class="brand-logo" src="${logoUrl}" alt="${safeBrand}" />` : ""}
        <span class="brand-label">MARKA: ${safeBrand}</span>
      </div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
