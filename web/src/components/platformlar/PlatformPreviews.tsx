"use client";

import React, { useState } from "react";
import Image from "next/image";
import PlatformIcon, { type PlatformName } from "@/components/PlatformIcon";
import { 
  HiOutlineArrowsUpDown, 
  HiOutlineHeart, 
  HiOutlineChatBubbleOvalLeft, 
  HiOutlineShare,
  HiOutlinePlay,
  HiOutlineChevronRight,
  HiOutlineChevronLeft
} from "react-icons/hi2";

export function InstagramGridPreview() {
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const posts = [
    { id: 1, img: "/images/mock-data/orange-slices.jpg", tag: "REEL", title: "Narenciye Enerjisi" },
    { id: 2, img: "/images/mock-data/acai-bowl.jpg", tag: "1/4", title: "Kahvaltı Karuseli" },
    { id: 3, img: "/images/mock-data/iced-latte.jpg", tag: "YENİ", title: "Soğuk Kahve Molası" },
    { id: 4, img: "/images/mock-data/fresh-pastry.jpg", tag: null, title: "Kruvasan Çıtırı" },
    { id: 5, img: "/images/mock-data/pink-lemons.jpg", tag: "REEL", title: "Pembe Limonata Yapımı" },
    { id: 6, img: "/images/mock-data/smoothie-jars.jpg", tag: "1/6", title: "Detoks Tarifleri" },
    { id: 7, img: "/images/mock-data/papaya-seeds.jpg", tag: null, title: "Tropik Esintiler" },
    { id: 8, img: "/images/mock-data/pineapple-summer.jpg", tag: "YENİ", title: "Yaz Menüsü" },
    { id: 9, img: "/images/mock-data/grapefruit-citrus.jpg", tag: null, title: "Taze Sıkım Ritüeli" },
  ];

  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-4.5 shadow-2xl shadow-slate-900/10 transition-all hover:shadow-slate-900/15">
      {/* Account Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
        <div className="relative">
          <PlatformIcon name="instagram" className="h-9 w-9" variant="tile" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            @tastybites.co
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            Izgara önizlemesi · sıradaki 9 gönderi
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-rose-50 border border-rose-200/60 px-2.5 py-1 text-[10px] font-bold text-rose-600">
          15 Eyl – 28 Eyl
        </span>
      </div>

      {/* 3x3 Grid */}
      <div className="mt-3.5 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-50 p-1 border border-slate-100">
        {posts.map((post, idx) => (
          <div
            key={post.id}
            onMouseEnter={() => setActiveItem(idx)}
            onMouseLeave={() => setActiveItem(null)}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-slate-100"
          >
            <Image
              src={post.img}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 30vw, 110px"
              className="object-cover transition-transform duration-300 group-hover:scale-108"
            />
            {post.tag && (
              <span className="absolute right-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-white backdrop-blur-xs">
                {post.tag}
              </span>
            )}
            {/* Hover overlay with engagement mockup */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
              <span className="flex items-center gap-1 text-[11px] font-bold text-white">
                <HiOutlineHeart className="h-3 w-3 fill-white text-white" />
                {240 + idx * 35}
              </span>
              <span className="mt-0.5 text-[9px] font-medium text-white/90">Planlandı</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reorder hint */}
      <div className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-slate-400">
        <HiOutlineArrowsUpDown className="h-3.5 w-3.5 text-accent" />
        <span>Yayından önce sürükleyerek yeniden sıralayın</span>
      </div>
    </div>
  );
}

export function LinkedInPreviewCard() {
  const [slide, setSlide] = useState(1);
  const totalSlides = 5;

  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name="linkedin" className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            B2B Büyüme Rehberi
          </p>
          <p className="text-[11px] text-slate-400">
            PDF Karusel · {totalSlides} Slayt
          </p>
        </div>
        <span className="ml-auto rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-[10px] font-bold text-blue-600">
          Otomatik Yayın
        </span>
      </div>

      {/* Slide Canvas */}
      <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-[#004182] via-[#0a66c2] to-[#0077b5] p-5 text-white shadow-inner">
        <div className="flex items-center justify-between text-xs text-blue-100">
          <span className="font-mono text-[10px] tracking-wider text-rose-300 uppercase font-semibold">Tentamark Insights</span>
          <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold">
            {slide} / {totalSlides}
          </span>
        </div>
        <div className="mt-4">
          <h4 className="font-display text-base font-bold leading-snug">
            {slide === 1 && "2026'da B2B Sosyal Medyada Tutunan Tek Strateji"}
            {slide === 2 && "01. Şirket Logosunu Değil, Kurucu Sesini Öne Çıkarın"}
            {slide === 3 && "02. Bilgi Boşluklarını Karusellerle Doldurun"}
            {slide === 4 && "03. Yorumlara İlk 30 Dakikada Yanıt Verin"}
            {slide === 5 && "Özet: Tutarlılık Algoritmadan Önemlidir"}
          </h4>
          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            {slide === 1 && "Kaydırın; haftalık 10 saat kazandıran B2B dağıtım çerçevesini adım adım inceleyin."}
            {slide === 2 && "Kişisel hesaplar şirket sayfalarına kıyasla 5.2 kat daha yüksek organik etkileşim alıyor."}
            {slide === 3 && "Kaydetme ve indirme oranını artıran 5-7 slaytlık mikro rehber formatı."}
            {slide === 4 && "Tentamark AI Asistanı gelen yorumları marka dilinizde hazırlar."}
            {slide === 5 && "Tüm haftalık paketi tek tıkla takviminize kaydedin."}
          </p>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <button
            onClick={() => setSlide((s) => Math.max(1, s - 1))}
            disabled={slide === 1}
            className="grid h-7 w-7 place-items-center rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-30"
          >
            <HiOutlineChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setSlide((s) => Math.min(totalSlides, s + 1))}
            disabled={slide === totalSlides}
            className="grid h-7 w-7 place-items-center rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-30"
          >
            <HiOutlineChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1 text-[11px] text-slate-500">
        <span>📄 Belge Karuseli formatında hazır</span>
        <span className="font-semibold text-accent">LinkedIn API Doğrulandı</span>
      </div>
    </div>
  );
}

export function TikTokPreviewCard() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name="tiktok" className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            TikTok Direct Post
          </p>
          <p className="text-[11px] text-slate-400">
            9:16 Dikey Video · Trend Kancası
          </p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
          API Aktif
        </span>
      </div>

      {/* Phone Mockup Frame */}
      <div className="relative mt-4 aspect-[9/13] overflow-hidden rounded-2xl bg-slate-950 shadow-inner">
        <Image
          src="/images/mock-data/pink-lemons.jpg"
          alt="TikTok Video"
          fill
          className="object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

        {/* Center play icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/20 backdrop-blur-md transition-transform hover:scale-110">
            <HiOutlinePlay className="ml-0.5 h-6 w-6 text-white" />
          </span>
        </div>

        {/* Right side engagement icons */}
        <div className="absolute bottom-16 right-3 flex flex-col items-center gap-3 text-white">
          <div className="flex flex-col items-center">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur-xs">
              <HiOutlineHeart className="h-5 w-5 text-rose-500 fill-rose-500" />
            </span>
            <span className="text-[10px] font-bold">14.8K</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur-xs">
              <HiOutlineChatBubbleOvalLeft className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold">342</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur-xs">
              <HiOutlineShare className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold">890</span>
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-14 text-white">
          <p className="text-xs font-bold">@markaniz</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-200">
            Bunu bilseydim sosyal medyada 1 yılımı çöpe atmazdım 🤯 #tiktoktüyoları #keşfet
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-300">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Orijinal Ses - Tentamark Viral Beat
          </p>
        </div>
      </div>
    </div>
  );
}

