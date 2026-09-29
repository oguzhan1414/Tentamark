import { type NewsFlashCardProps, newsFlashCardDimensions, escapeHtml } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { fontStackFor, googleFontsHrefFor } from "../cardTokenStyles";

// "Breaking RED" is the point — the urgent-red palette stays fixed; only
// fonts are brand-driven, same reasoning as chat/podcast/deal's fixed
// palettes.
export function renderNewsFlashBreakingRed(
  props: NewsFlashCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { bgImageUrl, badgeText, sourceText, headline, ctaText, bubbleText, brandName, logoUrl, format } = props;
  const headingFont = fontStackFor(tokens.typography.headingFamily);
  const bodyFont = fontStackFor(tokens.typography.bodyFamily);
  const { width, height } = newsFlashCardDimensions(format);

  const safeBadge = badgeText ? escapeHtml(badgeText) : "🔴 CANLI / SON DAKİKA";
  const safeSource = sourceText ? escapeHtml(sourceText) : "kaynak: @tentamark";
  const formattedHeadline = applyRichFormatting(headline, { isDark: true, highlightColor: "#EF4444" });
  const safeCta = ctaText ? escapeHtml(ctaText) : "Yorumlarda fikrini belirt 👇";
  const safeBubble = bubbleText ? escapeHtml(bubbleText) : "";
  const safeBrand = escapeHtml(brandName);

  const isStory = format === "story";
  const isLandscape = format === "landscape";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens, ["Space Grotesk:wght@700;800"])}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0B0A0F; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: #0B0A0F;
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
  .bg-scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%);
    pointer-events: none;
  }

  /* News Ticker / Live Header */
  .news-header {
    position: relative;
    z-index: 10;
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }
  .live-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background: #DC2626;
    color: #FFFFFF;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.6);
  }
  .pulse-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 0 0 10px #FFFFFF;
  }

  .source-pill {
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #F87171;
  }

  /* Main Headline Box */
  .news-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  ${
    safeBubble
      ? `.reaction-bubble {
    align-self: flex-start;
    padding: 10px 20px;
    border-radius: 20px 20px 20px 4px;
    background: #FFFFFF;
    color: #111111;
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 15px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  }`
      : ""
  }

  .headline {
    font-family: ${headingFont};
    font-weight: 900;
    font-size: ${isLandscape ? 68 : isStory ? 54 : 48}px;
    line-height: 1.15;
    color: #FFFFFF;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.8);
  }

  /* Footer bar */
  .news-footer {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 2px solid rgba(220, 38, 38, 0.6);
  }
  .cta-text {
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 16px;
    color: #FCA5A5;
  }
  .brand-name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0.05em;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <img class="bg-image" src="${bgImageUrl}" alt="" />
    <div class="bg-scrim"></div>

    <div class="news-header">
      <div class="live-badge">
        <span class="pulse-dot"></span>
        <span>${safeBadge}</span>
      </div>
      <div class="source-pill">${safeSource}</div>
    </div>

    <div class="news-content">
      ${safeBubble ? `<div class="reaction-bubble">${safeBubble}</div>` : ""}
      <h1 class="headline">${formattedHeadline}</h1>
    </div>

    <div class="news-footer">
      <div class="cta-text">${safeCta}</div>
      <div class="brand-name">${safeBrand}</div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
