import HeroSection from './HeroSection';
import FarmerProblemsSection from './FarmerProblemsSection';
import AIFarmingWorkflowSection from './AIFarmingWorkflowSection';
import YieldPredictionShowcase from './YieldPredictionShowcase';
import CropHealthSection from './CropHealthSection';
import MarketPricesSection from './MarketPricesSection';
import MarketplaceShowcase from './MarketplaceShowcase';
import NewsAndSchemesSection from './NewsAndSchemesSection';
import WhyFarmersNeedUsSection from './WhyFarmersNeedUsSection';
import FinalCTASection from './FinalCTASection';

export default function Home() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <FarmerProblemsSection />
      <AIFarmingWorkflowSection />
      <YieldPredictionShowcase />
      <CropHealthSection />
      <MarketPricesSection />
      <MarketplaceShowcase />
      <NewsAndSchemesSection />
      <WhyFarmersNeedUsSection />
      <FinalCTASection />
    </div>
  );
}
