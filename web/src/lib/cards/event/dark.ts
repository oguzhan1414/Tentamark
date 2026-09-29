import { type EventCardProps, eventCardDimensions, escapeHtml, resolveAccent } from "./types";

export function renderEventDark(props: EventCardProps): string {
  const { eventTitle, dateText, speaker1Name, speaker1Role, speaker1AvatarUrl, speaker2Name, speaker2Role, speaker2AvatarUrl, badgeText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = eventCardDimensions(format);

  const safe = {
    title: escapeHtml(eventTitle),
    date: escapeHtml(dateText),
    badge: badgeText ? escapeHtml(badgeText) : "CANLI YAYIN 🔴",
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
    justify-content: space-between;
    background: #0A0A0F;
    padding: ${format === "story" ? "260px 80px 420px" : "64px 80px 56px"};
    overflow: hidden;
  }
  .glow {
    position: absolute;
    top: -10%;
    left: -10%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
    filter: blur(100px);
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
  .brand-name { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: 22px; color: #FFFFFF; }
  .live-badge {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    background: #EF444422;
    border: 1px solid #EF4444;
    color: #F87171;
    padding: 6px 14px;
    border-radius: 999px;
    letter-spacing: 0.06em;
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
  .date-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 8px 18px;
    border-radius: 999px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: #F1F5F9;
    margin-bottom: 24px;
    width: fit-content;
  }
  .date-icon { font-size: 16px; }

  .title {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "56px" : "48px"};
    line-height: 1.18;
    color: #F8FAFC;
    letter-spacing: -0.02em;
    margin-bottom: 36px;
    max-width: 900px;
  }

  .speakers-row {
    display: flex;
    align-items: center;
    gap: ${format === "story" ? "16px" : "24px"};
    flex-wrap: ${format === "story" ? "wrap" : "nowrap"};
  }
  .speaker-separator {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 24px;
    color: rgba(255, 255, 255, 0.3);
  }
  .speaker-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 16px 22px;
  }
  .speaker-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid ${accent};
  }
  .speaker-fallback {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${accent};
    color: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 24px;
  }
  .speaker-fallback.two {
    background: #3B82F6;
    color: #fff;
  }
  .speaker-meta { display: flex; flex-direction: column; gap: 4px; }
  .speaker-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: #FFFFFF;
  }
  .speaker-role {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500;
    font-size: 14px;
    color: #94A3B8;
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
  .join-btn {
    background: ${accent};
    color: #0A0A0F;
    font-weight: 800;
    padding: 8px 22px;
    border-radius: 999px;
    box-shadow: 0 0 20px ${accent}44;
  }
</style>
</head>
<body>
<div class="card">
  <div class="glow"></div>

  <div class="header">
    <div class="brand-row">
      ${logoHtml}
      <span class="brand-name">${safe.brand}</span>
    </div>
    <span class="live-badge">${safe.badge}</span>
  </div>

  <div class="main">
    <div class="date-pill">
      <span class="date-icon">🗓️</span>
      <span>${safe.date}</span>
    </div>
    <h1 class="title">${safe.title}</h1>
    ${speakersHtml}
  </div>

  <div class="footer">
    <span class="join-btn">Kayıt Ol ➔</span>
    <span>Ücretsiz Katılım 🎟️</span>
  </div>
</div>
</body>
</html>`;
}
