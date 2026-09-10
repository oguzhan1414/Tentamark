import Image from "next/image";
import PlatformIcon, { type PlatformName } from "./PlatformIcon";

const PLATFORMS: { key: PlatformName; name: string; status: string; desc: string }[] = [
  { key: "instagram", name: "Instagram", status: "Aktif", desc: "Reels, gönderi, story ve otomatik zamanlama" },
  { key: "facebook", name: "Facebook", status: "Aktif", desc: "Topluluk gönderileri ve link paylaşımları" },
  { key: "linkedin", name: "LinkedIn", status: "Aktif", desc: "Profesyonel anlatım ve tartışma açan içerik" },
  { key: "tiktok", name: "TikTok", status: "Yakında", desc: "Video scriptleri, hook ve trend uyarlaması" },
];

export default function PlatformsSection() {
  return (
    <section
      id="platformlar"
      className="relative z-30 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-white text-ink shadow-[0_-12px_36px_rgba(0,0,0,0.08),0_-2px_8px_rgba(0,0,0,0.03)] border-t border-black/[0.04] px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-black/[0.015] to-transparent" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold mb-2">
            Çoklu Platform Yönetimi
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Cebinizde veya masanızda. <span className="text-blue-600">Her platforma tek dokunuşla.</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-slate-600">
            Hareket halindeyken telefonunuzdan tek dokunuşla içerikleri onaylayın, ofise geçtiğinizde iPad veya bilgisayarınızdan 30 günlük stratejiyi yönetin.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {PLATFORMS.map((p) => (
              <div
                key={p.key}
                style={{ ["--lift-rgb" as string]: "37 99 235" }}
                className="lift rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4.5 hover:border-blue-500/40 hover:bg-white transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <PlatformIcon name={p.key} className="h-9 w-9" />
                  {p.status === "Aktif" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {p.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-slate-400">
                      {p.status}
                    </span>
                  )}
                </div>
                <h4 className="mt-3 font-display text-base font-bold text-slate-900">{p.name}</h4>
                <p className="mt-1 text-xs font-body text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Mobile Push & Approval View */}
        <div className="relative flex justify-center">
          <div
            style={{ ["--lift-rgb" as string]: "37 99 235" }}
            className="lift group relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50/70 p-3 shadow-xl"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white border border-slate-200/80">
              <Image
                src="/images/ui-mobile.jpg"
                alt="Tentamark Mobil Onay ve Bildirim Görünümü"
                fill
                sizes="(min-width: 1024px) 35vw, 85vw"
                className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </div>
            <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1 shadow-sm backdrop-blur text-xs font-medium text-slate-900">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Tek Dokunuşla Onay</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
