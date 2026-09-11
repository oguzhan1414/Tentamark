import AdShowcaseSection from "@/components/AdShowcaseSection";
import AnalyticsTeaser from "@/components/AnalyticsTeaser";
import ConnectStrip from "@/components/ConnectStrip";
import FaqSection from "@/components/FaqSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import HeroSpotlight from "@/components/HeroSpotlight";
import FinalCta from "@/components/FinalCta";
import LoopSection from "@/components/LoopSection";
import PlatformsSection from "@/components/PlatformsSection";
import PositioningStrip from "@/components/PositioningStrip";
import PricingTeaser from "@/components/PricingTeaser";
import ProductShowcase from "@/components/ProductShowcase";
import ScrollRefresher from "@/components/ScrollRefresher";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import UseCasesSection from "@/components/UseCasesSection";
import WhoUsesSection from "@/components/WhoUsesSection";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-bg text-ink">
      <ScrollRefresher />
      <SiteHeader />
      <main className="flex-1 overflow-x-clip">
        <HeroSpotlight />
        <AdShowcaseSection />
        <ConnectStrip />
        <PositioningStrip />
        <ProductShowcase />
        <LoopSection />
        <PlatformsSection />
        <UseCasesSection />
        <WhoUsesSection />
        <FeaturesGrid />
        <AnalyticsTeaser />
        <PricingTeaser />
        <FaqSection />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
