import { type PodcastCardProps, podcastCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderPodcastElectricOrange(props: PodcastCardProps): string {
  const { title, hostImageUrl, hostName, guestImageUrl, guestName, episodeTag, subtitle, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = podcastCardDimensions(format);

  const formattedTitle = applyRichFormatting(title, { isDark: true, highlightColor: "#FFFFFF", circleColor: "#FFE600", underlineColor: "#111111" });
  const safeHost = escapeHtml(hostName);
  const safeGuest = guestName ? escapeHtml(guestName) : "";
  const safeEpisode = episodeTag ? escapeHtml(episodeTag) : "ÖZEL BÖLÜM #34";
  const safeBrand = escapeHtml(brandName);

  const isLandscape = format === "landscape";
  const isStory = format === "story";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@700;800&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #FF4500; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: linear-gradient(135deg, #FF3D00 0%, #FF7A00 50%, #FFAA00 100%);
    display: flex;
    flex-direction: ${isStory ? "column" : "row"};
    align-items: center;
    justify-content: space-between;
    padding: ${isStory ? "260px 72px 420px" : isLandscape ? "80px 100px" : "70px 70px"};
    overflow: hidden;
  }

  /* Dynamic geometric arrow chevrons in background */
  .chevron-bg {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 60%;
    opacity: 0.12;
    background-image: repeating-linear-gradient(45deg, #FFFFFF 0px, #FFFFFF 20px, transparent 20px, transparent 60px);
    pointer-events: none;
  }

  .content-col {
    position: relative;
    z-index: 10;
    flex: 1;
    max-width: ${isStory ? "100%" : isLandscape ? "58%" : "54%"};
    display: flex;
    flex-direction: column;
    align-items: ${isStory ? "center" : "flex-start"};
    text-align: ${isStory ? "center" : "left"};
  }

  .badge-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    background: #111111;
    color: #FFFFFF;
    border-radius: 8px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
    margin-bottom: 24px;
  }

  .title {
    font-family: 'Outfit', sans-serif;
    font-weight: 900;
    font-size: ${isLandscape ? 72 : isStory ? 56 : 50}px;
    line-height: 1.12;
    color: #FFFFFF;
    text-transform: uppercase;
    letter-spacing: -0.03em;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    margin-bottom: 28px;
  }

  .speaker-box {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 22px;
    background: #FFFFFF;
    color: #111111;
    border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 18px;
    font-weight: 800;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    margin-bottom: 32px;
  }

  .cta-sub {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.95);
  }

  /* Right Visual Column */
  .visual-col {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .photo-frame {
    position: relative;
    width: ${isLandscape ? 380 : isStory ? 340 : 360}px;
    height: ${isLandscape ? 440 : isStory ? 380 : 400}px;
    border-radius: 28px;
    overflow: hidden;
    border: 4px solid #FFFFFF;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
    background: #111111;
  }
  .host-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .mic-badge {
    position: absolute;
    bottom: -15px;
    right: -15px;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #111111;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #FFFFFF;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <div class="chevron-bg"></div>

    <div class="content-col">
      <div class="badge-tag">${safeEpisode}</div>
      <h1 class="title">${formattedTitle}</h1>
      <div class="speaker-box">
        <span>${safeHost}${safeGuest ? ` &bull; ${safeGuest}` : ""}</span>
      </div>
      <div class="cta-sub">&#x25b6; SPOTIFY &bull; APPLE PODCASTS &bull; YOUTUBE</div>
    </div>

    <div class="visual-col">
      <div class="photo-frame">
        <img class="host-img" src="${hostImageUrl}" alt="${safeHost}" />
        <div class="mic-badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </div>
      </div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
