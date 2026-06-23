import React from 'react';
import { LineChart, ArrowUpRight, ArrowDownRight, ArrowRight, Loader2, AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMarketIntelligence } from '../hooks/useMarketIntelligence';

export default function MarketSnapshot({ profileData }) {
  const { data: intelligenceResult, isLoading, isError, error, refetch } = useMarketIntelligence(profileData);

  // Progressive Rendering State 1: No crop profile
  if (!profileData?.primary_crop) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border border-purple-100 dark:border-purple-800">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display font-bold text-heading flex items-center gap-2">
            <LineChart className="w-5 h-5 text-purple-500" />
            Market Snapshot
          </h3>
        </div>
        <p className="text-sm text-slate-500">Please set a primary crop in your profile to see market trends.</p>
      </motion.div>
    );
  }

  // Progressive Rendering State 2: Loading Skeletons
  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border border-purple-100 dark:border-purple-800 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display font-bold text-heading flex items-center gap-2 text-transparent bg-slate-200 dark:bg-slate-700 rounded w-40">
            Loading...
          </h3>
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>
        <div className="flex items-center gap-6 mb-4">
          <div className="space-y-2">
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
      </motion.div>
    );
  }

  // Progressive Rendering State 3: Error
  if (isError) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 border border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display font-bold text-red-800 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Market Snapshot Error
          </h3>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
          Unable to connect to the market intelligence service.
        </p>
        <button onClick={() => refetch()} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm !py-2">
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
      </motion.div>
    );
  }

  const { status, sourceLevel, data: marketPrice } = intelligenceResult || {};

  // Progressive Rendering State 4: Empty State (No records across all fallbacks)
  if (status === 'empty' || !marketPrice) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border border-purple-100 dark:border-purple-800">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display font-bold text-heading flex items-center gap-2">
            <LineChart className="w-5 h-5 text-purple-500" />
            Market Snapshot
          </h3>
          <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{profileData.primary_crop}</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No market data available yet.</p>
          <p className="text-xs text-slate-500 mt-1">We couldn't find recent mandi prices for {profileData.primary_crop}. Please check back later.</p>
        </div>
      </motion.div>
    );
  }

  // Determine intelligent messaging based on fallback level
  let intelligentMessage = "";
  if (sourceLevel === 'State') {
    intelligentMessage = `No district-level data for ${profileData.district || 'your area'}. Showing ${profileData.state || 'state'}-wide market intelligence.`;
  } else if (sourceLevel === 'National') {
    intelligentMessage = `Showing national commodity market trends for ${marketPrice.commodity}.`;
  } else {
    intelligentMessage = `Best market location found in ${profileData.district || 'your district'}: ${marketPrice.bestMarket}`;
  }

  // Progressive Rendering State 5: Success
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border border-purple-100 dark:border-purple-800">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-display font-bold text-heading flex items-center gap-2">
          <LineChart className="w-5 h-5 text-purple-500" />
          Market Snapshot
        </h3>
        <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{marketPrice.commodity}</span>
      </div>
      
      <div className="flex items-center gap-6 mb-4">
        <div>
          <p className="text-5xl font-display font-bold text-heading">₹{marketPrice.currentPrice}</p>
          <div className="flex items-center gap-1 mt-1">
            {marketPrice.trend > 0 ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : marketPrice.trend < 0 ? <ArrowDownRight className="w-4 h-4 text-red-500" /> : <ArrowRight className="w-4 h-4 text-slate-500" />}
            <p className={`text-sm font-semibold ${marketPrice.trend > 0 ? 'text-green-600' : marketPrice.trend < 0 ? 'text-red-600' : 'text-slate-500'}`}>
              {Math.abs(marketPrice.trend)}% trend
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg flex justify-between items-center">
            <p className="text-xs text-slate-500">Previous Price</p>
            <p className="font-semibold text-sm">₹{marketPrice.previousPrice}</p>
          </div>
          <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg flex justify-between items-center">
            <p className="text-xs text-slate-500">Best Market Price</p>
            <p className="font-semibold text-sm text-purple-600">₹{marketPrice.bestPrice}</p>
          </div>
        </div>
      </div>
      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/50">
        <p className="text-sm text-purple-800 dark:text-purple-300">
          <span className="font-bold">{sourceLevel === 'District' ? 'Top District Market:' : 'Intelligence Note:'}</span> {intelligentMessage}
        </p>
      </div>
    </motion.div>
  );
}
