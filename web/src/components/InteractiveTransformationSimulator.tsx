"use client";

import React, { useState } from "react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaTiktok,
  FaThreads,
} from "react-icons/fa6";
import {
  HiOutlineSparkles,
  HiOutlineHeart,
  HiOutlineChatBubbleOvalLeft,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineShare,
  HiCheck,
  HiOutlineLightBulb,
} from "react-icons/hi2";

type IndustryKey = "coffee" | "saas" | "ceramic";
type PlatformKey = "instagram" | "linkedin" | "x" | "tiktok" | "threads";

interface IndustryData {
  id: IndustryKey;
  icon: string;
  name: string;
  nameEn: string;
  ideaPrompt: string;
  ideaPromptEn: string;
  handle: string;
  authorName: string;
  authorRole: string;
  avatarBg: string;
  platforms: {
    instagram: {
      slideTitle: string;
      slideSubtitle: string;
      slideNumber: string;
      caption: string;
      hashtags: string[];
    };
    linkedin: {
      headline: string;
      hook: string;
      body: string;
      cta: string;
      stats: string;
    };
    x: {
      tweet1: string;
      tweet2: string;
      retweets: string;
      likes: string;
    };
    tiktok: {
      visualHook: string;
      spokenAudio: string;
      endingCta: string;
      duration: string;
    };
    threads: {
      text: string;
      likes: string;
    };
  };
}

