import { type NotesCardProps, notesCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderNotesDark(props: NotesCardProps): string {
  const { noteTitle, content, dateLabel, folderName, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = notesCardDimensions(format);

  const safe = {
    title: applySmartHighlights(noteTitle),
    content: applySmartHighlights(content),
    date: escapeHtml(dateLabel),
    folder: folderName ? escapeHtml(folderName) : "Kişisel Günlük",
    brand: escapeHtml(brandName),
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0A0A0F; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #0A0A0F;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 72px"};
  }
  .glow {
    position: absolute;
    top: 20%;
    left: -10%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
    filter: blur(100px);
  }
  ${SMART_HIGHLIGHT_CSS}

  .dark-pad {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "860px"};
    background: #141418;
    border-radius: 28px;
    box-shadow: 0 25px 60px -15px rgba(0,0,0,0.6);
    padding: ${format === "story" ? "56px 52px" : "48px 48px"};
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 18px;
    margin-bottom: 24px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: #64748B;
  }
  .folder-badge {
    color: #FBBF24;
    font-weight: 700;
  }

  .date {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: #64748B;
    margin-bottom: 16px;
  }
  .title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "52px" : "44px"};
    line-height: 1.18;
    color: #F8FAFC;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
  }
  .body-text {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: ${format === "story" ? "24px" : "21px"};
    line-height: 1.6;
    color: #CBD5E1;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 32px;
  }

  .footer-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 18px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    color: #64748B;
  }
</style>
</head>
<body>
<div class="card">
  <div class="glow"></div>
  ${FILM_GRAIN_OVERLAY}

  <div class="dark-pad">
    <div class="header-bar">
      <span class="folder-badge">📁 ${safe.folder}</span>
      <span>${safe.brand}</span>
    </div>

    <div class="date">${safe.date}</div>
    <h1 class="title">${safe.title}</h1>
    <div class="body-text">${safe.content}</div>

    <div class="footer-bar">
      <span>Kişisel Strateji Notları</span>
      <span>Kaydet 🔖</span>
    </div>
  </div>
</div>
</body>
</html>`;
}
