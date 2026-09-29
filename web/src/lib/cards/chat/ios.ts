import { type ChatCardProps, chatCardDimensions, escapeHtml } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";
import { DEFAULT_DESIGN_TOKENS, type BrandDesignTokens } from "@/lib/brand/designTokens";
import { fontStackFor, googleFontsHrefFor } from "../cardTokenStyles";

// The iMessage blue (#007AFF) and overall chrome are the whole point of
// this variant — it's meant to read as a real iPhone screenshot, so only
// the font is brand-driven here; the interface color scheme stays fixed,
// same reasoning as podcast/deal/newsflash's fixed palettes.
export function renderChatIos(props: ChatCardProps, tokens: BrandDesignTokens = DEFAULT_DESIGN_TOKENS): string {
  const { senderName, incomingMessage, outgoingMessage, timeText, brandName, logoUrl, format } = props;
  const bodyFont = fontStackFor(tokens.typography.bodyFamily);
  const { width, height } = chatCardDimensions(format);

  const safe = {
    sender: escapeHtml(senderName),
    incoming: applySmartHighlights(incomingMessage),
    outgoing: applySmartHighlights(outgoingMessage),
    time: timeText ? escapeHtml(timeText) : "14:32 • İletildi",
    brand: escapeHtml(brandName),
  };

  const senderInitial = senderName ? senderName.charAt(0).toUpperCase() : "M";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${googleFontsHrefFor(tokens)}" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #E5E5EA; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #E5E5EA;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 72px"};
  }
  ${SMART_HIGHLIGHT_CSS}

  .phone-window {
    width: 100%;
    max-width: ${format === "story" ? "920px" : "860px"};
    background: #FFFFFF;
    border-radius: 36px;
    overflow: hidden;
    box-shadow: 0 25px 60px -15px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0,0,0,0.06);
  }

  .imessage-header {
    background: #F8F8FA;
    border-bottom: 1px solid #E5E5EA;
    padding: 20px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .contact-info {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .contact-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8E8E93, #636366);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 20px;
  }
  .contact-name {
    font-family: ${bodyFont};
    font-weight: 700;
    font-size: 20px;
    color: #000000;
  }
  .imessage-label {
    font-family: ${bodyFont};
    font-size: 13px;
    color: #8E8E93;
    font-weight: 600;
  }

  .chat-area {
    padding: 40px 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: #FFFFFF;
  }
  .timestamp {
    text-align: center;
    font-family: ${bodyFont};
    font-size: 13px;
    color: #8E8E93;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .bubble-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 82%;
  }
  .bubble-wrapper.incoming {
    align-self: flex-start;
  }
  .bubble-wrapper.outgoing {
    align-self: flex-end;
    align-items: flex-end;
  }

  .bubble {
    padding: 20px 24px;
    font-family: ${bodyFont};
    font-size: ${format === "story" ? "24px" : "21px"};
    line-height: 1.42;
    border-radius: 26px;
    word-break: break-word;
  }
  .bubble.incoming {
    background: #E9E9EB;
    color: #000000;
    border-bottom-left-radius: 6px;
  }
  .bubble.outgoing {
    background: #007AFF;
    color: #FFFFFF;
    border-bottom-right-radius: 6px;
  }

  .delivery-status {
    font-family: ${bodyFont};
    font-size: 12px;
    color: #8E8E93;
    font-weight: 600;
    margin-top: 6px;
    margin-right: 4px;
  }

  .chat-footer {
    background: #F8F8FA;
    border-top: 1px solid #E5E5EA;
    padding: 16px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: ${bodyFont};
    font-size: 13px;
    color: #8E8E93;
  }
  .brand-tag {
    font-weight: 700;
    color: #000000;
  }
</style>
</head>
<body>
<div class="card">
  ${FILM_GRAIN_OVERLAY}

  <div class="phone-window">
    <div class="imessage-header">
      <div class="contact-info">
        <div class="contact-avatar">${senderInitial}</div>
        <div>
          <div class="contact-name">${safe.sender}</div>
          <div class="imessage-label">iMessage</div>
        </div>
      </div>
      <div style="font-size: 24px; color: #007AFF;">ⓘ</div>
    </div>

    <div class="chat-area">
      <div class="timestamp">${safe.time.split("•")[0].trim()}</div>

      <div class="bubble-wrapper incoming">
        <div class="bubble incoming">${safe.incoming}</div>
      </div>

      <div class="bubble-wrapper outgoing">
        <div class="bubble outgoing">${safe.outgoing}</div>
        <div class="delivery-status">İletildi ✓</div>
      </div>
    </div>

    <div class="chat-footer">
      <span class="brand-tag">@${safe.brand}</span>
      <span>Gerçek Müşteri Deneyimi 💬</span>
    </div>
  </div>
</div>
</body>
</html>`;
}
