"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  HiOutlineArrowRight,
  HiOutlineArrowUpRight,
  HiOutlineCalendarDays,
  HiOutlineCheck,
  HiOutlineCheckCircle,
  HiOutlineFingerPrint,
  HiOutlineSparkles,
} from "react-icons/hi2";

const copy = {
  tr: {
    eyebrow: "TENTAMARK / NASIL ÇALIŞIR",
    title1: "Bir fikirden",
    title2: "yayına giden yol.",
    intro:
      "Markanızın sesini bir kez tanımlayın. İçeriği hazırlayın, her kanala uyarlayın, son kararı verin ve takvimden yönetin.",
    primary: "Ücretsiz başlayın",
    secondary: "Akışı keşfedin",
    note: "İçerik üzerindeki son söz her zaman sizde.",
    composerImageCaption: "Tek bir fikirden çok kanallı sosyal medya takvimine editoryal 3D akış",
    heroWorkflowLabel: "BİR FİKİRDEN YAYINA",
    heroBrand: "Markayı tanı",
    heroCreate: "İçeriği hazırla",
    heroPlan: "Takvime yerleştir",
    journeyEyebrow: "DÖRT ADIMDA",
    journeyTitle: "Fikrinizin nereye gittiğini her adımda görün.",
    journeyIntro:
      "Birbirinden kopuk araçlar arasında kaybolmadan, marka bilgisinden planlı gönderiye uzanan tek bir çalışma alanı.",
    steps: [
      {
        number: "01",
        label: "Marka",
        title: "Önce markanızı tanır.",
        description:
          "İşletmenizi, hedef kitlenizi ve nasıl konuşmak istediğinizi Marka DNA alanında tanımlayın. Web siteniz varsa bilgileri başlangıç için içeri aktarın; tonu, renkleri ve kaçınılacak ifadeleri siz düzenleyin.",
        bullets: ["Marka sesi ve hedef kitle", "Ürünler, değerler ve görsel kimlik", "Sonradan düzenlenebilen marka profili"],
      },
      {
        number: "02",
        label: "Üretim",
        title: "Tek fikri, kanala uygun içeriğe dönüştürün.",
        description:
          "Ne anlatmak istediğinizi yazın veya AI ile bir başlangıç fikri oluşturun. Taslağı düzenleyin; seçtiğiniz platformlar için metinleri ayrı ayrı uyarlayın, medya ve etiketlerinizi ekleyin.",
        bullets: ["AI ile fikir veya manuel başlangıç", "Platforma özel açıklamalar", "Medya, etiket ve önizleme"],
      },
      {
        number: "03",
        label: "Kontrol",
        title: "Yayınlamadan önce son kararı verin.",
        description:
          "Gönderinin nasıl görüneceğine bakın, metni iyileştirin ve gerekiyorsa ekibinizle gözden geçirin. Taslak, onay ve planlama adımları görünür kalsın.",
        bullets: ["Platform önizlemeleri", "Düzenleme ve onay akışı", "Taslakları saklama"],
      },
      {
        number: "04",
        label: "Takvim",
        title: "Planınız bir bakışta önünüzde.",
        description:
          "Gönderileri tarih ve saatleriyle aylık veya haftalık takvimde görün. Planı değiştirin, boşlukları fark edin ve yayın durumunu aynı yerden takip edin.",
        bullets: ["Aylık ve haftalık görünüm", "Tarih ve saat düzenleme", "Gönderi durumlarını takip"],
      },
    ],
    calendarEyebrow: "ÜRÜNÜN İÇİNDEN",
    calendarTitle: "Plan, sonunda gerçekten bir takvime dönüşür.",
    calendarText: "Tentamark test ortamındaki aylık takvim. Gönderiler, kampanya şeritleri, durumlar ve medya kütüphanesi aynı ekranda.",
    calendarCaption: "Gerçek ürün ekranı · Tentamark farklı sektörlerin ritmine ve takvimine uyarlanır.",
    visualProduct: "GERÇEK ÜRÜN EKRANI",
    visualEditorial: "TEMSİLİ SAHNE",
    stepImageAlts: [
      "Farklı sektörlerden girişimlerin ürünleri, marka renkleri ve hedef kitle planı bir çalışma masasında",
      "Tentamark yeni gönderi oluşturma ekranı",
      "Farklı projelerin sosyal içeriklerini yayınlamadan önce gözden geçiren girişimci",
      "Tentamark aylık içerik takvimi ve medya kütüphanesi",
    ],
    handoffEyebrow: "KONTROL SİZDE",
    handoffTitle: "AI hız kazandırır. Marka kararını siz verirsiniz.",
    handoffText:
      "Tentamark öneri ve taslak üretir; metni, görseli, kanalı ve zamanı siz seçersiniz. Böylece iş akışı hızlanırken marka diliniz üzerindeki kontrol sizde kalır.",
    handoffCards: [
      ["Başlangıcı seçin", "Bir fikir yazın veya AI önerisinden ilerleyin."],
      ["İçeriği şekillendirin", "Platform metnini ve medyayı düzenleyin."],
      ["Zamanı belirleyin", "Taslak bırakın ya da takvime planlayın."],
    ],
    faqEyebrow: "SIK SORULANLAR",
    faqTitle: "Başlamadan önce merak edilenler.",
    faqs: [
      ["Web sitem yoksa kullanabilir miyim?", "Evet. Marka bilgilerinizi, hedef kitlenizi ve ses tonunuzu elle girebilirsiniz. Web sitesi, başlangıcı kolaylaştıran bir seçenektir."],
      ["AI'ın yazdığı içeriği değiştirebilir miyim?", "Evet. Önerilen metin bir taslaktır. Açıklamaları platform bazında düzenleyebilir, medyayı ve etiketleri değiştirebilirsiniz."],
      ["Gönderiler kendiliğinden yayınlanır mı?", "Yayın zamanı ve bağlı hesaplar sizin seçimlerinize bağlıdır. Bir gönderiyi taslak olarak saklayabilir veya uygun hesap için planlayabilirsiniz."],
      ["Bir ekiple çalışabilir miyim?", "Gönderileri gözden geçirme ve onay akışları ekip çalışmasına yardımcı olur. Kullanılabilir seçenekler hesabınızın yapılandırmasına bağlıdır."],
    ],
    ctaEyebrow: "ŞİMDİ SIRA SİZDE",
    ctaTitle: "İlk fikrinizi birlikte planlayalım.",
    ctaText: "Marka profilinizi oluşturun, ilk taslağınızı hazırlayın ve içerik takviminizi görmeye başlayın.",
    ctaButton: "Tentamark'ı deneyin",
    ctaPricing: "Paketleri inceleyin",
  },
  en: {
    eyebrow: "TENTAMARK / HOW IT WORKS",
    title1: "From one idea",
    title2: "to a planned post.",
    intro:
      "Define your brand voice once. Create content, adapt it for each channel, make the final call, and manage it on your calendar.",
    primary: "Get started free",
    secondary: "Explore the workflow",
    note: "You always have the final say over your content.",
    composerImageCaption: "From a single idea to a multi-channel editorial 3D schedule",
    heroWorkflowLabel: "FROM IDEA TO PUBLISHING",
    heroBrand: "Know the brand",
    heroCreate: "Create content",
    heroPlan: "Plan on a calendar",
    journeyEyebrow: "FOUR STEPS",
    journeyTitle: "See where your idea goes at every step.",
    journeyIntro:
      "Move from brand context to a planned post in one workspace, without juggling disconnected tools.",
    steps: [
      {
        number: "01",
        label: "Brand",
        title: "Start with your brand.",
        description: "Define your business, audience, and voice in Brand DNA. If you have a website, use it as a starting point; then edit your tone, colors, and words to avoid.",
        bullets: ["Brand voice and audience", "Products, values, and visual identity", "A profile you can always edit"],
      },
      {
        number: "02",
        label: "Create",
        title: "Turn an idea into content for each channel.",
        description: "Write what you want to say or start with an AI idea. Edit your draft, tailor the copy for selected channels, and add your media and hashtags.",
        bullets: ["AI ideas or a manual start", "Channel-specific captions", "Media, hashtags, and previews"],
      },
      {
        number: "03",
        label: "Review",
        title: "Make the final call before publishing.",
        description: "Preview the post, refine the copy, and review it with your team when needed. Keep drafts, approvals, and planning visible.",
        bullets: ["Channel previews", "Editing and approval workflow", "Saved drafts"],
      },
      {
        number: "04",
        label: "Calendar",
        title: "See the plan at a glance.",
        description: "See dated posts in a monthly or weekly calendar. Adjust the plan, spot gaps, and track publishing status in one place.",
        bullets: ["Monthly and weekly views", "Edit dates and times", "Track post status"],
      },
    ],
    calendarEyebrow: "INSIDE THE PRODUCT",
    calendarTitle: "Your plan becomes a real calendar.",
    calendarText: "The monthly calendar in the Tentamark workspace. Posts, campaigns, statuses, and the media library appear together.",
    calendarCaption: "Real product screen · Tentamark adapts to different industries and marketing rhythms.",
    visualProduct: "REAL PRODUCT SCREEN",
    visualEditorial: "ILLUSTRATIVE SCENE",
    stepImageAlts: [
      "Brand colors, audience plans, and products from different businesses on a worktable",
      "Tentamark new post composer",
      "Entrepreneur reviewing social content before publishing",
      "Tentamark monthly content calendar and media library",
    ],
    handoffEyebrow: "YOU REMAIN IN CONTROL",
    handoffTitle: "AI speeds up the work. You make the brand call.",
    handoffText:
      "Tentamark suggests and drafts; you choose the copy, media, channel, and timing. That keeps the workflow fast while your brand stays under your control.",
    handoffCards: [
      ["Choose how to start", "Write an idea or build on an AI suggestion."],
      ["Shape the content", "Edit channel-specific copy and media."],
      ["Set the timing", "Leave it as a draft or schedule to calendar."],
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Questions before you start.",
    faqs: [
      ["Can I use Tentamark without a website?", "Yes. You can enter your brand details, audience, and tone manually. A website is simply a faster way to start."],
      ["Can I edit AI-generated content?", "Yes. Suggestions are drafts. Edit captions by channel and change the media and hashtags."],
      ["Will posts publish automatically?", "Publishing depends on your chosen time and connected accounts. Save a draft or schedule it for an eligible account."],
      ["Can I work with a team?", "Review and approval flows support team collaboration. Available options depend on your account setup."],
    ],
    ctaEyebrow: "YOUR TURN",
    ctaTitle: "Let's plan your first idea.",
    ctaText: "Set up your brand profile, create your first draft, and start building your content calendar.",
    ctaButton: "Try Tentamark",
    ctaPricing: "Explore plans",
  },
} as const;

const stepImages = [
  "/images/how-it-works/brand-strategy-multi-industry.png",
  "/images/how-it-works/new-post.png",
  "/images/how-it-works/content-review-multi-industry.png",
  "/images/how-it-works/calendar.png",
] as const;

function Content() {
  const { locale } = useLanguage();
  const c = copy[locale === "en" ? "en" : "tr"];
  const stepIcons = [HiOutlineFingerPrint, HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineCalendarDays];

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-bg text-ink">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-20 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:gap-16 lg:pb-28 lg:pt-28">
          <div>
            <p className="mb-7 font-mono text-[11px] font-semibold tracking-[0.19em] text-accent-text">{c.eyebrow}</p>
            <h1 className="max-w-[660px] text-[clamp(3.2rem,6.3vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.075em]">
              {c.title1}<br /><span className="text-accent">{c.title2}</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{c.intro}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/kayit" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white transition hover:bg-accent-hover">
                {c.primary} <HiOutlineArrowUpRight className="h-4 w-4" />
              </Link>
              <a href="#akis" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white px-6 text-sm font-semibold text-ink transition hover:border-ink/30">
                {c.secondary} <HiOutlineArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted"><HiOutlineCheckCircle className="h-4 w-4 text-accent" />{c.note}</p>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white p-2 shadow-[0_25px_60px_-15px_rgba(23,43,70,0.12)] transition duration-500 hover:shadow-[0_30px_70px_-12px_rgba(23,43,70,0.18)] sm:p-3">
              <div className="overflow-hidden rounded-[1.5rem] bg-[#fbf9f6]">
                <Image
                  src="/images/how-it-works/hero-composition.jpg"
                  alt={
                    locale === "en"
                      ? "Tentamark 3D editorial composition showing transition from a single idea card to a multi-channel content calendar"
                      : "Tek bir fikirden çok kanallı içerik takvimine geçişi gösteren editoryal 3D Tentamark kompozisyonu"
                  }
                  width={1200}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 580px"
                  className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.01]"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section id="akis" className="scroll-mt-24 border-t border-line bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-14 max-w-2xl">
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent-text">{c.journeyEyebrow}</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl">{c.journeyTitle}</h2>
              <p className="mt-5 text-base leading-relaxed text-muted">{c.journeyIntro}</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {c.steps.map((step, index) => {
                const Icon = stepIcons[index];
                return (
                  <article id={`adim-${step.number}`} key={step.number} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-bg">
                    <div className={`relative aspect-[16/9] overflow-hidden border-b border-line ${index === 1 || index === 3 ? "bg-white" : "bg-[#eee9e4]"}`}>
                      <Image
                        src={stepImages[index]}
                        alt={c.stepImageAlts[index]}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-3"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <div className="flex items-center gap-2 font-mono text-xs font-semibold text-accent-text">
                        <Icon className="h-4 w-4 text-accent" />
                        <span>{step.number}</span>
                        <span>·</span>
                        <span>{step.label}</span>
                      </div>
                      <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-ink sm:text-2xl">{step.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{step.description}</p>
                      <ul className="mt-5 space-y-2 border-t border-line/60 pt-5 text-xs text-muted">
                        {step.bullets.map((b) => (
                          <li key={b} className="flex items-center gap-2">
                            <HiOutlineCheck className="h-3.5 w-3.5 text-accent" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-bg py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-14 max-w-2xl">
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent-text">{c.handoffEyebrow}</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl">{c.handoffTitle}</h2>
              <p className="mt-5 text-base leading-relaxed text-muted">{c.handoffText}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {c.handoffCards.map(([title, desc], i) => (
                <div key={title} className="rounded-2xl border border-line bg-white p-6 shadow-2xs">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 font-mono text-xs font-bold text-accent">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-14 max-w-2xl">
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent-text">{c.calendarEyebrow}</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl">{c.calendarTitle}</h2>
              <p className="mt-5 text-base leading-relaxed text-muted">{c.calendarText}</p>
            </div>
            <figure className="overflow-hidden rounded-2xl border border-line bg-[#fbf9f6] p-4 shadow-sm sm:p-6">
              <Image
                src="/images/how-it-works/calendar.png"
                alt={locale === "en" ? "Tentamark calendar screen" : "Tentamark takvim ekranı"}
                width={1813}
                height={744}
                sizes="(max-width: 1024px) 100vw, 1100px"
                className="h-auto w-full rounded-xl border border-line/70"
              />
              <figcaption className="mt-4 text-center text-xs text-muted">{c.calendarCaption}</figcaption>
            </figure>
          </div>
        </section>

        <section className="border-t border-line bg-bg py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="mb-12 text-center">
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent-text">{c.faqEyebrow}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{c.faqTitle}</h2>
            </div>
            <div className="divide-y divide-line rounded-2xl border border-line bg-white px-6 sm:px-8">
              {c.faqs.map(([q, a]) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink">
                    <span>{q}</span>
                    <span className="ml-4 font-mono text-base text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-xs leading-relaxed text-muted sm:text-sm">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-white py-20 text-center sm:py-28">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-accent-text">{c.ctaEyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">{c.ctaTitle}</h2>
            <p className="mt-4 text-base text-muted">{c.ctaText}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/kayit" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-7 text-sm font-semibold text-white transition hover:bg-accent-hover">
                {c.ctaButton} <HiOutlineArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/fiyatlandirma" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-white px-7 text-sm font-semibold text-ink transition hover:border-ink/30">
                {c.ctaPricing}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function HowItWorksContent() {
  return (
    <LanguageProvider>
      <Content />
    </LanguageProvider>
  );
}
