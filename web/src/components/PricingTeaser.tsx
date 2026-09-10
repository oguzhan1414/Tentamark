const TIERS = [
  {
    name: "Free",
    price: "$0",
    for: "Denemek isteyenler için",
    items: ["1 marka", "1 sosyal hesap", "5 AI içerik / ay", "Temel takvim"],
  },
  {
    name: "Starter",
    price: "$9-15",
    for: "Tek başına yönetenler için",
    items: ["1-2 marka", "3-5 sosyal hesap", "50 AI içerik / ay", "Zamanlama + analiz"],
  },
  {
    name: "Pro",
    price: "$29-49",
    for: "Büyüyen markalar için",
    items: ["5 marka", "Tüm platformlar", "Gelişmiş analiz", "AI strateji önerisi"],
    featured: true,
  },
  {
    name: "Business",
    price: "$79+",
    for: "Küçük ekipler için",
    items: ["Çoklu marka", "Ekip erişimi", "Onay iş akışları", "Yüksek limitler"],
  },
];

// Follows the dark band, so it lifts over it with a matching top radius and a
// negative pull. No top border: the colour change is the seam.
export default function PricingTeaser() {
  return (
    <section
      id="fiyatlandirma"
      className="relative z-60 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-[#0a0a0b] text-white shadow-[0_-16px_40px_rgba(0,0,0,0.18),0_-3px_10px_rgba(0,0,0,0.08)] border-t border-white/[0.08] px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[inherit] bg-gradient-to-b from-white/[0.03] to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
            Fiyatlandırma
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Küçük başlayın, <span className="text-sky-400">büyüdükçe genişletin.</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-white/70">
            Fiyatlar henüz kesinleşmedi. İlk kullanıcılarımızla birlikte
            test ediyoruz, aşağıdaki rakamlar bir yön, bir taahhüt değil.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={
                "rounded-2xl border p-6 transition-colors " +
                (tier.featured
                  ? "border-accent bg-[#181822] shadow-xl"
                  : "border-white/10 bg-[#121214] hover:border-white/20")
              }
            >
              <p className="font-display text-lg font-semibold text-white">
                {tier.name}
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold text-accent">
                {tier.price}
                <span className="ml-1 font-body text-xs font-normal text-white/50">/ay</span>
              </p>
              <p className="mt-1 font-body text-xs text-white/60">{tier.for}</p>

              <ul className="mt-5 space-y-2 border-t border-white/10 pt-5">
                {tier.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 font-body text-sm text-white/80">
                    <span className="mt-1 text-mint" aria-hidden="true">
                      ·
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