const PRESETS: Record<IndustryKey, IndustryData> = {
  coffee: {
    id: "coffee",
    icon: "☕",
    name: "Butik & Yerel (Özel Kahve)",
    nameEn: "Local Boutique (Specialty Coffee)",
    authorName: "The Coffee Workshop",
    authorRole: "Nitelikli Kahve Kavurucusu · Kadıköy",
    handle: "@thecoffeeworkshop",
    avatarBg: "bg-amber-700",
    ideaPrompt:
      "Zincir markaların aksine çekirdekleri haftalık kavurmamızın arkasındaki lezzet farkı ve 3 püf noktası.",
    ideaPromptEn:
      "Why we roast beans weekly unlike big supermarket chains: The 3 flavor secrets.",
    platforms: {
      instagram: {
        slideTitle: "Süpermarket kahvelerinin size söylemediği acı gerçek ☕",
        slideSubtitle: "Raf ömrü 12 ay olan paketler neden aromasını kaybeder?",
        slideNumber: "1 / 4",
        caption:
          "Taze kavrulmuş bir çekirdekle 6 aydır rafta bekleyen paket arasındaki farkı bir kez anladığınızda geri dönüş yok.\n\nKahve kavrulduktan sonraki ilk 21 gün içinde zirve lezzetine ulaşır. Biz bu yüzden asla stoklu çalışmıyor, haftalık parti kavuruyoruz.",
        hashtags: ["#NitelikliKahve", "#YerelÜretici", "#SpecialtyCoffee", "#TazeKavrum"],
      },
      linkedin: {
        headline: "Perakende Devlerine Karşı Butik Üretici Stratejisi",
        hook: "Dev zincirlerle rekabet ederken fiyat kırmak yerine yaptığımız tek şey: 'Tazelik takıntısı.'",
        body: "Büyük perakendeciler lojistik ve 12 aylık raf ömrünü optimize ederken; bağımsız üreticiler sadece tek bir şeyi optimize edebilir: 'Tüketicinin bardağındaki ilk yudum lezzeti.'\n\nFiyat savaşında devleri yenemezsiniz; ama tazelik ve şeffaflıkta onları her zaman geçebilirsiniz.",
        cta: "Sizin sektörünüzde zincir rakiplere karşı en güçlü rekabet kozunuz ne?",
        stats: "184 beğeni · 28 yorum",
      },
      x: {
        tweet1:
          "1/3 Neden marketten kahve almayı bıraktım? (Mini zincir 👇)\n\nKahve kavrulduğu andan itibaren karbondioksit salmaya ve oksitlenmeye başlar. Zirve lezzet ilk 21 gündür.",
        tweet2:
          "2/3 Paketin üzerinde 'Kavrum Tarihi' yoksa ve sadece 'Son Kullanma Tarihi' yazıyorsa; muhtemelen 8 ay önce kavrulmuş bayat bir kömür içiyorsunuz.",
        retweets: "42",
        likes: "389",
      },
      tiktok: {
        visualHook: "🎬 [0-3sn]: Kameraya yaklaşan köpüklü espresso + Ekranda büyük yazı: 'Market kahvesi neden acı tat verir?'",
        spokenAudio:
          "🎙️ [3-20sn]: 'Eğer kahveniz acı geliyorsa sorun damak tadınızda değil! Çekirdeğiniz muhtemelen 8 ay önce fabrikada yakıldı. İşte taze kavrumla arasındaki o fark...'",
        endingCta: "👉 [Bitiş]: Kadıköy atölyemize gelin veya taze kavrumu evde deneyin!",
        duration: "0:28",
      },
      threads: {
        text:
          "Kahveye şeker veya süt ekleme ihtiyacı duyuyorsanız sorun sizde değil, içtiğiniz kahvenin aylar önce kavrulmuş olmasında. Taze nitelikli kahve doğal meyvemsi ve tatlıdır.",
        likes: "142",
      },
    },
  },
  saas: {
    id: "saas",
    icon: "🚀",
    name: "B2B & SaaS (Pazarlama Yazılımı)",
    nameEn: "B2B & SaaS (Growth Software)",
    authorName: "GrowthPilot",
    authorRole: "Pazarlama Otomasyonu Platformu",
    handle: "@growthpilot_hq",
    avatarBg: "bg-indigo-600",
    ideaPrompt:
      "Pazarlama ekiplerinin haftada 14 saatini çalan manuel kanal formatlama hamallığı ve 1→7 çarpan çözümü.",
    ideaPromptEn:
      "The 14 hours marketing teams waste reformatting posts for each platform and how AI multipliers solve it.",
    platforms: {
      instagram: {
        slideTitle: "Haftada 14 saatiniz içerik kopyala-yapıştır ile mi geçiyor? ⏱️",
        slideSubtitle: "1 tek fikri 7 platforma otomatik dağıtmanın yeni yolu.",
        slideNumber: "1 / 5",
        caption:
          "İçerik üretmek zor değil; asıl zamanı çalan şey aynı metni LinkedIn için ciddileştirmek, Instagram için carousel yapmak, X için zincire bölmek.\n\nAkıllı pazarlamacılar içeriği yeniden yazmaz; kültürüne göre çoğaltır.",
        hashtags: ["#PazarlamaOtomasyonu", "#B2BGrowth", "#SaaS", "#Verimlilik"],
      },
      linkedin: {
        headline: "Pazarlama Ekiplerinde 'Format Hamallığı' Sendromu",
        hook: "Pazarlama ekibinizin haftalık 14 saatini çalan şey içerik üretmek değil; 'kanal uyarlama hamallığı.'",
        body: "LinkedIn için yazılan bir içgörüyü alıp:\n• Instagram için carousel slaytlarına bölmek\n• X için 280 karakterlik zincir yapmak\n• TikTok için 30 saniyelik video kancası yazmak\n\nBunu manuel yapan ekipler stratejiye vakit bulamıyor. Gelecek, tek fikri çok kanala saniyeler içinde dağıtan otonom motorlarda.",
        cta: "Ekibiniz haftada kaç saatini içerik formatlamaya harcıyor?",
        stats: "312 beğeni · 64 yorum",
      },
      x: {
        tweet1:
          "1/4 Sık yapılan bir hata: Her platforma aynı metni kopyalayıp yapıştırmak.\n\nLinkedIn kitlesi içgörü arayabilir; X için kısa bir açılış, Instagram için görsel bağlam gerekebilir.",
        tweet2:
          "2/4 Çözüm her yere ayrı post yazmak değil. Tek bir sağlam çekirdek fikri '1 → 7 Çarpan' mantığıyla platformun kendi diline çevirmek.",
        retweets: "78",
        likes: "614",
      },
      tiktok: {
        visualHook: "🎬 [0-3sn]: Bilgisayar başında yorgun düşmüş pazarlamacı + Ekranda: 'Tüm gün 5 ayrı platforma post hazırlayan ben'",
        spokenAudio:
          "🎙️ [3-22sn]: 'Hala her sosyal medya hesabı için sıfırdan metin mi yazıyorsun? Tek bir blog yazısını veya fikri 30 saniyede Instagram slaytına, LinkedIn postuna ve video metnine dönüştüren şu akışa bak...'",
        endingCta: "👉 [Bitiş]: Zamandan tasarruf etmek için bio'daki aracı test et!",
        duration: "0:32",
      },
      threads: {
        text:
          "İyi bir pazarlamacı çok post yazan değil, yazdığı 1 sağlam fikri 7 farklı mecrada sanki o mecra için doğmuş gibi konuşturan kişidir.",
        likes: "219",
      },
    },
  },
  ceramic: {
    id: "ceramic",
    icon: "🏺",
    name: "E-Ticaret & Ürün (Seramik Tasarım)",
    nameEn: "E-Commerce (Handmade Ceramic)",
    authorName: "Atölye Toprak",
    authorRole: "El Yapımı Fonksiyonel Seramik",
    handle: "@atolyetoprak",
    avatarBg: "bg-rose-700",
    ideaPrompt:
      "Tornada 3 günde şekillenen bir espresso bardağının kusurlu güzelliği ve seri üretime karşı duruşu.",
    ideaPromptEn:
      "A handmade espresso cup taking 3 days on the potter's wheel: Wabi-sabi beauty vs mass production.",
    platforms: {
      instagram: {
        slideTitle: "Topraktan fincana: 1 bardağın 72 saatlik serüveni ✨",
        slideSubtitle: "Neden her fincanımızın kenarında parmak izimiz var?",
        slideNumber: "1 / 4",
        caption:
          "Fabrikasyon ürünler kusursuzluğu hedefler; el yapımı seramik ise o parçanın dünyada tek ve biricik olmasını.\n\nBu fincan 3 gün boyunca kurutuldu, 1050 derecede fırınlandı ve tek tek sırlandı. Sabah kahvenize dokunduğunuzda o emeği hissetmeniz için.",
        hashtags: ["#ElYapımıSeramik", "#WabiSabi", "#KahveFincanı", "#SeramikSanatı"],
      },
      linkedin: {
        headline: "E-Ticarette Seri Üretime Karşı 'Yavaş Tasarım' Başarısı",
        hook: "Hızlı tüketim çağında 'yavaş üretim' bir dezavantaj değil, en büyük lüks haline geldi.",
        body: "E-ticarette fabrikasyon kupalar 80 TL'ye satılırken, 3 günde elle şekillendirdiğimiz fincanlarımıza aylarca sıra bekleniyor.\n\nNeden? Çünkü insanlar artık nesne satın almıyor; o nesnenin arkasındaki zanaatı, hikayeyi ve parmak izini satın alıyor.",
        cta: "Markanızda müşterilerinizin 'arkasındaki emeğe' bağlandığı en somut detay nedir?",
        stats: "245 beğeni · 39 yorum",
      },
      x: {
        tweet1:
          "1/3 Seri üretilmiş bir kupa ile torna seramiği arasındaki fark: Her fırınlamada ortaya çıkan o benzersiz sır çatlağı ve ağırlık dengesi.",
        tweet2:
          "2/3 Fabrika 1 saniyede presler, biz 72 saatte kuruturuz. Masanızda duran şey sadece bir bardak değil, sabrın somutlaşmış hali.",
        retweets: "34",
        likes: "412",
      },
      tiktok: {
        visualHook: "🎬 [0-3sn]: Tornada dönen ıslak çamurun ağır çekim görüntüsü + Tatmin edici ASMR çamur sesi",
        spokenAudio:
          "🎙️ [3-25sn]: 'Bu bardağın sadece fırında beklemesi 18 saat sürüyor. Neden bu kadar uğraşıyoruz? Çünkü sabah kahvenizi tuttuğunuzda fabrikasyon plastik hissi değil, gerçek toprağın sıcaklığını hissetmenizi istiyoruz...'",
        endingCta: "👉 [Bitiş]: Sınırlı son parti koleksiyon web sitemizde yayında!",
        duration: "0:30",
      },
      threads: {
        text:
          "Mükemmel olmak zorunda değil, samimi olsun yeter. Seramik fincanlarımızın hiçbirinin diğerine tıpatıp benzememesi bir hata değil, en büyük gururumuz.",
        likes: "188",
      },
    },
  },
};

