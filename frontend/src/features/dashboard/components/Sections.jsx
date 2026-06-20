import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Zap, Leaf, IndianRupee, Loader2, Check } from 'lucide-react';
import { useNews, useAcceptBid } from '../hooks/useDashboardQueries';
import { NewsSkeleton } from '../skeletons/Skeletons';
import { ErrorBoundary } from './ErrorBoundary';

export const NewsSection = ({ profile }) => {
  const { data: news, isLoading, error } = useNews(profile);

  if (isLoading) return (
    <div className="mb-10 glass-card p-6 mt-8">
      <h3 className="font-display font-bold text-heading text-lg mb-4">Latest News for You</h3>
      <NewsSkeleton />
    </div>
  );
  if (error) throw error;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mb-10 glass-card p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-heading text-lg">Latest News for You</h3>
        <Link to="/resources" className="text-xs text-primary font-semibold hover:underline">View All News</Link>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {news && news.length > 0 ? news.map((item, i) => (
          <a key={i} href={item.link || item.url} target="_blank" rel="noopener noreferrer" className="block p-4 border border-subtle rounded-xl hover:border-primary/50 transition-colors flex flex-col gap-3">
            <img src={item.image} alt="" className="w-full h-32 object-cover rounded-lg shrink-0 bg-slate-100" />
            <div>
              <h4 className="text-sm font-bold text-heading line-clamp-2 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{item.excerpt || item.summary}</p>
            </div>
          </a>
        )) : (
          <p className="text-sm text-slate-500 col-span-3">No news available for your region.</p>
        )}
      </div>
    </motion.div>
  );
};

export const AIChatsSection = ({ profileData }) => (
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
);

export const DiagnosesSection = () => (
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
    </div>
  </motion.div>
);

export const ListingsSection = ({ listings }) => {
  const { mutate: acceptBid, isPending } = useAcceptBid();
  const [acceptingId, setAcceptingId] = React.useState(null);

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-xl font-bold text-heading">Manage My Listings</h2>
        <Link to="/marketplace" className="text-sm font-semibold text-primary hover:underline">Marketplace</Link>
      </div>
      {!listings || listings.length === 0 ? (
        <div className="glass-card p-8 text-center text-slate-500">You haven't created any listings yet.</div>
      ) : (
        <div className="space-y-6">
          {listings.map(listing => (
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
                <h4 className="text-sm font-semibold text-slate-600 mb-3">Received Bids ({listing.bids?.length || 0})</h4>
                {!listing.bids || listing.bids.length === 0 ? (
                  <p className="text-xs text-slate-400">No bids received yet.</p>
                ) : (
                  <div className="space-y-3">
                    {listing.bids.sort((a,b) => b.bid_price - a.bid_price).map(bid => (
                      <div key={bid.id} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-subtle">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                            {bid.users?.first_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-heading">{bid.users?.first_name} {bid.users?.last_name}</p>
                            <p className="text-xs text-slate-500">{new Date(bid.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 sm:mt-0">
                          <span className="font-bold text-primary">₹{bid.bid_price}</span>
                          {listing.status === 'OPEN' && (
                            <button
                              onClick={() => handleAccept(bid.id)}
                              disabled={isPending && acceptingId === bid.id}
                              className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1"
                            >
                              {isPending && acceptingId === bid.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
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
  );
};

export const OrdersSection = ({ orders }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-10">
    <h2 className="font-display text-xl font-bold text-heading mb-4">My Marketplace Orders</h2>
    {!orders || orders.length === 0 ? (
      <div className="glass-card p-8 text-center text-slate-500">You haven't placed any orders yet.</div>
    ) : (
      <div className="space-y-4">
        {orders.map(order => (
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
);
