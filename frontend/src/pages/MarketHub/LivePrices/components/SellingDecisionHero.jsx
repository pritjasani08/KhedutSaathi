import React from 'react';
import { Target, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { getSellingDecision } from '../utils/sellingDecisionEngine';
import SectionLoader from '../../../../components/shared/SectionLoader';

export default function SellingDecisionHero({ data, insights, overview, isLoading, isError }) {
  if (isLoading) {
    return (
      <div className="glass-card mb-10 overflow-hidden shadow-sm border border-subtle">
        <SectionLoader message="Analyzing market conditions..." minHeight="min-h-[200px]" />
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <section className="glass-card overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 relative mb-10 p-6 flex flex-col items-center justify-center min-h-[200px]">
        <AlertTriangle className="w-10 h-10 text-slate-400 mb-3" />
        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">Insufficient Data</h3>
        <p className="text-slate-500 mt-1">Adjust filters to load market data for a recommendation.</p>
      </section>
    );
  }

  const decision = getSellingDecision(data, insights, overview);

  if (decision.recommendation === 'Insufficient Data') {
     return (
      <section className="glass-card overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 relative mb-10 p-6 flex flex-col items-center justify-center min-h-[200px]">
        <AlertTriangle className="w-10 h-10 text-slate-400 mb-3" />
        <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">Insufficient Data</h3>
        <p className="text-slate-500 mt-1">{decision.why}</p>
      </section>
    );
  }

  // Styling logic based on recommendation
  const config = {
    'Sell Today': {
      borderLine: 'bg-green-500',
      borderCard: 'border-green-200/50 dark:border-green-800/30',
      bgGradient: 'from-green-500/10 to-emerald-500/5 dark:from-green-900/30 dark:to-emerald-900/10',
      badgeClass: 'badge-success',
      icon: CheckCircle
    },
    'Hold': {
      borderLine: 'bg-amber-500',
      borderCard: 'border-amber-200/50 dark:border-amber-800/30',
      bgGradient: 'from-amber-500/10 to-orange-500/5 dark:from-amber-900/30 dark:to-orange-900/10',
      badgeClass: 'badge-warning',
      icon: AlertTriangle
    },
    'Wait': {
      borderLine: 'bg-blue-500',
      borderCard: 'border-blue-200/50 dark:border-blue-800/30',
      bgGradient: 'from-blue-500/10 to-indigo-500/5 dark:from-blue-900/30 dark:to-indigo-900/10',
      badgeClass: 'badge-info',
      icon: Clock
    }
  };

  const style = config[decision.recommendation] || config['Wait'];
  const Icon = style.icon;

  return (
    <section className={`glass-card overflow-hidden shadow-sm border ${style.borderCard} relative mb-10`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${style.borderLine}`}></div>
      <div className={`absolute inset-0 bg-gradient-to-r ${style.bgGradient} opacity-50 pointer-events-none`}></div>
      
      <div className="px-6 py-4 border-b border-subtle flex justify-between items-center bg-white/50 dark:bg-slate-900/50 relative z-10">
         <h2 className="font-display font-bold text-heading flex items-center gap-2 text-lg">
           ✨ Selling Recommendation
         </h2>
         <span className="text-xs font-medium text-slate-500">Based on {data.length} active mandis</span>
      </div>

      <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start relative z-10">
         <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className={`badge px-3 py-1.5 font-bold uppercase tracking-wider text-sm flex items-center gap-1.5 ${style.badgeClass}`}>
                <Icon className="w-4 h-4" /> {decision.recommendation}
              </span>
              <span className="text-sm font-medium text-slate-500 border-l border-slate-300 dark:border-slate-700 pl-3">
                {decision.confidence} Confidence
              </span>
            </div>
            
            <div className="space-y-4 mb-2">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Why?</p>
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">{decision.why}</p>
              </div>
              
              {decision.impact && (
                <div className="pt-3 border-t border-subtle">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-primary" /> Expected Impact
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{decision.impact}</p>
                </div>
              )}
            </div>
         </div>
      </div>
    </section>
  );
}