export function YouTubePreviewCard() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name="youtube" className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            YouTube Data API v3
          </p>
          <p className="text-[11px] text-slate-400">
            Video & Shorts · Otomatik Başlık
          </p>
        </div>
        <span className="ml-auto rounded-full bg-rose-50 border border-rose-200/60 px-2.5 py-1 text-[10px] font-bold text-rose-600">
          Resmi API
        </span>
      </div>

      <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-inner">
        <Image
          src="/images/mock-data/iced-latte.jpg"
          alt="YouTube Thumbnail"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600 text-white shadow-lg transition-transform hover:scale-110">
            <HiOutlinePlay className="ml-1 h-6 w-6" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
          08:42
        </span>
      </div>

      <div className="mt-3.5 space-y-1.5">
        <h4 className="font-display text-sm font-bold text-slate-900 line-clamp-2">
          3 Dakikada Marka Dilinizi AI ile Eğitin | 2026 Otomasyon Rehberi
        </h4>
        <p className="text-[11px] text-slate-400">
          Tentamark Resmi Kanalı · 18 B görüntüleme · 2 gün önce
        </p>
      </div>
    </div>
  );
}

export function WooCommercePreviewCard() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name="woocommerce" className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            WooCommerce Mağazası
          </p>
          <p className="text-[11px] text-slate-400">
            Ürün Kataloğu & Otomasyon
          </p>
        </div>
        <span className="ml-auto rounded-full bg-purple-50 border border-purple-200/60 px-2.5 py-1 text-[10px] font-bold text-purple-700">
          REST API v3
        </span>
      </div>

      <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
        <Image
          src="/images/mock-data/fresh-pastry.jpg"
          alt="Ürün Vitrini"
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
          380,00 TL
        </div>
        <div className="absolute top-3 right-3 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
          STOKTA VAR
        </div>
        <div className="absolute bottom-3 inset-x-3 rounded-xl bg-white/95 p-2.5 text-xs text-slate-900 backdrop-blur-md shadow-md">
          <p className="font-bold truncate">Fransız Tereyağlı Kruvasan Paketi</p>
          <p className="text-[10px] text-slate-500">SKU: PAST-042 · Otomatik senkronize edildi</p>
        </div>
      </div>

      <div className="mt-3.5 space-y-1.5">
        <p className="text-xs leading-relaxed text-slate-600">
          🔥 Mağazanızı bağlayın; yeni eklenen ürünler, indirimler ve stok uyarıları Instagram ve TikTok gönderilerine anında dönüşsün.
        </p>
        <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-purple-600">
          <span>#eticaret #kampanya</span>
          <span>WordPress & WooCommerce Uyumlu</span>
        </div>
      </div>
    </div>
  );
}

