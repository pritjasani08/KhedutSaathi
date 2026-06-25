import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BarChart3, Loader2, Info } from 'lucide-react';

export default function PriceIntelligenceChart({ data = [], isLoading }) {
  
  // Prepare data: Top 7 highest priced crops in the current dataset
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Group by commodity, find average modal price
    const commodityMap = new Map();
    
    data.forEach(item => {
      const price = parseFloat(item.modal_price) || 0;
      if (price > 0) {
        if (!commodityMap.has(item.commodity)) {
          commodityMap.set(item.commodity, { sum: 0, count: 0 });
        }
        const curr = commodityMap.get(item.commodity);
        curr.sum += price;
        curr.count += 1;
      }
    });

    const averages = Array.from(commodityMap.entries()).map(([commodity, stats]) => ({
      name: commodity.length > 15 ? commodity.substring(0, 15) + '...' : commodity,
      fullName: commodity,
      price: Math.round(stats.sum / stats.count)
    }));

    // Sort descending by price and take top 6
    averages.sort((a, b) => b.price - a.price);
    return averages.slice(0, 6);

  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-slate-500 font-medium">Generating Market Intelligence...</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
        <Info className="w-10 h-10 text-slate-400 mb-3" />
        <p className="text-slate-500 font-medium max-w-sm">
          Not enough market data to visualize price comparisons right now.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 shadow-sm mb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Top Value Crops Comparison
          </h3>
          <p className="text-xs text-slate-500 mt-1">Average Modal Price (₹/Quintal) across currently loaded markets</p>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white text-xs font-medium py-2 px-3 rounded-lg shadow-xl border border-slate-700">
                      <p className="mb-1">{payload[0].payload.fullName}</p>
                      <p className="text-emerald-400 text-lg font-bold">₹{payload[0].value}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="price" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? '#10b981' : '#cbd5e1'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
