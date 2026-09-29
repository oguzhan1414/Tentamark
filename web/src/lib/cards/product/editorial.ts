import { type ProductCardProps, productCardDimensions, escapeHtml } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import {
  densityScale,
  flexDirForLogoSide,
  fontStackFor,
  googleFontsHrefFor,
  legibleChipColor,
  radiusPx,
  scalePadding,
  shadowCss,
} from "../cardTokenStyles";

const IMAGERY_FILTER: Record<BrandDesignTokens["imagery"]["treatment"], string> = {
  clean: "none",
  warm: "sepia(0.12) saturate(1.1)",
  vivid: "saturate(1.35)",
  editorial: "contrast(1.05) saturate(0.92)",
  cinematic: "contrast(1.15) brightness(0.92)",
};

const CTA_SHAPE: Record<BrandDesignTokens["layout"]["ctaStyle"], (chip: string) => string> = {
  text: (chip) => `background: transparent; color: ${chip}; padding: 0; border-radius: 0;`,
  pill: (chip) => `background: ${chip}; color: #FAF9F6; padding: 6px 16px; border-radius: 999px;`,
  button: (chip) => `background: ${chip}; color: #FAF9F6; padding: 10px 22px; border-radius: 8px; border-bottom: 3px solid rgba(0,0,0,0.2);`,
};

export function renderProductEditorial(props: ProductCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { imageUrl, title, description, brandName, logoUrl, format } = props;
  const { colors, typography, shape, imagery, layout } = tokens;
  const { width, height } = productCardDimensions(format);
  const scale = densityScale(layout.density);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);
  const chipColor = legibleChipColor(colors.primary);

  const safe = {
    title: escapeHtml(title),
    titleFormatted: applyRichFormatting(title, { isDark: false }),
    description: applyRichFormatting(description, { isDark: false }),
    brand: escapeHtml(brandName),
    imageUrl: escapeHtml(imageUrl),
  };

  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${brandName ? brandName.charAt(0).toUpperCase() : "T"}</div>`;

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
    padding: ${format === "story" ? scalePadding([96, 72, 80], scale) : scalePadding([64, 80, 56], scale)};
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
  .brand-fallback {
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
  .edition {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${colors.accent};
  }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 32px 0;
  }

  .image-container {
    width: 100%;
    max-width: ${format === "story" ? "780px" : "720px"};
    height: ${format === "story" ? "700px" : "460px"};
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    overflow: hidden;
    position: relative;
    background: #FFFFFF;
    border: 1px solid #E5E0D5;
    box-shadow: ${shadowCss(shape.shadowStyle)};
    margin-bottom: ${format === "story" ? "44px" : "32px"};
  }
  .image-container::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,${imagery.overlayStrength}), rgba(0,0,0,0) 40%);
    pointer-events: none;
  }
  .product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: ${IMAGERY_FILTER[imagery.treatment]};
  }

  .text-content {
    text-align: center;
    max-width: 820px;
  }
  .title {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? "56px" : "48px"};
    line-height: 1.18;
    color: ${colors.text};
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }
  .desc {
    font-family: ${bodyFont};
    font-weight: ${typography.bodyWeight};
    font-size: 20px;
    line-height: 1.5;
    color: #4B5563;
    max-width: 680px;
    margin: 0 auto;
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
  .tag-pill {
    ${CTA_SHAPE[layout.ctaStyle](chipColor)}
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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
    <span class="edition">ÖNE ÇIKAN KOLEKSİYON</span>
  </div>

  <div class="main">
    <div class="image-container">
      <img src="${safe.imageUrl}" alt="${safe.title}" class="product-image" />
    </div>

    <div class="text-content">
      <h1 class="title">${safe.titleFormatted}</h1>
      <p class="desc">${safe.description}</p>
    </div>
  </div>

  <div class="footer">
    <span class="tag-pill">KEŞFET</span>
    <span>Detaylar İçin Link Profilde ↗</span>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
