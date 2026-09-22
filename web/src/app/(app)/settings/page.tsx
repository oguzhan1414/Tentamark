"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { getBrandTeam } from "@/lib/brandTeam";
import { getUpcomingHolidayForCountry } from "@/lib/calendar/marketingHolidays";
import { createClient } from "@/lib/supabase/client";
import PlatformIcon, { platformLabel, type PlatformName } from "@/components/PlatformIcon";
import { useCanvaConnection } from "@/lib/canva/useCanvaConnection";
import { useWooCommerceConnection } from "@/lib/woocommerce/useWooCommerceConnection";
import { useLanguage } from "@/context/LanguageContext";
import { HiOutlineShieldCheck, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import DeveloperAccessTab from "@/components/dashboard/settings/DeveloperAccessTab";
import ConfirmDiscardDialog from "@/components/dashboard/ConfirmDiscardDialog";

type SettingsTab = "genel" | "plan" | "ekip" | "bildirimler" | "baglantilar" | "gelistirici";

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

function accountStatusLabel(
  status: string,
  labels: { active: string; needs_reauth: string; disconnected: string }
): { text: string; className: string } {
  switch (status) {
    case "active":
      return { text: labels.active, className: "font-semibold text-emerald-600" };
    case "needs_reauth":
      return { text: labels.needs_reauth, className: "font-semibold text-amber-600" };
    case "disconnected":
      return { text: labels.disconnected, className: "font-semibold text-red-600" };
    default:
      return { text: status, className: "font-semibold text-slate-500" };
  }
}

function connectErrorMessage(code: string, isEn: boolean) {
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

  if (isEn) {
    switch (reason) {
      case "denied":
        return "Connection was cancelled.";
      case "state":
        return "Security verification failed, please try again.";
      case "token":
        return `Could not establish connection with ${provider}.`;
      case "pages":
        return "Could not retrieve your pages.";
      case "no-pages":
        return "No Facebook Page found linked to your account — please create a Page first.";
      case "no-board":
        return "No board found in your Pinterest account and could not create one automatically.";
      case "no-channel":
        return "No YouTube channel found associated with this Google account.";
      case "no-refresh-token":
        return "Google did not grant the required permissions — please retry and re-authorize.";
      case "config":
        return `${provider} connection is not configured yet.`;
      case "save":
        return "Account was verified but could not be saved to the database.";
      default:
        return "An error occurred during connection.";
    }
  }

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
  const { t, locale } = useLanguage();
  const c = t.dashboard.settings.integrationCards.telegram;
  const conn = t.dashboard.settings.connectionsTab;

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
      if (!res.ok) throw new Error(data.error || (locale === "en" ? "Could not connect." : "Bağlantı kurulamadı."));
      setBotToken("");
      setChannelUsername("");
      setOpen(false);
      onConnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : (locale === "en" ? "Could not connect." : "Bağlantı kurulamadı."));
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
              {conn.connectedBadge}
            </span>
          ) : (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">
              {conn.readyBadge}
            </span>
          )}
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-slate-900">{c.title}</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {c.desc}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3.5">
        {isConnected ? (
          <span className="text-xs font-semibold text-slate-400">{conn.statusActive}</span>
        ) : !open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            {c.connectBtn}
          </button>
        ) : (
          <form onSubmit={handleConnect} className="space-y-2">
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder={c.tokenPlaceholder}
              required
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
            />
            <input
              type="text"
              value={channelUsername}
              onChange={(e) => setChannelUsername(e.target.value)}
              placeholder={c.channelPlaceholder}
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
                {conn.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? conn.connecting : conn.connect}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function BlueskyConnectCard({ isConnected, onConnected }: { isConnected: boolean; onConnected: () => void }) {
  const { t, locale } = useLanguage();
  const c = t.dashboard.settings.integrationCards.bluesky;
  const conn = t.dashboard.settings.connectionsTab;

  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/connections/bluesky/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle, appPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (locale === "en" ? "Could not connect." : "Bağlantı kurulamadı."));
      setHandle("");
      setAppPassword("");
      setOpen(false);
      onConnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : (locale === "en" ? "Could not connect." : "Bağlantı kurulamadı."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <PlatformIcon name="bluesky" className="h-9 w-9 rounded-xl shadow-xs" />
          {isConnected ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {conn.connectedBadge}
            </span>
          ) : (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">
              {conn.readyBadge}
            </span>
          )}
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-slate-900">{c.title}</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {c.desc}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3.5">
        {isConnected ? (
          <span className="text-xs font-semibold text-slate-400">{conn.statusActive}</span>
        ) : !open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            {c.connectBtn}
          </button>
        ) : (
          <form onSubmit={handleConnect} className="space-y-2">
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={c.handlePlaceholder}
              required
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
            />
            <input
              type="password"
              value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
              placeholder={c.appPasswordPlaceholder}
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
                {conn.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? conn.connecting : conn.connect}
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
  const { t } = useLanguage();
  const c = t.dashboard.settings.integrationCards.canva;
  const conn = t.dashboard.settings.connectionsTab;
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
              {conn.connectedBadge}
            </span>
          ) : (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">
              {conn.readyBadge}
            </span>
          )}
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-slate-900">{c.title}</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {c.desc}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3.5">
        {connected ? (
          <span className="text-xs font-semibold text-slate-400">{conn.statusActive}</span>
        ) : loading ? (
          <span className="text-xs font-semibold text-slate-300">{conn.statusChecking}</span>
        ) : (
          <a
            href="/api/canva/connect/start"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition"
          >
            {c.connectBtn}
          </a>
        )}
      </div>
    </div>
  );
}

