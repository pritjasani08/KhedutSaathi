import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, Sprout, Target, ArrowRight, ArrowLeft, 
    CheckCircle2, AlertCircle, Droplets, Ruler, Leaf, RefreshCw,
    PlayCircle, Calculator, TrendingUp
} from 'lucide-react';
import { yieldPredictorAPI } from '../../../services/api';
import stateDistrictMap from './stateDistrictMap.json';
import { useFarmContext } from '../../../context/FarmContext';
import { useCrossModuleContext } from '../../../context/CrossModuleContext';

const soilTypes = ['Alluvial Soil', 'Black Soil', 'Clay Soil', 'Cold Desert Soil', 'Forest Soil', 'Laterite Soil', 'Loamy Soil', 'Mountain Soil', 'Red Soil', 'Sandy Soil', 'Silty Soil', 'Sandy Loam', 'Clay Loam'];
const crops = ['Groundnut', 'Cotton', 'Wheat', 'Rice', 'Bajra', 'Maize', 'Castor seed', 'Sesamum', 'Gram', 'Jowar', 'Sugarcane', 'Onion', 'Potato', 'Soyabean', 'Arhar/Tur', 'Banana', 'Garlic', 'Coriander', 'Tobacco', 'Sunflower', 'Coconut', 'Ginger', 'Turmeric', 'Moong', 'Urad', 'Mustard', 'Ragi', 'Barley', 'Sweet potato', 'Tapioca'];
const seasons = ['Kharif', 'Rabi', 'Summer', 'Whole Year'];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export default function YieldPredictor() {
    const { t } = useTranslation();
    const { farmProfile, updateFarmContext } = useFarmContext();
    const { publishModuleOutput } = useCrossModuleContext();
    
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [plan, setPlan] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState('t/ha');

    // Local form state initialized from global Farm Context
    const [form, setForm] = useState({
        state: farmProfile.state || '', 
        district: farmProfile.district || '', 
        soilType: farmProfile.soilType || '', 
        season: farmProfile.season || '',
        crop: farmProfile.selectedCrop || '',
        area: farmProfile.farmArea || '', 
        year: farmProfile.selectedYear || new Date().getFullYear().toString()
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Map local names to Farm Context names where they differ
        const contextUpdate = { [name]: value };
        if (name === 'crop') contextUpdate.selectedCrop = value;
        if (name === 'area') contextUpdate.farmArea = value;
        if (name === 'year') contextUpdate.selectedYear = value;
        updateFarmContext(contextUpdate);
    };

    const handleStateChange = (e) => {
        const val = e.target.value;
        setForm(prev => ({ ...prev, state: val, district: '' }));
        updateFarmContext({ state: val, district: '' });
    };

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setStep(3); // Loading step
        setLoading(true);
        setError(null);
        try {
            const res = await yieldPredictorAPI.predict(form);
            setPlan(res);
            
            // Publish output to Cross Module Intelligence layer
            publishModuleOutput('YieldPredictor', res, form);

            setStep(4);
        } catch (err) {
            setError(err.customMessage || err.message || "Failed to generate Yield Prediction.");
            setStep(2); // Go back to form
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = form.state && form.district && form.soilType && form.season;
    const isStep2Valid = form.crop && form.area && form.year;

    // Unit Converter Logic (Frontend only)
    const convertedYield = useMemo(() => {
        if (!plan || !plan.prediction) return 0;
        const value = plan.prediction.yieldPerHectare;
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
    }, [plan, selectedUnit]);

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[600px]">
            {/* Header Steps */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 relative z-10 bg-slate-50/50 dark:bg-slate-900/50">
                {[
                    { num: 1, icon: MapPin, title: "Environment" },
                    { num: 2, icon: Sprout, title: "Crop & Area" },
                    { num: 3, icon: Target, title: "ML Analysis" },
                    { num: 4, icon: CheckCircle2, title: "Prediction" }
                ].map((s) => (
                    <div key={s.num} className={`flex-1 p-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${step === s.num ? 'border-primary text-primary bg-primary/5' : step > s.num ? 'border-green-500 text-green-500' : 'border-transparent text-slate-400'}`}>
                        <s.icon className="w-5 h-5" />
                        <span className="font-semibold text-sm hidden sm:block">{s.title}</span>
                    </div>
                ))}
            </div>

            <div className="p-6 md:p-10 relative z-10">
                <AnimatePresence mode="wait">
                    {/* STEP 1: Location & Environment */}
                    {step === 1 && (
                        <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6 max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Location & Environment</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">State</label>
                                    <select name="state" value={form.state} onChange={handleStateChange} className="select-field w-full">
                                        <option value="">Select State</option>
                                        {Object.keys(stateDistrictMap || {}).sort().map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">District</label>
                                    <select name="district" value={form.district} onChange={handleChange} disabled={!form.state} className="select-field w-full">
                                        <option value="">Select District</option>
                                        {form.state && (stateDistrictMap[form.state] || []).map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Soil Type</label>
                                    <select name="soilType" value={form.soilType} onChange={handleChange} className="select-field w-full">
                                        <option value="">Select Soil Type</option>
                                        {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Season</label>
                                    <select name="season" value={form.season} onChange={handleChange} className="select-field w-full">
                                        <option value="">Select Season</option>
                                        {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button onClick={handleNext} disabled={!isStep1Valid} className="btn-primary flex items-center gap-2">
                                    Next Step <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Crop Details */}
                    {step === 2 && (
                        <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6 max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Crop & Area Details</h2>
                            
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
                                    <AlertCircle className="w-5 h-5" /> {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Target Crop</label>
                                    <select name="crop" value={form.crop} onChange={handleChange} className="select-field w-full">
                                        <option value="">Select Crop</option>
                                        {crops.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Target Year</label>
                                    <input type="number" name="year" value={form.year} onChange={handleChange} className="input-field w-full" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Farm Area (Hectares)</label>
                                    <div className="relative">
                                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="number" name="area" value={form.area} onChange={handleChange} placeholder="e.g. 5" className="input-field pl-10 w-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-6">
                                <button onClick={handlePrev} className="btn-secondary flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={handleSubmit} disabled={!isStep2Valid || loading} className="btn-primary flex items-center gap-2">
                                    Predict Yield <TrendingUp className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Loading */}
                    {step === 3 && (
                        <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center py-12">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-primary/20">
                                    <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">ML Engine Processing...</h2>
                            <div className="space-y-3 mt-6 text-sm font-medium text-slate-500">
                                <p className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" /> Analyzing regional historical data...</p>
                                <p className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" /> Evaluating soil & seasonal modifiers...</p>
                                <p className="flex items-center gap-2 animate-pulse text-blue-600"><RefreshCw className="w-4 h-4 animate-spin" /> Grounding insights with Knowledge Engine...</p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Workspace */}
                    {step === 4 && plan && (
                        <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
                            
                            {/* Dashboard Stats */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                               <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                 {/* Left: Original AI Prediction */}
                                 <div className="flex-1 w-full text-center md:text-left">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold mb-4 uppercase tracking-wide">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> ML Prediction Successful
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Estimated Yield (ML Model Output)</p>
                                    <p className="font-display text-5xl md:text-6xl font-bold text-slate-800 dark:text-slate-100 flex items-baseline justify-center md:justify-start gap-2">
                                      {plan.prediction.yieldPerHectare} <span className="text-2xl text-slate-400 font-normal">t/ha</span>
                                    </p>
                                    
                                    <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
                                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-100 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Yield</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{plan.prediction.totalYield} Tonnes</p>
                                      </div>
                                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-100 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
                                        <p className={`text-sm font-semibold ${plan.prediction.category === 'High Yield' ? 'text-green-600' : plan.prediction.category === 'Low Yield' ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'}`}>{plan.prediction.category}</p>
                                      </div>
                                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-100 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Confidence</p>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{plan.prediction.confidence}</p>
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
                            </div>

                            {/* Main Content Layout */}
                            <div className="grid md:grid-cols-3 gap-6">
                                
                                {/* Left Col - Explanations and Guidance */}
                                <div className="md:col-span-2 space-y-6">
                                    {plan.recommendations.map(rec => (
                                        <div key={rec.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                    <Sprout className="w-5 h-5 text-green-500"/> {rec.title}
                                                </h3>
                                            </div>

                                            {/* AI Explanation Block */}
                                            {rec.aiExplanation && rec.aiExplanation.grounded && (
                                              <div className="mt-4 mb-5">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                  <PlayCircle className="w-3 h-3 text-primary" /> AI Explanation (Groq)
                                                </p>
                                                <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                  {rec.aiExplanation.text}
                                                </div>
                                              </div>
                                            )}

                                            {/* Deterministic Actionable Insights */}
                                            {rec.actionableInsights && rec.actionableInsights.length > 0 && (
                                                <div className="mt-4 mb-5">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Improvement Opportunities</p>
                                                    <ul className="space-y-2">
                                                        {rec.actionableInsights.map((insight, idx) => (
                                                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 text-[10px] mt-0.5">{idx + 1}</div>
                                                                <span className="pt-0.5">{insight}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Knowledge Panel */}
                                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Supporting Documents</p>
                                                {rec.knowledge && rec.knowledge.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {rec.knowledge.map((doc, idx) => (
                                                            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                                                <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-2 line-clamp-3">"{doc.content}"</p>
                                                                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                                                    <span className="text-primary">{doc.source}</span>
                                                                    <span>{doc.title} {doc.page ? `• Page ${doc.page}` : ''}</span>
                                                                </div>
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
                                    ))}
                                </div>

                                {/* Right Col - Yield Insights */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Yield Insights</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Productivity Rating</p>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{plan.analysis.productivityRating}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Water Dependency</p>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{plan.analysis.waterDependency}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Weather Sensitivity</p>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{plan.analysis.weatherSensitivity}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Major Factors</p>
                                                <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
                                                    {plan.analysis.majorFactors.map((f, i) => (
                                                        <li key={i}>{f}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={() => setStep(1)} className="w-full btn-secondary">
                                        Modify Inputs
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
