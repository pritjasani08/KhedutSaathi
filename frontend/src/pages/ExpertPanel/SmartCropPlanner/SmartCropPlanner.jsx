import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  MapPin, Droplets, Clock, Sprout, Leaf, Loader2, AlertCircle,
  TrendingUp, Compass, ShoppingBag, Landmark, ArrowRight, CheckCircle2, ChevronRight, CloudSun
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { stateDistrictMap } from '../../../data/stateDistrictMap';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const soilTypes = [
  { value: 'Alluvial Soil', label: 'Alluvial Soil' },
  { value: 'Black Soil', label: 'Black Soil' },
  { value: 'Clay Soil', label: 'Clay Soil' },
  { value: 'Cold Desert Soil', label: 'Cold Desert Soil' },
  { value: 'Forest Soil', label: 'Forest Soil' },
  { value: 'Laterite Soil', label: 'Laterite Soil' },
  { value: 'Loamy Soil', label: 'Loamy Soil' },
  { value: 'Mountain Soil', label: 'Mountain Soil' },
  { value: 'Red Soil', label: 'Red Soil' },
  { value: 'Sandy Soil', label: 'Sandy Soil' },
  { value: 'Silty Soil', label: 'Silty Soil' }
];
const waterOptions = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];
const seasons = [
  { value: 'Kharif', label: 'Kharif (Monsoon)' },
  { value: 'Rabi', label: 'Rabi (Winter)' },
  { value: 'Summer', label: 'Summer / Zaid' },
  { value: 'Whole Year', label: 'Whole Year' }
];
const durations = [1, 2, 3, 4, 5, 6, 9, 12];

const toTitleCase = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

export default function SmartCropPlanner({ sharedForm, setSharedForm, switchToYieldPredictor }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [localForm, setLocalForm] = useState({ 
    soil_type: '', 
    water_availability: '', 
    crop_duration_months: 4 
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleStateChange = (e) => {
    setSharedForm(prev => ({
      ...prev,
      state: e.target.value,
      district: ''
    }));
  };

  const handleSubmit = async () => {
    if (!sharedForm.state || !sharedForm.district || !localForm.soil_type || !localForm.water_availability || !sharedForm.season) {
        setError('Please fill in all fields before submitting.');
        return;
    }

    setLoading(true);
    setResults(null);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8003/predict', {
        state: sharedForm.state,
        district: sharedForm.district,
        soil_type: localForm.soil_type,
        water_availability: localForm.water_availability,
        season: sharedForm.season,
        crop_duration_months: Number(localForm.crop_duration_months)
      });
      
      if (response.data && response.data.recommended_crops) {
        setResults(response.data.recommended_crops);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      let errorMsg = err.message || 'Failed to get recommendations. Please ensure the API is running.';
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
              onChange={handleStateChange}
              className="select-field w-full"
            >
              <option value="">Select State</option>
              {Object.keys(stateDistrictMap).sort().map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">District</label>
            <select
              value={sharedForm.district}
              onChange={(e) => setSharedForm(prev => ({ ...prev, district: e.target.value }))}
              disabled={!sharedForm.state}
              className={`select-field w-full ${!sharedForm.state ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {sharedForm.state ? (
                <option value="">Select District</option>
              ) : (
                <option value="">Select State First</option>
              )}
              {sharedForm.state && stateDistrictMap[sharedForm.state]?.map((d) => (
                <option key={d} value={d}>{toTitleCase(d)}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Environment Group */}
        <motion.div variants={fadeUp} custom={1} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CloudSun className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Environment</h3>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Soil Type</label>
            <select
              value={localForm.soil_type}
              onChange={(e) => setLocalForm({ ...localForm, soil_type: e.target.value })}
              className="select-field w-full"
            >
              <option value="">Select Soil Type</option>
              {soilTypes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Water Availability</label>
            <select
              value={localForm.water_availability}
              onChange={(e) => setLocalForm({ ...localForm, water_availability: e.target.value })}
              className="select-field w-full"
            >
              <option value="">Select Water Availability</option>
              {waterOptions.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Season</label>
            <select
              value={sharedForm.season}
              onChange={(e) => setSharedForm(prev => ({ ...prev, season: e.target.value }))}
              className="select-field w-full"
            >
              <option value="">Select Season</option>
              {seasons.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Planning Group */}
        <motion.div variants={fadeUp} custom={2} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Planning</h3>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Crop Duration (Months)</label>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => setLocalForm({ ...localForm, crop_duration_months: d })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
                      localForm.crop_duration_months === d
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{d}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sprout className="w-4 h-4" />}
              <span>Generate Plan</span>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-200 dark:border-red-900/50"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm"><span>{error}</span></p>
        </motion.div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse w-full"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse w-full"></div>
        </div>
      )}

      {/* Empty State */}
      {!results && !loading && !error && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center"
        >
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Ready to Plan</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Fill in your farm's location, environment, and planning constraints above to generate an AI-powered crop recommendation.
          </p>
        </motion.div>
      )}

      {/* Results Presentation */}
      {results && results.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* AI Recommendation Summary */}
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
               <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center text-4xl shrink-0">
                  <span role="img" aria-label={results[0]}>🌱</span>
               </div>
               <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Primary Recommendation
                  </div>
                  <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-slate-100 mb-1">{results[0]}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Highest priority match for {sharedForm.district || sharedForm.state} during {sharedForm.season || 'selected'} season.
                  </p>
               </div>
             </div>

             <div className="relative z-10 shrink-0 w-full md:w-auto">
                <button 
                  onClick={() => switchToYieldPredictor(results[0])}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm shadow-primary/20"
                >
                  Predict Yield <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* Compact Recommendation Comparison Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                Recommendation Comparison
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Rank</th>
                    <th className="px-6 py-3 font-medium">Recommended Crop</th>
                    <th className="px-6 py-3 font-medium text-center">Priority Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {results.map((cropName, i) => (
                    <tr key={cropName + i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">#{i + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm">🌱</div>
                        {cropName}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          i === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          i === 1 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          Priority {i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => switchToYieldPredictor(cropName)}
                          className="text-primary hover:text-primary-hover font-medium text-sm flex items-center gap-1 justify-end ml-auto group"
                        >
                          Predict Yield <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
