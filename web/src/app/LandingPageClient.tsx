"use client";

import { useLanguage } from "@/context/LanguageContext";
import AdShowcaseSection from "@/components/AdShowcaseSection";
import AnalyticsTeaser from "@/components/AnalyticsTeaser";
import ConnectStrip from "@/components/ConnectStrip";
import FaqSection from "@/components/FaqSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import HeroSpotlight from "@/components/HeroSpotlight";
import FinalCta from "@/components/FinalCta";
import LoopSection from "@/components/LoopSection";
import PositioningStrip from "@/components/PositioningStrip";
import ProductShowcase from "@/components/ProductShowcase";
import ScrollRefresher from "@/components/ScrollRefresher";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import UseCasesSection from "@/components/UseCasesSection";
import WhoUsesSection from "@/components/WhoUsesSection";
import InteractiveDemoWidget from "@/components/InteractiveDemoWidget";
import WhyUsInteractiveSection from "@/components/WhyUsInteractiveSection";

export default function LandingPageClient() {
  const { locale } = useLanguage();

  return (
    <div className="flex flex-1 flex-col bg-bg text-ink">
      <ScrollRefresher key={`refresher-${locale}`} />
      <SiteHeader />
      <main key={`main-${locale}`} className="flex-1 overflow-x-clip">
        <HeroSpotlight />
        <AdShowcaseSection />
        <InteractiveDemoWidget />
        <ConnectStrip />
        <WhyUsInteractiveSection />
        <ProductShowcase />
        <LoopSection />
        <UseCasesSection />
        <WhoUsesSection />
        <FeaturesGrid />
        <AnalyticsTeaser />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
