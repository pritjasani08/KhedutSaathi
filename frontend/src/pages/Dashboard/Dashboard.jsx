import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase/client';
import { Package, Tag, CheckCircle, TrendingUp, Loader2, MapPin, Trees, Sprout, Activity, Zap, CloudRain, LineChart, Droplets, Wind, IndianRupee, FileText, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import MarketSnapshot from '../../features/dashboard/components/MarketSnapshot';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [farmerListings, setFarmerListings] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [schemes, setSchemes] = useState(null);
  const [weather, setWeather] = useState(null);
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
      
      if (user.user_type === 'farmer') {
        const profileRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const pData = await profileRes.json();
          setProfileData(pData.profile);
          setCompletionPercentage(pData.completionPercentage || 0);

          if (pData.profile) {
            try {
              const schemeRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/schemes/eligible`, {
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

            try {
              const wRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/resources/weather?region=${pData.profile.state || 'Gujarat'}`);
              if (wRes.ok) {
                const wData = await wRes.json();
                if (wData.success) setWeather(wData.data);
              }
            } catch(e) { console.error(e); }
          }
        }
      }

      const statsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketplace/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (user.user_type === 'farmer') {
        const listingsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketplace/listings/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setFarmerListings(listingsData || []);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketplace/bids/${bidId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      await fetchDashboardData();
      alert('Bid accepted successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setAcceptLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  const isFarmer = user.user_type === 'farmer';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] pt-16 pb-20 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* 1. Header & Analytics Strip (Combined Edge-to-Edge) */}
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-slate-200 dark:border-slate-800 sticky top-16 z-20">
        <div className="max-w-[1440px] mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Operations Center</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                <span>{user.first_name}</span>
                {profileData && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {profileData.district || 'Loc Not Set'}</span>
                  </>
                )}
              </div>
            </div>

            {/* 2. Command Dock */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto hide-scrollbar">
              {isFarmer && (
                <>
                  <DockButton to="/crop-health" icon={Activity} label="Health" />
                  <DockButton to="/crop-recommendation" icon={Sprout} label="Recs" />
                  <DockButton to="/smart-irrigation" icon={Droplets} label="Water" />
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                </>
              )}
              <DockButton to="/khedut-ai" icon={Zap} label="Ask AI" highlight />
              <DockButton to="/marketplace" icon={Package} label="Market" />
            </div>
          </div>

          {/* Analytics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-slate-200 dark:divide-slate-800 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0a0a0a]">
            {isFarmer ? (
              <>
                <StripMetric label="Farm Size" value={profileData?.farm_size ? `${profileData.farm_size} Ac` : '-'} icon={Trees} />
                <StripMetric label="Listings" value={stats?.totalListings || 0} icon={Package} />
                <StripMetric label="Active" value={stats?.activeListings || 0} icon={TrendingUp} />
                <StripMetric label="Sold" value={stats?.soldListings || 0} icon={CheckCircle} />
                <StripMetric label="Deals" value={stats?.totalDeals || 0} icon={Tag} />
              </>
            ) : (
              <>
                <StripMetric label="Bids Placed" value={stats?.totalBidsPlaced || 0} icon={Tag} />
                <StripMetric label="Purchases" value={stats?.acceptedPurchases || 0} icon={CheckCircle} />
                <div className="hidden md:block col-span-3"></div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ABOVE THE FOLD ARCHITECTURE */}
        {isFarmer && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Column (Farm Workspace & AI Insights) */}
            <div className="xl:col-span-8 flex flex-col gap-6">
              
              {/* 3. Farm Overview Workspace (Split Pane) */}
              <section className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                
                {/* Left: Property List */}
                <div className="flex-1 p-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <Sprout className="w-3.5 h-3.5" /> Core Parameters
                  </h2>
                  <div className="space-y-0">
                    <PropertyRow label="Primary Crop" value={profileData?.primary_crop || 'Not Set'} highlight />
                    <PropertyRow label="Soil Type" value={profileData?.soil_type || 'Unknown'} />
                    <PropertyRow label="Irrigation System" value={profileData?.irrigation_type || 'Unknown'} />
                    <PropertyRow label="Category" value={profileData?.farmer_category || 'Unknown'} />
                  </div>
                </div>

                {/* Right: Weather Native Integration */}
                <div className="md:w-[45%] p-5 bg-slate-50 dark:bg-slate-900/20">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <CloudRain className="w-3.5 h-3.5" /> Meteorological Data
                  </h2>
                  {weather ? (
                    <div className="flex flex-col h-full justify-between pb-1">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-light tracking-tighter font-mono">{weather.temperature}°</span>
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{weather.condition}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                         <div className="flex flex-col">
                           <span className="text-[10px] uppercase text-slate-400 mb-0.5">Precipitation</span>
                           <span>{weather.rainProbability}% Prob</span>
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[10px] uppercase text-slate-400 mb-0.5">Wind Velocity</span>
                           <span>{weather.windSpeed} km/h</span>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-mono">No telemetry data.</div>
                  )}
                </div>
              </section>

              {/* 4. AI Daily Intelligence Panel (Inline Banner) */}
              <section className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 mb-1">Active Recommendation</h3>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-snug">
                    {profileData?.primary_crop 
                      ? `Based on ${weather?.rainProbability > 30 ? 'high precipitation' : 'current conditions'}, maintain focus on ${profileData.primary_crop}. ${weather?.advisory ? weather.advisory : ''}` 
                      : `Complete farm profile to generate targeted intelligence.`}
                  </p>
                </div>
                <Link to="/khedut-ai" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap flex items-center gap-1 hover:underline">
                  Open AI <ArrowRight className="w-3 h-3" />
                </Link>
              </section>

            </div>

            {/* Right Column (Terminal) */}
            <div className="xl:col-span-4">
              {/* 5. Market Intelligence Trading Terminal */}
              <MarketSnapshot profileData={profileData} />
            </div>

          </div>
        )}

        {/* BELOW THE FOLD ARCHITECTURE */}
        {isFarmer && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            
            <div className="xl:col-span-8 flex flex-col gap-6">
              {/* 6. Activity Data Tables */}
              <section className="space-y-6">
                
                {/* Orders Table */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-slate-400" /> Procurement Orders
                    </h2>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Order Date</th>
                          <th className="px-4 py-3 font-semibold">Product</th>
                          <th className="px-4 py-3 font-semibold">Amount</th>
                          <th className="px-4 py-3 font-semibold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {farmerOrders?.length > 0 ? farmerOrders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="px-4 py-3 text-slate-500 font-mono text-xs">{new Date(order.created_at).toISOString().split('T')[0]}</td>
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                               <div className="flex items-center gap-2">
                                 {order.seller_products?.image_url && <img src={order.seller_products.image_url} className="w-5 h-5 rounded object-cover" alt="" />}
                                 {order.seller_products?.name || 'Unknown'}
                               </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-900 dark:text-slate-100">₹{order.total_amount}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="4" className="px-4 py-6 text-center text-xs text-slate-500">No procurement orders found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bids Table */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" /> Active Bids on Listings
                    </h2>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Listing</th>
                          <th className="px-4 py-3 font-semibold">Bidder</th>
                          <th className="px-4 py-3 font-semibold">Bid Amount</th>
                          <th className="px-4 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {farmerListings?.some(l => l.bids.length > 0) ? farmerListings.flatMap(listing => 
                          listing.bids.map(bid => (
                            <tr key={bid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                <div className="flex flex-col">
                                  <span>{listing.crop_name}</span>
                                  <span className="text-[10px] text-slate-500 uppercase">Target: ₹{listing.expected_price}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                                {bid.users?.first_name} {bid.users?.last_name}
                              </td>
                              <td className="px-4 py-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">₹{bid.bid_price}</td>
                              <td className="px-4 py-3 text-right">
                                {listing.status === 'OPEN' ? (
                                  <button
                                    onClick={() => handleAcceptBid(bid.id)}
                                    disabled={acceptLoading === bid.id}
                                    className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50"
                                  >
                                    {acceptLoading === bid.id ? 'Processing...' : 'Accept'}
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{listing.status}</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="4" className="px-4 py-6 text-center text-xs text-slate-500">No active bids found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </section>
            </div>

            {/* 7. Government Schemes List View */}
            <div className="xl:col-span-4">
              <section className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-slate-800 flex flex-col h-full">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" /> Eligible Schemes
                  </h2>
                  <span className="text-xs font-mono font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                    {schemes?.data ? schemes.data.length : '0'} Active
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0 divide-y divide-slate-100 dark:divide-slate-800/50">
                  {schemes?.data && schemes.data.length > 0 ? (
                    schemes.data.map((scheme, idx) => (
                      <div key={idx} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 leading-tight">{scheme.schemeName || 'Government Scheme'}</h4>
                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="flex justify-between items-end text-xs">
                            <span className="text-slate-500">Benefit Summary</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">{scheme.benefits ? 'Financial Support' : 'Advisory'}</span>
                          </div>
                          <div className="flex justify-between items-end text-xs mt-1">
                            <span className="text-slate-500">Eligibility</span>
                            <span className="text-slate-700 dark:text-slate-300 capitalize">{profileData?.farmer_category || 'All Farmers'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No matching schemes found.
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                   <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Total Potential Value</span>
                   <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                     ₹{schemes?.totalBenefit ? schemes.totalBenefit.toLocaleString('en-IN') : '0'}
                   </span>
                </div>
              </section>
            </div>

          </div>
        )}
        
        {/* BUYER SPECIFIC UI (Tabular) */}
        {!isFarmer && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" /> Bids Placed
              </h2>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a0a] overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Listing</th>
                    <th className="px-4 py-3 font-semibold">Expected</th>
                    <th className="px-4 py-3 font-semibold">My Bid</th>
                    <th className="px-4 py-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats?.myBids?.length > 0 ? stats.myBids.map(bid => (
                    <tr key={bid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{bid.crop_listings?.crop_name || 'Unknown'}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">₹{bid.crop_listings?.expected_price}</td>
                      <td className="px-4 py-3 font-mono font-medium text-indigo-600 dark:text-indigo-400">₹{bid.bid_price}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded ${bid.crop_listings?.status === 'SOLD' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {bid.crop_listings?.status || 'OPEN'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="px-4 py-6 text-center text-xs text-slate-500">You haven't placed any bids.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

// Subcomponents for the new architecture
function StripMetric({ label, value, icon: Icon }) {
  return (
    <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function DockButton({ to, icon: Icon, label, highlight }) {
  return (
    <Link to={to} className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-colors ${highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

function PropertyRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>{value}</span>
    </div>
  );
}
