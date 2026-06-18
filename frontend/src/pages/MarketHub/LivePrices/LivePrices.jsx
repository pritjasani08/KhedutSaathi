import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUpRight, ArrowDownRight, Minus, AlertCircle, Loader2 } from 'lucide-react';
import { mandiAPI } from '../../../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function LivePrices() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({ state: '', district: '', mandi: '', crop: '' });
  
  // Dynamic API lists
  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [mandisList, setMandisList] = useState([]);
  const [cropsList, setCropsList] = useState([]);
  const [pricesList, setPricesList] = useState([]);

  // UX states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data (states, crops, and default prices) on mount
  useEffect(() => {
    let active = true;

    async function fetchInitialData() {
      setLoading(true);
      setError(null);
      try {
        const [statesData, cropsData, pricesData] = await Promise.all([
          mandiAPI.getStates(),
          mandiAPI.getCrops(),
          mandiAPI.getPrices()
        ]);
        if (active) {
          setStatesList(statesData);
          setCropsList(cropsData);
          setPricesList(pricesData);
        }
      } catch (err) {
        console.error('Error fetching initial market data:', err);
        if (active) {
          setError('Could not connect to live market data. Using offline fallback.');
          // Hardcoded fallback data to keep UI functional
          setStatesList(['Gujarat', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Punjab', 'Uttar Pradesh']);
          setCropsList(['Wheat', 'Rice', 'Cotton', 'Groundnut', 'Cumin', 'Mustard', 'Potato', 'Onion']);
          setPricesList([
            { crop: 'Wheat', min: 2150, max: 2450, avg: 2300, trend: 'up', state: 'Gujarat', district: 'Ahmedabad', mandi: 'Ahmedabad APMC' },
            { crop: 'Rice', min: 1940, max: 2280, avg: 2100, trend: 'up', state: 'Maharashtra', district: 'Nagpur', mandi: 'Nagpur APMC' },
            { crop: 'Cotton', min: 6200, max: 6800, avg: 6500, trend: 'down', state: 'Gujarat', district: 'Rajkot', mandi: 'Rajkot APMC' },
            { crop: 'Groundnut', min: 5400, max: 5950, avg: 5680, trend: 'up', state: 'Gujarat', district: 'Rajkot', mandi: 'Rajkot APMC' },
            { crop: 'Cumin', min: 32000, max: 36500, avg: 34200, trend: 'stable', state: 'Gujarat', district: 'Mehsana', mandi: 'Unjha APMC' },
            { crop: 'Mustard', min: 4800, max: 5200, avg: 5000, trend: 'down', state: 'Rajasthan', district: 'Jaipur', mandi: 'Jaipur APMC' },
            { crop: 'Potato', min: 800, max: 1200, avg: 1000, trend: 'up', state: 'Gujarat', district: 'Ahmedabad', mandi: 'Ahmedabad APMC' },
            { crop: 'Onion', min: 1200, max: 1800, avg: 1500, trend: 'stable', state: 'Gujarat', district: 'Bhavnagar', mandi: 'Mahuva APMC' },
          ]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchInitialData();
    return () => {
      active = false;
    };
  }, []);

  // Handle state filter selection
  const handleStateChange = async (e) => {
    const selectedState = e.target.value;
    setFilters(prev => ({ ...prev, state: selectedState, district: '', mandi: '' }));
    setDistrictsList([]);
    setMandisList([]);

    if (!selectedState) return;

    try {
      const districtsData = await mandiAPI.getDistricts(selectedState);
      setDistrictsList(districtsData);
    } catch (err) {
      console.error('Error loading districts:', err);
    }
  };

  // Handle district filter selection
  const handleDistrictChange = async (e) => {
    const selectedDistrict = e.target.value;
    setFilters(prev => ({ ...prev, district: selectedDistrict, mandi: '' }));
    setMandisList([]);

    if (!selectedDistrict) return;

    try {
      const mandisData = await mandiAPI.getMandis(selectedDistrict);
      setMandisList(mandisData);
    } catch (err) {
      console.error('Error loading mandis:', err);
    }
  };

  // Search/Filter prices
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const pricesData = await mandiAPI.getPrices({
        state: filters.state,
        district: filters.district,
        mandi: filters.mandi,
        crop: filters.crop,
      });
      setPricesList(pricesData);
    } catch (err) {
      console.error('Error searching mandi prices:', err);
      setError('Failed to fetch filtered prices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><ArrowUpRight className="w-4 h-4" /> Up</span>;
    if (trend === 'down') return <span className="flex items-center gap-1 text-red-500 text-sm font-semibold"><ArrowDownRight className="w-4 h-4" /> Down</span>;
    return <span className="flex items-center gap-1 text-slate-500 text-sm font-semibold"><Minus className="w-4 h-4" /> Stable</span>;
  };

  return (
    <div className="space-y-6">
      {/* Filters Form */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="glass-card p-6"
      >
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div variants={fadeUp}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.state')}</label>
            <select
              value={filters.state}
              onChange={handleStateChange}
              className="select-field w-full"
            >
              <option value="">All States</option>
              {statesList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.district')}</label>
            <select
              value={filters.district}
              onChange={handleDistrictChange}
              disabled={!filters.state}
              className="select-field w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Districts</option>
              {districtsList.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.mandi')}</label>
            <select
              value={filters.mandi}
              onChange={(e) => setFilters({ ...filters, mandi: e.target.value })}
              disabled={!filters.district}
              className="select-field w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Mandis</option>
              {mandisList.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.crop')}</label>
            <select
              value={filters.crop}
              onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
              className="select-field w-full"
            >
              <option value="">All Crops</option>
              {cropsList.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {loading ? 'Searching...' : t('marketHub.search')}
            </button>
          </motion.div>
        </form>
      </motion.div>

      {/* Error alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prices Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fetching latest mandi prices...</p>
            </div>
          ) : pricesList.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <p className="font-semibold text-lg">No records found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search options.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-surface-muted border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.crop')}</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mandi</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.minPrice')}</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.maxPrice')}</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.avgPrice')}</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.trend')}</th>
                </tr>
              </thead>
              <tbody>
                {pricesList.map((row, i) => (
                  <motion.tr
                    key={`${row.state}-${row.mandi}-${row.crop}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition-colors duration-200"
                  >
                    <td className="py-4 px-6 font-semibold text-body">
                      <div>{row.crop}</div>
                      <div className="text-xs text-slate-400 font-normal">{row.variety} | {row.grade}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div>{row.mandi}</div>
                      <div className="text-xs text-slate-400">{row.district}, {row.state}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">₹{row.min.toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">₹{row.max.toLocaleString()}</td>
                    <td className="py-4 px-6 font-semibold text-body">₹{row.avg.toLocaleString()}</td>
                    <td className="py-4 px-6"><TrendIcon trend={row.trend} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
