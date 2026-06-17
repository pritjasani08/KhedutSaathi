import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import LivePrices from './LivePrices/LivePrices';
import SellYield from './SellYield/SellYield';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MarketHub() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('livePrices');

  const tabs = [
    { key: 'livePrices', label: t('marketHub.livePrices'), icon: TrendingUp },
    { key: 'sellYield', label: t('marketHub.sellYield'), icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/60 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            <TrendingUp className="w-4 h-4" /> Market Intelligence
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t('marketHub.title')}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            {t('marketHub.subtitle')}
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-card">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-green'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'livePrices' ? <LivePrices /> : <SellYield />}
      </div>
    </div>
  );
}
