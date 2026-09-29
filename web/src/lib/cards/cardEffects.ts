// Global visual enhancement utilities for card templates:
// 1. Rich formatting syntax engine:
//    - *word* -> Smart Highlighter (marker highlight block)
//    - ~word~ -> Hand-drawn SVG red/coral pen circle
//    - _word_ -> Hand-drawn SVG wavy underline
// 2. Film grain analog noise layer: subtle SVG noise filter to give graphics organic studio texture

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type RichFormatOptions = {
  highlightColor?: string;
  circleColor?: string;
  underlineColor?: string;
  isDark?: boolean;
};

export function applyRichFormatting(text: string, options?: RichFormatOptions): string {
  const isDark = options?.isDark ?? true;
  const hlColor = options?.highlightColor || (isDark ? "#FACC15" : "#FEF08A");
  const circleColor = options?.circleColor || (isDark ? "#FF4757" : "#E11D48");
  const underColor = options?.underlineColor || (isDark ? "#38BDF8" : "#0284C7");

  let safe = escapeHtml(text);

  // 1. ~word~ -> Hand-drawn SVG Oval Circle
  // pathLength="1" normalizes the path's length to exactly 1 regardless of
  // its real geometry, so stroke-dasharray/stroke-dashoffset animation (see
  // SMART_HIGHLIGHT_CSS's handDraw keyframes) always draws the full stroke
  // over 0 -> 1 without needing to measure each path's actual pixel length.
  safe = safe.replace(/~([^~]+)~/g, (_match, p1) => {
    return `<span class="hand-circle"><span class="hand-circle-text">${p1}</span><svg class="hand-circle-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path pathLength="1" d="M 5,50 C 4,18 24,5 54,4 C 84,3 97,20 96,50 C 95,80 78,96 48,96 C 18,96 2,78 7,42" fill="none" stroke="${circleColor}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  });

  // 2. _word_ -> Hand-drawn SVG Wavy Underline
  safe = safe.replace(/_([^_]+)_/g, (_match, p1) => {
    return `<span class="hand-underline"><span class="hand-underline-text">${p1}</span><svg class="hand-underline-svg" viewBox="0 0 100 20" preserveAspectRatio="none"><path pathLength="1" d="M 3,14 Q 26,4 50,14 T 97,12" fill="none" stroke="${underColor}" stroke-width="4.5" stroke-linecap="round"/></svg></span>`;
  });

  // 3. *word* -> Smart Highlighter
  safe = safe.replace(/\*([^*]+)\*/g, (_match, p1) => {
    return `<mark class="marker-highlight" style="--hl-color:${hlColor};">${p1}</mark>`;
  });

  return safe;
}

// Backward-compatible alias
export function applySmartHighlights(text: string, highlightColor?: string): string {
  return applyRichFormatting(text, { highlightColor });
}

export const SMART_HIGHLIGHT_CSS = `
  .marker-highlight {
    background: linear-gradient(104deg, var(--hl-color, #FACC15) 0%, var(--hl-color, #FACC15) 100%);
    background-repeat: no-repeat;
    color: #111111;
    font-weight: 700;
    border-radius: 4px;
    padding: 2px 8px;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    display: inline;
  }

  .hand-circle {
    position: relative;
    display: inline-block;
    padding: 0 4px;
    white-space: nowrap;
  }
  .hand-circle-text {
    position: relative;
    z-index: 1;
  }
  .hand-circle-svg {
    /* width/height MUST stay explicit, not just top/left insets — an <svg>
       is a "replaced element" with its own intrinsic (viewBox) aspect
       ratio, so leaving width or height as auto makes the browser derive
       the missing one FROM that ratio instead of from the actual box,
       which for a wide-short line of text balloons into a giant near-
       square circle. Kept tight on purpose too — the original, more
       generous overshoot (-20% top/bottom) visibly bled the stroke into
       whatever line sits directly above/below the marked phrase. */
    position: absolute;
    top: -10%;
    left: -10%;
    width: 120%;
    height: 120%;
    pointer-events: none;
    z-index: 2;
    overflow: visible;
  }

  .hand-underline {
    position: relative;
    display: inline-block;
    padding-bottom: 4px;
    white-space: nowrap;
  }
  .hand-underline-text {
    position: relative;
    z-index: 1;
  }
  .hand-underline-svg {
    position: absolute;
    left: -3%;
    width: 106%;
    bottom: -6px;
    height: 12px;
    pointer-events: none;
    z-index: 2;
    overflow: visible;
  }

  /* Animated-render only: a static Playwright screenshot just gets the
     end state (fully drawn/highlighted) since these hold at t=1 via
     animation-fill-mode: forwards — this block is inert for plain PNG
     cards and only becomes visible motion once something scrubs the
     page's Web Animations clock frame-by-frame (see renderHtmlToClip.ts). */
  .marker-highlight {
    background-size: 0% 100%;
    animation: markerReveal 0.45s ease-out 0.4s forwards;
  }
  .hand-circle-svg path,
  .hand-underline-svg path {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: handDraw 0.7s cubic-bezier(0.65, 0, 0.35, 1) 0.5s forwards;
  }
  @keyframes markerReveal {
    to { background-size: 100% 100%; }
  }
  @keyframes handDraw {
    to { stroke-dashoffset: 0; }
  }

  /* Generic card-level motion, free for every one of the 23 templates at
     once: every template's whole render is exactly one <div> directly
     under <body> (verified across all of them), so this selector needs no
     per-template class name to reach it. Gives every card the same "appear,
     then breathe gently" life in an animated clip, without hand-authoring
     entrance/ambient-motion CSS in each individual variant file. Fully
     inert for static PNG renders (settleAnimations() in
     renderHtmlToImage.ts finishes the entrance immediately; the infinite
     breathe just gets left at whatever point it's at, imperceptibly close
     to its resting scale). */
  body > div:first-of-type {
    animation:
      tmCardEntrance 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s both,
      tmCardBreathe 7s ease-in-out 0.8s infinite;
  }
  @keyframes tmCardEntrance {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes tmCardBreathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.008); }
  }
`;

// Pure SVG noise encoded as data-URI for zero external assets
export const FILM_GRAIN_OVERLAY = `
  <div class="film-grain" style="
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 99;
    opacity: 0.045;
    background-image: url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"noiseFilter\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23noiseFilter)\"/></svg>');
  "></div>
`;
