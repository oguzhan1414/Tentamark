import { trMarketing } from "./dictionaries/tr/marketing";
import { trDashboard } from "./dictionaries/tr/dashboard";
import { trPages } from "./dictionaries/tr/pages";
import { trPlatformSummaries } from "./dictionaries/tr/platforms";
import { trPricing } from "./dictionaries/tr/pricing";
import { enMarketing } from "./dictionaries/en/marketing";
import { enDashboard } from "./dictionaries/en/dashboard";
import { enPages } from "./dictionaries/en/pages";
import { enPlatformSummaries } from "./dictionaries/en/platforms";
import { enPricing } from "./dictionaries/en/pricing";

export type Locale = "tr" | "en";

export const translations = {
  tr: {
    ...trMarketing,
    dashboard: trDashboard,
    pages: trPages,
    platformSummaries: trPlatformSummaries,
    pricingText: trPricing,
  },
  en: {
    ...enMarketing,
    dashboard: enDashboard,
    pages: enPages,
    platformSummaries: enPlatformSummaries,
    pricingText: enPricing,
  },
} as const;

export type Translations = (typeof translations)[Locale];
