import { type TestimonialCardProps, testimonialCardDimensions, escapeHtml, resolveAccent, fontSizeForLength } from "./types";
import { applyRichFormatting, SMART_HIGHLIGHT_CSS, FILM_GRAIN_OVERLAY } from "../cardEffects";

function starRow(rating: number, accent: string): string {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return Array.from({ length: 5 }, (_, i) => {
    const color = i < filled ? "#F59E0B" : "#E2E8F0";
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="${color}"><path d="M12 2l2.9 6.6L22 9.3l-5 4.9L18.2 22 12 18.3 5.8 22 7 14.2l-5-4.9 7.1-.7z"/></svg>`;
  }).join("");
}

export function renderTestimonialPastel(props: TestimonialCardProps): string {
  const { testimonialText, customerName, customerRole, customerAvatarUrl, brandName, logoUrl, format } = props;
  const accent = resolveAccent(props.accentColor);
  const { width, height } = testimonialCardDimensions(format);
  const fontSize = Math.round(fontSizeForLength(testimonialText.length, format) * 1.05);

  const safe = {
    text: applyRichFormatting(testimonialText, { isDark: false, circleColor: accent, underlineColor: accent }),
    name: escapeHtml(customerName),
    role: customerRole ? escapeHtml(customerRole) : "",
    brand: escapeHtml(brandName),
  };

  const initial = customerName ? customerName.charAt(0).toUpperCase() : "M";
  const avatarHtml = customerAvatarUrl
    ? `<img src="${escapeHtml(customerAvatarUrl)}" alt="${safe.name}" class="avatar" />`
    : `<div class="avatar-fallback">${initial}</div>`;

  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="${safe.brand}" class="brand-logo" />`
    : `<div class="brand-logo-fallback">${brandName ? brandName.charAt(0).toUpperCase() : "T"}</div>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${width}px; height: ${height}px; background: #FFF5F5; overflow: hidden; }
  .card {
    position: relative;
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #FFF1F2 0%, #F5F3FF 50%, #EFF6FF 100%);
    padding: ${format === "story" ? "0 54px" : "0 64px"};
    overflow: hidden;
  }
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
  }
  .orb.one {
    top: -10%;
    left: -10%;
    width: 50%;
    aspect-ratio: 1;
    background: #FDE2E4;
  }
  .orb.two {
    bottom: -15%;
    right: -10%;
    width: 60%;
    aspect-ratio: 1;
    background: #E0E7FF;
  }

  .testimonial-bubble {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: ${format === "story" ? "880px" : "840px"};
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 2px solid rgba(255, 255, 255, 0.95);
    border-radius: 36px;
    padding: ${format === "story" ? "56px 52px" : "48px 52px"};
    box-shadow: 0 20px 45px -15px rgba(148, 163, 184, 0.25);
  }

  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    padding: 6px 14px 6px 8px;
    border-radius: 999px;
  }
  .brand-logo {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }
  .brand-logo-fallback {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #4F46E5;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 13px;
  }
  .brand-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 700;
    font-size: 15px;
    color: #1E293B;
  }

  .stars { display: flex; gap: 4px; }

  .quote-text {
    font-family: 'Outfit', sans-serif;
    font-weight: 600;
    font-size: ${fontSize}px;
    line-height: 1.38;
    color: #0F172A;
    margin-bottom: 36px;
  }

  .customer-block {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-top: 24px;
    border-top: 1px solid #F1F5F9;
  }
  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #FFFFFF;
    box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  }
  .avatar-fallback {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #EC4899, #8B5CF6);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 24px;
  }
  .customer-name {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: #0F172A;
  }
  .customer-role {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600;
    font-size: 14px;
    color: #64748B;
  }

  ${SMART_HIGHLIGHT_CSS}
</style>
</head>
<body>
<div class="card">
  <div class="orb one"></div>
  <div class="orb two"></div>

  <div class="testimonial-bubble">
    <div class="top-row">
      <div class="brand-pill">
        ${logoHtml}
        <span class="brand-name">${safe.brand}</span>
      </div>
      ${props.rating ? `<div class="stars">${starRow(props.rating, accent)}</div>` : ""}
    </div>

    <div class="quote-text">“${safe.text}”</div>

    <div class="customer-block">
      ${avatarHtml}
      <div>
        <div class="customer-name">${safe.name}</div>
        ${safe.role ? `<div class="customer-role">${safe.role}</div>` : ""}
      </div>
    </div>
  </div>
  ${FILM_GRAIN_OVERLAY}
</div>
</body>
</html>`;
}