export function BlueskyPreviewCard() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name="bluesky" className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            @markaniz.bsky.social
          </p>
          <p className="text-[11px] text-slate-400">
            Bluesky · AT Protocol
          </p>
        </div>
        <span className="ml-auto rounded-full bg-sky-50 border border-sky-200/60 px-2.5 py-1 text-[10px] font-bold text-sky-600">
          Açık Ağ
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-sky-500/20 grid place-items-center text-sky-500 font-bold text-xs">
            🦋
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Tentamark</p>
            <p className="text-[10px] text-slate-400">@tentamark.com</p>
          </div>
          <span className="ml-auto text-[10px] text-slate-400">2 dk</span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-800">
          Sosyal medyada açık protokol dönemi başladı. Tentamark ile Bluesky akışınız her zaman canlı, şeffaf ve organik topluluk odaklı kalıyor.
        </p>

        <div className="mt-3 relative aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src="/images/mock-data/iced-latte.jpg"
            alt="Bluesky Post"
            fill
            className="object-cover"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1">💬 24</span>
          <span className="flex items-center gap-1 text-emerald-500">🔁 86</span>
          <span className="flex items-center gap-1 text-rose-500">❤️ 312</span>
        </div>
      </div>
    </div>
  );
}

export function ShopifyPreviewCard() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name="shopify" className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            @magazaniz.myshopify.com
          </p>
          <p className="text-[11px] text-slate-400">
            Ürün Kataloğu · 142 Aktif Ürün
          </p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          Admin API
        </span>
      </div>

      <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
        <Image
          src="/images/mock-data/fresh-pastry.jpg"
          alt="Shopify Ürün Vitrini"
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
          380,00 TL
        </div>
        <div className="absolute top-3 right-3 rounded-full bg-[#95BF47] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-sm">
          STOKTA VAR
        </div>
        <div className="absolute bottom-3 inset-x-3 rounded-xl bg-white/95 p-2.5 text-xs text-slate-900 backdrop-blur-md shadow-md">
          <p className="font-bold truncate">Fransız Tereyağlı Kruvasan Kutusu</p>
          <p className="text-[10px] text-slate-500">Shopify SKU: BRD-CROIS-01 · 1 Tıkla Yayınlandı</p>
        </div>
      </div>

      <div className="mt-3.5 space-y-1.5">
        <p className="text-xs leading-relaxed text-slate-600">
          🛍️ Mağazanızı bağlayın; yeni koleksiyonlar ve indirimler Instagram ve TikTok gönderilerine otomatik dönüşsün.
        </p>
        <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-[#95BF47]">
          <span>#shopify #eticaret #lansman</span>
          <span>Shopify App Store Uyumlu</span>
        </div>
      </div>
    </div>
  );
}

