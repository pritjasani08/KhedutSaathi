import React, { useState } from 'react';
import { ShieldCheck, FileText, Activity, PackageCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { PageLayout, PageHeader, PageContent } from '../../components/shared/PageLayout.jsx';
import EligibilityChecker from './components/EligibilityChecker';
import RequiredDocuments from './components/RequiredDocuments';
import EvidencePackage from './components/EvidencePackage';

export default function KhedutSuraksha() {
  const [currentStep, setCurrentStep] = useState(1);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [readinessData, setReadinessData] = useState(null);

  const steps = [
    { id: 1, title: 'Eligibility Checker', icon: ShieldCheck },
    { id: 2, title: 'Required Documents', icon: FileText },
    { id: 3, title: 'Evidence Package', icon: PackageCheck }
  ];

  const handleEligibilityComplete = (data) => {
    setEligibilityData(data);
    setCurrentStep(2);
  };

  const handleDocumentsComplete = (data) => {
    setReadinessData(data);
    setCurrentStep(3);
  };

  return (
    <PageLayout>
      <PageHeader 
        title="Khedut Suraksha" 
        subtitle="Crop Insurance Assistant. Check eligibility, gather documents, and prepare your insurance claim easily."
      />
      <PageContent>
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 z-0 rounded-full"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 z-0 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-green-700 dark:text-green-400' : isCompleted ? 'text-green-600 dark:text-green-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <EligibilityChecker onComplete={handleEligibilityComplete} />
          )}
          {currentStep === 2 && eligibilityData && (
            <RequiredDocuments 
              eligibilityData={eligibilityData} 
              onComplete={handleDocumentsComplete} 
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && readinessData && (
            <EvidencePackage 
              eligibilityData={eligibilityData}
              readinessData={readinessData}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>
      </PageContent>
    </PageLayout>
  );
}
