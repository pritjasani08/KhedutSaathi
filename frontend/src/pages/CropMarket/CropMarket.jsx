import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Search, ShoppingCart, MapPin, IndianRupee, Image as ImageIcon, Gavel, User, Loader2, PackageOpen
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

export default function CropMarket() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [biddingListingId, setBiddingListingId] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState('');

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/marketplace/listings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBidSubmit = async (e, listing) => {
    e.preventDefault();
    setBidLoading(true);
    setBidError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/marketplace/listings/${listing.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bidPrice: Number(bidAmount) })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Bid successful, refresh listings and close input
      await fetchListings();
      alert(`Bid done successful of ${bidAmount} rs`);
      setBiddingListingId(null);
      setBidAmount('');
    } catch (err) {
      setBidError(err.message);
    } finally {
      setBidLoading(false);
    }
  };

  const filteredListings = listings.filter((p) => 
    p.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen gradient-bg pt-24 pb-16">
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="text-center mb-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/60 text-amber-600 text-sm font-semibold mb-4">
            <ShoppingCart className="w-4 h-4" /> Marketplace Feed
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
            Live Crop Listings
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-slate-500 text-lg max-w-2xl mx-auto">
            Browse and bid on fresh produce directly from farmers.
          </motion.p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-4 mb-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by crop name or location..."
              className="input-field !pl-12"
            />
          </div>
        </motion.div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <PackageOpen className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-slate-400 text-lg">No listings available right now.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden" animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredListings.map((listing, i) => (
              <motion.div
                key={listing.id}
                variants={fadeUp}
                custom={i}
                className="glass-card overflow-hidden card-hover group flex flex-col"
              >
                {/* Product Image */}
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  {listing.crop_images && listing.crop_images.length > 0 ? (
                    <img 
                      src={listing.crop_images[0].image_url} 
                      alt={listing.crop_name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-green-600 shadow-sm">
                    {listing.status}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-xl text-body mb-2">{listing.crop_name}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{listing.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-5 mt-auto">
                    <div className="bg-surface-muted rounded-lg p-3">
                      <p className="text-xs text-slate-500">Quantity</p>
                      <p className="font-semibold text-body text-sm">{listing.quantity_quintals} Quintals</p>
                    </div>
                    <div className="bg-surface-muted rounded-lg p-3">
                      <p className="text-xs text-slate-500">Expected Price</p>
                      <p className="font-semibold text-primary text-sm">₹{listing.expected_price}/Qtl</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-5">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {listing.farmer_name}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </span>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3 mb-4 flex justify-between items-center">
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-500">Highest Bid</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {listing.highest_bid > 0 ? `₹${listing.highest_bid}` : 'No Bids Yet'}
                    </span>
                  </div>

                  {/* Buyer Actions */}
                  {user && user.user_type === 'buyer' && (
                    <div className="mt-auto">
                      {biddingListingId === listing.id ? (
                        <form onSubmit={(e) => handleBidSubmit(e, listing)} className="space-y-2">
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="number"
                              required
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              placeholder={`Min ₹${Math.max(listing.expected_price, listing.highest_bid + 1)}`}
                              className="input-field !pl-9 !py-2 text-sm"
                            />
                          </div>
                          {bidError && <p className="text-red-500 text-xs">{bidError}</p>}
                          <div className="flex gap-2">
                            <button type="submit" disabled={bidLoading} className="btn-primary flex-1 !py-2 text-xs flex items-center justify-center">
                              {bidLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Bid'}
                            </button>
                            <button type="button" onClick={() => setBiddingListingId(null)} className="btn-secondary flex-1 !py-2 text-xs">
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button 
                          onClick={() => {
                            setBiddingListingId(listing.id);
                            setBidError('');
                            setBidAmount('');
                          }} 
                          className="btn-accent w-full flex items-center justify-center gap-2"
                        >
                          <Gavel className="w-4 h-4" />
                          Place Bid
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
