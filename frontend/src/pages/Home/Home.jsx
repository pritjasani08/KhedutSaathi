import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import CropHealthSection from './CropHealthSection';
import CropPlanningSection from './CropPlanningSection';
import MarketPricesSection from './MarketPricesSection';
import NewsAndSchemesSection from './NewsAndSchemesSection';
import AIAssistantSection from './AIAssistantSection';

export default function Home() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <BenefitsSection />
      <CropHealthSection />
      <CropPlanningSection />
      <MarketPricesSection />
      <NewsAndSchemesSection />
      <AIAssistantSection />
    </div>
  );
}
