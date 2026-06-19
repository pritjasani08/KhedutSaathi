import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Landmark, Loader2, AlertCircle, Globe, MapPin } from 'lucide-react';
import PageHero from '../../components/shared/PageHero';
import NewsCard from '../../components/shared/NewsCard';
import SchemeCard from '../../components/shared/SchemeCard';

export default function Resources() {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [schemes, setSchemes] = useState([]);
  
  const [newsLoading, setNewsLoading] = useState(true);
  const [schemesLoading, setSchemesLoading] = useState(true);
  
  const [newsError, setNewsError] = useState(false);
  const [schemesError, setSchemesError] = useState(false);

  const [language, setLanguage] = useState('gu');
  const [region, setRegion] = useState('Gujarat');

  // Fetch Schemes once on mount
  useEffect(() => {
    const fetchSchemes = async () => {
      setSchemesLoading(true);
      try {
        const schemesRes = await fetch('http://localhost:5000/api/resources/schemes');
        if (schemesRes.ok) {
          const schemesData = await schemesRes.json();
          setSchemes(schemesData.data || []);
          setSchemesError(false);
        } else {
          setSchemes([]);
          setSchemesError(true);
        }
      } catch (err) {
        console.error('Error fetching schemes:', err);
        setSchemes([]);
        setSchemesError(true);
      } finally {
        setSchemesLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  // Fetch News when language or region changes
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      try {
        const url = `http://localhost:5000/api/resources/agri-news?language=${language}&region=${encodeURIComponent(region)}`;
        const newsRes = await fetch(url);
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          setNews(newsData.data || []);
          setNewsError(false);
        } else {
          setNews([]);
          setNewsError(true);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setNews([]);
        setNewsError(true);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, [language, region]);

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
          className="flex justify-center mb-6"
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

        {/* News Filters */}
        {activeTab === 'news' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl shadow-card">
              <Globe className="w-4 h-4 text-primary" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="gu">Gujarati</option>
                <option value="hi">Hindi</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl shadow-card">
              <MapPin className="w-4 h-4 text-primary" />
              <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="All India">All India</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Global Error State (Both failed) */}
        {!newsLoading && !schemesLoading && newsError && schemesError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-heading mb-2">Oops! Something went wrong</h3>
            <p className="text-slate-500 max-w-md">Resources temporarily unavailable. Please try again later.</p>
          </div>
        )}

        {/* Tab Content */}
        {!(newsError && schemesError) && (
          <AnimatePresence mode="wait">
            {activeTab === 'news' ? (
              <motion.div
                key="news"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {newsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Fetching real-time news...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news && news.length > 0 ? (
                      news.map((item, idx) => (
                        <NewsCard key={item.id || idx} {...item} index={idx} />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-slate-500">
                        News temporarily unavailable
                      </div>
                    )}
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
              >
                {schemesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Loading government schemes...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {schemes && schemes.length > 0 ? (
                      schemes.map((scheme, idx) => (
                        <SchemeCard key={scheme.id || idx} {...scheme} index={idx} />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-slate-500">
                        No schemes available at the moment.
                      </div>
                    )}
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
