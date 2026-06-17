import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, Search, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const states = ['Gujarat', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Punjab', 'Uttar Pradesh'];
const districts = ['Ahmedabad', 'Surat', 'Rajkot', 'Vadodara', 'Bhavnagar'];
const mandis = ['Ahmedabad APMC', 'Unjha APMC', 'Rajkot APMC', 'Mahuva APMC'];
const crops = ['Wheat', 'Rice', 'Cotton', 'Groundnut', 'Cumin', 'Mustard', 'Potato', 'Onion'];

const mockPrices = [
  { crop: 'Wheat', min: 2150, max: 2450, avg: 2300, trend: 'up' },
  { crop: 'Rice', min: 1940, max: 2280, avg: 2100, trend: 'up' },
  { crop: 'Cotton', min: 6200, max: 6800, avg: 6500, trend: 'down' },
  { crop: 'Groundnut', min: 5400, max: 5950, avg: 5680, trend: 'up' },
  { crop: 'Cumin', min: 32000, max: 36500, avg: 34200, trend: 'stable' },
  { crop: 'Mustard', min: 4800, max: 5200, avg: 5000, trend: 'down' },
  { crop: 'Potato', min: 800, max: 1200, avg: 1000, trend: 'up' },
  { crop: 'Onion', min: 1200, max: 1800, avg: 1500, trend: 'stable' },
];

export default function LivePrices() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({ state: '', district: '', mandi: '', crop: '' });

  const TrendIcon = ({ trend }) => {
    if (trend === 'up') return <span className="flex items-center gap-1 text-green-600 text-sm font-semibold"><ArrowUpRight className="w-4 h-4" /> Up</span>;
    if (trend === 'down') return <span className="flex items-center gap-1 text-red-500 text-sm font-semibold"><ArrowDownRight className="w-4 h-4" /> Down</span>;
    return <span className="flex items-center gap-1 text-slate-500 text-sm font-semibold"><Minus className="w-4 h-4" /> Stable</span>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="glass-card p-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div variants={fadeUp}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.state')}</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              className="select-field"
            >
              <option value="">{t('marketHub.selectState')}</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.district')}</label>
            <select
              value={filters.district}
              onChange={(e) => setFilters({ ...filters, district: e.target.value })}
              className="select-field"
            >
              <option value="">{t('marketHub.selectDistrict')}</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.mandi')}</label>
            <select
              value={filters.mandi}
              onChange={(e) => setFilters({ ...filters, mandi: e.target.value })}
              className="select-field"
            >
              <option value="">{t('marketHub.selectMandi')}</option>
              {mandis.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('marketHub.crop')}</label>
            <select
              value={filters.crop}
              onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
              className="select-field"
            >
              <option value="">{t('marketHub.selectCrop')}</option>
              {crops.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="flex items-end">
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              {t('marketHub.search')}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Prices Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.crop')}</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.minPrice')}</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.maxPrice')}</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.avgPrice')}</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('marketHub.trend')}</th>
              </tr>
            </thead>
            <tbody>
              {mockPrices.map((row, i) => (
                <motion.tr
                  key={row.crop}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="border-b border-slate-100 hover:bg-primary-50/30 transition-colors duration-200"
                >
                  <td className="py-4 px-6 font-semibold text-slate-800">{row.crop}</td>
                  <td className="py-4 px-6 text-slate-600">₹{row.min.toLocaleString()}</td>
                  <td className="py-4 px-6 text-slate-600">₹{row.max.toLocaleString()}</td>
                  <td className="py-4 px-6 font-semibold text-slate-800">₹{row.avg.toLocaleString()}</td>
                  <td className="py-4 px-6"><TrendIcon trend={row.trend} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
