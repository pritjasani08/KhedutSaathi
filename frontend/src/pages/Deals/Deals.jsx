import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, Phone, User, MapPin, IndianRupee, Loader2, Package, 
  CheckCircle2, XCircle, Clock, Tag, ShieldCheck, AlertCircle 
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function Deals() {
  const { user } = useAuth();
  const isFarmer = user?.user_type === 'farmer';

  const [activeTab, setActiveTab] = useState(isFarmer ? 'incoming' : 'closed');
  const [incomingBids, setIncomingBids] = useState([]);
  const [closedDeals, setClosedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchIncomingBids = async () => {
    if (!isFarmer) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketplace/bids/incoming`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncomingBids(data);
      }
    } catch (err) {
      console.error('Error fetching incoming bids:', err);
    }
  };

  const fetchClosedDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketplace/deals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClosedDeals(data);
      }
    } catch (err) {
      console.error('Error fetching closed deals:', err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([
        isFarmer ? fetchIncomingBids() : Promise.resolve(),
        fetchClosedDeals()
      ]);
    } catch (err) {
      setError(err.message || 'Failed to load deals data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user?.user_type]);

  const handleAcceptBid = async (bidId) => {
    setActionLoadingId(bidId);
    setActionSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketplace/bids/${bidId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to accept bid');

      setActionSuccessMsg('Bid accepted! Deal closed and moved to Closed Deals.');
      await Promise.all([fetchIncomingBids(), fetchClosedDeals()]);
      setActiveTab('closed');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectBid = async (bidId) => {
    if (!window.confirm('Are you sure you want to reject this bid? It will be permanently removed.')) return;
    
    setActionLoadingId(bidId);
    setActionSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/marketplace/bids/${bidId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reject bid');

      setActionSuccessMsg('Bid rejected and removed.');
      await fetchIncomingBids();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg pt-24 pb-16">
        <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="w-64 h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-2" />
            <div className="w-96 h-5 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 border-l-4 border-l-slate-200 dark:border-l-slate-800 flex flex-col md:flex-row gap-6 animate-pulse">
                <div className="flex-1 space-y-4">
                  <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  <div className="w-64 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="flex gap-4">
                    <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="md:w-80 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-5 h-32" />
              </div>
            ))}
          </div>
        </div>
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
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="mb-8"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="font-display text-3xl font-bold text-heading">
              My Deals
            </h1>
          </motion.div>
          <motion.p variants={fadeUp} className="text-slate-500">
            {isFarmer 
              ? "Manage incoming bids from buyers and access contact details for closed deals."
              : "Track your active crop purchases and farmer contact information."}
          </motion.p>
        </motion.div>

        {/* Success Banner */}
        {actionSuccessMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 flex items-center gap-3 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </motion.div>
        )}

        {/* Tab Navigation */}
        {isFarmer && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-8">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`pb-4 font-semibold text-base flex items-center gap-2 border-b-2 transition-colors relative ${
                activeTab === 'incoming'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Clock className="w-5 h-5" />
              Incoming Bids
              {incomingBids.length > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold">
                  {incomingBids.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('closed')}
              className={`pb-4 font-semibold text-base flex items-center gap-2 border-b-2 transition-colors relative ${
                activeTab === 'closed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              Closed Deals
              {closedDeals.length > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-bold">
                  {closedDeals.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* TAB 1: INCOMING BIDS (Farmer Only) */}
        {activeTab === 'incoming' && isFarmer && (
          <div>
            {incomingBids.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No incoming bids</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  When a buyer places a bid on your listed crops in "Sell Your Yield", it will appear here for you to accept or reject.
                </p>
              </div>
            ) : (
              <motion.div
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                className="space-y-6"
              >
                {incomingBids.map((bid, i) => {
                  const isProcessing = actionLoadingId === bid.id;
                  const listing = bid.crop_listings || {};
                  const buyer = bid.buyer || {};

                  return (
                    <motion.div 
                      key={bid.id} 
                      variants={fadeUp} 
                      custom={i} 
                      className="glass-card p-6 border-l-4 border-l-amber-500 relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                        {/* Listing & Bid Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Pending Bid
                            </span>
                            <span className="text-sm text-slate-400">
                              {new Date(bid.created_at).toLocaleString()}
                            </span>
                          </div>

                          <h3 className="font-display text-2xl font-bold text-heading mb-2">
                            {listing.crop_name || 'Crop Listing'}
                          </h3>

                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300 mb-4">
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4 text-slate-400" /> {listing.quantity_quintals} Quintals
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-slate-400" /> {listing.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="w-4 h-4 text-slate-400" /> Expected: ₹{listing.expected_price}/qtl
                            </span>
                          </div>

                          {/* Highlighted Buyer Bid Offer */}
                          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 inline-block mb-4">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Buyer's Offereed Price</p>
                            <p className="text-2xl font-extrabold text-primary flex items-center gap-1">
                              <IndianRupee className="w-6 h-6" /> ₹{bid.bid_price} <span className="text-xs font-normal text-slate-500">/ quintal</span>
                            </p>
                          </div>
                        </div>

                        {/* Buyer Info & Actions */}
                        <div className="md:w-80 bg-surface-muted rounded-xl p-5 border border-subtle flex flex-col justify-between h-fit gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Buyer Information</p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-bold">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-heading">
                                  {buyer.first_name ? `${buyer.first_name} ${buyer.last_name || ''}` : 'Buyer'}
                                </p>
                                <p className="text-xs text-slate-500">Interested Buyer</p>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => handleAcceptBid(bid.id)}
                              disabled={isProcessing}
                              className="flex-1 btn-primary py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all shadow-sm disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4" /> Accept
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleRejectBid(bid.id)}
                              disabled={isProcessing}
                              className="py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4" /> Reject
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 2: CLOSED DEALS (Both Farmers & Buyers) */}
        {(activeTab === 'closed' || !isFarmer) && (
          <div>
            {closedDeals.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No closed deals yet</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  When a bid is accepted, the deal is closed and full contact details appear here.
                </p>
              </div>
            ) : (
              <motion.div
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                className="space-y-6"
              >
                {closedDeals.map((deal, i) => {
                  const otherParty = isFarmer ? deal.buyer : deal.farmer;
                  const roleLabel = isFarmer ? 'Buyer' : 'Farmer';
                  const listing = deal.crop_listings || {};

                  return (
                    <motion.div 
                      key={deal.id} 
                      variants={fadeUp} 
                      custom={i} 
                      className="glass-card p-6 border-l-4 border-l-primary relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Briefcase className="w-32 h-32" />
                      </div>
                      
                      <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                        {/* Listing Summary */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="badge-success flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> ACCEPTED DEAL
                            </span>
                            <span className="text-sm text-slate-400">
                              {new Date(deal.accepted_at).toLocaleString()}
                            </span>
                          </div>
                          
                          <h3 className="font-display text-2xl font-bold text-heading mb-2">
                            {listing.crop_name || 'Crop'}
                          </h3>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300 mb-6">
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4 text-slate-400" /> {listing.quantity_quintals} Quintals
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-slate-400" /> {listing.location}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-primary">
                              <IndianRupee className="w-4 h-4" /> Final Price: ₹{deal.final_price}
                            </span>
                          </div>
                        </div>

                        {/* Contact Details Panel */}
                        <div className="md:w-80 bg-surface-muted rounded-xl p-5 border border-subtle h-fit">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            {roleLabel} Contact Details
                          </p>
                          
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 flex items-center justify-center font-bold">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-heading">
                                  {otherParty?.first_name || 'Verified'} {otherParty?.last_name || roleLabel}
                                </p>
                                <p className="text-xs text-slate-500">Verified {roleLabel}</p>
                              </div>
                            </div>
                            
                            {otherParty?.mobile ? (
                              <a 
                                href={`tel:${otherParty.mobile}`} 
                                className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-subtle hover:border-primary transition-colors group shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <Phone className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {otherParty.mobile}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                  Call
                                </span>
                              </a>
                            ) : (
                              <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-xs text-slate-500 italic">
                                Phone number not provided
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
