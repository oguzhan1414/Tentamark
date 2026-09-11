"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrand } from "@/components/dashboard/BrandProvider";
import { createClient } from "@/lib/supabase/client";

type SettingsTab = "genel" | "plan" | "ekip" | "bildirimler";

const ROLE_LABEL: Record<string, string> = {
  owner: "Sahip (Owner)",
  admin: "Yönetici (Admin)",
  member: "Üye",
};

export default function SettingsPage() {
  const brand = useBrand();
  const supabase = useMemo(() => createClient(), []);

  const [activeTab, setActiveTab] = useState<SettingsTab>("genel");
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

  const [teamMember, setTeamMember] = useState<{ name: string; email: string; role: string } | null>(null);

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
        supabase.from("organization_members").select("role").eq("user_id", user.id).limit(1).maybeSingle(),
      ]);
      if (ignore) return;

      const name = profile?.full_name || user.email?.split("@")[0] || "Kullanıcı";
      setUserName(profile?.full_name ?? "");
      setTeamMember({
        name,
        email: user.email ?? "",
        role: ROLE_LABEL[membership?.role ?? ""] ?? "Üye",
      });
    })();
    return () => {
      ignore = true;
    };
  }, [supabase]);

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
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
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
              className="rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-50"
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
      )}

      {/* TAB 2: PLAN & ABONELİK */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
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
                  className="rounded-xl bg-indigo-200 px-4 py-2 text-xs font-bold text-white cursor-not-allowed"
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
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Ekip ve İzinler</h3>
              <p className="text-xs text-slate-400">{brand.name} panosuna erişimi olan kullanıcılar</p>
            </div>

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-400 cursor-not-allowed"
              disabled
              title="Ekip daveti henüz canlı değil"
            >
              + Yeni Üye Davet Et (Yakında)
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {teamMember && (
              <div className="flex items-center justify-between py-3.5 first:pt-1 last:pb-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-xs text-slate-700">
                    {teamMember.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{teamMember.name}</h4>
                    <p className="text-[11px] text-slate-400">{teamMember.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                    {teamMember.role}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    Aktif
                  </span>
                </div>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Birden fazla ekip üyesi davet etme özelliği yakında aktif olacak.
          </p>
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
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-start justify-between cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
              <div>
                <p className="text-xs font-bold text-slate-900">Haftalık Performans Özeti (Digest)</p>
                <p className="text-[11px] text-slate-500">Pazartesi sabahları haftalık erişim ve etkileşim özetini e-posta ile alın.</p>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
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
                className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>
      )}

    </div>
  );
}
