import { type ChangelogCardProps, changelogCardDimensions, escapeHtml } from "./types";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { flexDirForLogoSide, fontStackFor, googleFontsHrefFor, radiusPx, shadowCss } from "../cardTokenStyles";

export function renderChangelogEditorial(
  props: ChangelogCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { badge, title, description, codeSnippet, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const { width, height } = changelogCardDimensions(format);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const safe = {
    badge: escapeHtml(badge),
    title: escapeHtml(title),
    description: escapeHtml(description),
    brand: escapeHtml(brandName),
    snippet: codeSnippet ? escapeHtml(codeSnippet) : "",
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const snippetHtml = safe.snippet
    ? `<div class="editorial-box">
        <div class="box-tag">ÖNE ÇIKAN DEĞİŞİKLİKLER</div>
        <pre class="box-content">${safe.snippet}</pre>
      </div>`
    : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens, ["IBM Plex Mono:wght@500;600"])}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: ${colors.background}; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: ${colors.background};
    padding: ${format === "story" ? "260px 80px 420px" : "64px 80px 56px"};
  }
  .header {
    display: flex;
    flex-direction: ${flexDirForLogoSide(layout.logoPosition)};
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E6E1D8;
    padding-bottom: 22px;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; border: 1px solid #E6E1D8; background: #fff; }
  .brand-fallback {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #18181B;
    color: #FAF9F6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 19px;
  }
  .brand-name { font-family: ${bodyFont}; font-weight: 700; font-size: 22px; color: #18181B; }
  .edition { font-family: ${bodyFont}; font-weight: 700; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3AF; }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 32px 0;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${colors.surface};
    border: 1px solid #E6E1D8;
    padding: 6px 16px;
    border-radius: 999px;
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.06em;
    color: #0F172A;
    margin-bottom: 22px;
    width: fit-content;
  }
  .pill-dot { width: 7px; height: 7px; border-radius: 50%; background: ${colors.accent}; }

  .title {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? "58px" : "50px"};
    line-height: 1.15;
    color: ${colors.text};
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }
  .desc {
    font-family: ${bodyFont};
    font-size: 20px;
    line-height: 1.55;
    color: #4B5563;
    margin-bottom: ${codeSnippet ? "28px" : "0"};
    max-width: 860px;
  }

  .editorial-box {
    background: ${colors.surface};
    border: 1px solid #E6E1D8;
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    padding: 24px 28px;
    box-shadow: ${shadowCss(shape.shadowStyle)};
  }
  .box-tag {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: #9CA3AF;
    margin-bottom: 12px;
  }
  .box-content {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #1F2937;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #E6E1D8;
    padding-top: 20px;
    font-family: ${bodyFont};
    font-size: 13px;
    color: #9CA3AF;
  }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="edition">SÜRÜM BÜLTENİ</span>
  </div>

  <div class="main">
    <div class="pill">
      <span class="pill-dot"></span>
      <span>${safe.badge}</span>
    </div>
    <h1 class="title">${safe.title}</h1>
    <p class="desc">${safe.description}</p>
    ${snippetHtml}
  </div>

  <div class="footer">
    <span>Platform Güncellemesi</span>
    <span>Detayları İnceleyin ↗</span>
  </div>
</div>
</body>
</html>`;
}
