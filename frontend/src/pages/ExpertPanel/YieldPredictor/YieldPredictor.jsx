import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BarChart3, Sprout, Ruler, FlaskConical, Droplets,
  Grid3X3, Loader2, TrendingUp, IndianRupee, AlertTriangle,
  CheckCircle2, Target
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const cropTypes = ['Wheat', 'Rice', 'Cotton', 'Groundnut', 'Maize', 'Soybean', 'Sugarcane', 'Potato'];
const soilTypes = ['Alluvial', 'Black (Regur)', 'Red', 'Laterite', 'Sandy', 'Clayey', 'Loamy'];
const fertilizerOptions = ['Organic Only', 'Low Chemical', 'Moderate', 'High Chemical', 'Mixed'];
const irrigationMethods = ['Drip', 'Sprinkler', 'Flood', 'Furrow', 'Rainfed'];
const spacingOptions = ['Dense', 'Standard', 'Wide', 'Ultra-Wide'];

export default function YieldPredictor() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    cropType: '', landArea: '', soilType: '', fertilizer: '', irrigation: '', spacing: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        yield: '42.5 Quintals',
        revenue: '₹1,02,000',
        risk: 'Low',
        probability: 87,
      });
      setLoading(false);
    }, 2000);
  };

  const riskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
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
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.cropType')}</label>
            <div className="relative">
              <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })} className="select-field !pl-10">
                <option value="">Select Crop</option>
                {cropTypes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.landArea')}</label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" value={form.landArea} onChange={(e) => setForm({ ...form, landArea: e.target.value })} placeholder="e.g., 5" className="input-field !pl-10" />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.soilType')}</label>
            <select value={form.soilType} onChange={(e) => setForm({ ...form, soilType: e.target.value })} className="select-field">
              <option value="">Select Soil</option>
              {soilTypes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.fertilizerUsage')}</label>
            <div className="relative">
              <FlaskConical className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={form.fertilizer} onChange={(e) => setForm({ ...form, fertilizer: e.target.value })} className="select-field !pl-10">
                <option value="">Select Fertilizer</option>
                {fertilizerOptions.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={4}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.irrigationMethod')}</label>
            <div className="relative">
              <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={form.irrigation} onChange={(e) => setForm({ ...form, irrigation: e.target.value })} className="select-field !pl-10">
                <option value="">Select Method</option>
                {irrigationMethods.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={5}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('expertPanel.plantSpacing')}</label>
            <div className="relative">
              <Grid3X3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={form.spacing} onChange={(e) => setForm({ ...form, spacing: e.target.value })} className="select-field !pl-10">
                <option value="">Select Spacing</option>
                {spacingOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </motion.div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
            {t('expertPanel.predict')}
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Running AI yield prediction model...</p>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {/* Expected Yield */}
          <div className="glass-card p-6 card-hover text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <p className="text-xs text-slate-500 mb-1">{t('expertPanel.expectedYield')}</p>
            <p className="font-display text-2xl font-bold text-slate-800">{result.yield}</p>
          </div>

          {/* Expected Revenue */}
          <div className="glass-card p-6 card-hover text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <IndianRupee className="w-7 h-7 text-blue-600" />
            </div>
            <p className="text-xs text-slate-500 mb-1">{t('expertPanel.expectedRevenue')}</p>
            <p className="font-display text-2xl font-bold text-slate-800">{result.revenue}</p>
          </div>

          {/* Risk Score */}
          <div className="glass-card p-6 card-hover text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <p className="text-xs text-slate-500 mb-1">{t('expertPanel.riskScore')}</p>
            <p className={`font-display text-2xl font-bold inline-block px-4 py-1 rounded-xl ${riskColor(result.risk)}`}>
              {result.risk}
            </p>
          </div>

          {/* Success Probability */}
          <div className="glass-card p-6 card-hover text-center">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <p className="text-xs text-slate-500 mb-1">{t('expertPanel.successProbability')}</p>
            <p className="font-display text-2xl font-bold gradient-text">{result.probability}%</p>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.probability}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
