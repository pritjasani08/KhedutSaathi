import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, Sprout, Target, ArrowRight, ArrowLeft, 
    CheckCircle2, AlertCircle, Droplets, Ruler, Leaf, RefreshCw,
    PlayCircle
} from 'lucide-react';
import { cropPlannerAPI } from '../../../services/api';
import { stateDistrictMap } from '../../../data/stateDistrictMap';
import { useFarmContext } from '../../../context/FarmContext';
import { useCrossModuleContext } from '../../../context/CrossModuleContext';

const soilTypes = ['Alluvial Soil', 'Black Soil', 'Clay Soil', 'Cold Desert Soil', 'Forest Soil', 'Laterite Soil', 'Loamy Soil', 'Mountain Soil', 'Red Soil', 'Sandy Soil', 'Silty Soil', 'Sandy Loam', 'Clay Loam'];
const waterOptions = ['High', 'Medium', 'Low'];
const seasons = ['Kharif', 'Rabi', 'Summer', 'Whole Year'];
const durationOptions = ['Short', 'Medium', 'Long'];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export default function AICropPlannerWorkspace() {
    const { t } = useTranslation();
    const { farmProfile, updateFarmContext } = useFarmContext();
    const { publishModuleOutput } = useCrossModuleContext();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [plan, setPlan] = useState(null);

    // Local form state initialized from global Farm Context
    const [form, setForm] = useState({
        state: farmProfile.state || '', 
        district: farmProfile.district || '', 
        soilType: farmProfile.soilType || '', 
        season: farmProfile.season || '',
        farmArea: farmProfile.farmArea || '', 
        waterAvailability: farmProfile.waterAvailability || '', 
        preferredDuration: farmProfile.cropDuration || ''
    });

    // Update global Farm Context whenever local form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Map local names to Farm Context names where they differ
        const contextUpdate = { [name]: value };
        if (name === 'preferredDuration') contextUpdate.cropDuration = value;
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
            const res = await cropPlannerAPI.getPlan(form);
            setPlan(res);
            
            // Auto-select the top recommended crop in the global context
            if (res.recommendations && res.recommendations.length > 0) {
                const bestCrop = res.recommendations[0].crop;
                updateFarmContext({ selectedCrop: bestCrop });
            }

            // Publish output to Cross Module Intelligence layer
            publishModuleOutput('CropPlanner', res, form);

            setStep(4);
        } catch (err) {
            setError(err.customMessage || err.message || "Failed to generate Crop Plan.");
            setStep(2); // Go back to form
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = form.state && form.district && form.soilType && form.season;
    const isStep2Valid = form.farmArea && form.waterAvailability && form.preferredDuration;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[600px]">
            {/* Header Steps */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 relative z-10 bg-slate-50/50 dark:bg-slate-900/50">
                {[
                    { num: 1, icon: MapPin, title: "Location" },
                    { num: 2, icon: Droplets, title: "Farm Details" },
                    { num: 3, icon: Target, title: "Analysis" },
                    { num: 4, icon: CheckCircle2, title: "Workspace" }
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

                    {/* STEP 2: Farm Details */}
                    {step === 2 && (
                        <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6 max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Farm & Water Availability</h2>
                            
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
                                    <AlertCircle className="w-5 h-5" /> {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Farm Area (Hectares)</label>
                                    <div className="relative">
                                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="number" name="farmArea" value={form.farmArea} onChange={handleChange} placeholder="e.g. 5" className="input-field pl-10 w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Water Availability</label>
                                    <select name="waterAvailability" value={form.waterAvailability} onChange={handleChange} className="select-field w-full">
                                        <option value="">Select Availability</option>
                                        {waterOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Preferred Duration</label>
                                    <select name="preferredDuration" value={form.preferredDuration} onChange={handleChange} className="select-field w-full">
                                        <option value="">Select Duration</option>
                                        {durationOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-between pt-6">
                                <button onClick={handlePrev} className="btn-secondary flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={handleSubmit} disabled={!isStep2Valid || loading} className="btn-primary flex items-center gap-2">
                                    Generate Plan <Target className="w-4 h-4" />
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
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Generating Deterministic Plan...</h2>
                            <div className="space-y-3 mt-6 text-sm font-medium text-slate-500">
                                <p className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" /> Calculating Suitability Scores...</p>
                                <p className="flex items-center gap-2 animate-pulse text-blue-600"><RefreshCw className="w-4 h-4 animate-spin" /> Retrieving Agricultural Knowledge...</p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: Workspace */}
                    {step === 4 && plan && (
                        <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
                            
                            {/* Dashboard Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                <div className="glass-card p-5 border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Top Recommendation</p>
                                    <p className="font-display font-bold text-2xl text-primary">{plan.recommendations[0].crop}</p>
                                </div>
                                <div className="glass-card p-5 border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Suitability Score</p>
                                    <p className="font-display font-bold text-2xl text-slate-800 dark:text-slate-200">{plan.recommendations[0].score}/100</p>
                                </div>
                                <div className="glass-card p-5 border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Water Req.</p>
                                    <p className="font-display font-bold text-2xl text-slate-800 dark:text-slate-200">{plan.recommendations[0].waterRequirement}</p>
                                </div>
                                <div className="glass-card p-5 border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Risk Level</p>
                                    <p className={`font-display font-bold text-2xl ${plan.environment?.risk === 'High' ? 'text-red-500' : 'text-green-500'}`}>{plan.environment?.risk}</p>
                                </div>
                            </div>
                            
                            {/* ML Validation */}
                            {plan.mlValidation ? (
                                <div className={`border rounded-2xl p-6 ${plan.mlValidation.agreement ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Target className={`w-5 h-5 ${plan.mlValidation.agreement ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Machine Learning Validation</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm border-b border-slate-200/50 dark:border-slate-700/50 pb-2">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">Deterministic Engine</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{plan.mlValidation.topDeterministicCrop}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 dark:text-slate-400 font-medium">ML Model Prediction</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{plan.mlValidation.topMlCrop}</span>
                                            </div>
                                            <div className="pt-3 mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic border-t border-slate-200/50 dark:border-slate-700/50">
                                                {plan.mlValidation.explanation}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/60 dark:bg-slate-900/40 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ML Ranking</p>
                                            <div className="space-y-2">
                                                {plan.mlValidation.ranking.map((r, i) => (
                                                    <div key={i} className="flex justify-start gap-2 text-sm">
                                                        <span className="font-medium text-slate-900 dark:text-slate-100">{i + 1})</span>
                                                        <span className="text-slate-700 dark:text-slate-300">{r.crop}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-500 text-sm">
                                    <AlertCircle className="w-4 h-4" /> ML Validation temporarily unavailable. Rendering pure deterministic plan.
                                </div>
                            )}

                            {/* Main Content Layout */}
                            <div className="grid md:grid-cols-3 gap-6">
                                
                                {/* Left Col - Recommendations & AI Explanation */}
                                <div className="md:col-span-2 space-y-6">
                                    {plan.recommendations.map(rec => (
                                        <div key={rec.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                    <Sprout className="w-5 h-5 text-green-500"/> {rec.crop}
                                                </h3>
                                                <span className="text-sm font-semibold px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{rec.score} / 100</span>
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
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Implementation Guide</p>
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

                                {/* Right Col - Timeline */}
                                <div className="space-y-6">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wide">Expected Timeline</h4>
                                        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-6">
                                            {plan.timeline?.map((stage, idx) => (
                                                <div key={idx} className="relative pl-6">
                                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-primary"></div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{stage.stage}</p>
                                                    <p className="text-xs text-slate-500 mb-1">Day {stage.startDay} to {stage.endDay}</p>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400">{stage.description}</p>
                                                </div>
                                            ))}
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