// WooCommerce has no OAuth either — a Consumer Key/Secret pair the merchant
// generates from their own WooCommerce -> Settings -> Advanced -> REST API,
// same inline-form shape as Telegram/Bluesky. Not a publish target: it's a
// product data source Compose pulls from, see useWooCommerceConnection.
function WooCommerceConnectCard({ brandId }: { brandId: string }) {
  const { t, locale } = useLanguage();
  const c = t.dashboard.settings.integrationCards.woocommerce;
  const conn = t.dashboard.settings.connectionsTab;
  const { connected, storeName, loading } = useWooCommerceConnection(brandId);
  const [open, setOpen] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [consumerKey, setConsumerKey] = useState("");
  const [consumerSecret, setConsumerSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justConnected, setJustConnected] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/connections/woocommerce/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeUrl, consumerKey, consumerSecret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (locale === "en" ? "Could not connect." : "Bağlantı kurulamadı."));
      setStoreUrl("");
      setConsumerKey("");
      setConsumerSecret("");
      setOpen(false);
      // useWooCommerceConnection only fetches once on mount — a full-page
      // OAuth redirect makes the other cards remount for free, but this
      // form-based flow doesn't navigate anywhere, so it needs its own nudge.
      setJustConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : (locale === "en" ? "Could not connect." : "Bağlantı kurulamadı."));
    } finally {
      setSubmitting(false);
    }
  }

  const isConnected = connected || justConnected;

  return (
    <div className="flex flex-col justify-between rounded-[22px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-md transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#96588A] text-sm font-black text-white shadow-xs">
            W
          </div>
          {isConnected ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {conn.connectedBadge}
            </span>
          ) : (
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">
              {conn.readyBadge}
            </span>
          )}
        </div>

        <div>
          <h4 className="font-display text-sm font-bold text-slate-900">{c.title}</h4>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {c.desc}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3.5">
        {isConnected ? (
          <span className="text-xs font-semibold text-slate-400">
            {conn.statusActive}{storeName ? ` · ${storeName}` : ""}
          </span>
        ) : loading ? (
          <span className="text-xs font-semibold text-slate-300">{conn.statusChecking}</span>
        ) : !open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            {c.connectBtn}
          </button>
        ) : (
          <form onSubmit={handleConnect} className="space-y-2">
            <input
              type="text"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              placeholder={c.urlPlaceholder}
              required
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
            />
            <input
              type="text"
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              placeholder="Consumer Key (ck_...)"
              required
              className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
            />
            <input
              type="password"
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
              placeholder="Consumer Secret (cs_...)"
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
                {conn.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? conn.connecting : conn.connect}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SettingsPageContent() {
  const router = useRouter();
  const brand = useBrand();
  const { t, locale } = useLanguage();
  const st = t.dashboard.settings;
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
    const param = searchParams.get("tab");
    return (["genel", "plan", "ekip", "bildirimler", "baglantilar", "gelistirici"] as const).includes(param as SettingsTab)
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
  const [country, setCountry] = useState(brand.country || "tr");

  const [publishAlerts, setPublishAlerts] = useState(true);
  const [notificationPrefError, setNotificationPrefError] = useState<string | null>(null);
  const [notificationPrefSaving, setNotificationPrefSaving] = useState(false);

  // Bağlantılar — ported from the old standalone /dashboard/connections
  // page. That page was a server component with an inline "use server"
  // disconnect action; this tab does the same work with the regular
  // client Supabase calls already used everywhere else on this page.
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsRefreshKey, setAccountsRefreshKey] = useState(0);
  const [disconnectTarget, setDisconnectTarget] = useState<ConnectedAccount | null>(null);
  const connectedParam = searchParams.get("connected");
  const connectErrorParam = searchParams.get("connect_error");
  const noAccountParam = searchParams.get("no_account");

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

  // Workspace (brand) count vs. the org's real, DB-tracked limit
  // (supabase/patches/0034) — the one real number in an otherwise-placeholder
  // Plan tab, since billing itself isn't wired up yet.
  const [workspaceCount, setWorkspaceCount] = useState<number | null>(null);
  const [maxBrands, setMaxBrands] = useState<number | null>(null);

  const isOwner = myRole === "owner";

  const availableIntegrations = useMemo(() => [
    {
      id: "instagram",
      name: st.integrationCards.instagram.name,
      desc: st.integrationCards.instagram.desc,
      icon: "instagram" as PlatformName,
      href: "/api/connections/instagram/start",
      available: true,
    },
    {
      id: "facebook",
      name: st.integrationCards.facebook.name,
      desc: st.integrationCards.facebook.desc,
      icon: "facebook" as PlatformName,
      href: "/api/connections/meta/start",
      available: true,
    },
    {
      id: "threads",
      name: st.integrationCards.threads.name,
      desc: st.integrationCards.threads.desc,
      icon: "threads" as PlatformName,
      href: "/api/connections/threads/start",
      available: true,
    },
    {
      id: "linkedin",
      name: st.integrationCards.linkedin.name,
      desc: st.integrationCards.linkedin.desc,
      icon: "linkedin" as PlatformName,
      href: "#",
      available: false,
    },
    {
      id: "x",
      name: st.integrationCards.x.name,
      desc: st.integrationCards.x.desc,
      icon: "x" as PlatformName,
      href: "#",
      available: false,
    },
    {
      id: "tiktok",
      name: st.integrationCards.tiktok.name,
      desc: st.integrationCards.tiktok.desc,
      icon: "tiktok" as PlatformName,
      href: "/api/connections/tiktok/start",
      available: true,
    },
    {
      id: "pinterest",
      name: st.integrationCards.pinterest.name,
      desc: st.integrationCards.pinterest.desc,
      icon: "pinterest" as PlatformName,
      href: "/api/connections/pinterest/start",
      available: true,
    },
    {
      id: "youtube",
      name: st.integrationCards.youtube.name,
      desc: st.integrationCards.youtube.desc,
      icon: "youtube" as PlatformName,
      href: "/api/connections/youtube/start",
      available: true,
    },
  ], [st]);

  const tabItems = useMemo(() => [
    { key: "genel" as const, label: st.tabs.general, icon: "⚙️" },
    { key: "plan" as const, label: st.tabs.plan, icon: "💎" },
    { key: "ekip" as const, label: st.tabs.team, icon: "👥" },
    { key: "baglantilar" as const, label: st.tabs.connections, icon: "🔗" },
    { key: "gelistirici" as const, label: locale === "en" ? "Developer" : "Geliştirici", icon: "🧩" },
    { key: "bildirimler" as const, label: st.tabs.notifications, icon: "🔔" },
  ], [st, locale]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || ignore) return;

      setUserId(user.id);
      setEmail(user.email ?? "");

      const [{ data: profile }, { data: activeBrand }, { data: notificationPreferences }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("brands").select("organization_id").eq("id", brand.id).maybeSingle(),
        supabase.from("notification_preferences").select("publish_alerts").eq("user_id", user.id).maybeSingle(),
      ]);
      const { data: membership } = activeBrand
        ? await supabase.from("organization_members").select("role, organization_id")
          .eq("user_id", user.id).eq("organization_id", activeBrand.organization_id).maybeSingle()
        : { data: null };
      const { data: brandGrant } = await supabase.from("brand_memberships")
        .select("role").eq("brand_id", brand.id).eq("user_id", user.id).maybeSingle();
      if (ignore) return;

      setUserName(profile?.full_name ?? "");
      setMyRole(membership?.role === "owner" ? "owner" : brandGrant?.role ?? "member");
      setOrganizationId(membership?.organization_id ?? null);
      setPublishAlerts(notificationPreferences?.publish_alerts ?? true);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, brand.id]);

  useEffect(() => {
    if (!organizationId) return;
    let ignore = false;
    (async () => {
      const [{ data: org }, { count }] = await Promise.all([
        supabase.from("organizations").select("max_brands").eq("id", organizationId).maybeSingle(),
        supabase.from("brands").select("id", { count: "exact", head: true }).eq("organization_id", organizationId),
      ]);
      if (ignore) return;
      setMaxBrands(org?.max_brands ?? 1);
      setWorkspaceCount(count ?? 0);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    let ignore = false;
    (async () => {
      try {
        const team = await getBrandTeam(supabase, brand.id);
        if (!ignore) setMembers(team);
      } catch (error) {
        if (!ignore) setTeamActionError(error instanceof Error ? error.message : "Ekip yüklenemedi.");
      }
      if (ignore) return;

      // Only owners can see pending invites (RLS) — for anyone else this
      // simply comes back empty, which is exactly what we want to show.
      const { data: inviteRows } = await supabase
        .from("organization_invites")
        .select("id, email, role, token, expires_at")
        .eq("organization_id", organizationId)
        .eq("brand_id", brand.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (ignore) return;
      setInvites((inviteRows ?? []) as TeamInvite[]);
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, organizationId, brand.id, teamRefreshKey]);

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
        brand_id: brand.id,
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        invited_by: userId,
      })
      .select("token")
      .single();

    setInviting(false);
    if (error || !data) {
      setInviteError(error?.message ?? st.teamTab.inviteError);
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
    const { error } = await supabase.from("brand_memberships").update({ role }).eq("id", memberId).eq("brand_id", brand.id);
    if (error) {
      setTeamActionError(error.message);
      setTeamRefreshKey((k) => k + 1);
    }
  }

  async function handleRemoveMember(memberId: string) {
    setTeamActionError(null);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    const { error } = await supabase.from("brand_memberships").delete().eq("id", memberId).eq("brand_id", brand.id);
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

  async function performDisconnect(id: string) {
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
      supabase.from("brands").update({ timezone, country }).eq("id", brand.id).select("id").single(),
    ]);

    if (profileError || brandError) {
      setSaving(false);
      setSaveError(st.generalForm.saveError);
      return;
    }
    if (country !== (brand.country || "tr")) {
      const { error: clearError } = await supabase.from("notifications").delete()
        .eq("brand_id", brand.id).eq("user_id", userId).eq("type", "holiday_upcoming");
      if (clearError) console.warn("Could not clear old holiday notification:", clearError);
      const holiday = getUpcomingHolidayForCountry(country);
      if (holiday) {
        const { error: notificationError } = await supabase.from("notifications").insert({
          brand_id: brand.id,
          user_id: userId,
          category: "calendar",
          type: "holiday_upcoming",
          title: `${holiday.flag} Yaklaşan Özel Gün: ${holiday.name}`,
          message: `${holiday.name} (${holiday.tag}) yaklaşıyor. ${holiday.advice}`,
          link: "/dashboard/calendar",
          action_label: "Takvimde Gör",
          is_read: false,
        });
        if (notificationError) console.warn("Could not update holiday notification:", notificationError);
      }
    }
    setSaving(false);
    setSavedNotice(true);
    router.refresh();
    setTimeout(() => setSavedNotice(false), 3000);
  }

  async function savePublishAlerts(nextValue: boolean) {
    if (!userId || notificationPrefSaving) return;
    const previousValue = publishAlerts;
    setPublishAlerts(nextValue);
    setNotificationPrefSaving(true);
    setNotificationPrefError(null);
    const { error } = await supabase.from("notification_preferences")
      .upsert({ user_id: userId, publish_alerts: nextValue }, { onConflict: "user_id" });
    setNotificationPrefSaving(false);
    if (error) {
      setPublishAlerts(previousValue);
      setNotificationPrefError("Bildirim tercihi kaydedilemedi. Tekrar deneyin.");
    }
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
      router.replace("/giris");
      router.refresh();
    }
  }

  function getRoleText(role: string) {
    if (role === "owner") return st.roles.owner;
    if (role === "admin") return st.roles.admin;
    return st.roles.member;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {st.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          {st.subtitle}
        </p>
      </div>

      {/* 2. Subnav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {tabItems.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                active
                  ? "bg-slate-900 text-white shadow-xs"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {/* TAB 1: GENEL TERCİHLER */}
      {activeTab === "genel" && (
        <div className="space-y-6">
          <form onSubmit={handleSave} className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
            <h3 className="font-display text-base font-bold text-slate-900">{st.generalForm.title}</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {st.generalForm.fullName}
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
                  {st.generalForm.email}
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  title={st.generalForm.emailHint}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-market" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {locale === "tr" ? "Hedef pazar takvimi" : "Target market calendar"}
                </label>
                <select id="settings-market" value={country} onChange={(event) => setCountry(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none">
                  <option value="tr">Türkiye</option>
                  <option value="us">United States</option>
                  <option value="eu">Europe-wide campaigns</option>
                  <option value="uk">United Kingdom</option>
                  <option value="global">Global</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  {locale === "tr" ? "Takvimde gösterilen özel günleri belirler; planlama saatini değiştirmez." : "Controls calendar occasions without changing your scheduling time zone."}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {st.generalForm.timezone}
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                >
                  {!["Europe/Istanbul", "Europe/Berlin", "Europe/London", "America/New_York", "America/Los_Angeles", "UTC"].includes(timezone) &&
                    <option value={timezone}>{timezone}</option>}
                  <option value="Europe/Istanbul">Europe/Istanbul</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {st.generalForm.language}
                </label>
                <select
                  value={locale}
                  disabled
                  title={st.generalForm.languageHint}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                >
                  <option value={locale}>{locale === "en" ? "English" : st.generalForm.trOption}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={saving || !userId}
                className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
              >
                {saving ? st.saving : st.save}
              </button>

              {savedNotice && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span>✓</span> {st.saved}
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
                  <h3 className="font-display text-base font-bold text-slate-900">{st.security.title}</h3>
                  <p className="text-xs text-slate-500">{st.security.subtitle}</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 w-fit">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{st.security.protectedSession}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{st.security.email}</span>
                <p className="text-xs font-bold text-slate-800 font-mono truncate">{email || "—"}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{st.security.role}</span>
                <p className="text-xs font-bold text-slate-800">{myRole === "owner" ? st.security.roleOwner : myRole === "admin" ? st.security.roleAdmin : st.security.roleMember}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{st.security.sessionType}</span>
                <p className="text-xs font-bold text-slate-800">{st.security.sessionTypeValue}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">{st.security.logoutTitle}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-xl">
                  {st.security.logoutDesc}
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
                <span>{isLoggingOut ? st.security.loggingOut : st.security.logoutBtn}</span>
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
                  {st.planTab.currentPlan}
                </span>
                <h3 className="font-display text-2xl font-bold text-slate-900 mt-2">
                  {st.planTab.planName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {st.planTab.planDesc}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                >
                  {st.planTab.billingHistorySoon}
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-500 cursor-not-allowed"
                >
                  {st.planTab.upgradePlanSoon}
                </button>
              </div>
            </div>

            {/* Plan limits */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500">{st.planTab.workspaces}</span>
                <div className="text-sm font-bold text-slate-900">
                  {workspaceCount ?? "…"} / {maxBrands ?? "…"} {st.planTab.used}
                </div>
                <Link href="/calisma-alanlari" className="text-[11px] font-semibold text-rose-600 hover:underline">
                  {st.planTab.manage}
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500">{st.planTab.aiPostGen}</span>
                <div className="text-sm font-bold text-slate-900">{st.planTab.postsPerMonth}</div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500">{st.planTab.imageGenEngine}</span>
                <div className="text-sm font-bold text-slate-900">{st.planTab.imagesPerMonth}</div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                <span className="text-xs font-semibold text-slate-500">{st.planTab.connectedChannels}</span>
                <div className="text-sm font-bold text-slate-900">{st.planTab.channelsCount}</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              {st.planTab.limitsNotice}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: EKİP ÜYELERİ */}
      {activeTab === "ekip" && (
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-display text-base font-bold text-slate-900">{st.teamTab.title}</h3>
              <p className="text-xs text-slate-400">{brand.name} {st.teamTab.subtitle}</p>
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
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 focus:border-slate-400 focus:outline-none cursor-pointer"
                      >
                        <option value="admin">{st.teamTab.adminOption}</option>
                        <option value="member">{st.teamTab.memberOption}</option>
                      </select>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        {getRoleText(m.role)}
                      </span>
                    )}

                    {isOwner && m.userId !== userId && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.id)}
                        title={st.teamTab.removeTooltip}
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
                {st.teamTab.inviteTitle}
              </h3>

              <p className="text-xs font-semibold text-slate-600">Bu davet yalnızca {brand.name} markasına erişim verir.</p>
              <form onSubmit={handleInvite} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{st.teamTab.emailLabel}</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder={st.teamTab.emailPlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{st.teamTab.roleLabel}</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-slate-400 focus:outline-none sm:w-40 cursor-pointer"
                  >
                    <option value="member">{st.teamTab.memberOption}</option>
                    <option value="admin">{st.teamTab.adminOption}</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
                >
                  {inviting ? st.teamTab.creatingInvite : st.teamTab.createInviteBtn}
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
                    {st.teamTab.copyBtn}
                  </button>
                </div>
              )}
              <p className="text-[11px] text-slate-400 italic">
                {st.teamTab.inviteNote}
              </p>

              {invites.length > 0 && (
                <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
                  {invites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{inv.email}</span>
                        <span className="ml-2 text-slate-400">{getRoleText(inv.role)} · {st.teamTab.pending}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/davet/${inv.token}`)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                        >
                          {st.teamTab.copyLink}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevokeInvite(inv.id)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                        >
                          {st.teamTab.cancelInvite}
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
            {st.notificationsTab.title}
          </h3>

          <div className="space-y-4">
            <label className="flex items-start justify-between cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
              <div>
                <p className="text-xs font-bold text-slate-900">{st.notificationsTab.publishTitle}</p>
                <p className="text-[11px] text-slate-500">{st.notificationsTab.publishDesc}</p>
              </div>
              <input
                type="checkbox"
                checked={publishAlerts}
                disabled={!userId || notificationPrefSaving}
                onChange={(e) => void savePublishAlerts(e.target.checked)}
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
            </label>

            {notificationPrefError && <p role="alert" className="text-xs text-rose-600">{notificationPrefError}</p>}

            <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 opacity-60">
              <div>
                <p className="text-xs font-semibold text-slate-800">{st.notificationsTab.weeklyTitle}</p>
                <p className="text-[11px] text-slate-400">Yakında — haftalık e-posta özeti henüz etkin değil.</p>
              </div>
              <input
                type="checkbox"
                checked={false}
                disabled
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
            </label>

            <label className="flex items-start justify-between p-3 rounded-xl border border-slate-100 opacity-60">
              <div>
                <p className="text-xs font-bold text-slate-900">{st.notificationsTab.growthTitle}</p>
                <p className="text-[11px] text-slate-500">Yakında — e-posta bildirimleri henüz etkin değil.</p>
              </div>
              <input
                type="checkbox"
                checked={false}
                disabled
                className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: BAĞLANTILAR */}
      {activeTab === "baglantilar" && (
        <div className="space-y-6">
          {connectedParam && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <span>✓</span>
              <span>{st.connectionsTab.connectedSuccess}</span>
            </div>
          )}
          {connectErrorParam && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2">
              <span>✕</span>
              <span>{connectErrorMessage(connectErrorParam, locale === "en")}</span>
            </div>
          )}
          {noAccountParam && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800 flex items-center gap-2">
              <span>ℹ</span>
              <span>{st.connectionsTab.noAccountNotice}</span>
            </div>
          )}

          <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">{st.connectionsTab.activeTitle}</h3>
                <p className="text-xs text-slate-400">{st.connectionsTab.activeDesc}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                {accounts.length} {st.connectionsTab.accountsConnected}
              </span>
            </div>

            {accountsLoading ? (
              <p className="py-8 text-center text-xs text-slate-400">{st.connectionsTab.loading}</p>
            ) : accounts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-xs text-slate-400">{st.connectionsTab.noAccounts}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {st.connectionsTab.noAccountsSub}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {accounts.map((acc) => {
                  const statusInfo = accountStatusLabel(acc.status, st.connectionsTab.statusLabels);
                  return (
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
                            {platformLabel(acc.platform as PlatformName)} · {st.connectionsTab.status}:{" "}
                            <span className={statusInfo.className}>
                              {statusInfo.text}
                            </span>
                            {acc.last_health_check_at && (
                              <span> · {st.connectionsTab.lastSync}: {new Date(acc.last_health_check_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US")}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDisconnectTarget(acc)}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-red-200 hover:text-red-600 transition cursor-pointer"
                      >
                        {st.connectionsTab.disconnect}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">{st.connectionsTab.availableTitle}</h3>
              <p className="text-xs text-slate-500">{st.connectionsTab.availableDesc}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableIntegrations.map((item) => {
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
                            {st.connectionsTab.connectedBadge}
                          </span>
                        ) : item.available ? (
                          <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">
                            {st.connectionsTab.readyBadge}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                            {st.connectionsTab.comingSoonBadge}
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
                        <span className="text-xs font-semibold text-slate-400">{st.connectionsTab.statusActive}</span>
                      ) : item.available ? (
                        <a
                          href={item.href}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
                        >
                          {item.name} {st.connectionsTab.connectAccount}
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                        >
                          {st.connectionsTab.soon}
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

              <BlueskyConnectCard
                isConnected={accounts.some((a) => a.platform === "bluesky" && a.status === "active")}
                onConnected={() => setAccountsRefreshKey((k) => k + 1)}
              />

              <CanvaConnectCard brandId={brand.id} />

              <WooCommerceConnectCard brandId={brand.id} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "gelistirici" && <DeveloperAccessTab isOwner={isOwner} />}

      <ConfirmDiscardDialog
        isOpen={disconnectTarget !== null}
        onCancel={() => setDisconnectTarget(null)}
        onConfirm={() => {
          const acc = disconnectTarget;
          setDisconnectTarget(null);
          if (acc) performDisconnect(acc.id);
        }}
        title={locale === "en" ? "Disconnect this account?" : "Bu hesabın bağlantısı kesilsin mi?"}
        message={
          disconnectTarget
            ? locale === "en"
              ? `Tentamark will stop being able to publish to "${disconnectTarget.display_name ?? disconnectTarget.username}" (${platformLabel(disconnectTarget.platform as PlatformName)}). You can reconnect it later.`
              : `Tentamark, "${disconnectTarget.display_name ?? disconnectTarget.username}" (${platformLabel(disconnectTarget.platform as PlatformName)}) hesabına artık yayın yapamayacak. İstediğin zaman tekrar bağlayabilirsin.`
            : ""
        }
        badgeLabel={locale === "en" ? "Disconnect" : "Bağlantıyı Kes"}
        noticeText=""
        cancelLabel={locale === "en" ? "Cancel" : "Vazgeç"}
        confirmLabel={locale === "en" ? "Disconnect" : "Bağlantıyı Kes"}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">...</div>
      }
    >
      <SettingsPageContent />
    </Suspense>
  );
}
