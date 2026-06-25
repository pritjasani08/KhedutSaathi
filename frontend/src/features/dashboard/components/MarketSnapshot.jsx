import React from 'react';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Loader2, AlertTriangle, RefreshCcw, LineChart } from 'lucide-react';
import { useMarketIntelligence } from '../hooks/useMarketIntelligence';

export default function MarketSnapshot({ profileData }) {
  const { data: intelligenceResult, isLoading, isError, refetch } = useMarketIntelligence(profileData);

  const containerClasses = "glass-card w-full flex flex-col overflow-hidden shadow-sm h-full";
  const labelClasses = "text-sm font-medium text-slate-500 mb-2";
  const valueClasses = "text-xl font-bold text-heading";

  if (!profileData?.primary_crop) {
    return (
      <div className={containerClasses}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-heading flex items-center gap-2.5 text-xl"><LineChart className="w-6 h-6 text-blue-500" /> Market Intelligence</h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-base text-slate-500">Awaiting primary crop configuration.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${containerClasses} animate-pulse`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={containerClasses}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-display font-bold text-red-600 dark:text-red-400 flex items-center gap-2.5 text-xl"><AlertTriangle className="w-6 h-6" /> Connection Error</h3>
          </div>
          <div className="flex-1 text-center flex flex-col justify-center items-center gap-4">
            <p className="text-base text-slate-500">Failed to load market data.</p>
            <button onClick={() => refetch()} className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-2 shadow-sm">
              <RefreshCcw className="w-4 h-4" /> Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { status, sourceLevel, data: marketPrice } = intelligenceResult || {};

  if (status === 'empty' || !marketPrice) {
    return (
      <div className={containerClasses}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-heading flex items-center gap-2.5 text-xl"><LineChart className="w-6 h-6 text-blue-500" /> Market Intelligence</h3>
            <span className="badge px-3 py-1 text-sm border border-subtle">{profileData.primary_crop}</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-base text-slate-500">No recent market data available.</p>
          </div>
        </div>
      </div>
    );
  }

  const isUp = marketPrice.trend > 0;
  const isDown = marketPrice.trend < 0;

  return (
    <div className={containerClasses}>
      <div className="p-8 flex flex-col h-full">
        {/* Header - Aligned cleanly with other titles */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="font-display font-bold text-heading flex items-center gap-2.5 text-xl">
              <LineChart className="w-6 h-6 text-blue-500" />
              {marketPrice.commodity} Market
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse hidden sm:block shadow-sm"></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge bg-white dark:bg-slate-800 border border-subtle px-3 py-1 text-sm shadow-sm">
              {profileData.district || profileData.state}
            </span>
          </div>
        </div>
        
        {/* Main Content View - Identical vertical rhythm */}
        <div className="flex flex-col flex-1 divide-y divide-subtle bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-subtle h-full">
          
          {/* Spot Price Block */}
          <div className="p-6 flex flex-col justify-center bg-white dark:bg-slate-900/50 rounded-t-2xl">
            <p className={labelClasses}>Current Spot Price</p>
            <div className="flex items-baseline gap-1.5 mt-1 mb-4">
              <span className="text-4xl font-display font-bold text-heading tracking-tight">
                ₹{marketPrice.currentPrice}
              </span>
              <span className="text-base font-medium text-slate-500">/Qtl</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`text-sm font-bold flex items-center px-2.5 py-1 rounded-lg shadow-sm ${isUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : isDown ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                {isUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : isDown ? <ArrowDownRight className="w-4 h-4 mr-1" /> : <ArrowRight className="w-4 h-4 mr-1" />}
                {Math.abs(marketPrice.trend)}%
              </span>
              <span className="text-sm text-slate-500 font-medium">vs Yesterday</span>
            </div>
          </div>

          {/* Dense Data Grid */}
          <div className="p-6 grid grid-cols-2 gap-6 flex-1">
            
            <div className="flex flex-col justify-center">
              <p className={labelClasses}>Previous Close</p>
              <p className={valueClasses}>₹{marketPrice.previousPrice}</p>
            </div>
            
            <div className="flex flex-col justify-center">
              <p className={labelClasses}>Best Market Location</p>
              <p className="text-lg font-bold text-primary truncate" title={marketPrice.bestMarket}>
                {marketPrice.bestMarket}
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <p className={labelClasses}>Best Price Available</p>
              <p className={valueClasses}>₹{marketPrice.bestPrice}</p>
            </div>

            <div className="flex items-center">
               <div>
                 <p className={labelClasses}>Status</p>
                 <p className="text-base font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></span> Live Market
                 </p>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
