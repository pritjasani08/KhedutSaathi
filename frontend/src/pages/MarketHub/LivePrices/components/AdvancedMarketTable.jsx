import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 15;

export default function AdvancedMarketTable({ data = [], isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'modal_price', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting and Filtering logic
  const processedData = useMemo(() => {
    let filtered = data;

    // Search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.commodity || '').toLowerCase().includes(lowerSearch) ||
        (item.market || '').toLowerCase().includes(lowerSearch) ||
        (item.district || '').toLowerCase().includes(lowerSearch)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      // Handle numeric sorting for prices
      if (['modal_price', 'min_price', 'max_price'].includes(sortConfig.key)) {
        const numA = parseFloat(valA) || 0;
        const numB = parseFloat(valB) || 0;
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }

      // String sorting
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset page on sort
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <div className="w-4 h-4 opacity-0 group-hover:opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p>Loading market data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col mb-10">
      
      {/* Table Toolbar */}
      <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Live Market Feed</h3>
          <p className="text-xs text-slate-500">Showing {processedData.length} records</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search crop, market, or district..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Responsive Table/Cards */}
      <div className="flex-1 overflow-x-auto">
        
        {/* Desktop Table (Hidden on small screens) */}
        <table className="w-full hidden md:table text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <th className="p-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('commodity')}>
                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">Crop <SortIcon columnKey="commodity" /></div>
              </th>
              <th className="p-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('market')}>
                <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">Market <SortIcon columnKey="market" /></div>
              </th>
              <th className="p-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('modal_price')}>
                <div className="flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">Price <SortIcon columnKey="modal_price" /></div>
              </th>
              <th className="p-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('max_price')}>
                <div className="flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">Max <SortIcon columnKey="max_price" /></div>
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Trend</th>
              <th className="p-4 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('arrival_date')}>
                <div className="flex items-center justify-end gap-1 text-xs font-bold uppercase tracking-wider text-slate-500">Updated <SortIcon columnKey="arrival_date" /></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No matching records found.</td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const range = (parseFloat(row.max_price) || 0) - (parseFloat(row.min_price) || 0);
                const momentum = range > 0 ? ((parseFloat(row.modal_price) || 0) - (parseFloat(row.min_price) || 0)) / range : 0.5;
                const trendText = momentum > 0.8 ? 'High' : momentum < 0.2 ? 'Low' : 'Stable';
                const trendColor = momentum > 0.8 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' : momentum < 0.2 ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200' : 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200';

                return (
                  <motion.tr 
                    key={`${row.commodity}-${row.market}-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{row.commodity}</td>
                    <td className="p-4">
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{row.market}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{row.district}, {row.state}</p>
                    </td>
                    <td className="p-4 text-right font-display font-bold text-lg text-slate-800 dark:text-slate-100">₹{row.modal_price}</td>
                    <td className="p-4 text-right text-sm text-slate-500 dark:text-slate-400">₹{row.max_price}</td>
                    <td className="p-4 text-right">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${trendColor}`}>
                        {trendText}
                      </span>
                    </td>
                    <td className="p-4 text-right text-xs text-slate-400">{row.arrival_date}</td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Mobile Card List (Hidden on desktop) */}
        <div className="md:hidden flex flex-col gap-3 p-4 bg-slate-50/30 dark:bg-slate-900">
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">No matching records found.</div>
          ) : (
            paginatedData.map((row, idx) => {
              const range = (parseFloat(row.max_price) || 0) - (parseFloat(row.min_price) || 0);
              const momentum = range > 0 ? ((parseFloat(row.modal_price) || 0) - (parseFloat(row.min_price) || 0)) / range : 0.5;
              const trendText = momentum > 0.8 ? 'High' : momentum < 0.2 ? 'Low' : 'Stable';
              const trendColor = momentum > 0.8 ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900' : momentum < 0.2 ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900' : 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';

              return (
                <div key={`mob-${row.commodity}-${row.market}-${idx}`} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{row.commodity}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{row.market}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${trendColor}`}>
                      {trendText}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-700 pt-3">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Updated {row.arrival_date}</p>
                      <p className="text-xl font-display font-bold text-slate-800 dark:text-slate-100">₹{row.modal_price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-slate-400 font-bold mb-0.5">Max</p>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">₹{row.max_price}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-500 font-medium">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button 
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
