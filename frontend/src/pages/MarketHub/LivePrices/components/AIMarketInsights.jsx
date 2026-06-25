import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Info, ShieldAlert } from 'lucide-react';

export default function AIMarketInsights({ insights = [], isLoading }) {
  if (isLoading) {
    return (
      <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          AI Market Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'negative': return <TrendingDown className="w-5 h-5 text-rose-500" />;
      case 'warning': return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'positive': return 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30';
      case 'negative': return 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30';
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30';
      default: return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30';
    }
  };

  return (
    <div className="mb-10">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-500" />
        Data-Driven Insights
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-4">
        {insights.map((insight, idx) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-5 rounded-2xl border flex gap-4 ${getBgColor(insight.type)}`}
          >
            <div className="shrink-0 mt-0.5">
              {getIcon(insight.type)}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              {insight.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
