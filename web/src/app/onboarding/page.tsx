"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  HiCheck,
  HiOutlineArrowRight,
  HiOutlineArrowLeft,
  HiOutlineGlobeAlt,
  HiOutlineBuildingStorefront,
  HiOutlineComputerDesktop,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineShoppingBag,
  HiOutlineAcademicCap,
  HiOutlineMegaphone,
  HiOutlineQuestionMarkCircle,
  HiOutlineArrowPath,
  HiOutlineSparkles,
} from "react-icons/hi2";
import {
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaTiktok,
  FaFacebook,
} from "react-icons/fa6";
import TentamarkLogo from "@/components/TentamarkLogo";
import { createClient } from "@/lib/supabase/client";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Step Definitions (FeedHive Format)
const STEPS = [
  { id: 1, key: "what_do_you_do", title: "Ne yapıyorsun?", subtitle: "İşletme Modeli" },
  { id: 2, key: "target_market", title: "Hedef Pazar & Özel Günler", subtitle: "Ülke & Takvim" },
  { id: 3, key: "team_size", title: "Şirketinizde kaç kişi çalışıyor?", subtitle: "Ekip Büyüklüğü" },
  { id: 4, key: "social_accounts", title: "Sosyal medya hesaplarınızı ekleyin", subtitle: "Kanallar (Opsiyonel)" },
  { id: 5, key: "website", title: "Web sitenizi ekleyin", subtitle: "Marka Analizi (Opsiyonel)" },
];

