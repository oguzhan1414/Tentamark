"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText } from "@/lib/gsap";
import { useLanguage } from "@/context/LanguageContext";
import {
  HiOutlineArrowRight,
  HiOutlinePlay,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import {
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaShopify,
  FaXTwitter,
  FaPinterest,
  FaGoogle,
  FaYoutube,
} from "react-icons/fa6";
import { SiCanva } from "@/components/PlatformIcon";

const CONNECTED_PLATFORMS = [
  { name: "Canva", icon: SiCanva, color: "#00C4CC", bg: "bg-[#00C4CC]/10" },
  { name: "Shopify", icon: FaShopify, color: "#95BF47", bg: "bg-[#95BF47]/10" },
  { name: "Instagram", icon: FaInstagram, color: "#E4405F", bg: "bg-[#E4405F]/10" },
  { name: "TikTok", icon: FaTiktok, color: "#000000", bg: "bg-slate-900/10" },
  { name: "LinkedIn", icon: FaLinkedin, color: "#0A66C2", bg: "bg-[#0A66C2]/10" },
  { name: "X", icon: FaXTwitter, color: "#000000", bg: "bg-slate-900/10" },
  { name: "Pinterest", icon: FaPinterest, color: "#BD081C", bg: "bg-[#BD081C]/10" },
  { name: "Google", icon: FaGoogle, color: "#4285F4", bg: "bg-[#4285F4]/10" },
];

export default function HeroSpotlight() {
  const rootRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".hs-headline", {
          type: "lines",
          mask: "lines",
          linesClass: "hs-line",
        });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from(".hs-eyebrow", { opacity: 0, y: 14, duration: 0.5 })
          .from(split.lines, { opacity: 0, yPercent: 110, duration: 0.75, stagger: 0.08 }, "-=0.25")
          .from(".hs-copy", { opacity: 0, y: 16, duration: 0.6 }, "-=0.4")
          .from(".hs-actions > *", { opacity: 0, y: 14, duration: 0.5, stagger: 0.1 }, "-=0.35")
          .from(".hs-trust", { opacity: 0, y: 10, duration: 0.5 }, "-=0.3")
          .from(
            ".hs-waterfall-stage",
            { opacity: 0, y: 45, scale: 0.93, duration: 1.1, ease: "power3.out" },
            "-=0.75"
          );

        return () => split.revert();
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [".hs-eyebrow", ".hs-headline", ".hs-copy", ".hs-actions > *", ".hs-trust", ".hs-waterfall-stage"],
          { opacity: 1, clearProps: "transform" }
        );
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative bg-bg text-ink overflow-hidden px-4 pt-6 pb-16 sm:px-6 sm:pt-8 sm:pb-24 lg:pt-10 lg:pb-28"
    >
      {/* Arka plan ambient ışık dalgası */}
      <div
        className="glow absolute -top-36 left-1/2 h-[46rem] w-[76rem] -translate-x-1/2 rounded-full pointer-events-none"
        style={{ background: "var(--spectrum)", opacity: 0.18 }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-[1560px] items-center gap-8 lg:grid-cols-[0.94fr_1.26fr] lg:gap-10">
        {/* ================= SOL: METİN VE EYLEM ALANI ================= */}
        <div className="z-10 py-4 lg:py-8">
          {/* Eyebrow Rozeti */}
          <div className="hs-eyebrow inline-flex items-center gap-2 rounded-full border border-rose-200/80 bg-rose-50/90 px-3.5 py-1.5 text-xs font-bold text-[#FA5252] shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FA5252]" />
            </span>
            <span className="tracking-wide">{t.hero.eyebrowBadge}</span>
          </div>

          {/* Ana Başlık */}
          <h1 className="hs-headline mt-5 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[54px]">
            {t.hero.headlineBefore}
            <span className="spectrum-text block sm:inline">{t.hero.headlineHighlight}</span>
          </h1>

          {/* Açıklama Metni */}
          <p className="hs-copy mt-5 max-w-xl font-body text-base leading-relaxed text-slate-600 sm:text-lg">
            {t.hero.copy}
          </p>

          {/* İkili Eylem Butonları */}
          <div className="hs-actions mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            <Link
              href="/kayit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FA5252] px-8 py-3.5 font-bold text-white text-sm sm:text-base shadow-lg shadow-rose-500/25 hover:bg-[#e04545] hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>{t.hero.tryFreeButton}</span>
              <HiOutlineArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#otonom-akis"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-6 py-3.5 font-semibold text-slate-700 text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              <HiOutlinePlay className="h-4 w-4 text-[#FA5252]" />
              <span>{t.hero.howItWorksButton}</span>
            </a>
          </div>

          {/* Güven ve Mikro Bilgi */}
          <p className="hs-actions mt-3 text-xs text-slate-400 font-medium flex items-center gap-2">
            <HiOutlineCheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>{t.hero.trustBadge}</span>
          </p>

          {/* Platform Şeridi */}
          <div className="hs-trust mt-8 pt-6 border-t border-slate-200/70">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold mb-3">
              {t.hero.platformsTitle}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {CONNECTED_PLATFORMS.map((plat) => {
                const Icon = plat.icon;
                return (
                  <div
                    key={plat.name}
                    className="group flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 shadow-2xs transition-all hover:border-slate-300 hover:scale-105"
                    title={plat.name}
                  >
                    <span className={`flex h-5 w-5 items-center justify-center rounded-md ${plat.bg}`}>
                      <Icon className="h-3.5 w-3.5" style={{ color: plat.color }} />
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 group-hover:text-slate-900">
                      {plat.name}
                    </span>
                  </div>
                );
              })}
              <Link
                href="/platformlar"
                className="text-[11px] font-bold text-[#FA5252] hover:underline px-2 py-1"
              >
                {t.hero.seeAllPlatforms}
              </Link>
            </div>
          </div>
        </div>

        {/* ================= SAĞ: KULLANICININ MAVİ ÇİZDİĞİ GENİŞ ALAN & 3D DERİNLİK SAHNESİ ================= */}
        {/* Üstten daha yukarı başlayan (lg:-mt-10) ve sağ kenara kadar uzanan (lg:-mr-6 xl:-mr-12) panoramik alan */}
        <div className="hs-waterfall-stage relative h-[720px] sm:h-[800px] lg:h-[860px] lg:-mt-10 lg:-mr-4 xl:-mr-12 [perspective:1600px] overflow-visible">
          
          {/* Çift Kanallı 3D Perspektif Sahnesi:
              - rotateX(15deg): Üst tarafı ekranın içine doğru derinlemesine eğer (İçeri geçme hissi).
              - rotateY(-14deg): Sahneyi hafifçe sola dönük izometrik açıya getirir.
              - rotateZ(3deg): Doğal dinamizm katar.
              - maskImage: PURE ALPHA MASK - Arkadaki ambient pembe ışığı kapatacak katı beyaz şerit YOKTUR!
          */}
          <div
            className="relative grid grid-cols-2 gap-4 sm:gap-5 lg:gap-6 h-full [transform:rotateX(15deg)_rotateY(-14deg)_rotateZ(3deg)] [transform-style:preserve-3d] transition-transform duration-700 hover:[transform:rotateX(9deg)_rotateY(-8deg)_rotateZ(1.5deg)]"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)",
            }}
          >
            
            {/* ================= 1. SÜTUN: AŞAĞIDAN YUKARIYA AKAN MARQUEE ================= */}
            <div className="overflow-hidden relative h-full">
              <div className="animate-marquee-up space-y-4 pt-4">
                
                {/* 1. KART: Instagram E-Ticaret / Lüks Saat (Fotoğraflı Kart) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:shadow-2xl hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-serif text-[10px] font-bold">
                        K
                      </div>
                      <p className="text-[11px] font-bold text-slate-900 flex items-center gap-1 leading-none">
                        kronos.atelier
                        <span className="text-[#3B82F6] text-[10px]">✓</span>
                      </p>
                    </div>
                    <FaInstagram className="h-3 w-3 text-[#E4405F]" />
                  </div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950">
                    <Image src="/images/why-us/card2-watch.jpg" alt="Watch" fill className="object-cover" />
                    <div className="absolute top-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white">
                      Shopify Entegre
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-700 font-medium line-clamp-2 leading-snug">
                    ✨ Geceye hazır olun. Saf siyah mat titanyum kasa The Eclipse bio&apos;da.
                  </p>
                </div>

                {/* 2. KART: X (Twitter) Kompakt Viral Kanca (Metin Kartı) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xl shadow-slate-900/8 transition-all hover:shadow-2xl hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[9px]">
                        HY
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 leading-none">Hakan Yılmaz</p>
                        <p className="text-[8px] text-slate-400">@hakanyilmaz · 4s</p>
                      </div>
                    </div>
                    <FaXTwitter className="h-3 w-3 text-slate-900" />
                  </div>
                  <p className="text-[10px] text-slate-800 font-medium leading-relaxed mt-1">
                    Tek bir fikri farklı kanalların diline uyarlamak içerik planlamasını kolaylaştırır. Her taslağı yayın öncesinde gözden geçirin.
                  </p>
                </div>

                {/* 3. KART: TikTok & Reels Viral Kafe (Video Still) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:shadow-2xl hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-[11px] font-bold text-slate-900">@roastandco</p>
                    <div className="flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[8px] font-bold text-slate-900">
                      <FaTiktok className="h-2.5 w-2.5" />
                      <span>Viral Hook</span>
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900">
                    <Image src="/images/mock-data/iced-latte.jpg" alt="Iced Latte" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 inset-x-2 text-white">
                      <p className="text-[10px] font-extrabold leading-tight">Günde 200 adet satan karamel latte 🧊☕</p>
                      <p className="text-[8px] text-white/80 font-mono mt-0.5">🎵 Summer Chill · Trending</p>
                    </div>
                  </div>
                </div>

                {/* 4. KART: Pinterest & Canva Tasarım - İç Mimarlık (İnfografik Kart) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:shadow-2xl hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">nordichome.tr</p>
                    <FaPinterest className="h-3 w-3 text-[#BD081C]" />
                  </div>
                  <div className="rounded-xl bg-[#F5F2EB] p-3 text-center border border-[#E7E2D5]">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-stone-500 block">İç Mimarlık</span>
                    <h5 className="text-xs font-extrabold text-stone-900 mt-0.5">Japon Minimalizmi ile 5 Kural</h5>
                    <p className="text-[9px] text-stone-600 mt-0.5">Doğal Ahşap &amp; Sıcak Işık</p>
                  </div>
                  <div className="mt-2 flex items-center justify-end text-[9px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1 text-cyan-600 font-semibold"><SiCanva className="h-2.5 w-2.5" /> Canva</span>
                  </div>
                </div>

                {/* 5. KART: Shopify E-Ticaret - Organik Acai & Süper Gıda */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <FaShopify className="h-3 w-3 text-[#95BF47]" />
                      <p className="text-[11px] font-bold text-slate-900">vitalgreens.shop</p>
                    </div>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold text-emerald-800">%20 İndirim</span>
                  </div>
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100">
                    <Image src="/images/mock-data/acai-bowl.jpg" alt="Acai Bowl" fill className="object-cover" />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-900 truncate">Amazon Acai Paketi</p>
                    <span className="text-[10px] font-extrabold text-[#FA5252] shrink-0">145 TL</span>
                  </div>
                </div>

                {/* 6. KART: LinkedIn B2B Karusel - Büyüme Stratejisi */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 rounded-full overflow-hidden relative border border-slate-200">
                        <Image src="/images/why-us/card3-avatar.jpg" alt="Avatar" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 leading-none">Emre Vural</p>
                        <p className="text-[8px] text-slate-400">Growth Strategist</p>
                      </div>
                    </div>
                    <FaLinkedin className="h-3 w-3 text-[#0A66C2]" />
                  </div>
                  <p className="text-[10px] text-slate-800 font-medium leading-relaxed">
                    Sosyal medya içerik planını daha düzenli kurmanın 3 adımı 👇
                  </p>
                  <div className="mt-2 rounded-lg bg-blue-50/70 p-2 flex items-center justify-between text-[9px] font-bold text-blue-900">
                    <span>Karusel Rehberi</span>
                    <span className="text-blue-600 font-mono">1 / 5 ➔</span>
                  </div>
                </div>

                {/* 7. KART: Lokal İşletme - Taze Fırın Kruvasan (Google Haritalar) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">Le Pain Bakery</p>
                    <div className="flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-700">
                      <FaGoogle className="h-2.5 w-2.5 text-blue-600" />
                      <span>5.0 ⭐</span>
                    </div>
                  </div>
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100">
                    <Image src="/images/mock-data/fresh-pastry.jpg" alt="Bakery" fill className="object-cover" />
                  </div>
                  <p className="mt-1.5 text-[9px] text-slate-700 font-medium line-clamp-2">
                    07:00 fırınından sıcak tereyağlı kruvasanlarımız çıktı! Kokuyu takip edin 🥐
                  </p>
                </div>

                {/* ================= SEAMLESS LOOP DÖNGÜSÜ İÇİN 1. SÜTUN TEKRARI ================= */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8">
                  <div className="flex items-center justify-between pb-2">
                    <p className="text-[11px] font-bold text-slate-900">kronos.atelier</p>
                    <FaInstagram className="h-3 w-3 text-[#E4405F]" />
                  </div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950">
                    <Image src="/images/why-us/card2-watch.jpg" alt="Watch" fill className="object-cover" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xl shadow-slate-900/8">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">Hakan Yılmaz</p>
                    <FaXTwitter className="h-3 w-3 text-slate-900" />
                  </div>
                  <p className="text-[10px] text-slate-800 font-medium">
                    Tek bir sağlam fikri farklı mecralara uygun taslaklara dönüştürün; yayın öncesinde her birini gözden geçirin.
                  </p>
                </div>

              </div>
            </div>

            {/* ================= 2. SÜTUN: YUKARIDAN AŞAĞIYA AKAN MARQUEE ================= */}
            <div className="overflow-hidden relative h-full">
              <div className="animate-marquee-down space-y-4 pt-4">
                
                {/* 8. KART: Instagram Reels 9:16 - Güzellik & Cilt Bakımı (Dikey Video) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">glowlabs.official</p>
                    <span className="rounded bg-gradient-to-r from-purple-500 to-rose-500 px-1.5 py-0.5 text-[8px] font-bold text-white">
                      Reels 9:16
                    </span>
                  </div>
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950">
                    <Image src="/images/why-us/card3-reels.jpg" alt="Reels UGC" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 inset-x-2 text-white">
                      <p className="text-[10px] font-bold leading-tight">Sabah cilt bakım rutinim ✨</p>
                      <p className="text-[8px] text-white/80">Otonom Formatlandı</p>
                    </div>
                  </div>
                </div>

                {/* 9. KART: Threads Mikro Düşünce (Kompakt Metin Kartı) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">@atelier.design</p>
                    <span className="text-[9px] font-mono text-slate-400">Threads</span>
                  </div>
                  <p className="text-[10px] text-slate-800 font-medium leading-relaxed">
                    Kendi markanızı büyütürken en büyük düşmanınız &quot;vaktim yok&quot; bahanesidir. Otomasyona geçin, asıl işinize odaklanın.
                  </p>
                </div>

                {/* 10. KART: Shopify Lüks Kozmetik & Serum */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <FaShopify className="h-3 w-3 text-[#95BF47]" />
                      <p className="text-[11px] font-bold text-slate-900">luminesse.skin</p>
                    </div>
                    <span className="rounded bg-rose-50 text-[#FA5252] border border-rose-200 px-1.5 py-0.5 text-[8px] font-bold">FLAT 35% OFF</span>
                  </div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-stone-50">
                    <Image src="/images/why-us/card1-skincare.jpg" alt="Serum" fill className="object-cover" />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-900">Botanical Restorative</p>
                    <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[8px] font-bold text-white">Sepete Ekle</span>
                  </div>
                </div>

                {/* 11. KART: YouTube Shorts - Pazarlama İpuçları (Video) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">Tentamark Academy</p>
                    <div className="flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[8px] font-bold text-red-600">
                      <FaYoutube className="h-3 w-3 text-red-600" />
                      <span>Shorts</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-3 text-white relative overflow-hidden">
                    <div className="flex items-center justify-between text-[8px] font-mono text-white/70 mb-1">
                      <span>0:45</span>
                      <span className="text-red-400 font-bold">● CANLI</span>
                    </div>
                    <p className="text-[10px] font-bold leading-tight">Yapay zekanın sosyal medyada yaptığı en kritik 3 hata</p>
                  </div>
                </div>

                {/* 12. KART: Kafe & Sağlıklı Yaşam - Detoks Smoothie Şişeleri */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">greenbar.istanbul</p>
                    <FaInstagram className="h-3 w-3 text-[#E4405F]" />
                  </div>
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100">
                    <Image src="/images/mock-data/smoothie-jars.jpg" alt="Smoothie" fill className="object-cover" />
                  </div>
                  <p className="mt-1.5 text-[9px] text-slate-700 font-medium line-clamp-2 leading-snug">
                    Güne yeşil enerjiyle başlayın! Ispanak, yeşil elma ve zencefilli taze şişelerimiz dolapta 🍏
                  </p>
                </div>

                {/* 13. KART: X (Twitter) Müşteri Başarı Hikayesi */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-bold text-slate-900">Selin Demir</p>
                      <span className="text-[9px] text-slate-400">@selin_ecom</span>
                    </div>
                    <FaXTwitter className="h-3 w-3 text-slate-900" />
                  </div>
                  <p className="text-[10px] text-slate-800 font-medium leading-relaxed">
                    Tentamark&apos;a geçtikten sonra haftalık 14 gönderiyi hazırlamak 10 dakikamızı alıyor. Eskiden 2 kişi tam gün uğraşıyordu. En iyi yatırımımız oldu.
                  </p>
                </div>

                {/* 14. KART: Pinterest - Doğal Yaşam & Narenciye */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8 transition-all hover:scale-[1.02]">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">citrusandhome</p>
                    <FaPinterest className="h-3 w-3 text-[#BD081C]" />
                  </div>
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100">
                    <Image src="/images/mock-data/pink-lemons.jpg" alt="Lemons" fill className="object-cover" />
                  </div>
                  <p className="mt-1.5 text-[9px] text-slate-800 font-bold">
                    Doğal Ev Yapımı Limonata &amp; Yaz Tarifleri 🍋
                  </p>
                </div>

                {/* ================= SEAMLESS LOOP DÖNGÜSÜ İÇİN 2. SÜTUN TEKRARI ================= */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xl shadow-slate-900/8">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">glowlabs.official</p>
                    <span className="text-[9px] text-rose-500 font-bold">Reels</span>
                  </div>
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950">
                    <Image src="/images/why-us/card3-reels.jpg" alt="Reels" fill className="object-cover" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xl shadow-slate-900/8">
                  <div className="flex items-center justify-between pb-1.5">
                    <p className="text-[11px] font-bold text-slate-900">@atelier.design</p>
                    <span className="text-[9px] text-slate-400">Threads</span>
                  </div>
                  <p className="text-[10px] text-slate-800 font-medium">
                    Kendi markanızı büyütürken en büyük düşmanınız &quot;vaktim yok&quot; bahanesidir. Otomasyona geçin, asıl işinize odaklanın.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
