import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BarChart3, Sprout, Ruler, Loader2, TrendingUp,
  MapPin, Map, Sun, Info, AlertCircle
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

import stateDistrictMap from './stateDistrictMap.json';

const states = Object.keys(stateDistrictMap);

const crops = [
  'Groundnut', 'Cotton(lint)', 'Wheat', 'Rice', 'Bajra', 'Maize', 'Castor seed', 'Sesamum', 'Gram', 'Jowar', 'Sugarcane', 'Onion', 'Potato', 'Soyabean', 'Arhar/Tur', 'Banana', 'Garlic', 'Coriander', 'Tobacco', 'Sunflower', 'Coconut', 'Ginger', 'Turmeric', 'Moong(Green Gram)', 'Urad', 'Rapeseed &Mustard', 'Ragi', 'Barley', 'Sweet potato', 'Tapioca'
];

const seasons = [
  'Kharif', 'Rabi', 'Summer', 'Winter', 'Autumn', 'Whole Year'
];

export default function YieldPredictor() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    state: 'Gujarat',
    district: '',
    cropType: '',
    season: '',
    landArea: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!form.district || !form.cropType || !form.season || !form.landArea) {
      setError("Please fill all the required fields.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const payload = {
        state: form.state,
        district: form.district,
        crop: form.cropType,
        season: form.season,
        year: 2026,
        area: Number(form.landArea)
      };

      const response = await fetch('http://127.0.0.1:8002/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch prediction from server.');
      }

      setResult({
        yield: Number(data.predicted_yield).toFixed(2),
      });
    } catch (err) {
      let errorMsg = err.message || 'An error occurred during prediction.';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMsg = detail.map(d => typeof d === 'object' ? d.msg || JSON.stringify(d) : String(d)).join(', ');
        } else if (typeof detail === 'string') {
          errorMsg = detail;
        } else {
          errorMsg = JSON.stringify(detail);
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
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
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">State</label>
            <div className="relative">
              <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={form.state} 
                onChange={(e) => setForm({ ...form, state: e.target.value, district: '' })} 
                className="select-field !pl-10"
              >
                <option value="">Select State</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">District</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                value={form.district} 
                onChange={(e) => setForm({ ...form, district: e.target.value })} 
                className="select-field !pl-10"
                disabled={!form.state}
              >
                <option value="">Select District</option>
                {(form.state ? (stateDistrictMap[form.state] || []) : []).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Crop Type</label>
            <div className="relative">
              <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })} className="select-field !pl-10">
                <option value="">Select Crop</option>
                {crops.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Season</label>
            <div className="relative">
              <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} className="select-field !pl-10">
                <option value="">Select Season</option>
                {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={4}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Land Area (Hectares)</label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" value={form.landArea} onChange={(e) => setForm({ ...form, landArea: e.target.value })} placeholder="Enter land area in hectares" className="input-field !pl-10" />
            </div>
          </motion.div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            <span>{loading ? 'Predicting...' : t('expertPanel.predict')}</span>
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {error && (
        <div className="mt-6 glass-card p-4 border-l-4 border-red-500 bg-red-50/50 dark:bg-red-900/10 flex gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm font-medium text-red-800 dark:text-red-400"><span>{error}</span></p>
        </div>
      )}
      {loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold"><span>Running AI yield prediction model...</span></p>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mt-8"
        >
          <div className="glass-card p-8 md:p-10 card-hover text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-20 h-20 bg-green-50/10 dark:bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100 dark:border-green-800">
              <TrendingUp className="w-10 h-10 text-green-600 dark:text-green-400 drop-shadow-md" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider"><span>Estimated Yield</span></p>
            <p className="font-display text-5xl md:text-6xl font-bold text-slate-800 dark:text-slate-100 mb-3 drop-shadow-sm">
              <span>{result.yield}</span> <span className="text-2xl md:text-3xl text-slate-400 dark:text-slate-500 font-normal">t/ha</span>
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/50 inline-block px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
              <span>({result.yield} Tonnes per Hectare)</span>
            </p>
          </div>

          <div className="mt-6 glass-card p-5 border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10 flex gap-4 text-left">
            <Info className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1 flex items-center gap-2">
                ⚠️ Prediction Information
              </h4>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                This yield estimate is generated using machine learning models trained on historical agricultural data. Actual crop performance may vary depending on weather conditions, rainfall, humidity, temperature, soil quality, irrigation practices, and other environmental factors.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