// =========================================================================
// 60FPS CANLI KONFETİ PARÇACIK MOTORU (Zero external dependencies)
// =========================================================================
function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#EA580C", "#F97316", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899"];
    const particles: Array<{
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      angle: number;
      vAngle: number;
      wobble: number;
      wobbleSpeed: number;
    }> = [];

    // Left, center, and right blast points
    for (let i = 0; i < 150; i++) {
      const isLeft = i % 3 === 0;
      const isRight = i % 3 === 1;
      const x = isLeft ? canvas.width * 0.2 : isRight ? canvas.width * 0.8 : canvas.width * 0.5;
      const y = canvas.height * 0.45 + (Math.random() - 0.5) * 80;

      particles.push({
        x,
        y,
        w: Math.random() * 8 + 5,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16 + (isLeft ? 7 : isRight ? -7 : 0),
        vy: -Math.random() * 15 - 5,
        angle: Math.random() * 360,
        vAngle: (Math.random() - 0.5) * 12,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.12 + Math.random() * 0.08,
      });
    }

    let animationId: number;
    let frame = 0;

    function render() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.38; // gravity
        p.vx *= 0.98; // air drag
        p.angle += p.vAngle;
        p.wobble += p.wobbleSpeed;

        if (p.y < canvas.height + 40) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.angle * Math.PI) / 180);
          ctx.scale(Math.cos(p.wobble), 1);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }

      if (alive && frame < 360) {
        animationId = requestAnimationFrame(render);
      }
    }

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const initialStepParam = Number(searchParams.get("step")) || 1;
  const [currentStep, setCurrentStep] = useState<number>(
    initialStepParam >= 1 && initialStepParam <= 5 ? initialStepParam : 1
  );
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1 State: What do you do?
  const [selectedIndustry, setSelectedIndustry] = useState<string>("saas");

  // Step 2 State: Target Market & Calendar (Default TR)
  const [selectedMarket, setSelectedMarket] = useState<string>("tr");
  const [selectedTimezone, setSelectedTimezone] = useState<string>("Europe/Istanbul");

  // Step 3 State: Team Size
  const [selectedTeamSize, setSelectedTeamSize] = useState<string>("small");

  // Step 4 State: Social Media
  const [connectedSocials, setConnectedSocials] = useState<string[]>([]);

  // Step 5 State: Website
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [noWebsite, setNoWebsite] = useState<boolean>(false);

  // Submission & AI Generation State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [currentMilestone, setCurrentMilestone] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Load existing brand configuration & connected social channels
  useEffect(() => {
    async function loadBrandData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/giris?redirect=/onboarding");
          return;
        }

        // Fetch user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("active_brand_id, onboarding_completed")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.onboarding_completed) {
          router.replace("/dashboard");
          return;
        }

        let brandId = profile?.active_brand_id;

        // If no active_brand_id, look up membership
        if (!brandId) {
          const { data: membership } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id)
            .limit(1)
            .maybeSingle();

          if (membership?.organization_id) {
            const { data: brand } = await supabase
              .from("brands")
              .select("id, website, country, team_size, timezone")
              .eq("organization_id", membership.organization_id)
              .limit(1)
              .maybeSingle();

            if (brand) {
              brandId = brand.id;
              if (brand.website) setWebsiteUrl(brand.website);
              if (brand.country) setSelectedMarket(brand.country);
              if (brand.timezone) setSelectedTimezone(brand.timezone);
              if (brand.team_size) setSelectedTeamSize(brand.team_size);
            }
          }
        } else {
          const { data: brand } = await supabase
            .from("brands")
            .select("website, country, team_size, timezone")
            .eq("id", brandId)
            .maybeSingle();

          if (brand) {
            if (brand.website) setWebsiteUrl(brand.website);
            if (brand.country) setSelectedMarket(brand.country);
            if (brand.timezone) setSelectedTimezone(brand.timezone);
            if (brand.team_size) setSelectedTeamSize(brand.team_size);
          }
        }

        // Check if brand has industry set in brand_dna
        if (brandId) {
          const { data: dna } = await supabase
            .from("brand_dna")
            .select("industry")
            .eq("brand_id", brandId)
            .maybeSingle();

          if (dna?.industry) {
            setSelectedIndustry(dna.industry);
          }

          // Query real connected social accounts
          const { data: accounts } = await supabase
            .from("social_accounts")
            .select("platform, status")
            .eq("brand_id", brandId)
            .eq("status", "active");

          if (accounts && accounts.length > 0) {
            const activePlatforms = accounts.map((a) => a.platform);
            setConnectedSocials((prev) =>
              Array.from(new Set([...prev, ...activePlatforms]))
            );
          }
        }
      } catch (err) {
        console.warn("Could not preload onboarding brand data:", err);
      } finally {
        setAuthChecking(false);
      }
    }

    loadBrandData();
  }, [supabase, router]);

  const markStepComplete = (stepNumber: number) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps((prev) => [...prev, stepNumber]);
    }
  };

  const handleNext = async () => {
    markStepComplete(currentStep);
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleCompleteOnboarding();
    }
  };

  const handleSkip = async () => {
    markStepComplete(currentStep);
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      await handleCompleteOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const toggleSocial = (platformId: string) => {
    setConnectedSocials((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  // Step 1 Options (FeedHive Slim Horizontal Rows)
  const industryOptions = [
    { id: "ecommerce", title: "e-ticaret", icon: HiOutlineShoppingBag },
    { id: "agency", title: "Ajans", icon: HiOutlineUserGroup },
    { id: "saas", title: "SaaS", icon: HiOutlineComputerDesktop },
    { id: "creator", title: "İçerik Oluşturucu", icon: HiOutlineUser },
    { id: "marketplace", title: "Pazar yeri", icon: HiOutlineShoppingBag },
    { id: "marketing", title: "Pazarlama / Reklam", icon: HiOutlineMegaphone },
    { id: "local_business", title: "Kafe, Restoran & Yerel İşletme", icon: HiOutlineBuildingStorefront },
    { id: "education", title: "Eğitim", icon: HiOutlineAcademicCap },
    { id: "other", title: "Diğer", icon: HiOutlineQuestionMarkCircle },
  ];

  // Step 2 Options (FeedHive Slim Horizontal Rows)
  const marketOptions = [
    {
      id: "tr",
      flag: "🇹🇷",
      title: "Türkiye Pazarı",
      detail: "Resmi bayramlar, Anneler Günü, Bayramlar ve Black Friday",
      badge: "🇹🇷 Türkiye pazarlama günleri takvimde gösterilecek.",
    },
    {
      id: "us",
      flag: "🇺🇸",
      title: "ABD & Global Pazar",
      detail: "Memorial Day, 4th of July, Thanksgiving ve Cyber Week",
      badge: "🇺🇸 US Marketing & Holiday Calendar ve global kampanya döngüleri aktif edildi.",
    },
    {
      id: "eu",
      flag: "🇪🇺",
      title: "Avrupa Kampanya Takvimi",
      detail: "Ortak kampanya dönemleri ve mevsimsel günler",
      badge: "🇪🇺 Avrupa geneli kampanya dönemleri gösterilecek; ülkelere özgü resmi tatiller dahil değildir.",
    },
    {
      id: "uk",
      flag: "🇬🇧",
      title: "Birleşik Krallık (UK)",
      detail: "UK Bank Holidays, Boxing Day ve Mother's Day UK",
      badge: "🇬🇧 UK Bank Holidays ve İngiltere tüketici takvimi entegre edildi.",
    },
    {
      id: "global",
      flag: "🌍",
      title: "Uluslararası / Çoklu Pazar",
      detail: "Uluslararası pazarlama ve farkındalık günleri",
      badge: "🌍 Uluslararası pazarlama günleri takvimde gösterilecek.",
    },
  ];

  // Step 3 Options (FeedHive Slim Horizontal Rows)
  const teamSizeOptions = [
    { id: "solo", title: "Yalnızım (1 kişi)", detail: "Solo girişimci veya bağımsız üretici", icon: HiOutlineUser },
    { id: "small", title: "2 - 5 kişi", detail: "Küçük, çevik çekirdek ekip", icon: HiOutlineUserGroup },
    { id: "medium", title: "6 - 20 kişi", detail: "Büyüyen şirket veya pazarlama departmanı", icon: HiOutlineBuildingStorefront },
    { id: "agency_large", title: "20+ kişi veya Ajans", detail: "Çok markalı ajans veya kurumsal organizasyon", icon: HiOutlineBriefcase },
  ];

  // Step 4 Options (Social Platforms)
  const socialPlatforms = [
    {
      id: "instagram",
      name: "Instagram",
      desc: "Feed, Reels & Hikayeler",
      icon: FaInstagram,
      color: "text-pink-600",
      connectUrl: "/api/connections/instagram/start",
      available: true,
    },
    {
      id: "facebook",
      name: "Facebook",
      desc: "Sayfa ve Topluluk Paylaşımları",
      icon: FaFacebook,
      color: "text-blue-700",
      connectUrl: "/api/connections/meta/start",
      available: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      desc: "Dikey Video Planlama",
      icon: FaTiktok,
      color: "text-stone-900",
      connectUrl: "/api/connections/tiktok/start",
      available: true,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      desc: "Şirket Sayfası & B2B Gönderileri",
      icon: FaLinkedinIn,
      color: "text-blue-600",
      connectUrl: "#",
      available: false,
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      desc: "Hızlı Tweet Serileri & Etkileşim",
      icon: FaXTwitter,
      color: "text-stone-900",
      connectUrl: "#",
      available: false,
    },
  ];

  const selectedMarketObj = marketOptions.find((m) => m.id === selectedMarket) || marketOptions[0];
  const selectedIndustryObj = industryOptions.find((i) => i.id === selectedIndustry) || industryOptions[0];
  const selectedTeamSizeObj = teamSizeOptions.find((t) => t.id === selectedTeamSize) || teamSizeOptions[0];

  // Milestone list for AI generation state
  const milestones = [
    {
      step: 1,
      title: websiteUrl ? `Web sitesi taranıyor: ${websiteUrl.replace(/^https?:\/\//, "")}` : "Sektörel altyapı ve pazar dinamikleri inceleniyor",
      desc: "Kurumsal renkler, meta etiketler ve marka dili analiz ediliyor",
      icon: "🌐",
    },
    {
      step: 2,
      title: "Hedef kitle personaları ve marka tonu modelleniyor",
      desc: "İdeal müşteri profili, acı noktaları ve iletişim quadrantı çıkarılıyor",
      icon: "🧠",
    },
    {
      step: 3,
      title: `${selectedMarketObj.flag} ${selectedMarketObj.title} entegre ediliyor`,
      desc: "Resmi tatiller, milli bayramlar ve e-ticaret kampanya günleri yükleniyor",
      icon: "📅",
    },
    {
      step: 4,
      title: "AI İçerik Stratejisi ve pazarlama motoru hazırlanıyor",
      desc: "30 günlük içerik sütunları ve yayın temposu yapılandırılıyor",
      icon: "🚀",
    },
  ];

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setIsGenerating(true);
    setGenerationProgress(15);
    setCurrentMilestone(0);
    setSubmitError(null);

    // Smooth milestone advancement intervals
    const t1 = setTimeout(() => {
      setGenerationProgress(38);
      setCurrentMilestone(1);
    }, 1200);

    const t2 = setTimeout(() => {
      setGenerationProgress(68);
      setCurrentMilestone(2);
    }, 2800);

    const t3 = setTimeout(() => {
      setGenerationProgress(88);
      setCurrentMilestone(3);
    }, 4500);

    try {
      const payload = {
        industry: selectedIndustry,
        country: selectedMarket,
        timezone: selectedTimezone,
        teamSize: selectedTeamSize,
        website: noWebsite ? "" : websiteUrl,
      };

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Kurulum kaydedilirken bir hata oluştu.");
      }


      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      setGenerationProgress(100);
      setCurrentMilestone(3);

      // Brief pause to allow 100% display, then trigger celebration confetti!
      setTimeout(() => {
        setIsGenerating(false);
        setIsSubmitting(false);
        markStepComplete(5);
        setIsCompleted(true);
        setShowConfetti(true);
      }, 700);
    } catch (err: unknown) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setIsGenerating(false);
      setIsSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : "Bağlantı hatası oluştu.");
    }
  };

  if (authChecking) {
    return (
      <div
        className={`${jakarta.className} h-screen w-screen flex flex-col items-center justify-center bg-[#fbf9f6] gap-3 text-slate-500 text-xs font-semibold`}
      >
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span>Tentamark oturumunuz doğrulanıyor...</span>
      </div>
    );
  }

  return (
    <div
      className={`${jakarta.className} h-screen overflow-hidden bg-white flex items-stretch text-slate-900 antialiased selection:bg-orange-500 selection:text-white relative`}
    >
      {/* 60FPS Konfeti Patlama Katmanı */}
      <ConfettiCanvas active={showConfetti} />

      {/* ========================================================================= */}
      {/* SOL SÜTUN (SETUP PROGRESS PANEL) - SIFIR SCROLL, KUSURSUZ SABİT FIT */}
      {/* ========================================================================= */}
      <aside className="w-full max-w-[300px] lg:max-w-[340px] h-full bg-[#fbf9f6] border-r border-stone-200/80 p-5 lg:p-6 flex flex-col justify-between shrink-0 relative overflow-hidden hidden md:flex">
        {/* Zarif hafif sıcak arka plan ışıltısı */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-orange-100/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col">
          {/* Orijinal Tentamark Logosu */}
          <div className="mb-4">
            <Link href="/" className="inline-block">
              <TentamarkLogo size={30} withWordmark subtitle="AI MARKETING" />
            </Link>
          </div>

          {/* Karşılama Başlığı */}
          <div className="mb-5">
            <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Tentamark&apos;a hoş geldiniz! 👋
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Hesabınızı birkaç hızlı adımda oluşturalım. İstediğiniz zaman geri
              dönüp cevaplarınızı değiştirebilirsiniz.
            </p>
          </div>

          {/* Adımlar Listesi (FeedHive Formatında, Kompakt) */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Kurulum İlerlemesi
            </div>

            {STEPS.map((step) => {
              const isDone = completedSteps.includes(step.id);
              const isActive = currentStep === step.id && !isCompleted;
              const isFuture = !isDone && !isActive;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if ((isDone || isActive) && !isGenerating) {
                      setCurrentStep(step.id);
                      setIsCompleted(false);
                      setShowConfetti(false);
                    }
                  }}
                  disabled={isFuture || isGenerating}
                  className={`w-full text-left rounded-xl px-3 py-2 transition-all duration-150 flex items-center gap-2.5 relative ${
                    isActive
                      ? "bg-white border border-orange-500 shadow-xs scale-[1.01]"
                      : isDone
                      ? "bg-white/80 hover:bg-white border border-stone-200/70 text-slate-700 cursor-pointer"
                      : "bg-transparent border border-dashed border-stone-200 text-slate-400 cursor-not-allowed opacity-65"
                  }`}
                >
                  {/* Numara / Onay Rozeti */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[10px] transition-colors ${
                      isDone
                        ? "bg-emerald-500 text-white shadow-xs"
                        : isActive
                        ? "bg-orange-500 text-white shadow-xs"
                        : "bg-stone-100 text-slate-400 border border-stone-200"
                    }`}
                  >
                    {isDone ? (
                      <HiCheck className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  {/* Başlık & Durum */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-semibold truncate ${
                        isActive
                          ? "text-slate-900 font-bold"
                          : isDone
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div
                      className={`text-[10px] truncate ${
                        isActive
                          ? "text-orange-600 font-medium"
                          : isDone
                          ? "text-emerald-600 font-medium"
                          : "text-slate-400"
                      }`}
                    >
                      {isDone ? "Tamamlanmış" : step.subtitle}
                    </div>
                  </div>

                  {/* Aktiflik Noktası */}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sol Sütun Altı: Progress Bar */}
        <div className="pt-3 border-t border-stone-200/70 relative z-10">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>İlerlemek</span>
            <span className="font-mono text-slate-600 font-bold">
              {isCompleted ? "5 of 5" : `${currentStep} of ${STEPS.length}`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{
                width: isCompleted
                  ? "100%"
                  : isGenerating
                  ? `${generationProgress}%`
                  : `${((currentStep - 1) / STEPS.length) * 100 + 20}%`,
              }}
            />
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* SAĞ SÜTUN: FEEDHIVE FORMATINDA YATAY, SLIM, MERKEZLENMİŞ VE SCROLL'SUZ KARTLAR */}
      {/* ========================================================================= */}
      <main className="flex-1 h-full flex flex-col justify-between p-6 sm:p-8 lg:p-10 overflow-y-auto max-w-2xl mx-auto w-full">
        {/* Mobil Üst Bar */}
        <div className="md:hidden mb-4 pb-3 border-b border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <TentamarkLogo size={26} withWordmark />
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
              {currentStep} / {STEPS.length}
            </span>
          </div>
          <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ===================== İÇERİK: ADIMLAR VEYA AI OLUŞTURMA EKRANI ===================== */}
        <div className="my-auto py-2">
          {/* Hata Bildirimi */}
          {submitError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium text-center">
              ⚠️ {submitError}
            </div>
          )}

          {/* =================================================================== */}
          {/* AI OLUŞTURMA / YÜKLEME EKRANI (STEP BY STEP CHECKLIST + RADAR) */}
          {/* =================================================================== */}
          {isGenerating && (
            <div className="animate-in fade-in zoom-in-95 duration-200 py-4 max-w-lg mx-auto">
              {/* Holographic Glowing AI Badge */}
              <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-amber-300 rounded-2xl blur-lg opacity-40 animate-pulse" />
                <div className="relative w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl shadow-md flex items-center justify-center text-white">
                  <HiOutlineSparkles className="w-7 h-7 animate-spin" style={{ animationDuration: "4s" }} />
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Tenta AI Markanızı Oluşturuyor
                </h2>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  Yapay zeka web sitenizi ve sektörel verileri tarayarak marka DNA&apos;nızı ve içerik stratejinizi hazırlıyor.
                </p>
              </div>

              {/* Glowing Progress Bar */}
              <div className="mb-6 bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-xs"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              {/* Step-by-Step AI Milestones List */}
              <div className="space-y-2.5">
                {milestones.map((m, idx) => {
                  const isDone = currentMilestone > idx || generationProgress === 100;
                  const isCurrent = currentMilestone === idx && generationProgress < 100;

                  return (
                    <div
                      key={m.step}
                      className={`p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                        isDone
                          ? "bg-emerald-50/50 border-emerald-200/90 text-slate-800"
                          : isCurrent
                          ? "bg-orange-50/50 border-orange-300/90 text-slate-900 shadow-xs ring-1 ring-orange-400/20"
                          : "bg-white/60 border-slate-200/70 text-slate-400 opacity-60"
                      }`}
                    >
                      <div className="text-lg shrink-0 select-none">{m.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate flex items-center justify-between">
                          <span>{m.title}</span>
                          {isDone ? (
                            <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                              <HiCheck className="w-3.5 h-3.5 stroke-[3]" />
                              Tamamlandı
                            </span>
                          ) : isCurrent ? (
                            <span className="text-[10px] text-orange-600 font-extrabold flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-ping" />
                              İşleniyor...
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Bekliyor</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          {m.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ADIM 1: NE YAPIYORSUN? (FEEDHIVE SLIM YATAY KARTLAR) */}
          {/* =================================================================== */}
          {currentStep === 1 && !isCompleted && !isGenerating && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Ne yapıyorsun?
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Lütfen sizi/şirketinizi ve faaliyetlerini en iyi tanımlayan seçeneği
                  belirleyin.
                </p>
              </div>

              {/* Yatay Slim Kartlar (FeedHive Tarzı) */}
              <div className="space-y-2">
                {industryOptions.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndustry === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIndustry(item.id)}
                      className={`px-4 py-2.5 sm:py-3 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between group select-none ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500/20 shadow-xs"
                          : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isSelected
                              ? "text-orange-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                        <span
                          className={`text-xs sm:text-sm font-medium transition-colors ${
                            isSelected
                              ? "text-slate-900 font-bold"
                              : "text-slate-700 group-hover:text-slate-900"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      {/* Sağ Seçim Tik İşareti */}
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isSelected && (
                          <HiCheck className="w-4 h-4 text-orange-600 stroke-[3]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ADIM 2: HEDEF PAZAR & ÖZEL GÜNLER TAKVİMİ (FEEDHIVE SLIM YATAY KARTLAR) */}
          {/* =================================================================== */}
          {currentStep === 2 && !isCompleted && !isGenerating && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Hedef Pazarınız & Özel Günler Takvimi
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Takvimde hangi pazarın özel günlerini ve kampanya dönemlerini görmek istersiniz?
                </p>
              </div>

              {/* Yatay Slim Kartlar */}
              <div className="space-y-2">
                {marketOptions.map((item) => {
                  const isSelected = selectedMarket === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMarket(item.id)}
                      className={`px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between group select-none ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500/20 shadow-xs"
                          : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <span className="text-xl select-none shrink-0">
                          {item.flag}
                        </span>
                        <div className="truncate">
                          <span
                            className={`text-xs sm:text-sm transition-colors ${
                              isSelected
                                ? "text-slate-900 font-bold"
                                : "text-slate-700 font-medium group-hover:text-slate-900"
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline truncate">
                            • {item.detail}
                          </span>
                        </div>
                      </div>

                      {/* Sağ Seçim Tik İşareti */}
                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isSelected && (
                          <HiCheck className="w-4 h-4 text-orange-600 stroke-[3]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Seçilen Pazara Ait Canlı Bilgi İpucu */}
              <div className="mt-4 p-3 rounded-xl bg-orange-50/50 border border-orange-100 flex items-start gap-2.5">
                <span className="text-base select-none">💡</span>
                <p className="text-[11px] text-orange-950 font-medium leading-relaxed">
                  {marketOptions.find((m) => m.id === selectedMarket)?.badge}
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <label htmlFor="onboarding-timezone" className="block text-xs font-semibold text-slate-700">
                  Gönderi planlama saat dilimi
                </label>
                <select id="onboarding-timezone" value={selectedTimezone} onChange={(event) => setSelectedTimezone(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800">
                  {!["Europe/Istanbul", "Europe/Berlin", "Europe/London", "America/New_York", "America/Los_Angeles", "UTC"].includes(selectedTimezone) &&
                    <option value={selectedTimezone}>{selectedTimezone}</option>}
                  <option value="Europe/Istanbul">İstanbul</option>
                  <option value="Europe/Berlin">Berlin</option>
                  <option value="Europe/London">Londra</option>
                  <option value="America/New_York">New York</option>
                  <option value="America/Los_Angeles">Los Angeles</option>
                  <option value="UTC">UTC</option>
                </select>
                <p className="text-[11px] text-slate-500">Hedef pazardan bağımsızdır; gönderileriniz seçtiğiniz saate göre planlanır.</p>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ADIM 3: EKİP BÜYÜKLÜĞÜNÜZ NEDİR? */}
          {/* =================================================================== */}
          {currentStep === 3 && !isCompleted && !isGenerating && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Şirketinizde kaç kişi çalışıyor?
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Ekip büyüklüğünüze göre onay akışları ve çoklu kullanıcı
                  özellikleri şekillendirilir.
                </p>
              </div>

              {/* Yatay Slim Kartlar */}
              <div className="space-y-2">
                {teamSizeOptions.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedTeamSize === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedTeamSize(item.id)}
                      className={`px-4 py-3 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between group select-none ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/30 ring-1 ring-orange-500/20 shadow-xs"
                          : "border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isSelected
                              ? "text-orange-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                        <div>
                          <span
                            className={`text-xs sm:text-sm transition-colors ${
                              isSelected
                                ? "text-slate-900 font-bold"
                                : "text-slate-700 font-medium group-hover:text-slate-900"
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                            • {item.detail}
                          </span>
                        </div>
                      </div>

                      <div className="w-4 h-4 flex items-center justify-center shrink-0">
                        {isSelected && (
                          <HiCheck className="w-4 h-4 text-orange-600 stroke-[3]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ADIM 4: SOSYAL MEDYA HESAPLARINIZI EKLEYİN */}
          {/* =================================================================== */}
          {currentStep === 4 && !isCompleted && !isGenerating && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Sosyal medya hesaplarınızı ekleyin
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Kanallarınızı bağlayarak otomatik yayınlama motorunu aktif edin.
                  İstediğiniz zaman Atlayabilir veya daha sonra bağlayabilirsiniz.
                </p>
              </div>

              {/* Yatay Slim Kartlar */}
              <div className="space-y-2">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  const isConnected = connectedSocials.includes(platform.id);

                  return (
                    <div
                      key={platform.id}
                      className={`px-4 py-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between ${
                        isConnected
                          ? "border-emerald-300 bg-emerald-50/40"
                          : "border-slate-200/90 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 text-base ${platform.color}`} />
                        <div>
                          <span className="text-xs sm:text-sm font-bold text-slate-800">
                            {platform.name}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                            • {platform.desc}
                          </span>
                        </div>
                      </div>

                      {isConnected ? (
                        <div className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                          <HiCheck className="w-3 h-3 stroke-[3]" />
                          <span>Bağlandı</span>
                        </div>
                      ) : platform.available ? (
                        <a
                          href={platform.connectUrl}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Bağla</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleSocial(platform.id)}
                          className="px-3 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                        >
                          Yakında
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-center text-xs text-slate-400">
                💡 Hesaplarınızı dilediğiniz zaman Ayarlar &gt; Kanallar bölümünden de
                ekleyebilir veya güncelleyebilirsiniz.
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* ADIM 5: WEB SİTENİZİ EKLEYİN */}
          {/* =================================================================== */}
          {currentStep === 5 && !isCompleted && !isGenerating && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Web sitenizi ekleyin
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Tenta AI web sitenizden kurumsal renklerinizi ve marka dilinizi
                  otomatik analiz eder.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <HiOutlineGlobeAlt className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    disabled={noWebsite || isSubmitting}
                    placeholder="https://markaniz.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-400 transition-all"
                  />
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="noWebsiteClean"
                    checked={noWebsite}
                    onChange={(e) => {
                      setNoWebsite(e.target.checked);
                      if (e.target.checked) setWebsiteUrl("");
                    }}
                    className="w-3.5 h-3.5 rounded text-orange-600 focus:ring-orange-500 border-slate-300 cursor-pointer"
                  />
                  <label
                    htmlFor="noWebsiteClean"
                    className="text-xs text-slate-500 cursor-pointer select-none"
                  >
                    Henüz yayında bir web sitem yok
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TAMAMLAMA & KUTLAMA EKRANI (KONFETİLİ VE TAM DOLU ÖZETLİ) */}
          {/* =================================================================== */}
          {isCompleted && (
            <div className="text-center py-2 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md mb-3">
                <HiCheck className="w-7 h-7 stroke-[3]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tebrikler! Markanız Hazır! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                Tenta AI web siteniz ve tercihleriniz doğrultusunda Marka Profilinizi, DNA&apos;nızı, hedef kitlenizi ve pazarlama takviminizi başarıyla yapılandırdı.
              </p>

              {/* Kurulum Özeti Kartı */}
              <div className="mt-5 p-4 rounded-2xl border border-slate-200/90 bg-stone-50/80 text-left max-w-md mx-auto space-y-2.5 shadow-2xs">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Oluşturulan Marka Kimliği</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ✓ AI Profil Aktif
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700 pt-1">
                  <span className="text-slate-500">Hedef Pazar:</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <span>{selectedMarketObj.flag}</span>
                    <span>{selectedMarketObj.title}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="text-slate-500">İş Modeli:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedIndustryObj.title}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="text-slate-500">Ekip Büyüklüğü:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedTeamSizeObj.title}
                  </span>
                </div>

                {websiteUrl && (
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span className="text-slate-500">Web Sitesi:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                      {websiteUrl}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                  <span>🧠 AI İçerik Stratejisi</span>
                  <span>Oluşturuldu & Yayında</span>
                </div>
              </div>

              {/* Yönlendirme Butonları */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/dashboard/brand"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Marka Profilini İncele</span>
                  <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/dashboard/calendar"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Doğrudan Takvime Git</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ===================== ALT BAR (ATLA & DEVAM ETMEK - FEEDHIVE TARZI) ===================== */}
        {!isCompleted && !isGenerating && (
          <div className="pt-4 mt-2 flex items-center justify-between">
            {/* Geri Butonu (Varsa) */}
            <div>
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <HiOutlineArrowLeft className="w-3.5 h-3.5" />
                  <span>Geri</span>
                </button>
              ) : (
                <div />
              )}
            </div>

            {/* Sağ Tarafta Atlamak & Devam Etmek (FeedHive Gibi) */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
              >
                Atlamak
              </button>

              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <HiOutlineArrowPath className="w-3.5 h-3.5 animate-spin" />
                    <span>Hazırlanıyor...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {currentStep === STEPS.length ? "Tamamla" : "Devam etmek"}
                    </span>
                    <HiOutlineArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-white">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
