import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Thermometer, Droplets, CloudRain, Wind,
  CheckCircle2, Target, AlertTriangle, Info,
  Settings, Sparkles, Activity, CalendarClock, PlayCircle, Leaf, ShieldAlert
} from 'lucide-react';
import { getIrrigationPlan } from '../../services/irrigationPlannerApi';
import { useFarmContext } from '../../context/FarmContext';
import { useCrossModuleContext } from '../../context/CrossModuleContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

// Helper for large volume numbers
const formatVolume = (liters) => {
  if (liters >= 1000000) return (liters / 1000000).toFixed(1) + 'M L';
  if (liters >= 1000) return (liters / 1000).toFixed(1) + 'k L';
  return liters.toString() + ' L';
};

export default function SmartIrrigation() {
  const { t } = useTranslation();
  const { farmProfile, updateFarmContext } = useFarmContext();
  const { publishModuleOutput } = useCrossModuleContext();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [planData, setPlanData] = useState(null);
  
  const [showConfig, setShowConfig] = useState(true);
  
  const [config, setConfig] = useState({
    crop: farmProfile.selectedCrop || 'Cotton',
    state: farmProfile.state || 'Gujarat',
    district: farmProfile.district || 'Rajkot',
    soilType: farmProfile.soilType || 'Loamy',
    farmArea: farmProfile.farmArea || 5,
    irrigationMethod: 'Drip',
    sowingDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0] // 30 days ago
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
          setError(null);
        },
        (err) => {
          console.warn("Geolocation warning:", err);
          setCurrentCoords({ lat: 22.3, lon: 70.8 }); // Rajkot approx
          setError(null);
        },
        { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false }
      );
    } else {
      setCurrentCoords({ lat: 22.3, lon: 70.8 });
    }
  }, []);

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
    
    const contextUpdate = { [name]: value };
    if (name === 'crop') contextUpdate.selectedCrop = value;
    if (name === 'farmArea') contextUpdate.farmArea = value;
    updateFarmContext(contextUpdate);
  };

  const generatePlan = async () => {
    if (!currentCoords) {
      setError("Waiting for location access. Please enable location permissions.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        lat: currentCoords.lat,
        lon: currentCoords.lon,
        ...config
      };
      const plan = await getIrrigationPlan(payload);
      setPlanData(plan);
      
      publishModuleOutput('SmartIrrigation', plan, config);
      setShowConfig(false);
    } catch (err) {
      setError("Failed to generate irrigation plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderConfigPanel = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="glass-card p-6 border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-display font-bold text-slate-800 dark:text-slate-200">Farm Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Crop</label>
          <select name="crop" value={config.crop} onChange={handleConfigChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium">
            <option value="Cotton">Cotton</option>
            <option value="Wheat">Wheat</option>
            <option value="Paddy">Paddy</option>
            <option value="Groundnut">Groundnut</option>
            <option value="Maize">Maize</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Soil Type</label>
          <select name="soilType" value={config.soilType} onChange={handleConfigChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium">
            <option value="Loamy">Loamy</option>
            <option value="Clay">Clay</option>
            <option value="Sandy">Sandy</option>
            <option value="Black Soil">Black Soil</option>
            <option value="Alluvial Soil">Alluvial Soil</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Irrigation Method</label>
          <select name="irrigationMethod" value={config.irrigationMethod} onChange={handleConfigChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium">
            <option value="Drip">Drip</option>
            <option value="Sprinkler">Sprinkler</option>
            <option value="Flood">Flood</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Farm Area (Hectares)</label>
          <input type="number" name="farmArea" value={config.farmArea} onChange={handleConfigChange} min="0.1" step="0.1" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sowing Date</label>
          <input type="date" name="sowingDate" value={config.sowingDate} onChange={handleConfigChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium" />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      
      <button 
        onClick={generatePlan}
        disabled={loading}
        className="w-full btn-primary py-3 justify-center text-base"
      >
        {loading ? 'Generating AI Plan...' : 'Generate Seasonal Plan'}
      </button>
    </motion.div>
  );

  const renderPlannerWorkspace = () => {
    if (!planData) return null;
    const { farm, water, timeline, weather, recommendations, summary } = planData;

    // Determine hero card styling based on status
    const isActionRequired = summary.overallStatus === 'Action Required' || summary.overallStatus === 'Monitor';
    const heroBg = isActionRequired 
      ? 'bg-gradient-to-br from-amber-500/10 to-orange-600/5 dark:from-amber-900/40 dark:to-orange-900/10 border-amber-200 dark:border-amber-800/50'
      : 'bg-gradient-to-br from-emerald-500/10 to-teal-600/5 dark:from-emerald-900/40 dark:to-teal-900/10 border-emerald-200 dark:border-emerald-800/50';
    const heroIconColor = isActionRequired ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500';

    return (
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowConfig(true)} className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5">
            <Settings className="w-4 h-4" /> Refine Configuration
          </button>
        </div>

        {/* 1. Today's AI Decision (Primary Hero) */}
        <motion.div variants={fadeUp} className={`glass-card p-6 md:p-8 mb-6 border ${heroBg}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isActionRequired ? 'bg-amber-100 dark:bg-amber-900/50' : 'bg-emerald-100 dark:bg-emerald-900/50'}`}>
                <Sparkles className={`w-6 h-6 ${heroIconColor}`} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-500">Today's AI Decision</p>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">{summary.nextAction}</h2>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isActionRequired ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                    Status: {summary.overallStatus}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Confidence: 94%</span>
                </div>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 dark:border-slate-700/50 flex flex-col items-center">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Next Irrigation</span>
               <span className="font-display font-bold text-lg text-slate-800 dark:text-slate-200">{new Date(timeline.nextIrrigationDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}</span>
            </div>
          </div>
        </motion.div>

        {/* 2. Critical Alerts */}
        {(weather.heatwave || weather.rainfallAlert || weather.windAlert) && (
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {weather.heatwave && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-400">Heatwave Alert</p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-500 mt-1">Temperatures &gt; 35°C detected. Monitor moisture.</p>
                </div>
              </div>
            )}
            {weather.rainfallAlert && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/40 p-4 rounded-2xl flex items-start gap-3">
                <CloudRain className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-blue-800 dark:text-blue-400">Rainfall Expected</p>
                  <p className="text-xs text-blue-700/80 dark:text-blue-500 mt-1">High probability of rain today.</p>
                </div>
              </div>
            )}
            {weather.windAlert && (
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-start gap-3">
                <Wind className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">High Winds</p>
                  <p className="text-xs text-slate-600/80 dark:text-slate-400 mt-1">Sprinkler efficiency may be reduced.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* 3. Water Analytics */}
          <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-200 dark:border-slate-700 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-6">
              <Activity className="w-4 h-4 text-primary" /> Water Analytics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Requirement</p>
                <p className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">{water.depthMm} <span className="text-sm text-slate-500 font-medium">mm</span></p>
                <p className="text-xs text-slate-500 mt-1">{formatVolume(water.totalVolumeLiters)}</p>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400 uppercase tracking-wider mb-2">Rain Contrib.</p>
                <p className="text-2xl font-display font-bold text-blue-700 dark:text-blue-300">{water.rainContributionMm} <span className="text-sm text-blue-500/70 font-medium">mm</span></p>
                <p className="text-xs text-blue-600/70 mt-1">Estimated</p>
              </div>
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <p className="text-xs font-bold text-primary/70 uppercase tracking-wider mb-2">Irrigation Needed</p>
                <p className="text-2xl font-display font-bold text-primary">{water.irrigationRequiredMm} <span className="text-sm text-primary/70 font-medium">mm</span></p>
                <p className="text-xs text-primary/70 mt-1">{water.irrigationCount} cycles left</p>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400 uppercase tracking-wider mb-2">Water Saved</p>
                <p className="text-2xl font-display font-bold text-emerald-700 dark:text-emerald-300">{formatVolume(water.waterSavedLiters)}</p>
                <p className="text-xs text-emerald-600/70 mt-1">vs Flood</p>
              </div>
            </div>
          </motion.div>

          {/* 5. Weather Intelligence */}
          <motion.div variants={fadeUp} className="glass-card p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-6">
              <CloudRain className="w-4 h-4 text-primary" /> Weather Intelligence
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center"><Thermometer className="w-4 h-4 text-orange-600 dark:text-orange-400" /></div>
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Temperature</span>
                </div>
                <span className="font-display font-bold text-slate-900 dark:text-white">{weather.temperature}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Rain Prob.</span>
                </div>
                <span className="font-display font-bold text-slate-900 dark:text-white">{weather.rainProbability}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Wind className="w-4 h-4 text-slate-600 dark:text-slate-400" /></div>
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Wind</span>
                </div>
                <span className="font-display font-bold text-slate-900 dark:text-white">{weather.windSpeed} km/h</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 4. Season Progress & Crop Stage */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <div className="glass-card p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-6">
                <CalendarClock className="w-4 h-4 text-primary" /> Season Timeline
              </h3>
              <div className="mb-4">
                 <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                   <span>Day {timeline.currentDay} of {timeline.totalSeasonDays}</span>
                   <span className="text-primary">{timeline.progress}%</span>
                 </div>
                 <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="bg-gradient-to-r from-primary to-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${timeline.progress}%` }}></div>
                 </div>
              </div>
           </div>

           <div className="glass-card p-6 border border-slate-200 dark:border-slate-700 flex flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border border-green-200 dark:border-green-800 shrink-0">
                 <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Crop Stage Intelligence</p>
                 <h4 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 mb-1">{timeline.currentStage}</h4>
                 <p className="text-sm text-slate-600 dark:text-slate-400">{timeline.daysRemaining} days remaining in this stage.</p>
              </div>
           </div>
        </motion.div>

        {/* 6. Actionable Advice & Explanations */}
        <motion.div variants={fadeUp} className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-primary" /> Knowledge & Recommendations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => (
              <div key={rec.id} className="glass-card border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
                <div className={`p-4 border-b flex items-center gap-2 ${rec.category === 'weather' ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-900 dark:text-blue-300' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-200'}`}>
                   {rec.severity === 'warning' ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <Info className="w-4 h-4 opacity-70" />}
                   <h4 className="font-bold text-sm">{rec.title}</h4>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  {rec.aiExplanation && rec.aiExplanation.text && rec.aiExplanation.text.trim() ? (
                    <div className="mb-4">
                       <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                         {rec.aiExplanation.text}
                       </p>
                    </div>
                  ) : (
                    <div className="mb-4 flex-1 flex items-center justify-center p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-500 text-center font-medium">AI analysis will appear after the recommendation engine completes processing.</p>
                    </div>
                  )}

                  {rec.actionableInsights && rec.actionableInsights.length > 0 && (
                    <div className="mt-auto mb-5">
                       <ul className="space-y-2">
                         {rec.actionableInsights.map((insight, idx) => (
                           <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                             <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                             <span>{insight}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                  )}

                  {/* Knowledge Panel */}
                  <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Supporting Documents</p>
                      {rec.evidenceSummaries && rec.evidenceSummaries.length > 0 ? (
                          <div className="space-y-4">
                              {rec.evidenceSummaries.map((summary, idx) => (
                                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40"></div>
                                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">{summary.title}</h4>
                                      <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-slate-500 mb-3">
                                          <span className="text-blue-500">{summary.source}</span>
                                          {summary.page && <span>Page {summary.page}</span>}
                                          {summary.score > 0 && <span className="text-green-600">Match: {(summary.score * 100).toFixed(0)}%</span>}
                                      </div>
                                      
                                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                                          {summary.summary}
                                      </p>
                                      
                                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 p-3 rounded-lg flex items-start gap-2">
                                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                              <span className="font-bold text-slate-700 dark:text-slate-300">Key Takeaway: </span>
                                              {summary.keyRecommendation}
                                          </p>
                                      </div>
                                      
                                      {/* Raw Evidence Toggle */}
                                      <details className="mt-3 group">
                                          <summary className="text-[10px] font-bold uppercase text-slate-400 cursor-pointer hover:text-blue-500 transition-colors flex items-center gap-1 select-none">
                                              View Original Excerpt
                                          </summary>
                                          <div className="mt-2 text-xs italic text-slate-500 border-l-2 border-slate-200 pl-3 leading-relaxed">
                                              {rec.rawEvidence?.find(r => r.title === summary.title || r.source === summary.source)?.content || "Original excerpt not available."}
                                          </div>
                                      </details>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                              <p className="text-sm text-slate-500 italic">No supporting agricultural document available.</p>
                          </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
            <Droplets className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-slate-100 mb-4">
            Smart Irrigation
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-slate-600 dark:text-slate-400 text-lg">
            AI-driven water management grounded in agricultural science.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {showConfig ? (
            <motion.div key="config">
               {renderConfigPanel()}
            </motion.div>
          ) : (
            <motion.div key="workspace">
               {renderPlannerWorkspace()}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
