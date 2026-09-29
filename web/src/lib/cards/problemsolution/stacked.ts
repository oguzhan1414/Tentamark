import { type ProblemSolutionCardProps, problemSolutionCardDimensions, escapeHtml, fontSizeForLength, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderProblemSolutionStacked(props: ProblemSolutionCardProps): string {
  const { problem, solution, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = problemSolutionCardDimensions(format);
  const problemFont = fontSizeForLength(problem.length);
  const solutionFont = fontSizeForLength(solution.length);

  const safe = {
    problem: applyRichFormatting(problem, { isDark: true, circleColor: "#E5484D" }),
    solution: applyRichFormatting(solution, { isDark: true, circleColor: accent, underlineColor: accent }),
    brand: escapeHtml(brandName),
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
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    background: #0B0A0F;
  }
  .half {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 72px;
    overflow: hidden;
  }
  .half.problem { background: #15121A; }
  .half.problem::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 20%, #E5484D 0%, #E5484D00 60%);
    opacity: 0.14;
  }
  .half.solution { background: #0B0A0F; }
  .half.solution::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 80%, ${accent} 0%, ${accent}00 65%);
    opacity: 0.5;
  }
  .eyebrow {
    position: relative;
    z-index: 1;
    font-family: "IBM Plex Sans", sans-serif;
    font-weight: 600;
    font-size: 15px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 22px;
  }
  .half.problem .eyebrow { color: #E5484D; }
  .half.solution .eyebrow { color: ${accent}; }
  .half-text {
    position: relative;
    z-index: 1;
    font-family: "Baloo 2", sans-serif;
    font-weight: 700;
    text-align: center;
    line-height: 1.3;
    max-width: 92%;
  }
  .half.problem .half-text { color: #D8D3DC; }
  .half.solution .half-text { color: #F7F5FB; }

  .divider {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: #0B0A0F;
    border: 3px solid ${accent};
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 28px ${accent}80;
  }

  .brand-row {
    position: absolute;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
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
    <div class="half problem">
      <span class="eyebrow">Sorun</span>
      <p class="half-text" style="font-size:${problemFont}px">${safe.problem}</p>
    </div>
    <div class="half solution">
      <span class="eyebrow">Çözüm</span>
      <p class="half-text" style="font-size:${solutionFont}px">${safe.solution}</p>
    </div>
    <div class="divider">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${accent}" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m0 0l-6-6m6 6l6-6"/></svg>
    </div>
    <div class="brand-row">
      ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
      <span class="brand-name">${safe.brand}</span>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
