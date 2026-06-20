import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain, Sprout, BarChart3 } from 'lucide-react';
import SmartCropPlanner from './SmartCropPlanner/SmartCropPlanner';
import YieldPredictor from './YieldPredictor/YieldPredictor';
import PageHero from '../../components/shared/PageHero';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ExpertPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('planner');

  const tabs = [
    { key: 'planner', label: t('expertPanel.smartCropPlanner'), icon: Sprout },
    { key: 'predictor', label: t('expertPanel.yieldPredictor'), icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <PageHero
          title={t('expertPanel.title')}
          subtitle={t('expertPanel.subtitle')}
        >
        <div className="inline-flex bg-surface rounded-2xl p-1.5 shadow-card">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-green'
                  : 'text-slate-600 hover:bg-surface-muted'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        </PageHero>

        <div className="mt-12">

        {/* Tab Content */}
        {activeTab === 'planner' ? <SmartCropPlanner /> : <YieldPredictor />}
        </div>
      </div>
    </div>
  );
}
