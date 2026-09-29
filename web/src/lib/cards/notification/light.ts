import { type NotificationCardProps, notificationCardDimensions, escapeHtml } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { fontStackFor, googleFontsHrefFor, radiusPx } from "../cardTokenStyles";

export function renderNotificationLight(
  props: NotificationCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { headline, subtext, brandName, logoUrl, format } = props;
  const { colors, typography, shape } = tokens;
  const accent = colors.accent;
  const { width, height } = notificationCardDimensions(format);
  const timeLabel = props.timeLabel?.trim() || "şimdi";
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const safe = {
    headline: applyRichFormatting(headline, { isDark: false }),
    subtext: applyRichFormatting(subtext, { isDark: false }),
    brand: escapeHtml(brandName),
    time: escapeHtml(timeLabel),
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens)}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: #F8F9FA; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 50%, #F9FAFB 100%);
    overflow: hidden;
  }
  .orb-1 {
    position: absolute;
    top: 10%;
    left: 15%;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: ${accent};
    filter: blur(140px);
    opacity: 0.16;
  }
  .orb-2 {
    position: absolute;
    bottom: 12%;
    right: 12%;
    width: 440px;
    height: 440px;
    border-radius: 50%;
    background: #60A5FA;
    filter: blur(130px);
    opacity: 0.18;
  }
  .bubble {
    position: relative;
    z-index: 1;
    width: 86%;
    max-width: 880px;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(50px) saturate(190%);
    -webkit-backdrop-filter: blur(50px) saturate(190%);
    border: 1.5px solid rgba(255, 255, 255, 0.95);
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    padding: ${format === "story" ? "54px 48px" : "48px 48px"};
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.03);
  }
  .bubble-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 22px;
  }
  .app-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    background: ${accent};
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FFFFFF;
    font-size: 20px;
    box-shadow: 0 4px 12px ${accent}40;
    overflow: hidden;
  }
  .app-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .app-name {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 17px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #1F2937;
  }
  .time {
    margin-left: auto;
    font-family: ${bodyFont};
    font-weight: 500;
    font-size: 15px;
    color: #9CA3AF;
  }
  .headline {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? 44 : 38}px;
    color: #111827;
    line-height: 1.25;
    margin-bottom: 14px;
    letter-spacing: -0.02em;
  }
  .subtext {
    font-family: ${bodyFont};
    font-weight: 500;
    font-size: ${format === "story" ? 26 : 24}px;
    color: #4B5563;
    line-height: 1.45;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="orb-1"></div>
    <div class="orb-2"></div>
    <div class="bubble">
      <div class="bubble-header">
        <div class="app-icon">
          ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="" />` : "💬"}
        </div>
        <span class="app-name">${safe.brand}</span>
        <span class="time">${safe.time}</span>
      </div>
      <div class="headline">${safe.headline}</div>
      <p class="subtext">${safe.subtext}</p>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
