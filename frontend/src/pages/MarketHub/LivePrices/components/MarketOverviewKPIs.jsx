import React from 'react';
import { Database, Sprout, TrendingUp, IndianRupee, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarketOverviewKPIs({ overview, isLoading, isError }) {
  
  if (isError) {
    return (
      <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 flex items-center justify-center text-red-600 dark:text-red-400 gap-3">
        <AlertCircle className="w-5 h-5" />
        <span className="font-semibold text-sm">Market KPIs currently unavailable</span>
      </div>
    );
  }

  const kpis = [
    {
      id: 'active-markets',
      label: 'Active Markets',
      value: overview?.activeMarkets || 0,
      icon: <Database className="w-5 h-5" />,
      color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'crops-tracked',
      label: 'Crops Tracked',
      value: overview?.cropsTracked || 0,
      icon: <Sprout className="w-5 h-5" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'avg-modal',
      label: 'Avg Modal Price',
      value: overview?.avgPrice ? `₹${overview.avgPrice}` : '₹0',
      icon: <IndianRupee className="w-5 h-5" />,
      color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'total-records',
      label: 'Highest Gainer', // We can update this later when API provides historical data, keeping simple now
      value: overview?.cropsTracked > 0 ? 'See Trends' : 'N/A', 
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
              {kpi.icon}
            </div>
            {isLoading && <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />}
          </div>
          
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {kpi.label}
            </p>
            {isLoading ? (
              <div className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            ) : overview?.cropsTracked === 0 ? (
              <h3 className="text-xl md:text-2xl font-bold text-slate-400">N/A</h3>
            ) : (
              <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
                {kpi.value}
              </h3>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
