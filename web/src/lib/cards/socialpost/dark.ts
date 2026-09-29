import { type SocialPostCardProps, socialPostCardDimensions, escapeHtml, resolveAccent, slugifyHandle } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderSocialPostDark(props: SocialPostCardProps): string {
  const { text, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = socialPostCardDimensions(format);
  const handle = props.handle?.trim() || slugifyHandle(brandName);
  const fontSize = text.length <= 80 ? 36 : text.length <= 160 ? 30 : 25;

  const safe = { text: applyRichFormatting(text, { isDark: true }), brand: escapeHtml(brandName), handle: escapeHtml(handle) };

  const icon = (path: string) =>
    `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#71767B" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="${path}"/></svg>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; font-family: "IBM Plex Sans", sans-serif; }
  html, body { width: ${width}px; height: ${height}px; background: #000000; overflow: hidden; }
  .card {
    width: ${width}px;
    height: ${height}px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000000;
  }
  .post {
    width: 88%;
    max-width: 900px;
    background: #16181C;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 28px;
    padding: 48px 48px 40px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
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
  .display-name {
    font-weight: 700;
    font-size: 22px;
    color: #E7E9EA;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .verified-badge {
    width: 18px;
    height: 18px;
    fill: #1D9BF0;
  }
  .handle { font-weight: 400; font-size: 18px; color: #71767B; margin-top: 2px; }
  .post-text {
    font-size: ${fontSize}px;
    line-height: 1.48;
    color: #F7F9F9;
    margin-bottom: 32px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .actions {
    display: flex;
    justify-content: space-between;
    max-width: 480px;
    padding-top: 22px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  .action { display: flex; align-items: center; gap: 10px; color: #71767B; font-size: 16px; font-weight: 500; }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="post">
      <div class="top">
        ${
          logoUrl
            ? `<img class="avatar" src="${escapeHtml(logoUrl)}" alt="" />`
            : `<div class="avatar-fallback">${safe.brand.slice(0, 1)}</div>`
        }
        <div class="names">
          <span class="display-name">
            ${safe.brand}
            <svg class="verified-badge" viewBox="0 0 24 24"><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 10.45.7 11.82.7 13.4c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238 1.15 1.273 2.52 2.148 4.1 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-1.15 2.148-2.52 2.148-4.1zm-11.7 4.3l-4.5-4.5 1.4-1.4 3.1 3.1 7.1-7.1 1.4 1.4-8.5 8.5z"/></svg>
          </span>
          <span class="handle">@${safe.handle}</span>
        </div>
      </div>
      <p class="post-text">${safe.text}</p>
      <div class="actions">
        <div class="action">${icon("M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z")}</div>
        <div class="action">${icon("M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15")}</div>
        <div class="action">${icon("M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z")}</div>
        <div class="action">${icon("M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z")}</div>
      </div>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
