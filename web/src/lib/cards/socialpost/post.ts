import { type SocialPostCardProps, socialPostCardDimensions, escapeHtml, slugifyHandle } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";

// Deliberately generic chrome (no specific platform's wordmark/bird/X
// logo) — evokes "this is a social post" through the avatar+handle+text+
// icon-row convention everyone recognizes, without copying one platform's
// trademarked UI. Runs the body font throughout, not the brand's playful
// display face — the whole point of this format is reading as a genuine
// screenshot, and a rounded display font would break that illusion. Only
// colors.accent is token-driven here for that same reason: this variant is
// intentionally NOT brand-themed beyond the avatar accent.
export function renderSocialPost(props: SocialPostCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { text, brandName, logoUrl, format } = props;
  const accent = tokens.colors.accent;
  const { width, height } = socialPostCardDimensions(format);
  const handle = props.handle?.trim() || slugifyHandle(brandName);
  const fontSize = text.length <= 80 ? 34 : text.length <= 160 ? 28 : 24;

  const safe = { text: applyRichFormatting(text, { isDark: false }), brand: escapeHtml(brandName), handle: escapeHtml(handle) };

  const icon = (path: string) =>
    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="${path}"/></svg>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: "IBM Plex Sans", sans-serif; }
  html, body { width: ${width}px; height: ${height}px; background: #ECEDEF; overflow: hidden; }
  .card {
    width: ${width}px;
    height: ${height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ECEDEF;
  }
  .post {
    width: 86%;
    max-width: 900px;
    background: #ffffff;
    border-radius: 28px;
    padding: 44px 44px 36px;
    box-shadow: 0 20px 60px rgba(20,18,30,0.10);
  }
  .top { display: flex; align-items: center; gap: 16px; margin-bottom: 26px; }
  .avatar {
    width: 60px; height: 60px; border-radius: 50%; object-fit: contain;
    background: ${accent}; padding: 10px; flex-shrink: 0;
  }
  .avatar-fallback {
    width: 60px; height: 60px; border-radius: 50%; background: ${accent};
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 24px; color: #ffffff; flex-shrink: 0;
  }
  .names { display: flex; flex-direction: column; }
  .display-name { font-weight: 700; font-size: 22px; color: #16181C; }
  .handle { font-weight: 400; font-size: 18px; color: #6B7280; margin-top: 2px; }
  .post-text {
    font-weight: 400;
    font-size: ${fontSize}px;
    line-height: 1.5;
    color: #16181C;
    letter-spacing: -0.003em;
    margin-bottom: 32px;
    white-space: pre-line;
  }
  .icon-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 420px;
    padding-top: 22px;
    border-top: 1px solid #EFF0F1;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="post">
      <div class="top">
        ${logoUrl
          ? `<img class="avatar" src="${escapeHtml(logoUrl)}" alt="" />`
          : `<div class="avatar-fallback">${safe.brand.charAt(0).toUpperCase()}</div>`}
        <div class="names">
          <span class="display-name">${safe.brand}</span>
          <span class="handle">@${safe.handle}</span>
        </div>
      </div>
      <p class="post-text">${safe.text}</p>
      <div class="icon-row">
        ${icon("M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z")}
        ${icon("M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3")}
        ${icon("M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z")}
        ${icon("M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13")}
      </div>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
