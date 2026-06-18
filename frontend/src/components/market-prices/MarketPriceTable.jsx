import React from 'react';
import { IndianRupee } from 'lucide-react';

export default function MarketPriceTable({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">
              <th className="px-6 py-4">Commodity</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Market</th>
              <th className="px-6 py-4">Arrival Date</th>
              <th className="px-6 py-4 text-right">Min Price</th>
              <th className="px-6 py-4 text-right">Max Price</th>
              <th className="px-6 py-4 text-right text-primary dark:text-primary-light">Modal Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.map((item, index) => (
              <tr 
                key={`${item.id}-${index}`} 
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-semibold text-slate-800 dark:text-slate-100">{item.commodity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="text-slate-700 dark:text-slate-300">{item.district}</div>
                  <div className="text-slate-500 dark:text-slate-500 text-xs">{item.state}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                  {item.market}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <span className="bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md">
                    {item.arrival_date}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-end">
                    <IndianRupee className="w-3 h-3 mr-0.5" />{item.min_price}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-end">
                    <IndianRupee className="w-3 h-3 mr-0.5" />{item.max_price}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-primary dark:text-primary-light text-base">
                  <div className="flex items-center justify-end bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg w-max ml-auto group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors">
                    <IndianRupee className="w-4 h-4 mr-0.5" />{item.modal_price}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
