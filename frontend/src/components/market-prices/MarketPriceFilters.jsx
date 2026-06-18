import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, RotateCcw, Download, ChevronDown } from 'lucide-react';
import { fetchStates, fetchDistricts, fetchMarkets } from '../../services/marketPriceService';

export default function MarketPriceFilters({ filters, setFilters, onRefresh, onExport }) {
  const { t } = useTranslation();

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [markets, setMarkets] = useState([]);

  // Quick filters for commodities (only shown after mandi selection)
  const quickCommodities = ['Wheat', 'Paddy(Dhan)', 'Cotton', 'Mustard', 'Onion', 'Potato', 'Tomato', 'Soyabean'];

  useEffect(() => {
    fetchStates().then(res => {
      if (res.data) setStates(res.data);
    });
  }, []);

  useEffect(() => {
    if (filters.state) {
      fetchDistricts(filters.state).then(res => {
        if (res.data) setDistricts(res.data);
      });
    } else {
      setDistricts([]);
      setMarkets([]);
    }
  }, [filters.state]);

  useEffect(() => {
    if (filters.district) {
      fetchMarkets(filters.district).then(res => {
        if (res.data) setMarkets(res.data);
      });
    } else {
      setMarkets([]);
    }
  }, [filters.district]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value, page: 1 };

    // Reset dependent fields
    if (name === 'state') {
      newFilters.district = '';
      newFilters.market = '';
      newFilters.commodity = '';
    } else if (name === 'district') {
      newFilters.market = '';
      newFilters.commodity = '';
    }

    setFilters(newFilters);
  };

  const handleQuickFilter = (commodity) => {
    setFilters({ ...filters, commodity, page: 1 });
  };

  const clearFilters = () => {
    setFilters({
      state: '',
      district: '',
      market: '',
      commodity: '',
      sortBy: 'modal_price',
      order: 'desc',
      page: 1
    });
  };

  const isMandiSelected = !!filters.market;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-card mb-8 border border-slate-100 dark:border-slate-700">

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
        <div className={`flex items-center gap-2 text-sm font-semibold ${filters.state ? 'text-primary' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${filters.state ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>1</span>
          State
        </div>
        <div className="w-8 h-px bg-slate-200 dark:bg-slate-700"></div>
        <div className={`flex items-center gap-2 text-sm font-semibold ${filters.district ? 'text-primary' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${filters.district ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>2</span>
          District
        </div>
        <div className="w-8 h-px bg-slate-200 dark:bg-slate-700"></div>
        <div className={`flex items-center gap-2 text-sm font-semibold ${filters.market ? 'text-primary' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${filters.market ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>3</span>
          Mandi
        </div>
        <div className="w-8 h-px bg-slate-200 dark:bg-slate-700"></div>
        <div className={`flex items-center gap-2 text-sm font-semibold ${isMandiSelected ? 'text-primary' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isMandiSelected ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>4</span>
          View Data
        </div>
      </div>

      {/* Location Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* State Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">State *</label>
          <div className="relative">
            <select
              name="state"
              value={filters.state}
              onChange={handleChange}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
            >
              <option value="">Select State</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* District Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">District *</label>
          <div className="relative">
            <select
              name="district"
              value={filters.district}
              onChange={handleChange}
              disabled={!filters.state}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{filters.state ? 'Select District' : 'Select State First'}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Market Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Mandi / APMC *</label>
          <div className="relative">
            <select
              name="market"
              value={filters.market}
              onChange={handleChange}
              disabled={!filters.district}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{filters.district ? 'Select Mandi' : 'Select District First'}</option>
              {markets.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Commodity Filters & Sort — only shown after mandi selection */}
      {isMandiSelected && (
        <>
          {/* Quick Commodity Filters */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center mr-2">
              <Filter className="w-4 h-4 mr-2" /> Commodities:
            </span>
            <button
              onClick={() => handleQuickFilter('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!filters.commodity ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
            >
              All
            </button>
            {quickCommodities.map(c => (
              <button
                key={c}
                onClick={() => handleQuickFilter(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.commodity === c ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search + Sort Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Search Commodity</label>
              <div className="relative">
                <input
                  type="text"
                  name="commodity"
                  value={filters.commodity}
                  onChange={handleChange}
                  placeholder="e.g. Wheat, Cotton..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Sort By Price</label>
              <div className="relative">
                <select
                  name="order"
                  value={filters.order}
                  onChange={handleChange}
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
                >
                  <option value="desc">Highest First</option>
                  <option value="asc">Lowest First</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
              <button
                onClick={onRefresh}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
        </>
      )}

      {/* Reset */}
      {(filters.state || filters.district || filters.market) && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            ← Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
