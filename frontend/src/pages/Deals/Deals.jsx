import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Phone, User, MapPin, IndianRupee, Loader2, Package } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function Deals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/marketplace/deals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

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
      <div className="container-custom px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
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
              Transaction History
            </h1>
          </motion.div>
          <motion.p variants={fadeUp} className="text-slate-500">
            View your completed deals and contact information.
          </motion.p>
        </motion.div>

        {deals.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-600 mb-2">No deals yet</h3>
            <p className="text-slate-400">When a bid is accepted, it will appear here.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="space-y-6"
          >
            {deals.map((deal, i) => {
              const otherParty = user.user_type === 'farmer' ? deal.buyer : deal.farmer;
              const roleLabel = user.user_type === 'farmer' ? 'Buyer' : 'Farmer';

              return (
                <motion.div key={deal.id} variants={fadeUp} custom={i} className="glass-card p-6 border-l-4 border-l-primary relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Briefcase className="w-32 h-32" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="badge-success">ACCEPTED DEAL</span>
                        <span className="text-sm text-slate-400">{new Date(deal.accepted_at).toLocaleString()}</span>
                      </div>
                      
                      <h3 className="font-display text-2xl font-bold text-heading mb-2">
                        {deal.crop_listings.crop_name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6">
                        <span className="flex items-center gap-1"><Package className="w-4 h-4 text-slate-400" /> {deal.crop_listings.quantity_quintals} Quintals</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> {deal.crop_listings.location}</span>
                        <span className="flex items-center gap-1 font-bold text-primary"><IndianRupee className="w-4 h-4" /> Final Price: ₹{deal.final_price}</span>
                      </div>
                    </div>

                    <div className="md:w-80 bg-surface-muted rounded-xl p-5 border border-subtle h-fit">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{roleLabel} Details</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-heading">{otherParty?.first_name || 'Unknown'} {otherParty?.last_name || 'User'}</p>
                            <p className="text-xs text-slate-500">Verified {roleLabel}</p>
                          </div>
                        </div>
                        
                        {otherParty?.mobile && (
                          <a href={`tel:${otherParty.mobile}`} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-subtle hover:border-primary transition-colors group">
                            <Phone className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{otherParty.mobile}</span>
                          </a>
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
    </div>
  );
}
