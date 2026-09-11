import Image from "next/image";

const CASES = [
  {
    image: "/images/usecase-1-solo.jpeg",
    title: "Tek başına yöneten işletme sahibi",
    desc: "Sosyal medyaya ayıracak vaktiniz yok. Tentamark haftalık planı hazırlar, siz onaylarsınız.",
    tag: "Zaman kazanır",
    cardBg: "bg-bg-violet",
    points: ["Haftalık içerik planı otomatik hazırlanır.", "Tek tıkla onaylarsınız, gerisini biz hallederiz."],
  },
  {
    image: "/images/usecase-2-local.jpeg",
    title: "Lokal işletme (kafe, kuaför, klinik)",
    desc: "Düzenli paylaşım disiplinini tutturmak zor. Tentamark hatırlatma beklemeden, her hafta aynı kalitede üretir.",
    tag: "Düzeni korur",
    cardBg: "bg-bg-amber",
    points: ["Her hafta aynı kalitede içerik, hatırlatmaya gerek yok.", "Kafe, kuaför, klinik — hepsi için aynı disiplin."],
  },
  {
    image: "/images/usecase-3-team.jpeg",
    title: "Küçük ekip veya ajans",
    desc: "Birden fazla markayı tek panelden yönetin — her biri kendi Brand DNA'sıyla ayrışır.",
    tag: "Ölçeklenir",
    cardBg: "bg-bg-sky",
    points: ["Birden fazla markayı tek panelden yönetin.", "Her marka kendi Brand DNA'sıyla ayrışır."],
  },
  {
    image: "/images/usecase-4-ecommerce.jpeg",
    title: "E-ticaret markası",
    desc: "Kampanya dönemlerinde içerik hacmi patlar. Tek fikri her platforma doğru formatta uyarlarız.",
    tag: "Kampanyaya hazır",
    cardBg: "bg-bg-coral",
    points: ["Kampanya dönemlerinde içerik hacmini karşılar.", "Tek fikri her platforma doğru formatta uyarlar."],
  },
  {
    image: "/images/usecase-5-consultant.jpeg",
    title: "Danışman, koç, kişisel marka",
    desc: "Uzmanlığınızı düzenli içerikle görünür kılın. Fikir üretme yükünü biz alırız, sözü siz söylersiniz.",
    tag: "Görünürlük kazandırır",
    cardBg: "bg-bg-mint",
    points: ["Uzmanlığınızı düzenli içerikle görünür kılar.", "Fikir üretme yükünü biz alırız, sözü siz söylersiniz."],
  },
  {
    image: "/images/usecase-6-startup.jpeg",
    title: "Yeni kurulan marka veya girişim",
    desc: "Sıfırdan görünürlük inşa etmek zaman alır. Tentamark ilk günden düzenli, tutarlı bir içerik akışı kurar.",
    tag: "Hızlı görünürlük kazandırır",
    cardBg: "bg-bg-violet",
    points: ["İlk günden itibaren düzenli içerik akışı kurar.", "Sıfırdan marka bilinirliği hızla inşa edilir."],
  },
];

export default function UseCasesSection() {
  return (
    <section
      id="kullanim-senaryolari"
      className="relative z-40 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-text font-semibold mb-2">
            Kullanım Senaryoları
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Farklı işler, <span className="spectrum-text">aynı ihtiyaç.</span>
          </h2>
          <p className="mt-3 font-body text-base leading-relaxed text-muted">
            Sektör farklı olsa da sorun aynı: içerik üretecek zaman veya ekip yok.
            Tentamark&apos;ı kullananların gerçek profilleri.
          </p>
        </div>

        {/* Each card is a flashcard: the front is the always-visible, fully
            accessible content (image, tag, title, description). The back is
            a bonus flourish shown on hover/focus only — concrete feature
            bullets, marked aria-hidden since the front already carries the
            full message and nothing is lost for non-hovering or AT users. */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => (
            <div
              key={c.title}
              style={{ ["--lift-rgb" as string]: "109 79 235" }}
              tabIndex={0}
              className="lift group rounded-2xl [perspective:1400px] focus:outline-none"
            >
              <div className="relative h-[27rem] w-full transition-transform duration-700 ease-out motion-reduce:duration-0 motion-reduce:transition-none [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)]">
                {/* Front */}
                <div
                  className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-line shadow-sm [backface-visibility:hidden] ${c.cardBg}`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={c.image}
                      alt={c.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <span className="inline-flex items-center rounded-full border border-line bg-surface/70 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                      {c.tag}
                    </span>
                    <h3 className="mt-3 font-display text-lg font-bold text-ink">{c.title}</h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-muted">{c.desc}</p>
                  </div>
                </div>

                {/* Back */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-0 flex flex-col justify-center overflow-hidden rounded-2xl border border-line p-7 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] ${c.cardBg}`}
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                    {c.tag}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold text-ink">{c.title}</h3>
                  <ul className="mt-4 space-y-3">
                    {c.points.map((point) => (
                      <li key={point} className="flex gap-2.5 font-body text-sm leading-relaxed text-muted">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
