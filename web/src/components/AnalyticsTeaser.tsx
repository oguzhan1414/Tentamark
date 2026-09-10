import Image from "next/image";

/*
  Part of the white card stack (hero, connect strip, positioning and the loop
  section carry the page's dark bands; this one and the sections after it are
  the light beats in between). The alternation is a fixed per-section
  composition, not a user-togglable theme.
*/
export default function AnalyticsTeaser() {
  return (
    <section className="relative z-50 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-white text-ink shadow-[0_-12px_36px_rgba(0,0,0,0.08),0_-2px_8px_rgba(0,0,0,0.03)] border-t border-black/[0.04] px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-black/[0.015] to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-600 font-semibold mb-2">
            Performans Analitiği
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Sadece kuru bir rapor değil, <span className="text-blue-600">bir sonraki haftanın stratejisi.</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-slate-600">
            Klasik araçlar &ldquo;bu gönderi 12.000 görüntülenme aldı&rdquo; der ve
            sizi boş sayfayla baş başa bırakır. Tentamark&apos;ın yapay zekası ise
            hangi içeriğin neden çalıştığını çözümler ve döngüyü kapatır.
          </p>
        </div>

        <div
          style={{ ["--lift-rgb" as string]: "37 99 235" }}
          className="lift group relative mt-10 overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/70 p-2 sm:p-3 shadow-xl"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#0c1013] border border-slate-200/80">
            <Image
              src="/images/ui-analytics-dark.jpg"
              alt="Tentamark performans analitiği ve AI öneri döngüsü"
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 font-mono text-xs font-bold text-slate-900">
                01
              </span>
              <p className="font-body text-sm font-semibold text-slate-900">
                Veriyi toplar, örüntüyü çıkarır
              </p>
            </div>
            <p className="mt-2 pl-10 font-body text-xs leading-relaxed text-slate-600">
              Instagram, TikTok ve LinkedIn performanslarını aynı anda ölçerek en
              çok kaydedilen ve paylaşılan formatları bulur.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-mono text-xs font-bold text-white">
                02
              </span>
              <p className="font-body text-sm font-semibold text-slate-900">
                Eyleme dönüşen somut öneri üretir
              </p>
            </div>
            <p className="mt-2 pl-10 font-body text-xs leading-relaxed text-slate-600">
              &ldquo;Eğitim içerikleri ürün tanıtımlarından{" "}
              <span className="font-semibold text-blue-600">%37 daha yüksek etkileşim</span>{" "}
              aldı. Gelecek hafta için{" "}
              <span className="font-semibold text-blue-600">3 eğitim Reel&apos;i</span>{" "}
              hazırladım.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
