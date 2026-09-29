import { type NotesCardProps, notesCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderNotesApple(props: NotesCardProps): string {
  const { noteTitle, content, dateLabel, folderName, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = notesCardDimensions(format);

  const safe = {
    title: applySmartHighlights(noteTitle),
    content: applySmartHighlights(content),
    date: escapeHtml(dateLabel),
    folder: folderName ? escapeHtml(folderName) : "📌 Gizli Notlar",
    brand: escapeHtml(brandName),
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Caveat:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #E5E1D8; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #E5E1D8;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 72px"};
  }
  ${SMART_HIGHLIGHT_CSS}

  .notepad {
    position: relative;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "860px"};
    background: #FCFBF7;
    border-radius: 28px;
    box-shadow: 0 25px 60px -15px rgba(0,0,0,0.18);
    padding: ${format === "story" ? "54px 52px" : "44px 48px"};
    display: flex;
    flex-direction: column;
    border: 1px solid #DCD7CD;
    /* Subtle paper texture */
    background-image: linear-gradient(#00000006 1px, transparent 1px);
    background-size: 100% 40px;
    background-position: 0 20px;
  }

  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    border-bottom: 1px solid #EBE6DC;
    padding-bottom: 16px;
  }
  .folder-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #D97706;
  }
  .action-icons {
    color: #D97706;
    font-size: 20px;
    letter-spacing: 6px;
  }

  .date-line {
    text-align: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    color: #9CA3AF;
    font-weight: 600;
    margin-bottom: 24px;
  }

  .note-title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "48px" : "40px"};
    line-height: 1.22;
    color: #1F2937;
    margin-bottom: 28px;
    letter-spacing: -0.01em;
  }

  .note-body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: ${format === "story" ? "24px" : "21px"};
    line-height: 1.6;
    color: #374151;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 36px;
  }

  .bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #EBE6DC;
    padding-top: 16px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    color: #9CA3AF;
  }
  .brand-sign {
    font-family: 'Caveat', cursive;
    font-size: 24px;
    font-weight: 700;
    color: #4B5563;
  }
</style>
</head>
<body>
<div class="card">
  ${FILM_GRAIN_OVERLAY}

  <div class="notepad">
    <div class="top-bar">
      <span class="folder-tag">${safe.folder}</span>
      <span class="action-icons">📤 ⋯</span>
    </div>

    <div class="date-line">${safe.date}</div>

    <h1 class="note-title">${safe.title}</h1>
    <div class="note-body">${safe.content}</div>

    <div class="bottom-row">
      <span>Notlar Uygulamasından Kaydedildi 🔖</span>
      <span class="brand-sign">${safe.brand}</span>
    </div>
  </div>
</div>
</body>
</html>`;
}
