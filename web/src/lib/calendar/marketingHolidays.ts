export interface MarketingHoliday {
  id: string;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  day: number;
  name: string;
  tag: string;
  advice: string;
  flag: string;
  countryCode: "tr" | "us" | "eu" | "uk" | "global";
  year?: number; // Optional: If specified, only active in this year (for movable religious bayrams)
  category?: "national" | "religious" | "commercial" | "commemoration" | "special";
  suggestedAngles?: string[]; // Clickable 1-click creative hooks
}

export const COUNTRY_TIMEZONES: Record<string, string> = {
  tr: "Europe/Istanbul",
  us: "America/New_York",
  eu: "Europe/Berlin",
  uk: "Europe/London",
  global: "UTC",
};

export const MARKETING_HOLIDAYS: Record<string, MarketingHoliday[]> = {
  tr: [
    { id: "tr-yilbasi", month: 0, day: 1, name: "Yılbaşı", tag: "Resmi Tatil", advice: "Yeni yıl hedefleri, motivasyon ve özel kampanya içeriğinizi planlayın!", flag: "🇹🇷", countryCode: "tr", category: "special", suggestedAngles: ["Yeni Yıl Hedefleri", "Yılbaşı İndirimi", "Ekip Tebriği"] },
    { id: "tr-sevgililer", month: 1, day: 14, name: "Sevgililer Günü", tag: "E-Ticaret Zirvesi", advice: "Sevgililer gününe özel hediye rehberi, çift indirimleri ve duygu yüklü paylaşımlar zamanı!", flag: "❤️", countryCode: "tr", category: "commercial", suggestedAngles: ["Hediye Rehberi", "Çift İndirimi", "Aşk & Sevgi Hikayesi"] },
    { id: "tr-kadinlar", month: 2, day: 8, name: "Dünya Kadınlar Günü", tag: "Sosyal Farkındalık", advice: "İlham verici kadınlar ve ekibinizin kadın liderleri için özel paylaşım hazırlayın.", flag: "💐", countryCode: "tr", category: "special", suggestedAngles: ["İlham Veren Kadınlar", "Kadın Girişimciler", "Sosyal Farkındalık"] },
    
    // Ramazan Bayramı (Yıl Bazlı)
    { id: "tr-ramazan-2025", year: 2025, month: 2, day: 30, name: "Ramazan Bayramı", tag: "Dini Bayram", advice: "Tüm takipçilerinize sıcak bir bayram tebriği iletin, bayram indirimi ve teslimat duyurularınızı paylaşın.", flag: "🍬", countryCode: "tr", category: "religious", suggestedAngles: ["Bayram Tebriği", "Bayram İndirimi", "Kargo & Teslimat Duyurusu"] },
    { id: "tr-ramazan-2026", year: 2026, month: 2, day: 20, name: "Ramazan Bayramı", tag: "Dini Bayram", advice: "Tüm takipçilerinize sıcak bir bayram tebriği iletin, bayram indirimi ve teslimat duyurularınızı paylaşın.", flag: "🍬", countryCode: "tr", category: "religious", suggestedAngles: ["Bayram Tebriği", "Bayram İndirimi", "Kargo & Teslimat Duyurusu"] },
    { id: "tr-ramazan-2027", year: 2027, month: 2, day: 9, name: "Ramazan Bayramı", tag: "Dini Bayram", advice: "Tüm takipçilerinize sıcak bir bayram tebriği iletin, bayram indirimi ve teslimat duyurularınızı paylaşın.", flag: "🍬", countryCode: "tr", category: "religious", suggestedAngles: ["Bayram Tebriği", "Bayram İndirimi", "Kargo & Teslimat Duyurusu"] },
    { id: "tr-ramazan-2028", year: 2028, month: 1, day: 26, name: "Ramazan Bayramı", tag: "Dini Bayram", advice: "Tüm takipçilerinize sıcak bir bayram tebriği iletin, bayram indirimi ve teslimat duyurularınızı paylaşın.", flag: "🍬", countryCode: "tr", category: "religious", suggestedAngles: ["Bayram Tebriği", "Bayram İndirimi", "Kargo & Teslimat Duyurusu"] },

    { id: "tr-23nisan", month: 3, day: 23, name: "23 Nisan Ulusal Egemenlik ve Çocuk Bayramı", tag: "Milli Bayram", advice: "Geleceğimiz olan çocuklar ve bayram coşkusu için tebrik mesajınızı planlayın.", flag: "🇹🇷", countryCode: "tr", category: "national", suggestedAngles: ["Çocuk Bayramı Coşkusu", "Geleceğimiz Çocuklar", "Milli Bayram Tebriği"] },
    { id: "tr-1mayis", month: 4, day: 1, name: "1 Mayıs Emek ve Dayanışma Günü", tag: "Resmi Tatil", advice: "Üreten, değer katan çalışanlar ve iş gücünün bayramını saygıyla kutlayın.", flag: "🛠️", countryCode: "tr", category: "national", suggestedAngles: ["Emek ve Dayanışma", "Ekip Teşekkürü", "Üretim ve Değer"] },
    { id: "tr-anneler", month: 4, day: 10, name: "Anneler Günü", tag: "E-Ticaret Zirvesi", advice: "Yılın en yüksek dönüşümlü hediye ve teşekkür sezonu! İçeriklerinizi ve kampanyalarınızı erkenden hazırlayın.", flag: "🌸", countryCode: "tr", category: "commercial", suggestedAngles: ["Anneye En Güzel Hediye", "Duygusal Teşekkür", "Özel İndirim Paketi"] },
    { id: "tr-19mayis", month: 4, day: 19, name: "19 Mayıs Atatürk'ü Anma, Gençlik ve Spor Bayramı", tag: "Milli Bayram", advice: "Gençlik enerjisi, spor ve milli bayram tebriği için dinamik bir görsel seçin.", flag: "🇹🇷", countryCode: "tr", category: "national", suggestedAngles: ["Gençlik ve Spor Ruhu", "Geleceğe Güven", "Milli Tebrik"] },

    // Kurban Bayramı (Yıl Bazlı)
    { id: "tr-kurban-2025", year: 2025, month: 5, day: 6, name: "Kurban Bayramı", tag: "Dini Bayram", advice: "Huzurlu ve bereketli bayram tebriğinizi paylaşın; tatil dönemi destek ve kargo planınızı hatırlatın.", flag: "🐑", countryCode: "tr", category: "religious", suggestedAngles: ["Bayram Dayanışması", "Kurban Tebriği", "Tatil Çalışma Saatleri"] },
    { id: "tr-kurban-2026", year: 2026, month: 4, day: 27, name: "Kurban Bayramı", tag: "Dini Bayram", advice: "Huzurlu ve bereketli bayram tebriğinizi paylaşın; tatil dönemi destek ve kargo planınızı hatırlatın.", flag: "🐑", countryCode: "tr", category: "religious", suggestedAngles: ["Bayram Dayanışması", "Kurban Tebriği", "Tatil Çalışma Saatleri"] },
    { id: "tr-kurban-2027", year: 2027, month: 4, day: 16, name: "Kurban Bayramı", tag: "Dini Bayram", advice: "Huzurlu ve bereketli bayram tebriğinizi paylaşın; tatil dönemi destek ve kargo planınızı hatırlatın.", flag: "🐑", countryCode: "tr", category: "religious", suggestedAngles: ["Bayram Dayanışması", "Kurban Tebriği", "Tatil Çalışma Saatleri"] },
    { id: "tr-kurban-2028", year: 2028, month: 4, day: 5, name: "Kurban Bayramı", tag: "Dini Bayram", advice: "Huzurlu ve bereketli bayram tebriğinizi paylaşın; tatil dönemi destek ve kargo planınızı hatırlatın.", flag: "🐑", countryCode: "tr", category: "religious", suggestedAngles: ["Bayram Dayanışması", "Kurban Tebriği", "Tatil Çalışma Saatleri"] },

    { id: "tr-babalar", month: 5, day: 21, name: "Babalar Günü", tag: "Özel Gün", advice: "Babalar gününe özel duygusal hikaye ve hediye önerisi serisi kurgulayın.", flag: "👔", countryCode: "tr", category: "commercial", suggestedAngles: ["Babalar Günü Hediyesi", "Duygusal Hikaye", "Özel Kampanya"] },
    { id: "tr-15temmuz", month: 6, day: 15, name: "15 Temmuz Demokrasi ve Milli Birlik Günü", tag: "Resmi Anma", advice: "Milli birlik ve demokrasi mesajı içeren sade bir kurumsal paylaşım hazırlayın.", flag: "🇹🇷", countryCode: "tr", category: "commemoration", suggestedAngles: ["Milli Birlik Mesajı", "Demokrasi Anması", "Kurumsal Mesaj"] },
    { id: "tr-30agustos", month: 7, day: 30, name: "30 Ağustos Zafer Bayramı", tag: "Milli Bayram", advice: "Büyük zaferimizi ve bağımsızlık ruhunu kutlayan gurur verici bir tebrik gönderisi oluşturun.", flag: "🇹🇷", countryCode: "tr", category: "national", suggestedAngles: ["Büyük Zafer Coşkusu", "Bağımsızlık Ruhu", "Milli Kutlama"] },
    { id: "tr-29ekim", month: 9, day: 29, name: "29 Ekim Cumhuriyet Bayramı", tag: "Milli Bayram", advice: "Cumhuriyetimizin yıl dönümü için gurur verici bir video veya carousel tasarlayın.", flag: "🇹🇷", countryCode: "tr", category: "national", suggestedAngles: ["Cumhuriyet Coşkusu", "Gurur Dolu Miras", "Cumhuriyet İndirimi"] },
    { id: "tr-10kasim", month: 10, day: 10, name: "10 Kasım Atatürk'ü Anma Günü", tag: "Milli Anma", advice: "Gazi Mustafa Kemal Atatürk'ü saygı ve minnetle anma paylaşımı için siyah-beyaz sade görselinizi hazırlayın.", flag: "🖤", countryCode: "tr", category: "commemoration", suggestedAngles: ["Saygı ve Özlemle Anma", "Atatürk'ün İzinde", "Siyah-Beyaz Anma"] },
    { id: "tr-11-11", month: 10, day: 11, name: "11.11 Bekarlar Günü & Süper Alışveriş", tag: "E-Ticaret Festivali", advice: "Yılın en çılgın alışveriş günü! Sepet indirimi ve flaş fırsat içeriklerinizi yayınlayın.", flag: "🛍️", countryCode: "tr", category: "commercial", suggestedAngles: ["Yılın En Büyük İndirimi", "Flaş Fırsatlar", "Sepet Kampanyası"] },
    { id: "tr-ogretmenler", month: 10, day: 24, name: "Öğretmenler Günü", tag: "Özel Gün", advice: "Geleceği şekillendiren öğretmenlerimize ve eğitimin önemine teşekkür paylaşımı planlayın.", flag: "🎓", countryCode: "tr", category: "special", suggestedAngles: ["Öğretmene Teşekkür", "Eğitime Destek", "Hediye Fikirleri"] },
    { id: "tr-blackfriday", month: 10, day: 27, name: "Black Friday / Efsane Cuma", tag: "Süper İndirim", advice: "Yılın en büyük e-ticaret haftası! Erken indirim kancalarıyla kitleyi ısıtın ve aciliyet hissi oluşturun.", flag: "🔥", countryCode: "tr", category: "commercial", suggestedAngles: ["Erken VIP Erişim", "Yılın Fırsatı", "Sınırlı Stok & Geri Sayım"] },
    { id: "tr-cybermonday", month: 10, day: 30, name: "Siber Pazartesi / Cyber Monday", tag: "Online Fırsat", advice: "E-ticaret ve dijital ürünlerde son gün fırsatları ve uzatılan indirim kampanyası yürütün.", flag: "⚡", countryCode: "tr", category: "commercial", suggestedAngles: ["Son Şans İndirimi", "Online Fırsat", "Dijital Kampanya"] },
    { id: "tr-yilbasi-gecesi", month: 11, day: 31, name: "Yılbaşı Gecesi & Yıl Sonu", tag: "Kutlama", advice: "Yıllık başarı özetinizi, teşekkür mesajınızı ve yeni yıl dileklerinizi paylaşın.", flag: "✨", countryCode: "tr", category: "special", suggestedAngles: ["Yılın Özeti & Başarılar", "Teşekkür Mesajı", "Yeni Yıl Hediyeleri"] },
  ],
  us: [
    { id: "us-newyear", month: 0, day: 1, name: "New Year's Day", tag: "National Holiday", advice: "Kick off the year with fresh resolutions, product updates, and goal-setting content.", flag: "🇺🇸", countryCode: "us", category: "national" },
    { id: "us-superbowl", month: 1, day: 11, name: "Super Bowl Sunday", tag: "Cultural Event", advice: "Harness gameday excitement with engaging polls, party snacks, or watch-party banter.", flag: "🏈", countryCode: "us", category: "special" },
    { id: "us-valentines", month: 1, day: 14, name: "Valentine's Day", tag: "Retail Peak", advice: "Promote gift guides, bundles, and special limited-time romantic discounts.", flag: "❤️", countryCode: "us", category: "commercial" },
    { id: "us-memorial", month: 4, day: 27, name: "Memorial Day Weekend", tag: "US Holiday", advice: "Kick off summer sales with outdoor, travel, and seasonal promotion campaigns.", flag: "🇺🇸", countryCode: "us", category: "national" },
    { id: "us-july4", month: 6, day: 4, name: "Independence Day (4th of July)", tag: "National Holiday", advice: "Celebrate with red, white, and blue creative assets and patriotic holiday sales.", flag: "🎆", countryCode: "us", category: "national" },
    { id: "us-laborday", month: 8, day: 2, name: "Labor Day Weekend", tag: "Retail Season", advice: "Promote back-to-school essentials and end-of-summer clearance promotions.", flag: "🇺🇸", countryCode: "us", category: "commercial" },
    { id: "us-halloween", month: 9, day: 31, name: "Halloween", tag: "Cultural Holiday", advice: "Engage followers with spooky discounts, costume contests, and playful creative copies.", flag: "🎃", countryCode: "us", category: "special" },
    { id: "us-thanksgiving", month: 10, day: 28, name: "Thanksgiving Day", tag: "National Holiday", advice: "Express gratitude to your community and unveil early Black Friday VIP access.", flag: "🦃", countryCode: "us", category: "national" },
    { id: "us-blackfriday", month: 10, day: 29, name: "Black Friday", tag: "Peak Commerce", advice: "The largest shopping event of the year! Drive urgency with countdowns and limited doorbusters.", flag: "🔥", countryCode: "us", category: "commercial" },
    { id: "us-cybermonday", month: 11, day: 2, name: "Cyber Monday", tag: "Tech & E-Com", advice: "Online-exclusive deals, extended shipping promos, and digital bundle pushes.", flag: "⚡", countryCode: "us", category: "commercial" },
    { id: "us-christmas", month: 11, day: 25, name: "Christmas Day", tag: "Major Holiday", advice: "Holiday greetings, last-minute gift cards, and heartfelt year-end appreciations.", flag: "🎄", countryCode: "us", category: "special" },
  ],
  eu: [
    { id: "eu-newyear", month: 0, day: 1, name: "New Year", tag: "Seasonal Campaign", advice: "Launch European campaigns and post-holiday seasonal sales.", flag: "🇪🇺", countryCode: "eu", category: "special" },
    { id: "eu-easter", month: 3, day: 20, name: "Easter Sunday", tag: "Holiday Season", advice: "Spring promotion and festive family gift campaigns across Europe.", flag: "🐰", countryCode: "eu", category: "special" },
    { id: "eu-labour", month: 4, day: 1, name: "International Workers' Day", tag: "Campaign Day", advice: "Celebrate working professionals with productivity and teamwork spotlights.", flag: "🛠️", countryCode: "eu", category: "special" },
    { id: "eu-summer", month: 6, day: 15, name: "European Summer Sales Peak", tag: "Retail Season", advice: "Mid-year summer clearance and holiday travel marketing.", flag: "☀️", countryCode: "eu", category: "commercial" },
    { id: "eu-blackweek", month: 10, day: 27, name: "Black Friday Europe", tag: "Peak Sale", advice: "Pan-European cross-border shopping campaigns and localized currency offers.", flag: "🔥", countryCode: "eu", category: "commercial" },
    { id: "eu-christmas", month: 11, day: 25, name: "Christmas", tag: "Seasonal Campaign", advice: "Warm holiday wishes and European delivery countdowns.", flag: "🎄", countryCode: "eu", category: "special" },
  ],
  uk: [
    { id: "uk-newyear", month: 0, day: 1, name: "New Year's Day", tag: "Bank Holiday", advice: "Kick off January sales and British fitness/resolution promotions.", flag: "🇬🇧", countryCode: "uk", category: "national" },
    { id: "uk-mothersday", month: 2, day: 15, name: "Mothering Sunday (UK)", tag: "Retail Peak", advice: "UK Mother's Day occurs in March! Plan floral and gift collections early.", flag: "💐", countryCode: "uk", category: "commercial" },
    { id: "uk-easter", month: 3, day: 21, name: "Easter Monday", tag: "Bank Holiday", advice: "Four-day bank holiday weekend promotions and spring offers.", flag: "🐣", countryCode: "uk", category: "special" },
    { id: "uk-springbank", month: 4, day: 26, name: "Spring Bank Holiday", tag: "Bank Holiday", advice: "Long weekend specials, travel gear, and British barbecue promotions.", flag: "🇬🇧", countryCode: "uk", category: "special" },
    { id: "uk-summerbank", month: 7, day: 25, name: "Summer Bank Holiday", tag: "Bank Holiday", advice: "End of summer push before schools resume.", flag: "🇬🇧", countryCode: "uk", category: "special" },
    { id: "uk-blackfriday", month: 10, day: 28, name: "Black Friday UK", tag: "High Street & Online", advice: "UK consumer discount mania! Drive rapid click-throughs with early deals.", flag: "🔥", countryCode: "uk", category: "commercial" },
    { id: "uk-boxingday", month: 11, day: 26, name: "Boxing Day Sales", tag: "Retail Tradition", advice: "Historic UK shopping day for massive post-Christmas clearance discounts.", flag: "🛍️", countryCode: "uk", category: "commercial" },
  ],
  global: [
    { id: "global-womensday", month: 2, day: 8, name: "International Women's Day", tag: "Global Day", advice: "Celebrate female leaders and empower equality across all channels.", flag: "🌍", countryCode: "global", category: "special" },
    { id: "global-earthday", month: 3, day: 22, name: "Earth Day", tag: "Sustainability", advice: "Highlight green initiatives, eco-packaging, and sustainable brand practices.", flag: "🌱", countryCode: "global", category: "special" },
    { id: "global-socialmedia", month: 5, day: 30, name: "World Social Media Day", tag: "Digital Culture", advice: "Engage your followers directly, share behind-the-scenes community moments.", flag: "📱", countryCode: "global", category: "special" },
    { id: "global-mentalhealth", month: 9, day: 10, name: "World Mental Health Day", tag: "Wellbeing", advice: "Advocate for team wellness, work-life balance, and thoughtful brand empathy.", flag: "💚", countryCode: "global", category: "special" },
    { id: "global-yearend", month: 11, day: 31, name: "Global Year-End Wrap", tag: "Celebration", advice: "Publish your annual retrospective: milestones, customer highlights, and gratitude.", flag: "🎉", countryCode: "global", category: "special" },
  ],
};

function nthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return new Date(Date.UTC(year, month, 1 + (weekday - first + 7) % 7 + (nth - 1) * 7));
}

function lastWeekday(year: number, month: number, weekday: number): Date {
  const last = new Date(Date.UTC(year, month + 1, 0));
  return new Date(Date.UTC(year, month, last.getUTCDate() - (last.getUTCDay() - weekday + 7) % 7));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

// Gregorian Easter (Meeus/Jones/Butcher). All calculations use UTC calendar days.
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k + 7) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function movingHolidayDate(id: string, year: number): Date | null {
  const blackFriday = addDays(nthWeekday(year, 10, 4, 4), 1);
  switch (id) {
    case "tr-anneler": return nthWeekday(year, 4, 0, 2);
    case "tr-babalar": return nthWeekday(year, 5, 0, 3);
    case "tr-blackfriday":
    case "us-blackfriday":
    case "eu-blackweek":
    case "uk-blackfriday": return blackFriday;
    case "tr-cybermonday":
    case "us-cybermonday": return addDays(blackFriday, 3);
    case "us-superbowl": return nthWeekday(year, 1, 0, 2);
    case "us-memorial": return lastWeekday(year, 4, 1);
    case "us-laborday": return nthWeekday(year, 8, 1, 1);
    case "us-thanksgiving": return nthWeekday(year, 10, 4, 4);
    case "eu-easter": return easterSunday(year);
    case "uk-mothersday": return addDays(easterSunday(year), -21);
    case "uk-easter": return addDays(easterSunday(year), 1);
    case "uk-springbank": return lastWeekday(year, 4, 1);
    case "uk-summerbank": return lastWeekday(year, 7, 1);
    default: return null;
  }
}

