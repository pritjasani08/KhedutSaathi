import React, { useState } from 'react';
import { FileCheck, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RequiredDocuments({ eligibilityData, onComplete, onBack }) {
  const { scheme } = eligibilityData.eligibilityResult;
  const docs = scheme.required_documents || [];
  
  const [checkedDocs, setCheckedDocs] = useState({});

  const handleToggle = (doc) => {
    setCheckedDocs(prev => ({
      ...prev,
      [doc]: !prev[doc]
    }));
  };

  const handleProceed = () => {
    const uploadedDocs = docs.filter(doc => checkedDocs[doc]);
    onComplete({ uploadedDocs, totalRequired: docs.length });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="font-display font-bold text-2xl mb-3 text-heading">Required Documents</h2>
        <p className="text-slate-500">Please prepare and check off the documents required for <span className="font-bold text-slate-700 dark:text-slate-300">{scheme.name}</span> claim processing.</p>
      </div>

      <div className="glass-card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary/20">
           <ShieldCheck className="w-5 h-5 text-primary" />
           <p className="text-sm font-medium text-primary-800 dark:text-primary-300">
             Checking off these documents helps calculate your Claim Readiness Score.
           </p>
        </div>

        <div className="space-y-4">
          {docs.map((doc, idx) => (
            <label 
              key={idx} 
              className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all cursor-pointer select-none
                ${checkedDocs[doc] ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-500' : 'bg-slate-50 border-transparent hover:border-slate-200 dark:bg-slate-900/50 dark:hover:border-slate-700'}
              `}
            >
              <div className="pt-0.5">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                  checked={checkedDocs[doc] || false}
                  onChange={() => handleToggle(doc)}
                />
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-base mb-1 ${checkedDocs[doc] ? 'text-green-800 dark:text-green-300' : 'text-heading'}`}>{doc}</h4>
                <p className="text-sm text-slate-500">Ensure this document is clear, legible, and properly signed if required.</p>
              </div>
              {checkedDocs[doc] && (
                <FileCheck className="w-6 h-6 text-green-500 shrink-0" />
              )}
            </label>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <button onClick={onBack} className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Eligibility
          </button>
          <button onClick={handleProceed} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            Generate Readiness Score <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
