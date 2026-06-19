import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Landmark, Loader2, AlertCircle } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import NewsCard from '../../components/shared/NewsCard';
import SchemeCard from '../../components/shared/SchemeCard';

export default function Resources() {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [newsRes, schemesRes] = await Promise.all([
          fetch('http://localhost:5000/api/resources/agri-news'),
          fetch('http://localhost:5000/api/resources/schemes')
        ]);

        if (!newsRes.ok || !schemesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const newsData = await newsRes.json();
        const schemesData = await schemesRes.json();

        setNews(newsData.data || []);
        setSchemes(schemesData.data || []);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { key: 'news', label: 'Latest News', icon: Newspaper },
    { key: 'schemes', label: 'Government Schemes', icon: Landmark },
  ];

  return (
    <div className="min-h-screen pt-20 bg-background transition-colors duration-300 pb-16">
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
          <div className="inline-flex bg-surface rounded-2xl p-1.5 shadow-card overflow-x-auto max-w-full hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
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

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Fetching real-time updates...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-heading mb-2">Oops! Something went wrong</h3>
            <p className="text-slate-500 max-w-md">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {!loading && !error && (
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
                {news.length > 0 ? (
                  news.map((item, idx) => (
                    <NewsCard key={item.id || idx} {...item} index={idx} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    No recent news found. Check back later.
                  </div>
                )}
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
                {schemes.length > 0 ? (
                  schemes.map((scheme, idx) => (
                    <SchemeCard key={scheme.id || idx} {...scheme} index={idx} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    No schemes available at the moment.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
