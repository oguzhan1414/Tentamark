"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type InviteInfo = {
  organization_name: string;
  brand_name: string | null;
  role: string;
  email: string;
  status: string;
  expires_at: string;
};

const ROLE_LABEL: Record<string, string> = { admin: "Yönetici (Admin)", member: "Üye" };

type Phase = "loading" | "invalid" | "match" | "mismatch" | "form" | "accepting" | "done";

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [phase, setPhase] = useState<Phase>("loading");
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const [{ data: inviteRows, error: rpcError }, { data: userData }] = await Promise.all([
        supabase.rpc("resolve_invite", { p_token: token }),
        supabase.auth.getUser(),
      ]);
      if (ignore) return;

      const row = Array.isArray(inviteRows) ? inviteRows[0] : inviteRows;
      if (rpcError || !row) {
        setPhase("invalid");
        return;
      }
      if (row.status !== "pending") {
        setPhase("invalid");
        setErrorMsg(row.status === "accepted" ? "Bu davet zaten kabul edilmiş." : "Bu davet iptal edilmiş.");
        return;
      }
      if (new Date(row.expires_at) < new Date()) {
        setPhase("invalid");
        setErrorMsg("Bu davetin süresi dolmuş. Yeni bir davet bağlantısı iste.");
        return;
      }
      setInvite(row as InviteInfo);

      const email = userData?.user?.email ?? null;
      setSessionEmail(email);
      if (email && email.toLowerCase() === (row as InviteInfo).email.toLowerCase()) {
        setPhase("match");
      } else if (email) {
        setPhase("mismatch");
      } else {
        setPhase("form");
      }
    })();
    return () => {
      ignore = true;
    };
  }, [supabase, token]);

  async function handleAccept() {
    setSubmitting(true);
    setErrorMsg(null);
    const { error } = await supabase.rpc("accept_invite", { p_token: token });
    setSubmitting(false);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setPhase("done");
    setTimeout(() => router.push("/dashboard/calendar"), 1200);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSessionEmail(null);
    setPhase("form");
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invite || submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    setInfoMsg(null);

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: { data: { full_name: name, brand_name: invite.organization_name } },
      });

      if (error) {
        setSubmitting(false);
        if (error.message.toLowerCase().includes("already registered")) {
          setErrorMsg("Bu e-posta ile zaten bir hesabın var.");
          setAuthMode("login");
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data?.user && !data?.session) {
        setSubmitting(false);
        setInfoMsg(
          "Hesabın oluşturuldu! E-postandaki onay linkine tıkla, ardından giriş yap ve bu bağlantıya (linki kaydet) tekrar dön."
        );
        return;
      }

      setSubmitting(false);
      await handleAccept();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: invite.email, password });
    setSubmitting(false);
    if (error) {
      setErrorMsg(error.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : error.message);
      return;
    }
    await handleAccept();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0b] px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl bg-[#0c0d10] p-8 shadow-2xl border border-white/[0.06]">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="font-display text-lg font-bold tracking-tight text-white">Tentamark</span>
        </div>

        {phase === "loading" && <p className="text-sm text-white/50">Davet kontrol ediliyor...</p>}

        {phase === "invalid" && (
          <div className="space-y-3">
            <h1 className="font-display text-xl font-bold">Davet geçerli değil</h1>
            <p className="text-sm text-white/50">{errorMsg || "Bu davet bağlantısı geçersiz."}</p>
            <Link href="/giris" className="inline-block text-sm font-semibold text-blue-400 hover:text-blue-300">
              Giriş sayfasına dön →
            </Link>
          </div>
        )}

        {invite && (phase === "match" || phase === "accepting" || phase === "done") && (
          <div className="space-y-4">
            <h1 className="font-display text-xl font-bold">
              {invite.organization_name} ekibine katıl
            </h1>
            <p className="text-sm text-white/50">
              <span className="font-semibold text-white/80">{invite.email}</span> hesabınla{" "}
              <span className="font-semibold text-white/80">{ROLE_LABEL[invite.role] ?? invite.role}</span> rolüyle davet edildin.
            </p>
            {errorMsg && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">{errorMsg}</p>}
            {phase === "done" ? (
              <p className="text-sm font-semibold text-emerald-400">Katıldın! Panele yönlendiriliyorsun...</p>
            ) : (
              <button
                type="button"
                onClick={handleAccept}
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-60"
              >
                {submitting ? "Katılıyor..." : "Daveti Kabul Et"}
              </button>
            )}
          </div>
        )}

        {invite && phase === "mismatch" && (
          <div className="space-y-3">
            <h1 className="font-display text-xl font-bold">Farklı bir hesapla giriş yapmışsın</h1>
            <p className="text-sm text-white/50">
              Şu an <span className="font-semibold text-white/80">{sessionEmail}</span> ile giriş yapmışsın, ama bu davet{" "}
              <span className="font-semibold text-white/80">{invite.email}</span> için oluşturuldu.
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-xl bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white hover:bg-white/[0.1] transition"
            >
              Çıkış Yap ve Devam Et
            </button>
          </div>
        )}

        {invite && phase === "form" && (
          <div className="space-y-4">
            <h1 className="font-display text-xl font-bold">
              {invite.organization_name} ekibine katıl
            </h1>
            <p className="text-sm text-white/50">
              <span className="font-semibold text-white/80">{invite.email}</span> için{" "}
              <span className="font-semibold text-white/80">{ROLE_LABEL[invite.role] ?? invite.role}</span> daveti — devam etmek için
              hesap oluştur ya da giriş yap.
            </p>

            <div className="flex rounded-lg border border-white/[0.08] p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`flex-1 rounded-md py-1.5 transition ${authMode === "signup" ? "bg-white/10 text-white" : "text-white/40"}`}
              >
                Hesap Oluştur
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`flex-1 rounded-md py-1.5 transition ${authMode === "login" ? "bg-white/10 text-white" : "text-white/40"}`}
              >
                Giriş Yap
              </button>
            </div>

            {errorMsg && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">{errorMsg}</p>}
            {infoMsg && <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">{infoMsg}</p>}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-white/70">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl bg-[#13151c] px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                    placeholder="Ahmet Yılmaz"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-white/70">E-posta</label>
                <input
                  type="email"
                  disabled
                  value={invite.email}
                  className="mt-1.5 w-full cursor-not-allowed rounded-xl bg-[#13151c] px-3.5 py-2.5 text-sm text-white/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70">Şifre</label>
                <input
                  type="password"
                  required
                  minLength={authMode === "signup" ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-[#13151c] px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  placeholder={authMode === "signup" ? "En az 8 karakter" : "Şifren"}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:opacity-60"
              >
                {submitting ? "İşleniyor..." : authMode === "signup" ? "Hesap Oluştur ve Katıl" : "Giriş Yap ve Katıl"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
