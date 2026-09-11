import Image from "next/image";
import PlatformIcon, { type RoadmapPlatformName } from "./PlatformIcon";

type Tier = {
  key: string;
  label: string;
  hint: string;
  platforms: { key: RoadmapPlatformName; name: string; status: "Aktif" | "Yakında" }[];
};

const TIERS: Tier[] = [
  {
    key: "gorsel-video",
    label: "Görsel & Video",
    hint: "Birinci öncelik",
    platforms: [
      { key: "instagram", name: "Instagram", status: "Aktif" },
      { key: "tiktok", name: "TikTok", status: "Yakında" },
      { key: "youtube", name: "YouTube", status: "Yakında" },
      { key: "pinterest", name: "Pinterest", status: "Yakında" },
    ],
  },
  {
    key: "metin-topluluk",
    label: "Metin & Topluluk",
    hint: "İkinci öncelik",
    platforms: [
      { key: "threads", name: "Threads", status: "Yakında" },
      { key: "linkedin", name: "LinkedIn", status: "Aktif" },
      { key: "facebook", name: "Facebook", status: "Aktif" },
      { key: "x", name: "X", status: "Yakında" },
    ],
  },
  {
    key: "e-ticaret",
    label: "E-Ticaret & Dönüşüm",
    hint: "Üçüncü öncelik",
    platforms: [
      { key: "shopify", name: "Shopify", status: "Yakında" },
      { key: "google-business", name: "Google Business Profile", status: "Yakında" },
    ],
  },
  {
    key: "mesajlasma",
    label: "Mesajlaşma",
    hint: "Gelişmiş aşama",
    platforms: [
      { key: "telegram", name: "Telegram", status: "Yakında" },
      { key: "discord", name: "Discord", status: "Yakında" },
      { key: "whatsapp", name: "WhatsApp Business", status: "Yakında" },
    ],
  },
];

export default function PlatformsSection() {
  return (
    <section
      id="platformlar"
      className="relative z-30 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg-coral text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-coral-bright font-semibold mb-2">
            Çoklu Platform Yönetimi
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Cebinizde veya masanızda. <span className="text-coral-bright">Her platforma tek dokunuşla.</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted">
            Bugün Instagram, Facebook ve LinkedIn&apos;de yayında. Yol haritamız
            çok daha geniş: görsel/video, metin/topluluk, e-ticaret ve
            mesajlaşma kanallarının tamamını tek panelden yönetilebilir hale
            getiriyoruz.
          </p>
        </div>

        {/* Geniş çoklu-cihaz görseli — "cebinizde veya masanızda" mesajını
            doğrudan gösterir, dar tek-telefon kartı yerine. */}
        <div
          style={{ ["--lift-rgb" as string]: "255 84 112" }}
          className="lift group relative mt-10 overflow-hidden rounded-[1.75rem] border border-line bg-surface/70 p-2 shadow-xl sm:p-4"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-surface border border-line">
            <Image
              src="/images/ui-devices.png"
              alt="Tentamark bilgisayar, tablet ve telefon ekranında"
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />
          </div>
          <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full border border-line bg-surface/95 px-3 py-1 shadow-sm backdrop-blur text-xs font-medium text-ink">
            <span className="flex h-2 w-2 rounded-full bg-mint animate-pulse" />
            <span>Tek Dokunuşla Onay</span>
          </div>
        </div>

        {/* Full roadmap, grouped by rollout priority — the grouping itself is
            the information: which channels land first isn't arbitrary. */}
        <div className="mt-14 space-y-8">
          {TIERS.map((tier) => (
            <div key={tier.key}>
              <div className="flex items-baseline gap-2.5">
                <h3 className="font-display text-sm font-bold text-ink">{tier.label}</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
                  {tier.hint}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                {tier.platforms.map((p) => (
                  <div
                    key={p.key}
                    className="flex items-center gap-2.5 rounded-full border border-line bg-surface/80 py-1.5 pl-1.5 pr-4 shadow-sm"
                  >
                    <PlatformIcon name={p.key} className="h-8 w-8 shrink-0" />
                    <span className="font-body text-sm font-medium text-ink">{p.name}</span>
                    {p.status === "Aktif" ? (
                      <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-mint" aria-label="Aktif" title="Aktif" />
                    ) : (
                      <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-faint">
                        yakında
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
