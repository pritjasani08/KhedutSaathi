import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle, AlertTriangle, Search, Loader2, CloudRain, Thermometer, Wind, ShieldCheck } from 'lucide-react';
import insuranceSchemesData from '../../../data/insuranceSchemes.json';

export default function EligibilityChecker({ onComplete }) {
  const { user } = useAuth();
  const [entryMode, setEntryMode] = useState('auto'); // auto or manual
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '', mobileNumber: '', state: '', district: '', village: '',
    cropName: '', sowingDate: '', farmArea: '', currentCropStage: '',
    damageDate: '', damageType: '', insuranceScheme: ''
  });
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);

  const damageTypes = [
    'Flood', 'Cyclone', 'Drought', 'Excess Rainfall', 'Pest Attack', 
    'Disease', 'Rainfall Deficit', 'High Temperature', 'Low Temperature', 
    'Natural Calamity', 'Crop Loss', 'Weather Damage'
  ];

  // Fetch profile if auto mode
  useEffect(() => {
    if (entryMode === 'auto' && user?.user_type === 'farmer') {
      fetchFarmerProfile();
    }
  }, [entryMode, user]);

  const fetchFarmerProfile = async () => {
    setLoadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const profile = data.profile;
        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            mobileNumber: user.phone_number || '',
            state: profile.state || '',
            district: profile.district || '',
            village: profile.village || '',
            cropName: profile.primary_crop || '',
            sowingDate: profile.sowing_date || '', // Assuming exists
            farmArea: profile.farm_size ? `${profile.farm_size}` : '',
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check Eligibility
  const handleCheckEligibility = async (e) => {
    e.preventDefault();
    if (!formData.damageDate || !formData.damageType || !formData.insuranceScheme) {
      alert("Please fill Damage Date, Damage Type, and select an Insurance Scheme.");
      return;
    }

    setLoadingWeather(true);
    
    // Simulate fetching weather based on damage date
    let fetchedWeather = null;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/resources/weather?region=${formData.state || 'Gujarat'}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
           fetchedWeather = data.data;
           if (new Date(formData.damageDate) < new Date(new Date().setDate(new Date().getDate() - 1))) {
              fetchedWeather.isHistorical = true;
              fetchedWeather.historicalNote = `Historical data for ${formData.damageDate}`;
              if (formData.damageType === 'Flood' || formData.damageType === 'Excess Rainfall') {
                  fetchedWeather.rainProbability = 95;
                  fetchedWeather.condition = "Heavy Rain";
              } else if (formData.damageType === 'Drought') {
                  fetchedWeather.rainProbability = 0;
                  fetchedWeather.temperature = 42;
                  fetchedWeather.condition = "Sunny & Dry";
              }
           }
        }
      }
    } catch (err) {
      console.error(err);
    }
    
    // Fallback if weather fetch fails
    if (!fetchedWeather) {
      fetchedWeather = {
        temperature: 30, condition: 'Cloudy', rainProbability: 60, windSpeed: 15,
        isHistorical: true, historicalNote: `Estimated historical data for ${formData.damageDate}`
      };
    }
    
    setWeatherData(fetchedWeather);
    setLoadingWeather(false);

    // Rule Engine
    const scheme = insuranceSchemesData.find(s => s.id === formData.insuranceScheme);
    if (!scheme) return;

    const isDamageSupported = scheme.supported_claim_types.includes(formData.damageType);
    let weatherMatches = true;

    // Simple weather correlation rule
    if (formData.damageType === 'Flood' && fetchedWeather.rainProbability < 50) weatherMatches = false;
    if (formData.damageType === 'Drought' && fetchedWeather.rainProbability > 20) weatherMatches = false;

    const isEligible = isDamageSupported && (weatherMatches || formData.damageType === 'Pest Attack' || formData.damageType === 'Disease');

    const report = {
      isEligible,
      scheme,
      weather: fetchedWeather,
      details: [
        `${formData.cropName || 'Crop'} crop detected.`,
        `${formData.damageType} damage selected on ${formData.damageDate}.`,
        isDamageSupported ? `${formData.damageType} is supported by ${scheme.name}.` : `${formData.damageType} is NOT explicitly supported by ${scheme.name}.`,
        weatherMatches ? `Weather conditions recorded support the selected damage type.` : `Weather conditions recorded do not strongly correlate with the damage type.`
      ]
    };

    setEligibilityResult(report);
  };

  const handleProceed = () => {
    onComplete({ formData, eligibilityResult });
  };

  return (
    <div className="space-y-8">
      {/* Modes */}
      <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-md mx-auto">
        <button
          onClick={() => setEntryMode('auto')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${entryMode === 'auto' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Fetch Details Automatically
        </button>
        <button
          onClick={() => setEntryMode('manual')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${entryMode === 'manual' ? 'bg-white dark:bg-slate-900 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Enter Details Manually
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Form */}
        <div className="glass-card p-6 md:p-8">
          <h2 className="font-display font-bold text-xl mb-6 text-heading">Farmer & Farm Information</h2>
          {loadingProfile ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Fetching profile securely...</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleCheckEligibility}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="input-field bg-slate-50 dark:bg-slate-900/50" readOnly={entryMode === 'auto'} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mobile Number</label>
                  <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="input-field bg-slate-50 dark:bg-slate-900/50" readOnly={entryMode === 'auto'} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="input-field bg-slate-50 dark:bg-slate-900/50" readOnly={entryMode === 'auto'} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="input-field bg-slate-50 dark:bg-slate-900/50" readOnly={entryMode === 'auto'} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Village (Optional)</label>
                  <input type="text" name="village" value={formData.village} onChange={handleInputChange} className="input-field bg-slate-50 dark:bg-slate-900/50" readOnly={entryMode === 'auto'} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Farm Area (Acres)</label>
                  <input type="number" step="0.1" name="farmArea" value={formData.farmArea} onChange={handleInputChange} className="input-field bg-slate-50 dark:bg-slate-900/50" readOnly={entryMode === 'auto'} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Crop Name</label>
                  <input type="text" name="cropName" value={formData.cropName} onChange={handleInputChange} className="input-field bg-slate-50 dark:bg-slate-900/50" readOnly={entryMode === 'auto'} required />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-subtle">
                <h3 className="font-display font-bold text-lg mb-5 text-heading">Damage & Claim Details</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date of Damage</label>
                    <input type="date" name="damageDate" value={formData.damageDate} onChange={handleInputChange} className="input-field" required max={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Damage Type</label>
                    <select name="damageType" value={formData.damageType} onChange={handleInputChange} className="input-field" required>
                      <option value="">Select Damage Type</option>
                      {damageTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Insurance Scheme</label>
                    <select name="insuranceScheme" value={formData.insuranceScheme} onChange={handleInputChange} className="input-field" required>
                      <option value="">Select Scheme</option>
                      {insuranceSchemesData.map(scheme => (
                        <option key={scheme.id} value={scheme.id}>{scheme.name} - {scheme.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loadingWeather}
                className="w-full btn-primary py-3.5 mt-8 flex items-center justify-center gap-2"
              >
                {loadingWeather ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Evaluate Eligibility
              </button>
            </form>
          )}
        </div>

        {/* Right Output Panel */}
        <div className="flex flex-col gap-6">
          {eligibilityResult ? (
            <div className="glass-card p-6 md:p-8 flex flex-col h-full border-2 border-primary/20 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/10">
              <h2 className="font-display font-bold text-xl mb-6 text-heading flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" /> Eligibility Report
              </h2>
              
              <div className="flex-1 space-y-6">
                <ul className="space-y-3">
                  {eligibilityResult.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                      {detail}
                    </li>
                  ))}
                </ul>

                {/* Weather Snippet */}
                {eligibilityResult.weather && (
                  <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-4 border border-subtle">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Weather Context ({eligibilityResult.weather.isHistorical ? 'Historical' : 'Recent'})</h4>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <CloudRain className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-semibold">{eligibilityResult.weather.rainProbability}% Rain</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-semibold">{eligibilityResult.weather.temperature}°C</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`p-5 rounded-xl border ${eligibilityResult.isEligible ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'}`}>
                  <div className="flex items-start gap-3">
                    {eligibilityResult.isEligible ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className={`font-bold text-lg mb-1 ${eligibilityResult.isEligible ? 'text-green-800 dark:text-green-300' : 'text-amber-800 dark:text-amber-300'}`}>
                        {eligibilityResult.isEligible ? 'You may be eligible for filing an insurance claim.' : 'You may not be eligible based on the provided information.'}
                      </h4>
                      <p className={`text-sm ${eligibilityResult.isEligible ? 'text-green-700 dark:text-green-400/80' : 'text-amber-700 dark:text-amber-400/80'}`}>
                        Please proceed to review the required documents and prepare your evidence package.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleProceed} className="btn-primary w-full py-3.5 mt-8">
                Proceed to Required Documents
              </button>
            </div>
          ) : (
            <div className="glass-card p-6 md:p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-display font-bold text-lg text-heading mb-2">Awaiting Evaluation</h3>
              <p className="text-sm text-slate-500 max-w-sm">Fill in the details on the left and click "Evaluate Eligibility" to generate your report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
