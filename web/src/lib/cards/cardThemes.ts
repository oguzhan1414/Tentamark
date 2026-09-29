// Global Design Theme definitions for the 4 "Wow" aesthetic languages:
// 1. aurora: VisionOS Frosted Glass & Ambient Blurred Gradient Mesh
// 2. editorial: Haute Horlogerie / Editorial Magazine Serif & Warm Alabaster
// 3. clay: Soft Clay / Notion Friendly Rounded Pillowy Shadows & Pastels
// 4. cyber: Matrix Cyber Terminal Monospace Grid & Neon Green/Cyan Accents

export type WowThemeKey = "aurora" | "editorial" | "clay" | "cyber";

export const WOW_THEMES: Record<
  WowThemeKey,
  {
    key: WowThemeKey;
    label: { tr: string; en: string };
    previewColor: string; // Gradient or hex for the UI pill
    isDark: boolean;
    fontFamily: string;
    googleFontsImport: string;
    backgroundStyle: string;
    cardStyle: string;
    textStyle: string;
    metaStyle: string;
  }
> = {
  aurora: {
    key: "aurora",
    label: { tr: "Aurora Glass", en: "Aurora Glass" },
    previewColor: "linear-gradient(135deg, #6366F1, #EC4899, #10B981)",
    isDark: true,
    fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
    googleFontsImport:
      "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');",
    backgroundStyle: `
      background: #070811;
      background-image:
        radial-gradient(circle at 12% 18%, rgba(99, 102, 241, 0.42) 0%, transparent 48%),
        radial-gradient(circle at 88% 22%, rgba(236, 72, 153, 0.38) 0%, transparent 48%),
        radial-gradient(circle at 50% 86%, rgba(16, 185, 129, 0.30) 0%, transparent 52%);
    `,
    cardStyle: `
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(48px);
      -webkit-backdrop-filter: blur(48px);
      border: 1px solid rgba(255, 255, 255, 0.16);
      box-shadow: 0 32px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3);
      border-radius: 36px;
    `,
    textStyle: `
      color: #FFFFFF;
      text-shadow: 0 2px 20px rgba(255, 255, 255, 0.15);
    `,
    metaStyle: `
      color: rgba(255, 255, 255, 0.7);
    `,
  },

  editorial: {
    key: "editorial",
    label: { tr: "Editorial Luxury", en: "Editorial Luxury" },
    previewColor: "#FAF8F5",
    isDark: false,
    fontFamily: "'Playfair Display', 'Lora', Georgia, serif",
    googleFontsImport:
      "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,400&family=Inter:wght@400;600;700&display=swap');",
    backgroundStyle: `
      background: #FAF8F5;
      background-image: radial-gradient(#E8E3D8 1px, transparent 1px);
      background-size: 28px 28px;
    `,
    cardStyle: `
      background: #FFFFFF;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 20px 48px -10px rgba(40, 30, 20, 0.06);
      border-radius: 20px;
    `,
    textStyle: `
      color: #141416;
      letter-spacing: -0.015em;
    `,
    metaStyle: `
      color: #71717A;
      font-family: 'Inter', sans-serif;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    `,
  },

  clay: {
    key: "clay",
    label: { tr: "Soft Clay", en: "Soft Clay" },
    previewColor: "#F5F3EC",
    isDark: false,
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    googleFontsImport:
      "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');",
    backgroundStyle: `
      background: #F3EFE6;
      background-image: radial-gradient(circle at 50% 50%, #FAF7F0 0%, #EDE7D8 100%);
    `,
    cardStyle: `
      background: #FFFFFF;
      border-radius: 40px;
      border: 2px solid rgba(0, 0, 0, 0.04);
      box-shadow: 0 28px 56px -12px rgba(60, 50, 80, 0.12), 0 8px 24px -4px rgba(0, 0, 0, 0.04);
    `,
    textStyle: `
      color: #1C1917;
      letter-spacing: -0.02em;
    `,
    metaStyle: `
      color: #78716C;
      font-weight: 700;
    `,
  },

  cyber: {
    key: "cyber",
    label: { tr: "Cyber Terminal", en: "Cyber Terminal" },
    previewColor: "#00FF9D",
    isDark: true,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    googleFontsImport:
      "@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');",
    backgroundStyle: `
      background: #06070A;
      background-image:
        linear-gradient(to right, rgba(0, 255, 157, 0.06) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 255, 157, 0.06) 1px, transparent 1px);
      background-size: 32px 32px;
    `,
    cardStyle: `
      background: rgba(12, 14, 20, 0.85);
      border: 1px solid rgba(0, 255, 157, 0.35);
      box-shadow: 0 0 40px rgba(0, 255, 157, 0.1), inset 0 1px 0 rgba(0, 255, 157, 0.2);
      border-radius: 20px;
    `,
    textStyle: `
      color: #ECFDF5;
      text-shadow: 0 0 12px rgba(0, 255, 157, 0.25);
    `,
    metaStyle: `
      color: #00FF9D;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    `,
  },
};
