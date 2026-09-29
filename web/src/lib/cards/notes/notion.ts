import { type NotesCardProps, notesCardDimensions, escapeHtml } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { fontStackFor, googleFontsHrefFor, radiusPx, shadowCss } from "../cardTokenStyles";

export function renderNotesNotion(props: NotesCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { noteTitle, content, dateLabel, folderName, brandName, logoUrl, format } = props;
  const { colors, typography, shape } = tokens;
  const { width, height } = notesCardDimensions(format);
  const bodyFont = fontStackFor(typography.bodyFamily);

  const safe = {
    title: applySmartHighlights(noteTitle),
    content: applySmartHighlights(content),
    date: escapeHtml(dateLabel),
    folder: folderName ? escapeHtml(folderName) : "Dokümanlar",
    brand: escapeHtml(brandName),
  };

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
    justify-content: center;
    align-items: center;
    background: ${colors.background};
    padding: ${format === "story" ? "260px 72px 420px" : "64px 72px"};
  }
  ${SMART_HIGHLIGHT_CSS}

  .notion-doc {
    width: 100%;
    max-width: ${format === "story" ? "920px" : "860px"};
    background: ${colors.surface};
    border-radius: ${radiusPx(shape.radiusStyle)}px;
    box-shadow: ${shadowCss(shape.shadowStyle)};
    padding: ${format === "story" ? "56px 52px" : "48px 48px"};
    display: flex;
    flex-direction: column;
    border: 1px solid #E9E8E4;
  }

  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: ${bodyFont};
    font-size: 13px;
    color: #9B9A97;
    margin-bottom: 28px;
  }
  .page-icon {
    font-size: 48px;
    margin-bottom: 18px;
    line-height: 1;
  }
  .title {
    font-family: ${bodyFont};
    font-weight: ${typography.headingWeight};
    font-size: ${format === "story" ? "52px" : "44px"};
    line-height: 1.18;
    color: ${colors.text};
    letter-spacing: -0.02em;
    margin-bottom: 20px;
  }
  .meta-row {
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid #EDEDEC;
    padding-bottom: 20px;
    margin-bottom: 28px;
    font-family: ${bodyFont};
    font-size: 13px;
    color: #787774;
  }
  .meta-tag {
    background: ${colors.accent}18;
    color: ${colors.accent};
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 600;
  }

  .content {
    font-family: ${bodyFont};
    font-size: ${format === "story" ? "24px" : "21px"};
    line-height: 1.6;
    color: #37352F;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 32px;
  }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #EDEDEC;
    padding-top: 18px;
    font-family: ${bodyFont};
    font-size: 13px;
    color: #9B9A97;
  }
</style>
</head>
<body>
<div class="card">
  ${FILM_GRAIN_OVERLAY}

  <div class="notion-doc">
    <div class="breadcrumbs">
      <span>Workspace</span>
      <span>/</span>
      <span>${safe.folder}</span>
    </div>

    <div class="page-icon">💡</div>
    <h1 class="title">${safe.title}</h1>

    <div class="meta-row">
      <span class="meta-tag">📅 ${safe.date}</span>
      <span>Yazar: <strong>${safe.brand}</strong></span>
    </div>

    <div class="content">${safe.content}</div>

    <div class="footer-row">
      <span>Notion Çalışma Alanından Alındı</span>
      <span>Kaydet 🔖</span>
    </div>
  </div>
</div>
</body>
</html>`;
}
