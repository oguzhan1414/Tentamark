import { type EventCardProps, eventCardDimensions, escapeHtml } from "./types";
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

export function renderEventEditorial(props: EventCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { eventTitle, dateText, speaker1Name, speaker1Role, speaker1AvatarUrl, speaker2Name, speaker2Role, speaker2AvatarUrl, badgeText, brandName, logoUrl, format } = props;
  const { colors, typography, shape, layout } = tokens;
  const { width, height } = eventCardDimensions(format);
  const headingFont = fontStackFor(typography.headingFamily);
  const bodyFont = fontStackFor(typography.bodyFamily);
  const chipColor = legibleChipColor(colors.primary);
  const chipColor2 = legibleChipColor(colors.secondary);

  const safe = {
    title: escapeHtml(eventTitle),
    date: escapeHtml(dateText),
    badge: badgeText ? escapeHtml(badgeText) : "ÖZEL DAVET",
    brand: escapeHtml(brandName),
    s1Name: escapeHtml(speaker1Name),
    s1Role: escapeHtml(speaker1Role),
    s2Name: speaker2Name ? escapeHtml(speaker2Name) : "",
    s2Role: speaker2Role ? escapeHtml(speaker2Role) : "",
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const s1Init = speaker1Name ? speaker1Name.charAt(0).toUpperCase() : "A";
  const s1Avatar = speaker1AvatarUrl
    ? `<img src="${escapeHtml(speaker1AvatarUrl)}" alt="${safe.s1Name}" class="speaker-avatar" />`
    : `<div class="speaker-fallback">${s1Init}</div>`;

  let speakersHtml = `<div class="speaker-card">
    ${s1Avatar}
    <div class="speaker-meta">
      <span class="speaker-name">${safe.s1Name}</span>
      <span class="speaker-role">${safe.s1Role}</span>
    </div>
  </div>`;

  if (speaker2Name) {
    const s2Init = speaker2Name.charAt(0).toUpperCase();
    const s2Avatar = speaker2AvatarUrl
      ? `<img src="${escapeHtml(speaker2AvatarUrl)}" alt="${safe.s2Name}" class="speaker-avatar" />`
      : `<div class="speaker-fallback two">${s2Init}</div>`;

    speakersHtml = `<div class="speakers-row">
      <div class="speaker-card">
        ${s1Avatar}
        <div class="speaker-meta">
          <span class="speaker-name">${safe.s1Name}</span>
          <span class="speaker-role">${safe.s1Role}</span>
        </div>
      </div>
      <div class="speaker-separator">&amp;</div>
      <div class="speaker-card">
        ${s2Avatar}
        <div class="speaker-meta">
          <span class="speaker-name">${safe.s2Name}</span>
          <span class="speaker-role">${safe.s2Role}</span>
        </div>
      </div>
    </div>`;
  }

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
  .badge { font-family: ${bodyFont}; font-weight: 700; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: ${colors.accent}; }

  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 32px 0;
  }
  .date-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${colors.surface};
    border: 1px solid #E6E1D8;
    padding: 6px 16px;
    border-radius: 999px;
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 14px;
    color: #1F2937;
    margin-bottom: 20px;
    width: fit-content;
  }
  .title {
    font-family: ${headingFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? "58px" : "48px"};
    line-height: 1.15;
    color: ${colors.text};
    margin-bottom: 36px;
    max-width: 900px;
  }

  .speakers-row {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .speaker-separator {
    font-family: ${headingFont};
    font-style: italic;
    font-size: 28px;
    color: #9CA3AF;
  }
  .speaker-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: ${colors.surface};
    border: 1px solid #E6E1D8;
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    padding: 16px 24px;
    box-shadow: ${shadowCss(shape.shadowStyle)};
  }
  .speaker-avatar {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #E6E1D8;
  }
  .speaker-fallback {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: ${chipColor};
    color: #FAF9F6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 22px;
  }
  .speaker-fallback.two {
    background: ${chipColor2};
  }
  .speaker-meta { display: flex; flex-direction: column; gap: 4px; }
  .speaker-name {
    font-family: ${bodyFont};
    font-weight: 800;
    font-size: 18px;
    color: #111827;
  }
  .speaker-role {
    font-family: ${bodyFont};
    font-weight: 600;
    font-size: 14px;
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
  .join-btn {
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
    <span class="badge">${safe.badge}</span>
  </div>

  <div class="main">
    <div class="date-pill">🗓️ ${safe.date}</div>
    <h1 class="title">${safe.title}</h1>
    ${speakersHtml}
  </div>

  <div class="footer">
    <span class="join-btn">Etkinliğe Katıl ↗</span>
    <span>Sınırlı Kontenjan</span>
  </div>
</div>
</body>
</html>`;
}
