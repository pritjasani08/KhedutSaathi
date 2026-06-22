import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  { id: 0, label: 'Upload' },
  { id: 1, label: 'Preview' },
  { id: 2, label: 'Analysis' },
  { id: 3, label: 'Report' },
  { id: 4, label: 'Treatment' },
];

export default function DiagnosisStepper({ currentStep }) {
  return (
    <div className="w-full py-4 mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0" />
        
        {/* Active Line Progress */}
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          const isPending = currentStep < index;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div 
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300 ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20' 
                    : isCompleted
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}
                animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <span>{index + 1}</span>}
              </motion.div>
              <span className={`absolute top-12 text-xs md:text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                isActive ? 'text-primary' : isCompleted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
