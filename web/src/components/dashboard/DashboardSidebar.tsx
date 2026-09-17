"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import { TentamarkIcon } from "@/components/TentamarkLogo";
import { useLanguage } from "@/context/LanguageContext";
import {
  HiOutlineCalendarDays,
  HiOutlineSquare3Stack3D,
  HiOutlineInbox,
  HiOutlineMegaphone,
  HiOutlineFingerPrint,
  HiOutlineSparkles,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

export type NavItemKey =
  | "calendar"
  | "posts"
  | "inbox"
  | "campaigns"
  | "brand"
  | "assistant"
  | "analytics"
  | "settings";

export type NavGroupKey = "content" | "intelligence" | "account";

export interface NavItemConfig {
  key: NavItemKey;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: NavGroupKey | null;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { key: "calendar", href: "/dashboard/calendar", icon: HiOutlineCalendarDays, group: null },
  { key: "posts", href: "/dashboard/posts", icon: HiOutlineSquare3Stack3D, group: "content" },
  { key: "inbox", href: "/dashboard/inbox", icon: HiOutlineInbox, group: "content" },
  { key: "campaigns", href: "/dashboard/campaigns", icon: HiOutlineMegaphone, group: "content" },
  { key: "brand", href: "/dashboard/brand", icon: HiOutlineFingerPrint, group: "intelligence" },
  { key: "assistant", href: "/dashboard/assistant", icon: HiOutlineSparkles, group: "intelligence" },
  { key: "analytics", href: "/dashboard/analytics", icon: HiOutlineChartBar, group: "intelligence" },
  { key: "settings", href: "/settings", icon: HiOutlineCog6Tooth, group: "account" },
];

export const NAV_GROUP_ORDER: NavGroupKey[] = ["content", "intelligence", "account"];

export default function DashboardSidebar({
  connectedPlatforms,
  pendingApprovals,
  unreadInboxCount,
}: {
  connectedPlatforms: PlatformName[];
  pendingApprovals: number;
  unreadInboxCount: number;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const navT = t.dashboard.nav;

  return (
    <aside
      className="sticky top-0 hidden h-dvh w-24 shrink-0 flex-col overflow-y-auto bg-white px-2 py-4 border-r border-slate-200/80 [-ms-overflow-style:none] [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden print:hidden"
    >
      {/* Brand mark */}
      <Link href="/dashboard" className="flex items-center justify-center py-2 group">
        <div className="relative flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <TentamarkIcon size={48} />
        </div>
      </Link>

      {/* Navigation List */}
      <nav className="mt-4 flex flex-col gap-2">
        {/* Standalone items (Calendar) */}
        {NAV_ITEMS.filter((item) => item.group === null).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center gap-1 rounded-xl px-1 py-1 font-body text-center transition-colors"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-800"
                }`}
              >
                <Icon className="h-5 w-5 stroke-[1.75]" />
              </span>
              <span
                className={`text-[10px] tracking-tight leading-tight transition-colors ${
                  active ? "font-bold text-slate-900" : "font-medium text-slate-500 group-hover:text-slate-800"
                }`}
              >
                {navT[item.key]}
              </span>
            </Link>
          );
        })}

        {/* Grouped sections (Content, Intelligence, Account) */}
        {NAV_GROUP_ORDER.map((group) => (
          <div key={group} className="flex flex-col gap-1.5 pt-1">
            <span className="text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {navT.groups[group]}
            </span>
            {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col items-center gap-1 rounded-xl px-1 py-1 font-body text-center transition-colors"
                >
                  <span
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-150 ${
                      active
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-800"
                    }`}
                  >
                    <Icon className="h-5 w-5 stroke-[1.75]" />

                    {/* Pending Approvals badge */}
                    {item.href === "/dashboard/posts" && pendingApprovals > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[9px] font-bold text-white shadow-xs">
                        {pendingApprovals > 99 ? "99+" : pendingApprovals}
                      </span>
                    )}

                    {/* Unread Inbox badge */}
                    {item.href === "/dashboard/inbox" && unreadInboxCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 font-mono text-[9px] font-bold text-white shadow-xs">
                        {unreadInboxCount > 99 ? "99+" : unreadInboxCount}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[10px] tracking-tight leading-tight transition-colors ${
                      active ? "font-bold text-slate-900" : "font-medium text-slate-500 group-hover:text-slate-800"
                    }`}
                  >
                    {navT[item.key]}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Connected Accounts Card */}
      <div className="mt-auto flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2 text-center">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {connectedPlatforms.length === 0 ? (
          <Link
            href="/settings?tab=baglantilar"
            className="font-body text-[9px] font-semibold leading-tight text-rose-600 hover:text-rose-700"
          >
            {navT.connectAction}
          </Link>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-1">
            {connectedPlatforms.map((name) => (
              <PlatformIcon key={name} name={name} className="h-4 w-4 rounded-sm shadow-2xs" />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
