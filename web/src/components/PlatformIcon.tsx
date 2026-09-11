import type { IconType } from "react-icons";
import {
  FaDiscord,
  FaFacebook,
  FaGoogle,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaShopify,
  FaTelegram,
  FaThreads,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

/*
  Real brand marks, not emoji and not hand-drawn paths.

  Font Awesome 6 brands is used for all of them rather than Simple Icons,
  because Simple Icons no longer ships a LinkedIn mark (removed on the
  brand's request) and LinkedIn is one of our three launch platforms.
  One icon family for every logo beats mixing two libraries.

  Colours are the official brand hexes. They are deliberately hardcoded:
  a brand mark must not shift with our theme tokens.

  PlatformName is the narrow, load-bearing type: dashboard code keys
  Record<PlatformName, ...> maps (character limits, connection state) off it,
  so it only ever names platforms the product can actually post to.
  RoadmapPlatformName adds the icons-only, not-yet-integrated brands the
  marketing site shows (Shopify, Telegram, Discord, ...) — PlatformIcon
  renders either, but nothing outside the marketing components should key a
  Record off the wider type.
*/
export type PlatformName =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "x"
  | "pinterest"
  | "threads";

export type RoadmapPlatformName =
  | PlatformName
  | "shopify"
  | "google-business"
  | "telegram"
  | "discord"
  | "whatsapp";

type Brand = { label: string; Icon: IconType; hex: string };

const BRANDS: Record<RoadmapPlatformName, Brand> = {
  instagram: { label: "Instagram", Icon: FaInstagram, hex: "#E4405F" },
  facebook: { label: "Facebook", Icon: FaFacebook, hex: "#0866FF" },
  linkedin: { label: "LinkedIn", Icon: FaLinkedin, hex: "#0A66C2" },
  tiktok: { label: "TikTok", Icon: FaTiktok, hex: "#111111" },
  youtube: { label: "YouTube", Icon: FaYoutube, hex: "#FF0000" },
  x: { label: "X", Icon: FaXTwitter, hex: "#111111" },
  pinterest: { label: "Pinterest", Icon: FaPinterest, hex: "#E60023" },
  threads: { label: "Threads", Icon: FaThreads, hex: "#111111" },
  shopify: { label: "Shopify", Icon: FaShopify, hex: "#95BF47" },
  "google-business": { label: "Google Business Profile", Icon: FaGoogle, hex: "#4285F4" },
  telegram: { label: "Telegram", Icon: FaTelegram, hex: "#26A5E4" },
  discord: { label: "Discord", Icon: FaDiscord, hex: "#5865F2" },
  whatsapp: { label: "WhatsApp Business", Icon: FaWhatsapp, hex: "#25D366" },
};

export function platformLabel(name: RoadmapPlatformName) {
  return BRANDS[name].label;
}

type Props = {
  name: RoadmapPlatformName;
  /** "tile" = brand-coloured rounded square, white glyph. "bare" = glyph only. */
  variant?: "tile" | "bare";
  className?: string;
};

export default function PlatformIcon({ name, variant = "tile", className = "" }: Props) {
  const { label, Icon, hex } = BRANDS[name];

  if (variant === "bare") {
    return (
      <Icon
        aria-label={label}
        role="img"
        className={className}
        style={{ color: hex }}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      style={{ backgroundColor: hex }}
      className={`flex items-center justify-center rounded-xl text-white ${className}`}
    >
      <Icon className="h-1/2 w-1/2" aria-hidden="true" />
    </span>
  );
}
