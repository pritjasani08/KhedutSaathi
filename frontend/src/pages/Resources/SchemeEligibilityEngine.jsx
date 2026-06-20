import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Calculator, IndianRupee, Landmark, ArrowLeft, Loader2, AlertCircle, User } from 'lucide-react';
import SchemeCard from '../../components/shared/SchemeCard';
import { useAuth } from '../../context/AuthContext';

export default function SchemeEligibilityEngine() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [fullProfile, setFullProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const [formData, setFormData] = useState({
    state: 'Gujarat',
    age: '',
    gender: 'Male',
    landSize: '',
    farmerCategory: 'Small & Marginal',
    primaryCrop: 'Wheat',
    irrigationType: 'Tube Well'
  });

  useEffect(() => {
    if (user && user.user_type === 'farmer') {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          setFullProfile(p);
          setFormData({
            state: p.state || 'Gujarat',
            age: p.age || '',
            gender: p.gender || 'Male',
            landSize: p.farm_size || '',
            farmerCategory: p.farmer_category || 'Small & Marginal',
            primaryCrop: p.primary_crop || 'Wheat',
            irrigationType: p.irrigation_type || 'Tube Well'
          });
          if (p.age && p.farm_size) {
            setStep(0); // Show one-click screen
          }
        }
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStep(3); // Loading step

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10),
        landSize: parseFloat(formData.landSize)
      };

      const res = await fetch('http://localhost:5001/api/schemes/eligible', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to match schemes');
      
      setResults(data);
      setStep(4); // Results step

      // Phase 3: Save results back to profile
      if (user && fullProfile) {
        try {
          const token = localStorage.getItem('token');
          await fetch('http://localhost:5001/api/profile', {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              ...fullProfile,
              scheme_results: data
            })
          });
        } catch (saveErr) {
          console.error("Failed saving scheme results to profile", saveErr);
        }
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
      setStep(2); // Go back to last form step
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="bg-surface rounded-2xl shadow-card p-6 md:p-8 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-heading flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            Scheme Eligibility Engine
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Find government schemes tailored to your profile.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-heading">Your Profile is Ready!</h3>
            <p className="text-slate-500 mt-2 mb-8 max-w-md">We found your farm profile. You can check your eligibility instantly without filling out any forms.</p>
            
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="btn-secondary">
                Edit Details Manually
              </button>
              <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
                Check My Eligibility <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-lg font-semibold text-heading mb-4">Step 1: Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State</label>
                <select name="state" value={formData.state} onChange={handleChange} className="input-field w-full">
                  <option value="Gujarat">Gujarat</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 35" className="input-field w-full" min="18" max="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input-field w-full">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={handleNext} disabled={!formData.age} className="btn-primary flex items-center gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h3 className="text-lg font-semibold text-heading mb-4">Step 2: Farm Details</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm border border-red-100">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Land Size (Hectares)</label>
                <input type="number" step="0.1" name="landSize" value={formData.landSize} onChange={handleChange} placeholder="e.g. 1.5" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Farmer Category</label>
                <select name="farmerCategory" value={formData.farmerCategory} onChange={handleChange} className="input-field w-full">
                  <option value="Small & Marginal">Small & Marginal (&lt; 2 Ha)</option>
                  <option value="Large">Large (&gt; 2 Ha)</option>
                  <option value="SC/ST">SC/ST</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Primary Crop</label>
                <select name="primaryCrop" value={formData.primaryCrop} onChange={handleChange} className="input-field w-full">
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Irrigation Type</label>
                <select name="irrigationType" value={formData.irrigationType} onChange={handleChange} className="input-field w-full">
                  <option value="Tube Well">Tube Well</option>
                  <option value="Canal">Canal</option>
                  <option value="Drip">Drip / Sprinkler</option>
                  <option value="Rainfed">Rainfed</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={handleBack} className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-medium transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={handleSubmit} disabled={!formData.landSize || loading} className="btn-primary flex items-center gap-2">
                Check Eligibility <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-16 flex flex-col items-center text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-bold text-heading">Analyzing Schemes</h3>
            <p className="text-slate-500 mt-2">Matching your profile against national and state databases...</p>
          </motion.div>
        )}

        {step === 4 && results && (
          <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-8 shadow-green relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-20">
                <Landmark className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-medium text-green-100 mb-1">Total Potential Benefits</h3>
                <div className="text-4xl font-display font-bold flex items-center gap-1 mb-2">
                  <IndianRupee className="w-8 h-8" />
                  {results.totalBenefit.toLocaleString('en-IN')}
                </div>
                <p className="text-green-50 text-sm">Based on {results.data.length} eligible schemes found for your profile.</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-heading mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Your Eligible Schemes</h3>
            
            {results.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.data.map((scheme, idx) => (
                  <div key={scheme.id || idx} className="relative group">
                    <SchemeCard {...scheme} index={idx} />
                    {scheme.matchReason && (
                      <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                        ✓ {scheme.matchReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-slate-500">No specific schemes matched your profile right now. Try updating your criteria.</p>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button onClick={resetForm} className="btn-secondary">
                Recalculate Eligibility
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
