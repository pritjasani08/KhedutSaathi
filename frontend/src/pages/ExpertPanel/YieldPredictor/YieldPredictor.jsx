import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BarChart3, Sprout, Ruler, Loader2, TrendingUp,
  MapPin, Map, Sun, Info, AlertCircle, Compass, Calculator,
  ShoppingBag, Landmark, ArrowRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import stateDistrictMap from './stateDistrictMap.json';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const states = Object.keys(stateDistrictMap);
const crops = [
  'Groundnut', 'Cotton(lint)', 'Wheat', 'Rice', 'Bajra', 'Maize', 'Castor seed', 'Sesamum', 'Gram', 'Jowar', 'Sugarcane', 'Onion', 'Potato', 'Soyabean', 'Arhar/Tur', 'Banana', 'Garlic', 'Coriander', 'Tobacco', 'Sunflower', 'Coconut', 'Ginger', 'Turmeric', 'Moong(Green Gram)', 'Urad', 'Rapeseed &Mustard', 'Ragi', 'Barley', 'Sweet potato', 'Tapioca'
];
const seasons = [
  'Kharif', 'Rabi', 'Summer', 'Winter', 'Autumn', 'Whole Year'
];

export default function YieldPredictor({ sharedForm, setSharedForm }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [landArea, setLandArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('t/ha');

  const handleSubmit = async () => {
    if (!sharedForm.district || !sharedForm.cropType || !sharedForm.season || !landArea) {
      setError("Please fill all the required fields.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setSelectedUnit('t/ha'); // Reset unit on new prediction

    try {
      const payload = {
        state: sharedForm.state,
        district: sharedForm.district,
        crop: sharedForm.cropType,
        season: sharedForm.season,
        year: 2026,
        area: Number(landArea)
      };

      const response = await fetch('http://127.0.0.1:8002/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch prediction from server.');
      }

      setResult({
        yield: Number(data.predicted_yield),
        metadata: { ...payload }
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

  // Unit Converter Logic (Frontend only)
  const convertedYield = useMemo(() => {
    if (!result) return 0;
    const value = result.yield;
    const HA_TO_ACRE = 2.47105;
    
    switch (selectedUnit) {
      case 't/ha': return value.toFixed(2);
      case 'q/ha': return (value * 10).toFixed(2);
      case 'kg/ha': return (value * 1000).toFixed(2);
      case 't/acre': return (value / HA_TO_ACRE).toFixed(2);
      case 'q/acre': return ((value * 10) / HA_TO_ACRE).toFixed(2);
      case 'kg/acre': return ((value * 1000) / HA_TO_ACRE).toFixed(2);
      default: return value.toFixed(2);
    }
  }, [result, selectedUnit]);

  return (
    <div className="space-y-8">
      {/* Parameter Groups */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="grid md:grid-cols-3 gap-6"
      >
        {/* Location Group */}
        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Location</h3>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">State</label>
            <select 
              value={sharedForm.state} 
              onChange={(e) => setSharedForm(prev => ({ ...prev, state: e.target.value, district: '' }))} 
              className="select-field w-full"
            >
              <option value="">Select State</option>
              {states.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">District</label>
            <select 
              value={sharedForm.district} 
              onChange={(e) => setSharedForm(prev => ({ ...prev, district: e.target.value }))} 
              className={`select-field w-full ${!sharedForm.state ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!sharedForm.state}
            >
              <option value="">Select District</option>
              {(sharedForm.state ? (stateDistrictMap[sharedForm.state] || []) : []).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Crop Group */}
        <motion.div variants={fadeUp} custom={1} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sprout className="w-4 h-4 text-green-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Crop</h3>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Crop Type</label>
            <select value={sharedForm.cropType} onChange={(e) => setSharedForm(prev => ({ ...prev, cropType: e.target.value }))} className="select-field w-full">
              <option value="">Select Crop</option>
              {crops.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Season</label>
            <select value={sharedForm.season} onChange={(e) => setSharedForm(prev => ({ ...prev, season: e.target.value }))} className="select-field w-full">
              <option value="">Select Season</option>
              {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Farm Group */}
        <motion.div variants={fadeUp} custom={2} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <Ruler className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Farm</h3>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Land Area (Hectares)</label>
              <input 
                type="number" 
                value={landArea} 
                onChange={(e) => setLandArea(e.target.value)} 
                placeholder="e.g. 5" 
                className="input-field w-full" 
              />
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
              <span>{loading ? 'Predicting...' : 'Predict Yield'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-200 dark:border-red-900/50">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium"><span>{error}</span></p>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse w-full"></div>
        </div>
      )}

      {/* Empty State */}
      {!result && !loading && !error && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Yield Predictor</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Enter your land area and crop details above to get an AI-driven yield estimate based on historical and environmental data.
          </p>
        </motion.div>
      )}

      {/* Results Presentation */}
      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Yield Analytics Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
             <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
               {/* Left: Original AI Prediction */}
               <div className="flex-1 w-full text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold mb-4 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Prediction Successful
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Estimated Yield (AI Model Output)</p>
                  <p className="font-display text-5xl md:text-6xl font-bold text-slate-800 dark:text-slate-100 flex items-baseline justify-center md:justify-start gap-2">
                    {result.yield.toFixed(2)} <span className="text-2xl text-slate-400 font-normal">t/ha</span>
                  </p>
                  
                  <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Crop</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{result.metadata.crop}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Area</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{result.metadata.area} ha</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Season & District</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{result.metadata.season}, {result.metadata.district}</p>
                    </div>
                  </div>
               </div>

               {/* Right: Frontend Unit Converter */}
               <div className="w-full md:w-80 shrink-0 bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-2 mb-4 text-slate-600 dark:text-slate-300">
                    <Calculator className="w-4 h-4" />
                    <h4 className="font-semibold text-sm">Unit Converter</h4>
                  </div>
                  
                  <select 
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="select-field w-full mb-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  >
                    <option value="t/ha">Tonnes / Hectare (t/ha)</option>
                    <option value="q/ha">Quintal / Hectare (q/ha)</option>
                    <option value="q/acre">Quintal / Acre (q/acre)</option>
                    <option value="kg/ha">Kilogram / Hectare (kg/ha)</option>
                    <option value="kg/acre">Kilogram / Acre (kg/acre)</option>
                    <option value="t/acre">Tonnes / Acre (t/acre)</option>
                  </select>

                  <div className="w-full bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Converted Value</p>
                    <p className="text-3xl font-bold text-primary font-display">{convertedYield} <span className="text-base text-slate-400 font-normal">{selectedUnit}</span></p>
                  </div>
               </div>
             </div>
             
             {/* Info Footer */}
             <div className="bg-amber-50/50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/30 p-4 px-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-400/90 leading-relaxed">
                  This yield estimate is generated using machine learning models trained on historical agricultural data. Actual crop performance may vary depending on weather conditions, rainfall, temperature, and other environmental factors. The unit converter is a local tool and does not change the AI's prediction.
                </p>
             </div>
          </div>

          {/* AI Action Center */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button onClick={() => navigate('/market-prices')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-sm transition-all group">
              <TrendingUp className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 text-center">Market Prices</span>
            </button>
            <button onClick={() => navigate('/khedut-ai')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-sm transition-all group">
              <Sprout className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 text-center">Ask Khedut AI</span>
            </button>
            <button onClick={() => navigate('/resources')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-sm transition-all group">
              <Landmark className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 text-center">Govt Schemes</span>
            </button>
            <button onClick={() => navigate('/agri-marketplace')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-sm transition-all group">
              <ShoppingBag className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 text-center">Marketplace</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
