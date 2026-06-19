import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Package, Tag, CheckCircle, TrendingUp, Loader2, Check } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [farmerListings, setFarmerListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Stats
      const statsRes = await fetch('http://localhost:5000/api/marketplace/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch Farmer Listings if Farmer
      if (user.user_type === 'farmer') {
        const listingsRes = await fetch('http://localhost:5000/api/marketplace/listings/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!listingsRes.ok) throw new Error('Failed to fetch your listings');
        const listingsData = await listingsRes.json();
        setFarmerListings(listingsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      
      // Refresh
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
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
              {user.user_type === 'farmer' ? 'Farmer Dashboard' : 'Buyer Dashboard'}
            </h1>
          </motion.div>
          <motion.p variants={fadeUp} className="text-slate-500">
            Overview of your marketplace activities
          </motion.p>
        </motion.div>

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

        {/* FARMER SPECIFIC: My Listings & Bids */}
        {user.user_type === 'farmer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold text-heading mb-4">Manage My Listings</h2>
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
        )}

        {/* BUYER SPECIFIC: My Bids */}
        {user.user_type === 'buyer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
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
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
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
