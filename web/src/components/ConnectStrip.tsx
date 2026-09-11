"use client";

import { useState } from "react";
import PlatformIcon, { type RoadmapPlatformName } from "./PlatformIcon";

type PlatformItem = {
  key: RoadmapPlatformName;
  name: string;
  role: string;
  glowColor: string;
  live: boolean;
};

type PlatformZone = {
  id: string;
  title: string;
  badge: string;
  platforms: PlatformItem[];
};

const ZONES: PlatformZone[] = [
  {
    id: "gorsel-video",
    title: "Görsel & Video",
    badge: "1. Öncelik",
    platforms: [
      { key: "instagram", name: "Instagram", role: "9:16 Reels & Hikaye kurgusu, renk uyumu ve trend hashtag analizi", glowColor: "rgba(228,64,95,0.45)", live: true },
      { key: "tiktok", name: "TikTok", role: "Trend sesler, dinamik video kancaları (hook) ve viral formatlama", glowColor: "rgba(20,20,20,0.35)", live: false },
      { key: "youtube", name: "YouTube", role: "Shorts dikey video akışı ve görsel topluluk gönderileri", glowColor: "rgba(255,0,0,0.45)", live: false },
      { key: "pinterest", name: "Pinterest", role: "Görsel ilham panoları, ürün pinleri ve organik arama trafiği", glowColor: "rgba(230,0,35,0.45)", live: false },
    ],
  },
  {
    id: "metin-topluluk",
    title: "Metin & Topluluk",
    badge: "2. Öncelik",
    platforms: [
      { key: "linkedin", name: "LinkedIn", role: "B2B düşünce liderliği, sektörel analiz tonu ve profesyonel ağ etkileşimi", glowColor: "rgba(10,102,194,0.45)", live: true },
      { key: "facebook", name: "Facebook", role: "Geniş kitle erişimi, topluluk grupları ve kurumsal haber paylaşımları", glowColor: "rgba(8,102,255,0.45)", live: true },
      { key: "threads", name: "Threads", role: "Mikro blog formatı, samimi sohbet dili ve hızlı düşünce paylaşımları", glowColor: "rgba(20,20,20,0.35)", live: false },
      { key: "x", name: "X", role: "Gündem takibi, anlık etkileşim kurgusu ve vurucu kısa tweet akışı", glowColor: "rgba(20,20,20,0.35)", live: false },
    ],
  },
  {
    id: "e-ticaret",
    title: "E-Ticaret & Arama",
    badge: "3. Öncelik",
    platforms: [
      { key: "shopify", name: "Shopify", role: "Otomatik ürün kataloğu beslemesi, yeni koleksiyon vitrini ve satış dönüşümü", glowColor: "rgba(149,191,71,0.45)", live: false },
      { key: "google-business", name: "Google Business", role: "Google Harita & Arama görünürlüğü, haftalık yerel işletme güncellemeleri", glowColor: "rgba(66,133,244,0.45)", live: false },
    ],
  },
  {
    id: "mesajlasma",
    title: "Doğrudan İletişim",
    badge: "Gelişmiş Aşama",
    platforms: [
      { key: "whatsapp", name: "WhatsApp Business", role: "VIP müşteri listeleri, duyuru kanalları ve doğrudan satın alma yönlendirmesi", glowColor: "rgba(37,211,102,0.45)", live: false },
      { key: "telegram", name: "Telegram", role: "Özel duyuru kanalları, sadakat kulüpleri ve anlık bildirim yayını", glowColor: "rgba(38,165,228,0.45)", live: false },
      { key: "discord", name: "Discord", role: "Marka sunucuları, kapalı topluluk etkileşimi ve üyelere özel duyurular", glowColor: "rgba(88,101,242,0.45)", live: false },
    ],
  },
];

