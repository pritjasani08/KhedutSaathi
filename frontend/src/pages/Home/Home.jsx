import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import CropHealthSection from './CropHealthSection';
import MarketPricesSection from './MarketPricesSection';
import NewsAndSchemesSection from './NewsAndSchemesSection';
import AIAssistantSection from './AIAssistantSection';

export default function Home() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <BenefitsSection />
      <CropHealthSection />
      <MarketPricesSection />
      <NewsAndSchemesSection />
      <AIAssistantSection />
    </div>
  );
}
