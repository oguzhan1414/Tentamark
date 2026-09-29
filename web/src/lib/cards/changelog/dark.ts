import { type ChangelogCardProps, changelogCardDimensions, escapeHtml, resolveAccent } from "./types";

export function renderChangelogDark(props: ChangelogCardProps): string {
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
    ? `<div class="terminal-box">
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <span class="terminal-title">changelog.ts</span>
        </div>
        <pre class="terminal-code"><code>${safe.snippet}</code></pre>
      </div>`
    : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0A0A0F; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #0A0A0F;
    padding: ${format === "story" ? "260px 80px 420px" : "64px 80px 56px"};
    overflow: hidden;
  }
  .glow {
    position: absolute;
    top: -15%;
    right: -10%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
    filter: blur(100px);
  }
  .glow-bottom {
    position: absolute;
    bottom: -15%;
    left: -10%;
    width: 55%;
    aspect-ratio: 1;
    background: radial-gradient(circle, #3B82F622 0%, transparent 70%);
    filter: blur(90px);
  }

  .header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 22px;
  }
  .brand-row { display: flex; align-items: center; gap: 14px; }
  .brand-logo { width: 42px; height: 42px; border-radius: 12px; object-fit: cover; background: #fff; padding: 4px; }
  .brand-fallback {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: rgba(255,255,255,0.1);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 19px;
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 22px;
    color: #FFFFFF;
  }
  .release-tag {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }

  .main {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 32px 0;
  }
  .badge-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${accent}22;
    border: 1px solid ${accent}66;
    color: ${accent};
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 700;
    font-size: 14px;
    padding: 8px 18px;
    border-radius: 999px;
    margin-bottom: 24px;
    width: fit-content;
    box-shadow: 0 0 24px ${accent}33;
  }
  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${accent};
    box-shadow: 0 0 10px ${accent};
  }

  .title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "56px" : "48px"};
    line-height: 1.18;
    color: #F8FAFC;
    letter-spacing: -0.02em;
    margin-bottom: 18px;
  }
  .description {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 20px;
    line-height: 1.55;
    color: #94A3B8;
    margin-bottom: ${codeSnippet ? "30px" : "0"};
    max-width: 860px;
  }

  .terminal-box {
    background: #030712;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
  }
  .terminal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    background: rgba(255, 255, 255, 0.04);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .terminal-dots { display: flex; gap: 8px; }
  .dot { width: 11px; height: 11px; border-radius: 50%; }
  .dot.red { background: #EF4444; }
  .dot.yellow { background: #F59E0B; }
  .dot.green { background: #10B981; }
  .terminal-title {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #64748B;
  }
  .terminal-code {
    padding: 22px 24px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 15px;
    line-height: 1.6;
    color: #E2E8F0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .footer {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 20px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: #64748B;
  }
  .cta-badge {
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    font-weight: 700;
    padding: 6px 16px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
</style>
</head>
<body>
<div class="card">
  <div class="glow"></div>
  <div class="glow-bottom"></div>

  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="release-tag">GÜNCELLEME DUYURUSU</span>
  </div>

  <div class="main">
    <div class="badge-pill">
      <span class="badge-dot"></span>
      <span>${safe.badge}</span>
    </div>
    <h1 class="title">${safe.title}</h1>
    <p class="description">${safe.description}</p>
    ${snippetHtml}
  </div>

  <div class="footer">
    <span class="cta-badge">Hemen Dene 🚀</span>
    <span>Sürüm Notlarını Oku ↗</span>
  </div>
</div>
</body>
</html>`;
}
