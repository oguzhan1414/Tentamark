import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaThreads,
  FaTiktok,
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

type Brand = { label: string; Icon: IconType; hex: string };

const BRANDS: Record<PlatformName, Brand> = {
  instagram: { label: "Instagram", Icon: FaInstagram, hex: "#E4405F" },
  facebook: { label: "Facebook", Icon: FaFacebook, hex: "#0866FF" },
  linkedin: { label: "LinkedIn", Icon: FaLinkedin, hex: "#0A66C2" },
  tiktok: { label: "TikTok", Icon: FaTiktok, hex: "#111111" },
  youtube: { label: "YouTube", Icon: FaYoutube, hex: "#FF0000" },
  x: { label: "X", Icon: FaXTwitter, hex: "#111111" },
  pinterest: { label: "Pinterest", Icon: FaPinterest, hex: "#E60023" },
  threads: { label: "Threads", Icon: FaThreads, hex: "#111111" },
};

export function platformLabel(name: PlatformName) {
  return BRANDS[name].label;
}

type Props = {
  name: PlatformName;
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
