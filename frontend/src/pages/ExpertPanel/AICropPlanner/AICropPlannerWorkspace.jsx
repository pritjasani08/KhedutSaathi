import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, Sprout, CloudSun, Target, ArrowRight, ArrowLeft, 
    CheckCircle2, AlertCircle, Droplets, Ruler, Leaf, RefreshCw, ShoppingBag
} from 'lucide-react';
import { aiPlannerAPI } from '../../../services/api';
import { stateDistrictMap } from '../../../data/stateDistrictMap';

const soilTypes = [
  'Alluvial Soil', 'Black Soil', 'Clay Soil', 'Cold Desert Soil', 
  'Forest Soil', 'Laterite Soil', 'Loamy Soil', 'Mountain Soil', 
  'Red Soil', 'Sandy Soil', 'Silty Soil'
];
const waterOptions = ['High', 'Medium', 'Low'];
const seasons = ['Kharif', 'Rabi', 'Summer', 'Whole Year'];
const irrigationOptions = ['Rainfed', 'Canal', 'Tube Well', 'Drip', 'Sprinkler'];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export default function AICropPlannerWorkspace() {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const [form, setForm] = useState({
        state: '', district: '', soilType: '', farmArea: '',
        season: '', waterAvailability: '', irrigation: '', previousCrop: '',
        cropDuration: 4
    });

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        setStep(3); // Loading step
        setLoading(true);
        setError(null);
        try {
            const res = await aiPlannerAPI.generate(form);
            setResult(res);
            setStep(4);
        } catch (err) {
            setError(err.customMessage || err.message || "Failed to generate AI planner synthesis.");
            setStep(2); // Go back to form
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = form.state && form.district && form.soilType && form.farmArea;
    const isStep2Valid = form.season && form.waterAvailability && form.irrigation && form.previousCrop;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[600px]">
            {/* Header Steps */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 relative z-10 bg-slate-50/50 dark:bg-slate-900/50">
                {[
                    { num: 1, icon: MapPin, title: "Farm Info" },
                    { num: 2, icon: CloudSun, title: "Seasonal" },
                    { num: 3, icon: Target, title: "AI Analysis" },
                    { num: 4, icon: CheckCircle2, title: "Action Plan" }
                ].map((s) => (
                    <div key={s.num} className={`flex-1 p-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${step === s.num ? 'border-primary text-primary bg-primary/5' : step > s.num ? 'border-green-500 text-green-500' : 'border-transparent text-slate-400'}`}>
                        <s.icon className="w-5 h-5" />
                        <span className="font-semibold text-sm hidden sm:block">{s.title}</span>
                    </div>
                ))}
            </div>

            <div className="p-6 md:p-10 relative z-10">
                <AnimatePresence mode="wait">
                    {/* STEP 1: Farm Information */}
                    {step === 1 && (
                        <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6 max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Tell us about your farm</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">State</label>
                                    <select name="state" value={form.state} onChange={(e) => { handleChange(e); setForm(f => ({ ...f, district: '' })); }} className="select-field w-full">
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
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Farm Area (Hectares)</label>
                                    <div className="relative">
                                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="number" name="farmArea" value={form.farmArea} onChange={handleChange} placeholder="e.g. 5" className="input-field pl-10 w-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6">
                                <button onClick={handleNext} disabled={!isStep1Valid} className="btn-primary flex items-center gap-2">
                                    Next Step <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Seasonal Conditions */}
                    {step === 2 && (
                        <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="space-y-6 max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">Seasonal Conditions</h2>
                            
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
                                    <AlertCircle className="w-5 h-5" /> {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Season</label>
                                    <select name="season" value={form.season} onChange={handleChange} className="select-field w-full">
                                        <option value="">Select Season</option>
                                        {seasons.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Water Availability</label>
                                    <select name="waterAvailability" value={form.waterAvailability} onChange={handleChange} className="select-field w-full">
                                        <option value="">Select Water Level</option>
                                        {waterOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Irrigation Method</label>
                                    <select name="irrigation" value={form.irrigation} onChange={handleChange} className="select-field w-full">
                                        <option value="">Select Irrigation</option>
                                        {irrigationOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Previous Crop (Optional)</label>
                                    <div className="relative">
                                        <Leaf className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input type="text" name="previousCrop" value={form.previousCrop} onChange={handleChange} placeholder="e.g. Wheat" className="input-field pl-10 w-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-6">
                                <button onClick={handlePrev} className="btn-secondary flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={handleSubmit} disabled={!isStep2Valid || loading} className="btn-primary flex items-center gap-2">
                                    Analyze with AI <Target className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Loading / AI Analysis */}
                    {step === 3 && (
                        <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="flex flex-col items-center justify-center py-12">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-primary/20">
                                    <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">AI is analyzing your farm...</h2>
                            <div className="space-y-3 mt-6 text-sm font-medium text-slate-500">
                                <p className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" /> Fetching Crop Recommendations...</p>
                                <p className="flex items-center gap-2 text-green-600"><CheckCircle2 className="w-4 h-4" /> Predicting Expected Yield...</p>
                                <p className="flex items-center gap-2 animate-pulse text-blue-600"><RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Market & Weather context...</p>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: AI Recommendation */}
                    {step === 4 && result && (
                        <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
                            
                            {/* Summary Card */}
                            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center text-5xl shrink-0 z-10">
                                    🌱
                                </div>
                                <div className="flex-1 z-10 text-center md:text-left">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 uppercase tracking-wide">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Crop Selection
                                    </div>
                                    <h2 className="text-4xl font-display font-bold text-slate-800 dark:text-slate-100 mb-2">{result.bestCrop}</h2>
                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium">
                                        <div className="flex items-center gap-1 text-slate-600"><Target className="w-4 h-4 text-blue-500"/> Expected Yield: {result.expectedYield ? `${result.expectedYield} t/ha` : 'N/A'}</div>
                                        <div className="flex items-center gap-1 text-slate-600"><AlertCircle className={`w-4 h-4 ${result.riskLevel === 'HIGH' ? 'text-red-500' : result.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-green-500'}`}/> Risk: {result.riskLevel}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Two Column Layout */}
                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Left Col - Explanation & Action Plan */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                            <Sprout className="w-5 h-5 text-green-500"/> Why this crop?
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                            {result.explanation}
                                        </p>
                                        
                                        {result.personalization_factors && result.personalization_factors.length > 0 && (
                                            <div className="mt-4 bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                                                <h4 className="flex items-center gap-2 font-bold text-indigo-800 dark:text-indigo-400 mb-2 text-sm">
                                                    Why this is personalized for you
                                                </h4>
                                                <ul className="space-y-1.5">
                                                    {result.personalization_factors.map((factor, idx) => (
                                                        <li key={idx} className="text-sm text-indigo-700 dark:text-indigo-300">
                                                            {factor}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500"/> Recommended Action Plan
                                        </h3>
                                        <ul className="space-y-3">
                                            {result.actionPlan?.map((plan, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 text-xs mt-0.5">{i+1}</div>
                                                    <span className="pt-0.5">{plan}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Right Col - Alternatives & Sources */}
                                <div className="space-y-6">
                                    {result.alternatives && result.alternatives.length > 0 && (
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wide">Alternatives</h4>
                                            <div className="space-y-2">
                                                {result.alternatives.map((alt, i) => (
                                                    <div key={i} className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg text-sm font-medium shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                        {alt}
                                                        <span className="text-xs text-slate-400">#{i+2}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Data Sources */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wide">Data Sources</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.sources?.map((src, i) => (
                                                <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                    {src.name.toLowerCase().includes('weather') ? <CloudSun className="w-3 h-3 text-blue-500" /> : <ShoppingBag className="w-3 h-3 text-amber-500" />}
                                                    {src.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => setStep(1)} className="w-full btn-secondary">
                                        Start Over
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