export function GoogleBusinessPreviewCard() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name="google-business" className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            Lezzet Durağı Fırın & Kafe
          </p>
          <p className="text-[11px] text-slate-400">
            Google Haritalar & Yerel Arama
          </p>
        </div>
        <span className="ml-auto rounded-full bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-[10px] font-bold text-blue-700">
          Doğrulandı ✓
        </span>
      </div>

      {/* Google Business Local Card */}
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60">
          <span className="flex items-center gap-1 font-bold text-amber-500">
            ★ 4.9 <span className="font-normal text-slate-400">(128 Değerlendirme)</span>
          </span>
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            Şu an Açık
          </span>
        </div>

        <div className="mt-3 relative aspect-[16/10] overflow-hidden rounded-xl">
          <Image
            src="/images/mock-data/acai-bowl.jpg"
            alt="Google Business Güncellemesi"
            fill
            className="object-cover"
          />
        </div>

        <div className="mt-3">
          <p className="text-xs font-bold text-slate-900">Haftalık Menü: Taze Acai Bowl & Granola</p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            Güne enerji dolu bir başlangıç için taze meyvelerle hazırlanan Acai kaselerimiz bugün serviste.
          </p>
          <div className="mt-3 flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400">📍 Kadıköy, İstanbul</span>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold text-white shadow-xs">
              Teklifi Gör
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DiscordPreviewCard() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name="discord" className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            Tentamark Community
          </p>
          <p className="text-[11px] text-slate-400">
            #duyurular · 4.8K Aktif Üye
          </p>
        </div>
        <span className="ml-auto rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
          Bot Aktif
        </span>
      </div>

      {/* Discord Embed Box */}
      <div className="mt-4 rounded-2xl border-l-4 border-indigo-500 bg-slate-900 p-4 text-white shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200">Tentamark Bot</span>
          <span className="rounded bg-indigo-500 px-1 text-[8px] font-bold text-white uppercase">BOT</span>
          <span className="text-[10px] text-slate-400">Bugün 14:00</span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-slate-200">
          📢 <span className="bg-indigo-500/30 text-indigo-300 px-1 rounded font-semibold">@everyone</span> Tentamark v2.4 yayında! Bu sürümle birlikte Shopify ve WooCommerce e-ticaret otomasyonu tam erişime açıldı.
        </p>

        <div className="mt-3 relative aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src="/images/mock-data/orange-slices.jpg"
            alt="Discord Announcement"
            fill
            className="object-cover"
          />
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px]">
          <span className="rounded-md bg-white/10 px-2 py-0.5 font-bold">🎉 184</span>
          <span className="rounded-md bg-white/10 px-2 py-0.5 font-bold">🚀 92</span>
          <span className="rounded-md bg-white/10 px-2 py-0.5 font-bold">🔥 65</span>
        </div>
      </div>
    </div>
  );
}

