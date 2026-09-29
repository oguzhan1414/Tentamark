import { type PhotoReviewCardProps, photoReviewCardDimensions, escapeHtml } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { fontStackFor, googleFontsHrefFor, radiusPx } from "../cardTokenStyles";

export function renderPhotoReviewWarmEditorial(
  props: PhotoReviewCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { bgImageUrl, headerText, reviewText, customerName, customerAvatarUrl, rating, badgeText, brandName, logoUrl, format } = props;
  const { colors, typography, shape } = tokens;
  const { width, height } = photoReviewCardDimensions(format);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const safeHeader = escapeHtml(headerText);
  const formattedReview = applyRichFormatting(reviewText, { isDark: false });
  const safeName = escapeHtml(customerName);
  const safeBadge = badgeText ? escapeHtml(badgeText) : "";
  const starsCount = Math.max(1, Math.min(5, rating ?? 5));
  const starsHtml = "★".repeat(starsCount) + "☆".repeat(5 - starsCount);

  const isStory = format === "story";
  const isLandscape = format === "landscape";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens)}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #6F6253; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: #6F6253;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: ${isStory ? "space-between" : "center"};
    padding: ${isStory ? "260px 72px 420px" : isLandscape ? "80px 140px" : "80px 80px"};
    overflow: hidden;
  }

  .bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.8);
  }
  .bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(74, 63, 53, 0.4) 0%, rgba(74, 63, 53, 0.2) 50%, rgba(74, 63, 53, 0.7) 100%);
    pointer-events: none;
  }

  .header-text {
    position: relative;
    z-index: 10;
    font-family: ${headingFont};
    font-style: italic;
    font-weight: ${typography.headingWeight};
    font-size: ${isLandscape ? 56 : isStory ? 52 : 46}px;
    color: #FAF8F5;
    letter-spacing: 0.08em;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
    margin-bottom: ${isStory ? "auto" : "40px"};
    text-align: center;
  }

  .floating-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: ${isLandscape ? "720px" : isStory ? "780px" : "680px"};
    background: ${colors.surface};
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    padding: ${isStory ? "54px 48px 44px" : "50px 48px 40px"};
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 
      0 32px 64px -12px rgba(40, 30, 20, 0.4),
      0 12px 24px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 36px;
  }

  .avatar-wrap {
    position: absolute;
    top: -44px;
    left: 50%;
    transform: translateX(-50%);
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 5px solid #FAF8F5;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    background: #E7E5E4;
  }
  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .review-text {
    font-family: ${headingFont};
    font-size: ${isLandscape ? 24 : isStory ? 26 : 23}px;
    line-height: 1.45;
    color: #292524;
    margin-top: 20px;
    margin-bottom: 24px;
    max-width: 92%;
  }

  .customer-name {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #44403C;
    margin-bottom: 8px;
  }

  .stars {
    font-size: 22px;
    letter-spacing: 4px;
    color: ${colors.accent};
    line-height: 1;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <img class="bg-image" src="${bgImageUrl}" alt="" />
    <div class="bg-overlay"></div>

    <h1 class="header-text">${safeHeader}</h1>

    <div class="floating-card">
      <div class="avatar-wrap">
        <img class="avatar-img" src="${customerAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80'}" alt="${safeName}" />
      </div>

      <p class="review-text">&ldquo;${formattedReview}&rdquo;</p>
      <div class="customer-name">${safeName}</div>
      <div class="stars">${starsHtml}</div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
