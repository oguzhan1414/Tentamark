import AnalyticsTeaser from "@/components/AnalyticsTeaser";
import ConnectStrip from "@/components/ConnectStrip";
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

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[#0a0a0b] text-white">
      <ScrollRefresher />
      <SiteHeader />
      <main className="flex-1 overflow-x-clip">
        <HeroSpotlight />
        <ConnectStrip />
        <PositioningStrip />
        <ProductShowcase />
        <LoopSection />
        <PlatformsSection />
        <FeaturesGrid />
        <AnalyticsTeaser />
        <PricingTeaser />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