export function WhatsAppPreviewCard() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name="whatsapp" className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            Lezzet Kulübü VIP
          </p>
          <p className="text-[11px] text-slate-400">
            WhatsApp Business Kanalı
          </p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          Onaylı ✓
        </span>
      </div>

      {/* WhatsApp Chat Bubble */}
      <div className="mt-4 rounded-2xl bg-[#EFEAE2] p-4 shadow-inner">
        <div className="rounded-2xl rounded-tl-none bg-white p-3 shadow-xs max-w-[280px]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
            <Image
              src="/images/mock-data/pineapple-summer.jpg"
              alt="WhatsApp Kampanyası"
              fill
              className="object-cover"
            />
          </div>

          <p className="mt-2.5 text-xs text-slate-800 leading-snug">
            Merhaba! ✨ Sadakat kulübümüze özel bu hafta sonu geçerli %20 indirim kodunuz: <b>TENTA20</b>.
          </p>

          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
            <span>14:32</span>
            <span className="text-emerald-500 font-bold">✓✓</span>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-2 flex flex-col gap-1.5">
            <button className="w-full rounded-lg bg-emerald-50 py-1.5 text-center text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition">
              🛒 Hemen Sipariş Ver
            </button>
            <button className="w-full rounded-lg bg-slate-50 py-1.5 text-center text-xs font-semibold text-slate-600 hover:bg-slate-100 transition">
              📋 Menüyü İncele
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CanvaPreviewCard() {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10 transition-all hover:shadow-slate-900/15">
      {/* Canva Editor Top Bar */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
        <div className="relative">
          <PlatformIcon name="canva" className="h-9 w-9" variant="tile" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold text-slate-900">
            TastyBites · Sonbahar Kampanyası
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            Canva Connect · 1080 × 1080 px Kare Gönderi
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-cyan-50 border border-cyan-200/60 px-2.5 py-1 text-[10px] font-bold text-cyan-700">
          Eşitlendi
        </span>
      </div>

      {/* Editor Mockup Toolbar */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 border border-slate-200/60 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-3">
          <span className="text-slate-900 font-semibold">Tasarım</span>
          <span className="text-slate-400">|</span>
          <span>Bileşenler</span>
          <span>Metin</span>
          <span className="hidden sm:inline">Marka Kiti</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#FA5252]" title="Marka Rengi" />
          <span className="h-2 w-2 rounded-full bg-[#FF7D54]" title="Marka Rengi" />
          <span className="h-2 w-2 rounded-full bg-[#6D4FEB]" title="Marka Rengi" />
        </div>
      </div>

      {/* Canva Canvas Area */}
      <div className="relative mt-3 aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/50 via-white to-rose-50/50 border border-slate-200/80 p-3.5 flex flex-col justify-between">
        {/* Photo Canvas */}
        <div className="relative h-44 w-full overflow-hidden rounded-xl bg-slate-100 shadow-inner">
          <Image
            src="/images/mock-data/fresh-pastry.jpg"
            alt="Canva Template Graphic"
            fill
            className="object-cover"
          />
          <div className="absolute top-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-xs backdrop-blur-xs">
            %20 İndirim
          </div>
          <div className="absolute bottom-2.5 right-2.5 rounded-full bg-[#00C4CC] px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
            ✨ AI Tasarlandı
          </div>
        </div>

        {/* Dynamic Typography Box */}
        <div className="rounded-xl border border-dashed border-cyan-300 bg-white/90 p-3 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#FA5252]">
            Haftalık Lezzet Festivali
          </p>
          <p className="font-display text-sm font-extrabold text-slate-900 mt-0.5">
            Taze Fırından Çıkan Kruvasan & Sıcak Kahve
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Her Salı ve Cuma tüm şubelerde geçerlidir.
          </p>
        </div>

        {/* Canvas Footer Bar */}
        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
          <span>Katman 3/5 · Düzenlenebilir</span>
          <span className="font-semibold text-cyan-600">Canva&apos;da Aç ↗</span>
        </div>
      </div>

      {/* Sync Footer Button */}
      <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-slate-700">
            Canva Marka Kiti ile Tam Eşleşti
          </span>
        </div>
        <button
          type="button"
          className="rounded-lg bg-gradient-to-r from-[#00C4CC] to-[#7D2AE8] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:opacity-95 cursor-pointer"
        >
          Canva&apos;da Düzenle
        </button>
      </div>
    </div>
  );
}

export function GenericSocialPreviewCard({ name }: { name: PlatformName }) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <PlatformIcon name={name} className="h-9 w-9" variant="tile" />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-sm font-bold capitalize text-slate-900">
            {name} Entegrasyonu
          </p>
          <p className="text-[11px] text-slate-400">
            Otonom Paylaşım & Zamanlama
          </p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          Aktif
        </span>
      </div>

      <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
        <Image
          src="/images/mock-data/acai-bowl.jpg"
          alt="Post Preview"
          fill
          className="object-cover"
        />
      </div>

      <div className="mt-3 space-y-2">
        <p className="text-xs leading-relaxed text-slate-700">
          &quot;Markanızın ses tonunu öğrenen yapay zeka ile her platformda tam zamanında ve doğru dilde içerik üretin.&quot;
        </p>
        <div className="flex items-center justify-between text-[11px] font-semibold text-accent">
          <span>#pazarlama #otomasyon</span>
          <span>Resmi API Entegre</span>
        </div>
      </div>
    </div>
  );
}

