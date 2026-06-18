import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  MapPin, Droplets, Ruler, Clock, Sprout, IndianRupee,
  Gauge, Leaf, Loader2
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const soilTypes = ['Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Sandy', 'Clayey', 'Loamy'];
const waterOptions = ['Abundant', 'Moderate', 'Limited', 'Scarce'];
const durations = [1, 2, 3, 6, 9, 12];

const mockRecommendations = [
  { crop: 'Wheat', profit: '₹45,000', water: 'Moderate', duration: '4 months', score: 92, icon: '🌾' },
  { crop: 'Mustard', profit: '₹38,000', water: 'Low', duration: '3 months', score: 87, icon: '🌿' },
  { crop: 'Chickpea', profit: '₹42,000', water: 'Low', duration: '4 months', score: 85, icon: '🫘' },
  { crop: 'Potato', profit: '₹55,000', water: 'High', duration: '3 months', score: 78, icon: '🥔' },
];

export default function SmartCropPlanner() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ location: '', soilType: '', water: '', landSize: '', duration: 3 });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSubmit = () => {
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      setResults(mockRecommendations);
      setLoading(false);
    }, 2000);
  };

  const scoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="glass-card p-6 md:p-8"
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <motion.div variants={fadeUp}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.location')}</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g., Ahmedabad, Gujarat"
                className="input-field !pl-10"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.soilType')}</label>
            <select
              value={form.soilType}
              onChange={(e) => setForm({ ...form, soilType: e.target.value })}
              className="select-field"
            >
              <option value="">Select Soil Type</option>
              {soilTypes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.waterAvailability')}</label>
            <select
              value={form.water}
              onChange={(e) => setForm({ ...form, water: e.target.value })}
              className="select-field"
            >
              <option value="">Select Water Availability</option>
              {waterOptions.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.landSize')}</label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number" value={form.landSize}
                onChange={(e) => setForm({ ...form, landSize: e.target.value })}
                placeholder="e.g., 5"
                className="input-field !pl-10"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={4}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.duration')}</label>
            <div className="flex flex-wrap gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setForm({ ...form, duration: d })}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    form.duration === d
                      ? 'bg-primary text-white shadow-green'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t(`expertPanel.months.${d}`)}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={5} className="flex items-end">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sprout className="w-4 h-4" />}
              {t('expertPanel.getRecommendations')}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Analyzing your farm conditions...</p>
        </div>
      )}

      {results && (
        <div>
          <h3 className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            {t('expertPanel.recommendedCrops')}
          </h3>
          <div className="grid md:grid-cols-2 gap-5">
            {results.map((crop, i) => (
              <motion.div
                key={crop.crop}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{crop.icon}</span>
                    <div>
                      <h4 className="font-display font-bold text-lg text-body">{crop.crop}</h4>
                      <p className="text-sm text-slate-500">{t('expertPanel.cropName')}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl font-bold text-lg ${scoreColor(crop.score)}`}>
                    {crop.score}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-green-600 flex items-center gap-1"><IndianRupee className="w-3 h-3" />{t('expertPanel.expectedProfit')}</p>
                    <p className="font-bold text-green-700 mt-1">{crop.profit}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-600 flex items-center gap-1"><Droplets className="w-3 h-3" />{t('expertPanel.waterNeed')}</p>
                    <p className="font-bold text-blue-700 mt-1">{crop.water}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-amber-600 flex items-center gap-1"><Clock className="w-3 h-3" />{t('expertPanel.cropDuration')}</p>
                    <p className="font-bold text-amber-700 mt-1">{crop.duration}</p>
                  </div>
                  <div className="bg-surface-muted rounded-xl p-3">
                    <p className="text-xs text-slate-500 flex items-center gap-1"><Gauge className="w-3 h-3" />{t('expertPanel.suitabilityScore')}</p>
                    <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${crop.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
