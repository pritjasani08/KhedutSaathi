import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sprout, BarChart3 } from 'lucide-react';
import SmartCropPlanner from './SmartCropPlanner/SmartCropPlanner';
import YieldPredictor from './YieldPredictor/YieldPredictor';
import PageHero from '../../components/shared/PageHero';

export default function ExpertPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('planner');

  // Lifted state to preserve context between tools
  const [sharedForm, setSharedForm] = useState({
    state: '',
    district: '',
    season: '',
    cropType: '', // Populated by Crop Planner when switching to Yield Predictor
  });

  const tabs = [
    { key: 'planner', label: t('expertPanel.smartCropPlanner') || 'Smart Crop Planner', icon: Sprout },
    { key: 'predictor', label: t('expertPanel.yieldPredictor') || 'Yield Predictor', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <PageHero
          title={t('expertPanel.title') || 'Crop Planner'}
          subtitle="AI powered crop planning and yield intelligence."
        >
          {/* Professional Workspace Switcher */}
          <div className="inline-flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-800 relative z-10 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 relative ${
                  activeTab === tab.key
                    ? 'text-primary shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <tab.icon className={`w-4 h-4 relative z-10 ${activeTab === tab.key ? 'text-primary' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </PageHero>

        <div className="mt-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'planner' ? (
              <SmartCropPlanner
                sharedForm={sharedForm}
                setSharedForm={setSharedForm}
                switchToYieldPredictor={(crop) => {
                  setSharedForm(prev => ({ ...prev, cropType: crop }));
                  setActiveTab('predictor');
                }}
              />
            ) : (
              <YieldPredictor
                sharedForm={sharedForm}
                setSharedForm={setSharedForm}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
