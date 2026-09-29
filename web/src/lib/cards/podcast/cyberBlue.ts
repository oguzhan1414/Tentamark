import { type PodcastCardProps, podcastCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderPodcastCyberBlue(props: PodcastCardProps): string {
  const { title, hostImageUrl, hostName, guestImageUrl, guestName, episodeTag, subtitle, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = podcastCardDimensions(format);

  const formattedTitle = applyRichFormatting(title, { isDark: true, highlightColor: "#38BDF8", circleColor: "#F43F5E", underlineColor: "#06B6D4" });
  const safeHost = escapeHtml(hostName);
  const safeGuest = guestName ? escapeHtml(guestName) : "";
  const safeEpisode = episodeTag ? escapeHtml(episodeTag) : "TECH & AI #10";
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
  html, body { width: ${width}px; height: ${height}px; background: #0A0F1D; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: radial-gradient(circle at 80% 20%, #1D4ED8 0%, #0F172A 70%);
    display: flex;
    flex-direction: ${isStory ? "column" : "row"};
    align-items: center;
    justify-content: space-between;
    padding: ${isStory ? "260px 72px 420px" : isLandscape ? "80px 100px" : "70px 70px"};
    overflow: hidden;
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
    padding: 8px 18px;
    background: #0284C7;
    color: #FFFFFF;
    border-radius: 999px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    box-shadow: 0 0 20px rgba(2, 132, 199, 0.5);
    margin-bottom: 24px;
  }

  .title {
    font-family: 'Outfit', sans-serif;
    font-weight: 900;
    font-size: ${isLandscape ? 68 : isStory ? 54 : 48}px;
    line-height: 1.15;
    color: #FFFFFF;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    margin-bottom: 24px;
  }

  .host-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(56, 189, 248, 0.3);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #F0F9FF;
    margin-bottom: 28px;
  }

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
    border-radius: 32px;
    overflow: hidden;
    border: 4px solid #38BDF8;
    box-shadow: 0 0 45px rgba(56, 189, 248, 0.35), 0 24px 60px rgba(0, 0, 0, 0.7);
    background: #0F172A;
  }
  .host-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <div class="content-col">
      <div class="badge-tag">&#x25cf; ${safeEpisode}</div>
      <h1 class="title">${formattedTitle}</h1>
      <div class="host-pill">
        <span>Sunucu: <strong>${safeHost}</strong>${safeGuest ? ` &bull; ${safeGuest}` : ""}</span>
      </div>
    </div>

    <div class="visual-col">
      <div class="photo-frame">
        <img class="host-img" src="${hostImageUrl}" alt="${safeHost}" />
      </div>
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
