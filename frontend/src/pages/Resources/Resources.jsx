import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Landmark } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import NewsCard from '../../components/shared/NewsCard';
import SchemeCard from '../../components/shared/SchemeCard';

const MOCK_NEWS = [
  {
    id: 1,
    title: 'Monsoon Advances Over Central India: IMD Forecast',
    date: '15 June 2026',
    category: 'Weather',
    excerpt: 'Favorable conditions for further advance of southwest monsoon into more parts of Gujarat, Madhya Pradesh and Chhattisgarh over the next 48 hours.',
  },
  {
    id: 2,
    title: 'New MSP Announced for Kharif Crops 2026-27',
    date: '12 June 2026',
    category: 'Market',
    excerpt: 'The Cabinet Committee on Economic Affairs has approved the increase in the Minimum Support Prices for all mandated Kharif Crops.',
  },
  {
    id: 3,
    title: 'Breakthrough in Fall Armyworm Control Methods',
    date: '10 June 2026',
    category: 'Research',
    excerpt: 'Agricultural scientists have developed a new bio-pesticide combination that shows 95% efficacy against the devastating Fall Armyworm.',
  },
  {
    id: 4,
    title: 'Export Ban Lifted on Non-Basmati White Rice',
    date: '08 June 2026',
    category: 'Policy',
    excerpt: 'Government eases export restrictions on certain varieties of rice following robust buffer stocks and good domestic production estimates.',
  },
  {
    id: 5,
    title: 'Subsidies Expanded for Drip Irrigation Setup',
    date: '05 June 2026',
    category: 'Subsidies',
    excerpt: 'To promote water conservation, the agriculture ministry announces an additional 15% subsidy for small and marginal farmers adopting micro-irrigation.',
  },
  {
    id: 6,
    title: 'Record Wheat Procurement in Rabi Season',
    date: '01 June 2026',
    category: 'Market',
    excerpt: 'FCI reports highest ever wheat procurement driven by seamless digital operations and direct bank transfers to farmers.',
  }
];

const MOCK_SCHEMES = [
  {
    id: 1,
    title: 'PM-KISAN Samman Nidhi',
    deadline: 'Ongoing',
    category: 'Income Support',
    description: 'Financial benefit of Rs. 6000/- per year in three equal installments to all land holding eligible farmer families.',
    eligibility: ['Small & Marginal Farmers', 'Valid Aadhaar', 'Land Ownership Records'],
    benefit: '₹6,000 / year'
  },
  {
    id: 2,
    title: 'Pradhan Mantri Fasal Bima Yojana',
    deadline: '31 July 2026',
    category: 'Insurance',
    description: 'Comprehensive crop insurance coverage against non-preventable natural risks from pre-sowing to post-harvest.',
    eligibility: ['All farmers growing notified crops', 'Loanee & Non-Loanee'],
    benefit: 'Crop Loss Coverage'
  },
  {
    id: 3,
    title: 'PM KUSUM Scheme',
    deadline: '30 Sept 2026',
    category: 'Solar Energy',
    description: 'Installation of solar pumps and grid connected solar power plants by farmers.',
    eligibility: ['Individual farmers', 'Cooperatives', 'Panchayats'],
    benefit: '60% Subsidy on Solar Pumps'
  },
  {
    id: 4,
    title: 'Agriculture Infrastructure Fund',
    deadline: 'Ongoing',
    category: 'Infrastructure',
    description: 'Medium - long term debt financing facility for investment in viable projects for post-harvest management Infrastructure.',
    eligibility: ['Agri-entrepreneurs', 'Startups', 'FPOs', 'PACS'],
    benefit: '3% Interest Subvention'
  },
  {
    id: 5,
    title: 'Paramparagat Krishi Vikas Yojana',
    deadline: '31 Aug 2026',
    category: 'Organic Farming',
    description: 'Promotion of commercial organic production through certified organic farming.',
    eligibility: ['Groups of 50+ farmers', 'Minimum 50 acres land cluster'],
    benefit: '₹50,000 / hectare / 3 years'
  },
  {
    id: 6,
    title: 'Soil Health Card Scheme',
    deadline: 'Ongoing',
    category: 'Soil Health',
    description: 'Provides information to farmers on nutrient status of their soil along with recommendation on appropriate dosage of nutrients.',
    eligibility: ['All farmers'],
    benefit: 'Free Soil Testing & Report'
  }
];

export default function Resources() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('news');

  const tabs = [
    { key: 'news', label: 'Latest News', icon: Newspaper },
    { key: 'schemes', label: 'Government Schemes', icon: Landmark },
  ];

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 pb-16">
      <PageHero 
        title="News & Schemes"
        subtitle="Stay updated with the latest agricultural news and government schemes to empower your farming journey."
        icon="📰"
      />

      <div className="container-custom px-4 sm:px-6 lg:px-8 mt-[-2rem] relative z-10">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-12"
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
        <AnimatePresence mode="wait">
          {activeTab === 'news' ? (
            <motion.div
              key="news"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {MOCK_NEWS.map((news, idx) => (
                <NewsCard key={news.id} {...news} index={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="schemes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {MOCK_SCHEMES.map((scheme, idx) => (
                <SchemeCard key={scheme.id} {...scheme} index={idx} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
