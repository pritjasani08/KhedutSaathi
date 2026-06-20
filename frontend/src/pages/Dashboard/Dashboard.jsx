import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/client';
import { LayoutDashboard, Package, Tag, CheckCircle, TrendingUp, Loader2, Check, MapPin, Trees, Sprout, ShieldCheck, Activity, MessageSquare, Zap, CloudRain, LineChart, Leaf, Droplets, Wind, ArrowUpRight, ArrowDownRight, ArrowRight, IndianRupee } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [farmerListings, setFarmerListings] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [schemes, setSchemes] = useState(null);
  const [news, setNews] = useState([]);
  const [weather, setWeather] = useState(null);
  const [marketPrice, setMarketPrice] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(null);
  const [farmerOrders, setFarmerOrders] = useState([]);

  const fetchFarmerOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_orders')
        .select(`
          *,
          seller_products (
            name,
            image_url,
            image_urls
          )
        `)
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setFarmerOrders(data);
      }
    } catch (err) {
      console.error("Error fetching orders", err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Profile Data (For Farmer)
      if (user.user_type === 'farmer') {
        const profileRes = await fetch('http://localhost:5000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const pData = await profileRes.json();
          setProfileData(pData.profile);
          setCompletionPercentage(pData.completionPercentage || 0);

          if (pData.profile) {
            // Fetch Personalized Schemes
            try {
              const schemeRes = await fetch('http://localhost:5000/api/schemes/eligible', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  state: pData.profile.state || 'Gujarat',
                  age: pData.profile.age || 35,
                  gender: pData.profile.gender || 'Male',
                  landSize: pData.profile.farm_size || 2.0,
                  farmerCategory: pData.profile.farmer_category || 'Small & Marginal',
                  primaryCrop: pData.profile.primary_crop || 'Wheat',
                  irrigationType: pData.profile.irrigation_type || 'Tube Well'
                })
              });
              if (schemeRes.ok) {
                const sData = await schemeRes.json();
                if (sData.success) setSchemes(sData);
              }
            } catch(e) {
              console.error("Failed fetching schemes", e);
            }

            // Fetch Personalized News
            try {
              const langMap = { 'Gujarati': 'gu', 'Hindi': 'hi', 'English': 'en' };
              const langCode = langMap[pData.profile.preferred_language] || 'en';
              const query = new URLSearchParams({
                language: langCode,
                region: pData.profile.state || 'Gujarat',
                crop: pData.profile.primary_crop || '' // For Crop-aware News Personalization (Step 5)
              }).toString();
              
              const newsRes = await fetch(`http://localhost:5000/api/resources/agri-news?${query}`);
              if (newsRes.ok) {
                const nData = await newsRes.json();
                if (nData.success) setNews(nData.data.slice(0, 3));
              }
            } catch(e) {
              console.error("Failed fetching news", e);
            }

            // Fetch Weather
            try {
              const wRes = await fetch(`http://localhost:5000/api/resources/weather?region=${pData.profile.state || 'Gujarat'}`);
              if (wRes.ok) {
                const wData = await wRes.json();
                if (wData.success) setWeather(wData.data);
              }
            } catch(e) { console.error(e); }

            // Fetch Market Price
            if (pData.profile.primary_crop) {
              try {
                const mRes = await fetch(`http://localhost:5000/api/market-prices?state=${pData.profile.state || 'Gujarat'}&district=${pData.profile.district || ''}&commodity=${pData.profile.primary_crop}&limit=30`);
                if (mRes.ok) {
                  const mData = await mRes.json();
                  if (mData.success && mData.data && mData.data.length > 0) {
                    const records = mData.data;
                    const bestMarketRecord = [...records].sort((a,b) => b.modal_price - a.modal_price)[0];
                    records.sort((a,b) => new Date(b.arrival_date.split('/').reverse().join('-')) - new Date(a.arrival_date.split('/').reverse().join('-')));
                    const currentPrice = records[0].modal_price;
                    const previousPrice = records.length > 1 ? records[records.length - 1].modal_price : currentPrice;
                    const trend = previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
                    
                    setMarketPrice({
                      currentPrice,
                      previousPrice,
                      trend: trend.toFixed(1),
                      bestMarket: bestMarketRecord.market,
                      bestPrice: bestMarketRecord.modal_price
                    });
                  }
                }
              } catch(e) { console.error(e); }
            }
          }
        }
      }

      // Fetch Marketplace Stats
      const statsRes = await fetch('http://localhost:5000/api/marketplace/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Farmer Listings if Farmer
      if (user.user_type === 'farmer') {
        const listingsRes = await fetch('http://localhost:5000/api/marketplace/listings/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setFarmerListings(listingsData);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    if (user?.user_type === 'farmer') {
      fetchFarmerOrders();
    }
  }, [user]);

  const handleAcceptBid = async (bidId) => {
    setAcceptLoading(bidId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/marketplace/bids/${bidId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      await fetchDashboardData();
      alert('Bid accepted successfully! Deal closed.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setAcceptLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        
        {/* SECTION 1: Welcome Header */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="mb-8"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="font-display text-3xl font-bold text-heading">
              Welcome back, {user.first_name}!
            </h1>
          </motion.div>
          <motion.p variants={fadeUp} className="text-slate-500">
            {user.user_type === 'farmer' ? "Here is your farm overview and recent activities." : "Overview of your marketplace activities"}
          </motion.p>
        </motion.div>

        
        {user.user_type === 'farmer' && (
          <>
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* 1. Farm Summary */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="lg:col-span-2 glass-card p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display text-xl font-bold text-heading flex items-center gap-2">
                    <Trees className="w-5 h-5 text-primary" />
                    My Farm Summary
                  </h2>
                  <Link to="/profile" className="text-sm font-semibold text-primary hover:underline">Edit Profile</Link>
                </div>
                
                {profileData ? (
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> Location</p>
                      <p className="font-semibold text-heading">{[profileData.district, profileData.state].filter(Boolean).join(', ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><Trees className="w-3.5 h-3.5"/> Farm Size</p>
                      <p className="font-semibold text-heading">{profileData.farm_size ? `${profileData.farm_size} Acres` : 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><Sprout className="w-3.5 h-3.5"/> Primary Crop</p>
                      <p className="font-semibold text-heading">{profileData.primary_crop || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><Activity className="w-3.5 h-3.5"/> Soil Type</p>
                      <p className="font-semibold text-heading">{profileData.soil_type || 'Not specified'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">Please update your farm profile to see details here.</p>
                )}
              </motion.div>

              {/* 2. Profile Completion */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass-card p-6 flex flex-col justify-center items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <ShieldCheck className="w-12 h-12 text-primary/80 mb-3" />
                <h3 className="font-display text-lg font-bold text-heading mb-1">Profile Completion</h3>
                <p className="text-3xl font-black text-primary mb-2">{completionPercentage}%</p>
                {completionPercentage < 100 && (
                  <Link to="/profile" className="btn-secondary w-full text-center text-sm py-2">Complete Profile</Link>
                )}
              </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* 3. Weather Advisory */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-100 dark:border-blue-800">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display font-bold text-heading flex items-center gap-2">
                    <CloudRain className="w-5 h-5 text-blue-500" />
                    Weather Advisory
                  </h3>
                  {weather?.locationName && <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{weather.locationName}</span>}
                </div>
                
                {weather ? (
                  <>
                    <div className="flex items-center gap-6 mb-4">
                      <div>
                        <p className="text-5xl font-display font-bold text-heading">{weather.temperature}°C</p>
                        <p className="text-sm font-semibold text-blue-600 mt-1">{weather.condition}</p>
                      </div>
                      <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                          <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                          <p className="text-xs text-slate-500">Rain</p>
                          <p className="font-semibold text-sm">{weather.rainProbability}%</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                          <Activity className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                          <p className="text-xs text-slate-500">Humidity</p>
                          <p className="font-semibold text-sm">{weather.humidity}%</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                          <Wind className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                          <p className="text-xs text-slate-500">Wind</p>
                          <p className="font-semibold text-sm">{weather.windSpeed}km/h</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                      <p className="text-sm text-blue-800 dark:text-blue-300"><span className="font-bold">Farmer Advisory:</span> {weather.advisory}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Loading weather data...</p>
                )}
              </motion.div>

              {/* 4. Market Snapshot */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5 border border-purple-100 dark:border-purple-800">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display font-bold text-heading flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-purple-500" />
                    Market Snapshot
                  </h3>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">{profileData?.primary_crop || 'Crop'}</span>
                </div>
                
                {marketPrice && typeof marketPrice === 'object' ? (
                  <>
                    <div className="flex items-center gap-6 mb-4">
                      <div>
                        <p className="text-5xl font-display font-bold text-heading">₹{marketPrice.currentPrice}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {marketPrice.trend > 0 ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : marketPrice.trend < 0 ? <ArrowDownRight className="w-4 h-4 text-red-500" /> : <ArrowRight className="w-4 h-4 text-slate-500" />}
                          <p className={`text-sm font-semibold ${marketPrice.trend > 0 ? 'text-green-600' : marketPrice.trend < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                            {Math.abs(marketPrice.trend)}% trend
                          </p>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg flex justify-between items-center">
                          <p className="text-xs text-slate-500">Previous Price</p>
                          <p className="font-semibold text-sm">₹{marketPrice.previousPrice}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg flex justify-between items-center">
                          <p className="text-xs text-slate-500">Best Market Price</p>
                          <p className="font-semibold text-sm text-purple-600">₹{marketPrice.bestPrice}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800/50">
                      <p className="text-sm text-purple-800 dark:text-purple-300"><span className="font-bold">Best Market Location:</span> {marketPrice.bestMarket}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Loading market prices...</p>
                )}
              </motion.div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              {/* 5. Eligible Schemes */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 flex items-center justify-between border-green-200 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-slate-500 mb-1">Eligible Schemes</p>
                  <p className="text-3xl font-display font-bold text-heading text-green-600">{schemes ? schemes.data.length : '-'}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 relative z-10">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </motion.div>

              {/* 6. Potential Benefits */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 flex items-center justify-between border-amber-200 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-medium text-slate-500 mb-1">Potential Benefits</p>
                  <p className="text-3xl font-display font-bold text-heading text-amber-600">₹{schemes ? schemes.totalBenefit.toLocaleString('en-IN') : '-'}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 relative z-10">
                  <Tag className="w-6 h-6" />
                </div>
              </motion.div>
            </div>

            {/* 7. Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h2 className="font-display text-lg font-bold text-heading mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ActionCard to="/crop-health" icon={Activity} label="Crop Health" color="text-red-500" bg="bg-red-500/10" />
                <ActionCard to="/crop-recommendation" icon={Sprout} label="Crop Rec." color="text-green-500" bg="bg-green-500/10" />
                <ActionCard to="/khedut-ai" icon={Zap} label="Khedut AI" color="text-amber-500" bg="bg-amber-500/10" />
                <ActionCard to="/market-prices" icon={LineChart} label="Market Intel" color="text-purple-500" bg="bg-purple-500/10" />
                <ActionCard to="/smart-irrigation" icon={CloudRain} label="Irrigation" color="text-blue-500" bg="bg-blue-500/10" />
              </div>
            </motion.div>

            {/* 8. Manage My Listings */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-xl font-bold text-heading">Manage My Listings</h2>
                <Link to="/marketplace" className="text-sm font-semibold text-primary hover:underline">Marketplace</Link>
              </div>
              {farmerListings.length === 0 ? (
                <div className="glass-card p-8 text-center text-slate-500">You haven't created any listings yet.</div>
              ) : (
                <div className="space-y-6">
                  {farmerListings.map(listing => (
                    <div key={listing.id} className="glass-card p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-subtle">
                        <div>
                          <h3 className="font-display font-bold text-xl text-body">{listing.crop_name}</h3>
                          <div className="flex gap-4 text-sm text-slate-500 mt-1">
                            <span>Qty: {listing.quantity_quintals} Qtl</span>
                            <span>Expected: ₹{listing.expected_price}/Qtl</span>
                          </div>
                        </div>
                        <span className={`badge ${listing.status === 'SOLD' ? 'badge-success' : 'bg-blue-100 text-blue-700'}`}>
                          {listing.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-600 mb-3">Received Bids ({listing.bids.length})</h4>
                        {listing.bids.length === 0 ? (
                          <p className="text-xs text-slate-400">No bids received yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {listing.bids.sort((a,b) => b.bid_price - a.bid_price).map(bid => (
                              <div key={bid.id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-subtle">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                    {bid.users.first_name[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-heading">{bid.users.first_name} {bid.users.last_name}</p>
                                    <p className="text-xs text-slate-500">{new Date(bid.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 sm:mt-0">
                                  <span className="font-bold text-primary">₹{bid.bid_price}</span>
                                  {listing.status === 'OPEN' && (
                                    <button
                                      onClick={() => handleAcceptBid(bid.id)}
                                      disabled={acceptLoading === bid.id}
                                      className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1"
                                    >
                                      {acceptLoading === bid.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                      Accept Bid
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* 9. Latest News For You */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mb-10 glass-card p-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-heading text-lg">Latest News for You</h3>
                <Link to="/resources" className="text-xs text-primary font-semibold hover:underline">View All News</Link>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {news.length > 0 ? news.map((item, i) => (
                  <a key={i} href={item.link || item.url} target="_blank" rel="noopener noreferrer" className="block p-4 border border-subtle rounded-xl hover:border-primary/50 transition-colors flex flex-col gap-3">
                    <img src={item.image} alt="" className="w-full h-32 object-cover rounded-lg shrink-0 bg-slate-100" />
                    <div>
                      <h4 className="text-sm font-bold text-heading line-clamp-2 mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{item.excerpt || item.summary}</p>
                    </div>
                  </a>
                )) : (
                  <p className="text-sm text-slate-500 col-span-3">Loading personalized news...</p>
                )}
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* 10. Recent AI Chats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-heading flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Recent AI Chats
                  </h3>
                  <Link to="/khedut-ai" className="text-xs text-primary font-semibold hover:underline">View All</Link>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-subtle flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-heading">Best fertilizer for {profileData?.primary_crop || 'wheat'}?</p>
                      <p className="text-xs text-slate-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-subtle flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-heading">Weather forecast for next week</p>
                      <p className="text-xs text-slate-500">5 days ago</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 11. Recent Diagnoses */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-heading flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-500" />
                    Recent Diagnoses
                  </h3>
                  <Link to="/crop-health" className="text-xs text-primary font-semibold hover:underline">New Diagnosis</Link>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-subtle flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <img src="https://picsum.photos/seed/leaf/40/40" alt="scan" className="w-full h-full object-cover rounded-lg opacity-80" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">Healthy Leaf</p>
                        <p className="text-xs text-slate-500">1 week ago</p>
                      </div>
                    </div>
                    <span className="badge badge-success text-[10px] px-2 py-0.5">Healthy</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-subtle flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                        <img src="https://picsum.photos/seed/leaf2/40/40" alt="scan" className="w-full h-full object-cover rounded-lg opacity-80" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">Yellow Rust Suspected</p>
                        <p className="text-xs text-slate-500">2 weeks ago</p>
                      </div>
                    </div>
                    <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-2 py-0.5">Warning</span>
                  </div>
                </div>
              </motion.div>
            </div>
            
          </>
        )}



        {/* EXISTING MARKETPLACE SECTIONS */}
        <h2 className="font-display text-2xl font-bold text-heading mb-6">Marketplace Activities</h2>

        {/* STATS CARDS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {user.user_type === 'farmer' ? (
            <>
              <StatCard title="Total Listings" value={stats?.totalListings || 0} icon={Package} color="blue" delay={0} />
              <StatCard title="Active Listings" value={stats?.activeListings || 0} icon={TrendingUp} color="green" delay={1} />
              <StatCard title="Sold Listings" value={stats?.soldListings || 0} icon={CheckCircle} color="amber" delay={2} />
              <StatCard title="Total Deals" value={stats?.totalDeals || 0} icon={Tag} color="purple" delay={3} />
            </>
          ) : (
            <>
              <StatCard title="Bids Placed" value={stats?.totalBidsPlaced || 0} icon={Tag} color="blue" delay={0} />
              <StatCard title="Accepted Purchases" value={stats?.acceptedPurchases || 0} icon={CheckCircle} color="green" delay={1} />
            </>
          )}
        </div>

        

        {/* FARMER SPECIFIC: My Marketplace Orders */}
        {user.user_type === 'farmer' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10">
            <h2 className="font-display text-xl font-bold text-heading mb-4">My Marketplace Orders</h2>
            {farmerOrders.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500">You haven't placed any orders yet.</div>
            ) : (
              <div className="space-y-4">
                {farmerOrders.map(order => (
                  <div key={order.id} className="glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-primary">
                    <div className="flex items-center gap-4">
                      <img 
                        src={order.seller_products?.image_urls?.[0] || order.seller_products?.image_url || 'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=100'} 
                        alt={order.seller_products?.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-subtle shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg text-heading line-clamp-1">{order.seller_products?.name || 'Unknown Product'}</h3>
                          <span className={`badge shrink-0 ${order.status === 'Completed' ? 'badge-success' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {order.status || 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">Ordered: {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right bg-primary/5 px-4 py-2 rounded-xl flex items-center gap-6">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Qty</p>
                        <p className="font-bold text-lg text-heading text-center">{order.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Total</p>
                        <p className="font-bold text-xl text-primary flex items-center">
                          <IndianRupee className="w-4 h-4 mr-0.5" />{order.total_amount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* BUYER SPECIFIC: My Bids */}
        {user.user_type === 'buyer' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="font-display text-xl font-bold text-heading mb-4">My Placed Bids</h2>
            {!stats?.myBids || stats.myBids.length === 0 ? (
              <div className="glass-card p-8 text-center text-slate-500">You haven't placed any bids yet.</div>
            ) : (
              <div className="space-y-4">
                {stats.myBids.map(bid => (
                  <div key={bid.id} className="glass-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-primary">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-heading">{bid.crop_listings?.crop_name || 'Unknown Crop'}</h3>
                        <span className={`badge ${bid.crop_listings?.status === 'SOLD' ? 'badge-success' : 'bg-blue-100 text-blue-700'}`}>
                          {bid.crop_listings?.status || 'UNKNOWN'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">Expected Price: ₹{bid.crop_listings?.expected_price}/Qtl</p>
                    </div>
                    <div className="text-left sm:text-right bg-primary/5 px-4 py-2 rounded-xl">
                      <p className="text-xs text-slate-500 mb-1">Your Bid Amount</p>
                      <p className="font-bold text-xl text-primary">₹{bid.bid_price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, delay }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
    green: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-800',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800'
  };

  return (
    <motion.div variants={fadeUp} custom={delay} className="glass-card p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-heading">{value}</p>
      </div>
    </motion.div>
  );
}

function ActionCard({ to, icon: Icon, label, color, bg }) {
  return (
    <Link to={to} className="group glass-card p-4 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-semibold text-heading">{label}</p>
    </Link>
  );
}
