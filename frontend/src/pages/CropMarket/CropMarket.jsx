import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Search, ShoppingCart, MapPin, IndianRupee, Image as ImageIcon, Gavel, User, Loader2, PackageOpen, X, ChevronLeft, ChevronRight
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
  const [selectedImages, setSelectedImages] = useState(null);

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
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                index={i} 
                user={user} 
                biddingListingId={biddingListingId} 
                setBiddingListingId={setBiddingListingId} 
                handleBidSubmit={handleBidSubmit} 
                bidLoading={bidLoading} 
                bidError={bidError} 
                setBidError={setBidError} 
                bidAmount={bidAmount} 
                setBidAmount={setBidAmount} 
                onSeeImages={setSelectedImages}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {selectedImages && (
          <ImageModal images={selectedImages} onClose={() => setSelectedImages(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ImageModal({ images, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors z-[60] p-2 bg-black/50 rounded-full"
      >
        <X className="w-8 h-8" />
      </button>

      <div 
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center z-50"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full flex justify-center items-center h-[70vh]">
          <img 
            src={images[currentIndex].image_url} 
            alt="Crop preview" 
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
          />

          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-8 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-8 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur transition-all"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 mt-6 overflow-x-auto p-2 w-full justify-center">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all shrink-0 ${idx === currentIndex ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={img.image_url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ListingCard({ listing, index, user, biddingListingId, setBiddingListingId, handleBidSubmit, bidLoading, bidError, setBidError, bidAmount, setBidAmount, onSeeImages }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="glass-card overflow-hidden card-hover group flex flex-col"
    >
      {/* Product Image */}
      <div className="h-48 bg-slate-100 relative overflow-hidden group/image">
        {listing.crop_images && listing.crop_images.length > 0 ? (
          <>
            <img 
              src={listing.crop_images[0].image_url} 
              alt={listing.crop_name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105" 
            />
            
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSeeImages(listing.crop_images); }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 hover:bg-black/90 text-white px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur shadow-lg transition-all flex items-center gap-2 z-10"
            >
              <ImageIcon className="w-4 h-4" />
              {listing.crop_images.length > 1 ? `See ${listing.crop_images.length} Images` : 'See Images'}
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageIcon className="w-16 h-16" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-green-600 shadow-sm z-10">
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
  );
}
