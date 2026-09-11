type IconProps = { className?: string };

function IconConsistency({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconApproval({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" strokeWidth="1.5" />
      <path d="M7.5 12.5l3 3 6-6.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconAdapt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="5" cy="12" r="2" strokeWidth="1.5" />
      <circle cx="18" cy="5.5" r="2" strokeWidth="1.5" />
      <circle cx="18" cy="12" r="2" strokeWidth="1.5" />
      <circle cx="18" cy="18.5" r="2" strokeWidth="1.5" />
      <path d="M7 12h9M16 6.6l-6.5 4.6M16 17.4l-6.5-4.6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" strokeWidth="1.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconInsight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 19V13M10.5 19V9M17 19V6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.5 6.5L17 4l3 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSpark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3.5c.6 3 2 4.4 5 5-3 .6-4.4 2-5 5-.6-3-2-4.4-5-5 3-.6 4.4-2 5-5z"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M19 16.5c.3 1.4.9 2 2.3 2.3-1.4.3-2 .9-2.3 2.3-.3-1.4-.9-2-2.3-2.3 1.4-.3 2-.9 2.3-2.3z" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

function IconImage({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" strokeWidth="1.5" />
      <circle cx="8.5" cy="9.5" r="1.5" strokeWidth="1.5" />
      <path d="M4 16l4.5-4.5a2 2 0 012.8 0L15 15l1.2-1.2a2 2 0 012.8 0L20 15.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconVideo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="5.5" width="13" height="13" rx="2" strokeWidth="1.5" />
      <path d="M16.5 10l4-2.5v9l-4-2.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FOUNDATION = {
  icon: IconConsistency,
  title: "Marka tutarlılığı",
  body: "Her içerik, markanızın tonuna, renklerine ve yasak konularına sadık kalır. Brand DNA'nız tüm üretimin temelidir.",
};

// A manager's job isn't one skill, it's several — grouped here instead of a
// flat icon grid so the "yönetici" framing shows up in the structure itself,
// not just the headline.
const GROUPS = [
  {
    key: "uretim",
    label: "İçerik Üretimi",
    cardBg: "bg-bg-coral",
    iconColor: "text-coral-bright",
    items: [
      {
        icon: IconAdapt,
        title: "Platforma özel uyarlama",
        body: "Aynı fikir; Instagram'da kısa ve enerjik, LinkedIn'de profesyonel ve tartışmaya açık şekilde yeniden yazılır.",
      },
      {
        icon: IconImage,
        title: "Görsel üretimi",
        body: "Çekim konseptini yazın, markanızın renk paletine uygun profesyonel bir görsel AI ile üretilsin.",
      },
      {
        icon: IconVideo,
        title: "Video üretimi",
        body: "Aynı motor, kısa reklam ve sosyal medya videoları da üretir — stüdyoya gerek kalmadan.",
      },
    ],
  },
  {
    key: "operasyon",
    label: "Operasyon & Onay",
    cardBg: "bg-bg-violet",
    iconColor: "text-accent-text",
    items: [
      {
        icon: IconApproval,
        title: "İnsan onaylı yayınlama",
        body: "AI önerir, siz onaylarsınız. Onayınız olmadan tek bir gönderi bile yayınlanmaz.",
      },
      {
        icon: IconCalendar,
        title: "İçerik takvimi",
        body: "Haftalık ve aylık görünümde, markanızın önümüzdeki 30 gününü tek bakışta görün.",
      },
    ],
  },
  {
    key: "analiz",
    label: "Analiz & Öğrenme",
    cardBg: "bg-bg-mint",
    iconColor: "text-mint",
    items: [
      {
        icon: IconInsight,
        title: "Performanstan öneriye",
        body: "Hangi içerik neden iyi çalıştı, AI analiz eder ve bir sonraki planı buna göre yeniden kurar.",
      },
      {
        icon: IconSpark,
        title: "Haftalık AI önerileri",
        body: "Boş sayfa yok. Her hafta markanıza özel, hazır içerik fikirleriyle başlarsınız.",
      },
    ],
  },
];

export default function FeaturesGrid() {
  return (
    <section
      id="ozellikler"
      className="relative z-60 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-bg-violet text-ink shadow-[0_-10px_30px_rgba(28,20,48,0.05)] border-t border-line px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[inherit] bg-gradient-to-b from-white/40 to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-text font-semibold mb-2">
            Neler Yapar
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Bir asistan değil, <span className="spectrum-text">bir yönetici.</span>
          </h2>
          <p className="mt-3 font-body text-base leading-relaxed text-muted">
            Stratejiden içerik üretimine, onaydan analize kadar; markanızın sosyal
            medya operasyonunun tamamı tek elden yürür.
          </p>
        </div>

        {/* Foundation: everything else in this section depends on it, so it
            sits alone, above the three operational pillars, not as a fourth
            equal card. */}
        <div
          style={{ ["--lift-rgb" as string]: "109 79 235" }}
          className="lift spectrum-ring relative mt-10 flex flex-col gap-4 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:gap-6 sm:p-7"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-subtle text-accent-text">
            <FOUNDATION.icon className="h-6 w-6 stroke-current" />
          </div>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">Temel</p>
            <h3 className="mt-1 font-display text-lg font-bold text-ink">{FOUNDATION.title}</h3>
            <p className="mt-1 font-body text-sm leading-relaxed text-muted">{FOUNDATION.body}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div
              key={group.key}
              className={`rounded-2xl border border-line p-6 shadow-sm sm:p-7 ${group.cardBg}`}
            >
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                {group.label}
              </p>
              <div className="mt-4 space-y-5">
                {group.items.map(({ icon: Icon, title, body }) => (
                  <div key={title}>
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-5 w-5 stroke-current ${group.iconColor}`} />
                      <h4 className="font-display text-base font-bold text-ink">{title}</h4>
                    </div>
                    <p className="mt-1.5 font-body text-sm leading-relaxed text-muted">{body}</p>
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
