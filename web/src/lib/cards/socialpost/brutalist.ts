import { type SocialPostCardProps, socialPostCardDimensions, escapeHtml, resolveAccent, slugifyHandle } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderSocialPostBrutalist(props: SocialPostCardProps): string {
  const { text, brandName, handle, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = socialPostCardDimensions(format);

  const safeHandle = handle ? escapeHtml(handle.replace(/^@/, "")) : slugifyHandle(brandName);
  const safe = {
    text: applyRichFormatting(text, { isDark: false }),
    brand: escapeHtml(brandName),
    handle: safeHandle,
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const avatarHtml = logoUrl
    ? `<img class="avatar" src="${escapeHtml(logoUrl)}" alt="${safe.brand}" />`
    : `<div class="avatar fallback">${initial}</div>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #FFFDF9; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFFDF9;
    padding: ${format === "story" ? "0 48px" : "0 64px"};
  }
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, #0000000a 1px, transparent 1px),
                      linear-gradient(to bottom, #0000000a 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .post-box {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "880px"};
    background: #FFFFFF;
    border: 4px solid #111111;
    border-radius: 20px;
    box-shadow: 12px 12px 0px #111111;
    padding: 48px 52px;
  }
  .badge-tag {
    position: absolute;
    top: -18px;
    right: 32px;
    background: ${accent};
    color: #111111;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    padding: 6px 14px;
    border: 3px solid #111111;
    border-radius: 999px;
    box-shadow: 3px 3px 0px #111111;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 28px;
  }
  .avatar {
    width: 68px;
    height: 68px;
    border-radius: 14px;
    object-fit: cover;
    border: 3px solid #111111;
    box-shadow: 3px 3px 0px #111111;
    background: #FFFFFF;
  }
  .avatar.fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #FFE600;
    color: #111111;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 28px;
  }
  .meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .brand-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .brand-name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 24px;
    color: #111111;
    line-height: 1.1;
  }
  .verified-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: #111111;
    color: #FFE600;
    border-radius: 50%;
  }
  .handle {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 15px;
    font-weight: 500;
    color: #666666;
  }
  .text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 30px;
    line-height: 1.45;
    font-weight: 500;
    color: #111111;
    margin-bottom: 36px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 3px solid #111111;
    padding-top: 24px;
  }
  .stat-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 15px;
    color: #111111;
  }
  .icon-box {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F4F2EC;
    border: 2px solid #111111;
    border-radius: 8px;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="grid-pattern"></div>
  <div class="post-box">
    <div class="badge-tag">TRENDING</div>
    <div class="header">
      ${avatarHtml}
      <div class="meta">
        <div class="brand-line">
          <span class="brand-name">${safe.brand}</span>
          <span class="verified-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </span>
        </div>
        <span class="handle">@${safe.handle}</span>
      </div>
    </div>
    <div class="text">${safe.text}</div>
    <div class="footer">
      <div class="stat-pill">
        <div class="icon-box">💬</div>
      </div>
      <div class="stat-pill">
        <div class="icon-box">🔄</div>
      </div>
      <div class="stat-pill">
        <div class="icon-box">❤️</div>
      </div>
      <div class="stat-pill">
        <div class="icon-box">🔖</div>
      </div>
    </div>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