interface SimulatorProps {
  isEn?: boolean;
}

export default function InteractiveTransformationSimulator({ isEn = false }: SimulatorProps) {
  const [activeIndustry, setActiveIndustry] = useState<IndustryKey>("coffee");
  const [activePlatform, setActivePlatform] = useState<PlatformKey>("instagram");

  const data = PRESETS[activeIndustry];

  return (
    <div className="relative isolate w-full rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white via-stone-50/50 to-white p-3.5 sm:p-5 shadow-[0_20px_60px_-15px_rgba(23,43,70,0.12)] transition-all">
      {/* Top Bar: Live interactive badge */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[10px] font-bold tracking-wider text-slate-700 uppercase">
            {isEn ? "Live Transformation Simulator" : "Canlı Dönüşüm Simülatörü"}
          </span>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 border border-orange-200/60 font-mono text-[10px] font-extrabold text-orange-700">
          <HiOutlineSparkles className="h-3 w-3 text-orange-600" />
          <span>{isEn ? "1 Idea → 7 Channels" : "1 Fikir → 7 Platform"}</span>
        </div>
      </div>

      {/* Industry Preset Selector */}
      <div className="mb-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span>{isEn ? "Choose an industry sample:" : "Bir sektör örneği seçin:"}</span>
          <span className="text-[10px] text-slate-400 font-mono">{isEn ? "Click to test" : "Tıklayıp deneyin"}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {(["coffee", "saas", "ceramic"] as IndustryKey[]).map((key) => {
            const item = PRESETS[key];
            const isSelected = activeIndustry === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveIndustry(key)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-left text-xs font-semibold transition cursor-pointer ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="truncate text-[11px] sm:text-xs">
                  {isEn ? item.nameEn.split(" ")[0] : item.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The Single Source Idea Box */}
      <div className="mb-4 rounded-2xl border border-amber-200/80 bg-amber-50/40 p-3 sm:p-3.5 transition">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-amber-800 uppercase tracking-wider">
            <HiOutlineLightBulb className="h-3.5 w-3.5 text-amber-600" />
            <span>{isEn ? "Raw Idea Input (What you write)" : "Ham Fikir Girdisi (Sizin yazdığınız)"}</span>
          </div>
          <span className="rounded-md bg-amber-200/60 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-900">
            {isEn ? "Single Input" : "Tek Cümle"}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-800 italic leading-relaxed">
          &ldquo;{isEn ? data.ideaPromptEn : data.ideaPrompt}&rdquo;
        </p>
      </div>

      {/* Transformation Pipeline Divider */}
      <div className="relative my-3 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed border-slate-200" />
        </div>
        <div className="relative inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-600 border border-slate-200 shadow-2xs">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span>{isEn ? "AI automatically adapts the format:" : "AI platform kültürüne dönüştürür:"}</span>
        </div>
      </div>

      {/* Target Platform Tabs */}
      <div className="mb-3 flex items-center justify-between gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1">
        {[
          { key: "instagram" as const, label: "Instagram", icon: FaInstagram, color: "text-pink-600" },
          { key: "linkedin" as const, label: "LinkedIn", icon: FaLinkedinIn, color: "text-blue-600" },
          { key: "x" as const, label: "X / Thread", icon: FaXTwitter, color: "text-slate-900" },
          { key: "tiktok" as const, label: "TikTok / Reel", icon: FaTiktok, color: "text-slate-900" },
          { key: "threads" as const, label: "Threads", icon: FaThreads, color: "text-slate-900" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activePlatform === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActivePlatform(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-[11px] font-bold transition cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
              }`}
            >
              <Icon className={`h-3 w-3 ${isActive ? tab.color : "text-slate-400"}`} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live Social Post Simulation Card */}
      <div className="min-h-[260px] rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-sm">
        {/* Instagram Preview */}
        {activePlatform === "instagram" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white font-bold text-xs ${data.avatarBg}`}>
                  {data.authorName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-none">{data.handle}</div>
                  <div className="text-[10px] text-slate-400">{data.authorRole.split("·")[0]}</div>
                </div>
              </div>
              <span className="rounded-full bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-700 border border-pink-200/50">
                Carousel Slaytı
              </span>
            </div>

            {/* Visual Carousel Card Preview */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-900 via-stone-900 to-slate-800 p-4 text-white shadow-inner">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] font-bold tracking-wider text-orange-400 uppercase">
                  Tentamark Carousel
                </span>
                <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white/90">
                  {data.platforms.instagram.slideNumber}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold leading-snug tracking-tight">
                {data.platforms.instagram.slideTitle}
              </h4>
              <p className="mt-2 text-xs text-white/70 leading-relaxed">
                {data.platforms.instagram.slideSubtitle}
              </p>
              <div className="mt-4 flex items-center justify-between text-[10px] text-white/50 border-t border-white/10 pt-2 font-mono">
                <span>{isEn ? "Swipe to learn →" : "Kaydırarak devam edin →"}</span>
                <div className="flex gap-1">
                  <span className="h-1.5 w-4 rounded-full bg-orange-500" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                </div>
              </div>
            </div>

            {/* Caption & Hashtags */}
            <div className="text-xs text-slate-700 space-y-1.5">
              <p className="leading-relaxed whitespace-pre-line line-clamp-3">
                <span className="font-bold text-slate-900 mr-1.5">{data.handle}</span>
                {data.platforms.instagram.caption}
              </p>
              <p className="text-[11px] font-semibold text-blue-600">
                {data.platforms.instagram.hashtags.join(" ")}
              </p>
            </div>
          </div>
        )}

        {/* LinkedIn Preview */}
        {activePlatform === "linkedin" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold text-xs ${data.avatarBg}`}>
                  {data.authorName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <span>{data.authorName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">· 1st</span>
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{data.authorRole}</div>
                  <div className="text-[9px] text-slate-400">2h · 🌐</div>
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200/60">
                Thought Leadership
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-800 leading-relaxed border-t border-slate-100 pt-2.5">
              <p className="font-bold text-slate-900">{data.platforms.linkedin.hook}</p>
              <p className="whitespace-pre-line text-slate-700">{data.platforms.linkedin.body}</p>
              <p className="font-semibold text-blue-700 pt-1">{data.platforms.linkedin.cta}</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <span>👏 💡 ❤️</span>
                <span>{data.platforms.linkedin.stats}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 font-medium text-[10px]">
                <span>Like</span> · <span>Comment</span> · <span>Repost</span>
              </div>
            </div>
          </div>
        )}

        {/* X (Twitter) Thread Preview */}
        {activePlatform === "x" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                {isEn ? "3-Tweet Connected Thread" : "3 Tweetlik Bağlantılı Zincir"}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                X / Twitter
              </span>
            </div>

            {/* Tweet 1 */}
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-3 bottom-0 w-[2px] bg-slate-200" />
              <div className={`absolute left-0 top-1 h-5 w-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${data.avatarBg}`}>
                {data.authorName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-900">{data.authorName}</span>
                  <span className="text-slate-400 text-[11px]">{data.handle}</span>
                </div>
                <p className="mt-1 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {data.platforms.x.tweet1}
                </p>
              </div>
            </div>

            {/* Tweet 2 */}
            <div className="relative pl-6 pt-1">
              <div className={`absolute left-0 top-2 h-5 w-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center ${data.avatarBg}`}>
                {data.authorName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-900">{data.authorName}</span>
                  <span className="text-slate-400 text-[11px]">{data.handle}</span>
                </div>
                <p className="mt-1 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {data.platforms.x.tweet2}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500 font-mono">
              <span>🔁 {data.platforms.x.retweets} Retweet</span>
              <span>❤️ {data.platforms.x.likes} Beğeni</span>
              <span className="text-slate-400">Bookmark 🔖</span>
            </div>
          </div>
        )}

        {/* TikTok Script Preview */}
        {activePlatform === "tiktok" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-slate-900 uppercase">
                  {isEn ? "Vertical Video Storyboard" : "Dikey Video / Reels Senaryosu"}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-bold">
                ⏱️ {data.platforms.tiktok.duration}
              </span>
            </div>

            {/* Visual Hook */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 text-xs text-rose-950">
              <div className="font-bold text-[10px] text-rose-700 uppercase tracking-wider mb-1 font-mono">
                {isEn ? "Visual Pattern Interrupt (0-3s)" : "Görsel Açılış Kancası (0-3sn)"}
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {data.platforms.tiktok.visualHook}
              </p>
            </div>

            {/* Spoken Script */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-800">
              <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">
                {isEn ? "Spoken Script (Temposu Yüksek)" : "Konuşma Metni (Temposu Yüksek)"}
              </div>
              <p className="text-xs leading-relaxed">
                {data.platforms.tiktok.spokenAudio}
              </p>
            </div>

            {/* CTA */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-2 text-xs text-emerald-900 flex items-center justify-between">
              <span className="font-bold text-[11px]">{data.platforms.tiktok.endingCta}</span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold">CTA</span>
            </div>
          </div>
        )}

        {/* Threads Preview */}
        {activePlatform === "threads" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white font-bold text-xs ${data.avatarBg}`}>
                  {data.authorName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{data.handle}</div>
                  <div className="text-[10px] text-slate-400">Threads · 45m</div>
                </div>
              </div>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                Mikro Gönderi
              </span>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed border-t border-slate-100 pt-2">
              {data.platforms.threads.text}
            </p>

            <div className="flex items-center gap-4 text-slate-400 text-xs pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1 hover:text-rose-600 transition">
                <HiOutlineHeart className="h-4 w-4" />
                <span className="text-[11px] font-mono">{data.platforms.threads.likes}</span>
              </span>
              <span className="hover:text-blue-600 transition">
                <HiOutlineChatBubbleOvalLeft className="h-4 w-4" />
              </span>
              <span className="hover:text-emerald-600 transition">
                <HiOutlineArrowPathRoundedSquare className="h-4 w-4" />
              </span>
              <span className="hover:text-slate-900 transition">
                <HiOutlineShare className="h-4 w-4" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer indicator */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <HiCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>{isEn ? "Zero copy-paste · Culturally adapted" : "Kopyala-yapıştır yok · Kültürüne göre uyarlanmış"}</span>
        </span>
        <span className="font-mono text-[10px] text-slate-500 font-bold">
          {activeIndustry.toUpperCase()} · {activePlatform.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
