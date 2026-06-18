import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain, Sprout, BarChart3 } from 'lucide-react';
import SmartCropPlanner from './SmartCropPlanner/SmartCropPlanner';
import YieldPredictor from './YieldPredictor/YieldPredictor';

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
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100/60 text-violet-600 text-sm font-semibold mb-4">
            <Brain className="w-4 h-4" /> AI Analytics Dashboard
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
            {t('expertPanel.title')}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-500 text-lg max-w-2xl mx-auto">
            {t('expertPanel.subtitle')}
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
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
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'planner' ? <SmartCropPlanner /> : <YieldPredictor />}
      </div>
    </div>
  );
}
