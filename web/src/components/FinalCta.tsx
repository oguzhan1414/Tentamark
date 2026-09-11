"use client";

import StampMark from "./StampMark";

export default function FinalCta() {
  return (
    <section
      id="erken-erisim"
      className="relative z-100 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg-violet text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-20 pb-24 sm:pt-28 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <StampMark className="h-36 w-36 text-accent opacity-90" />

        <p className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-accent-text font-semibold">
          Erken Erişim
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Markanızı anlatın, <span className="spectrum-text">planınızı görelim.</span>
        </h2>
        <p className="mt-4 max-w-md font-body text-base leading-relaxed text-muted">
          Şu an erken erişim listesi oluşturuyoruz. İlk kullanıcı grubuna
          katılın, ürün hazır olduğunda ilk siz haberdar olun.
        </p>

        <form
          className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="ornek@marka.com"
            className="w-full rounded-full border border-line bg-surface px-5 py-3.5 font-body text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-accent px-6 py-3.5 font-body text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgb(109_79_235/0.6)] transition-colors hover:bg-accent-hover"
          >
            Listeye katıl
          </button>
        </form>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-faint">
          Spam yok · İstediğiniz zaman ayrılın
        </p>
      </div>
    </section>
  );
}
