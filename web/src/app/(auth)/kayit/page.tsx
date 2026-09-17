"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TentamarkIcon } from "@/components/TentamarkLogo";

import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setErrorMsg("Lütfen kullanım koşullarını kabul edin.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            brand_name: brand,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data?.user && !data?.session) {
        setSuccessMsg(
          "Hesabınız başarıyla oluşturuldu! Lütfen gelen kutunuzu (veya spam klasörünü) kontrol edip onay linkine tıklayın. Ardından giriş yapabilirsiniz."
        );
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Sign up error:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
      }
    } catch {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] text-white">
      {/* ================= LEFT SIDE: REGISTRATION FORM (CENTERED) ================= */}
      <div className="relative flex w-full flex-col justify-between px-6 py-8 sm:px-10 lg:w-1/2 bg-[#0c0d10] z-20">
        {/* Top: Logo & Back Link */}
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <TentamarkIcon size={32} variant="white" />
            </span>
            <span className="font-body text-xl font-bold tracking-[-0.04em] text-white">
              Tentamark
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            <span>←</span>
            <span>Ana Sayfa</span>
          </Link>
        </div>

        {/* Center: Form Area (Centered with mx-auto) */}
        <div className="my-auto mx-auto w-full max-w-md py-8">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hesabınızı oluşturun
            </h1>
            <p className="mt-2 font-body text-sm text-white/50">
              Markanızı bağlayın, yapay zeka içerik yöneticiniz dakikalar içinde stratejinizi kursun.
            </p>
          </div>

          {/* Google One-Click Register - Clean obsidian button with NO white border */}
          <div className="mt-7">
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#15171f] px-4 py-3 font-body text-sm font-medium text-white/90 shadow-[0_2px_10px_rgba(0,0,0,0.3)] transition-all hover:bg-[#1a1d27] hover:text-white active:scale-[0.99] disabled:opacity-60"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.95 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google ile Hızlı Başla</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full border-t border-white/[0.06]" />
            <span className="absolute bg-[#0c0d10] px-3 font-mono text-[11px] uppercase tracking-wider text-white/30">
              veya e-posta ile kayıt olun
            </span>
          </div>

          {/* Error & Success message banners */}
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-body text-red-400">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-center text-xs font-body text-emerald-300 leading-relaxed">
              {successMsg}
            </div>
          )}

          {/* Register Form - Soft dark inputs with NO harsh white borders */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label htmlFor="reg-name" className="block font-body text-xs font-medium text-white/70">
                  Ad Soyad
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  className="mt-1.5 w-full rounded-xl bg-[#13151c] px-3.5 py-2.5 font-body text-sm text-white placeholder:text-white/25 transition-all focus:bg-[#171922] focus:ring-1.5 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="reg-brand" className="block font-body text-xs font-medium text-white/70">
                  Marka / Şirket Adı
                </label>
                <input
                  id="reg-brand"
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Acme Co."
                  className="mt-1.5 w-full rounded-xl bg-[#13151c] px-3.5 py-2.5 font-body text-sm text-white placeholder:text-white/25 transition-all focus:bg-[#171922] focus:ring-1.5 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block font-body text-xs font-medium text-white/70">
                İş E-postası
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmet@marka.com"
                className="mt-1.5 w-full rounded-xl bg-[#13151c] px-4 py-2.5 font-body text-sm text-white placeholder:text-white/25 transition-all focus:bg-[#171922] focus:ring-1.5 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block font-body text-xs font-medium text-white/70">
                Şifre
              </label>
              <div className="relative mt-1.5">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  className="w-full rounded-xl bg-[#13151c] px-4 py-2.5 pr-10 font-body text-sm text-white placeholder:text-white/25 transition-all focus:bg-[#171922] focus:ring-1.5 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white transition-colors"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded bg-[#13151c] border-0 text-blue-600 focus:ring-blue-500/30"
              />
              <label htmlFor="terms" className="font-body text-xs text-white/60 select-none leading-relaxed">
                <span>Tentamark </span>
                <a href="#" className="text-blue-400 hover:underline">Kullanım Koşulları</a>
                <span> ve </span>
                <a href="#" className="text-blue-400 hover:underline">Gizlilik Politikasını</a>
                <span> kabul ediyorum.</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3.5 font-body text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Hesabınız hazırlanıyor...
                </span>
              ) : (
                <>
                  <span>Ücretsiz Hesabımı Oluştur ve Başla</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-7 text-center">
            <p className="font-body text-xs text-white/50">
              Zaten bir hesabınız var mı?{" "}
              <Link href="/giris" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info (Centered) */}
        <div className="mx-auto flex w-full max-w-md flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-4 text-[11px] font-mono text-white/30">
          <span>Tentamark AI Marketing Manager</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-white transition-colors">Şartlar</a>
            <a href="#" className="hover:text-white transition-colors">Yardım</a>
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE: PURE VIDEO WITH SOFT DIRECTIONAL BLEND ================= */}
      <div className="relative hidden w-1/2 overflow-hidden bg-black lg:block">
        {/* Soft edge fade transition: seamlessly melts black background into the video */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-36 bg-gradient-to-r from-[#0c0d10] via-[#0c0d10]/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-black/30" />
        
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover object-center"
        >
          <source src="/video/register.mp4" type="video/mp4" />
          <source src="/video/video.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
