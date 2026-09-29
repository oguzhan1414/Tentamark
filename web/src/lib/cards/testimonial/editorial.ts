import { type TestimonialCardProps, testimonialCardDimensions, escapeHtml, fontSizeForLength } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import {
  densityScale,
  flexDirForLogoSide,
  fontStackFor,
  googleFontsHrefFor,
  legibleChipColor,
  scalePadding,
} from "../cardTokenStyles";

function starRow(rating: number, accent: string): string {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, i) => {
    const color = i < filled ? accent : "#E5E7EB";
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="${color}"><path d="M12 2l2.9 6.6L22 9.3l-5 4.9L18.2 22 12 18.3 5.8 22 7 14.2l-5-4.9 7.1-.7z"/></svg>`;
  }).join("");
}

export function renderTestimonialEditorial(
  props: TestimonialCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { testimonialText, customerName, customerRole, customerAvatarUrl, brandName, logoUrl, format } = props;
  const { colors, typography, layout } = tokens;
  const { width, height } = testimonialCardDimensions(format);
  const fontSize = Math.round(fontSizeForLength(testimonialText.length, format) * 1.1);
  const scale = densityScale(layout.density);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);
  const chipColor = legibleChipColor(colors.primary);
  const chipColor2 = legibleChipColor(colors.secondary);

  const safe = {
    text: applyRichFormatting(testimonialText, { isDark: false, circleColor: colors.accent, underlineColor: colors.accent }),
    name: escapeHtml(customerName),
    role: customerRole ? escapeHtml(customerRole) : "",
    brand: escapeHtml(brandName),
  };

  const initial = customerName ? customerName.charAt(0).toUpperCase() : "M";
  const avatarHtml = customerAvatarUrl
    ? `<img src="${escapeHtml(customerAvatarUrl)}" alt="${safe.name}" class="avatar" />`
    : `<div class="avatar-fallback">${initial}</div>`;

  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-logo-fallback">${brandName ? brandName.charAt(0).toUpperCase() : "T"}</div>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens)}" rel="stylesheet">
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
    padding: ${format === "story" ? scalePadding([100, 72, 80], scale) : scalePadding([72, 80, 60], scale)};
  }
  .header {
    display: flex;
    flex-direction: ${flexDirForLogoSide(layout.logoPosition)};
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E6E1D8;
    padding-bottom: 24px;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    object-fit: cover;
    border: 1px solid #E6E1D8;
    background: #FFFFFF;
  }
  .brand-logo-fallback {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: #18181B;
    color: #FAF9F6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 19px;
  }
  .brand-name {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 22px;
    color: #18181B;
  }
  .quote-label {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9CA3AF;
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 40px 0;
    position: relative;
  }
  .giant-quote {
    font-family: ${headingFont};
    font-size: 120px;
    line-height: 0.8;
    color: ${colors.accent};
    opacity: 0.4;
    margin-bottom: 8px;
  }
  .stars {
    display: flex;
    gap: 6px;
    margin-bottom: 28px;
  }
  .quote-text {
    font-family: ${headingFont};
    font-style: italic;
    font-size: ${fontSize}px;
    line-height: 1.32;
    color: ${colors.text};
    margin-bottom: 40px;
    max-width: 900px;
  }

  .customer-row {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #FFFFFF;
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  }
  .avatar-fallback {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${chipColor}, ${chipColor2});
    color: #FAF9F6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 28px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  }
  .customer-info { display: flex; flex-direction: column; gap: 4px; }
  .customer-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 24px;
    color: #111827;
  }
  .customer-role {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    font-size: 16px;
    color: #6B7280;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #E6E1D8;
    padding-top: 20px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    color: #9CA3AF;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="quote-label">MÜŞTERİ DENEYİMİ</span>
  </div>

  <div class="main">
    <div class="giant-quote">“</div>
    ${props.rating ? `<div class="stars">${starRow(props.rating, colors.accent)}</div>` : ""}
    <div class="quote-text">${safe.text}</div>
    <div class="customer-row">
      ${avatarHtml}
      <div class="customer-info">
        <span class="customer-name">${safe.name}</span>
        ${safe.role ? `<span class="customer-role">${safe.role}</span>` : ""}
      </div>
    </div>
  </div>

  <div class="footer">
    <span>Gerçek Kullanıcı Geri Bildirimi</span>
    <span>⭐⭐⭐⭐⭐</span>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
