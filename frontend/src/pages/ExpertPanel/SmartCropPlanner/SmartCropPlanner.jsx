import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  MapPin, Droplets, Clock, Sprout, Leaf, Loader2, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { stateDistrictMap } from '../../../data/stateDistrictMap';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const soilTypes = ['Alluvial Soil', 'Black Soil', 'Red Soil', 'Laterite Soil', 'Sandy Soil', 'Clayey Soil', 'Loamy Soil'];
const waterOptions = ['High', 'Medium', 'Low'];
const seasons = ['Kharif', 'Rabi', 'Zaid', 'Summer', 'Winter', 'Whole Year'];
const durations = [1, 2, 3, 4, 5, 6, 9, 12];

export default function SmartCropPlanner() {
  const { t } = useTranslation();
  
  // 3. Create React state management
  const [form, setForm] = useState({ 
    state: '', 
    district: '', 
    soil_type: '', 
    water_availability: '', 
    season: '', 
    crop_duration_months: 4 
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Handle state change specifically to reset district
  const handleStateChange = (e) => {
    setForm({
      ...form,
      state: e.target.value,
      district: '' // Reset district when state changes
    });
  };

  // 4. On form submit send POST request
  const handleSubmit = async () => {
    // Basic validation
    if (!form.state || !form.district || !form.soil_type || !form.water_availability || !form.season) {
        setError('Please fill in all fields before submitting.');
        return;
    }

    setLoading(true);
    setResults(null);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:8000/predict', {
        state: form.state,
        district: form.district,
        soil_type: form.soil_type,
        water_availability: form.water_availability,
        season: form.season,
        crop_duration_months: Number(form.crop_duration_months)
      });
      
      if (response.data && response.data.recommended_crops) {
        // 7. Store response
        setResults(response.data.recommended_crops);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      // 12. Add proper error handling
      setError(err.response?.data?.detail || err.message || 'Failed to get recommendations. Please ensure the API is running.');
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
          {/* State Dropdown */}
          <motion.div variants={fadeUp}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">State</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={form.state}
                onChange={handleStateChange}
                className="select-field !pl-10"
              >
                <option value="">Select State</option>
                {Object.keys(stateDistrictMap).sort().map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* District Dropdown */}
          <motion.div variants={fadeUp} custom={1}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">District</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                disabled={!form.state}
                className={`select-field !pl-10 ${!form.state ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">{form.state ? "Select District" : "Select State First"}</option>
                {form.state && stateDistrictMap[form.state]?.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Other Form fields */}
          <motion.div variants={fadeUp} custom={2}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Soil Type</label>
            <select
              value={form.soil_type}
              onChange={(e) => setForm({ ...form, soil_type: e.target.value })}
              className="select-field"
            >
              <option value="">Select Soil Type</option>
              {soilTypes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Water Availability</label>
            <select
              value={form.water_availability}
              onChange={(e) => setForm({ ...form, water_availability: e.target.value })}
              className="select-field"
            >
              <option value="">Select Water Availability</option>
              {waterOptions.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={4}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Season</label>
            <select
              value={form.season}
              onChange={(e) => setForm({ ...form, season: e.target.value })}
              className="select-field"
            >
              <option value="">Select Season</option>
              {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </motion.div>

          <motion.div variants={fadeUp} custom={5}>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Crop Duration (Months)</label>
            <div className="flex flex-wrap gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => setForm({ ...form, crop_duration_months: d })}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    form.crop_duration_months === d
                      ? 'bg-primary text-white shadow-green'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d} {d === 1 ? 'Month' : 'Months'}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={6} className="flex items-end">
            <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sprout className="w-4 h-4" />}
              Get Recommendation
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* 6. Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </motion.div>
      )}

      {/* 6. Loading State / 11. Spinner */}
      {loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">Analyzing your farm conditions via API...</p>
        </div>
      )}

      {/* 6. Success State / 10. Only render if predictions available */}
      {results && results.length > 0 && !loading && (
        <div>
          <h3 className="font-display text-xl font-bold text-body mb-6 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            Top Recommended Crops
          </h3>
          <div className="grid md:grid-cols-3 gap-5">
            {/* 8. Display Priority 1, 2, 3 */}
            {results.map((cropName, i) => (
              <motion.div
                key={cropName + i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                // 9. Beautiful crop cards
                className={`glass-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden card-hover ${
                  i === 0 ? 'border-2 border-primary/50 bg-green-50/30' : ''
                }`}
              >
                {/* 9. Rank */}
                <div className={`absolute top-0 right-0 rounded-bl-2xl px-4 py-1.5 font-bold text-sm text-white ${
                  i === 0 ? 'bg-primary shadow-lg' : i === 1 ? 'bg-blue-500' : 'bg-amber-500'
                }`}>
                  Priority {i + 1}
                </div>
                
                {/* 9. Crop Image Placeholder */}
                <div className="w-24 h-24 mb-4 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center text-5xl overflow-hidden mt-2">
                  <span role="img" aria-label={cropName}>🌱</span>
                </div>
                
                {/* 9. Crop Name */}
                <h4 className="font-display font-bold text-2xl text-body mb-1">{cropName}</h4>
                <p className="text-sm text-slate-500 mb-4">Highly recommended for your region</p>
                
                {/* Extra info based on form inputs to match existing UI aesthetic */}
                <div className="flex gap-4 w-full pt-4 border-t border-slate-100">
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-0.5">Duration</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      {form.crop_duration_months} Months
                    </p>
                  </div>
                  <div className="w-px bg-slate-100"></div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-0.5">Water</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      {form.water_availability || '-'}
                    </p>
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
