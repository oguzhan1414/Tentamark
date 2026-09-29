import { type ChangelogCardProps, changelogCardDimensions, escapeHtml, resolveAccent } from "./types";

export function renderChangelogBrutalist(props: ChangelogCardProps): string {
  const { badge, title, description, codeSnippet, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = changelogCardDimensions(format);

  const safe = {
    badge: escapeHtml(badge),
    title: escapeHtml(title),
    description: escapeHtml(description),
    brand: escapeHtml(brandName),
    snippet: codeSnippet ? escapeHtml(codeSnippet) : "",
  };

  const initial = brandName ? brandName.charAt(0).toUpperCase() : "T";
  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-fallback">${initial}</div>`;

  const snippetHtml = safe.snippet
    ? `<div class="retro-terminal">
        <div class="terminal-bar">
          <span>&gt;_ terminal</span>
          <span>bash</span>
        </div>
        <pre class="terminal-code">${safe.snippet}</pre>
      </div>`
    : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=IBM+Plex+Mono:wght@600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #FFFDF5; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #FFFDF5;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 72px 56px"};
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
  .brand-logo { width: 38px; height: 38px; border-radius: 8px; border: 2px solid #111111; object-fit: cover; background: #fff; }
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
  .brand-name { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 22px; color: #111111; }
  .tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    background: #00E599;
    color: #111111;
    padding: 6px 12px;
    border: 2px solid #111111;
    border-radius: 8px;
  }

  .main-box {
    position: relative;
    z-index: 1;
    background: #FFFFFF;
    border: 4px solid #111111;
    border-radius: 24px;
    box-shadow: 12px 12px 0px #111111;
    padding: ${format === "story" ? "48px 44px" : "36px 44px"};
    display: flex;
    flex-direction: column;
    margin: 28px 0;
  }
  .sticker {
    display: inline-block;
    background: #FFE600;
    color: #111111;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 800;
    font-size: 14px;
    padding: 6px 14px;
    border: 3px solid #111111;
    border-radius: 8px;
    box-shadow: 3px 3px 0px #111111;
    margin-bottom: 20px;
    width: fit-content;
    text-transform: uppercase;
  }
  .title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "54px" : "44px"};
    line-height: 1.15;
    color: #111111;
    margin-bottom: 14px;
    letter-spacing: -0.02em;
  }
  .desc {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    line-height: 1.45;
    color: #444444;
    font-weight: 600;
    margin-bottom: ${codeSnippet ? "24px" : "0"};
  }

  .retro-terminal {
    background: #111111;
    border: 3px solid #111111;
    border-radius: 14px;
    overflow: hidden;
  }
  .terminal-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #222222;
    padding: 8px 14px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    color: #888888;
    border-bottom: 2px solid #333333;
  }
  .terminal-code {
    padding: 16px 20px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px;
    color: #00E599;
    white-space: pre-wrap;
    word-break: break-word;
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
  .action-badge {
    background: #111111;
    color: #00E599;
    padding: 6px 16px;
    border: 2px solid #111111;
    border-radius: 999px;
  }
</style>
</head>
<body>
<div class="card">
  <div class="grid-pattern"></div>
  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <div class="tag">YENİ VERSİYON</div>
  </div>

  <div class="main-box">
    <div class="sticker">⚡ ${safe.badge}</div>
    <h1 class="title">${safe.title}</h1>
    <p class="desc">${safe.description}</p>
    ${snippetHtml}
  </div>

  <div class="footer">
    <span class="action-badge">YENİDEN KEŞFET →</span>
    <span>LİNK BİYOGRAFİDE ↗</span>
  </div>
</div>
</body>
</html>`;
}
