import { type ThisOrThatCardProps, thisOrThatCardDimensions, escapeHtml } from "./types";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import {
  flexDirForLogoSide,
  fontStackFor,
  googleFontsHrefFor,
  legibleChipColor,
  radiusPx,
  shadowCss,
} from "../cardTokenStyles";

const CTA_SHAPE: Record<BrandDesignTokens["layout"]["ctaStyle"], (chip: string) => string> = {
  text: (chip) => `background: transparent; color: ${chip}; padding: 0;`,
  pill: (chip) => `background: ${chip}; color: #FAF9F6; padding: 8px 20px; border-radius: 999px;`,
  button: (chip) => `background: ${chip}; color: #FAF9F6; padding: 10px 24px; border-radius: 8px; border-bottom: 3px solid rgba(0,0,0,0.2);`,
};

export function renderThisOrThatEditorial(
  props: ThisOrThatCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { question, optionA, optionB, ctaText, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const { width, height } = thisOrThatCardDimensions(format);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);
  const chipColor = legibleChipColor(colors.primary);
  const chipColor2 = legibleChipColor(colors.secondary);

  const safe = {
    question: escapeHtml(question),
    optA: escapeHtml(optionA),
    optB: escapeHtml(optionB),
    cta: ctaText ? escapeHtml(ctaText) : (format === "story" ? "Hikayede Oy Ver 👆" : "Fikrini Belirt 👇"),
    brand: escapeHtml(brandName),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const pollStickerPlaceholder = format === "story"
    ? `<div class="poll-guide-zone">
        <span class="poll-guide-icon">📊</span>
        <span class="poll-guide-text">ANKET ÇIKARTMASI BURAYA</span>
      </div>`
    : "";

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
  .badge { font-family: ${bodyFont}; font-weight: 700; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3AF; }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: 32px 0;
  }
  .kicker {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: ${colors.accent};
    margin-bottom: 12px;
  }
  .question {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? "56px" : "48px"};
    line-height: 1.15;
    color: ${colors.text};
    margin-bottom: 36px;
    max-width: 900px;
  }

  .options-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .option-card {
    background: ${colors.surface};
    border: 1px solid #E6E1D8;
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    padding: ${format === "story" ? "32px 36px" : "26px 32px"};
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: ${shadowCss(shape.shadowStyle)};
    text-align: left;
  }
  .option-num {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: ${chipColor};
    color: #FAF9F6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 18px;
    flex-shrink: 0;
  }
  .option-num.two { background: ${chipColor2}; }
  .option-text {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: ${format === "story" ? "24px" : "21px"};
    color: #1F2937;
    line-height: 1.35;
  }

  .poll-guide-zone {
    width: 100%;
    margin-top: 24px;
    padding: 18px 24px;
    border: 2px dashed #D1D5DB;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    background: #FFFFFF;
  }
  .poll-guide-icon { font-size: 20px; }
  .poll-guide-text {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.1em;
    color: #6B7280;
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
  .cta-pill {
    ${CTA_SHAPE[layout.ctaStyle](chipColor)}
    font-weight: 700;
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
    <span class="badge">TOPLULUK ANKETİ</span>
  </div>

  <div class="main">
    <div class="kicker">TERCİHİNİZ NEDİR?</div>
    <h1 class="question">${safe.question}</h1>

    <div class="options-container">
      <div class="option-card">
        <div class="option-num">A</div>
        <div class="option-text">${safe.optA}</div>
      </div>

      <div class="option-card">
        <div class="option-num two">B</div>
        <div class="option-text">${safe.optB}</div>
      </div>
    </div>

    ${pollStickerPlaceholder}
  </div>

  <div class="footer">
    <span class="cta-pill">${safe.cta}</span>
    <span>Oylamaya Katıl 🗳️</span>
  </div>
</div>
</body>
</html>`;
}
