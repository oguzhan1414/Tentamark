const months: Record<string, number> = {
  Ocak: 1, Şubat: 2, Mart: 3, Nisan: 4, Mayıs: 5, Haziran: 6,
  Temmuz: 7, Ağustos: 8, Eylül: 9, Ekim: 10, Kasım: 11, Aralık: 12,
};

export function publishedAtIso(value: string): string | undefined {
  const match = value.match(/^(\d{1,2})\s+(\S+)\s+(\d{4})$/u);
  if (!match || !months[match[2]]) return undefined;
  const day = Number(match[1]);
  const month = months[match[2]];
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return undefined;
  return date.toISOString();
}
