import { type PhotoReviewCardProps, photoReviewCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderPhotoReviewGlassFrost(props: PhotoReviewCardProps): string {
  const { bgImageUrl, headerText, reviewText, customerName, customerAvatarUrl, rating, badgeText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = photoReviewCardDimensions(format);

  const safeHeader = escapeHtml(headerText);
  const formattedReview = applyRichFormatting(reviewText, { isDark: true });
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
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0A0A0E; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: #0A0A0E;
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
    filter: brightness(0.65) saturate(1.1);
  }
  .bg-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(10, 10, 14, 0.4) 0%, rgba(10, 10, 14, 0.8) 100%);
    pointer-events: none;
  }

  .header-text {
    position: relative;
    z-index: 10;
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: ${isLandscape ? 54 : isStory ? 48 : 42}px;
    color: #FFFFFF;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.8);
    margin-bottom: ${isStory ? "auto" : "40px"};
    text-align: center;
  }

  .floating-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: ${isLandscape ? "720px" : isStory ? "780px" : "680px"};
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 36px;
    padding: ${isStory ? "54px 48px 44px" : "50px 48px 40px"};
    box-shadow: 
      0 32px 64px -12px rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
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
    border: 4px solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    background: #111111;
  }
  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .badge-tag {
    display: inline-block;
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #F8FAFC;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .review-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    font-size: ${isLandscape ? 22 : isStory ? 24 : 21}px;
    line-height: 1.5;
    color: #F8FAFC;
    margin-bottom: 24px;
    max-width: 92%;
  }

  .customer-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #FFFFFF;
    margin-bottom: 10px;
  }

  .stars {
    font-size: 22px;
    letter-spacing: 4px;
    color: #FBBF24;
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

      ${safeBadge ? `<span class="badge-tag">${safeBadge}</span>` : `<div style="height: 12px;"></div>`}
      <p class="review-text">&ldquo;${formattedReview}&rdquo;</p>
      <div class="customer-name">${safeName}</div>
      <div class="stars">${starsHtml}</div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
