"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { FaShopify, FaFacebook, FaInstagram, FaHeart, FaComment, FaShare, FaBookmark } from "react-icons/fa6";
import { SiCanva } from "@/components/PlatformIcon";

export default function WhyUsInteractiveSection() {
  const { t } = useLanguage();

  return (
    <section
      id="neden-biz"
      className="relative border-t border-slate-200/80 bg-white py-16 sm:py-20 lg:py-24 overflow-hidden"
    >
      {/* Panoramik Geniş Konteyner: Sağ ve solda çok az boşluk, Predis.ai tarzı ferah ve büyük yerleşim */}
      <div className="mx-auto max-w-[1540px] px-3 sm:px-5 lg:px-8">
        {/* ================= ANA BAŞLIK ================= */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-[34px] leading-tight">
            {t.whyUs.mainTitle}
          </h2>
        </div>

        {/* ================= 3 BÜYÜK KART IZGARASI ================= */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7 items-stretch">
          
          {/* ================= KART 1: GÖRSELLER, BAŞLIKLAR, METİNLER ================= */}
          <div className="group rounded-[32px] bg-[#EEF4FE] p-7 sm:p-8 lg:p-9 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/5 min-h-[580px] lg:min-h-[620px]">
            {/* Üst Metin Alanı */}
            <div>
              <h3 className="font-display text-lg sm:text-[21px] font-bold text-slate-900 leading-snug">
                {t.whyUs.card1.title}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                {t.whyUs.card1.desc}
              </p>
            </div>

            {/* Alt Görsel Mockup: Predis.ai 1. Kart Birebir Tasarımı */}
            <div className="mt-8 flex flex-col items-center justify-center">
              {/* Reklam Gönderisi Kartı */}
              <div className="w-full max-w-[310px] rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-md">
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-stone-100 flex items-center justify-between p-3 border border-stone-200/60">
                  {/* Sol Reklam Metinleri */}
                  <div className="z-10 flex flex-col justify-between h-full max-w-[62%] py-0.5">
                    <div>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                        NEW LAUNCH
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-tight mt-0.5">
                        Skincare Routine
                      </h4>
                      <p className="text-[9px] text-slate-500 font-medium">Healthy &amp; Glowing Skin</p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="inline-block rounded-md bg-[#FA5252] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-2xs">
                        FLAT 45% OFF
                      </div>
                      <div>
                        <span className="inline-block rounded-md bg-slate-900 px-2 py-0.5 text-[8px] font-bold text-white uppercase tracking-wider">
                          BUY NOW
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Ürün Fotoğrafı */}
                  <div className="relative h-full w-[38%] rounded-lg overflow-hidden shrink-0">
                    <Image
                      src="/images/why-us/card1-skincare.jpg"
                      alt="Skincare Routine Product"
                      fill
                      className="object-contain object-center drop-shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Alt İkili Kutu: Captions ve Hashtags */}
              <div className="mt-3 flex items-center justify-center gap-3 w-full max-w-[310px]">
                {/* Sol Kutu: Captions */}
                <div className="flex-1 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-700 block">{t.whyUs.card1.captionsLabel}</span>
                  <div className="space-y-1.5 mt-2">
                    <div className="h-2 w-11/12 rounded-full bg-rose-200" />
                    <div className="h-2 w-8/12 rounded-full bg-rose-100" />
                  </div>
                </div>

                {/* Sağ Kutu: Hashtags */}
                <div className="flex-1 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-700 block">{t.whyUs.card1.hashtagsLabel}</span>
                  <div className="space-y-1.5 mt-2">
                    <div className="h-2 w-10/12 rounded-full bg-teal-200" />
                    <div className="h-2 w-7/12 rounded-full bg-teal-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= KART 2: ÜRÜN URL'Sİ VEYA RESİMDEN BAŞLAYIN ================= */}
          <div className="group rounded-[32px] bg-[#EEF4FE] p-7 sm:p-8 lg:p-9 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/5 min-h-[580px] lg:min-h-[620px]">
            {/* Üst Metin Alanı */}
            <div>
              <h3 className="font-display text-lg sm:text-[21px] font-bold text-slate-900 leading-snug">
                {t.whyUs.card2.title}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                {t.whyUs.card2.desc}
              </p>
            </div>

            {/* Alt Görsel Mockup: Predis.ai 2. Kart Çok Kanallı Kolaj Birebir Tasarımı */}
            <div className="relative mt-8 flex items-center justify-center min-h-[290px]">
              {/* Arka Mavi Zemin Bloğu */}
              <div className="absolute h-52 w-52 rounded-3xl bg-[#3B82F6]/90 shadow-md transform -rotate-1" />

              {/* Sol Platform Rozeti: Shopify */}
              <div className="absolute left-3 top-10 z-30 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#95BF47] shadow-lg border border-slate-100 transition-transform hover:scale-110">
                <FaShopify className="h-5 w-5" />
              </div>

              {/* Sağ Platform Rozeti: Facebook */}
              <div className="absolute right-3 top-16 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-md transition-transform hover:scale-110">
                <FaFacebook className="h-4 w-4" />
              </div>

              {/* Alt Sol Platform Rozeti: Instagram */}
              <div className="absolute left-8 bottom-3 z-30 flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white shadow-md transition-transform hover:scale-110">
                <FaInstagram className="h-4 w-4" />
              </div>

              {/* Üst Sağ Rozet: Canva */}
              <div className="absolute right-5 -top-2 z-30 flex h-8 w-8 items-center justify-center rounded-2xl bg-[#00C4CC] text-white shadow-md transition-transform hover:scale-110">
                <SiCanva className="h-4 w-4" />
              </div>

              {/* ================= KOLAJ KARTLARI ================= */}
              {/* 1. Üst Sol Pembe Kart */}
              <div className="absolute left-6 top-3 z-10 w-28 rounded-xl border border-rose-100 bg-[#FFE4E6] p-2 shadow-sm">
                <p className="text-[7px] font-bold text-rose-800 uppercase tracking-wider">New Launch</p>
                <p className="text-[8px] font-extrabold text-slate-800">Makeup Glow</p>
              </div>

              {/* 2. Üst Sağ Nane Yeşili Krem Kartı */}
              <div className="absolute right-4 top-1 z-10 w-32 rounded-xl border border-emerald-100 bg-[#E6F4EA] p-2 shadow-sm text-center">
                <p className="text-[7px] font-bold text-emerald-800">Special Discount</p>
                <p className="text-[8px] font-extrabold text-slate-800">Beauty Products</p>
              </div>

              {/* 3. MERKEZ ANA KART: Black Watch */}
              <div className="relative z-20 w-44 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl space-y-2 text-center">
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900">
                  <Image
                    src="/images/why-us/card2-watch.jpg"
                    alt="Best Men's Black Watches On Sale"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1.5 text-left">
                    <span className="text-[8px] font-mono uppercase text-white/70 block">COLLECTION</span>
                    <p className="text-[10px] font-extrabold text-white leading-tight">Best Men&apos;s Black Watch</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] font-bold text-slate-800">On Sale!</span>
                  <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[8px] font-bold text-white">40% OFF</span>
                </div>
              </div>

              {/* 4. Alt Sağ Kart: Kulaklık Fırsatları */}
              <div className="absolute right-5 bottom-4 z-20 w-36 rounded-xl border border-amber-100 bg-[#FFF7ED] p-2 shadow-md">
                <p className="text-[7px] font-bold text-amber-800 uppercase">Special Offers</p>
                <p className="text-[8px] font-extrabold text-slate-800">Wireless Audio</p>
              </div>

              {/* 5. Alt Sol Sarı Kart: İç Mekan / Mobilya */}
              <div className="absolute left-14 bottom-0 z-20 w-28 rounded-xl border border-yellow-200 bg-[#FEF08A] p-2 shadow-sm">
                <p className="text-[7px] font-bold text-yellow-900">Living Room</p>
                <p className="text-[8px] font-extrabold text-slate-900">30% OFF</p>
              </div>
            </div>
          </div>

          {/* ================= KART 3: MARKA KİMLİĞİ VE VİDEO REELS ================= */}
          <div className="group rounded-[32px] bg-[#EEF4FE] p-7 sm:p-8 lg:p-9 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/5 min-h-[580px] lg:min-h-[620px]">
            {/* Üst Metin Alanı */}
            <div>
              <h3 className="font-display text-lg sm:text-[21px] font-bold text-slate-900 leading-snug">
                {t.whyUs.card3.title}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-body">
                {t.whyUs.card3.desc}
              </p>
            </div>

            {/* Alt Görsel Mockup: Predis.ai 3. Kart Avatar -> Ok -> Akıllı Telefon Reels Birebir Tasarımı */}
            <div className="relative mt-8 flex items-center justify-center gap-2 sm:gap-4 min-h-[290px]">
              
              {/* Sol Taraf: Creator Avatarı & Fare İmleci */}
              <div className="flex flex-col items-center">
                <div className="relative rounded-2xl border-2 border-white bg-white p-1 shadow-lg">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-slate-100">
                    <Image
                      src="/images/why-us/card3-avatar.jpg"
                      alt="Creator Avatar"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  {/* Minik Fare İmleci İkonu */}
                  <div className="absolute -bottom-2.5 -right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md border border-slate-200">
                    <svg
                      className="h-3.5 w-3.5 text-slate-800"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="white"
                      strokeWidth="1.5"
                    >
                      <path d="M4 2l16 11-7.5 1.5L9 22z" />
                    </svg>
                  </div>
                </div>

                {/* Kavisli Çizim Oku */}
                <div className="mt-2">
                  <svg className="w-12 h-10 text-slate-400" viewBox="0 0 60 50" fill="none">
                    <path
                      d="M 15 10 C 15 35, 30 45, 52 38"
                      stroke="#94A3B8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="4 3"
                    />
                    <path
                      d="M 45 32 L 53 38 L 47 45"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Sağ Taraf: Akıllı Telefon Çerçevesi (iPhone Style Video Reels) */}
              <div className="relative w-36 sm:w-44 rounded-[30px] border-[4px] border-slate-900 bg-slate-950 p-1 shadow-2xl overflow-hidden aspect-[9/18]">
                {/* Üst Dinamik Ada / Hoparlör */}
                <div className="absolute top-2 inset-x-0 z-30 flex justify-center">
                  <div className="h-3 w-14 rounded-full bg-black/80 backdrop-blur-xs" />
                </div>

                {/* Video İçeriği */}
                <div className="relative h-full w-full rounded-[24px] overflow-hidden bg-slate-900">
                  <Image
                    src="/images/why-us/card3-reels.jpg"
                    alt="TikTok Reels Video Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                  {/* Sağ Taraf Etkileşim İkonları (Reels Stili) */}
                  <div className="absolute right-1.5 bottom-12 z-20 flex flex-col items-center gap-2.5 text-white/90">
                    <div className="flex flex-col items-center">
                      <FaHeart className="h-3.5 w-3.5 text-rose-500 drop-shadow-xs" />
                      <span className="text-[7px] font-bold font-mono">12.4K</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <FaComment className="h-3.5 w-3.5 text-white drop-shadow-xs" />
                      <span className="text-[7px] font-bold font-mono">348</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <FaBookmark className="h-3.5 w-3.5 text-white drop-shadow-xs" />
                      <span className="text-[7px] font-bold font-mono">920</span>
                    </div>
                    <FaShare className="h-3.5 w-3.5 text-white drop-shadow-xs" />
                  </div>

                  {/* Ürün Etiketi Rozeti (Predis'teki Aloe Vera Maskesi benzeri) */}
                  <div className="absolute left-2 bottom-6 z-20 flex items-center gap-1.5 rounded-lg bg-white/90 px-1.5 py-1 backdrop-blur-xs shadow-md">
                    <div className="h-5 w-5 rounded bg-emerald-100 flex items-center justify-center text-[8px] font-bold text-emerald-800">
                      🌿
                    </div>
                    <div>
                      <p className="text-[7px] font-bold text-slate-900 leading-tight">Skin Glow Serum</p>
                      <p className="text-[6px] text-emerald-700 font-semibold">Marka Kiti Uyumlu</p>
                    </div>
                  </div>

                  {/* Alt Oynatma Çubuğu */}
                  <div className="absolute bottom-1 inset-x-2 z-20">
                    <div className="h-0.5 w-full rounded-full bg-white/30 overflow-hidden">
                      <div className="h-full w-2/3 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ================= MERKEZİ BUTON: ŞİMDİ DENEYİN (PREDİS.Aİ BİREBİR) ================= */}
        <div className="mt-12 sm:mt-14 text-center">
          <Link
            href="/kayit"
            className="inline-flex items-center justify-center rounded-full bg-[#3B82F6] px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-[#2563EB] hover:shadow-xl transition-all cursor-pointer hover:scale-[1.03]"
          >
            {t.whyUs.ctaButton}
          </Link>
        </div>
      </div>
    </section>
  );
}
