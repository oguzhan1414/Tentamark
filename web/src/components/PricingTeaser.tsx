// Alternating tint (mor-beyaz-mor-beyaz), not a "this one's best" callout —
// the badge was removed, so `tinted` is purely a rhythm/scan aid across the
// four columns now, not a recommendation signal.
const TIERS = [
  { name: "Free", price: "$0", for: "Denemek isteyenler için", tinted: true },
  { name: "Starter", price: "$19", for: "Tek başına yönetenler için", tinted: false },
  { name: "Pro", price: "$49", for: "Büyüyen markalar için", tinted: true },
  { name: "Business", price: "$99", for: "Ekip ve ajanslar için", tinted: false },
];

// Every row grounded in something real or already committed to elsewhere on
// the page — nothing invented just to pad the table out. Prices are fixed,
// not ranges: a real policy to react to, not a shrug. Positioned deliberately
// under the closest AI-content peers we researched (Predis.ai $24/$55/$212,
// Ocoya $29/$79/$199) — a new, unlaunched entrant prices under the
// established players it's closest to, not above them.
const FEATURES: { label: string; values: [string, string, string, string] }[] = [
  { label: "Marka sayısı", values: ["1", "2", "5", "Sınırsız"] },
  { label: "Sosyal hesap sayısı", values: ["1", "5", "15", "40"] },
  { label: "AI kredisi / ay", values: ["5", "150", "500", "1.500"] },
  { label: "Görsel üretimi", values: ["—", "✓", "✓", "✓"] },
  { label: "Video üretimi", values: ["—", "—", "✓", "✓"] },
  { label: "İçerik takvimi", values: ["Temel", "Temel", "Sürükle-bırak + öneriler", "Sürükle-bırak + öneriler"] },
  { label: "Onay akışı", values: ["Tek aşama", "Tek aşama", "Çok aşama", "Çok aşama + roller"] },
  { label: "Haftalık AI içerik paketi", values: ["—", "✓", "✓", "✓"] },
  { label: "Performans → strateji analizi", values: ["—", "Temel", "Gelişmiş", "Gelişmiş"] },
  { label: "Ekip üyesi", values: ["1", "1", "3", "Sınırsız"] },
  { label: "Destek", values: ["Topluluk", "E-posta", "Öncelikli e-posta", "Öncelikli + özel temsilci"] },
];

function Cell({ value, tinted }: { value: string; tinted: boolean }) {
  if (value === "✓") {
    return <span className={`font-bold ${tinted ? "text-accent-text" : "text-mint"}`}>✓</span>;
  }
  if (value === "—") {
    return <span className="text-faint">—</span>;
  }
  return <span className={tinted ? "font-semibold text-ink" : "text-muted"}>{value}</span>;
}

export default function PricingTeaser() {
  return (
    <section
      id="fiyatlandirma"
      className="relative z-80 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-text">
            Fiyatlandırma
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Küçük başlayın, <span className="spectrum-text">büyüdükçe genişletin.</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted">
            Fiyatlar henüz kesinleşmedi. İlk kullanıcılarımızla birlikte test
            ediyoruz, ama aşağıdaki rakamlar bir taslak değil — bugünkü hedef
            politikamız bu.
          </p>
          <p className="mt-2 font-body text-sm leading-relaxed text-faint">
            AI kredisi nedir? Bir metin gönderisi ~1, bir görsel ~5, bir video
            ~15 kredi kullanır — üretim gücü farklı olduğu için tüketimleri de
            farklıdır.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-surface shadow-sm">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-48 border-b border-line bg-surface p-4 align-bottom" />
                {TIERS.map((tier) => (
                  <th
                    key={tier.name}
                    className={
                      "border-b border-line p-4 align-bottom " +
                      (tier.tinted ? "bg-accent-subtle" : "")
                    }
                  >
                    <p className="font-display text-base font-bold text-ink">{tier.name}</p>
                    <p className="mt-0.5 font-mono text-xl font-bold text-accent-text">
                      {tier.price}
                      <span className="ml-1 font-body text-xs font-normal text-faint">/ay</span>
                    </p>
                    <p className="mt-0.5 font-body text-[11px] font-normal text-muted">{tier.for}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, i) => (
                <tr key={feature.label} className={i % 2 === 1 ? "bg-surface-soft/50" : undefined}>
                  <td className="sticky left-0 z-10 border-b border-line bg-[inherit] p-4 font-body text-sm font-medium text-ink">
                    {feature.label}
                  </td>
                  {feature.values.map((val, ti) => (
                    <td
                      key={TIERS[ti].name}
                      className={
                        "border-b border-line p-4 text-center font-body text-sm " +
                        (TIERS[ti].tinted ? "bg-accent-subtle/40" : "")
                      }
                    >
                      <Cell value={val} tinted={TIERS[ti].tinted} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
