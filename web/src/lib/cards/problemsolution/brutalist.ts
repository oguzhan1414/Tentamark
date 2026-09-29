import { type ProblemSolutionCardProps, problemSolutionCardDimensions, escapeHtml, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderProblemSolutionBrutalist(props: ProblemSolutionCardProps): string {
  const { problem, solution, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = problemSolutionCardDimensions(format);
  const problemFont = Math.round(fontSizeForLength(problem.length) * 0.95);
  const solutionFont = Math.round(fontSizeForLength(solution.length) * 0.95);

  const safe = {
    problem: applyRichFormatting(problem, { isDark: false }),
    solution: applyRichFormatting(solution, { isDark: false, circleColor: accent, underlineColor: accent }),
    brand: escapeHtml(brandName),
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const avatarHtml = logoUrl
    ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="${safe.brand}" />`
    : `<div class="brand-fallback">${initial}</div>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #FFFDF5; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    background: #FFFDF5;
    padding: ${format === "story" ? "90px 64px 80px" : "64px 72px 56px"};
    justify-content: space-between;
  }
  .grid-pattern {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(to right, #0000000d 1px, transparent 1px),
                      linear-gradient(to bottom, #0000000d 1px, transparent 1px);
    background-size: 32px 32px;
  }
  .header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #FFFFFF;
    border: 3px solid #111111;
    border-radius: 16px;
    padding: 16px 24px;
    box-shadow: 6px 6px 0px #111111;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 2px solid #111111;
    object-fit: cover;
    background: #FFFFFF;
  }
  .brand-fallback {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    border: 2px solid #111111;
    background: #FFE600;
    color: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 18px;
  }
  .brand-name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 22px;
    color: #111111;
  }
  .tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    background: ${accent};
    color: #111111;
    padding: 6px 12px;
    border: 2px solid #111111;
    border-radius: 8px;
  }

  .content-stack {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${format === "story" ? "40px" : "30px"};
    margin: 30px 0;
  }

  .block {
    position: relative;
    background: #FFFFFF;
    border: 4px solid #111111;
    border-radius: 20px;
    padding: ${format === "story" ? "42px 48px" : "34px 40px"};
    box-shadow: 10px 10px 0px #111111;
  }
  .block.problem-block {
    background: #FFF5F5;
  }
  .block.solution-block {
    background: #F0FDF4;
  }

  .sticker {
    display: inline-block;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 6px 14px;
    border: 3px solid #111111;
    border-radius: 8px;
    box-shadow: 3px 3px 0px #111111;
    margin-bottom: 18px;
  }
  .sticker.problem-sticker {
    background: #FF5A5F;
    color: #FFFFFF;
  }
  .sticker.solution-sticker {
    background: #00E599;
    color: #111111;
  }

  .block-text {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    line-height: 1.35;
    color: #111111;
  }
  .block-text.problem {
    font-size: ${problemFont}px;
    color: #333333;
  }
  .block-text.solution {
    font-size: ${solutionFont}px;
    color: #000000;
  }

  .vs-badge {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    width: 60px;
    height: 60px;
    background: #FFE600;
    border: 4px solid #111111;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 20px;
    box-shadow: 4px 4px 0px #111111;
  }

  .footer {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 14px;
    color: #111111;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="grid-pattern"></div>
  <div class="header">
    <div class="brand-row">
      ${avatarHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <div class="tag">DEĞİŞİM REHBERİ</div>
  </div>

  <div class="content-stack" style="position: relative;">
    <div class="block problem-block">
      <div class="sticker problem-sticker">❌ SORUN</div>
      <div class="block-text problem">${safe.problem}</div>
    </div>

    <div class="vs-badge">VS</div>

    <div class="block solution-block">
      <div class="sticker solution-sticker">⚡ ÇÖZÜM</div>
      <div class="block-text solution">${safe.solution}</div>
    </div>
  </div>

  <div class="footer">
    <span>[#TENTAMARK]</span>
    <span>TAKİP ET VE KAYDET ↗</span>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
