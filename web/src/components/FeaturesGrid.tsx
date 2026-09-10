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

const FEATURES = [
  {
    icon: IconConsistency,
    title: "Marka tutarlılığı",
    body: "Her içerik, markanızın tonuna, renklerine ve yasak konularına sadık kalır. Brand DNA'nız tüm üretimin temelidir.",
  },
  {
    icon: IconApproval,
    title: "İnsan onaylı yayınlama",
    body: "AI önerir, siz onaylarsınız. Onayınız olmadan tek bir gönderi bile yayınlanmaz.",
  },
  {
    icon: IconAdapt,
    title: "Platforma özel uyarlama",
    body: "Aynı fikir; Instagram'da kısa ve enerjik, LinkedIn'de profesyonel ve tartışmaya açık şekilde yeniden yazılır.",
  },
  {
    icon: IconCalendar,
    title: "İçerik takvimi",
    body: "Haftalık ve aylık görünümde, markanızın önümüzdeki 30 gününü tek bakışta görün.",
  },
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
];

export default function FeaturesGrid() {
  return (
    <section
      id="ozellikler"
      className="relative z-40 -mt-8 sm:-mt-12 rounded-t-[2.25rem] sm:rounded-t-[3rem] lg:rounded-t-[3.5rem] bg-[#0a0a0b] text-white shadow-[0_-16px_40px_rgba(0,0,0,0.18),0_-3px_10px_rgba(0,0,0,0.08)] border-t border-white/[0.08] px-6 pt-16 pb-24 sm:pt-24 sm:pb-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[inherit] bg-gradient-to-b from-white/[0.03] to-transparent" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Bir asistan değil, <span className="text-sky-400">bir yönetici.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-[#121214] p-7 transition-colors hover:bg-[#18181c]">
              <Icon className="h-6 w-6 stroke-accent" />
              <h3 className="mt-5 font-display text-lg font-semibold text-white">
                {title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-white/70">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
