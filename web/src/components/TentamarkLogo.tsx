"use client";

import React from "react";
import Image from "next/image";

export interface LogoProps {
  className?: string;
  size?: number;
  variant?: "coral" | "white" | "badge" | "dark";
  withWordmark?: boolean;
  wordmarkColor?: "dark" | "white";
  subtitle?: string;
}

/**
 * Tentamark 8-Tentacle Mascot Icon
 * Professional 8-tentacled warm coral mascot design.
 * Rendered from high-resolution transparent asset with subtle depth.
 */
export function TentamarkIcon({
  size = 40,
  className = "",
  variant = "coral",
}: {
  size?: number;
  className?: string;
  variant?: "coral" | "white" | "badge" | "dark";
}) {
  const isWhite = variant === "white";
  const isDark = variant === "dark";

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/images/tentamark-mascot.png"
        alt="Tentamark"
        width={size * 2}
        height={size * 2}
        priority
        className={`h-full w-full object-contain transition-transform duration-200 ${
          isWhite
            ? "brightness-0 invert drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]"
            : isDark
            ? "brightness-0 contrast-200"
            : "drop-shadow-[0_4px_12px_rgba(250,82,82,0.16)]"
        }`}
      />
    </span>
  );
}

export default function TentamarkLogo({
  size = 36,
  className = "",
  variant = "coral",
  withWordmark = false,
  wordmarkColor = "dark",
  subtitle = "Social AI Engine",
}: LogoProps) {
  const isLightText = wordmarkColor === "white";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <TentamarkIcon size={size} variant={variant} />
      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display text-lg font-bold tracking-tight ${
              isLightText ? "text-white" : "text-slate-900"
            }`}
          >
            Tenta<span className="text-[#FA5252]">mark</span>
          </span>
          {subtitle && (
            <span
              className={`font-sans text-[9px] font-semibold uppercase tracking-wider mt-0.5 ${
                isLightText ? "text-white/50" : "text-slate-400"
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

