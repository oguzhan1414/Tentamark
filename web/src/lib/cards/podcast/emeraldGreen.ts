import { type PodcastCardProps, podcastCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderPodcastEmeraldGreen(props: PodcastCardProps): string {
  const { title, hostImageUrl, hostName, guestImageUrl, guestName, episodeTag, subtitle, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = podcastCardDimensions(format);

  const formattedTitle = applyRichFormatting(title, { isDark: true, highlightColor: "#FDE047", circleColor: "#FFFFFF", underlineColor: "#10B981" });
  const safeHost = escapeHtml(hostName);
  const safeGuest = guestName ? escapeHtml(guestName) : "";
  const safeEpisode = episodeTag ? escapeHtml(episodeTag) : "BÖLÜM #18";
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
  html, body { width: ${width}px; height: ${height}px; background: #064E3B; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: linear-gradient(135deg, #022C22 0%, #065F46 45%, #059669 80%, #84CC16 100%);
    display: flex;
    flex-direction: ${isStory ? "column" : "row"};
    align-items: center;
    justify-content: space-between;
    padding: ${isStory ? "260px 72px 420px" : isLandscape ? "80px 100px" : "70px 70px"};
    overflow: hidden;
  }

  /* Growth trend lines in background */
  .growth-curve {
    position: absolute;
    bottom: -10%;
    left: 0;
    right: 0;
    height: 300px;
    opacity: 0.15;
    background: radial-gradient(ellipse at 50% 100%, #84CC16 0%, transparent 70%);
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
    background: #84CC16;
    color: #064E3B;
    border-radius: 999px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    box-shadow: 0 4px 16px rgba(132, 204, 22, 0.4);
    margin-bottom: 24px;
  }

  .title {
    font-family: 'Outfit', sans-serif;
    font-weight: 900;
    font-size: ${isLandscape ? 70 : isStory ? 54 : 48}px;
    line-height: 1.15;
    color: #FFFFFF;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    margin-bottom: 24px;
  }

  .host-row {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #ECFDF5;
    margin-bottom: 28px;
  }

  .sales-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(132, 204, 22, 0.15);
    border: 1px solid #84CC16;
    border-radius: 8px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #84CC16;
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
    border-radius: 36px;
    overflow: hidden;
    border: 4px solid #84CC16;
    box-shadow: 0 0 50px rgba(132, 204, 22, 0.3), 0 24px 60px rgba(0, 0, 0, 0.6);
    background: #064E3B;
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
    <div class="growth-curve"></div>

    <div class="content-col">
      <div class="badge-tag">&#x25cf; ${safeEpisode}</div>
      <h1 class="title">${formattedTitle}</h1>
      <div class="host-row">
        <span>Konuk: <strong>${safeHost}</strong>${safeGuest ? ` &bull; ${safeGuest}` : ""}</span>
      </div>
      <div class="sales-pill">&#x2197; 100K+ ORGANİK DİNLENME</div>
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
