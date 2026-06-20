import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import LivePrices from './LivePrices/LivePrices';
import SellYield from './SellYield/SellYield';
import PageHero from '../../components/shared/PageHero';

import { useAuth } from '../../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function MarketHub() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('livePrices');

  const tabs = [
    { key: 'livePrices', label: t('marketHub.livePrices'), icon: TrendingUp },
  ];
  
  if (user && user.user_type === 'farmer') {
    tabs.push({ key: 'sellYield', label: t('marketHub.sellYield'), icon: ShoppingBag });
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <PageHero
          title={t('marketHub.title')}
          subtitle={t('marketHub.subtitle')}
        >
        <div className="inline-flex bg-surface rounded-2xl p-1.5 shadow-card">
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
        </PageHero>

        <div className="mt-12">

        {/* Tab Content */}
        {activeTab === 'livePrices' ? <LivePrices /> : <SellYield />}
        </div>
      </div>
    </div>
  );
}
