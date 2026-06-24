import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, Landmark, Loader2, AlertCircle, Globe, MapPin, Calculator, ChevronDown, Search, Filter, Bookmark } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PageHero from '../../components/shared/PageHero';
import NewsCard from '../../components/shared/NewsCard';
import SchemeCard from '../../components/shared/SchemeCard';
import SkeletonCard from '../../components/shared/SkeletonCard';
import SchemeEligibilityEngine from './SchemeEligibilityEngine';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { useBookmarks } from '../../hooks/useBookmarks';

const CustomDropdown = ({ value, onChange, options, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || { label: 'Select' };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl shadow-card focus:outline-none cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
      >
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
          {selectedOption.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 min-w-full w-max max-h-60 overflow-y-auto hide-scrollbar bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg z-50"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-200 flex items-center ${
                  value === opt.value
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary font-medium'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Resources() {
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'news');
  
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // News State
  const [language, setLanguage] = useState('gu');
  const [region, setRegion] = useState('Gujarat');
  const [crop, setCrop] = useState('');

  // Schemes State
  const [schemeSearch, setSchemeSearch] = useState('');
  const [schemeState, setSchemeState] = useState('');
  const [schemeCategory, setSchemeCategory] = useState('');
  const [schemeLevel, setSchemeLevel] = useState('');
  const [schemePage, setSchemePage] = useState(1);

  // Fetch user profile defaults
  useEffect(() => {
    if (user && user.user_type === 'farmer') {
      const token = localStorage.getItem('token');
      apiClient.get('/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          const data = res.data;
          if (data.profile) {
            if (data.profile.preferred_language === 'Hindi') setLanguage('hi');
            else if (data.profile.preferred_language === 'English') setLanguage('en');
            else setLanguage('gu');
            
            if (data.profile.state) {
              setRegion(data.profile.state);
              setSchemeState(data.profile.state);
            }
            if (data.profile.primary_crop) setCrop(data.profile.primary_crop);
          }
        })
        .catch(e => console.error("Error fetching profile for resources", e));
    }
  }, [user]);

  // React Query for News
  const { data: newsData, isLoading: newsLoading, isError: newsError } = useQuery({
    queryKey: ['agri-news', language, region, crop],
    queryFn: async () => {
      const res = await apiClient.get('/resources/agri-news', {
        params: { language, region, crop }
      });
      if (res.data.success === false) throw new Error('Failed to fetch news');
      return res.data.data;
    },
    enabled: activeTab === 'news',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query for Schemes
  const { data: schemesResponse, isLoading: schemesLoading, isError: schemesError } = useQuery({
    queryKey: ['schemes', schemePage, schemeSearch, schemeState, schemeCategory, schemeLevel],
    queryFn: async () => {
      const res = await apiClient.get('/resources/schemes', {
        params: { 
          page: schemePage, 
          limit: 10, 
          search: schemeSearch, 
          state: schemeState,
          category: schemeCategory,
          level: schemeLevel
        }
      });
      if (res.data.success === false) throw new Error('Failed to fetch schemes');
      return res.data;
    },
    enabled: activeTab === 'schemes',
    keepPreviousData: true,
  });

  const { data: bookmarksData, isLoading: bookmarksLoading } = useBookmarks();

  const schemes = schemesResponse?.data || [];
  const pagination = schemesResponse?.pagination || { page: 1, totalPages: 1 };

  const tabs = [
    { key: 'news', label: 'Latest News', icon: Newspaper },
    { key: 'schemes', label: 'Government Schemes', icon: Landmark },
    { key: 'bookmarks', label: 'Saved Schemes', icon: Bookmark },
    { key: 'eligibility', label: 'Eligibility Engine', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <PageHero
          title="Agricultural Resources"
          subtitle="Stay updated with the latest agricultural news and dynamic government schemes to empower your farming journey."
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
        </PageHero>

        <div className="mt-12">
        {/* News Filters */}
        {activeTab === 'news' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-4 mb-10 notranslate"
          >
            <CustomDropdown
              icon={Globe}
              value={language}
              onChange={setLanguage}
              options={[
                { value: 'gu', label: 'Gujarati' },
                { value: 'hi', label: 'Hindi' },
                { value: 'en', label: 'English' }
              ]}
            />
            <CustomDropdown
              icon={MapPin}
              value={region}
              onChange={setRegion}
              options={[
                { value: 'Gujarat', label: 'Gujarat' },
                { value: 'Maharashtra', label: 'Maharashtra' },
                { value: 'Punjab', label: 'Punjab' },
                { value: 'All India', label: 'All India' }
              ]}
            />
          </motion.div>
        )}

        {/* Schemes Filters */}
        {activeTab === 'schemes' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-surface p-4 rounded-2xl shadow-card"
          >
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder="Search schemes..." 
                value={schemeSearch}
                onChange={(e) => { setSchemeSearch(e.target.value); setSchemePage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-primary/50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <CustomDropdown
                icon={MapPin}
                value={schemeState}
                onChange={(v) => { setSchemeState(v); setSchemePage(1); }}
                options={[
                  { value: '', label: 'All States' },
                  { value: 'All India', label: 'All India (Central)' },
                  { value: 'Gujarat', label: 'Gujarat' },
                  { value: 'Maharashtra', label: 'Maharashtra' }
                ]}
              />
              <CustomDropdown
                icon={Filter}
                value={schemeCategory}
                onChange={(v) => { setSchemeCategory(v); setSchemePage(1); }}
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'Agriculture', label: 'Agriculture' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'Irrigation', label: 'Irrigation' }
                ]}
              />
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'news' ? (
            <motion.div
              key="news"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="notranslate"
            >
              {newsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} index={i} />)}
                </div>
              ) : newsError ? (
                <div className="text-center py-12 text-slate-500">Failed to load news</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {newsData && newsData.length > 0 ? (
                    newsData.map((item, idx) => (
                      <NewsCard key={item.id || idx} {...item} index={idx} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-slate-500">No news available</div>
                  )}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'schemes' ? (
            <motion.div
              key="schemes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {schemesLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} index={i} />)}
                </div>
              ) : schemesError ? (
                <div className="text-center py-12 text-slate-500">Failed to load schemes</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {schemes.length > 0 ? (
                      schemes.map((scheme, idx) => (
                        <SchemeCard 
                          key={scheme.id || idx} 
                          id={scheme.id}
                          title={scheme.name}
                          description={scheme.description}
                          slug={scheme.slug}
                          eligibility={scheme.beneficiary_keywords}
                          applyLink={scheme.official_url}
                          index={idx} 
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-slate-500">No schemes found matching criteria.</div>
                    )}
                  </div>
                  
                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <button 
                        disabled={pagination.page === 1}
                        onClick={() => setSchemePage(p => Math.max(1, p - 1))}
                        className="btn-secondary px-4 py-2 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button 
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => setSchemePage(p => p + 1)}
                        className="btn-secondary px-4 py-2 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : activeTab === 'bookmarks' ? (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {bookmarksLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {[1, 2].map((i) => <SkeletonCard key={i} index={i} />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {bookmarksData && bookmarksData.length > 0 ? (
                      bookmarksData.map((scheme, idx) => (
                        <SchemeCard 
                          key={scheme.id || idx}
                          id={scheme.id}
                          title={scheme.name}
                          description={scheme.description}
                          slug={scheme.slug}
                          eligibility={scheme.beneficiary_keywords}
                          applyLink={scheme.official_url}
                          index={idx} 
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">You haven't saved any schemes yet.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ) : activeTab === 'eligibility' ? (
            <motion.div
              key="eligibility"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SchemeEligibilityEngine />
            </motion.div>
          ) : null}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
