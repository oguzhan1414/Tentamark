"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import {
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineArrowRightOnRectangle,
  HiChevronDown,
  HiOutlineLink,
} from "react-icons/hi2";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

interface UserProfileDropdownProps {
  userName: string;
  userEmail?: string;
  brandName?: string;
  connectedPlatforms?: PlatformName[];
}

export default function UserProfileDropdown({
  userName,
  userEmail,
  brandName,
  connectedPlatforms = [],
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    // Close on Escape key
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  async function handleSignOut() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      // Also post to server route to ensure all server cookies are destroyed
      await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
    } catch (err) {
      console.error("Çıkış yapılırken bir hata oluştu:", err);
    } finally {
      // Force hard navigation to login page to reset all server & client contexts
      window.location.href = "/giris";
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white py-1 pl-1 pr-2.5 shadow-xs transition hover:border-slate-300 hover:bg-slate-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400/20"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 font-semibold text-xs text-white shadow-2xs">
          {initials(userName)}
        </div>
        <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">
          {userName}
        </span>
        <HiChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-slate-700" : ""
          }`}
        />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-200/90 bg-white p-2 shadow-xl shadow-slate-900/10 backdrop-blur-md z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header / User Summary */}
          <div className="px-3 py-2.5 bg-slate-50/70 rounded-xl mb-1 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 font-bold text-sm text-white shadow-xs">
                {initials(userName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                {userEmail && (
                  <p className="text-[11px] text-slate-500 font-mono truncate">{userEmail}</p>
                )}
              </div>
            </div>

            {brandName && (
              <div className="mt-2.5 flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[10px] text-slate-400 font-medium">Çalışma Alanı:</span>
                <span className="text-[10px] font-bold text-slate-700 truncate">{brandName}</span>
              </div>
            )}

            {/* Connected platforms — moved here from the sidebar's bottom
                card, which had to cram these into a 96px-wide column as
                16px icons wrapping across rows once more than a couple of
                platforms were connected. This dropdown has real width, so
                every icon gets room to actually be legible. */}
            <Link
              href="/settings?tab=baglantilar"
              onClick={() => setIsOpen(false)}
              className="mt-2 flex items-center gap-2 pt-2 border-t border-slate-200/60"
            >
              <span className="text-[10px] text-slate-400 font-medium shrink-0">Bağlı Kanallar:</span>
              {connectedPlatforms.length === 0 ? (
                <span className="text-[10px] font-bold text-rose-600 hover:underline">+ Bağla</span>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  {connectedPlatforms.map((name) => (
                    <PlatformIcon key={name} name={name} className="h-5 w-5 rounded-md shadow-2xs" />
                  ))}
                </div>
              )}
            </Link>
          </div>

          {/* Nav Links */}
          <div className="py-1 space-y-0.5">
            <Link
              href="/settings?tab=genel"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              role="menuitem"
            >
              <HiOutlineUser className="h-4 w-4 text-slate-500 stroke-[1.75]" />
              <span>Profil & Genel Ayarlar</span>
            </Link>

            <Link
              href="/settings?tab=plan"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              role="menuitem"
            >
              <HiOutlineSparkles className="h-4 w-4 text-slate-500 stroke-[1.75]" />
              <span>Abonelik & Plan</span>
            </Link>

            <Link
              href="/settings?tab=ekip"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              role="menuitem"
            >
              <HiOutlineUserGroup className="h-4 w-4 text-slate-500 stroke-[1.75]" />
              <span>Ekip Üyeleri & Roller</span>
            </Link>

            <Link
              href="/settings?tab=baglantilar"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              role="menuitem"
            >
              <HiOutlineLink className="h-4 w-4 text-slate-500 stroke-[1.75]" />
              <span>Sosyal Medya Bağlantıları</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100" />

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition cursor-pointer disabled:opacity-50"
            role="menuitem"
          >
            <span className="flex items-center gap-2.5">
              {isLoggingOut ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
              ) : (
                <HiOutlineArrowRightOnRectangle className="h-4 w-4 stroke-[2]" />
              )}
              <span>{isLoggingOut ? "Çıkış Yapılıyor…" : "Oturumu Kapat"}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">Esc</span>
          </button>
        </div>
      )}
    </div>
  );
}
