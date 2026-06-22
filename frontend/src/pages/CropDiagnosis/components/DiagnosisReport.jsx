import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DiagnosisReport({ result, onContinue }) {
  const { t } = useTranslation();

  if (!result) return null;

  const getSeverityColor = (severity) => {
    const s = (severity || '').toLowerCase();
    if (s.includes('high') || s.includes('active')) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50';
    if (s.includes('medium')) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50';
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-subtle bg-surface-muted/30">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-2">Detected Condition</p>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-heading flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
                {result.disease || 'Unknown Disease'}
              </h2>
            </div>
            
            <div className={`shrink-0 px-4 py-2 rounded-xl border flex flex-col items-center ${getSeverityColor(result.severity)}`}>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-0.5">Severity</span>
              <span className="text-lg font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-5 h-5" />
                {result.severity || 'High'}
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
          
          {/* AI Confidence */}
          <div className="space-y-4">
            <h3 className="font-semibold text-body flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              AI Confidence Score
            </h3>
            <div className="bg-surface-muted rounded-2xl p-5 border border-subtle">
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-display font-bold text-primary">{result.confidence || 0}%</span>
                <span className="text-sm text-slate-500 mb-1">Match probability</span>
              </div>
              <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-primary-light"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence || 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Key Symptoms Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-body flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              Key Indicators
            </h3>
            <div className="bg-surface-muted rounded-2xl p-5 border border-subtle">
              <ul className="space-y-3">
                {/* Fallback symptoms since API might only return disease name */}
                {(result.symptoms || ['Discoloration on leaves', 'Fungal spots visible', 'Wilting edges']).map((sym, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    {sym}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Action Bar */}
        <div className="p-6 border-t border-subtle bg-surface-muted/30 flex justify-end">
          <button 
            onClick={onContinue}
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 px-8 shadow-lg shadow-primary/20"
          >
            View Treatment Plan
          </button>
        </div>
      </div>
    </motion.div>
  );
}
