"use client";

import TentamarkLogo from "@/components/TentamarkLogo";
import UserProfileDropdown from "@/components/dashboard/UserProfileDropdown";
import { useLanguage } from "@/context/LanguageContext";
import type { PlatformName } from "@/components/PlatformIcon";

export default function DashboardTopbar({
  userName,
  userEmail,
  brandName,
  systemHealthy: _systemHealthy,
  connectedPlatforms,
}: {
  userName: string;
  userEmail?: string;
  brandName?: string;
  systemHealthy?: boolean;
  connectedPlatforms: PlatformName[];
}) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8 print:hidden">
      {/* Left / Brand Info & Mobile Logo */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 lg:hidden">
          <TentamarkLogo size={24} withWordmark={true} />
        </div>
      </div>

      {/* Right / Actions & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Language Switcher Pill (TR / EN) */}
        <div className="flex items-center rounded-full border border-slate-200/90 bg-white p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setLocale("tr")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
              locale === "tr"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
            aria-label="Türkçe"
          >
            TR
          </button>
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
              locale === "en"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
            aria-label="English"
          >
            EN
          </button>
        </div>

        {/* Quick notification bell — decorative until a real notification system exists */}
        <button
          type="button"
          aria-label={t.dashboard.topbar.notifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* Interactive User Profile Dropdown with Logout & Settings */}
        <UserProfileDropdown
          userName={userName}
          userEmail={userEmail}
          brandName={brandName}
          connectedPlatforms={connectedPlatforms}
        />
      </div>
    </header>
  );
}
