const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const API_URL = import.meta.env.VITE_API_URL;

export const dashboardService = {
  getOverview: async () => {
    const res = await fetch(`${API_URL}/api/dashboard/overview`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard overview');
    const data = await res.json();
    return data.data;
  },

  getWeather: async ({ state, district }) => {
    if (!state) return null;
    const query = new URLSearchParams({
      region: state || 'Gujarat',
      district: district || ''
    }).toString();
    const res = await fetch(`${API_URL}/api/resources/weather?${query}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    const data = await res.json();
    return data.success ? data.data : null;
  },

  getMarketPrices: async ({ state, district, commodity }) => {
    if (!commodity) return null;
    const query = new URLSearchParams({
      state: state || 'Gujarat',
      district: district || '',
      commodity: commodity,
      limit: 30
    }).toString();
    
    const res = await fetch(`${API_URL}/api/market-prices?${query}`);
    if (!res.ok) throw new Error('Failed to fetch market prices');
    const data = await res.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const records = data.data;
      const bestMarketRecord = [...records].sort((a,b) => b.modal_price - a.modal_price)[0];
      records.sort((a,b) => new Date(b.arrival_date.split('/').reverse().join('-')) - new Date(a.arrival_date.split('/').reverse().join('-')));
      const currentPrice = records[0].modal_price;
      const previousPrice = records.length > 1 ? records[records.length - 1].modal_price : currentPrice;
      const trend = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
      
      return {
        currentPrice,
        previousPrice,
        trend: trend.toFixed(1),
        bestMarket: bestMarketRecord.market,
        bestPrice: bestMarketRecord.modal_price
      };
    }
    return null;
  },

  getSchemes: async (profile) => {
    if (!profile) return null;
    const res = await fetch(`${API_URL}/api/schemes/eligible`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        state: profile.state || 'Gujarat',
        age: profile.age || 35,
        gender: profile.gender || 'Male',
        landSize: profile.farm_size || 2.0,
        farmerCategory: profile.farmer_category || 'Small & Marginal',
        primaryCrop: profile.primary_crop || 'Wheat',
        irrigationType: profile.irrigation_type || 'Tube Well'
      })
    });
    if (!res.ok) throw new Error('Failed to fetch schemes');
    const data = await res.json();
    return data.success ? data : null;
  },

  getNews: async ({ preferred_language, state, primary_crop }) => {
    const langMap = { 'Gujarati': 'gu', 'Hindi': 'hi', 'English': 'en' };
    const langCode = langMap[preferred_language] || 'en';
    const query = new URLSearchParams({
      language: langCode,
      region: state || 'Gujarat',
      crop: primary_crop || ''
    }).toString();
    
    const res = await fetch(`${API_URL}/api/resources/agri-news?${query}`);
    if (!res.ok) throw new Error('Failed to fetch news');
    const data = await res.json();
    return data.success ? data.data.slice(0, 3) : [];
  },

  acceptBid: async (bidId) => {
    const res = await fetch(`${API_URL}/api/marketplace/bids/${bidId}/accept`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to accept bid');
    return data;
  }
};
