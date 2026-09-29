import { type ChatCardProps, chatCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderChatDark(props: ChatCardProps): string {
  const { senderName, incomingMessage, outgoingMessage, timeText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = chatCardDimensions(format);

  const safe = {
    sender: escapeHtml(senderName),
    incoming: applySmartHighlights(incomingMessage),
    outgoing: applySmartHighlights(outgoingMessage),
    time: timeText ? escapeHtml(timeText) : "14:32 • Gönderildi",
    brand: escapeHtml(brandName),
  };

  const senderInitial = senderName ? senderName.charAt(0).toUpperCase() : "M";

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
    justify-content: center;
    align-items: center;
    background: #0A0A0F;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 72px"};
  }
  .glow {
    position: absolute;
    top: 20%;
    right: -10%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent}33 0%, transparent 70%);
    filter: blur(110px);
  }
  ${SMART_HIGHLIGHT_CSS}

  .dm-window {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: ${format === "story" ? "920px" : "860px"};
    background: rgba(22, 22, 28, 0.95);
    border-radius: 36px;
    overflow: hidden;
    box-shadow: 0 30px 70px -15px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(20px);
  }

  .dm-header {
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .contact-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #FFFFFF;
  }
  .direct-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #64748B;
  }

  .chat-body {
    padding: 40px 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .timestamp {
    text-align: center;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #64748B;
    margin-bottom: 8px;
  }

  .bubble {
    padding: 20px 26px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: ${format === "story" ? "24px" : "21px"};
    line-height: 1.45;
    border-radius: 24px;
    max-width: 82%;
    word-break: break-word;
  }
  .bubble.incoming {
    align-self: flex-start;
    background: rgba(255, 255, 255, 0.08);
    color: #E2E8F0;
    border-bottom-left-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .bubble.outgoing {
    align-self: flex-end;
    background: linear-gradient(135deg, ${accent} 0%, #4F46E5 100%);
    color: #FFFFFF;
    border-bottom-right-radius: 4px;
    box-shadow: 0 8px 24px ${accent}44;
  }

  .dm-footer {
    background: rgba(255, 255, 255, 0.03);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding: 18px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    color: #94A3B8;
  }
  .brand-badge {
    color: #FFFFFF;
    font-weight: 700;
  }
</style>
</head>
<body>
<div class="card">
  <div class="glow"></div>
  ${FILM_GRAIN_OVERLAY}

  <div class="dm-window">
    <div class="dm-header">
      <div class="contact-info">
        <div class="avatar">${senderInitial}</div>
        <div>
          <div class="contact-name">${safe.sender}</div>
          <div class="direct-label">Doğrudan Mesaj (DM)</div>
        </div>
      </div>
      <div style="color: #64748B; font-size: 20px;">🔒 Uçtan Uca Şifreli</div>
    </div>

    <div class="chat-body">
      <div class="timestamp">${safe.time}</div>

      <div class="bubble incoming">${safe.incoming}</div>
      <div class="bubble outgoing">${safe.outgoing}</div>
    </div>

    <div class="dm-footer">
      <span class="brand-badge">@${safe.brand}</span>
      <span>Müşteri Memnuniyeti ⚡</span>
    </div>
  </div>
</div>
</body>
</html>`;
}
