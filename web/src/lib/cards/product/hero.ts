import { type ProductCardProps, productCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

// Full-bleed product photo with a bottom scrim for text legibility — the
// one layout in this whole library whose centerpiece is a real photo, not
// generated graphics, so most of the file is just making sure the gradient
// reads correctly across format and doesn't fight the photo underneath.
export function renderProductHero(props: ProductCardProps): string {
  const { imageUrl, title, description, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = productCardDimensions(format);

  const safe = {
    title: applyRichFormatting(title, { isDark: true }),
    description: applyRichFormatting(description, { isDark: true }),
    brand: escapeHtml(brandName),
    imageUrl: escapeHtml(imageUrl),
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=IBM+Plex+Sans:wght@500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0B0A0F; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
  }
  .photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .scrim {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, #0B0A0F 0%, #0B0A0Fcc 22%, #0B0A0F55 42%, #0B0A0F00 62%);
  }
  .accent-line {
    position: absolute;
    bottom: ${format === "story" ? "22%" : "26%"};
    left: 64px;
    width: 56px;
    height: 4px;
    border-radius: 999px;
    background: ${accent};
  }
  .title {
    position: absolute;
    bottom: ${format === "story" ? "24.5%" : "28.5%"};
    left: 64px;
    right: 64px;
    font-family: "Baloo 2", sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? 62 : 56}px;
    line-height: 1.15;
    color: #ffffff;
    letter-spacing: -0.01em;
  }
  .description {
    position: absolute;
    bottom: ${format === "story" ? "16%" : "18%"};
    left: 64px;
    right: 64px;
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 500;
    font-size: 24px;
    line-height: 1.5;
    color: rgba(255,255,255,0.78);
    max-width: 90%;
  }
  .brand-row {
    position: absolute;
    bottom: 5%;
    left: 64px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-logo { width: 36px; height: 36px; border-radius: 10px; object-fit: contain; background: #fff; padding: 5px; }
  .brand-name { font-family: "IBM Plex Sans", sans-serif; font-weight: 600; font-size: 20px; letter-spacing: 0.02em; color: #ffffff; opacity: 0.85; }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <img class="photo" src="${safe.imageUrl}" alt="" />
    <div class="scrim"></div>
    <div class="accent-line"></div>
    <p class="title">${safe.title}</p>
    <p class="description">${safe.description}</p>
    <div class="brand-row">
      ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
      <span class="brand-name">${safe.brand}</span>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
