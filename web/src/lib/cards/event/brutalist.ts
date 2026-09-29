import { type EventCardProps, eventCardDimensions, escapeHtml, resolveAccent } from "./types";

export function renderEventBrutalist(props: EventCardProps): string {
  const { eventTitle, dateText, speaker1Name, speaker1Role, speaker1AvatarUrl, speaker2Name, speaker2Role, speaker2AvatarUrl, badgeText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = eventCardDimensions(format);

  const safe = {
    title: escapeHtml(eventTitle),
    date: escapeHtml(dateText),
    badge: badgeText ? escapeHtml(badgeText) : "CANLI YAYIN",
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

  let speakersHtml = `<div class="speaker-block">
    ${s1Avatar}
    <div>
      <div class="speaker-name">${safe.s1Name}</div>
      <div class="speaker-role">${safe.s1Role}</div>
    </div>
  </div>`;

  if (speaker2Name) {
    const s2Init = speaker2Name.charAt(0).toUpperCase();
    const s2Avatar = speaker2AvatarUrl
      ? `<img src="${escapeHtml(speaker2AvatarUrl)}" alt="${safe.s2Name}" class="speaker-avatar" />`
      : `<div class="speaker-fallback two">${s2Init}</div>`;

    speakersHtml = `<div class="speakers-row">
      <div class="speaker-block">
        ${s1Avatar}
        <div>
          <div class="speaker-name">${safe.s1Name}</div>
          <div class="speaker-role">${safe.s1Role}</div>
        </div>
      </div>
      <div class="speaker-separator">X</div>
      <div class="speaker-block">
        ${s2Avatar}
        <div>
          <div class="speaker-name">${safe.s2Name}</div>
          <div class="speaker-role">${safe.s2Role}</div>
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
    background: #FF5A5F;
    color: #FFFFFF;
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
    padding: ${format === "story" ? "44px 40px" : "36px 40px"};
    display: flex;
    flex-direction: column;
    margin: 28px 0;
  }
  .sticker-date {
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
  }
  .title {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: ${format === "story" ? "52px" : "42px"};
    line-height: 1.15;
    color: #111111;
    margin-bottom: 32px;
    letter-spacing: -0.02em;
  }

  .speakers-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: ${format === "story" ? "wrap" : "nowrap"};
  }
  .speaker-separator {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 24px;
    color: #111111;
  }
  .speaker-block {
    display: flex;
    align-items: center;
    gap: 14px;
    background: #F8F7F2;
    border: 3px solid #111111;
    border-radius: 14px;
    padding: 12px 18px;
    box-shadow: 4px 4px 0px #111111;
  }
  .speaker-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #111111;
  }
  .speaker-fallback {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #00E599;
    color: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 20px;
    border: 2px solid #111111;
  }
  .speaker-fallback.two {
    background: #FFE600;
  }
  .speaker-name {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800;
    font-size: 17px;
    color: #111111;
  }
  .speaker-role {
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600;
    font-size: 13px;
    color: #666666;
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
  .ticket-btn {
    background: #111111;
    color: #FFE600;
    padding: 8px 20px;
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
    <div class="tag">🔴 ${safe.badge}</div>
  </div>

  <div class="main-box">
    <div class="sticker-date">🗓️ ${safe.date}</div>
    <h1 class="title">${safe.title}</h1>
    ${speakersHtml}
  </div>

  <div class="footer">
    <span class="ticket-btn">HEMEN KAYIT OL ➔</span>
    <span>YERİNİ AYIRT 🎟️</span>
  </div>
</div>
</body>
</html>`;
}
