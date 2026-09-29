import { type ProblemSolutionCardProps, problemSolutionCardDimensions, escapeHtml, fontSizeForLength } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import {
  flexDirForLogoSide,
  fontStackFor,
  googleFontsHrefFor,
  legibleChipColor,
  radiusPx,
  shadowCss,
} from "../cardTokenStyles";

export function renderProblemSolutionEditorial(
  props: ProblemSolutionCardProps,
  tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS
): string {
  const { problem, solution, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const accent = colors.accent;
  const { width, height } = problemSolutionCardDimensions(format);
  const problemFont = Math.round(fontSizeForLength(problem.length) * 1.05);
  const solutionFont = Math.round(fontSizeForLength(solution.length) * 1.05);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);
  const chipColor = legibleChipColor(colors.primary);

  const safe = {
    problem: applyRichFormatting(problem, { isDark: false }),
    solution: applyRichFormatting(solution, { isDark: false, circleColor: accent, underlineColor: accent }),
    brand: escapeHtml(brandName),
  };

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
    background: ${colors.background};
    padding: ${format === "story" ? "100px 72px 80px" : "72px 80px 60px"};
    justify-content: space-between;
  }
  .header {
    display: flex;
    flex-direction: ${flexDirForLogoSide(layout.logoPosition)};
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #E6E1D8;
    padding-bottom: 24px;
  }
  .brand-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-logo {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid #E6E1D8;
    background: #FFFFFF;
  }
  .brand-logo-fallback {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #111827;
    color: #FAF8F5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 18px;
  }
  .brand-name {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 20px;
    letter-spacing: -0.01em;
    color: #1F2937;
  }
  .edition-label {
    font-family: ${bodyFont};
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9CA3AF;
  }

  .content-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${format === "story" ? "48px" : "36px"};
    margin: 40px 0;
  }

  .section-box {
    position: relative;
    background: ${colors.surface};
    border: 1px solid #EAE5DC;
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    padding: ${format === "story" ? "44px 48px" : "36px 44px"};
    box-shadow: ${shadowCss(shape.shadowStyle)};
  }
  .section-box.solution-box {
    background: linear-gradient(135deg, ${colors.surface} 0%, #F5FBF7 100%);
    border-color: #D1E7DD;
  }

  .pill-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 6px 14px;
    border-radius: 999px;
    margin-bottom: 18px;
  }
  .pill-badge.problem {
    background: #FEE2E2;
    color: #B91C1C;
  }
  .pill-badge.solution {
    background: #D1FAE5;
    color: #047857;
  }
  .pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .pill-badge.problem .pill-dot { background: #DC2626; }
  .pill-badge.solution .pill-dot { background: #059669; }

  .box-text {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    line-height: 1.35;
    color: #1F2937;
  }
  .box-text.problem-text {
    font-size: ${problemFont}px;
    color: #4B5563;
  }
  .box-text.solution-text {
    font-size: ${solutionFont}px;
    font-weight: 600;
    color: ${colors.text};
  }

  .arrow-connector {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: -16px 0;
    position: relative;
    z-index: 2;
  }
  .arrow-badge {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: ${chipColor};
    color: #FAF8F5;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid #E6E1D8;
    font-family: ${bodyFont};
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
    <span class="edition-label">PROBLEM &amp; ÇÖZÜM</span>
  </div>

  <div class="content-body">
    <div class="section-box">
      <div class="pill-badge problem">
        <span class="pill-dot"></span>
        <span>Mevcut Durum / Sorun</span>
      </div>
      <div class="box-text problem-text">“${safe.problem}”</div>
    </div>

    <div class="arrow-connector">
      <div class="arrow-badge">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
      </div>
    </div>

    <div class="section-box solution-box">
      <div class="pill-badge solution">
        <span class="pill-dot"></span>
        <span>Etkili Çözüm</span>
      </div>
      <div class="box-text solution-text">“${safe.solution}”</div>
    </div>
  </div>

  <div class="footer">
    <span>İçerik Stratejisi</span>
    <span>Kaydetmeyi Unutmayın 🔖</span>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
