import Image from "next/image";

export default function AnalyticsTeaser() {
  return (
    <section className="relative z-70 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-text font-semibold mb-2">
            Performans Analitiği
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Sadece kuru bir rapor değil, <span className="spectrum-text">bir sonraki haftanın stratejisi.</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted">
            Klasik araçlar &ldquo;bu gönderi 12.000 görüntülenme aldı&rdquo; der ve
            sizi boş sayfayla baş başa bırakır. Tentamark&apos;ın yapay zekası ise
            hangi içeriğin neden çalıştığını çözümler ve döngüyü kapatır.
          </p>
        </div>

        <div
          style={{ ["--lift-rgb" as string]: "109 79 235" }}
          className="lift group relative mt-10 overflow-hidden rounded-2xl border border-line bg-surface-soft p-2 sm:p-3 shadow-xl"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-bg border border-line">
            <Image
              src="/images/analytics-strategy-loop.jpeg"
              alt="Tentamark performans verisini analiz edip gelecek haftanın içerik önerisine dönüştürür"
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface-soft p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-strong font-mono text-xs font-bold text-ink">
                01
              </span>
              <p className="font-body text-sm font-semibold text-ink">
                Veriyi toplar, örüntüyü çıkarır
              </p>
            </div>
            <p className="mt-2 pl-10 font-body text-xs leading-relaxed text-muted">
              Instagram, TikTok ve LinkedIn performanslarını aynı anda ölçerek en
              çok kaydedilen ve paylaşılan formatları bulur.
            </p>
          </div>

          <div className="rounded-2xl border border-accent/25 bg-accent-subtle p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-bold text-white">
                02
              </span>
              <p className="font-body text-sm font-semibold text-ink">
                Eyleme dönüşen somut öneri üretir
              </p>
            </div>
            <p className="mt-2 pl-10 font-body text-xs leading-relaxed text-muted">
              &ldquo;Eğitim içerikleri ürün tanıtımlarından{" "}
              <span className="font-semibold text-accent-text">%37 daha yüksek etkileşim</span>{" "}
              aldı. Gelecek hafta için{" "}
              <span className="font-semibold text-accent-text">3 eğitim Reel&apos;i</span>{" "}
              hazırladım.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
