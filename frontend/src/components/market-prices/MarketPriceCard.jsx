import React from 'react';
import { Calendar, MapPin, TrendingUp, IndianRupee } from 'lucide-react';

export default function MarketPriceCard({ item }) {
  // Extract data safely
  const commodity = item.commodity || 'Unknown';
  const state = item.state || '';
  const district = item.district || '';
  const market = item.market || '';
  const arrivalDate = item.arrival_date || '';
  const minPrice = item.min_price || '0';
  const maxPrice = item.max_price || '0';
  const modalPrice = item.modal_price || '0';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
            {commodity}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {market}, {district}, {state}
          </p>
        </div>
        <div className="bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {arrivalDate}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Modal Price</p>
            <p className="text-lg font-bold text-primary dark:text-primary-light flex items-center">
              <IndianRupee className="w-4 h-4 mr-0.5" />
              {modalPrice}
              <span className="text-xs text-slate-400 dark:text-slate-500 font-normal ml-1">/ Qtl</span>
            </p>
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500 dark:text-slate-400">Min</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center">
                <IndianRupee className="w-3 h-3" />{minPrice}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Max</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center">
                <IndianRupee className="w-3 h-3" />{maxPrice}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
