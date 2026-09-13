// Pure, deterministic — no AI call needed. Every input here already comes
// from getAnalyticsOverview.ts's real queries (publish attempts, strategy
// pillars, weekly velocity, connected accounts). Replaces a hardcoded
// "784/1000" and a fake "+18 puan" checklist that didn't correspond to any
// real calculation.
export type ScoreStatus = "veri-yok" | "zayif" | "orta" | "guclu";

export type ScoreFactor = {
  key: "yayin" | "strateji" | "tutarlilik" | "hesap";
  label: string;
  score: number; // 0-250
  status: ScoreStatus;
  detail: string;
  action: { label: string; href: string };
};

export type SocialScoreResult = {
  total: number; // 0-1000
  factors: ScoreFactor[];
  diagnosis: string;
  weakest: ScoreFactor;
};

export type SocialScoreInput = {
  publishSuccessRatePct: number | null;
  pillarAdherence: { name: string; planned: number; actual: number }[];
  weeklyVelocity: { weekLabel: string; count: number }[];
  connectedAccounts: number;
  accountsNeedingAttention: number;
};

function statusFromPct(pct: number): ScoreStatus {
  if (pct >= 80) return "guclu";
  if (pct >= 50) return "orta";
  return "zayif";
}

export function computeSocialScore(input: SocialScoreInput): SocialScoreResult {
  // 1. Yayın Başarısı — gerçek yayın denemelerinin başarı oranı.
  let yayinScore: number;
  let yayinStatus: ScoreStatus;
  let yayinDetail: string;
  if (input.publishSuccessRatePct === null) {
    yayinScore = 125;
    yayinStatus = "veri-yok";
    yayinDetail = "Henüz bir yayın denemesi olmadığı için ölçülemedi.";
  } else {
    yayinScore = Math.round((input.publishSuccessRatePct / 100) * 250);
    yayinStatus = statusFromPct(input.publishSuccessRatePct);
    yayinDetail = `Denenen yayınların %${input.publishSuccessRatePct}'i başarıyla tamamlandı.`;
  }

  // 2. Strateji Uyumu — planlanan sütun yüzdeleri ile gerçekleşen üretim arasındaki ortalama fark.
  let stratejiScore: number;
  let stratejiStatus: ScoreStatus;
  let stratejiDetail: string;
  if (input.pillarAdherence.length === 0) {
    stratejiScore = 125;
    stratejiStatus = "veri-yok";
    stratejiDetail = "Henüz bir AI İçerik Stratejisi oluşturulmadı.";
  } else {
    const avgGap =
      input.pillarAdherence.reduce((sum, p) => sum + Math.abs(p.planned - p.actual), 0) /
      input.pillarAdherence.length;
    const adherencePct = Math.max(0, 100 - avgGap * 2);
    stratejiScore = Math.round((adherencePct / 100) * 250);
    stratejiStatus = statusFromPct(adherencePct);
    stratejiDetail = `Planlanan içerik sütunlarıyla gerçekleşen üretim arasında ortalama %${Math.round(avgGap)} puanlık fark var.`;
  }

  // 3. Üretim Tutarlılığı — son 8 haftalık yayın hacminin varyasyon katsayısı (düşük = tutarlı).
  let tutarlilikScore: number;
  let tutarlilikStatus: ScoreStatus;
  let tutarlilikDetail: string;
  const counts = input.weeklyVelocity.map((w) => w.count);
  const totalPosts = counts.reduce((a, b) => a + b, 0);
  if (totalPosts === 0) {
    tutarlilikScore = 0;
    tutarlilikStatus = "zayif";
    tutarlilikDetail = "Son 8 haftada hiç gönderi yayınlanmadı.";
  } else {
    const mean = totalPosts / counts.length;
    const variance = counts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / counts.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
    const consistencyPct = Math.max(0, Math.min(100, 100 - cv * 100));
    tutarlilikScore = Math.round((consistencyPct / 100) * 250);
    tutarlilikStatus = statusFromPct(consistencyPct);
    const paceLabel =
      consistencyPct >= 80 ? "oldukça düzenli" : consistencyPct >= 50 ? "orta düzeyde dalgalı" : "düzensiz";
    tutarlilikDetail = `Son 8 haftada ortalama haftada ${mean.toFixed(1)} gönderi yayınlandı, temponuz ${paceLabel}.`;
  }

  // 4. Hesap Sağlığı — bağlı hesapların kaçı "active" durumda.
  let hesapScore: number;
  let hesapStatus: ScoreStatus;
  let hesapDetail: string;
  if (input.connectedAccounts === 0) {
    hesapScore = 0;
    hesapStatus = "zayif";
    hesapDetail = "Henüz bağlı bir sosyal hesap yok.";
  } else {
    const healthyCount = input.connectedAccounts - input.accountsNeedingAttention;
    const healthPct = (healthyCount / input.connectedAccounts) * 100;
    hesapScore = Math.round((healthPct / 100) * 250);
    hesapStatus = statusFromPct(healthPct);
    hesapDetail = `${input.connectedAccounts} bağlı hesaptan ${healthyCount} tanesi sağlıklı çalışıyor.`;
  }

  const factors: ScoreFactor[] = [
    {
      key: "yayin",
      label: "Yayın Başarısı",
      score: yayinScore,
      status: yayinStatus,
      detail: yayinDetail,
      action: { label: "Bağlantıları kontrol et", href: "/settings?tab=baglantilar" },
    },
    {
      key: "strateji",
      label: "Strateji Uyumu",
      score: stratejiScore,
      status: stratejiStatus,
      detail: stratejiDetail,
      action: { label: "Marka Profili'nde stratejiyi gözden geçir", href: "/dashboard/brand" },
    },
    {
      key: "tutarlilik",
      label: "Üretim Tutarlılığı",
      score: tutarlilikScore,
      status: tutarlilikStatus,
      detail: tutarlilikDetail,
      action: { label: "Haftalık Paket oluştur", href: "/dashboard/compose/weekly" },
    },
    {
      key: "hesap",
      label: "Hesap Sağlığı",
      score: hesapScore,
      status: hesapStatus,
      detail: hesapDetail,
      action: { label: "Bağlantıları yeniden bağla", href: "/settings?tab=baglantilar" },
    },
  ];

  const total = factors.reduce((sum, f) => sum + f.score, 0);
  const weakest = factors.reduce((a, b) => (a.score <= b.score ? a : b));

  const diagnosis =
    total >= 850
      ? "Harika gidiyor! Tüm göstergeleriniz sağlıklı görünüyor."
      : `En büyük fırsat alanınız: ${weakest.label}. ${weakest.detail}`;

  return { total, factors, diagnosis, weakest };
}
