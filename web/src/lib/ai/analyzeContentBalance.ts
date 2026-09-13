export type PillarDistribution = {
  pillar: string;
  count: number;
  percentage: number;
  color: string;
};

export type ContentBalanceAnalysis = {
  totalPosts: number;
  pillars: PillarDistribution[];
  status: "balanced" | "warning" | "empty";
  message: string;
  suggestion: string | null;
  // The exact pillar label the warning is about — passed straight through
  // to fillCalendarDateWithAi's desiredCategory so "AI ile Eksik Günü
  // Doldur" actually fills the gap it just described, instead of the
  // button opening a generic fill with no memory of which pillar was short.
  suggestedPillar: string | null;
};

const EDUCATIONAL_PILLAR = "Eğitici & Rehber";

export function analyzeContentBalance(
  posts: { title?: string; caption?: string; tags?: string[]; category?: string | null }[]
): ContentBalanceAnalysis {
  const total = posts.length;

  if (total === 0) {
    return {
      totalPosts: 0,
      pillars: [],
      status: "empty",
      message: "Bu takvim aralığında henüz hiç gönderi planlanmadı.",
      suggestion: "Kitlenizin sizi unutmaması için haftada en az 3-4 gönderi planlamanızı öneririz.",
      suggestedPillar: null,
    };
  }

  // Count categories based on keywords — category (the real brand_strategy
  // pillar name this content was tagged with, see generateWeeklyPack.ts) is
  // weighted into the same text blob as title/caption/tags rather than
  // trusted as an exact match, since pillar names are free-form per brand
  // ("Yerel Keşifler & Lezzet Rehberi") and won't line up with these 4
  // fixed buckets verbatim — but it's still a short, deliberately-chosen
  // label, so including it is strictly more signal than ignoring it.
  let educationalCount = 0;
  let promotionalCount = 0;
  let engagementCount = 0;
  let entertainmentCount = 0;

  for (const p of posts) {
    const text = `${p.category ?? ""} ${p.title ?? ""} ${p.caption ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase();

    if (
      text.includes("eğitici") ||
      text.includes("ipucu") ||
      text.includes("nasıl") ||
      text.includes("rehber") ||
      text.includes("öğren") ||
      text.includes("tavsiye")
    ) {
      educationalCount++;
    } else if (
      text.includes("fiyat") ||
      text.includes("satış") ||
      text.includes("ürün") ||
      text.includes("indirim") ||
      text.includes("koleksiyon") ||
      text.includes("satın") ||
      text.includes("kampanya") ||
      text.includes("sipariş")
    ) {
      promotionalCount++;
    } else if (
      text.includes("reels") ||
      text.includes("viral") ||
      text.includes("komik") ||
      text.includes("mizah") ||
      text.includes("trend") ||
      text.includes("caps")
    ) {
      entertainmentCount++;
    } else {
      engagementCount++;
    }
  }

  const pillars: PillarDistribution[] = [
    {
      pillar: "Ürün & Tanıtım",
      count: promotionalCount,
      percentage: Math.round((promotionalCount / total) * 100),
      color: "bg-blue-500",
    },
    {
      pillar: "Eğitici & Rehber",
      count: educationalCount,
      percentage: Math.round((educationalCount / total) * 100),
      color: "bg-emerald-500",
    },
    {
      pillar: "Etkileşim & Hikaye",
      count: engagementCount,
      percentage: Math.round((engagementCount / total) * 100),
      color: "bg-rose-500",
    },
    {
      pillar: "Eğlence & Trend",
      count: entertainmentCount,
      percentage: Math.round((entertainmentCount / total) * 100),
      color: "bg-amber-500",
    },
  ];

  // Evaluate balance
  const promoRatio = promotionalCount / total;
  const eduRatio = educationalCount / total;

  if (promoRatio >= 0.6) {
    return {
      totalPosts: total,
      pillars,
      status: "warning",
      message: "İçeriklerinizin %60'ından fazlası doğrudan tanıtım/satış odaklı.",
      suggestion:
        "Kitlenin sadakatini ve kaydetme oranını yükseltmek için takvime 1 adet eğitici veya kamera arkası içerik ekleyin.",
      suggestedPillar: EDUCATIONAL_PILLAR,
    };
  }

  if (eduRatio === 0 && total >= 3) {
    return {
      totalPosts: total,
      pillars,
      status: "warning",
      message: "Takvimde hiç eğitici / ipucu içeriği bulunmuyor.",
      suggestion: "Sektörünüzde değer katan '3 İpucu' veya 'Nasıl Yapılır' gönderisi eklemeniz erişimi katlar.",
      suggestedPillar: EDUCATIONAL_PILLAR,
    };
  }

  return {
    totalPosts: total,
    pillars,
    status: "balanced",
    message: "İçerik dağılımınız sağlıklı ve dengeli görünüyor.",
    suggestion: "Farklı platform formatlarını (Reels, Karusel) test etmeye devam edin.",
    suggestedPillar: null,
  };
}
