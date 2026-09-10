import PlatformIcon, { type PlatformName } from "./PlatformIcon";

const LIVE: PlatformName[] = ["instagram", "facebook", "linkedin"];
const SOON: PlatformName[] = ["tiktok", "youtube", "threads", "x", "pinterest"];

export default function ConnectStrip() {
  return (
    <section className="bg-[#0a0a0b] px-6 py-6 sm:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 px-6 py-7 sm:px-9 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-lg font-bold leading-snug text-white">
            Hesaplarınızı bağlayın
          </p>
          <p className="mt-1 font-body text-sm text-white/70">
            Şifrenizi istemeyiz. Güvenli OAuth ile tek tıkla bağlanır.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {LIVE.map((name) => (
            <PlatformIcon key={name} name={name} className="h-11 w-11" />
          ))}

          <span className="mx-1 hidden h-8 w-px bg-white/15 sm:block" />

          {/* Not connected yet: the mark stays recognisable but recedes, so the
              row reads as a roadmap rather than an overclaim. */}
          {SOON.map((name) => (
            <PlatformIcon
              key={name}
              name={name}
              className="h-11 w-11 opacity-35 grayscale"
            />
          ))}
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
            yakında
          </span>
        </div>
      </div>
    </section>
  );
}
