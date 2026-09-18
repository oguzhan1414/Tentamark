"use client";

import TentamarkLogo from "@/components/TentamarkLogo";
import UserProfileDropdown from "@/components/dashboard/UserProfileDropdown";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import { useLanguage } from "@/context/LanguageContext";
import type { PlatformName } from "@/components/PlatformIcon";

export default function DashboardTopbar({
  userName,
  userEmail,
  brandName,
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Brand / Logo Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <TentamarkLogo size={24} />
          <span className="font-bold tracking-tight text-slate-900 text-sm hidden sm:inline-block">
            Tentamark
          </span>
        </div>
        {brandName && (
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-500 font-medium">
            <span>{t.dashboard.topbar.activeBrand}</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
              {brandName}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Language Switcher */}
        <div className="flex items-center rounded-full border border-slate-200 bg-slate-50/80 p-0.5">
          <button
            type="button"
            onClick={() => setLocale("tr")}
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
              locale === "tr"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
            aria-label={t.dashboard.userMenu.turkish}
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
            aria-label={t.dashboard.userMenu.english}
          >
            EN
          </button>
        </div>

        {/* Live Notification Dropdown */}
        <NotificationDropdown />

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
