"use client";

import StampMark from "./StampMark";

export default function FinalCta() {
  return (
    <section
      id="erken-erisim"
      className="relative z-70 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-white text-ink shadow-[0_-12px_36px_rgba(0,0,0,0.08),0_-2px_8px_rgba(0,0,0,0.03)] border-t border-black/[0.04] px-6 pt-20 pb-24 sm:pt-28 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-black/[0.015] to-transparent" aria-hidden="true" />
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <StampMark className="h-36 w-36 text-slate-900 opacity-90" />

        <p className="mt-8 font-mono text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold">
          Erken Erişim
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Markanızı anlatın, <span className="text-blue-600">planınızı görelim.</span>
        </h2>
        <p className="mt-4 max-w-md font-body text-base leading-relaxed text-slate-600">
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
            className="w-full rounded-full border border-slate-300 bg-slate-50 px-5 py-3.5 font-body text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-slate-900 px-6 py-3.5 font-body text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Listeye katıl
          </button>
        </form>

        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-slate-500">
          Spam yok · İstediğiniz zaman ayrılın
        </p>
      </div>
    </section>
  );
}
