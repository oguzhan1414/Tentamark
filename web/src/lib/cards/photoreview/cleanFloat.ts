import { type PhotoReviewCardProps, photoReviewCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderPhotoReviewCleanFloat(props: PhotoReviewCardProps): string {
  const { bgImageUrl, headerText, reviewText, customerName, customerAvatarUrl, rating, badgeText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = photoReviewCardDimensions(format);

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
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #1C1917; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: #1C1917;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: ${isStory ? "space-between" : "center"};
    padding: ${isStory ? "260px 72px 420px" : isLandscape ? "80px 140px" : "80px 80px"};
    overflow: hidden;
  }

  /* Full-bleed background image with subtle shadow gradient */
  .bg-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.85);
  }
  .bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.5) 100%);
    pointer-events: none;
  }

  /* Big Header */
  .header-text {
    position: relative;
    z-index: 10;
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 600;
    font-size: ${isLandscape ? 56 : isStory ? 52 : 46}px;
    color: #FFFFFF;
    text-shadow: 0 4px 24px rgba(0, 0, 0, 0.6);
    letter-spacing: 0.04em;
    margin-bottom: ${isStory ? "auto" : "40px"};
    text-align: center;
  }

  /* Floating Review Card */
  .floating-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: ${isLandscape ? "720px" : isStory ? "780px" : "680px"};
    background: #FFFFFF;
    border-radius: 36px;
    padding: ${isStory ? "54px 48px 44px" : "50px 48px 40px"};
    box-shadow: 
      0 32px 64px -12px rgba(0, 0, 0, 0.45),
      0 12px 24px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: 36px;
  }

  /* Avatar popping over top border */
  .avatar-wrap {
    position: absolute;
    top: -44px;
    left: 50%;
    transform: translateX(-50%);
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 5px solid #FFFFFF;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    background: #E7E5E4;
  }
  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .badge-tag {
    display: inline-block;
    padding: 4px 14px;
    background: #F5F5F4;
    border-radius: 999px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px;
    font-weight: 700;
    color: #57534E;
    margin-top: 16px;
    margin-bottom: 16px;
  }

  .review-text {
    font-family: 'Playfair Display', serif;
    font-size: ${isLandscape ? 24 : isStory ? 26 : 23}px;
    line-height: 1.45;
    color: #292524;
    margin-bottom: 24px;
    max-width: 92%;
  }

  .customer-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #1C1917;
    margin-bottom: 10px;
  }

  .stars {
    font-size: 22px;
    letter-spacing: 4px;
    color: #F59E0B;
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
