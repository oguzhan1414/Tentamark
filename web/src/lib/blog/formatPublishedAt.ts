import type { Locale } from "@/lib/i18n/translations";

const MONTHS: Record<string, string> = {
  Ocak: "January", Şubat: "February", Mart: "March", Nisan: "April",
  Mayıs: "May", Haziran: "June", Temmuz: "July", Ağustos: "August",
  Eylül: "September", Ekim: "October", Kasım: "November", Aralık: "December",
};

export function formatPublishedAt(value: string, locale: Locale): string {
  if (locale === "tr") return value;
  const match = value.match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/u);
  if (!match) return value;
  const month = MONTHS[match[2]];
  return month ? `${month} ${match[1]}, ${match[3]}` : value;
}
