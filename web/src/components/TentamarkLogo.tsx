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

/** The shared Tentamark mark used across the site and product. */
export function TentamarkIcon({
  size = 40,
  className = "",
  variant = "coral",
}: {
  size?: number;
  className?: string;
  variant?: "coral" | "white" | "badge" | "dark";
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={variant === "white" ? "/brand/tentamark-mark-on-dark.svg" : "/brand/tentamark-mark.svg"}
        alt="Tentamark"
        width={size}
        height={size}
        className="h-full w-full object-contain"
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
  subtitle = "",
}: LogoProps) {
  const isLightText = wordmarkColor === "white";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <TentamarkIcon size={size} variant={variant} />
      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-body text-lg font-bold tracking-[-0.04em] ${
              isLightText ? "text-white" : "text-slate-900"
            }`}
          >
            Tentamark
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
