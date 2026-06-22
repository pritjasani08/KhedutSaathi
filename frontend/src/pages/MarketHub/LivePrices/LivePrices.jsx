import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Hooks
import { useMarketPrices } from '../../../hooks/useMarketPrices';
import { useMarketInsights } from '../../../hooks/useMarketInsights';

// Components
import MarketPriceFilters from '../../../components/market-prices/MarketPriceFilters';
import MarketOverviewKPIs from './components/MarketOverviewKPIs';
import BestSellingOpp from './components/BestSellingOpp';
import AIMarketInsights from './components/AIMarketInsights';
import PriceIntelligenceChart from './components/PriceIntelligenceChart';
import AdvancedMarketTable from './components/AdvancedMarketTable';

export default function LivePrices() {
  const { t } = useTranslation();

  // Filters State
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    market: '',
    commodity: '',
  });

  // Fetch data (React Query handles loading/error internally)
  const { data, isLoading, isError, refetch } = useMarketPrices(filters);

  // Derive mathematical insights
  const { insights, topGainers, overview } = useMarketInsights(data);

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    const headers = ['Commodity', 'State', 'District', 'Market', 'Arrival Date', 'Min Price', 'Max Price', 'Modal Price'];
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        [row.commodity, row.state, row.district, row.market, row.arrival_date, row.min_price, row.max_price, row.modal_price]
        .map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `market_prices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6 pt-24 pb-16 px-4 sm:px-6 lg:px-8"
    >
      {/* Page Header (No Marketing Hero, just simple title) */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-heading">Live Market Intelligence</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time agricultural pricing data, derived trends, and best selling opportunities.</p>
      </div>

      {/* Filters */}
      <div className="mb-10">
        <MarketPriceFilters
          filters={filters}
          setFilters={setFilters}
          onRefresh={refetch}
          onExport={handleExportCSV}
        />
      </div>

      {/* KPI Overview */}
      <MarketOverviewKPIs 
        overview={overview} 
        isLoading={isLoading} 
        isError={isError} 
      />

      {/* AI Text Insights */}
      <AIMarketInsights 
        insights={insights} 
        isLoading={isLoading} 
      />

      {/* Dashboard Split: Chart & Top Opportunities */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-10">
        
        {/* Left 70%: Price Intelligence Chart */}
        <div className="lg:col-span-2">
          <PriceIntelligenceChart 
            data={data} 
            isLoading={isLoading} 
          />
        </div>

        {/* Right 30%: Best Selling Opportunities */}
        <div className="lg:col-span-1">
          <BestSellingOpp 
            topGainers={topGainers} 
            isLoading={isLoading} 
          />
        </div>

      </div>

      {/* The Core Product: Advanced Market Table */}
      <AdvancedMarketTable 
        data={data} 
        isLoading={isLoading} 
      />

    </motion.div>
  );
}