export default function ConnectStrip() {
  const [activePlatform, setActivePlatform] = useState<PlatformItem | null>(null);

  return (
    <section className="relative border-t border-line bg-bg py-12 sm:py-16 overflow-hidden">
      {/* Ambient arka plan ışığı */}
      <div
        className="glow pointer-events-none absolute left-1/2 top-10 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full"
        style={{ background: "var(--spectrum)", opacity: 0.12 }}
        aria-hidden="true"
      />

      {/* Üst Başlık ve Açıklama */}
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-subtle px-3.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-text shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Omnichannel Orkestrasyon Merkezi
        </div>

        <h2 className="mt-3.5 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
          Bir kere oluşturun, <span className="spectrum-text">her platforma kusursuz adapte edin.</span>
        </h2>

        <p className="mx-auto mt-3 max-w-3xl font-body text-sm leading-relaxed text-muted sm:text-base">
          Tentamark içeriklerinizi sadece farklı kanallara göndermez, onları mecraya göre
          dönüştürür. Ana fikriniz yapay zeka tarafından analiz edilir; en doğru format,
          çözünürlük ve dille doğrudan hedef kitlenize ulaştırılır.
        </p>
      </div>

      {/* Platform bölgeleri — sayılar kaldırıldı, tam genişlikte düzenli görünüm */}
      <div className="relative mt-10 w-full">
        <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-8 sm:gap-x-14 lg:gap-x-16">
          {ZONES.map((zone) => (
            <div key={zone.id} className="flex flex-col items-center text-center">
              {/* Kategori Başlığı (Sayı kaldırıldı) */}
              <div className="mb-3 flex items-center justify-center">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-ink">
                  {zone.title}
                </span>
              </div>

              {/* Platform Logoları */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {zone.platforms.map((platform) => {
                  const isHovered = activePlatform?.key === platform.key;
                  return (
                    <div
                      key={platform.key}
                      onMouseEnter={() => setActivePlatform(platform)}
                      onMouseLeave={() => setActivePlatform(null)}
                      className="group relative cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:scale-105 active:scale-95"
                    >
                      <div
                        className={`relative rounded-2xl transition-all duration-300 ${platform.live ? "spectrum-ring" : ""}`}
                        style={{
                          boxShadow: isHovered
                                ? `0 12px 24px -4px ${platform.glowColor}`
                                : `0 4px 12px -4px ${platform.glowColor}`,
                        }}
                      >
                        <PlatformIcon
                          name={platform.key}
                          className="h-13 w-13 sm:h-14 sm:w-14 lg:h-15 lg:w-15 !rounded-2xl shadow-sm"
                        />
                        {platform.live && (
                          <span
                            className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-surface bg-mint"
                            aria-hidden="true"
                          />
                        )}
                      </div>

                      {/* Hover Tooltip */}
                      <div className="pointer-events-none absolute -top-10 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 font-body text-[11px] font-semibold text-white opacity-0 shadow-xl transition-all duration-150 group-hover:opacity-100">
                        {platform.name}
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-ink" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-8 max-w-6xl px-6">
        {/* İnteraktif Adaptasyon Bilgi Şeridi */}
        <div className="flex min-h-[44px] items-center justify-center rounded-xl border border-line/60 bg-surface px-4 py-2.5 text-center text-xs font-body transition-all duration-200">
          {activePlatform ? (
            <div className="flex flex-wrap items-center justify-center gap-2 text-ink animate-in fade-in duration-200">
              <span className="font-semibold text-accent-text">{activePlatform.name} Adaptasyonu:</span>
              <span className="text-muted">{activePlatform.role}</span>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-faint">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Herhangi bir platformun üzerine gelin — Tentamark&apos;ın o mecraya özel adaptasyon kurgusunu görün.
            </p>
          )}
        </div>

        {/* Alt Güvenlik & Yetkilendirme Şeridi (Ortalanmış, sağdaki paket metni kaldırıldı) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-line/60 pt-5 text-xs font-body text-muted sm:gap-6 text-center">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <svg className="h-4 w-4 text-mint" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Resmi OAuth 2.0 & Sıfır Şifre Paylaşımı
          </span>
          <span className="hidden text-line sm:inline">•</span>
          <span>Uçtan Uca Şifreli Güvenli API</span>
          <span className="hidden text-line sm:inline">•</span>
          <span>Otomatik Format & Çözünürlük Dönüşümü</span>
        </div>
      </div>
    </section>
  );
}
