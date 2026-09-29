import { type TestimonialCardProps, testimonialCardDimensions, escapeHtml, resolveAccent, fontSizeForLength } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

function starRow(rating: number, accent: string): string {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, i) => {
    const color = i < filled ? accent : "#3A3644";
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="${color}"><path d="M12 2l2.9 6.6L22 9.3l-5 4.9L18.2 22 12 18.3 5.8 22 7 14.2l-5-4.9 7.1-.7z"/></svg>`;
  }).join("");
}

// The customer, not the brand, is the speaker here — identity block (avatar
// + name + role) leads, stars come next if given, brand only shows up
// small at the bottom as "who this is about". Quote Card is the brand's own
// voice; this is deliberately the opposite hierarchy.
export function renderTestimonialSpotlight(props: TestimonialCardProps): string {
  const { testimonialText, customerName, customerRole, customerAvatarUrl, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = testimonialCardDimensions(format);
  const fontSize = fontSizeForLength(testimonialText.length, format);

  const safe = {
    text: applyRichFormatting(testimonialText, { isDark: true }),
    name: escapeHtml(customerName),
    role: customerRole ? escapeHtml(customerRole) : "",
    brand: escapeHtml(brandName),
  };

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=IBM+Plex+Sans:wght@500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #0B0A0F; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #0B0A0F;
    padding: 0 80px;
  }
  .glow {
    position: absolute;
    bottom: -20%;
    right: -14%;
    width: 60%;
    aspect-ratio: 1;
    background: radial-gradient(circle, ${accent} 0%, ${accent}00 70%);
    filter: blur(100px);
    opacity: 0.4;
  }
  .identity {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 18px;
    margin-bottom: 20px;
  }
  .avatar {
    width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
    border: 2px solid ${accent}80;
  }
  .avatar-fallback {
    width: 72px; height: 72px; border-radius: 50%; background: ${accent};
    display: flex; align-items: center; justify-content: center;
    font-family: "Baloo 2", sans-serif; font-weight: 700; font-size: 28px; color: #ffffff;
  }
  .identity-text { display: flex; flex-direction: column; }
  .customer-name { font-family: "IBM Plex Sans", sans-serif; font-weight: 700; font-size: 24px; color: #F7F5FB; }
  .customer-role { font-family: "IBM Plex Sans", sans-serif; font-weight: 500; font-size: 17px; color: rgba(247,245,251,0.5); margin-top: 2px; }
  .stars { position: relative; z-index: 1; display: flex; gap: 4px; margin-bottom: 28px; }
  .testimonial-text {
    position: relative;
    z-index: 1;
    max-width: 100%;
    font-family: "Baloo 2", sans-serif;
    font-weight: 700;
    font-size: ${fontSize}px;
    line-height: 1.35;
    color: #F7F5FB;
    text-align: center;
    letter-spacing: -0.01em;
  }
  .brand-row {
    position: absolute;
    bottom: 6%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-logo { width: 28px; height: 28px; border-radius: 8px; object-fit: contain; background: #fff; padding: 4px; }
  .brand-name { font-family: "IBM Plex Sans", sans-serif; font-weight: 600; font-size: 16px; letter-spacing: 0.02em; color: rgba(255,255,255,0.55); }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
  <div class="card">
    <div class="glow"></div>
    <div class="identity">
      ${customerAvatarUrl
        ? `<img class="avatar" src="${escapeHtml(customerAvatarUrl)}" alt="" />`
        : `<div class="avatar-fallback">${safe.name.charAt(0).toUpperCase()}</div>`}
      <div class="identity-text">
        <span class="customer-name">${safe.name}</span>
        ${safe.role ? `<span class="customer-role">${safe.role}</span>` : ""}
      </div>
    </div>
    ${props.rating ? `<div class="stars">${starRow(props.rating, accent)}</div>` : ""}
    <p class="testimonial-text">&ldquo;${safe.text}&rdquo;</p>
    <div class="brand-row">
      ${logoUrl ? `<img class="brand-logo" src="${escapeHtml(logoUrl)}" alt="" />` : ""}
      <span class="brand-name">${safe.brand} müşterisi</span>
    </div>
    ${FILM_GRAIN_OVERLAY}
  </div>
</body>
</html>`;
}
