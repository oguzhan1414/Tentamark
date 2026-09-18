// TENTAMARK IN-APP NOTIFICATION TYPES

export type NotificationCategory =
  | "approvals"    // Onay bekliyor, onaylandı, revize, atandı
  | "publishing"   // Başarıyla yayınlandı, yayın hatası, story hatırlatma
  | "ai_guardian"  // Otonom haftalık plan, yasaklı kelime, trend fırsatı
  | "calendar"     // 48s boş takvim, Türkiye özel günleri (23 Nisan, Anneler Günü vb.)
  | "connections"; // Token süresi doluyor, kota limiti

export type NotificationSeverity = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  brand_id?: string;
  category: NotificationCategory;
  type: string;
  title: string;
  message: string;
  link?: string;
  action_label?: string;
  is_read: boolean;
  severity: NotificationSeverity;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export type NotificationFilter = "all" | "unread";

export interface NotificationCategoryMeta {
  id: NotificationCategory;
  label: string;
  badgeBg: string;
  badgeText: string;
  iconColor: string;
}

export const NOTIFICATION_CATEGORIES: Record<NotificationCategory, NotificationCategoryMeta> = {
  approvals: {
    id: "approvals",
    label: "Onay & Ekip",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    iconColor: "text-emerald-600",
  },
  publishing: {
    id: "publishing",
    label: "Yayınlama",
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
    iconColor: "text-sky-600",
  },
  ai_guardian: {
    id: "ai_guardian",
    label: "AI & Guardian",
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
    iconColor: "text-orange-600",
  },
  calendar: {
    id: "calendar",
    label: "Takvim & Özel Gün",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    iconColor: "text-amber-600",
  },
  connections: {
    id: "connections",
    label: "Bağlantı & Sağlık",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    iconColor: "text-rose-600",
  },
};
