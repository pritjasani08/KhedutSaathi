import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboardOverview, useWeather, useSchemes, useAcceptBid } from './hooks/useDashboardQueries';
import { Package, Tag, CheckCircle, TrendingUp, Loader2, MapPin, Trees, Sprout, Activity, Zap, CloudRain, Droplets, Wind, IndianRupee, FileText, ArrowRight, Check } from 'lucide-react';
import MarketSnapshot from './components/MarketSnapshot';
import AIDailyBriefing from './components/AIDailyBriefing';
import { PageLayout, PageHeader, PageContent } from '../../components/shared/PageLayout';
import PageLoader from '../../components/shared/PageLoader';
import TimelineWorkspace from './components/TimelineWorkspace';

const Dashboard = () => {
  const { user } = useAuth();
  
  // 1. Fetch Overview (Business Logic preserved)
  const { data: overview, isLoading: isOverviewLoading, error: overviewError } = useDashboardOverview();
  
  // 2. Extract Data
  const { profile, stats, listings, orders } = overview || {};
  
  // 3. Dependent Hooks (Business Logic preserved)
  const { data: weather } = useWeather(profile);
  const { data: schemes } = useSchemes(profile);
  const { mutate: acceptBid, isPending: isAcceptingBid } = useAcceptBid();
  const [acceptingId, setAcceptingId] = useState(null);

  const handleAccept = (bidId) => {
    setAcceptingId(bidId);
    acceptBid(bidId, {
      onSuccess: () => {
        alert('Bid accepted successfully!');
        setAcceptingId(null);
      },
      onError: (err) => {
        alert('Error: ' + err.message);
        setAcceptingId(null);
      }
    });
  };

  if (overviewError) {
    return (
      <div className="min-h-screen pt-24 pb-16 gradient-bg flex items-center justify-center">
        <div className="glass-card p-8 text-center border-red-200">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-500 mb-4">{overviewError.message}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  if (isOverviewLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <PageLoader message="Loading dashboard..." />
      </div>
    );
  }

  const isFarmer = user?.user_type === 'farmer';

  return (
    <PageLayout>
      
      {/* 1. Page Header */}
      <PageHeader 
        title="Dashboard" 
        subtitle={
          <>
            <span>Manage your farm and monitor today's activities.</span>
            {profile && (
              <div className="flex items-center">
                <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mx-3"></span>
                <span className="flex items-center gap-1.5 text-primary">
                  <MapPin className="w-4 h-4"/> 
                  {profile.district || 'Location Not Set'}
                </span>
              </div>
            )}
          </>
        }
      />

      <PageContent>
        
        {/* NEW: AI Daily Briefing (Hero) */}
        {isFarmer && (
          <AIDailyBriefing profile={profile} weather={weather} schemes={schemes} />
        )}

        {/* Compact Analytics Strip */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-subtle overflow-hidden mb-10">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-subtle bg-slate-50/50 dark:bg-slate-900/20">
            {isFarmer ? (
              <>
                <StripMetric label="Farm Size" value={profile?.farm_size ? `${profile.farm_size} Ac` : '-'} icon={Trees} color="text-green-600" bg="bg-green-100 dark:bg-green-500/20" />
                <StripMetric label="Listings" value={stats?.totalListings || 0} icon={Package} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-500/20" />
                <StripMetric label="Active" value={stats?.activeListings || 0} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-100 dark:bg-indigo-500/20" />
                <StripMetric label="Sold" value={stats?.soldListings || 0} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-500/20" />
                <StripMetric label="Deals" value={stats?.totalDeals || 0} icon={Tag} color="text-purple-600" bg="bg-purple-100 dark:bg-purple-500/20" />
              </>
            ) : (
              <>
                <StripMetric label="Bids Placed" value={stats?.totalBidsPlaced || 0} icon={Tag} color="text-blue-600" bg="bg-blue-100 dark:bg-blue-500/20" />
                <StripMetric label="Purchases" value={stats?.acceptedPurchases || 0} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-500/20" />
                <div className="hidden md:block col-span-3"></div>
              </>
            )}
          </div>
        </div>

        {/* FARMER JOURNEY ARCHITECTURE */}
        {isFarmer && (
          <div className="flex flex-col gap-10">
            
            {/* 1. IMMEDIATE ACTIONS (Operational) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              
              {/* Left: AI Timeline Workspace */}
              <div className="flex flex-col h-full min-h-[400px]">
                <TimelineWorkspace />
              </div>

              {/* Right: Orders Table */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="font-display font-bold text-heading text-lg flex items-center gap-2.5">
                    <Package className="w-5 h-5 text-primary" /> Procurement Orders
                  </h2>
                </div>
                <div className="glass-card overflow-hidden shadow-sm flex-1">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-subtle text-slate-500 font-semibold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-4">Order Date</th>
                          <th className="px-5 py-4">Product</th>
                          <th className="px-5 py-4">Amount</th>
                          <th className="px-5 py-4 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-subtle">
                        {orders?.length > 0 ? orders.slice(0, 3).map(order => (
                          <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-4 text-slate-500 font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="px-5 py-4 font-semibold text-heading">
                               <div className="flex items-center gap-3">
                                 {order.seller_products?.image_url && <img src={order.seller_products.image_url} className="w-8 h-8 rounded-lg object-cover border border-subtle" alt="" />}
                                 {order.seller_products?.name || 'Unknown Product'}
                               </div>
                            </td>
                            <td className="px-5 py-4 font-bold text-heading">₹{order.total_amount}</td>
                            <td className="px-5 py-4 text-right">
                              <span className={`badge px-2.5 py-1 text-xs ${order.status === 'Completed' ? 'badge-success' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="4" className="px-5 py-8 text-center text-sm text-slate-500">No active procurement orders.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {orders?.length > 3 && (
                     <div className="p-3 text-center border-t border-subtle bg-slate-50/50 dark:bg-slate-900/20">
                        <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">View All Orders</span>
                     </div>
                  )}
                </div>
              </div>

            </div>

            {/* 2. TACTICAL (Farm & Weather) */}
            <section className="glass-card flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-subtle overflow-hidden shadow-sm h-full">
              
              {/* Left: Property List */}
              <div className="flex-1 p-8 flex flex-col">
                <h2 className="font-display font-bold text-heading flex items-center gap-2.5 text-xl mb-6">
                  <Sprout className="w-6 h-6 text-primary" /> My Farm Profile
                </h2>
                <div className="flex flex-col flex-1 justify-center">
                  <PropertyRow label="Primary Crop" value={profile?.primary_crop || 'Not Set'} highlight />
                  <PropertyRow label="Soil Type" value={profile?.soil_type || 'Unknown'} />
                  <PropertyRow label="Irrigation System" value={profile?.irrigation_type || 'Unknown'} />
                  <PropertyRow label="Category" value={profile?.farmer_category || 'Unknown'} />
                </div>
              </div>

              {/* Right: Weather Native Integration */}
              <div className="md:w-[45%] p-8 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-900/10 dark:to-cyan-900/10 flex flex-col">
                <h2 className="font-display font-bold text-heading flex items-center gap-2.5 text-xl mb-6">
                  <CloudRain className="w-6 h-6 text-blue-500" /> Weather Advisory
                </h2>
                {weather ? (
                  <div className="flex flex-col flex-1 justify-center gap-8">
                    <div className="flex items-center gap-5 mt-auto">
                      <span className="text-6xl font-display font-bold text-heading tracking-tight">{weather.temperature}°C</span>
                      <span className="text-base font-semibold text-blue-700 dark:text-blue-300 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-full shadow-sm">{weather.condition}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-5 text-sm mt-auto">
                        <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-xl border border-subtle flex flex-col items-center justify-center text-center shadow-sm aspect-[4/3] w-full">
                          <Droplets className="w-6 h-6 text-blue-500 mb-2.5" />
                          <span className="text-sm font-medium text-slate-500 mb-1">Precipitation</span>
                          <span className="text-xl font-bold text-heading">{weather.rainProbability}%</span>
                        </div>
                        <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-xl border border-subtle flex flex-col items-center justify-center text-center shadow-sm aspect-[4/3] w-full">
                          <Wind className="w-6 h-6 text-blue-500 mb-2.5" />
                          <span className="text-sm font-medium text-slate-500 mb-1">Wind Speed</span>
                          <span className="text-xl font-bold text-heading">{weather.windSpeed} km/h</span>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-base text-slate-500 pt-4 flex-1 flex items-center">Weather data unavailable for this location.</div>
                )}
              </div>
            </section>

            {/* 3. STRATEGIC (Market & Schemes) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-stretch">
              
              <div className="xl:col-span-1">
                {/* Market Intelligence Trading Terminal */}
                <MarketSnapshot profileData={profile} />
              </div>

              <div className="xl:col-span-2">
                {/* Government Schemes List View */}
                <section className="glass-card flex flex-col h-full overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-subtle flex justify-between items-center bg-green-50/50 dark:bg-green-900/10">
                    <h2 className="font-display font-bold text-heading flex items-center gap-2.5 text-lg">
                      <FileText className="w-5 h-5 text-green-500" /> Eligible Schemes
                    </h2>
                    <span className="badge badge-success px-2.5 py-1 text-xs">
                      {schemes?.data ? schemes.data.length : '0'} Active
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-0 divide-y divide-subtle max-h-[450px]">
                    {schemes?.data && schemes.data.length > 0 ? (
                      schemes.data.map((scheme, idx) => (
                        <div key={idx} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                          <h4 className="text-base font-bold text-heading mb-3 group-hover:text-primary transition-colors leading-snug">{scheme.schemeName || 'Government Scheme'}</h4>
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Benefit Summary</span>
                              <span className="font-semibold text-green-600 dark:text-green-400">{scheme.benefits ? 'Financial Support' : 'Advisory Support'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">Eligibility</span>
                              <span className="font-semibold text-heading capitalize">{profile?.farmer_category || 'All Farmers'}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-10 text-center text-sm text-slate-500">
                        No matching schemes found for your profile.
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-subtle bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                     <span className="text-sm font-semibold text-slate-500">Total Potential Value</span>
                     <span className="text-xl font-display font-bold text-green-600 dark:text-green-400">
                       ₹{schemes?.totalBenefit ? schemes.totalBenefit.toLocaleString('en-IN') : '0'}
                     </span>
                  </div>
                </section>
              </div>

            </div>

          </div>
        )}
        
        {/* BUYER SPECIFIC UI (Tabular) */}
        {!isFarmer && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6 px-1">
              <h2 className="font-display font-bold text-heading text-xl flex items-center gap-2.5">
                <Tag className="w-6 h-6 text-primary" /> Bids Placed
              </h2>
            </div>
            <div className="glass-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-subtle text-slate-500 font-semibold text-sm">
                    <tr>
                      <th className="px-6 py-5">Listing</th>
                      <th className="px-6 py-5">Expected Price</th>
                      <th className="px-6 py-5">My Bid</th>
                      <th className="px-6 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-subtle">
                    {stats?.myBids?.length > 0 ? stats.myBids.map(bid => (
                      <tr key={bid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5 font-bold text-heading text-base">{bid.crop_listings?.crop_name || 'Unknown'}</td>
                        <td className="px-6 py-5 text-slate-600 dark:text-slate-300 font-medium text-base">₹{bid.crop_listings?.expected_price}/Qtl</td>
                        <td className="px-6 py-5 font-bold text-primary text-lg">₹{bid.bid_price}</td>
                        <td className="px-6 py-5 text-right">
                          <span className={`badge px-3 py-1 ${bid.crop_listings?.status === 'SOLD' ? 'badge-success' : 'bg-blue-100 text-blue-700'}`}>
                            {bid.crop_listings?.status || 'OPEN'}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="px-6 py-10 text-center text-base text-slate-500">You haven't placed any bids yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </PageContent>
    </PageLayout>
  );
};

export default Dashboard;

// Structural Presentation Components
function StripMetric({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg ${bg} ${color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-display font-bold text-heading">{value}</span>
    </div>
  );
}


function PropertyRow({ label, value, highlight }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4 border-b border-subtle last:border-0 items-center">
      <span className="col-span-1 text-base font-medium text-slate-500">{label}</span>
      <span className={`col-span-2 text-base font-bold ${highlight ? 'text-primary text-lg' : 'text-heading'}`}>{value}</span>
    </div>
  );
}
