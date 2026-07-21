import React, { useMemo } from 'react';
import { PackageCheck, ArrowLeft, Download, AlertCircle, FileText, MapPin, User, CloudRain, ShieldCheck } from 'lucide-react';

export default function EvidencePackage({ eligibilityData, readinessData, onBack }) {
  const { formData, eligibilityResult } = eligibilityData;
  const { uploadedDocs, totalRequired } = readinessData;
  const { scheme, weather, isEligible } = eligibilityResult;

  // Calculate score (Out of 100)
  const score = useMemo(() => {
    let currentScore = 0;
    let maxScore = 100;
    
    // Base form data weights (40 points)
    if (formData.fullName && formData.mobileNumber) currentScore += 10;
    if (formData.state && formData.district) currentScore += 10;
    if (formData.cropName && formData.farmArea) currentScore += 10;
    if (formData.damageDate && formData.damageType) currentScore += 10;

    // Documents weight (60 points)
    if (totalRequired > 0) {
      currentScore += Math.round((uploadedDocs.length / totalRequired) * 60);
    } else {
      currentScore += 60; // if no docs required (unlikely)
    }

    return Math.min(currentScore, maxScore);
  }, [formData, uploadedDocs, totalRequired]);

  // Determine Missing Info
  const missingDocs = scheme.required_documents?.filter(doc => !uploadedDocs.includes(doc)) || [];
  
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = () => {
    if (score >= 80) return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
    if (score >= 50) return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
    return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  };

  const handleDownload = () => {
    alert("In a real environment, this would generate a PDF containing all the entered information and placeholder for attachments to be submitted to the insurance provider.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Banner - Score */}
      <div className={`glass-card p-6 md:p-8 border-2 ${getScoreBg()} flex flex-col md:flex-row items-center justify-between gap-6`}>
        <div className="flex-1 text-center md:text-left">
          <h2 className="font-display font-bold text-2xl text-heading mb-2">Claim Readiness Score</h2>
          <p className="text-slate-500 max-w-lg">
            This score indicates how complete your application is. A score above 80% is recommended before submission.
          </p>
        </div>
        <div className="flex items-center justify-center shrink-0 w-32 h-32 rounded-full bg-white dark:bg-slate-900 shadow-sm border-4 border-slate-100 dark:border-slate-800 relative">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="45" fill="none" 
              className={`stroke-current ${getScoreColor()}`} 
              strokeWidth="8" 
              strokeDasharray={`${(score / 100) * 283} 283`}
              strokeLinecap="round"
            />
          </svg>
          <span className={`font-display font-bold text-4xl ${getScoreColor()}`}>{score}%</span>
        </div>
      </div>

      {missingDocs.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-xl p-5 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Missing Information</h4>
            <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-400 space-y-1">
              {missingDocs.map((doc, idx) => <li key={idx}>{doc}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Summary Package */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-subtle bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-heading flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-primary" /> Evidence Package Summary
          </h3>
          <span className={`badge ${isEligible ? 'badge-success' : 'badge-error'}`}>
            {isEligible ? 'Eligible' : 'Not Eligible'}
          </span>
        </div>
        
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2"><User className="w-4 h-4"/> Farmer Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500 block mb-1">Name</span> <span className="font-semibold text-heading">{formData.fullName || '-'}</span></div>
                <div><span className="text-slate-500 block mb-1">Phone</span> <span className="font-semibold text-heading">{formData.mobileNumber || '-'}</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4"/> Location & Farm</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500 block mb-1">State & Dist</span> <span className="font-semibold text-heading">{formData.state}, {formData.district}</span></div>
                <div><span className="text-slate-500 block mb-1">Crop & Area</span> <span className="font-semibold text-heading">{formData.cropName} ({formData.farmArea} Ac)</span></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Damage Incident</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500 block mb-1">Date</span> <span className="font-semibold text-heading">{formData.damageDate}</span></div>
                <div><span className="text-slate-500 block mb-1">Type</span> <span className="font-semibold text-heading">{formData.damageType}</span></div>
                <div className="col-span-2"><span className="text-slate-500 block mb-1">Scheme Applied</span> <span className="font-semibold text-primary">{scheme.name}</span></div>
              </div>
            </div>

            {weather && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2"><CloudRain className="w-4 h-4"/> Weather Data</h4>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg text-sm border border-subtle">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{weather.condition}, {weather.temperature}°C, {weather.rainProbability}% Rain Prob.</span>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 pt-6 border-t border-subtle">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2"><FileText className="w-4 h-4"/> Uploaded Documents</h4>
            {uploadedDocs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {uploadedDocs.map((doc, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 text-xs font-semibold border border-green-200 dark:border-green-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> {doc}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No documents checked.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button onClick={onBack} className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Documents
        </button>
        <button onClick={handleDownload} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Export Package
        </button>
      </div>

    </div>
  );
}