export function getHolidaysForCountry(countryCode: string = "tr", year: number = new Date().getFullYear()): MarketingHoliday[] {
  const code = countryCode.toLowerCase();
  const holidays = MARKETING_HOLIDAYS[code] || MARKETING_HOLIDAYS.tr;
  return holidays.filter((holiday) => holiday.year === undefined || holiday.year === year).map((holiday) => {
    const date = movingHolidayDate(holiday.id, year);
    return date
      ? { ...holiday, year, month: date.getUTCMonth(), day: date.getUTCDate() }
      : { ...holiday, year };
  }).sort((a, b) => a.month - b.month || a.day - b.day);
}

export function isHolidayOnDate(
  holiday: MarketingHoliday,
  date: Date | { year: number; month: number; day: number }
): boolean {
  const y = date instanceof Date ? date.getFullYear() : date.year;
  const m = date instanceof Date ? date.getMonth() : date.month;
  const d = date instanceof Date ? date.getDate() : date.day;

  if (holiday.year !== undefined && holiday.year !== y) {
    return false;
  }
  return holiday.month === m && holiday.day === d;
}

export function getHolidaysForDate(
  date: Date | { year: number; month: number; day: number },
  countryCode: string = "tr"
): MarketingHoliday[] {
  const year = date instanceof Date ? date.getFullYear() : date.year;
  const list = getHolidaysForCountry(countryCode, year);
  return list.filter((h) => isHolidayOnDate(h, date));
}

export function getMonthHolidays(
  year: number,
  month: number,
  countryCode: string = "tr"
): MarketingHoliday[] {
  const list = getHolidaysForCountry(countryCode, year);
  return list
    .filter((h) => {
      if (h.year !== undefined && h.year !== year) return false;
      return h.month === month;
    })
    .sort((a, b) => a.day - b.day);
}

export function getUpcomingHolidayForCountry(countryCode: string = "tr", now: Date = new Date()): MarketingHoliday | null {
  const timezone = COUNTRY_TIMEZONES[countryCode.toLowerCase()] || "UTC";
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const today = Date.UTC(value("year"), value("month") - 1, value("day"));
  const year = value("year");
  const upcoming = [
    ...getHolidaysForCountry(countryCode, year),
    ...getHolidaysForCountry(countryCode, year + 1),
  ];
  return upcoming.find((holiday) => {
    const date = Date.UTC(holiday.year!, holiday.month, holiday.day);
    return date >= today && date - today <= 14 * 86_400_000;
  }) ?? null;
}
