"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";
import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";
import { useCanvaConnection } from "@/lib/canva/useCanvaConnection";
import { HiOutlineShieldCheck, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

type SettingsTab = "genel" | "plan" | "ekip" | "bildirimler" | "baglantilar";

const ROLE_LABEL: Record<string, string> = {
  owner: "Sahip (Owner)",
  admin: "Yönetici (Admin)",
  member: "Üye",
};

type TeamMember = { id: string; userId: string; role: string; name: string; email: string };
type TeamInvite = { id: string; email: string; role: string; token: string; expires_at: string };

type ConnectedAccount = {
  id: string;
  platform: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  status: string;
  last_health_check_at: string | null;
};

// Ported from the old standalone /dashboard/connections page (now folded
// into this tab) — same static integration catalog, same copy.
const AVAILABLE_INTEGRATIONS: {
  id: string;
  name: string;
  desc: string;
  icon: PlatformName;
  href: string;
  available: boolean;
}[] = [
  {
    id: "instagram",
    name: "Instagram Professional",
    desc: "Gönderi, Reels ve Hikayeleri doğrudan profesyonel hesabınızda yayınlayın.",
    icon: "instagram",
    href: "/api/connections/instagram/start",
    available: true,
  },
  {
    id: "facebook",
    name: "Facebook Sayfası",
    desc: "Topluluk paylaşımlarını ve Facebook gönderilerini otomatik senkronize edin.",
    icon: "facebook",
    href: "/api/connections/meta/start",
    available: true,
  },
  {
    id: "threads",
    name: "Threads",
    desc: "Metin ve fotoğraf gönderilerinizi doğrudan Threads akışında paylaşın.",
    icon: "threads",
    href: "/api/connections/threads/start",
    available: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn Şirket Sayfası",
    desc: "B2B makalelerinizi ve profesyonel içeriklerinizi yayınlayın.",
    icon: "linkedin",
    href: "#",
    available: false,
  },
  {
    id: "x",
    name: "X (Twitter)",
    desc: "Anlık tweet ve flood serilerinizi otomatik zamanlayın.",
    icon: "x",
    href: "#",
    available: false,
  },
  {
    id: "tiktok",
    name: "TikTok",
    desc: "Dikey video ve kısa kliplerinizi doğrudan TikTok hesabınıza aktarın. TikTok onayı tamamlanana kadar paylaşımlar yalnızca hesabınızda (gizli) görünür.",
    icon: "tiktok",
    href: "/api/connections/tiktok/start",
    available: true,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    desc: "Görsellerinizi doğrudan bir panoya Pin olarak paylaşın. Video Pin desteği henüz yok, yalnızca görsel gönderiler.",
    icon: "pinterest",
    href: "/api/connections/pinterest/start",
    available: true,
  },
  {
    id: "youtube",
    name: "YouTube",
    desc: "Videolarınızı doğrudan kanalınıza yükleyin. Yalnızca video — fotoğraf veya metinle paylaşım yapılamıyor.",
    icon: "youtube",
    href: "/api/connections/youtube/start",
    available: true,
  },
];

function accountStatusLabel(status: string): { text: string; className: string } {
  switch (status) {
    case "active":
      return { text: "Aktif", className: "font-semibold text-emerald-600" };
    case "needs_reauth":
      return { text: "Yeniden bağlantı gerekiyor", className: "font-semibold text-amber-600" };
    case "disconnected":
      return { text: "Bağlantı kesildi", className: "font-semibold text-red-600" };
    default:
      return { text: status, className: "font-semibold text-slate-500" };
  }
}

function connectErrorMessage(code: string) {
  const provider = code.startsWith("threads_")
    ? "Threads"
    : code.startsWith("instagram_")
      ? "Instagram"
      : code.startsWith("tiktok_")
        ? "TikTok"
        : code.startsWith("pinterest_")
          ? "Pinterest"
          : code.startsWith("youtube_")
            ? "YouTube"
            : code.startsWith("canva_")
              ? "Canva"
              : "Facebook";
  const reason = code.replace(/^(threads|instagram|tiktok|pinterest|youtube|canva)_/, "");

  switch (reason) {
    case "denied":
      return "Bağlantı iptal edildi.";
    case "state":
      return "Güvenlik doğrulaması başarısız oldu, lütfen tekrar deneyin.";
    case "token":
      return `${provider} ile bağlantı kurulamadı.`;
    case "pages":
      return "Sayfalarınız alınamadı.";
    case "no-pages":
      return "Hesabınıza bağlı bir Facebook Sayfası bulunamadı — önce bir Sayfa oluşturmanız gerekiyor.";
    case "no-board":
      return "Pinterest hesabınızda bir pano bulunamadı ve otomatik oluşturulamadı.";
    case "no-channel":
      return "Bu Google hesabına bağlı bir YouTube kanalı bulunamadı.";
    case "no-refresh-token":
      return "Google bağlantı için gerekli izni vermedi — lütfen tekrar dene ve izin ekranında hesabı yeniden onayla.";
    case "config":
      return `${provider} bağlantısı henüz yapılandırılmadı.`;
    case "save":
      return "Hesap doğrulandı ancak veritabanına kaydedilemedi.";
    default:
      return "Bağlantı sırasında bir sorun oluştu.";
  }
}

// Telegram has no OAuth to redirect through — every other integration card
// is a plain link to a /start route, this one is a real inline form that
// POSTs to /api/connections/telegram/connect instead (see that route for
// what actually gets validated before anything is saved).
function TelegramConnectCard({ isConnected, onConnected }: { isConnected: boolean; onConnected: () => void }) {
  const [open, setOpen] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [channelUsername, setChannelUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/connections/telegram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken, channelUsername }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bağlantı kurulamadı.");
      setBotToken("");
      setChannelUsername("");
      setOpen(false);
      onConnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bağlantı kurulamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <PlatformIcon name="telegram" className="h-9 w-9 rounded-xl shadow-xs" />
          {isConnected ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              Bağlı ✓
            </span>
          ) : (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">
              Hazır
            </span>
          )}
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-slate-900">Telegram Kanalı</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            OAuth yerine bot token ile bağlanır — @BotFather&apos;dan bir bot oluşturup kanalına yönetici olarak ekle.
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3.5">
        {isConnected ? (
          <span className="text-xs font-semibold text-slate-400">Aktif ve yetkilendirildi</span>
        ) : !open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Telegram Kanalı Bağla →
          </button>
        ) : (
          <form onSubmit={handleConnect} className="space-y-2">
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="Bot token (@BotFather'dan)"
              required
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
            />
            <input
              type="text"
              value={channelUsername}
              onChange={(e) => setChannelUsername(e.target.value)}
              placeholder="Kanal kullanıcı adı (ör. tentamark)"
              required
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
            />
            {error && <p className="text-[11px] text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Bağlanıyor..." : "Bağla"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Canva is a design tool, not a publish target, so it isn't in
// AVAILABLE_INTEGRATIONS/social_accounts at all — its connection lives in
// its own canva_connections table (see useCanvaConnection). A full-page
// OAuth redirect (like every card above except Telegram) means this
// component simply remounts with the right state after connecting; no
// onConnected plumbing needed the way Telegram's inline form requires.
function CanvaConnectCard({ brandId }: { brandId: string }) {
  const { connected, loading } = useCanvaConnection(brandId);

  return (
    <div className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-black text-white shadow-xs">
            C
          </div>
          {connected ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              Bağlı ✓
            </span>
          ) : (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">
              Hazır
            </span>
          )}
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-slate-900">Canva</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Medya kütüphanesinden doğrudan Canva&apos;da tasarım açın, bitirince görsel otomatik gönderinize aktarılır.
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3.5">
        {connected ? (
          <span className="text-xs font-semibold text-slate-400">Aktif ve yetkilendirildi</span>
        ) : loading ? (
          <span className="text-xs font-semibold text-slate-300">Kontrol ediliyor...</span>
        ) : (
          <a
            href="/api/canva/connect/start"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            Canva&apos;yı Bağla →
          </a>
        )}
      </div>
    </div>
  );
}

function SettingsPageContent() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const param = searchParams.get("tab");
    return (["genel", "plan", "ekip", "bildirimler", "baglantilar"] as const).includes(param as SettingsTab)
      ? (param as SettingsTab)
      : "genel";
  });
  const [savedNotice, setSavedNotice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // General settings state — loaded from the real session/profile, not hardcoded
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [timezone, setTimezone] = useState(brand.timezone || "Europe/Istanbul");

  // Notifications — preferences UI only; nothing sends real emails yet (no
  // cron/email infra exists), so these intentionally aren't persisted or
  // claimed as "saved" anywhere.
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [publishAlerts, setPublishAlerts] = useState(true);

  // Bağlantılar — ported from the old standalone /dashboard/connections
  // page. That page was a server component with an inline "use server"
  // disconnect action; this tab does the same work with the regular
  // client Supabase calls already used everywhere else on this page.
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsRefreshKey, setAccountsRefreshKey] = useState(0);
  const connectedParam = searchParams.get("connected");
  const connectErrorParam = searchParams.get("connect_error");

  // Team management — organizationId/myRole resolved from the session, never
  // trusted from anywhere else, so every write below is naturally scoped to
  // the caller's own org via the same query that decides what UI to show.
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<string>("member");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [teamRefreshKey, setTeamRefreshKey] = useState(0);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);
  const [teamActionError, setTeamActionError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isOwner = myRole === "owner";

  useEffect(() => {
    let ignore = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || ignore) return;

      setUserId(user.id);
      setEmail(user.email ?? "");

      const [{ data: profile }, { data: membership }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("organization_members").select("role, organization_id").eq("user_id", user.id).limit(1).maybeSingle(),
      ]);
      if (ignore) return;

      setUserName(profile?.full_name ?? "");
      setMyRole(membership?.role ?? "member");
      setOrganizationId(membership?.organization_id ?? null);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  useEffect(() => {
    if (!organizationId) return;
    let ignore = false;
    (async () => {
      const { data: memberRows } = await supabase
        .from("organization_members")
        .select("id, user_id, role, profiles(full_name, email)")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: true });
      if (ignore) return;

      setMembers(
        (memberRows ?? []).map((m) => {
          const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
          return {
            id: m.id,
            userId: m.user_id,
            role: m.role,
            name: p?.full_name || p?.email?.split("@")[0] || "Kullanıcı",
            email: p?.email ?? "",
          };
        })
      );

      // Only owners can see pending invites (RLS) — for anyone else this
      // simply comes back empty, which is exactly what we want to show.
      const { data: inviteRows } = await supabase
        .from("organization_invites")
        .select("id, email, role, token, expires_at")
        .eq("organization_id", organizationId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (ignore) return;
      setInvites((inviteRows ?? []) as TeamInvite[]);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, organizationId, teamRefreshKey]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!organizationId || !userId || !inviteEmail.trim() || inviting) return;
    setInviting(true);
    setInviteError(null);
    setNewInviteLink(null);

    const { data, error } = await supabase
      .from("organization_invites")
      .insert({
        organization_id: organizationId,
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        invited_by: userId,
      })
      .select("token")
      .single();

    setInviting(false);
    if (error || !data) {
      setInviteError(error?.message ?? "Davet oluşturulamadı.");
      return;
    }
    setNewInviteLink(`${window.location.origin}/davet/${data.token}`);
    setInviteEmail("");
    setTeamRefreshKey((k) => k + 1);
  }

  async function handleRevokeInvite(id: string) {
    setInvites((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("organization_invites").delete().eq("id", id);
  }

  async function handleChangeRole(memberId: string, role: string) {
    setTeamActionError(null);
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)));
    const { error } = await supabase.from("organization_members").update({ role }).eq("id", memberId);
    if (error) {
      setTeamActionError(error.message);
      setTeamRefreshKey((k) => k + 1);
    }
  }

  async function handleRemoveMember(memberId: string) {
    setTeamActionError(null);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    const { error } = await supabase.from("organization_members").delete().eq("id", memberId);
    if (error) {
      setTeamActionError(error.message);
      setTeamRefreshKey((k) => k + 1);
    }
  }

  useEffect(() => {
    let ignore = false;
    (async () => {
      setAccountsLoading(true);
      const { data } = await supabase
        .from("social_accounts")
        .select("id, platform, username, display_name, avatar_url, status, last_health_check_at")
        .eq("brand_id", brand.id)
        .order("created_at", { ascending: true });
      if (ignore) return;
      setAccounts((data ?? []) as ConnectedAccount[]);
      setAccountsLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id, accountsRefreshKey]);

  async function handleDisconnect(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    const { error } = await supabase.from("social_accounts").delete().eq("id", id);
    if (error) setAccountsRefreshKey((k) => k + 1);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setSaveError(null);

    const [{ error: profileError }, { error: brandError }] = await Promise.all([
      supabase.from("profiles").update({ full_name: userName.trim() || null }).eq("id", userId),
      supabase.from("brands").update({ timezone }).eq("id", brand.id),
    ]);

    setSaving(false);
    if (profileError || brandError) {
      setSaveError("Kaydedilemedi, lütfen tekrar deneyin.");
      return;
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  }

  async function handleSignOut() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
      await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
    } catch (err) {
      console.error("Çıkış yapılırken hata:", err);
    } finally {
      window.location.href = "/giris";
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Ayarlar & Organizasyon
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Hesap tercihlerinizi, abonelik planınızı, bildirimleri ve ekip üyelerinizi yönetin.
        </p>
      </div>

      {/* 2. Subnav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {[
          { key: "genel", label: "Genel Tercihler", icon: "⚙️" },
          { key: "plan", label: "Abonelik & Plan", icon: "💎" },
          { key: "ekip", label: "Ekip Üyeleri", icon: "👥" },
          { key: "baglantilar", label: "Bağlantılar", icon: "🔗" },
          { key: "bildirimler", label: "Bildirimler", icon: "🔔" },
        ].map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key as SettingsTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-slate-900 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {/* TAB 1: GENEL TERCİHLER */}
      {activeTab === "genel" && (
        <div className="space-y-6">
          <form onSubmit={handleSave} className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
            <h3 className="font-display text-base font-bold text-slate-900">Kullanıcı & Bölge Ayarları</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  title="E-posta adresini değiştirmek için giriş yaptığınız e-posta ile destek@tentamark.com adresine yazın"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Saat Dilimi
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                >
                  <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Panel Dili
                </label>
                <select
                  value="tr"
                  disabled
                  title="Çoklu dil desteği yakında"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                >
                  <option value="tr">Türkçe (Yakında: diğer diller)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={saving || !userId}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Kaydediliyor..." : "Tercihleri Kaydet"}
              </button>

              {savedNotice && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span>✓</span> Ayarlar başarıyla kaydedildi!
                </span>
              )}
              {saveError && (
                <span className="text-xs font-semibold text-red-600">{saveError}</span>
              )}
            </div>
          </form>

          {/* Aktif Oturum ve Güvenlik / Çıkış Yap Card */}
          <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <HiOutlineShieldCheck className="h-5 w-5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Aktif Oturum ve Güvenlik</h3>
                  <p className="text-xs text-slate-500">Mevcut tarayıcı oturumunuzu görüntüleyin ve yönetin</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 w-fit">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Korumalı Oturum (Aktif)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Oturum Açılan E-posta</span>
                <p className="text-xs font-bold text-slate-800 font-mono truncate">{email || "—"}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Yetki / Rol</span>
                <p className="text-xs font-bold text-slate-800">{myRole === "owner" ? "Organizasyon Sahibi" : myRole === "admin" ? "Yönetici" : "Üye"}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Oturum Tipi</span>
                <p className="text-xs font-bold text-slate-800">Şifreli JWT / SSL</p>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">Hesap Oturumunu Kapat</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                  Bu tarayıcıdaki tüm oturum anahtarlarını güvenle temizler ve giriş ekranına yönlendirir. Ortak veya herkese açık bilgisayarlarda işiniz bittiğinde oturumu kapatmanız önerilir.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-[#FA5252] hover:text-white hover:border-[#FA5252] shadow-2xs transition shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <HiOutlineArrowRightOnRectangle className="h-4 w-4 stroke-[2]" />
                )}
                <span>{isLoggingOut ? "Çıkış Yapılıyor..." : "Oturumu Kapat"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLAN & ABONELİK */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-100">
                  Mevcut Plan
                </span>
                <h3 className="font-display text-2xl font-bold text-slate-900 mt-2">
                  Tentamark Pro Plan
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fatura ve yenileme yönetimi yakında burada aktif olacak.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                >
                  Fatura Geçmişi (Yakında)
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-500 cursor-not-allowed"
                >
                  Planı Yükselt (Yakında)
                </button>
              </div>
            </div>

            {/* Plan limits */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500">AI Gönderi Üretimi</span>
                <div className="text-sm font-bold text-slate-900">100 gönderi / ay</div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500">Görsel Üretim Motoru</span>
                <div className="text-sm font-bold text-slate-900">50 görsel / ay</div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500">Bağlı Sosyal Kanallar</span>
                <div className="text-sm font-bold text-slate-900">10 kanal</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Kullanım takibi yakında aktif olacak — şu an yalnızca plan limitleriniz gösteriliyor.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: EKİP ÜYELERİ */}
      {activeTab === "ekip" && (
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-display text-base font-bold text-slate-900">Ekip ve İzinler</h3>
              <p className="text-xs text-slate-400">{brand.name} panosuna erişimi olan kullanıcılar</p>
            </div>

            {teamActionError && <p className="text-xs font-semibold text-red-600">{teamActionError}</p>}

            <div className="divide-y divide-slate-100">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-xs text-slate-700">
                      {m.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                      <p className="text-[11px] text-slate-400">{m.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isOwner && m.userId !== userId && m.role !== "owner" ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleChangeRole(m.id, e.target.value)}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 focus:border-slate-400 focus:outline-none"
                      >
                        <option value="admin">Yönetici (Admin)</option>
                        <option value="member">Üye</option>
                      </select>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        {ROLE_LABEL[m.role] ?? m.role}
                      </span>
                    )}

                    {isOwner && m.userId !== userId && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id)}
                        title="Ekipten çıkar"
                        className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isOwner && (
            <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
              <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-4">
                Yeni Üye Davet Et
              </h3>

              <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">E-posta</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="ekip.arkadasi@ornek.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Rol</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none sm:w-40"
                  >
                    <option value="member">Üye</option>
                    <option value="admin">Yönetici (Admin)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
                >
                  {inviting ? "Oluşturuluyor..." : "Davet Bağlantısı Oluştur"}
                </button>
              </form>

              {inviteError && <p className="text-xs font-semibold text-red-600">{inviteError}</p>}

              {newInviteLink && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900">
                  <span className="flex-1 truncate font-mono">{newInviteLink}</span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(newInviteLink)}
                    className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Kopyala
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-400 italic">
                Bu bağlantıyı kendin paylaşıyorsun (WhatsApp, e-posta vb.) — otomatik e-posta gönderimi henüz yok.
                Bağlantı 14 gün geçerlidir ve yalnızca bu davetin gönderildiği e-posta ile kabul edilebilir.
              </p>

              {invites.length > 0 && (
                <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
                  {invites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{inv.email}</span>
                        <span className="ml-2 text-slate-400">{ROLE_LABEL[inv.role] ?? inv.role} · bekliyor</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/davet/${inv.token}`)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                        >
                          Bağlantıyı Kopyala
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevokeInvite(inv.id)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          İptal Et
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BİLDİRİMLER */}
      {activeTab === "bildirimler" && (
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            E-posta ve Sistem Bildirimleri
          </h3>

          <div className="space-y-4">
            <label className="flex items-start justify-between cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
              <div>
                <p className="text-xs font-bold text-slate-900">Yayınlama ve Zamanlama Uyarıları</p>
                <p className="text-[11px] text-slate-500">Gönderileriniz başarıyla yayınlandığında veya onay beklediğinde bildirim alın.</p>
              </div>
              <input
                type="checkbox"
                checked={publishAlerts}
                onChange={(e) => setPublishAlerts(e.target.checked)}
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-800">Haftalık Performans Özeti</p>
                <p className="text-[11px] text-slate-400">
                  Her Pazartesi sabahı haftalık etkileşim ve takipçi büyümesi raporu al.
                </p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
            </label>

            <label className="flex items-start justify-between cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
              <div>
                <p className="text-xs font-bold text-slate-900">AI Büyüme Önerileri</p>
                <p className="text-[11px] text-slate-500">Algoritmada yeni bir kitle fırsatı yakalandığında hemen haberdar olun.</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: BAĞLANTILAR — ported from the old standalone
          /dashboard/connections page. */}
      {activeTab === "baglantilar" && (
        <div className="space-y-6">
          {connectedParam && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <span>✓</span>
              <span>Sosyal medya hesabı başarıyla bağlandı ve kullanıma hazır!</span>
            </div>
          )}
          {connectErrorParam && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
              <span>✕</span>
              <span>{connectErrorMessage(connectErrorParam)}</span>
            </div>
          )}

          <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">Aktif Bağlantılar</h3>
                <p className="text-xs text-slate-400">Halihazırda bağlı ve yetkilendirilmiş hesaplar</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                {accounts.length} Hesap Bağlı
              </span>
            </div>

            {accountsLoading ? (
              <p className="py-8 text-center text-xs text-slate-400">Yükleniyor...</p>
            ) : accounts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">Henüz bağlı bir sosyal medya hesabı bulunmuyor.</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Aşağıdaki entegrasyon kartlarını kullanarak hesaplarınızı birkaç tıkla bağlayabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                    <div className="flex items-center gap-3">
                      {acc.avatar_url ? (
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200">
                          <Image src={acc.avatar_url} alt="" fill className="object-cover" />
                        </div>
                      ) : (
                        <PlatformIcon name={acc.platform as PlatformName} className="h-10 w-10 rounded-xl" />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{acc.display_name ?? acc.username}</h4>
                        <p className="text-[11px] text-slate-400">
                          {platformLabel(acc.platform as PlatformName)} · Durum:{" "}
                          <span className={accountStatusLabel(acc.status).className}>
                            {accountStatusLabel(acc.status).text}
                          </span>
                          {acc.last_health_check_at && (
                            <span> · Son Senkron: {new Date(acc.last_health_check_at).toLocaleDateString("tr-TR")}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDisconnect(acc.id)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-red-200 hover:text-red-600 transition cursor-pointer"
                    >
                      Bağlantıyı Kes
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">Kullanılabilir Entegrasyonlar</h3>
              <p className="text-xs text-slate-500">Hesaplarınızı bağlayarak AI ile tek tıkla doğrudan yayınlayın.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AVAILABLE_INTEGRATIONS.map((item) => {
                const isConnected = accounts.some((a) => a.platform === item.icon && a.status === "active");
                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <PlatformIcon name={item.icon} className="h-9 w-9 rounded-xl shadow-xs" />
                        {isConnected ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            Bağlı ✓
                          </span>
                        ) : item.available ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">
                            Hazır
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                            Çok Yakında
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-display text-sm font-bold text-slate-900">{item.name}</h4>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-3.5">
                      {isConnected ? (
                        <span className="text-xs font-semibold text-slate-400">Aktif ve yetkilendirildi</span>
                      ) : item.available ? (
                        <a
                          href={item.href}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
                        >
                          {item.name} Hesabını Bağla →
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                        >
                          Entegrasyon Yakında
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <TelegramConnectCard
                isConnected={accounts.some((a) => a.platform === "telegram" && a.status === "active")}
                onConnected={() => setAccountsRefreshKey((k) => k + 1)}
              />

              <CanvaConnectCard brandId={brand.id} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">Yükleniyor...</div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
