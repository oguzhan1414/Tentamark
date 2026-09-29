export type CardFormat = "square" | "story";

export type TrendCardProps = {
  statNumber: string; // e.g. "%40" or "3.2x" — caller formats it, we just display it
  statLabel: string;
  trendPoints: number[]; // at least 2 points, any scale — normalized internally
  brandName: string;
  logoUrl?: string | null;
  accentColor?: string;
  format: CardFormat;
};

const DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export function trendCardDimensions(format: CardFormat) {
  return DIMENSIONS[format];
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function resolveAccent(accentColor?: string): string {
  return accentColor && /^#[0-9a-fA-F]{6}$/.test(accentColor) ? accentColor : "#FA5252";
}

// Plain SVG polyline, no charting library — this is one decorative line on
// a static image, pulling in Chart.js/Recharts for that would be a lot of
// weight for very little. See dataviz skill guidance: area fill, faint
// grid, emphasized endpoint — a sparkline deserves the same care as type.
export function buildSparkline(points: number[], width: number, height: number) {
  if (points.length < 2) throw new Error("trendPoints en az 2 nokta içermeli.");
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * height;
    return [x, y] as const;
  });
  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const endpoint = coords[coords.length - 1];
  return { linePath, areaPath, endpoint };
}
