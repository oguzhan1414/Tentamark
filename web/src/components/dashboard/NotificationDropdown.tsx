"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { NOTIFICATION_CATEGORIES, NotificationCategory } from "@/lib/notifications/notificationTypes";
import { useLanguage } from "@/context/LanguageContext";
import type { Locale } from "@/lib/i18n/translations";
import {
  HiOutlineBell,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineCalendarDays,
  HiOutlineArrowUpOnSquare,
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
  HiOutlineArrowRight,
  HiOutlineInbox,
} from "react-icons/hi2";

function formatRelativeTime(isoString: string, locale: Locale, copy: { justNow: string; yesterday: string; minutesAgo: string; hoursAgo: string; daysAgo: string }): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return copy.justNow;
    if (diffMin < 60) return copy.minutesAgo.replace("{count}", String(diffMin));
    if (diffHours < 24) return copy.hoursAgo.replace("{count}", String(diffHours));
    if (diffDays === 1) return copy.yesterday;
    if (diffDays < 7) return copy.daysAgo.replace("{count}", String(diffDays));
    return new Date(isoString).toLocaleDateString(locale === "en" ? "en-US" : "tr-TR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function getCategoryIcon(category: NotificationCategory, severity: string) {
  if (severity === "error") {
    return <HiOutlineExclamationTriangle className="w-4 h-4 text-rose-600" />;
  }
  switch (category) {
    case "approvals":
      return <HiOutlineCheckCircle className="w-4 h-4 text-emerald-600" />;
    case "publishing":
      return <HiOutlineArrowUpOnSquare className="w-4 h-4 text-sky-600" />;
    case "ai_guardian":
      return <HiOutlineSparkles className="w-4 h-4 text-orange-600" />;
    case "calendar":
      return <HiOutlineCalendarDays className="w-4 h-4 text-amber-600" />;
    case "connections":
      return <HiOutlineShieldCheck className="w-4 h-4 text-rose-600" />;
    default:
      return <HiOutlineBell className="w-4 h-4 text-slate-600" />;
  }
}

export default function NotificationDropdown() {
  const { locale, t } = useLanguage();
  const copy = t.dashboard.notifications;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    rawNotifications,
    unreadCount,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    isLoading,
    error,
    refresh,
  } = useNotifications();

  // Close on outside click or escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
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

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (!isOpen) void refresh();
          setIsOpen((prev) => !prev);
        }}
        aria-label={copy.title}
        aria-expanded={isOpen}
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all cursor-pointer shadow-xs ${
          isOpen
            ? "border-orange-300 bg-orange-50 text-orange-700 shadow-sm"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <HiOutlineBell className="h-4 w-4 transition-transform active:scale-90" />

        {/* Pulsing Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[410px] max-w-[92vw] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">{copy.title}</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                  {copy.newCount.replace("{count}", String(unreadCount))}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-800 transition cursor-pointer"
              >
                <HiOutlineCheck className="w-3.5 h-3.5" />
                <span>{copy.markAllRead}</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center border-b border-slate-100 px-4 pt-2 bg-white gap-2 text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`pb-2.5 px-2 border-b-2 transition cursor-pointer ${
                filter === "all"
                  ? "border-orange-600 font-bold text-orange-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {copy.all.replace("{count}", String(rawNotifications.length))}
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`pb-2.5 px-2 border-b-2 transition cursor-pointer ${
                filter === "unread"
                  ? "border-orange-600 font-bold text-orange-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {copy.unread.replace("{count}", String(unreadCount))}
            </button>
          </div>

          {/* Notifications Scrollable List */}
          {error && (
            <div className="flex items-center justify-between gap-2 bg-rose-50 px-4 py-2 text-xs text-rose-700">
              <span>{error}</span>
              <button type="button" onClick={() => void refresh()} className="font-semibold underline">{copy.retry}</button>
            </div>
          )}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <p className="p-8 text-center text-xs text-slate-500">{copy.loading}</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
                  <HiOutlineInbox className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {filter === "unread" ? copy.noUnread : copy.empty}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                  {copy.emptyDescription}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const categoryMeta = NOTIFICATION_CATEGORIES[item.category] || NOTIFICATION_CATEGORIES.ai_guardian;
                const eventCopy = copy.events[item.type as keyof typeof copy.events];

                return (
                  <div
                    key={item.id}
                    onClick={() => !item.is_read && markAsRead(item.id)}
                    className={`relative p-3.5 sm:p-4 transition flex gap-3 items-start group hover:bg-slate-50/90 cursor-pointer ${
                      !item.is_read ? "bg-orange-50/20" : "bg-white"
                    }`}
                  >
                    {/* Unread Left Dot */}
                    {!item.is_read && (
                      <span className="absolute left-1.5 top-5 h-2 w-2 rounded-full bg-orange-600 ring-2 ring-orange-200" />
                    )}

                    {/* Category Icon */}
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200/60 shadow-2xs ${categoryMeta.badgeBg}`}
                    >
                      {getCategoryIcon(item.category, item.severity)}
                    </div>

                    {/* Notification Content Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className={`text-xs sm:text-sm tracking-tight truncate ${!item.is_read ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                          {eventCopy?.title ?? item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                          {formatRelativeTime(item.created_at, locale, copy)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                        {item.message}
                      </p>

                      {/* Action Button Link */}
                      {item.link && (
                        <div className="mt-2 flex items-center justify-between">
                          <Link
                            href={item.link}
                            onClick={() => {
                              markAsRead(item.id);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-800 transition py-0.5"
                          >
                            <span>{eventCopy?.action ?? item.action_label ?? copy.view}</span>
                            <HiOutlineArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>

                          {!item.is_read && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(item.id);
                              }}
                              className="text-[11px] text-slate-400 hover:text-slate-600 transition"
                            >
                              {copy.markRead}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-center">
            <Link
              href="/settings?tab=bildirimler"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition"
            >
              {copy.settings} ⚙️
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
