import React from 'react';

export const DashboardSkeleton = () => (
  <div className="min-h-screen pt-24 pb-16 gradient-bg">
    <div className="container-custom px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg mb-2"></div>
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
      
      {/* Farm Summary & Profile */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card p-6 h-[200px] bg-slate-200/50 dark:bg-slate-800/50"></div>
        <div className="glass-card p-6 h-[200px] bg-slate-200/50 dark:bg-slate-800/50"></div>
      </div>
      
      {/* Weather & Market */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <WeatherSkeleton />
        <MarketSkeleton />
      </div>
    </div>
  </div>
);

export const WeatherSkeleton = () => (
  <div className="glass-card p-6 border-blue-100 dark:border-blue-800 h-[180px] animate-pulse">
    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
    <div className="flex gap-6">
      <div className="h-16 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="flex-1 grid grid-cols-3 gap-2">
        <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  </div>
);

export const MarketSkeleton = () => (
  <div className="glass-card p-6 border-purple-100 dark:border-purple-800 h-[180px] animate-pulse">
    <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
    <div className="flex gap-6">
      <div className="h-16 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
      <div className="flex-1 space-y-2">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    </div>
  </div>
);

export const NewsSkeleton = () => (
  <div className="grid md:grid-cols-3 gap-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="block p-4 border border-subtle rounded-xl animate-pulse">
        <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded-lg mb-3"></div>
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    ))}
  </div>
);
