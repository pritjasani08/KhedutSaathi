import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Database, AlertCircle, FileText, TrendingUp, IndianRupee, MapPin } from 'lucide-react';
import MarketPriceFilters from '../../../components/market-prices/MarketPriceFilters';
import MarketPriceTable from '../../../components/market-prices/MarketPriceTable';
import MarketPriceCard from '../../../components/market-prices/MarketPriceCard';
import MarketPricePagination from '../../../components/market-prices/MarketPricePagination';
import LoadingSkeleton from '../../../components/market-prices/LoadingSkeleton';
import { fetchMarketPrices } from '../../../services/marketPriceService';

const ITEMS_PER_PAGE = 20;

export default function LivePrices() {
  const { t } = useTranslation();

  // ALL records returned from API (after mandi selection)
  const [allData, setAllData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mandiSelected, setMandiSelected] = useState(false);

  const [filters, setFilters] = useState({
    state: '',
    district: '',
    market: '',
    commodity: '',
    sortBy: 'modal_price',
    order: 'desc',
    page: 1
  });

  // Only fetch data when a mandi is selected
  const loadData = async () => {
    if (!filters.state || !filters.district || !filters.market) {
      setAllData([]);
      setMeta(null);
      setMandiSelected(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMandiSelected(true);

      const res = await fetchMarketPrices({
        state: filters.state,
        district: filters.district,
        market: filters.market,
        commodity: filters.commodity,
        sortBy: filters.sortBy,
        order: filters.order
      });

      // res = { success, data: [...], meta: {...} }
      const fetchedData = Array.isArray(res.data) ? res.data : [];
      setAllData(fetchedData);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error('Failed to load prices:', err);
      setError(err.message || 'Failed to connect to the market price database.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when mandi or commodity or sort changes
  useEffect(() => {
    if (filters.market) {
      loadData();
    } else {
      setAllData([]);
      setMeta(null);
      setMandiSelected(false);
    }
  }, [filters.state, filters.district, filters.market, filters.commodity, filters.sortBy, filters.order]);

  // UI-only pagination: slice allData for the current page
  const paginatedData = useMemo(() => {
    const start = (filters.page - 1) * ITEMS_PER_PAGE;
    return allData.slice(start, start + ITEMS_PER_PAGE);
  }, [allData, filters.page]);

  const totalPages = Math.ceil(allData.length / ITEMS_PER_PAGE);

  // Reset page to 1 when filters change
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
  }, [filters.state, filters.district, filters.market, filters.commodity, filters.sortBy, filters.order]);

  const handleExportCSV = () => {
    if (!allData.length) return;

    const headers = ['Commodity', 'State', 'District', 'Market', 'Arrival Date', 'Min Price', 'Max Price', 'Modal Price'];
    const csvContent = [
      headers.join(','),
      ...allData.map(row =>
        [row.commodity, row.state, row.district, row.market, row.arrival_date, row.min_price, row.max_price, row.modal_price]
        .map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `market_prices_${filters.market}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate analytics from ALL data (not paginated)
  const totalCommodities = meta?.totalCommodities || new Set(allData.map(d => d.commodity)).size;
  const avgPrice = allData.length > 0
    ? Math.round(allData.reduce((acc, curr) => acc + (parseFloat(curr.modal_price) || 0), 0) / allData.length)
    : 0;
  const totalRecords = allData.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Filters — always visible */}
      <MarketPriceFilters
        filters={filters}
        setFilters={setFilters}
        onRefresh={loadData}
        onExport={handleExportCSV}
      />

      {/* Before mandi selection: show instruction prompt */}
      {!mandiSelected && !loading && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
          <MapPin className="w-16 h-16 text-primary/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Select a Mandi to View Prices</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Choose a <strong>State</strong>, then <strong>District</strong>, then <strong>Market (Mandi)</strong> above to see all available commodity prices for that market.
          </p>
        </div>
      )}

      {/* After mandi selection: show analytics + data */}
      {mandiSelected && (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4 text-blue-600 dark:text-blue-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Commodities Found</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '-' : totalCommodities}</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-4 text-green-600 dark:text-green-400">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Avg Modal Price</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '-' : `₹${avgPrice}`}</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-4 text-amber-600 dark:text-amber-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Records</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{loading ? '-' : totalRecords}</h3>
              </div>
            </div>
          </div>

          {/* Data Area */}
          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-100 dark:border-red-900/50 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 mb-4 text-red-500 opacity-80" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Market Data</h3>
              <p className="text-sm mb-4 max-w-md">{error}</p>
              <button
                onClick={loadData}
                className="px-6 py-2 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-semibold rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : loading ? (
            <LoadingSkeleton />
          ) : paginatedData.length > 0 ? (
            <>
              <MarketPriceTable data={paginatedData} />

              <div className="md:hidden space-y-4">
                {paginatedData.map((item, index) => (
                  <MarketPriceCard key={`${item.commodity}-${index}`} item={item} />
                ))}
              </div>

              <MarketPricePagination
                currentPage={filters.page}
                totalPages={totalPages}
                totalRecords={allData.length}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              />
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Market Data Found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                No recent price data found for this mandi. The market might be closed today, or the data hasn't been uploaded yet by the APMC.
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
