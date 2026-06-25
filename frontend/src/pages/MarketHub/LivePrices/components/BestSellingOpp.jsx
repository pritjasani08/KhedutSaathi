import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Loader2, Info } from 'lucide-react';

export default function BestSellingOpp({ topGainers = [], isLoading }) {
  
  if (isLoading) {
    return (
      <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Best Selling Opportunities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!topGainers || topGainers.length === 0) {
    return (
      <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Best Selling Opportunities</h3>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center text-slate-500 text-center">
          <Info className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">Not enough market data to determine top selling opportunities today.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col mb-10">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        Best Selling Opportunities
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-auto">
        {topGainers.slice(0, 2).map((item, idx) => (
          <motion.div
            key={`${item.commodity}-${item.market}-${idx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all overflow-hidden cursor-pointer"
          >
            {/* Soft background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/50 dark:from-emerald-900/0 dark:to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="w-12 h-12 shrink-0 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-xl shadow-inner border border-emerald-200 dark:border-emerald-800/50">
                  🌱
                </div>
                <div className="shrink-0 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/50">
                  <TrendingUp className="w-3 h-3" />
                  Strong
                </div>
              </div>

              <h4 className="text-xl font-display font-bold text-slate-800 dark:text-slate-100 mb-1">
                {item.commodity}
              </h4>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
                <MapPin className="w-3 h-3" />
                {item.market}, {item.district}
              </p>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Modal Price</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{item.modal_price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Max</p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    ₹{item.max_price}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
