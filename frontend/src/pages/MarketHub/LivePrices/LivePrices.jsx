import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
// Hooks
import { useMarketPrices, useMarketFeed } from '../../../hooks/useMarketPrices';
import { useMarketInsights } from '../../../hooks/useMarketInsights';
import { useAuth } from '../../../context/AuthContext';

// Shared Components
import { PageLayout, PageHeader, PageContent } from '../../../components/shared/PageLayout';

// Domain Components
import MarketPriceFilters from '../../../components/market-prices/MarketPriceFilters';
import SellingDecisionHero from './components/SellingDecisionHero';
import BestSellingOpp from './components/BestSellingOpp';
import AIMarketInsights from './components/AIMarketInsights';
import PriceIntelligenceChart from './components/PriceIntelligenceChart';
import AdvancedMarketTable from './components/AdvancedMarketTable';

export default function LivePrices() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Filters State
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    market: '',
    commodity: '',
  });

  const isAuth = !!user;

  // Fetch data (React Query handles loading/error internally)
  const feedQuery = useMarketFeed(filters);
  const priceQuery = useMarketPrices(filters);
  
  const queryToUse = isAuth ? feedQuery : priceQuery;
  const { data: rawData, isLoading, isError, refetch } = queryToUse;
  
  const data = isAuth ? rawData?.markets || [] : rawData?.data || [];
  const feedSummary = isAuth ? rawData?.summary : null;
  const feedFarmer = isAuth ? rawData?.farmer : null;
  const dataSource = isAuth ? 'live' : rawData?.meta?.dataSource || 'live';

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
    <PageLayout>
      <PageHeader 
        title="Live Market Intelligence" 
        subtitle="Make data-driven selling decisions for your crop based on real-time mandis."
      />

      <PageContent>
        {dataSource === 'offline_seed' && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-xl flex items-center gap-3 shadow-sm backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              <strong className="font-semibold">Notice:</strong> The live government API is currently unreachable. You are viewing cached offline data.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="mb-10">
          <MarketPriceFilters
            filters={filters}
            setFilters={setFilters}
            onRefresh={refetch}
            onExport={handleExportCSV}
          />
        </div>

        {/* Selling Recommendation Hero (Answers "Should I sell today?") */}
        <SellingDecisionHero 
          data={data}
          insights={insights}
          overview={overview}
          isLoading={isLoading}
          isError={isError}
        />

        {/* 1. PRICE TRENDS */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-display font-bold text-heading">Price Movement (30 Days)</h2>
          </div>
          <PriceIntelligenceChart 
            data={data} 
            isLoading={isLoading} 
          />
        </div>

        {/* 2. MARKET OPPORTUNITIES & INSIGHTS */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-display font-bold text-heading">Market Opportunities & Insights</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="lg:col-span-1">
              <BestSellingOpp 
                topGainers={topGainers} 
                isLoading={isLoading} 
              />
            </div>
            <div className="lg:col-span-1">
              <AIMarketInsights 
                insights={insights} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        </div>

        {/* 3. LIVE MARKET FEED */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-display font-bold text-heading">Full Market Data</h2>
          </div>
          <AdvancedMarketTable 
            data={data} 
            isLoading={isLoading} 
            feedSummary={feedSummary}
            feedFarmer={feedFarmer}
          />
        </div>

      </PageContent>
    </PageLayout>
  );
}
