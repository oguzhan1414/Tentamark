"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  HiOutlineSparkles,
  HiOutlineCheck,
  HiOutlineXMark,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineBolt,
  HiOutlineScale,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBookOpen,
} from "react-icons/hi2";

function WhyTentamarkInner() {
  const { isEn } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "strategy" | "brand" | "time" | "safety">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Comparison Matrix Criteria (No price tags, strictly feature, autonomy, safety and workflow)
  const matrixRows = [
    {
      category: "strategy",
      feature: isEn ? "Weekly Content & Strategy Generation" : "Haftalık İçerik Paketi & Strateji Üretimi",
      tentamark: isEn ? "Automatic: Proactively suggests 5-7 tailored concepts every Monday" : "Otonom: Her hafta başında sektöre ve hedefe uygun 5-7 hazır içerik paketi üretir",
      tentamarkState: "best",
      schedulers: isEn ? "None: Gives empty calendar, expects user to write everything" : "Yok: Boş takvim sunar, her metni kullanıcının sıfırdan yazmasını bekler",
      schedulersState: "bad",
      generalAi: isEn ? "Reactive: Only generates text when given explicit detailed prompts" : "Reaktif: Yalnızca uzun prompt girilirse yazar; haftalık strateji ve takvim kuramaz",
      generalAiState: "mid",
      agency: isEn ? "Manual: Monthly meetings, slow 1-2 week turnaround times" : "Manuel: Ayda bir toplantı, revizyonlar 1-2 hafta sürer",
      agencyState: "mid",
    },
    {
      category: "brand",
      feature: isEn ? "Persistent Brand Memory (Brand DNA)" : "Kalıcı Marka Hafızası (Brand DNA)",
      tentamark: isEn ? "Permanent: Stores brand voice, forbidden words, visual identity forever" : "Kalıcı: Marka tonunu, yasaklı kelimeleri, hedef kitleyi ve renkleri sürekli hatırlar",
      tentamarkState: "best",
      schedulers: isEn ? "Zero memory: Completely unaware of who your brand is" : "Sıfır Hafıza: Markanızın ne iş yaptığından tamamen habersizdir",
      schedulersState: "bad",
      generalAi: isEn ? "Session-only: Forgets context across chats or requires re-prompting" : "Oturum Bazlı: Her yeni sohbette baştan anlatmak gerekir, prompt yorgunluğu yaratır",
      generalAiState: "bad",
      agency: isEn ? "Variable: Changes whenever account manager or copywriter changes" : "Değişken: Metin yazarı veya müşteri temsilcisi değiştikçe marka dili bozulur",
      agencyState: "mid",
    },
    {
      category: "strategy",
      feature: isEn ? "Multi-Channel Adaptation (1 Input → 5 Formats)" : "Çok Kanallı Biçimlendirme (1 Girdi → 5 Format)",
      tentamark: isEn ? "Native: Carousel for Instagram, thought-leadership for LinkedIn, thread for X" : "Özelleştirilmiş: Instagram Carousel, LinkedIn makale, X tweet dizisi formatına ayrı ayrı uyarlar",
      tentamarkState: "best",
      schedulers: isEn ? "Copy-paste: Forces same generic caption across all networks" : "Kopyala-Yapıştır: Aynı metni her platforma tek düze kopyalamanızı bekler",
      schedulersState: "bad",
      generalAi: isEn ? "Text-only: Doesn't account for live platform constraints & media slots" : "Kopuk Metin: Sosyal ağların görsel yuvalarını ve güncel algoritma dinamiklerini bilmez",
      generalAiState: "mid",
      agency: isEn ? "Yes, but requires extensive back-and-forth communication" : "Uyarlandı ama her kanal için ayrı toplantı ve onay trafiği gerekir",
      agencyState: "good",
    },
    {
      category: "strategy",
      feature: isEn ? "Hook & Virality Scoring (Caption Lab)" : "Kanca (Hook) & Virallik Puanlaması (Caption Lab)",
      tentamark: isEn ? "Built-in: Analyzes first 3 seconds, Curiosity Hook, Value & CTA scores" : "Yerleşik: İlk 3 saniye kancasını, merak unsurlarını ve CTA netliğini veriyle puanlar",
      tentamarkState: "best",
      schedulers: isEn ? "None: Zero intelligence on whether a post will perform" : "Yok: Gönderinin tutup tutmayacağına dair hiçbir içgörü sunmaz",
      schedulersState: "bad",
      generalAi: isEn ? "Generic: Offers clichéd 'Catchy title' without scoring algorithms" : "Jenerik: 'Dikkat çekici başlık' gibi kalıplaşmış tavsiyeler verir, skorlamaz",
      generalAiState: "bad",
      agency: isEn ? "Intuition-based: Relies on subjective personal opinion of writer" : "Sübjektif: Tamamen metin yazarının o anki kişisel hissiyatına bağlıdır",
      agencyState: "mid",
    },
    {
      category: "safety",
      feature: isEn ? "Human Approval & Brand Safety (Brand Guardian)" : "İnsan Kontrolü & Marka Güvenliği (Brand Guardian)",
      tentamark: isEn ? "Guaranteed: Strict human-in-the-loop review + automatic AI safety filter" : "Garantili: İnsan onayı olmadan tek bir gönderi yayınlanmaz + Brand Guardian denetimi",
      tentamarkState: "best",
      schedulers: isEn ? "Mechanical: Blindly posts whatever user scheduled without safety checks" : "Mekanik: Kullanıcının koyduğu her şeyi kontrolsüzce saatinde basar",
      schedulersState: "mid",
      generalAi: isEn ? "No posting capability: Requires manual copy-pasting into each app" : "Yayın Yeteneği Yok: Sosyal ağlara bağlı değildir, manuel kopyalama zorunludur",
      generalAiState: "bad",
      agency: isEn ? "Human error prone: Missing links, typos and missed scheduling dates" : "İnsan Hatasına Açık: Yanlış link, yazım hatası veya onay gecikmeleri yaşanır",
      agencyState: "mid",
    },
    {
      category: "time",
      feature: isEn ? "Weekly Time Required from Founder / Team" : "Kurucu veya Ekipten Haftalık Zaman Talebi",
      tentamark: isEn ? "15 minutes/week: Review ready drafts on Calendar, edit if needed, click Approve" : "Haftada 15 dakika: Takvimdeki hazır paketleri gözden geçirip 'Onayla'ya basmak",
      tentamarkState: "best",
      schedulers: isEn ? "10 - 15 hours/week: You must write, design and format everything" : "Haftada 10 - 15 saat: Her görseli ve metni sıfırdan sizin hazırlamanız gerekir",
      schedulersState: "bad",
      generalAi: isEn ? "6 - 10 hours/week: Copy-pasting back and forth between ChatGPT and social tools" : "Haftada 6 - 10 saat: Prompt denemeleri, kopyala-yapıştır ve takvimleme trafiği",
      generalAiState: "bad",
      agency: isEn ? "2 - 4 hours/week: Brief meetings, feedback loops, email chains" : "Haftada 2 - 4 saat: Brief toplantıları, geri bildirim e-postaları ve telefon trafiği",
      agencyState: "mid",
    },
    {
      category: "time",
      feature: isEn ? "Revision & Speed of Execution" : "Revizyon ve Güncelleme Hızı",
      tentamark: isEn ? "Instant: Re-generate or fine-tune captions with 1-click in seconds" : "Anlık: Tek tıkla yeni varyantlar veya ton ayarlamaları saniyeler içinde hazır",
      tentamarkState: "best",
      schedulers: isEn ? "Manual: You must edit and re-upload every file yourself" : "Manuel: Her metin ve görseli kendiniz baştan düzenleyip yüklemek zorundasınız",
      schedulersState: "mid",
      generalAi: isEn ? "Fast text generation, but manual re-formatting and copy-pasting required" : "Hızlı metin üretir ancak sosyal mecraya manuel kopyalama ve yeniden formatlama gerekir",
      generalAiState: "mid",
      agency: isEn ? "Slow: Takes 2-5 business days for copy revisions through account managers" : "Yavaş: Revizyon taleplerinin geri dönüşü 2-5 iş günü sürebilir",
      agencyState: "bad",
    },
  ];

  const filteredRows = matrixRows.filter(
    (row) => selectedFilter === "all" || row.category === selectedFilter
  );

  const pillars = [
    {
      num: "01",
      badge: isEn ? "Core Breakthrough" : "Çekirdek Çözüm",
      title: isEn ? "1. Boş Takvim Paradoksu ve Otonom İçerik Stratejisi" : "1. Boş Takvim Paradoksu ve Otonom İçerik Stratejisi",
      desc: isEn
        ? "Traditional social media scheduling tools (Buffer, Hootsuite) present you with a blank grid and expect you to write every caption from scratch. Tentamark operates as an in-house Marketing Director: every Monday morning, your weekly content plan is already generated with platform-specific captions and hook angles waiting for your review."
        : "Geleneksel sosyal medya yönetim araçları (Buffer, Hootsuite) işletmelere bomboş bir takvim uzatıp her içeriği sıfırdan sizin yazmanızı bekler. Bir metin yazarı değilseniz o takvim haftalarca boş kalır. Tentamark ise kıdemli bir yapay zeka pazarlama yöneticisi gibi çalışır: Pazartesi sabahı takviminizde markanıza özel hazırlanmış 5 stratejik içerik taslağıyla sizi karşılar.",
      highlight: isEn ? "You don't start from zero — you review and approve in 15 minutes." : "Sıfırdan yazmazsınız; hazırlanmış editoryal taslakları inceler, tek tıkla onaylarsınız.",
      image: "/images/why-us/why-calendar-solved.jpg",
      imageAlt: isEn
        ? "Social media content planning calendar - Curated weekly draft posts and one-click approval"
        : "Sosyal medya içerik planlama takvimi - Haftalık hazır gönderi taslakları ve editoryal onay ekranı",
      link: { text: isEn ? "See 4-step workflow" : "Nasıl çalışır rehberini inceleyin", href: "/nasil-calisir" },
    },
    {
      num: "02",
      badge: isEn ? "Persistent Memory" : "Kalıcı Marka Hafızası",
      title: isEn ? "2. Kalıcı Marka DNA'sı ile Sıfır Prompt Yorgunluğu" : "2. Kalıcı Marka DNA'sı ile Sıfır Prompt Yorgunluğu",
      desc: isEn
        ? "General AI tools (ChatGPT, Claude) lack persistent brand memory; every chat session forces you to re-explain your brand tone, audience personas, and forbidden phrases. Tentamark encodes your Brand DNA once. Every draft permanently respects your authentic voice, visual guidelines, and vocabulary rules."
        : "ChatGPT gibi genel yapay zekalar oturum bazlı çalışır; her yeni sohbette 'Biz organik ürün satıyoruz, dilimiz samimi olsun, şu terimleri kullanma...' diye baştan prompt yazmaktan yorulursunuz. Tentamark'ta Marka DNA'sı tek merkezde kodlanır. Üretim motoru bu kurallarla kilitlenir ve markanızın kurumsal kimliği asla bozulmaz.",
      highlight: isEn ? "No repetitive prompt engineering. Permanent brand voice consistency." : "Tekrarlayan prompt yorgunluğu yok. Kalıcı marka sesi ve jargon tutarlılığı.",
      image: "/images/why-us/why-brand-dna-module.jpg",
      imageAlt: isEn
        ? "Brand DNA memory module - Permanent brand voice, colors and AI guidelines memory"
        : "Marka DNA hafıza modülü - Kalıcı marka sesi, kurumsal renkler ve yapay zeka ton rehberi",
      externalCitation: {
        text: isEn ? "Sprout Social Research: 88% of consumers favor brand consistency" : "Sprout Social Raporu: Tüketicilerin %88'i tutarlı marka sesine güven duyuyor",
        href: "https://sproutsocial.com/insights/index/",
      },
    },
    {
      num: "03",
      badge: isEn ? "Algorithm Native" : "Algoritmik Biçimlendirme",
      title: isEn ? "3. Çok Kanallı Yapay Zeka Adaptasyonu (Instagram, LinkedIn, X, TikTok)" : "3. Çok Kanallı Yapay Zeka Adaptasyonu (Instagram, LinkedIn, X, TikTok)",
      desc: isEn
        ? "Publishing the identical text across all social networks is penalized by algorithms and ignored by audiences. An Instagram carousel demands visual slide pacing, a LinkedIn post requires thought-leadership insights, and an X post requires brevity. Tentamark adapts one core concept into platform-native formats automatically."
        : "Aynı metni tüm sosyal ağlara kopyalamak algoritmik erişimi düşürür. Instagram'da kaydırmalı carousel olarak çalışan içerik, LinkedIn'de profesyonel bir sektör içgörüsü, X'te ise vurucu kısa bir tweet dizisi gerektirir. Tentamark tek bir girdiyi her mecranın algoritmasına ve tüketim alışkanlığına uygun olarak ayrı ayrı yeniden formatlar.",
      highlight: isEn ? "Native format per platform, not lazy cross-posting." : "Tembelce kopyala-yapıştır değil; mecraya özel gerçek editoryal uyarlama.",
      image: "/images/why-us/why-multichannel-flow.jpg",
      imageAlt: isEn
        ? "Multi-channel social media adaptation - Instagram Carousel, LinkedIn article and X tweet layout"
        : "Çok kanallı sosyal medya içerik uyarlaması - Instagram Carousel, LinkedIn makale ve X tweet formatı",
      link: { text: isEn ? "Why cross-posting fails guide" : "Aynı içeriği her platformda paylaşmak neden çalışmaz?", href: "/blog/ayni-icerigi-her-platformda-paylasmak-neden-calismaz" },
      secondaryLink: { text: isEn ? "Supported platforms" : "Desteklenen platformlar", href: "/platformlar" },
    },
    {
      num: "04",
      badge: isEn ? "Science & Analytics" : "Veri & Kanca Analitiği",
      title: isEn ? "4. Caption Lab: Kanca (Hook) ve Virallik Puanlama Algoritması" : "4. Caption Lab: Kanca (Hook) ve Virallik Puanlama Algoritması",
      desc: isEn
        ? "Social media algorithms evaluate user retention within the first 3 seconds. Tentamark’s built-in Caption Lab scores Curiosity Hooks, Educational Value, and Direct Call-to-Action (CTA) clarity before publishing. You eliminate guesswork and share content engineered for real engagement."
        : "Sosyal medya algoritmaları gönderinin başarısını ilk 3 saniyede ölçer. Tentamark'ın yerleşik Caption Lab motoru; 'Merak Kancası', 'Eğitici Değer' ve 'Harekete Geçirici Mesaj (CTA)' netliğini yayın öncesinde 100 üzerinden skorlar. Gönderinizi paylaşmadan önce algoritmalarda tutma potansiyelini veriyle görürsünüz.",
      highlight: isEn ? "Data-backed engagement scoring before hitting publish." : "Paylaşmadan önce gönderinizin etkileşim ve kanca gücünü görün.",
      image: "/images/why-us/why-caption-analytics.jpg",
      imageAlt: isEn
        ? "Caption Lab virality score and hook performance analytics dashboard"
        : "Caption Lab virallik analitiği - Sosyal medya kanca gücü ve etkileşim tahminleme grafiği",
      link: { text: isEn ? "Read social media tool selection guide" : "Sosyal medya yönetim aracı seçme rehberini okuyun", href: "/blog/sosyal-medya-yonetim-araci-nasil-secilir" },
      externalCitation: {
        text: isEn ? "Nielsen Norman Group: How Users Read & Scan Content" : "Nielsen Norman Group: Kullanıcıların Dijital İçerik Tarama Davranışları",
        href: "https://www.nngroup.com/articles/how-users-read-on-the-web/",
      },
    },
  ];

  const faqs = [
    {
      q: isEn
        ? "Why should I choose an AI social media management tool over ChatGPT?"
        : "ChatGPT varken neden özel bir AI sosyal medya yönetim aracı kullanmalıyım?",
      a: isEn
        ? "ChatGPT generates raw text in isolation. It lacks permanent Brand DNA memory, cannot schedule posts, has no connection to live social media APIs, and doesn't adapt to multi-slide Instagram carousel or LinkedIn layouts. Tentamark is a closed-loop operating system that takes care of the entire workflow from strategic planning to approval and scheduling."
        : "ChatGPT yalnızca siz ona uzun bir prompt yazdığınızda ham metin üretir. Ancak markanızın tonunu kalıcı olarak hatırlamaz, Instagram kaydırmalı görsel kurgusu veya LinkedIn düşünce liderliği formatında çıktı vermez, sosyal medya hesaplarınıza bağlı değildir ve takvim yönetimi yapamaz. Tentamark bir sohbet kutusu değil; markanızı tanıyan ve haftalık tüm pazarlama iş akışını 15 dakikaya indiren otonom bir işletim sistemidir.",
    },
    {
      q: isEn
        ? "I already use Buffer or Hootsuite. Why should I switch to Tentamark?"
        : "Zaten Buffer veya Hootsuite kullanıyorum, Tentamark'a geçmeme gerek var mı?",
      a: isEn
        ? "Buffer and Hootsuite are mechanical schedulers. They provide an empty calendar and require you to provide ideas, write copy, and format media. If you lack time, your calendar stays dark. Tentamark does the heavy lifting: it acts as your AI marketing director, preparing tailored weekly strategies and drafts so you only need to review and approve."
        : "Buffer ve Hootsuite, mekanik zamanlayıcılardır. Size sadece boş bir takvim kutusu sunar ve içine ne koyacağınızı tamamen size bırakırlar. Vaktiniz olmadığında takviminiz aylarca bomboş kalır. Tentamark ise içerik yükünü sizin sırtınızdan alır; haftalık stratejiyi, platforma özel metinleri ve kancaları kendisi üretir, siz sadece onaylarsınız.",
    },
    {
      q: isEn
        ? "Does Tentamark post automatically without my explicit approval?"
        : "Tentamark benim onayım olmadan sosyal medya hesaplarımda otomatik paylaşım yapar mı?",
      a: isEn
        ? "Never. We enforce a strict 'Human-in-the-Loop' policy. Tentamark generates and schedules drafts into your review queue. Nothing is ever published to your social profiles until you review and click 'Approve'. Your brand reputation is always 100% protected."
        : "Kesinlikle hayır. Tentamark 'İnsan Onaylı Yapay Zeka (Human-in-the-loop)' prensibiyle çalışır. AI tüm haftalık planı hazırlar, takvime yerleştirir ve Onay Masası'nda sizin incelemenize sunar. Siz gözden geçirip 'Onayla' butonuna basmadan hiçbir gönderi canlıya çıkamaz.",
    },
    {
      q: isEn
        ? "Can boutique marketing agencies and consultants use Tentamark?"
        : "Butik pazarlama ajansları ve danışmanlar Tentamark'ı kullanabilir mi?",
      a: isEn
        ? "Yes. Many boutique agencies use Tentamark to accelerate internal draft production for multiple client brands. It removes 80% of repetitive copy time, enabling agency teams to focus on high-ticket video shoots, campaign funnels, and performance ads."
        : "Kesinlikle. Birçok ajans ve işletme sahibi, Tentamark'ı içerik üretim süresini 5 kat hızlandırmak için kullanır. Ajans çalışanları rutin gönderi metni yazmak yerine yüksek bütçeli video prodüksiyonlarına ve reklam optimizasyonuna odaklanırken, Tentamark organik akışı kesintisiz besler.",
    },
    {
      q: isEn
        ? "Can I use my own product photos, videos, and brand guidelines?"
        : "Kendi ürün fotoğraflarımı, videolarımı ve tasarım şablonlarımı kullanabilir miyim?",
      a: isEn
        ? "Yes. You can upload high-resolution product photos, Canva assets, and videos into Tentamark's Media Library. The AI will pair your assets with brand-aligned copy and strategic publishing times."
        : "Evet. Kendi yüksek çözünürlüklü ürün fotoğraflarınızı, Canva tasarımlarınızı veya videolarınızı Tentamark Medya Kütüphanesi'ne yükleyebilirsiniz. Sistem, görsel varlıklarınızı marka tonunuza uygun metinler ve kancalarla eşleştirir.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-[#172B46] selection:bg-[#FA5252] selection:text-white">
      <SiteHeader />

      <main className="flex-1">
        {/* ================= HERO SECTION (LIGHT THEME LUXURY SPLIT & 100% SEO OPTIMIZED) ================= */}
        <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-18 lg:pb-24 border-b border-[#E3E6E9]">
          {/* Subtle warm light ambient washes */}
          <div
            className="pointer-events-none absolute -top-28 left-1/4 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#FFF0EE]/80 via-[#FFF8EA]/50 to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-20 right-0 h-96 w-96 rounded-full bg-[#EFF8FD]/70 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            {/* Split Grid: Left Copy, Right Majestic Visual */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
              {/* Left Column: Eyebrow, Single H1, Value Subheading, SEO Intro, Trust Points */}
              <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left">
                {/* Breadcrumb Navigation (SEO internal navigation signal) */}
                <nav aria-label="Breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-xs text-[#8691A0] font-medium">
                  <Link href="/" className="hover:text-[#172B46] transition-colors">
                    {isEn ? "Home" : "Ana Sayfa"}
                  </Link>
                  <span className="text-[#B9C2CD]">/</span>
                  <span className="text-[#172B46] font-semibold">
                    {isEn ? "Why Tentamark" : "Neden Tentamark?"}
                  </span>
                </nav>

                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#E3E6E9] bg-white px-3.5 py-1.5 shadow-2xs">
                  <span className="flex h-2 w-2 rounded-full bg-[#FA5252] animate-pulse" />
                  <span className="font-mono text-xs font-semibold tracking-wider uppercase text-[#C92E35]">
                    {isEn ? "AI SOCIAL MEDIA MANAGEMENT BENCHMARK" : "AI SOSYAL MEDYA YÖNETİM ARACI & RAKİP REHBERİ"}
                  </span>
                </div>

                {/* Main Headline: Exactly ONE <h1> with primary target keywords */}
                <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-[44px] xl:text-[48px] lg:leading-[1.16] text-[#172B46]">
                  {isEn ? (
                    <>
                      AI Social Media Management Guide:{" "}
                      <span className="text-[#C92E35]">Why Choose Tentamark?</span>
                    </>
                  ) : (
                    <>
                      AI Sosyal Medya Yönetim Aracı Rehberi:{" "}
                      <span className="text-[#C92E35]">Neden Tentamark?</span>
                    </>
                  )}
                </h1>

                {/* Subtitle / Core Value Hook */}
                <p className="mt-4 text-lg sm:text-xl font-bold text-[#172B46]/90">
                  {isEn
                    ? "Traditional tools give you an empty calendar. Tentamark gives you the marketing mind to run it."
                    : "Geleneksel araçlar boş bir takvim sunar; Tentamark ise o takvimi yöneten yapay zeka pazarlama aklını."}
                </p>

                {/* Intro Paragraph: First 100 words with primary & secondary keywords naturally placed */}
                <p className="mt-3.5 text-sm sm:text-base text-[#536276] leading-relaxed max-w-xl">
                  {isEn ? (
                    <>
                      Tentamark is an autonomous <strong>AI social media management tool</strong> engineered for businesses and growing brands. While legacy <strong>social media management tools</strong> (Buffer, Hootsuite) leave you staring at an empty calendar and general chatbots lack persistent brand memory, Tentamark powers your complete <strong>social media content planning</strong> cycle—from Brand DNA synthesis to human-approved publishing.
                    </>
                  ) : (
                    <>
                      Tentamark, işletmeler ve pazarlama ekipleri için geliştirilmiş otonom bir <strong>AI sosyal medya yönetim aracı</strong>dır. Geleneksel <strong>sosyal medya yönetim araçları</strong> (Buffer, Hootsuite) kullanıcıya yalnızca boş bir takvim kutusu sunup içeriği sıfırdan sizin yazmanızı beklerken; Tentamark, markanızın ses tonunu öğrenir, haftalık <strong>sosyal medya içerik planlama</strong> sürecini otonom olarak yürütür ve insan onayına hazır editoryal taslaklar üretir.
                    </>
                  )}
                </p>

                {/* Internal Contextual Link */}
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#C92E35]">
                  <HiOutlineBookOpen className="h-4 w-4" />
                  <Link href="/blog/kucuk-isletmeler-icin-sosyal-medya-yonetimi" className="hover:underline underline-offset-4">
                    {isEn ? "Read our practical guide for small business social media" : "Küçük işletmeler için sosyal medya yönetimi rehberini okuyun →"}
                  </Link>
                </div>

                {/* Trust Points */}
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#536276]">
                  <span className="flex items-center gap-1.5">
                    <HiOutlineShieldCheck className="h-4 w-4 text-[#10B981]" />
                    {isEn ? "No credit card required" : "Kredi kartı gerekmez"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HiOutlineBolt className="h-4 w-4 text-[#FA5252]" />
                    {isEn ? "3-minute Brand DNA setup" : "3 dakikada kurulum"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <HiOutlineCheck className="h-4 w-4 text-emerald-600" />
                    {isEn ? "Human editorial control" : "İnsan onaylı emniyet"}
                  </span>
                </div>
              </div>

              {/* Right Column: High-End Visual with SEO Alt Tag */}
              <div className="lg:col-span-6 xl:col-span-6">
                <div className="relative rounded-[32px] border border-[#E3E6E9] bg-white p-2.5 sm:p-4 shadow-xl group">
                  <div className="relative overflow-hidden rounded-[24px] border border-slate-100 bg-[#FAF9F6]">
                    <Image
                      src="/images/why-us/why-hero-orchestrator.jpg"
                      alt={
                        isEn
                          ? "AI social media management tool orchestration dashboard - Tentamark Brand DNA and publishing flow"
                          : "AI sosyal medya yönetim aracı orkestrasyon paneli - Tentamark Brand DNA ve otonom içerik takvimi"
                      }
                      width={1280}
                      height={720}
                      priority
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Strip: 4 High-Impact Micro Metrics */}
            <div className="mt-14 sm:mt-18 pt-10 border-t border-[#E3E6E9]/70 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
              {[
                {
                  value: "0 Saat",
                  label: isEn ? "Blank calendar stress" : "Boş takvim stresi",
                  desc: isEn ? "Strategy pre-generated every Monday" : "Haftalık plan pazartesi hazır",
                },
                {
                  value: "%100",
                  label: isEn ? "Brand DNA consistency" : "Marka dili tutarlılığı",
                  desc: isEn ? "Zero voice drift or prompt amnesia" : "Kalıcı marka hafızası",
                },
                {
                  value: "1'e 5",
                  label: isEn ? "Multi-channel leverage" : "Çok kanallı çarpan",
                  desc: isEn ? "Tailored format per platform" : "Mecraya özel editoryal format",
                },
                {
                  value: "15 Dk",
                  label: isEn ? "Weekly review time" : "Haftalık onay mesaisi",
                  desc: isEn ? "Review and approve with one click" : "Tek tıkla incele ve onayla",
                },
              ].map((metric, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E3E6E9] bg-white/90 p-4 sm:p-5 text-center sm:text-left shadow-2xs backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="font-mono text-3xl font-black text-[#172B46] shrink-0">{metric.value}</div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-[#172B46]">{metric.label}</p>
                    <p className="text-[11px] sm:text-xs text-[#8691A0]">{metric.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= INTERACTIVE COMPETITOR MATRIX (H2 SECTION) ================= */}
        <section id="karsilastirma" className="py-16 sm:py-20 lg:py-24 bg-white border-b border-[#E3E6E9]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C92E35]">
                {isEn ? "IN-DEPTH BENCHMARK MATRIX" : "DERİNLEMESİNE RAKİP ANALİZİ"}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-[#172B46]">
                {isEn
                  ? "AI Social Media Management Tools Comparison: Tentamark vs. Alternatives"
                  : "AI Sosyal Medya Yönetim Araçları Karşılaştırması: Tentamark vs. Alternatifler"}
              </h2>
              <p className="mt-3 text-base text-[#536276]">
                {isEn ? (
                  <>
                    Compare autonomy, brand memory, safety and operational speed across the 4 major paths. You can also explore our guide on{" "}
                    <Link href="/blog/sosyal-medya-yonetim-araci-nasil-secilir" className="text-[#C92E35] underline underline-offset-4">
                      how to choose a social media management tool
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    Sosyal medya yönetiminde en sık tercih edilen 4 farklı yaklaşımı; strateji üretimi, kalıcı hafıza, güvenlik ve operasyonel hız boyutlarıyla kıyaslayın. İhtiyacınıza en uygun modeli seçmek için{" "}
                    <Link href="/blog/sosyal-medya-yonetim-araci-nasil-secilir" className="text-[#C92E35] underline underline-offset-4 font-medium">
                      sosyal medya yönetim aracı nasıl seçilir
                    </Link>{" "}
                    rehberimizi de inceleyebilirsiniz.
                  </>
                )}
              </p>

              {/* Category Filter Pills */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {[
                  { id: "all", label: isEn ? "All Criteria" : "Tüm Kriterler" },
                  { id: "strategy", label: isEn ? "Strategy & Content" : "Strateji & İçerik" },
                  { id: "brand", label: isEn ? "Brand Memory" : "Marka Hafızası" },
                  { id: "safety", label: isEn ? "Safety & Review" : "Yayın & Güvenlik" },
                  { id: "time", label: isEn ? "Time & Workflow" : "Zaman & İş Akışı" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedFilter(pill.id as any)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                      selectedFilter === pill.id
                        ? "bg-[#172B46] text-white shadow-xs"
                        : "bg-[#F8F5F2] text-[#536276] hover:bg-[#E3E6E9] hover:text-[#172B46]"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* The Table / Cards Container */}
            <div className="mt-12 overflow-hidden rounded-3xl border border-[#E3E6E9] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E3E6E9] bg-[#FAF9F6]">
                      <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#536276] w-1/4">
                        {isEn ? "Comparison Factor" : "Karşılaştırma Kriteri"}
                      </th>
                      {/* Tentamark Column (Hero Highlight) */}
                      <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#C92E35] bg-[#FFF0EE]/50 w-1/4 border-x border-[#FA5252]/20">
                        <div className="flex items-center gap-1.5">
                          <span className="grid h-5 w-5 place-items-center rounded bg-[#FA5252] text-white text-[10px]">
                            ✦
                          </span>
                          <span>Tentamark (AI Manager)</span>
                        </div>
                      </th>
                      <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#536276] w-1/6">
                        {isEn ? "Schedulers (Buffer/Later)" : "Zamanlayıcılar (Buffer)"}
                      </th>
                      <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#536276] w-1/6">
                        {isEn ? "Generic AI (ChatGPT)" : "Genel AI (ChatGPT)"}
                      </th>
                      <th className="p-4 sm:p-5 text-xs font-bold uppercase tracking-wider text-[#536276] w-1/6">
                        {isEn ? "Traditional Agency" : "Geleneksel Ajans"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E6E9]">
                    {filteredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#FAF9F6]/50 transition-colors">
                        <td className="p-4 sm:p-5 align-top">
                          <p className="text-sm font-bold text-[#172B46]">{row.feature}</p>
                        </td>

                        {/* Tentamark Cell */}
                        <td className="p-4 sm:p-5 align-top bg-[#FFF0EE]/30 border-x border-[#FA5252]/20 font-medium">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#10B981] text-white text-[10px]">
                              ✓
                            </span>
                            <span className="text-xs sm:text-sm text-[#172B46] font-semibold">{row.tentamark}</span>
                          </div>
                        </td>

                        {/* Schedulers Cell */}
                        <td className="p-4 sm:p-5 align-top text-xs sm:text-sm text-[#536276]">
                          <div className="flex items-start gap-1.5">
                            {row.schedulersState === "bad" && (
                              <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-red-100 text-red-600 text-[10px]">
                                ✕
                              </span>
                            )}
                            <span>{row.schedulers}</span>
                          </div>
                        </td>

                        {/* Generic AI Cell */}
                        <td className="p-4 sm:p-5 align-top text-xs sm:text-sm text-[#536276]">
                          <div className="flex items-start gap-1.5">
                            {row.generalAiState === "bad" && (
                              <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-red-100 text-red-600 text-[10px]">
                                ✕
                              </span>
                            )}
                            <span>{row.generalAi}</span>
                          </div>
                        </td>

                        {/* Agency Cell */}
                        <td className="p-4 sm:p-5 align-top text-xs sm:text-sm text-[#536276]">
                          <span>{row.agency}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-[#8691A0]">
              {isEn
                ? "Information accurate as of September 2026. Based on publicly available documentation, feature sets and market averages."
                : "Eylül 2026 itibarıyla kamuya açık veriler, araç yetenekleri ve ortalama operasyonel standartlar referans alınarak derlenmiştir."}
            </p>
          </div>
        </section>

        {/* ================= 4 CORE DIFFERENTIATORS (H2 & H3 SECTIONS WITH IMAGES) ================= */}
        <section className="py-20 sm:py-28 lg:py-32 bg-[#FAF9F6] border-b border-[#E3E6E9]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-3xl text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C92E35]">
                {isEn ? "THE STRUCTURAL ADVANTAGE" : "YAPISAL FARKIMIZ VE ÇÖZÜMLER"}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[42px] text-[#172B46]">
                {isEn
                  ? "Why Traditional Social Media Tools Fall Short: 4 Architectural Solutions"
                  : "Geleneksel Sosyal Medya Araçları Neden Yetersiz Kalıyor? 4 Temel Mimari Çözüm"}
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#536276] leading-relaxed">
                {isEn
                  ? "Four architectural decisions that separate an autonomous AI Marketing Director from traditional software."
                  : "Tentamark'ı sıradan bir yazılımdan çıkarıp gerçek bir 'Pazarlama Direktörü' seviyesine taşıyan 4 temel mimari karar."}
              </p>
            </div>

            {/* 01 & 02 side-by-side, 03 & 04 side-by-side with generous breathing room */}
            <div className="mt-14 lg:mt-18 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 xl:gap-14">
              {pillars.map((pillar) => (
                <article
                  key={pillar.num}
                  className="group relative rounded-[36px] border border-[#E3E6E9] bg-white p-7 sm:p-9 lg:p-11 shadow-sm hover:shadow-xl hover:border-[#FA5252]/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header Row: Badge & Large Number */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#FA5252] bg-[#FFF0EE] px-3.5 py-1.5 rounded-full">
                        {pillar.badge}
                      </span>
                      <span className="font-mono text-3xl sm:text-4xl font-black text-slate-200 group-hover:text-[#FA5252]/50 transition-colors">
                        {pillar.num}
                      </span>
                    </div>

                    {/* Section Title (H3 Semantic Hierarchy) */}
                    <h3 className="mt-6 text-2xl sm:text-[26px] font-extrabold text-[#172B46] tracking-tight leading-snug">
                      {pillar.title}
                    </h3>

                    {/* Section Body */}
                    <p className="mt-3 text-sm sm:text-base text-[#536276] leading-relaxed">
                      {pillar.desc}
                    </p>

                    {/* Internal / External Citation Links (SEO Link Building) */}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                      {pillar.link && (
                        <Link href={pillar.link.href} className="inline-flex items-center gap-1 text-[#C92E35] hover:underline underline-offset-4">
                          <span>{pillar.link.text}</span>
                          <span>→</span>
                        </Link>
                      )}
                      {(pillar as any).secondaryLink && (
                        <Link href={(pillar as any).secondaryLink.href} className="inline-flex items-center gap-1 text-[#536276] hover:text-[#172B46] underline underline-offset-4">
                          <span>{(pillar as any).secondaryLink.text}</span>
                          <span>→</span>
                        </Link>
                      )}
                      {pillar.externalCitation && (
                        <a
                          href={pillar.externalCitation.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#536276] hover:text-[#172B46] underline underline-offset-4"
                        >
                          <span>{pillar.externalCitation.text}</span>
                          <HiOutlineArrowTopRightOnSquare className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    {/* Large Crisp Editorial Visual with SEO Alt Tag */}
                    {pillar.image && (
                      <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden rounded-[26px] border border-slate-200/80 bg-[#FAF9F6] shadow-sm">
                        <Image
                          src={pillar.image}
                          alt={pillar.imageAlt || pillar.title}
                          width={1000}
                          height={750}
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Highlight Bar */}
                  <div className="mt-7 rounded-2xl border border-[#E3E6E9] bg-[#FAF9F6] p-4 text-xs sm:text-sm font-semibold text-[#172B46] flex items-center gap-2">
                    <span className="text-[#FA5252] text-sm shrink-0">★</span>
                    <span>{pillar.highlight}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ================= HONEST FIT: WHO IT IS & ISN'T FOR (H2 SECTION) ================= */}
        <section className="py-16 sm:py-20 bg-white border-y border-[#E3E6E9]">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C92E35]">
                {isEn ? "TRANSPARENCY GUARANTEE" : "ŞEFFAF VE DÜRÜST DEĞERLENDİRME"}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B46]">
                {isEn
                  ? "Is Tentamark Right for Your Brand? Transparent Evaluation"
                  : "Hangi İşletmeler İçin Uygun? Şeffaf Değerlendirme ve Ürün Kapsamı"}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-[#536276]">
                {isEn ? (
                  <>
                    We don't try to be everything for everyone. Read our{" "}
                    <Link href="/tentamark-nedir" className="text-[#C92E35] underline underline-offset-4">
                      What is Tentamark
                    </Link>{" "}
                    guide for detailed scope and platform limits.
                  </>
                ) : (
                  <>
                    Herkes için her şey olmaya çalışmıyoruz. Ürün sınırları ve kapsamı hakkında daha fazla bilgi için{" "}
                    <Link href="/tentamark-nedir" className="text-[#C92E35] underline underline-offset-4 font-medium">
                      Tentamark nedir
                    </Link>{" "}
                    kılavuzumuza göz atabilirsiniz.
                  </>
                )}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Who it is for */}
              <div className="rounded-3xl border border-emerald-200 bg-white p-7 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                    ✓
                  </span>
                  <h3 className="text-lg font-bold text-[#172B46]">
                    {isEn ? "Ideal Match: You should use Tentamark if..." : "İdeal Eşleşme: Şu durumlarda Tentamark tam size göre:"}
                  </h3>
                </div>
                <ul className="mt-5 space-y-3 text-sm text-[#536276]">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>
                      {isEn
                        ? "You are a founder or small business wanting a consistent, professional social media presence without needing a full-time marketing department."
                        : "Pazarlama ekibi kurmadan sosyal medyada düzenli ve profesyonel bir varlık göstermek isteyen KOBİ ve girişimler."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>
                      {isEn
                        ? "You spend hours every week staring at blank scheduling tools wondering what caption or hook to write."
                        : "Her hafta boş takvime bakıp 'Bugün ne yazsam, nasıl bir kanca kursam?' stresinden yorulmuş işletme sahipleri."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>
                      {isEn ? (
                        <>
                          You want AI speed, but insist on keeping 100% human editorial approval before anything is published (
                          <Link href="/blog/sosyal-medya-gonderi-onay-sureci" className="text-[#C92E35] underline underline-offset-4 font-medium">
                            see approval process guide
                          </Link>
                          ).
                        </>
                      ) : (
                        <>
                          Yapay zekanın hızını ve zekasını isteyen, ancak son sözün ve editoryal onayın mutlaka kendisinde olmasını isteyenler (
                          <Link href="/blog/sosyal-medya-gonderi-onay-sureci" className="text-[#C92E35] underline underline-offset-4 font-medium">
                            sosyal medya onay süreci rehberini inceleyin
                          </Link>
                          ).
                        </>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>
                      {isEn
                        ? "You manage 3-10 client brands and want to multiply your boutique agency output by 5x."
                        : "Müşterilerine sosyal medya hizmeti veren ve içerik üretim hızını 5 katına çıkarmak isteyen butik ajanslar."}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Who it is NOT for */}
              <div className="rounded-3xl border border-red-200 bg-white p-7 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-red-100 text-red-700 font-bold">
                    ✕
                  </span>
                  <h3 className="text-lg font-bold text-[#172B46]">
                    {isEn ? "Not a Match: Tentamark is NOT for you if..." : "Uygun Olmayan Beklentiler: Şu durumlarda başka araçlar seçilmelidir:"}
                  </h3>
                </div>
                <ul className="mt-5 space-y-3 text-sm text-[#536276]">
                  {[
                    isEn
                      ? "You only post once a month for personal vacation photos (a free personal Instagram account is enough)."
                      : "Sadece ayda 1 kez kişisel tatil fotoğrafı paylaşan ve ticari bir marka hedefi olmayan bireysel kullanıcılar.",
                    isEn
                      ? "You want a spam bot that publishes 50 low-quality posts a day without any human review or brand voice."
                      : "Marka itibarına bakmaksızın günde 50 adet spam içerik basacak kontrolsüz bot arayışında olanlar.",
                    isEn
                      ? "You expect AI to magically replace all physical product photography without uploading your own assets."
                      : "Kendi ürün fotoğraf ve varlıklarını sisteme yüklemeden, sıfırdan sihirli bir şekilde ürün ortaya çıkmasını bekleyenler.",
                    isEn
                      ? "You refuse to spend 15 minutes a week reviewing drafts to protect your company reputation."
                      : "Şirket itibarını korumak için haftada 15 dakika ayırıp içerik taslaklarını incelemek istemeyenler.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-red-500 font-bold mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FREQUENTLY ASKED QUESTIONS (H2 SECTION) ================= */}
        <section className="py-16 sm:py-20 lg:py-24 bg-[#FAF9F6] border-b border-[#E3E6E9]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C92E35]">
                {isEn ? "CLEAR ANSWERS" : "NET VE ŞEFFAF CEVAPLAR"}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#172B46]">
                {isEn
                  ? "Frequently Asked Questions About AI Social Media Management"
                  : "AI Sosyal Medya Yönetimi Hakkında Sıkça Sorulan Sorular"}
              </h2>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-[#E3E6E9] bg-white overflow-hidden transition shadow-2xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-[#172B46] hover:bg-[#FAF9F6] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <HiOutlineChevronDown
                        className={`h-5 w-5 text-[#8691A0] transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#FA5252]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm text-[#536276] leading-relaxed border-t border-[#E3E6E9]/60 bg-[#FAF9F6]/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA (H2 SECTION) ================= */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#FAF9F6] to-[#FFF0EE]/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="rounded-3xl border border-[#FA5252]/20 bg-white p-8 sm:p-12 shadow-sm relative overflow-hidden">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#FFF0EE] blur-2xl"
                aria-hidden="true"
              />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C92E35]">
                {isEn ? "NO CREDIT CARD REQUIRED" : "KREDİ KARTI GEREKMEZ"}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-[#172B46] sm:text-4xl">
                {isEn
                  ? "Automate Your Social Media Content Workflow with Tentamark"
                  : "Sosyal Medya İçerik Süreçlerinizi Tentamark ile Otonom Hale Getirin"}
              </h2>
              <p className="mt-4 text-base text-[#536276] max-w-2xl mx-auto">
                {isEn
                  ? "Create your Brand DNA in 3 minutes. Receive your first ready-to-publish weekly content strategy immediately."
                  : "Marka DNA'nızı 3 dakikada oluşturun. İlk haftalık içerik paketinizi hemen takviminizde görün ve onaylayın."}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FA5252] px-7 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#E64242] transition"
                >
                  <span>{isEn ? "Get Started for Free" : "Ücretsiz Deneyin"}</span>
                  <HiOutlineArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/nasil-calisir"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E3E6E9] bg-[#FAF9F6] px-6 py-3.5 text-sm font-bold text-[#172B46] hover:bg-white transition"
                >
                  <span>{isEn ? "See How It Works" : "Çalışma Akışını İnceleyin"}</span>
                </Link>
              </div>

              <p className="mt-4 text-xs text-[#8691A0]">
                {isEn
                  ? "Cancel anytime · 14-day full access · Instant onboarding"
                  : "14 gün ücretsiz deneme · İptal etmek serbest · Anında kurulum"}
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function WhyTentamarkContent() {
  return (
    <LanguageProvider>
      <WhyTentamarkInner />
    </LanguageProvider>
  );
}
