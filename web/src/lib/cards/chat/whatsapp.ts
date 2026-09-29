import { type ChatCardProps, chatCardDimensions, escapeHtml, resolveAccent } from "./types";
import { applySmartHighlights, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

export function renderChatWhatsapp(props: ChatCardProps): string {
  const { senderName, incomingMessage, outgoingMessage, timeText, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = chatCardDimensions(format);

  const safe = {
    sender: escapeHtml(senderName),
    incoming: applySmartHighlights(incomingMessage),
    outgoing: applySmartHighlights(outgoingMessage),
    time: timeText ? escapeHtml(timeText) : "14:32",
    brand: escapeHtml(brandName),
  };

  const senderInitial = senderName ? senderName.charAt(0).toUpperCase() : "M";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #EFEAE2; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #EFEAE2;
    padding: ${format === "story" ? "260px 72px 420px" : "64px 72px"};
  }
  ${SMART_HIGHLIGHT_CSS}

  .whatsapp-window {
    width: 100%;
    max-width: ${format === "story" ? "920px" : "860px"};
    background: #EFEAE2;
    border-radius: 32px;
    overflow: hidden;
    box-shadow: 0 25px 60px -15px rgba(0,0,0,0.18);
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0,0,0,0.08);
  }

  .wa-header {
    background: #075E54;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #FFFFFF;
  }
  .contact-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .wa-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #128C7E;
    border: 2px solid #25D366;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 20px;
  }
  .wa-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 20px;
    color: #FFFFFF;
  }
  .wa-status {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
  }

  .wa-chat-body {
    padding: 40px 28px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    background-color: #EFEAE2;
    background-image: radial-gradient(#0000000a 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .bubble {
    position: relative;
    padding: 18px 24px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: ${format === "story" ? "24px" : "21px"};
    line-height: 1.45;
    border-radius: 18px;
    max-width: 82%;
    box-shadow: 0 2px 5px rgba(0,0,0,0.06);
  }
  .bubble.incoming {
    align-self: flex-start;
    background: #FFFFFF;
    color: #111B21;
    border-top-left-radius: 4px;
  }
  .bubble.outgoing {
    align-self: flex-end;
    background: #D9FDD3;
    color: #111B21;
    border-top-right-radius: 4px;
  }
  .bubble-time {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    font-size: 12px;
    color: #667781;
    margin-top: 6px;
  }
  .double-check {
    color: #53BDEB;
    font-weight: 800;
  }

  .wa-footer {
    background: #F0F2F5;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px;
    color: #54656F;
    border-top: 1px solid #E9EDEF;
  }
  .brand-badge {
    font-weight: 700;
    color: #075E54;
  }
</style>
</head>
<body>
<div class="card">
  ${FILM_GRAIN_OVERLAY}

  <div class="whatsapp-window">
    <div class="wa-header">
      <div class="contact-row">
        <div class="wa-avatar">${senderInitial}</div>
        <div>
          <div class="wa-name">${safe.sender}</div>
          <div class="wa-status">çevrimiçi</div>
        </div>
      </div>
      <div style="font-size: 20px;">📞 &nbsp; 📹</div>
    </div>

    <div class="wa-chat-body">
      <div class="bubble incoming">
        ${safe.incoming}
        <div class="bubble-time">${safe.time}</div>
      </div>

      <div class="bubble outgoing">
        ${safe.outgoing}
        <div class="bubble-time">${safe.time} <span class="double-check">✓✓</span></div>
      </div>
    </div>

    <div class="wa-footer">
      <span class="brand-badge">WhatsApp Doğrulanmış İşletme</span>
      <span>@${safe.brand}</span>
    </div>
  </div>
</div>
</body>
</html>`;
}
