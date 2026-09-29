import { type PodcastCardProps, podcastCardDimensions, escapeHtml } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { fontStackFor, googleFontsHrefFor } from "../cardTokenStyles";

// The purple/pink/cyan neon palette is this variant's actual identity (its
// name IS the color) — only fonts are brand-driven, same reasoning as
// chat/deal/newsflash's fixed palettes.
export function renderPodcastNeonPurple(props: PodcastCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { title, hostImageUrl, hostName, guestImageUrl, guestName, episodeTag, subtitle, brandName, logoUrl, format } = props;
  const headingFont = fontStackFor(tokens.typography.headingFamily);
  const bodyFont = fontStackFor(tokens.typography.bodyFamily);
  const { width, height } = podcastCardDimensions(format);

  const formattedTitle = applyRichFormatting(title, { isDark: true, highlightColor: "#F43F5E", circleColor: "#00F0FF", underlineColor: "#A855F7" });
  const safeHost = escapeHtml(hostName);
  const safeGuest = guestName ? escapeHtml(guestName) : "";
  const safeEpisode = episodeTag ? escapeHtml(episodeTag) : "EPISODE #01";
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : "THE BUSINESS & CREATOR SHOW";
  const safeBrand = escapeHtml(brandName);

  const isLandscape = format === "landscape";
  const isStory = format === "story";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens, ["Space Grotesk:wght@700"])}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0B0814; overflow: hidden; }
  .canvas {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    background: #0B0814;
    background-image:
      radial-gradient(circle at 85% 30%, rgba(217, 70, 239, 0.45) 0%, transparent 50%),
      radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.35) 0%, transparent 55%),
      radial-gradient(circle at 50% 10%, rgba(6, 182, 212, 0.25) 0%, transparent 45%);
    display: flex;
    flex-direction: ${isStory ? "column" : "row"};
    align-items: center;
    justify-content: ${isStory ? "space-between" : "space-between"};
    padding: ${isStory ? "260px 72px 420px" : isLandscape ? "80px 100px" : "70px 70px"};
    overflow: hidden;
  }

  /* Equalizer / Glow Lines in background */
  .sound-wave-bg {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 180px;
    opacity: 0.15;
    background-image: repeating-linear-gradient(90deg, #A855F7 0px, #A855F7 6px, transparent 6px, transparent 16px);
    mask-image: linear-gradient(to top, black, transparent);
    -webkit-mask-image: linear-gradient(to top, black, transparent);
    pointer-events: none;
  }

  /* Left/Text Column */
  .content-col {
    position: relative;
    z-index: 10;
    flex: 1;
    max-width: ${isStory ? "100%" : isLandscape ? "55%" : "54%"};
    display: flex;
    flex-direction: column;
    align-items: ${isStory ? "center" : "flex-start"};
    text-align: ${isStory ? "center" : "left"};
  }

  .episode-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    border-radius: 999px;
    background: linear-gradient(135deg, #A855F7, #EC4899);
    color: #FFFFFF;
    font-family: 'Space Grotesk', sans-serif;
    font-size: ${isLandscape ? 15 : 14}px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    box-shadow: 0 0 20px rgba(217, 70, 239, 0.45);
    margin-bottom: 24px;
  }
  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #FFFFFF;
    box-shadow: 0 0 8px #FFFFFF;
  }

  .title {
    font-family: ${headingFont};
    font-weight: 900;
    font-size: ${isLandscape ? 68 : isStory ? 54 : 48}px;
    line-height: 1.15;
    color: #FFFFFF;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 30px rgba(0, 0, 0, 0.6);
    margin-bottom: 24px;
  }

  .host-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 18px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    font-family: ${bodyFont};
    font-size: ${isLandscape ? 18 : 16}px;
    font-weight: 700;
    color: #E2E8F0;
    margin-bottom: 32px;
  }
  .host-pill strong {
    color: #38BDF8;
  }

  /* Platform Badges */
  .platforms {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .platform-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.12);
    font-family: ${bodyFont};
    font-size: 13px;
    font-weight: 700;
    color: #FFFFFF;
  }
  .spotify-dot { width: 10px; height: 10px; border-radius: 50%; background: #1ED760; }
  .apple-dot { width: 10px; height: 10px; border-radius: 50%; background: #FA586A; }

  /* Right/Visual Column (Photo of Host & Guest) */
  .visual-col {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: ${isStory ? "32px" : "0"};
  }

  .photo-frame {
    position: relative;
    width: ${isLandscape ? 380 : isStory ? 340 : 360}px;
    height: ${isLandscape ? 440 : isStory ? 380 : 400}px;
    border-radius: 36px;
    overflow: hidden;
    border: 3px solid rgba(217, 70, 239, 0.5);
    box-shadow: 
      0 0 40px rgba(217, 70, 239, 0.3),
      0 24px 60px rgba(0, 0, 0, 0.8);
    background: #181424;
  }
  .host-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .guest-frame {
    width: ${isLandscape ? 260 : 220}px;
    height: ${isLandscape ? 320 : 260}px;
    border-radius: 28px;
    border: 2px solid rgba(6, 182, 212, 0.5);
    box-shadow: 0 0 30px rgba(6, 182, 212, 0.25);
  }

  /* Mic Icon / Badge */
  .mic-badge {
    position: absolute;
    bottom: -15px;
    right: -15px;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D946EF, #8B5CF6);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(217, 70, 239, 0.6);
    border: 3px solid #0B0814;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="canvas">
    <div class="sound-wave-bg"></div>

    <div class="content-col">
      <div class="episode-badge">
        <span class="live-dot"></span>
        <span>${safeEpisode}</span>
      </div>
      <h1 class="title">${formattedTitle}</h1>
      <div class="host-pill">
        <span>Sunucu: <strong>${safeHost}</strong>${safeGuest ? ` &bull; Konuk: <strong>${safeGuest}</strong>` : ""}</span>
      </div>
      <div class="platforms">
        <div class="platform-tag"><span class="spotify-dot"></span> Spotify</div>
        <div class="platform-tag"><span class="apple-dot"></span> Apple Podcasts</div>
        <div class="platform-tag">&#x25b6; YouTube</div>
      </div>
    </div>

    <div class="visual-col">
      <div class="photo-frame">
        <img class="host-img" src="${hostImageUrl}" alt="${safeHost}" />
        <div class="mic-badge">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        </div>
      </div>
      ${
        guestImageUrl
          ? `<div class="photo-frame guest-frame">
              <img class="host-img" src="${guestImageUrl}" alt="${safeGuest}" />
            </div>`
          : ""
      }
    </div>

    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
