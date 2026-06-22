import React from 'react';
import { motion } from 'framer-motion';
import { Pill, ShieldCheck, Beaker, Leaf, CheckCircle2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TreatmentPlan({ result, onReset }) {
  const { t } = useTranslation();

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-heading mb-3">Actionable Treatment Plan</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Follow these guidelines carefully to mitigate the spread of {result.disease || 'the disease'} and protect your crop yield.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Immediate Action / Chemical */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-5 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center shrink-0">
              <Beaker className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-rose-900 dark:text-rose-100">Chemical Intervention</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Immediate active treatment</p>
            </div>
          </div>
          <div className="p-6 flex-1">
            <ul className="space-y-4">
              {(result.treatment || ['No specific chemical treatment found']).map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Organic / Prevention */}
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-5 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-900 dark:text-emerald-100">Organic & Prevention</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Sustainable long-term care</p>
            </div>
          </div>
          <div className="p-6 flex-1">
            <ul className="space-y-4">
              {(result.prevention || ['No specific prevention data found']).map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="btn-secondary flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Scan Another Crop
        </button>
      </div>

    </motion.div>
  );
}
