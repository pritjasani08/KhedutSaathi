import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useDashboardOverview, useWeather, useSchemes, useAcceptBid } from './hooks/useDashboardQueries';
import { Package, Tag, CheckCircle, TrendingUp, Loader2, MapPin, Trees, Sprout, Activity, Zap, CloudRain, Droplets, Wind, IndianRupee, FileText, ArrowRight, Check } from 'lucide-react';
import MarketSnapshot from './components/MarketSnapshot';

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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isFarmer = user?.user_type === 'farmer';

  return (
    <div className="min-h-screen gradient-bg pt-16 pb-24 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30">
      
      {/* 1. Header & Analytics Strip (Combined Edge-to-Edge) */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-subtle sticky top-16 z-20 shadow-sm">
        <div className="max-w-[1440px] mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-heading mb-2">Dashboard</h1>
              <div className="flex items-center gap-2 text-base text-slate-500 font-medium">
                <span>Manage your farm and monitor today's activities.</span>
                {profile && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mx-2"></span>
                    <span className="flex items-center gap-1.5 text-primary">
                      <MapPin className="w-4 h-4"/> 
                      {profile.district || 'Location Not Set'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* 2. Command Dock */}
            <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-800/50 p-2 rounded-2xl border border-subtle overflow-x-auto hide-scrollbar shadow-sm">
              {isFarmer && (
                <>
                  <DockButton to="/crop-health" icon={Activity} label="Health" />
                  <DockButton to="/crop-recommendation" icon={Sprout} label="Recs" />
                  <DockButton to="/smart-irrigation" icon={Droplets} label="Water" />
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                </>
              )}
              <DockButton to="/khedut-ai" icon={Zap} label="Ask AI" highlight />
              <DockButton to="/marketplace" icon={Package} label="Market" />
            </div>
          </div>

          {/* Analytics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-subtle border-t border-subtle bg-slate-50/50 dark:bg-slate-900/20">
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
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* ABOVE THE FOLD ARCHITECTURE */}
        {isFarmer && (
          <div className="flex flex-col gap-10">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-stretch">
              
              {/* Left Column (Farm Workspace & Weather) */}
              <div className="xl:col-span-2">
                {/* 3. Farm Overview Workspace (Split Pane) */}
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
              </div>

              {/* Right Column (Terminal) */}
              <div className="xl:col-span-1">
                {/* 5. Market Intelligence Trading Terminal */}
                <MarketSnapshot profileData={profile} />
              </div>

            </div>

            {/* 4. AI Daily Intelligence Panel (Full Width Inline Banner) */}
            <section className="glass-card p-10 flex flex-col sm:flex-row gap-8 items-start sm:items-center bg-gradient-to-r from-amber-500/5 to-primary/5 border-amber-200/50 dark:border-amber-800/30 relative overflow-hidden shadow-sm w-full">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-primary"></div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-sm my-auto">
                <Zap className="w-7 h-7" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-display font-bold text-heading text-xl mb-3">Khedut AI Assistant</h3>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                  {profile?.primary_crop 
                    ? `Based on your farm profile, maintain focus on ${profile.primary_crop}. ${weather?.advisory ? weather.advisory : 'Conditions look favorable for regular operations.'}` 
                    : `Complete your farm profile to receive personalized daily recommendations.`}
                </p>
              </div>
              <Link to="/khedut-ai" className="btn-primary !py-3.5 !px-8 text-base flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all sm:my-auto h-fit">
                Chat with AI <ArrowRight className="w-5 h-5" />
              </Link>
            </section>

          </div>
        )}

        {/* BELOW THE FOLD ARCHITECTURE */}
        {isFarmer && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 pt-10 border-t border-subtle">
            
            <div className="xl:col-span-8 flex flex-col gap-10">
              {/* 6. Activity Data Tables */}
              <section className="space-y-10">
                
                {/* Orders Table */}
                <div>
                  <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="font-display font-bold text-heading text-xl flex items-center gap-2.5">
                      <Package className="w-6 h-6 text-primary" /> Procurement Orders
                    </h2>
                  </div>
                  <div className="glass-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-subtle text-slate-500 font-semibold text-sm">
                          <tr>
                            <th className="px-6 py-5">Order Date</th>
                            <th className="px-6 py-5">Product</th>
                            <th className="px-6 py-5">Total Amount</th>
                            <th className="px-6 py-5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle">
                          {orders?.length > 0 ? orders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-5 text-slate-500 font-medium">{new Date(order.created_at).toLocaleDateString()}</td>
                              <td className="px-6 py-5 font-semibold text-heading text-base">
                                 <div className="flex items-center gap-4">
                                   {order.seller_products?.image_url && <img src={order.seller_products.image_url} className="w-10 h-10 rounded-xl object-cover border border-subtle" alt="" />}
                                   {order.seller_products?.name || 'Unknown Product'}
                                 </div>
                              </td>
                              <td className="px-6 py-5 font-bold text-heading text-base">₹{order.total_amount}</td>
                              <td className="px-6 py-5 text-right">
                                <span className={`badge px-3 py-1 text-xs ${order.status === 'Completed' ? 'badge-success' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                                  {order.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          )) : (
                            <tr><td colSpan="4" className="px-6 py-10 text-center text-base text-slate-500">No procurement orders found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Bids Table */}
                <div>
                  <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="font-display font-bold text-heading text-xl flex items-center gap-2.5">
                      <Tag className="w-6 h-6 text-primary" /> Active Bids on Listings
                    </h2>
                  </div>
                  <div className="glass-card overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-subtle text-slate-500 font-semibold text-sm">
                          <tr>
                            <th className="px-6 py-5">Listing</th>
                            <th className="px-6 py-5">Bidder</th>
                            <th className="px-6 py-5">Bid Amount</th>
                            <th className="px-6 py-5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle">
                          {listings?.some(l => l.bids?.length > 0) ? listings.flatMap(listing => 
                            listing.bids.map(bid => (
                              <tr key={bid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-5 font-bold text-heading text-base">
                                  <div className="flex flex-col gap-1">
                                    <span>{listing.crop_name}</span>
                                    <span className="text-sm text-slate-500 font-medium">Target: ₹{listing.expected_price}/Qtl</span>
                                  </div>
                                </td>
                                <td className="px-6 py-5 text-slate-600 dark:text-slate-300 font-medium">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shadow-sm">
                                      {bid.users?.first_name?.[0] || 'U'}
                                    </div>
                                    {bid.users?.first_name} {bid.users?.last_name}
                                  </div>
                                </td>
                                <td className="px-6 py-5 font-bold text-primary text-lg">₹{bid.bid_price}</td>
                                <td className="px-6 py-5 text-right">
                                  {listing.status === 'OPEN' ? (
                                    <button
                                      onClick={() => handleAccept(bid.id)}
                                      disabled={isAcceptingBid && acceptingId === bid.id}
                                      className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2 ml-auto shadow-sm"
                                    >
                                      {isAcceptingBid && acceptingId === bid.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                      Accept Bid
                                    </button>
                                  ) : (
                                    <span className={`badge px-3 py-1 ${listing.status === 'SOLD' ? 'badge-success' : 'bg-slate-100 text-slate-700'}`}>{listing.status}</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr><td colSpan="4" className="px-6 py-10 text-center text-base text-slate-500">No active bids found on your listings.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </section>
            </div>

            {/* 7. Government Schemes List View */}
            <div className="xl:col-span-4">
              <section className="glass-card flex flex-col h-full overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-subtle flex justify-between items-center bg-green-50/50 dark:bg-green-900/10">
                  <h2 className="font-display font-bold text-heading flex items-center gap-2.5 text-xl">
                    <FileText className="w-6 h-6 text-green-500" /> Eligible Schemes
                  </h2>
                  <span className="badge badge-success px-3 py-1 text-sm">
                    {schemes?.data ? schemes.data.length : '0'} Active
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0 divide-y divide-subtle max-h-[700px]">
                  {schemes?.data && schemes.data.length > 0 ? (
                    schemes.data.map((scheme, idx) => (
                      <div key={idx} className="p-8 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <h4 className="text-lg font-bold text-heading mb-4 group-hover:text-primary transition-colors leading-snug">{scheme.schemeName || 'Government Scheme'}</h4>
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center text-base">
                            <span className="text-slate-500">Benefit Summary</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">{scheme.benefits ? 'Financial Support' : 'Advisory Support'}</span>
                          </div>
                          <div className="flex justify-between items-center text-base">
                            <span className="text-slate-500">Eligibility</span>
                            <span className="font-semibold text-heading capitalize">{profile?.farmer_category || 'All Farmers'}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-base text-slate-500">
                      No matching schemes found for your profile.
                    </div>
                  )}
                </div>

                <div className="px-8 py-6 border-t border-subtle bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                   <span className="text-base font-semibold text-slate-500">Total Potential Value</span>
                   <span className="text-2xl font-display font-bold text-green-600 dark:text-green-400">
                     ₹{schemes?.totalBenefit ? schemes.totalBenefit.toLocaleString('en-IN') : '0'}
                   </span>
                </div>
              </section>
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

      </main>
    </div>
  );
};

export default Dashboard;

// Structural Presentation Components
function StripMetric({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="px-4 sm:px-8 py-5 flex items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </div>
      <span className="text-2xl font-display font-bold text-heading">{value}</span>
    </div>
  );
}

function DockButton({ to, icon: Icon, label, highlight }) {
  return (
    <Link to={to} className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 ${highlight ? 'bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-sm'}`}>
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
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
