"use client";

import { useState, useEffect, useCallback } from "react";
import type { NotificationItem, NotificationFilter } from "../notifications/notificationTypes";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) throw new Error("Bildirimler yüklenemedi.");
      const data = await res.json();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setError(null);
    } catch {
      setError("Bildirimler yüklenemedi. Tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadNotifications(); }, 0);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadNotifications();
    }, 30000);
    const onFocus = () => { void loadNotifications(); };
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (!res.ok) throw new Error();
      setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, is_read: true } : item));
      setError(null);
    } catch {
      setError("Bildirim güncellenemedi. Tekrar deneyin.");
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (!res.ok) throw new Error();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setError(null);
    } catch {
      setError("Bildirimler güncellenemedi. Tekrar deneyin.");
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications = notifications.filter((item) => filter !== "unread" || !item.is_read);

  return {
    notifications: filteredNotifications,
    rawNotifications: notifications,
    unreadCount,
    filter,
    setFilter,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
}
